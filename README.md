<p align="center">
  <img src="public/logo.png" alt="Solana Oil Factory" width="80" />
</p>

<h1 align="center">Solana Oil Factory</h1>

<p align="center">
  A permissionless token-distribution platform on Solana.<br />
  Operators launch refineries · holders claim pro-rata · everyone builds reputation.
</p>

<p align="center">
  <a href="https://solanaoilfactory.xyz">Live App</a> &middot;
  <a href="#what-it-is">What It Is</a> &middot;
  <a href="#the-three-refinery-surfaces">Refinery Surfaces</a> &middot;
  <a href="#on-chain-program">Program</a> &middot;
  <a href="#tech-stack">Tech Stack</a> &middot;
  <a href="#local-development">Run Locally</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/Anchor-0.32-512BD4?style=flat-square" />
  <img src="https://img.shields.io/badge/Solana-Devnet-9945FF?style=flat-square&logo=solana" />
</p>

---

## What It Is

Sol Oil Factory is **token-distribution infrastructure** for Solana. Any operator can launch a "refinery" — a reward pool that pays out an SPL token to verified on-chain holders based on Merkle-tree snapshots of their balances.

The differentiator is **cross-refinery reputation**. Every claim, every launch, every snapshot signs the same on-chain identity. Over time, the platform's two scarcest assets — real holders and trustworthy operators — find each other.

- ❌ NOT a token launchpad. We don't mint tokens; we distribute existing ones.
- ❌ NOT a DEX. We don't facilitate trading.
- ❌ NOT custodial. Operator deposits sit in a program-owned PDA escrow.
- ❌ NOT a yield farm. Rewards are pre-deposited, not generated.

If a feature doesn't map to *"distribute tokens to verified holders + build cross-refinery reputation,"* it's out of scope.

---

## The Refinery Surface

| Surface | What it is | Status |
|---|---|---|
| **Token refineries** | Operator launches a refinery for any Solana token. Holders claim pro-rata against on-chain snapshots. | ✅ Live on devnet |
| **Per-launchpad views** | `/refineries` filtered by source launchpad (Bags, Pump, Bonk, Candle). Aggregates refineries for tokens that graduated from each. | 🔜 Indexer work |

---

## On-Chain Program

