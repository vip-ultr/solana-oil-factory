# Solana integration audit

Correctness + security review of the Solana-specific code in sol-oilfactory. Reviewed: 2026-05-08.

Audited files:
- `app/providers.tsx` — Solana client configuration
- `components/Navbar.tsx` — auto-verify signMessage flow
- `components/WalletConnectModal.tsx` — Wallet Standard discovery
- `app/refinery/page.tsx` — speed-up payment trigger (Solana + Bags variants)
- `components/OilStats.tsx` / `BagsOilStats.tsx` — speed-up flow integration
- `app/api/verify-speedup/route.ts` — on-chain payment verification
- `app/api/refine/route.ts` — refine session creation
- `lib/helius.ts` — Helius RPC pagination

Stack assessment up front: the project uses the correct framework-kit stack — `@solana/client`, `@solana/react-hooks`, `useWalletConnection`, `useWalletSession`, `useSolTransfer`, Wallet Standard discovery. This matches the recommended approach per the solana-dev skill and current Solana ecosystem direction. The findings below are about correctness and hardening, not stack choice.

## Severity legend

- 🔴 **Critical** — exploitable now, exposes funds, leaks secrets, or breaks the leaderboard's integrity.
- 🟠 **High** — concrete attack vector or correctness gap.
- 🟡 **Medium** — design weakness, drift risk, or UX hostility.
- 🟢 **Low** — polish.

---

## 🔴 Critical

### C1. Helius API key exposed to the browser
**File**: `app/providers.tsx:9-12`, `app/providers.tsx:14-16`

```ts
const endpoint =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ??
  (process.env.NEXT_PUBLIC_HELIUS_API_KEY
    ? `https://mainnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`
    : "https://api.mainnet-beta.solana.com");
