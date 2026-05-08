# Architecture

Snapshot of how the app is wired today. Last reviewed: 2026-05-07.

## Stack

- Next.js 15 App Router, React 19, TypeScript 5.9
- Supabase (Postgres) for persistence
- Helius RPC + Enhanced Transactions API for on-chain reads
- Bags API v2 for claimable fee positions and token feed
- `@solana/react-hooks` + Wallet Standard for wallet connect
- Deployed on Vercel (requires Pro for the 60s function timeout on `/api/wallet`)

## Data flow (one wallet, end-to-end)

1. **Connect** — `Navbar` → `WalletConnectModal`. Wallet Standard discovery, Solana-only filter (rejects sui/eth/metamask/MWA). Mobile uses Phantom/Solflare/Backpack deep-links; in-wallet browsers use injected connectors.
2. **Verify** — `Navbar` auto-triggers `signMessage` on connect. Result cached in `sessionStorage` under `sof_verified_<addr>`. Free, no transaction.
3. **Extract** — `GET /api/wallet?address=…` (60s `maxDuration`). Runs three things in parallel via `Promise.allSettled`:
   - `getTransactionCount` — Helius `getSignaturesForAddress`, paginated 1000/page, max 150 pages, 8s per-call + 50s total budget. Returns `{ count, partial }` — `partial: true` means "lower bound, whale wallet."
   - `fetchBagsWalletData` — Bags `claimable-positions` → `totalFeesSol`.
   - `fetchBagsFeedMints` — known Bags token mints for swap matching.
   Then `getBagsAnalytics` (`lib/bagsWalletAnalyzer.ts`) hits Helius Enhanced API for swap-like txs, classifies as Bags by program ID (`dbcij3…` DBC, `cpamdpZ…` DAMM) **or** known mint match. Caches to `wallet_bags_analytics` (10-min TTL).
4. **Stored** — `GET /api/wallet/stored` is the cheap return-visit path: reads Supabase only, skips Helius pagination.
5. **Refine (start)** — `POST /api/refine` (Solana) or `POST /api/bags-refine` (Bags). Inserts a row into `refines` / `bags_refines` with `claimed=false`, calculated `crude_amount`, `started_at`, `ends_at`. Duration = `clamp(oilUnits/10, 30, 360)` minutes. Single active refine per wallet enforced by Postgres unique constraint (race-protected, code 23505).
6. **Speed up (optional)** — UI sends 0.002 SOL via `useSolTransfer` to `DfUAhLYZ2n8XNv2rPZHtyQde6wf8A99KMiqsbSjqF3b4`, then `POST /api/verify-speedup` re-fetches the tx via `getTransaction` and validates: not failed, sender = wallet, recipient present, exact 2,000,000 lamports, signature not previously used (replay check across both refine tables). Marks `is_completed=true`, `ends_at=now`. Retries up to 5× × 3s for Helius indexing delay.
7. **Claim** — Auto-fires on completion via `useEffect`. `POST /api/refine/claim` validates `ends_at <= now`, marks `claimed=true`, then upserts into `wallets` (the leaderboard table). **This is the only path that writes to `wallets`.** Bags claim is symmetric but reads existing `crude` to recompute `total_crude = solana + bags`.
8. **Leaderboard** — `app/leaderboard/page.tsx` is an SSR server component with `revalidate = 60` (ISR). Queries `wallets` ordered by `total_crude` desc, limit 100, where `total_crude > 0`.

## Database (Supabase)

Three tables. Anon key is used for both reads and writes — see `backend-strategy.md` for the security implication.

### `wallets` (leaderboard source of truth)
| Column | Notes |
|---|---|
| `wallet_address` | PK |
| `crude` | Solana refinery output |
| `bags_crude` | Bags refinery output |
| `total_crude` | `crude + bags_crude`, the leaderboard sort key |
| `oil_units`, `barrels` | Solana stats |
| `bags_oil_units`, `bags_barrels` | Bags stats |
| `prestige_title` | Denormalized title string |
| `last_refined_oil_units`, `last_refined_bags_oil_units` | For "new transactions since last refine" detection |
| `last_updated` | Set on every claim |

### `refines` / `bags_refines` (per-session timer rows)
| Column | Notes |
|---|---|
| `id` | PK |
| `wallet_address` | |
| `oil_units` | Snapshot at refine start |
| `crude_amount` | Locked $CRUDE for this session |
| `bags_crude` (refines) / `fee_crude`, `tx_crude` (bags_refines) | Breakdown |
| `duration_ms` | |
| `started_at`, `ends_at` | |
| `is_completed` | Set when timer elapses (lazily by status route) or by speedup |
| `claimed` | Set true on successful claim |
| `tx_signature` | Speedup tx, used for replay prevention |
| `speedup_used` | True if speedup was used |

Unique partial index on `(wallet_address) WHERE claimed = false` enforces "one active refine per wallet."