**Devnet Program ID:** `2tPLLPQeLLNL4UDBbeagSUAABJcB3fHGTJaLGEzrx3rE`
**Repo:** [`vip-ultr/sol-oilfactory-program`](https://github.com/vip-ultr/sol-oilfactory-program) (private during devnet)
**Framework:** Anchor 0.32

### Instructions

| Instruction | Caller | Effect |
|---|---|---|
| `init_treasury` | Program upgrade authority (one-shot) | Sets admin / snapshot authority / pause authority + fee schedule |
| `init_refinery` | Operator | Deposits pool tokens to escrow PDA + pays 0.1 SOL launch fee + 1% deposit fee |
| `deposit` | Operator | Tops up an existing refinery's pool |
| `submit_snapshot` | Snapshot authority | Publishes a Merkle root + holder count for the next snapshot index |
| `claim` | Holder | Verifies Merkle proof + transfers pro-rata share + creates ClaimReceipt for replay protection |
| `withdraw` | Operator | Pulls from the pool (lock-gated: window must be closed + 7-day cooldown) |
| `close_refinery` | Operator | Terminal — refunds remaining pool to operator |
| `toggle_operator_pause` | Operator | Per-refinery pause |
| `toggle_platform_pause` | Pause authority | Global emergency pause |
| `update_rate` | Operator | Advances refinery to a new epoch with new params |
| `rotate_authority` | Admin | Rotates snapshot / pause / admin keys |

### Snapshot + Claim Mechanics

1. Operator deposits tokens. Pool sits in `escrow_authority` PDA-owned ATA.
2. Snapshot authority runs `getProgramAccounts` for the mint, builds a Merkle tree over `(holder, balance)` leaves, submits the root on-chain.
3. Holder pulls the leaf list (cached client-side post-snapshot), regenerates the Merkle proof for their own pubkey, and submits `claim`.
4. Program verifies: proof root matches the snapshot, balance leaf hashes correctly, no prior `ClaimReceipt` PDA exists for `(refinery, holder, snapshot_index)`, and the pool can cover the pro-rata share capped at `per_claim_cap_bps`.
5. Tokens transfer escrow → holder ATA, claim receipt is created, holder pays 0.001 SOL claim fee.

### Merkle Leaf Format (locked at Q-2)

```
leaf = sha256(0x00 || pubkey_32 || balance_le_u64)
node = sha256(0x01 || min(left, right) || max(left, right))
```

---

## Product Surfaces

| Route | Purpose |
|---|---|
| `/` | Marketing landing + featured refineries |
| `/refineries` | Directory: filter by status / verification / reputation, sort, **export CSV** |
| `/refinery/[id]` | Detail page: pool, snapshot history, top claimants, **claim panel**, operator actions |
| `/refinery/launch` | Multi-step launch wizard |
| `/dashboard` | Connected-wallet snapshot — my refineries, activity, claims, reputation |
| `/wallet/[address]` | Public profile — claim history, refineries operated, reputation breakdown |
| `/reputation` | v1 reputation explainer (6 signals, capped at 100) |
| `/trust` | On-chain program list + audit status |
| `/admin` | Treasury authority rotation (gated to `treasury_config.admin`) |
| `/developers` | Preview SDK / API portal (ships with v1.1) |

---

## Wallet & Auth Flow

1. **Connect** — wallet-standard discovery (Phantom / Solflare / Backpack auto-detect).
2. **Sign-In With Solana (SIWS)** — free signature challenge proves wallet ownership. Payload + JWT-style claim live in localStorage for 7 days.
3. **Sign transactions** — when a write is needed, the adapter routes the prompt to the exact wallet the user picked (matched by `connector.name`, not just pubkey, so multi-extension users don't get the wrong popup).

No funds move at connect. All transactions are explicitly approved per-action.

---

## Reputation v1

Six on-chain signals, each capped, summing to a 0–100 score:

| Signal | What it measures |
|---|---|
| **C — claims** | Total successful claims |
| **O — operator** | Refineries launched + fully distributed |
| **P — participation** | Distinct refineries claimed from |
| **R — recency** | Time-weighted claim activity |
| **A — age** | Wallet tenure on Solana |
| **D — diversity** | Distinct tokens across the claim history |

Logic lives in `lib/indexer/reputation.ts`. Recomputed nightly by the indexer cron + on-demand via `/api/reputation`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 App Router · React 19 · TypeScript 5.9 |
| Styling | Tailwind CSS 4 + custom CSS variables |
| Solana RPC | Helius (proxied via `/api/rpc` to hide the key) |
| Wallet | `@solana/web3.js` + `@solana/react-hooks` + `@wallet-standard/app` |
| Anchor | `@coral-xyz/anchor` 0.32 |
| Token metadata | Metaplex Token Metadata Program (logos auto-resolved) |
| Database | Supabase (PostgreSQL) — auxiliary data / Bags-stream balances |
| Indexer | GitHub Actions cron → `lib/indexer/*.json` snapshots committed to repo |
| External APIs | Helius (transactions), Bags API v2 (fee positions) |
| Deployment | Vercel |

---

## Project Structure

```
app/
  page.tsx                    Home — hero, featured refineries, how it works
  layout.tsx                  Root layout + sidebar + chrome
  refineries/                 Token-refinery directory (filters, CSV export)
  refinery/[id]/              Refinery detail (claim, operator actions, snapshots)
  refinery/launch/            Multi-step launch wizard
  dashboard/                  Connected-wallet live data
  wallet/[address]/           Public wallet profile (SSR)
  reputation/                 Reputation v1 explainer
  trust/                      On-chain program transparency + audit
  admin/                      Authority rotation (gated to treasury_config.admin)
  developers/                 Preview SDK portal (v1.1)
  help/, legal/, profile/
  api/
    refineries/route.ts       GET — live program accounts
    indexer/events/route.ts   GET — filtered indexer event feed
    reputation/route.ts       GET — recompute / fetch per-wallet score
    treasury/route.ts         GET — live treasury_config
    rpc/route.ts              POST — Helius RPC proxy (origin-allowlisted)
    wallet/                   Supabase-backed wallet reads (auxiliary)

components/sof/
  primitives/                 Buttons, badges, status pills, TokenMark (Metaplex logo)
  refinery-detail/            ClaimAction, OperatorActions, RefineryHeaderActions
  refinery-launch/            LaunchWizard
  refineries/                 RefineryDirectory (filters, sort, CSV)
  dashboard/                  DashboardClient (live SIWS-gated)
  admin/                      AdminClient (authority rotation form)
  wallet/                     WalletTabs, ClaimHeatmap, profile sections
  modals/                     ConnectModal, CommandPalette, ChromeOverlay
  Sidebar.tsx, Navbar.tsx     Chrome

lib/
  program.ts                  Program ID, RPC URL, cluster inference, explorer helpers
  onchain/
    client.ts                 Read-only Anchor program (server)
    writeClient.ts            Wallet-bound Anchor program + sendTx
    refineries.ts             fetchAllRefineries / fetchRefinery
    snapshots.ts              fetchSnapshots
    metadata.ts               Metaplex JSON URI → logo image
    metaplex.ts               Metaplex PDA decoder
    treasury.ts               fetchTreasuryConfig
    merkle.ts                 buildMerkleTree + proof helpers (SHA-256, domain-prefixed)
    snapshotCache.ts          localStorage cache of snapshot entries for claim proofs
  indexer/
    store.ts, aggregations.ts Indexer JSON read-side helpers
    reputation.ts             Reputation v1 (6 signals)
    ui.ts                     buildActivityFeed
  share.ts                    Web Share API → clipboard fallback
  watchlist.ts                Namespaced (refinery / wallet) localStorage watchlist
  siws.ts                     Sign-In-With-Solana payload + verification
  helius.ts                   Paginated tx counting (legacy $CRUDE flow)
  oilCalculator.ts            Oil units / barrels / prestige titles (legacy)
  bags.ts                     Bags API integration
  supabase.ts                 Supabase client
```

---

## Local Development

**Prerequisites:** Node.js 20+, [Helius API key](https://helius.dev), optional [Supabase project](https://supabase.com) for auxiliary wallet reads.

```bash
git clone https://github.com/vip-ultr/solana-oil-factory.git
cd solana-oil-factory
pnpm install     # or npm / yarn
```

Create `.env.local`:

```env
# === Solana ===
# Defaults to the deployed devnet program. Override to point at a fresh deploy.
NEXT_PUBLIC_REFINERY_PROGRAM_ID=2tPLLPQeLLNL4UDBbeagSUAABJcB3fHGTJaLGEzrx3rE

# Browser RPC. Defaults to /api/rpc (server-proxied with HELIUS_API_KEY).
# Override only when running against a custom cluster.
# NEXT_PUBLIC_SOLANA_RPC_URL=/api/rpc

# Server-only — required for the /api/rpc proxy and for indexer reads.
HELIUS_API_KEY=your-helius-key

# Optional. Comma-separated origins allowed to hit /api/rpc in production.
# Same-origin is always allowed. Useful for staging / preview deployments.
# RPC_ALLOWED_ORIGINS=https://staging.solanaoilfactory.xyz,https://preview-xyz.vercel.app

# === Supabase (optional — auxiliary wallet reads) ===
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Testing the on-chain flow on devnet

1. Connect any wallet via `/` → sidebar Connect button.
2. Sign the SIWS challenge.
3. Visit `/refinery/launch` and walk through the wizard — pay 0.1 SOL launch fee + 1% deposit fee on devnet.
4. As the operator, click `Submit snapshot #1` on the refinery detail page. If your wallet isn't the configured `snapshot_authority`, the program rejects with `Unauthorized (6000)` — rotate via `/admin` or `scripts/rotate-snapshot-authority.cts` in the program repo.
5. Once the snapshot lands, the claim panel shows real eligibility for any wallet that held tokens at snapshot time.

---

## Deployment

1. Push to GitHub.
2. Import into [Vercel](https://vercel.com).
3. Add all env vars in the Vercel dashboard.
4. Deploy.

> **Note:** Some Helius reads in `/api/wallet` benefit from extended function timeouts. Configure via `vercel.json` or Vercel Pro.

---

## Powered By

[Helius](https://helius.dev) · [Supabase](https://supabase.com) · [Bags](https://bags.fm) · [Anchor](https://anchor-lang.com) · [Metaplex](https://www.metaplex.com) · [Vercel](https://vercel.com)

---

MIT License