```

The `NEXT_PUBLIC_SOLANA_RPC_URL` env var contains the Helius API key (per the README). `NEXT_PUBLIC_*` env vars are **bundled into the client JS** and shipped to every visitor.

Helius's own docs are explicit: *"Your API key is sensitive information that grants access to your Helius account. Never expose it in client-side code, public repositories, or browser-accessible areas."*

Anyone visiting solanaoilfactory.xyz can extract the key from the bundle in seconds and use it for their own RPC traffic, billed to this project. At scale, this is a four-figure monthly bill drain.

**Fix options (best → worst):**
1. **Backend RPC proxy.** Add an `/api/rpc` Next.js route that forwards to Helius using a server-side `HELIUS_API_KEY` (no `NEXT_PUBLIC_`). Point `endpoint` at `/api/rpc`. The frontend never sees the key.
2. **Helius Access Control Rules + secure RPC URL.** Helius dashboard supports allow-listing domains and using a "secure RPC URL" that's domain-scoped. Reduces but doesn't eliminate exposure (a clone of the site can still hit the URL until ACR catches up).
3. **Public Solana mainnet RPC for read-only client work.** Free but rate-limited; will fail at any meaningful traffic.

Recommended: option 1 for any RPC the browser actually needs (probably none for this app — most reads are server-side already). Most of the wallet flow is signature-only and doesn't need an authed RPC.

---

### C2. `/api/refine` trusts client-supplied `oilUnits`
**File**: `app/api/refine/route.ts:21-69`

```ts
const { address, oilUnits, bagsCrude } = body;
// ...
const rawCrude = Math.floor(oilUnits / 10);
const cappedCrude = Math.min(rawCrude, CRUDE_CAP);
// ...
const { error } = await supabase.from("refines").insert({ ... oil_units: oilUnits, crude_amount: cappedCrude, ... });
```

The route accepts `oilUnits` and `bagsCrude` from the request body, computes derived values from them, and inserts. **There is no server-side verification that the wallet actually has that many transactions.** A user can `POST /api/refine` with `{"address": "<their-wallet>", "oilUnits": 999999999}` and mint themselves to the top of the leaderboard.

Already noted in `architecture.md`. Re-flagging because this is the highest-impact integrity bug.

**Fix**: server-side, re-fetch the wallet's tx count (or read it from a server-controlled cache populated by `/api/wallet`) and use that, not the client's value. Drop `oilUnits`/`bagsCrude` from the request body entirely — the server should compute them.

---

### C3. `verify-speedup` doesn't handle v0 transactions with Address Lookup Tables
**File**: `app/api/verify-speedup/route.ts:113-179`

The route fetches the tx with:
```ts
{ encoding: "json", maxSupportedTransactionVersion: 0, commitment: "confirmed" }
```

Then checks the recipient against `txData.transaction.message.accountKeys`. Per the official Solana exchange-integration docs:

> If the `json` encoding is used instead, entries in `preBalances/postBalances` and `preTokenBalances/postTokenBalances` may refer to account keys that are NOT in the `accountKeys` list and need to be resolved using `loadedAddresses` entries in the transaction metadata.

**The current code only inspects static keys.** For a v0 tx that uses ALTs, the recipient could be in `meta.loadedAddresses.writable` and would not be found by `rawKeys.findIndex(...)`. The verification would reject a legitimately valid payment.

More dangerous: the index space for `preBalances`/`postBalances` is `[static_keys, loaded_writable, loaded_readonly]`. Even if the index check happens to find a value, the `received` calculation would be reading the wrong account's balance change.

In practice, Phantom/Solflare/Backpack don't use ALTs for simple SOL transfers — they emit legacy or v0-without-ALT txs. So this is theoretically exploitable but unlikely to bite real users today. It will bite once any wallet starts using ALTs by default for fee optimization, and it's exploitable in principle by anyone using a custom signing client.

**Fix**: switch to `encoding: "jsonParsed"` per official Solana recommendation. The parser merges `loadedAddresses` into `accountKeys` automatically. Code structure stays mostly the same.

```ts
{ encoding: "jsonParsed", maxSupportedTransactionVersion: 0, commitment: "confirmed" }
```

Then read `txData.transaction.message.accountKeys` (which will now be `{pubkey, signer, writable, source}[]`) and the existing extraction logic adapts.

---

## 🟠 High

### H1. No DB-level unique constraint on `tx_signature`
**File**: `app/api/verify-speedup/route.ts:67-88`

```ts
const { data: existingTx1 } = await supabase
  .from("refines")
  .select("id")
  .eq("tx_signature", signature)
  .limit(1)
  .single();