### `wallet_bags_analytics` (TTL cache)
Swap analysis cache, 10-min TTL. Holds `unique_tokens_traded`, `total_swap_transactions`, `tokens[]`, `updated_at`.

## Math (`lib/oilCalculator.ts`)

### Solana refinery
- `oilUnits = txCount`
- `barrels = floor(oilUnits / 50)`
- `crude = min(floor(oilUnits / 10), 15000)` — 15k cap per session
- 25-tier prestige titles by **total** CRUDE (Dry Well → Supreme PetroLord)

### Bags refinery
- `feeCrude = floor(totalFeesSol * 2000)` — note: README says `1 SOL = 1000 CRUDE`, code uses **2000**. Code wins, README is stale.
- `txCrude = floor(swapCount / 2)` — 2 swaps = 1 CRUDE
- `bagsCrude = feeCrude + txCrude` — no cap

### Barrel display
- Max 15 visible (5 partial + 10 full) once you exceed 9 barrels
- Mobile cap is 10
- Deterministic seeded LCG (`makeSeededRandom(seed)`) so reload doesn't reshuffle partial fills
- Last visible slot shows `+N more barrels` overflow indicator

## Key files

```
app/
  api/
    wallet/route.ts              GET — full extract (Helius + Bags + analytics)
    wallet/stored/route.ts       GET — cheap return visit (Supabase only)
    refine/route.ts              POST — start Solana refine
    refine/claim/route.ts        POST — claim, write to wallets
    refine-status/route.ts       GET — poll active refine
    bags-refine/route.ts         POST — start Bags refine
    bags-refine/claim/route.ts   POST — claim Bags refine
    bags-refine-status/route.ts  GET — poll active Bags refine
    verify-speedup/route.ts      POST — verify 0.002 SOL payment, mark complete
    leaderboard/route.ts         GET — top 100 wallets
    bags/feed/route.ts           GET — recent Bags launches
    rpc/route.ts                 POST — Helius RPC proxy for the browser (server-side API key)

  refinery/page.tsx              Main dashboard (extract + refine + claim flow)
  leaderboard/page.tsx           SSR ISR (60s revalidate)
  profile/page.tsx               Redirects to /wallet/<connected-addr>
  wallet/[address]/page.tsx      Public profile (SSR)

components/
  Navbar.tsx                     Top nav + auto-verify on connect
  WalletConnectModal.tsx         4-environment wallet picker
  BarrelHeroSection.tsx          Collapsible header + grid
  BarrelGrid.tsx                 Responsive grid + overflow
  Barrel.tsx                     Memoized single barrel + gauge
  OilStats.tsx                   Solana refine UI (timer, claim, speedup)
  BagsOilStats.tsx               Bags refine UI — near-clone of OilStats
  BagsPanel.tsx                  Bags activity status + lazy-loaded feed
  LeaderboardTable.tsx           Top 100 with prestige badges, gold/silver/bronze
  WalletSearch.tsx               Address lookup form
  Footer.tsx                     Footer + mobile-only variant

lib/
  helius.ts                      Paginated tx counting + swap fetching + DAS metadata
  oilCalculator.ts               Oil math, prestige titles, seeded fills
  bags.ts                        Bags API client
  bagsWalletAnalyzer.ts          Bags swap classifier + cache layer
  bagsAnalyticsCache.ts          Supabase-backed swap analytics cache
  supabase.ts                    Supabase client (service role, server-only)
```

## Known issues / drift

Tracked here so they don't get lost. Move to issues / fix as appropriate.

- **README ↔ code drift on Bags fee rate.** README says `1 SOL = 1,000 $CRUDE`; code uses `× 2000` in both `oilCalculator.ts` and `/api/bags-refine/route.ts`.
- **Anon-key writes / no server-side verification.** `/api/refine` trusts client-supplied `oilUnits` and `bagsCrude` — anyone can POST arbitrary numbers and mint themselves into the leaderboard. The Supabase anon key is also used for writes. Either Supabase RLS must lock down `wallets`/`refines` so writes can only originate from a verified path, or the API routes must re-verify oilUnits server-side from Helius before insert. See `backend-strategy.md` for the indexed-DB approach that solves this properly. Tracked in `docs/solana-audit.md` as C2 + H2.
- **Invalid HTML in `OilStats.tsx`** (~line 466–481): `<p>` containing `<h2>`, `<h1>`, nested `<p>`. Will hydration-warn.
- **Two near-duplicate refine flows** — `OilStats` + `BagsOilStats`, and `/api/refine*` + `/api/bags-refine*`. Worth a single shared `useRefineSession(kind)` hook + a generic refine route once a third refinery (Pump.fun, Bonk.fun, Candle) gets built.
- **Auto-verify in `Navbar.tsx:31`** prompts a sign on every page on first connect, even if the user only wanted to look at the leaderboard. Consider deferring verify until the user actually needs it (refine action).
- **Unused imports in `app/refinery/page.tsx`** — `SiSolana`, `wallet`, `disconnect`.
