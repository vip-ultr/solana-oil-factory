# Token refinery — detailed design

Implementation spec for the third refinery type: any Solana token can have a refinery launched, where holders earn that token by virtue of holding it. Last reviewed: **2026-05-09**.

> Strategic / market case lives in `multi-tenant-pivot.md`. Solana audit + status lives in `solana-audit.md`. This doc is the engineering spec.

## Status: LOCKED — design confirmed 2026-05-09

All decisions previously marked OPEN have been answered (see "Locked decisions" at the bottom). This is the spec we build to. Future amendments require an updated date and a changelog entry.

---

## Where token refineries fit

Sol Oil Factory is now three refinery categories:

| Type | What it refines | Reward | Operator | Status |
|---|---|---|---|---|
| **Solana Refinery** | All Solana wallet activity (any tx) | $CRUDE (in-app score) | None — chain-wide | Live |
| **Launchpad Refineries** | Activity on a specific launchpad (Pump / Bonk / Bags) | $CRUDE (in-app score) | None — platform-wide | Coming soon |
| **Token Refineries** *(NEW)* | Holding / activity for a specific SPL token | The token itself | Anyone (permissionless launch) | This doc |

Token refineries are the first category where:
1. The reward is a **real on-chain token**, not a synthetic score.
2. **Anyone can launch one** for any token, paying a SOL fee.
3. **Holders connect wallets and claim** — the operator never sees their list.
4. **Distribution is on-chain via our own Anchor program** — non-custodial via PDA escrow.

Solana and Launchpad refineries continue to mint $CRUDE as the activity score. Token refineries distribute the actual token. Cross-refinery wallet reputation accrues across all three (full v1 scope, see Cross-refinery reputation section).

---

## Glossary

Pin these names. They appear in code, copy, and DB columns.

- **Refinery** — a distribution program for one specific token, launched by one operator.
- **Operator** — the wallet that launched a refinery. Pays the launch fee, deposits the reward pool, sets the rate.
- **Holder** — a wallet that owns the underlying token. Eligible to claim from the refinery.
- **Reward pool** — the operator's deposit, held in a program-owned PDA, distributed to holders over time.
- **Claim rate** — the operator-set ratio that defines how much each holder is owed (see Distribution Math).
- **Snapshot** — a point-in-time record of token holders + balances used to compute claims.
- **Epoch** — a refinery period during which the rate, snapshot, and pool are fixed.
- **Refinery directory** — the public list of active refineries (discovery surface).
- **Verified deployer badge** — operator's wallet equals the token's mint authority (or signed from it).
- **Verified CTO badge** — operator is a manually-verified community takeover team for tokens whose deployer abandoned the project.
- **Reputation score** — cross-refinery trust metric for a wallet, computed from participation history.

---

## Lifecycle of a refinery (state machine)

```
[draft]  ← operator filling out the form
   │
   │ pay launch fee + deposit tokens (signed in one Anchor instruction)
   ▼
[pending]  ← deposit detected on-chain, refinery configured but not yet live
   │
   │ go live (manual or automatic after deposit confirms)
   ▼
[active]   ← snapshot taken, holders can claim
   │   │
   │   ├─ claims happen → pool drains (program enforces caps + reserve)
   │   │
   │   ├─ operator tops up → pool grows
   │   │
   │   ├─ operator pauses → claims temporarily blocked (operator-pause, not platform-pause)
   │   │
   │   └─ operator updates rate → new epoch begins (new snapshot mandatory)
   │
   │ pool empty OR claim window expires OR operator closes
   ▼
[closed]   ← terminal. unclaimed tokens returnable to operator. archived 6 months.
```

**Closed = terminal.** A refinery cannot be reopened. To re-distribute the same token, the operator launches a new refinery (paying the launch fee again). This is intentional — cleaner data model, and the launch fee is the cost of restarting.

**Archive policy:** closed refineries are searchable for 6 months from the close date. After 6 months, per-claim receipt rows are hard-deleted; a one-row summary lives forever in `refineries_archive` (id, mint, operator, total_claimed, holder_count, closed_at).

---

## Launch flow (operator UX)

### Step 1: "Launch Refinery" → multi-step form

Progressive disclosure — 4 steps. No 20-field megaform.

### Step 2: Enter token contract address

User pastes a Solana mint address. Within ~1s the form fetches:

| Field | Source | Required? |
|---|---|---|
| Token name | Helius DAS `getAsset` | required |
| Token symbol | Helius DAS | required |
| Token icon | Helius DAS | required |
| Decimals | Helius DAS | required |
| Total supply | Helius DAS | required |
| Current price (USD) | Helius DAS `token_info.price_info` | nice-to-have |
| Holder count | Helius DAS or RPC | nice-to-have |
| Safety report | RugCheck `/v1/tokens/<mint>/report/summary` | required for filter gate |
| Authority status | DAS `authorities` + `mint_extensions` | required for badges |

**Token filter at launch — auto-block (refinery cannot be created if any of these hit):**
- Token on a known scam list (Solscan / Jupiter blocklist)
- RugCheck severity = `danger` or `warning`
- Transfer fee > 5%
- Freeze authority active **without** explicit operator disclosure (user must check a box acknowledging the risk)

> **Note:** "< 24h old" was considered as an auto-block but **explicitly removed** — fresh tokens should be allowed to launch refineries to support new project momentum.

**Risk badges (allowed but flagged in UI):**
- Mint authority active → ⚠ "Mintable" badge
- < 100 holders → ⚠ "Low liquidity" badge
- Top-1 holder > 50% → ⚠ "Concentrated" badge

**Clean (✓ green badge):**
- Jupiter-verified token list
- RugCheck all-clear
- Mint and freeze authorities renounced

### Step 3: Operator identity verification (badge tier)

We auto-detect:
- **Verified deployer** — if `operator_wallet == token.mint_authority` (or has signed a challenge from that key). Green "Deployer" badge displayed.
- **Verified CTO** — manual review process. Operator submits proof (X/Discord links, project takeover post). We mark `verified_cto: true` after review. Lower-priority queue, multi-day SLA.
- **Unverified** — default. No badge. Refinery still launches.

### Step 4: Configure distribution

| Setting | Default | Operator can change |
|---|---|---|
| Reward pool size | (must be set) | yes |
| Claim rate | "1% holder gets X tokens" framing | yes |
| Snapshot strategy | **At-launch only** (single snapshot at refinery creation) | yes — opt into recurring (hourly/daily/weekly) |
| Snapshot eligibility | Hold at snapshot time | (rule is fixed) |
| Pool-empty behavior | **Pro-rata** scale-down | yes — operator can choose FCFS |
| Per-claim cap | **5%** of remaining pool | yes — 0.1% to 100% |
| Claim window | **30 days** | yes — any duration up to "open-ended" |
| Withdrawal policy | (fixed) Claim-window-locked + 7-day cooldown after window closes | no — protocol-enforced |
| Anti-sybil defaults | wallet age 30d, hold duration 24h, cluster filter | yes — can tighten or loosen |

### Step 5: Confirm + pay

Operator signs **one combined Anchor instruction** that:
1. Pays the **0.1 SOL launch fee** to platform treasury
2. Transfers the **reward pool tokens** to the refinery PDA escrow
3. Pays the **1% deposit fee** in the deposited token, which the program forwards to a treasury-swap PDA — auto-swapped to SOL via Jupiter on the next cron tick (we don't hold operator's token long-term)
4. Initializes the refinery account with all the config above

After tx confirms, refinery enters `pending`, then auto-transitions to `active` once the indexer confirms the deposit landed.

### Step 6: Operator gets a shareable URL

`solanaoilfactory.xyz/refinery/<token-mint>` — the public refinery page.

Multiple refineries per mint are allowed — operators paying 0.1 SOL each is the natural deterrent against spam. The URL uses the token mint as the canonical key, with a `?r=<refinery-id>` query param to disambiguate when there are multiple refineries for the same token. Discovery shows them grouped under the token.

The displayed pretty-form will be `solanaoilfactory.xyz/refinery/<symbol>-<mint-prefix-6>` for shareable readability, but the canonical key is always the mint address.

---

## Data sources

Helius DAS is the workhorse — a single `getAsset` call returns metadata, decimals, supply, price (Jupiter-sourced), Token-2022 extensions, and authority status. We're already on Helius.

### Stack

| Role | Primary | Fallback | Caching |
|---|---|---|---|
| Token metadata (name, symbol, icon, decimals, supply) | Helius DAS `getAsset` | Jupiter Tokens V2 (`/v2/search?query=<mint>`) | 24h in Supabase |
| Price + market cap | Helius DAS `token_info.price_info` | DexScreener `/latest/dex/tokens/<mint>` | 60s in Supabase |
| Verified flag | Jupiter Tokens V2 `tags: ["verified"]` | — | 24h |
| Wallet's fungible holdings | Helius DAS `searchAssets` (paginated) | RPC `getTokenAccountsByOwner` | 60s per wallet |
| Single-mint holder set | RPC `getTokenAccountsByOwner({mint})` via Helius | — | per-snapshot only |
| Safety report | RugCheck `/v1/tokens/<mint>/report/summary` | — | 1h |