// ... another check on bags_refines ...
const existingTx = existingTx1 || existingTx2;
if (existingTx) return NextResponse.json({ error: "..." }, { status: 400 });
// ... later: update with tx_signature
```

This is a SELECT-then-UPDATE replay check. Two concurrent requests with the same signature can both pass the SELECT before either UPDATE lands, both then mark different refines as completed. The user gets two free speedups for one payment.

**Fix**: add a unique index on `refines.tx_signature` and `bags_refines.tx_signature` (with `WHERE tx_signature IS NOT NULL`). On the UPDATE, catch `23505` (unique violation) and return the replay error from there. The DB enforces atomicity; the SELECT becomes a fast-path optimization, not a correctness primitive.

---

### H2. Anon Supabase key used for API-route writes
**File**: `lib/supabase.ts:1-6`, used in every `/api/*/route.ts`

```ts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

Same `supabase` client is used everywhere — both API routes (server-side) and any browser-side code that imports it. Combined with no visible RLS, this means:
1. The anon key is exposed in the bundle (it's `NEXT_PUBLIC_*`).
2. Any visitor can use the anon key to write directly to Supabase, bypassing every API route.
3. They could `INSERT` directly into `wallets` with arbitrary `total_crude` and land themselves on the leaderboard.

**Fix**: two-client setup. `lib/supabase-server.ts` uses `SUPABASE_SERVICE_ROLE_KEY` (server-only env) for all API routes. `lib/supabase-browser.ts` keeps the anon key for any client reads. Then enable RLS on `wallets`, `refines`, `bags_refines`, `wallet_bags_analytics` so the anon key can read but not write.

---

### H3. Speed-up duration logic miscalculates on `bags-refine`
**File**: `app/api/bags-refine/route.ts:50-52`

```ts
const durationMinutes = Math.max(30, Math.min(crudeAmount, 360));
```

Compare with `/api/refine/route.ts:54`:
```ts
const durationMinutes = Math.max(30, Math.min(oilUnits / 10, 360));
```

Solana refine: 10 oil units = 1 minute. Bags refine: 1 CRUDE = 1 minute. These are different units. A Bags refiner with 5,000 fee-CRUDE gets capped at 360 minutes (6h). A Solana refiner with 5,000 oil units = 500 CRUDE → also capped at 360 minutes. **Inconsistent semantics**: the duration depends on a different metric per refinery type.

Probably intentional but reads like a bug. Document it explicitly in code, or unify to use the same input (oil units, in both cases, since CRUDE on Bags includes a fee component that has no time correlate).

---

## 🟡 Medium

### M1. SPEEDUP_RECIPIENT hardcoded in three places
**Files**: `app/api/verify-speedup/route.ts:6`, `app/refinery/page.tsx:233`, `app/refinery/page.tsx:295`

```ts
const SPEEDUP_RECIPIENT = "DfUAhLYZ2n8XNv2rPZHtyQde6wf8A99KMiqsbSjqF3b4";
```

If this address ever needs to rotate (compromise, treasury restructure, etc.), three files must change. **Move to a single shared constant** — `lib/constants.ts` exporting `SPEEDUP_RECIPIENT` and `SPEEDUP_LAMPORTS`. Backend reads via `process.env.SPEEDUP_RECIPIENT` with the constant as fallback.

### M2. `commitment: "confirmed"` for payment verification
**File**: `app/api/verify-speedup/route.ts:118`

`confirmed` can be re-orged. For 0.002 SOL ($0.30) per speedup, the economic impact is negligible. For correctness purity (and as a model for the future on-chain refinery program where amounts will be larger), `finalized` is the standard for payment confirmation.

Trade-off: `finalized` adds ~13 seconds of confirmation delay. The route already retries 5×3s for indexing; adopting `finalized` may push into the >15s territory. Acceptable for the current flow, less so for the Phase 2 multi-tenant launches.

### M3. Auto-verify `signMessage` on every wallet connect
**File**: `components/Navbar.tsx:31-56`

```ts
useEffect(() => {
  if (connected && solanaAddress && session?.signMessage && autoVerifyAttemptedRef.current !== solanaAddress) {
    // ... session.signMessage(...) prompts the user to sign immediately
  }
}, [connected, solanaAddress, session?.signMessage]);
```

User lands on `/leaderboard` to look at top wallets, connects (because the connect button is in the navbar), gets a sign-message prompt before they've done anything. Many users reject. The verification is only needed for refine actions — defer until then.

**Fix**: remove the auto-verify from Navbar. Move the prompt to `OilStats.handleRefine` — when the user clicks "Refine Oil," then prompt to sign. `sof_verified_<addr>` cache logic stays the same; just don't trigger it preemptively.

### M4. NON_SOLANA wallet filter is brittle
**File**: `components/WalletConnectModal.tsx:9-18`

```ts
const NON_SOLANA = ["sui", "ethereum", "metamask", "rabby", "aptos"];
```

A new EVM wallet (e.g. "Coinbase Wallet" — appears as `Coinbase Wallet` not matching any string in the list) won't be filtered. Conversely, `isSolanaWallet` already does the right thing by checking `wallet.chains`. The hardcoded NON_SOLANA list is redundant and creates false confidence.

**Fix**: delete `NON_SOLANA` and `isSolanaConnector`. Rely on `isSolanaWallet`'s chain check. The MWA filter for desktop can stay (different concern).

### M5. No transaction simulation surfaced to user
**File**: `app/refinery/page.tsx:231-235, 293-297`

```ts
const sig = await solTransfer.send({
  amount: BigInt(2_000_000),
  destination: "DfUAhLYZ2n8XNv2rPZHtyQde6wf8A99KMiqsbSjqF3b4",
  authority: session,
});
```

The Kit RPC's `sendTransaction` runs preflight by default, which is server-side simulation. So failures *are* caught — but the user sees them as a generic transaction error after the wallet popup. Per the solana-dev skill ("Simulate before sending. Always run simulateTransaction and surface the result to the user before requesting a signature"), best practice is to call `simulateTransaction` explicitly, show the result (recipient, amount, fee impact) in a confirmation step, *then* request signature.

For a 0.002 SOL fixed payment, the upside is small. Worth adopting the pattern when we build the multi-tenant refinery launch flow, where amounts will be larger and operators will deposit real value.

### M6. Helius pagination inside `/api/wallet` blocks until 50s before falling back
**File**: `lib/helius.ts:7-9`

```ts
const MAX_PAGES = 150;               // 150,000 transactions max
const REQUEST_TIMEOUT_MS = 8_000;    // 8s per RPC call
const TOTAL_BUDGET_MS = 50_000;      // 50s total time budget
```

Already covered in `architecture.md` and `backend-strategy.md`. Re-flagging because it ties to the Helius cost issue (C1) and the worker-service motivation. Migrating to webhook-driven indexing makes this whole module obsolete.

---

## 🟢 Low

### L1. Hardcoded external favicon URLs in WalletConnectModal
**File**: `components/WalletConnectModal.tsx:51-66`

```ts
icon: "https://solflare.com/favicon.ico"
icon: "https://backpack.app/favicon.ico"
```

Network dependency on a critical user flow. Pull local copies (already noted in image audit).

### L2. Unused imports / vars in refinery page
**File**: `app/refinery/page.tsx:12, 44-46`

`SiSolana` imported but unused. `disconnect`, `wallet` destructured but unused.

### L3. Lazy `is_completed` write race
**File**: `app/api/refine-status/route.ts:38-42`

Two concurrent status polls can both set `is_completed: true`. Idempotent so harmless, but inelegant. Either move to the speedup/timer-claim atomically or accept it.

### L4. SPEEDUP_LAMPORTS exact-match check
**File**: `app/api/verify-speedup/route.ts:177-186`

`if (received !== SPEEDUP_LAMPORTS)`. If a user accidentally over-pays (sends 0.003 SOL), the verification fails and they pay 0.003 SOL with no benefit. Consider `received >= SPEEDUP_LAMPORTS` (be generous on the upside, strict on the downside) and credit the user. Or surface a clear "exact amount required" message in the UI.

---

## Recommended order of operations

1. **C1 (Helius API key)** — fastest win. Backend proxy is ~30 lines. Stops the bleed.
2. **H2 (anon-key writes + RLS)** — pre-requisite for C2 fix. Lock down Supabase first.
3. **C2 (server-side oilUnits)** — fixes the leaderboard integrity bug.
4. **H1 (unique constraint on tx_signature)** — DB migration; small.
5. **C3 (jsonParsed encoding)** — small code change in verify-speedup.
6. **M3 (defer auto-verify)** — UX win, removes the friction users hit on first visit.
7. The rest as polish.

Items 1–5 are the audit gating list before the multi-tenant pivot. Items 6+ are quality-of-life improvements that can ship anytime.

## Sources

- [Solana exchange-integration guide (versioned tx + jsonParsed)](https://solana.com/developers/guides/advanced/exchange)
- [Helius API authentication (never expose client-side)](https://www.helius.dev/docs/api-reference/authentication)
- [Solana Kit transaction confirmation](https://github.com/anza-xyz/kit)