### Auto-detection pattern (holder side)

When a wallet connects:

```
1. SELECT token_mint FROM token_refineries WHERE status IN ('active','pending');
2. helius.searchAssets({ ownerAddress, tokenType: "fungible" });
3. Intersect → list of refineries the user can claim from.
```

One DAS call per wallet. Works for wallets holding hundreds of tokens.

### Cost ceiling on free tier

Helius free tier: 100K credits/day. With 80% cache hit rate, that supports ~5K active wallets/day comfortably. Sufficient for devnet stage.

---

## Operator dashboard

URL: `/dashboard` (auth-gated to connected wallet). Distinct from the holder claim view.

### Tabs
1. **My refineries** — refineries this wallet has launched. Click any → manage page.
2. **Claims received** — refineries this wallet has claimed FROM (overlaps with holder dashboard).
3. **Reputation** — cross-refinery score, breakdown, history.

### Per-refinery management page

- Pool balance (real-time)
- Total claimed: count of holders × tokens distributed
- Claim activity chart (last 30 days)
- Top claimants (wallet prefixes only)
- **Top up pool** — deposit more tokens (re-pays 1% fee)
- **Withdraw** — gated by claim-window lock; UI shows "Available in N days"
- **Update rate / snapshot** — creates a new epoch, mandatory new snapshot
- **Pause / resume** — operator-level pause (separate from platform emergency pause)
- **Close refinery** — terminal, refunds unclaimed tokens to operator

### Profile vs Dashboard

- **`/wallet/<addr>`** — public profile (any visitor can see)
- **`/dashboard`** — private operator surface (auth-gated)

Same data, different framing.

---

## Distribution math

Pro-rata-by-holdings is the primary model.

### Formula

```
For each eligible holder at snapshot time:
  share = (holder_balance / total_eligible_balance) × pool_size
```

`total_eligible_balance` is the sum of balances across all eligible holders (post-sybil filter).

### Operator UI framing

The operator inputs in the "1% holder gets X tokens" mental model:
- "If a holder has 1% of supply, they get **N** tokens"
- We compute `pool_size = N × 100`
- Auto-display: "you'll deposit N×100 tokens, X holders eligible at current snapshot"

### Worked example

$BONK refinery:
- `pool_size` = 1,000,000 BONK
- `total_eligible_balance` = 50,000,000 BONK (sum across all eligible holders)

Holder with 500,000 BONK claims:
```
share = (500_000 / 50_000_000) × 1_000_000 = 10_000 BONK
```

### Snapshot strategy

| Strategy | Default? | Available |
|---|---|---|
| At-launch only (single snapshot at refinery creation) | **DEFAULT** | yes |
| Hourly | no | yes |
| Daily | no | yes |
| Weekly | no | yes |
| Per-epoch (rate change triggers re-snapshot) | mandatory | always |

Eligibility = held at snapshot. Late buyers can still benefit if operator opts into recurring snapshots — but if operator stays on default (at-launch only), they're ineligible.

### Decimal handling

All math in raw integer units (lamport-equivalents). Display in human units (`balance / 10^decimals`). Avoid floating point for shares — use bigint with a known precision factor (`share_basis_points`).

### Pool-empty behavior

**Default: pro-rata**. If pool would be over-distributed, all claims scale down proportionally. We never promise tokens we can't deliver.

Operator can override to **FCFS** (first-come-first-served) at launch. FCFS surfaces a "first to claim wins" badge — competitive UX trade-off.

### Per-claim cap

**Default: 5%** of remaining pool per claim. Operator-tunable from 0.1% to 100% (uncapped).

---

## Holder claim flow

### Auto-detection (the magic moment)

When a holder connects their wallet:
1. Fetch all SPL token balances (Helius DAS `searchAssets`, fungibles).
2. Cross-reference against `token_refineries.token_mint` set.
3. Surface: "You hold 3 tokens that have refineries on this platform" + list.

### Per-refinery claim UI

For each eligible refinery:
- Refinery name + token icon (oil-themed framing — "the $BONK Refinery")
- Their balance + computed claim amount + denomination ("12,450 $BONK")
- Status: `Available to claim` / `Already claimed (this epoch)` / `Cooling down` / `Window closed`
- Big claim button → wallet popup → tx → tokens hit their wallet

### Edge cases

- **Holder claims, then balance drops to 0** — already-claimed claim stays valid. They keep what they got.
- **Holder claims, then snapshot updates** — next epoch, recomputed from new balance.
- **Pool runs out mid-epoch** — pro-rata everyone down (default) or FCFS (operator's choice).
- **Refinery is paused** — show "claim temporarily unavailable."
- **Token is on freeze list** — claim cannot complete. Surface this clearly.

---

## Anti-sybil framework

Permissionless refineries are sybil farm magnets. Defaults must be real defenses, not theater.

### Defaults (always on)

- **Wallet age**: ≥ 30 days of any chain activity. Filters newly-created bot wallets.
- **Minimum balance**: ≥ N tokens, default ≥ $1 worth (operator-tunable).
- **Holding duration**: balance must have been continuously held ≥ 24h before claim.
- **Cluster heuristics**: wallets in the same flagged cluster (funded by same source, similar tx patterns) share a single claim across the cluster.

### Operator-configurable additions

- Custom allowlist / denylist (CSV upload)
- Civic Pass / KYC gate (premium tier)
- Twitter / Discord OAuth gate
- Minimum reputation score (see next section)

### Verified-only mode

Operator can flip a single switch: combines wallet-age (≥ 90 days), balance-duration (≥ 7 days), cluster filter at strictest setting.

---

## Cross-refinery reputation (full v1 scope)

A wallet's participation across all refineries feeds a trust score that operators can use as a sybil filter.

### What we compute

For each wallet, daily:

| Signal | Weight | Notes |
|---|---|---|
| Refineries claimed from successfully | + | rewards real participation |
| Avg holding duration before claim | + | rewards organic holders |
| Tokens claimed and held > 7 days post-claim | + | not a flipper |
| Cluster membership flag | − | shared score across flagged cluster |
| Wallet age | + | older = more trust |
| Refineries launched as operator | + | trusted operator history |
| Refineries closed by operator with full distribution | + | reliable operator |

Score is normalized 0-100. Not a credit score — explicitly framed as "platform trust."

### Where it appears

- **Operator launch form** → "min reputation required" filter (default 0, slider 0–80)
- **Operator dashboard** → see distribution of claimant reputation
- **Holder profile** (`/wallet/<addr>`) → shows the wallet's score, breakdown
- **Operator dashboard "Reputation" tab** → personal score with detail

### Anti-gaming

- Score gains decay over time without continued activity (no permanent "achievement" gaming)
- Cluster detection runs server-side post-hoc; flagged clusters lose all score
- Score boost from operator-launching is gated to operators with `verified_deployer` or `verified_cto` to prevent fake-refinery score farming

### Build estimate

Reputation alone adds 2–3 weeks to v1: indexer signal collection, daily score recompute job, score history table, profile UI, opt-in operator filter UI, anti-gaming safeguards.

---

## Custody model — own Anchor program with PDA escrow

The operator's tokens live in a program-owned PDA. **Neither the operator nor the platform holds the keys.** The Anchor program enforces every state change.

### Why we're building our own program (not Streamflow)

Decision: **build our own** for full control, no per-stream fees, custom rules, and platform moat. Trade-off: 6–10 weeks of program development + audit cost.

### Program responsibilities

- Initialize refinery (config + escrow PDA)
- Accept deposits (operator → escrow)
- Accept claims (escrow → holder, with merkle proof + sybil flag check)
- Operator-initiated withdrawal (gated by claim-window lock + 7-day cooldown)
- Operator-initiated close (final state, refunds unclaimed)
- Platform emergency-pause (governed by Squads-derived PDA, see below)
- Update rate (creates new epoch)

### Account structure

- `Refinery` account (per refinery) — config, state, pool reference
- `Escrow PDA` — owned by program, holds the deposited tokens
- `Snapshot` account (per snapshot) — merkle root, total eligible balance
- `ClaimReceipt` account (per claim) — replay protection, marks holder as claimed for that snapshot
- `Treasury` PDA — receives launch fees + 1% deposit fees (in deposited token, awaiting auto-swap to SOL)

### Withdrawal policy (protocol-enforced, not configurable)

**Claim-window lock + 7-day cooldown.** Operator cannot withdraw while the claim window is open OR within 7 days after the window closes. Program rejects withdrawal instructions that violate this. The 7-day cooldown gives stragglers time to claim before refinery winds down.

### Platform pause governance (Squads-PDA design)

The program checks pause-authority against a PDA derived from a Squads multisig address (rather than hard-coding a single key).

**Practical setup:**
- v1: Squads vault is configured 1-of-1 (you alone sign)
- Same UX as a single key — one signature
- v2/post-audit: add co-signers to Squads (3-of-5 typical), no program upgrade required

This protects against a single-key compromise from day one without forcing multi-sig friction during fast iteration.

### Token-2022 support

Required. Program handles:
- Transfer fees (computed at deposit + claim, surfaced in UI)
- Mint authority active (badge at launch, holder warning at claim)
- Freeze authority active (badge at launch, claim instruction may fail — surface clearly)
- Permanent delegate, default account state, mint close authority — all flagged

---

## Fees

| Fee | Amount | Currency | Collected at |
|---|---|---|---|
| Launch fee | **0.1 SOL** | SOL | Refinery init |
| Deposit fee | **1%** of deposit | Deposited token (auto-swapped to SOL via Jupiter on cron) | Each deposit/top-up |
| Claim fee | **0.001 SOL** | SOL | Each holder claim |

### Auto-swap to SOL

Treasury never holds operator's token long-term. A daily cron job sweeps the treasury PDA's token balances through Jupiter aggregator → SOL → platform treasury. Slippage limit: 1%. Failed swaps queue for next run.

### Total operator cost

Launch + deposit 100,000 tokens of value $X:
- 0.1 SOL launch + 1% take = ~ $0.1×SOL_price + $X×0.01

### Total holder cost

~0.001 SOL per claim. Well under value claimed unless the refinery is for sub-cent tokens.

---

## Privacy / Terms of Service

### Required clauses for our product

- Token risk disclosure ("crypto can lose all value")
- No fiduciary or advisory relationship
- Sanctions / OFAC screening (block IPs from Iran, NK, Cuba, Russia, Crimea, Syria — matched at edge layer)
- Disclaimer of liability for token operator behavior (operator-launched refineries, not platform-vouched)
- Custody disclosure: "Funds held in audited on-chain Anchor program. Platform holds no keys to operator deposits."
- Arbitration clause (Delaware or Cayman; finalize at incorporation)
- GDPR / CCPA cookie consent banner

### Enforcement

**Modal on every wallet (re)connect.** First-time and reconnects both re-prompt:
- "I have read and accept the Terms of Service and Privacy Policy" checkbox
- Must check before any action (claim, launch, deposit)
- Acceptance recorded in `tos_acceptances` table with timestamp + ToS version hash

When ToS version updates, all users re-prompt on next action.

### Lawyer review

Required before mainnet launch with real TVL. Budget: $1k–3k for crypto-savvy attorney review of Iubenda/Termly-generated baseline.

---

## Theme system

Three themes, default "system":

| Theme | Trigger | Palette |
|---|---|---|
| **System** (default) | Auto from `prefers-color-scheme` | dark or light depending on user OS |
| **Dark** | Manual | Black + brand yellow (#FAB80A) |
| **Light** | Manual | Inverse |
| **Solana Mode** | Manual | `#14F195` mint green + `#9945FF` purple, gradient accents — full neon vibe |

Implementation: `data-theme` attribute on `<html>`, Tailwind v4 `@theme` blocks per theme. User choice persists in localStorage. Solana Mode is opt-in only — never auto-applied.

---

## UI / IA / pages

### Information architecture

```
/                                       → Home: hero + featured refineries + leaderboard preview
/refineries                             → Directory: all token refineries, filterable, sortable
/refinery/launch                        → Launch form (multi-step)
/refinery/<token-mint>                  → Token page: lists ALL refineries for that mint
/refinery/<token-mint>?r=<refinery-id>  → Specific refinery (claim UI + stats)
/refinery/solana                        → Existing all-Solana refinery (renamed for clarity)
/refinery/launchpad/<bags|pump|bonk|candle>  → Launchpad refineries
/dashboard                              → Operator + holder dashboard (auth-gated)
/wallet/<addr>                          → Public wallet profile (existing)
/leaderboard                            → Cross-refinery leaderboard (existing, evolving)
/legal/terms                            → ToS
/legal/privacy                          → Privacy Policy
```

### Side navigation

Hover-to-expand, collapsed-to-icons-on-mouse-out (Linear / Notion pattern). Persistent across pages. Animation: 150ms ease-out, no Framer overhead.

### Visual / branding consistency

Per established product identity — every refinery surface uses **the barrel + oil + prestige metaphor**. The oil-rig aesthetic, barrel fill states, prestige titles, seeded RNG fills — these are the moat. Every new screen extends them, not replaces them.

### Barrel theming

**Default barrel for all refineries in v1.** Token-themed barrel variants (per-token color, label, material) are deferred to v1.5+ post-launch. One barrel for both Token Refineries and Launchpad/Solana refineries.

### Mobile

- Side nav collapses to bottom-bar tab switcher on mobile
- Directory: list view (no horizontal scroll)
- Launch form: single-column stepped flow
- Refinery page: stacked stats above barrel grid
- Dashboard: tab switcher (refineries / claims / reputation)

### UI inspiration references

OpenSea + Vercel for clean dark-mode-first surfaces with strict typographic hierarchy. Linear + Notion for the side-nav-on-hover pattern. Geist (Vercel's open-source font) is the default sans.

---

## Data model (DB schema additions)

Beyond existing `wallets`, `refines`, `bags_refines`, `wallet_bags_analytics`:

### `token_refineries`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| token_mint | text | not unique — multiple refineries per mint allowed |
| operator_wallet | text | not transferable, set at creation |
| status | enum | `pending` / `active` / `paused` / `closed` |
| name_cache | text | denormalized from on-chain |
| symbol_cache | text | |
| icon_url_cache | text | |
| decimals_cache | int | |
| claim_rate_basis | bigint | tokens per 1% of supply held |
| escrow_pda | text | program-owned PDA |
| snapshot_strategy | enum | `at_launch` / `hourly` / `daily` / `weekly` |
| pool_empty_strategy | enum | `pro_rata` / `fcfs` |
| per_claim_cap_bps | int | basis points (5% = 500) |
| claim_window_seconds | bigint | 0 = open-ended |
| sybil_config | jsonb | `{wallet_age_days, min_balance, hold_duration_h, cluster_filter, min_reputation, ...}` |
| verified_deployer | bool | mint-authority match detected |
| verified_cto | bool | manual-review approved |
| created_at, updated_at | timestamptz | |
| closed_at | timestamptz | nullable |

### `refinery_snapshots`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| refinery_id | uuid | FK |
| snapshot_at | timestamptz | |
| total_eligible_balance | bigint | sum across all eligible holders |
| holder_count | int | |
| merkle_root | text | for on-chain verification |

### `refinery_claims`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| refinery_id | uuid | FK |
| holder_wallet | text | |
| snapshot_id | uuid | FK |
| balance_at_snapshot | bigint | |
| amount_claimed | bigint | |
| tx_signature | text | unique, replay protection |
| claimed_at | timestamptz | |

### `refinery_deposits`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| refinery_id | uuid | FK |
| operator_wallet | text | |
| amount | bigint | |
| direction | enum | `deposit` / `withdrawal` |
| tx_signature | text | unique |
| created_at | timestamptz | |

### `wallet_reputation`
| Column | Type | Notes |
|---|---|---|
| wallet_address | text | PK |
| score | int | 0–100 normalized |
| signals | jsonb | breakdown of contributing signals |
| cluster_id | text | nullable, points to flagged cluster |
| last_recomputed_at | timestamptz | |

### `tos_acceptances`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| wallet_address | text | |
| tos_version_hash | text | |
| accepted_at | timestamptz | |

### `refineries_archive`
| Column | Type | Notes |
|---|---|---|
| refinery_id | uuid | PK |
| token_mint | text | |
| operator_wallet | text | |
| total_claimed | bigint | |
| holder_count | int | |
| closed_at | timestamptz | |

(Kept forever after the 6-month live retention; per-claim rows hard-deleted.)

All tables: RLS enabled, service role bypasses (consistent with existing pattern).

---

## Backend / indexer (free Supabase stack)

The frontend (Next.js) and backend (indexer + workers) split into separate concerns. Indexer runs entirely inside Supabase free tier — no Fly.io, no paid hosting.

### Stack

| Layer | Service | Free tier reality |
|---|---|---|
| Frontend | Vercel Hobby | Free, generous limits |
| Database | Supabase Free | 500 MB DB, 5 GB bandwidth, 50K MAU |
| Worker / indexer | Supabase Edge Functions | 500K invocations/month free, 150s wall-time per invocation |
| Job queue | Supabase pg_queue + pg_cron | Included in free tier |
| Cache | Upstash Redis Free | 10K commands/day, 256 MB |
| RPC | Helius Free | 100K credits/day |
| Solana network | Devnet only (free) | Switch to mainnet after audit |

### Worker responsibilities

1. **Helius webhook receiver** (Edge Function) — ingest mint events for each registered refinery's token. Update `wallet_balances` when balances change.
2. **Snapshot job** (pg_cron + Edge Function) — at refinery's snapshot cadence, freeze eligible balances + recompute merkle root + write to chain.
3. **Pool monitoring** (pg_cron) — detect low pool, notify operator.
4. **Claim signature watcher** (webhook) — detect on-chain claims, write `refinery_claims`.
5. **Sybil cluster job** (pg_cron, daily) — re-cluster all tracked wallets.
6. **Reputation recompute** (pg_cron, daily) — score every wallet from latest signals.
7. **Treasury swap job** (pg_cron, daily) — sweep treasury PDA tokens to SOL via Jupiter.
8. **ToS version pin** (pg_cron) — flag mismatched user acceptances on ToS update.

### Limit awareness

Edge Functions cap at 150s per invocation. All jobs are inherently chunkable — snapshot a refinery at a time, swap one token at a time, recompute reputation in batches of 1000 wallets.

---

## Audit + bug bounty (mainnet gating)

Mainnet deployment criteria — non-negotiable:

1. **Audit complete** by a credible firm. Candidates: OtterSec, Ackee Blockchain, Sec3, Neodyme. Budget: $30k–80k. Funding source: early devnet-phase grants + initial mainnet launch fees.
2. **Bug bounty live** on Immunefi at $50k+ tier before any real-money mainnet user.
3. **Solana Foundation audit grant** — apply early; covers a portion of the audit cost.
4. **Internal test coverage**: 100% branch coverage on token-moving instructions (LiteSVM + Surfpool fork tests).
5. **Squads multisig** configured for program upgrade authority and pause authority.

Until all five are met: **devnet only**. The product runs, real flows, real indexer, real Supabase data — but with test tokens and no real value.

---

## Edge cases / nasty stuff

Things that will bite us if we don't think them through.

- **Token-2022 transfer fees**: claim arrives reduced. Surface in UI; operator decides whether to top-up to account for it.
- **Mint authority alive**: operator could mint more supply mid-claim, dilute holders. Risk badge surfaces this at launch.
- **Freeze authority alive**: token can be frozen, claims become unsendable. Surface clearly.
- **Operator deposits less than promised**: program enforces — refinery cannot go active until pool ≥ promised.
- **Operator withdraws to zero, deposits dust to keep refinery "active"**: program enforces reserve lock; can't breach minimum during claim window.
- **Holder uses multiple wallets to game per-claim cap**: cluster heuristics catch shared funding sources.
- **Holder claims, sells, buys back, claims again next epoch**: this is fine — real holder activity.
- **Token rugs (LP pulled) mid-epoch**: pool tokens become worthless. We can't prevent it; surface "token risk" badge in advance.
- **Refinery for wrapped token (wSOL, wBTC)**: works the same as any SPL.
- **Refinery for an NFT collection**: out of scope for v1.
- **Operator's wallet compromised**: they can drain through legit "withdraw" subject to claim-window-lock policy. Recommend operator-side multisig (Squads) for high-value pools.
- **Token migration / contract change mid-claim**: refinery is paused, operator must launch new refinery for new mint, unclaimed tokens refunded to operator.
- **Refinery transferability**: not allowed. Operator wallet binding is permanent.

---

## Phasing / rollout

Realistic timeline given own-program scope + reputation in v1 + audit gating.

### Phase 0 — Foundation (1 week)
- Style-system PR (tokens, typography, theme switcher: dark / light / Solana mode)
- Devnet env split (Vercel `dev` branch → devnet, `main` → mainnet)
- ToS + Privacy draft (Iubenda baseline)
- Side-nav-on-hover scaffold

### Phase 1 — Anchor program (4–6 weeks)
- Scaffold `sol-oilfactory-program` sibling repo
- Refinery init + deposit + claim + withdraw + close instructions
- Snapshot + merkle distribution mechanics
- Squads-PDA pause governance
- Token-2022 support (transfer fees, freeze, mint authority checks)
- LiteSVM unit tests (100% branch coverage on token-moving paths)
- Surfpool fork tests against devnet state
- Devnet deploy

### Phase 2 — Indexer + frontend integration (3–4 weeks)
- Supabase Edge Functions: webhook receiver, snapshot job, claim watcher, treasury swap
- Helius webhook subscriptions for active refineries
- Refinery directory page
- Per-refinery public page with claim UI
- Launch form (multi-step) hooked up to program
- Operator dashboard (3 tabs)
- Auto-detect for connected wallet
- Token filter at launch (RugCheck integration)

### Phase 3 — Reputation + advanced sybil (2–3 weeks)
- Cross-refinery reputation indexing
- Daily score recompute (pg_cron)
- Operator opt-in reputation filter
- Profile UI + reputation tab
- Anti-gaming safeguards (decay, cluster flagging)

### Phase 4 — Audit + bug bounty + mainnet (4–8 weeks elapsed)
- Audit (OtterSec/Ackee/Sec3/Neodyme)
- Bug fixes from audit findings
- Bug bounty launch
- Lawyer review of ToS
- Solana Foundation audit grant application
- Mainnet deploy (program + Supabase prod project + Vercel main branch env swap)

**Total v1 to devnet-ready: ~10–13 weeks.**
**Total v1 to mainnet: +4–8 weeks for audit + fixes + bounty.**

---

## Locked decisions

Final answers, dated 2026-05-09. Earlier amendments require updated date.

| # | Decision | Locked answer |
|---|---|---|
| 1 | Custody model | Own Anchor program with PDA escrow (non-custodial by design) |
| 2 | Withdrawal policy | Claim-window-locked + 7-day cooldown |
| 3 | Snapshot default | At-launch only; operator can opt into hourly/daily/weekly recurring |
| 4 | Refineries per mint | Multiple allowed; operators pay 0.1 SOL each |
| 5 | Launch model | Permissionless, with auto-detected verified-deployer + manual verified-CTO badges |
| 6 | Launch fee | 0.1 SOL |
| 7 | Deposit fee | 1% of deposit, in deposited token, auto-swapped to SOL via Jupiter |
| 8 | Claim fee | 0.001 SOL |
| 9 | Pool-empty default | Pro-rata scale-down (operator can override to FCFS) |
| 10 | Per-claim cap default | 5% of remaining pool (tunable 0.1%–100%) |
| 11 | Claim window default | 30 days (operator-tunable, including open-ended) |
| 12 | Token filter | Auto-block scam-list / RugCheck-danger / transfer-fee-over-5% / undisclosed-freeze. ⚠ badges for mintable / low-liquidity / concentrated. ✓ for Jupiter-verified + RugCheck-clean + authorities-renounced. **No** "<24h old" block. |
| 13 | Refinery transferability | Never transferable. Operator wallet permanently bound. |
| 14 | Emergency pause governance | Squads-PDA design (program checks PDA derived from Squads address; v1 starts 1-of-1, easy upgrade path to multisig) |
| 15 | Cross-refinery reputation | Full v1 scope including UI, opt-in operator filter, profile display |
| 16 | Operator KYC | None (permissionless platform) |
| 17 | Closed refinery retention | 6-month searchable; per-claim rows hard-deleted after; one-row summary archived forever |
| 18 | Privacy/ToS modal | Re-prompt on every wallet (re)connect; record `tos_version_hash` per acceptance |
| 19 | Theme default | System (auto dark/light); Solana Mode opt-in |
| 20 | Barrel theming | Single default barrel for v1, per-token themes deferred to v1.5+ |
| 21 | URL slug | Token mint address (canonical), display pretty `/refinery/<symbol>-<mint-prefix-6>` |
| 22 | Hosting stack | Vercel Hobby + Supabase Free + Supabase Edge Functions + pg_cron + Upstash Free + Helius Free |
| 23 | Network | Devnet only until audit + bug bounty live; mainnet deploy after |
| 24 | Audit firms (candidates) | OtterSec, Ackee Blockchain, Sec3, Neodyme — apply for Solana Foundation grant |

---

## Out of scope for v1 (parking lot)

These are real ideas but explicitly deferred. Don't build now.

- Per-token barrel theming
- Operator multisig integration (Squads/Krypton suggestion only)
- KYC tier (Civic Pass)
- Refinery ratings / reviews from holders
- Cross-chain bridged token support beyond standard wSOL/wBTC
- i18n / translation infrastructure
- ML-based cluster detection (heuristic + Bubblemaps-style is enough for v1)
- Refinery-specific Telegram/Discord bots
- DAO governance for platform parameters

---

## Changelog

- **2026-05-08** — Initial draft with 18 OPEN decisions
- **2026-05-09** — All decisions locked; custody flipped from Streamflow to own Anchor program; reputation moved into v1 scope; hosting stack switched to free Supabase Edge Functions; theme system + ToS + audit gating sections added; phasing rewritten; status changed to LOCKED
