# 02 — Product Specification

**Audience:** Everyone (read after Overview)
**Purpose:** What the product does — protocol behavior, refineries, snapshots, reputation, fees

This is the **what**, not the **how**. For implementation details, see the program architecture and reference docs.

---

## Core Concept

A **refinery** is a smart contract instance that:
1. Holds a **pool** of tokens deposited by an **operator**
2. Records **snapshots** of eligible holder balances
3. Lets **holders** claim their pro-rata share via merkle proof
4. Tracks distribution metrics for **reputation** building

The refinery enforces:
- Per-claim caps (no whale takes the whole pool)
- Pool-empty strategies (pro-rata or first-come-first-served)
- Claim windows (open-ended or fixed-duration)
- Withdrawal locks (operators can't pull funds during active claim windows)
- Pause states (operator-level + platform-level)

---

## The Refinery Lifecycle

```
                  [Operator]
                      │
                      │ launch_refinery
                      ▼
                ┌──────────┐
                │ Pending  │  ← intermediate, claims not yet open
                └────┬─────┘
                     │ first snapshot taken
                     ▼
                ┌──────────┐
            ┌──→│  Active  │←──────────┐
            │   └────┬─────┘            │
            │        │                  │
            │        │ holder claims    │ unpause
            │        │ operator deposits│
            │        │ snapshots taken  │
            │        │                  │
            │        │ operator pauses  │
            │        ▼                  │
            │   ┌──────────────┐        │
            │   │OperatorPaused│────────┘
            │   └──────┬───────┘
            │          │
            │          │ operator closes
            │          ▼
            │     ┌─────────┐
            └────→│ Closed  │  ← terminal
                  └─────────┘
```

Plus orthogonal **PlatformPaused** state (set by Squads multisig) that disables ALL refineries until cleared.

---

## Refinery Configuration

When an operator launches a refinery, they configure these parameters:

### Pool deposit
- **`pool_initial`** — token amount deposited into escrow (must be > 0)
- Minimum: any positive amount (no platform-set minimum in v1)
- Operator pays a **1% deposit fee** on top of the pool (auto-swapped to SOL via Jupiter)
- Example: 1,000,000 BONK pool requires 1,010,000 BONK in operator's wallet

### Claim rate basis
- **`claim_rate_basis`** — tokens distributed per 1% of supply held
- This is the operator-facing framing of the math
- Example: if `claim_rate_basis = 12,000`, a holder owning 1% of supply receives 12,000 tokens per snapshot
- Internally, this gets translated to pro-rata share calculations

### Per-claim cap
- **`per_claim_cap_bps`** — maximum percentage of remaining pool a single claim can take
- Range: 10 bps (0.1%) to 10,000 bps (100%)
- Default suggestion: 500 bps (5%)
- Recomputed per claim (cap shrinks proportionally as pool drains)

### Pool empty strategy
- **`pool_empty_strategy`** — what happens when claims would exceed remaining pool
- Two options:
  - **`ProRata`** — scale claims down proportionally (everyone gets less)
  - **`FCFS`** — first-come-first-served (early claimers get full share, latecomers get less or nothing)
- v1 implementation: both currently cap at `pool_remaining` per claim. True pro-rata scale-down with retroactive adjustment is v1.5+ scope.

### Snapshot strategy
- **`snapshot_strategy`** — frequency of new snapshots (merkle root submissions)
- Five options:
  - **`AtLaunch`** — single snapshot when refinery launches (default)
  - **`Hourly`** — every hour
  - **`Daily`** — every day
  - **`Weekly`** — every week
  - **`PerEpochOnly`** — only when operator advances epoch (no recurring)

### Claim window
- **`claim_window_seconds`** — how long claims are accepted
- 0 = open-ended (no end date)
- Otherwise must be ≥ 60 seconds
- Common configurations: 7 days, 14 days, 30 days, 90 days

### Freeze acknowledgment
- **`freeze_acknowledged`** — checkbox the operator MUST check if the token has an active freeze authority
- Frozen accounts cannot receive transfers — claims will fail at CPI level
- This is a UX warning, not a programmatic block

---

## Snapshots — How Eligibility Is Determined

A snapshot freezes the eligible-holder set at a point in time, captured as a merkle tree.

### What a snapshot contains
- **Merkle root** (32 bytes) — root of the eligible-holder merkle tree
- **Total eligible balance** — sum of all eligible holder balances at snapshot time
- **Holder count** — number of eligible holders (must be > 0)
- **Epoch** — the refinery's epoch at snapshot time
- **Snapshot index** — monotonic counter (1, 2, 3, ...)
- **Taken at** — unix timestamp
- **Submitted by** — public key of the snapshot authority

### How merkle leaves are constructed
```
leaf = SHA-256(0x00 || holder_pubkey || balance_le_u64)
```
Where:
- `0x00` is the leaf domain separator
- `holder_pubkey` is the holder's wallet (32 bytes)
- `balance_le_u64` is the holder's balance at snapshot time, little-endian u64 (8 bytes)

### How merkle nodes are constructed
```
node = SHA-256(0x01 || min(left, right) || max(left, right))
```
Where:
- `0x01` is the node domain separator
- `min/max` is sorted-pair (OpenZeppelin convention) — proofs don't need position bits

### Who submits snapshots

A **designated snapshot authority** keypair is the only signer permitted to call `submit_snapshot`. This is held by the off-chain indexer service.

This is a centralization point we accept for v1. Mitigations:
1. Anyone can audit snapshots — eligibility data is publicly reconstructible from RPC at snapshot timestamp
2. The keypair is rotatable via `rotate_authority` (admin instruction)
3. Future: `challenge_snapshot` instruction with slashing bond (v1.5+)

### Snapshot exclusion rules

The snapshot authority filters out wallets BEFORE building the merkle tree based on:
- **Cluster flagging** — wallets in a flagged sybil cluster are excluded
- **Wallet age** — wallets younger than 24 hours are excluded
- **Behavioral signals** — wallets with extreme rapid-flip patterns are excluded

This is "soft" sybil resistance applied off-chain. Hard rules (like minimum balance) are enforced in the merkle generation code.

---

## Claims — How Holders Receive Tokens

A holder claims by:

### 1. Connect wallet
- Phantom, Solflare, or Backpack via wallet adapter
- Sign-In With Solana (SIWS) challenge for indexer auth

### 2. Indexer returns eligible refineries
- Frontend calls `/api/wallets/[wallet]/eligible`
- Returns: list of refineries this wallet can claim from + pre-computed merkle proofs

### 3. Holder clicks "Claim"
- Frontend builds claim transaction with:
  - `refinery_pda` (refinery to claim from)
  - `snapshot_index` (which snapshot's tree the holder is in)
  - `balance_at_snapshot` (holder's balance at snapshot time)
  - `merkle_proof` (sibling hashes up the tree)

### 4. Wallet signs and submits
- Holder pays:
  - 0.001 SOL claim fee → `treasury_config.fee_receiver_sol`
  - Network fee (~0.001 SOL)
  - Optional: 0.002 SOL ATA rent if holder doesn't have a token account yet (refundable)

### 5. Program verifies and transfers
1. Verify merkle proof against `snapshot.merkle_root`
2. Check `ClaimReceipt` PDA doesn't exist (replay protection)
3. Compute share:
   ```
   raw_share    = balance × pool_remaining / total_eligible_balance
   per_claim    = pool_remaining × per_claim_cap_bps / 10_000
   share_capped = min(raw_share, per_claim, pool_remaining)
   ```
4. Transfer `share_capped` from escrow ATA to holder ATA
5. Update refinery accounting (`pool_remaining -= share_capped`, etc.)
6. Initialize `ClaimReceipt` PDA (prevents re-claim)
7. Emit `ClaimMade` event

### 6. Frontend updates
- Subscribe to `ClaimMade` event for live confirmation
- Refetch eligibility list (this snapshot now claimed)
- Update reputation in real-time (claim signal added)

---

## The Eligibility States (6 total)

The Single Refinery page can display 6 distinct claim states depending on holder + indexer status:

| State | When | Display |
|---|---|---|
| **A — Not connected** | No wallet connected | "Connect wallet to check eligibility" |
| **B — Eligible** | Connected, in snapshot, not yet claimed | Standard claim block with amount + button |
| **C — Already claimed** | Connected, ClaimReceipt PDA exists | "Claimed X on date · [tx link]" |
| **D — Not eligible** | Connected, NOT in snapshot | "Buy + wait for next snapshot" |
| **E — Proof unavailable** | Holds token but indexer down | "You appear eligible · [Refresh →]" |
| **F — Account frozen** | Claim failed due to freeze | "Account frozen · contact token team" |

States E and F are post-MVP additions surfaced from cross-checking the backend program. See `04-page-specifications.md` for full copy.

---

## Withdrawal Lock — How Operators Get Their Tokens Back

Operators can withdraw remaining pool tokens, but ONLY after:

### For fixed-window refineries (claim_window_end != 0):
1. Claim window must be closed (`now > claim_window_end`)
2. Plus 7-day cooldown (`now >= claim_window_end + 7 days`)

### For open-ended refineries (claim_window_end == 0):
- **Cannot withdraw at all.**
- Must call `close_refinery` to terminate the refinery and refund remaining pool.

This is enforced by the program. The 7-day cooldown is intentional — it gives holders one final window to claim before operators pull funds.

---

## Closing a Refinery

The operator can call `close_refinery` at any time. Effects:

1. Status → `Closed` (terminal)
2. Remaining pool transferred to operator's ATA
3. `RefineryClosed` event emitted

**Important:** unlike withdrawal, **close has NO cooldown**. Operators can close mid-claim-window if needed (emergency exit). However:
- Holders forfeit unclaimed shares from active snapshots
- Operator's reputation is affected (closing early = reputation penalty)
- The on-chain history remains (Refinery + Snapshot PDAs persist)

This is intentional — the social cost of premature close is higher than the technical friction of preventing it. Operators who do this regularly will see their reputation tank.

---

## Operator Pause vs Platform Pause

Two orthogonal pause systems:

### Operator pause (per-refinery)
- Triggered by: refinery operator
- Effect: blocks claims for ONE specific refinery
- State: `RefineryStatus = OperatorPaused`
- Toggle: `toggle_operator_pause` (flips between Active and OperatorPaused)
- Closed refineries cannot be paused (returns `InvalidStateForToggle`)

### Platform pause (global)
- Triggered by: Squads vault (`treasury_config.pause_authority`)
- Effect: blocks all `init_refinery`, `deposit`, `submit_snapshot`, `claim`, `withdraw`
- State: `treasury_config.paused = true`
- Toggle: `toggle_platform_pause`
- **`close_refinery` remains enabled** — operators can always escape

Day-one: Squads is configured 1-of-1 (founder alone signs).
Post-audit: expanded to N-of-M (typically 3-of-5).

---

## Epoch Advancement

The operator can change distribution rules without closing the refinery by calling `update_rate`:

### What can change
- Claim rate basis
- Per-claim cap
- Pool empty strategy
- Snapshot strategy
- Claim window extension (adds time to existing window)

### What happens
- `refinery.epoch += 1`
- Existing snapshots become stale (epoch mismatch on claim)
- Holders cannot claim until a new snapshot is submitted for the new epoch
- Existing ClaimReceipts from prior epochs remain valid (still prevent replay)

### UX implications
- Banner shown to holders: "This refinery's rules changed — your next claim will be different"
- Activity feed entry: "Operator advanced to epoch 2"
- Wallet profile shows epoch-advancement events from interacted refineries

---

## Reputation System

Reputation is a **0-100 score per wallet**, computed from on-chain behavior. Recomputed daily.

### The 6 signals (with weights)

1. **Refineries claimed successfully** (25%)
   - How many distinct refineries the wallet has claimed from
   - Higher = stronger signal of legitimate, multi-project participation

2. **Average holding duration** (20%)
   - How long the wallet typically holds tokens after claiming
   - Calculated as median across all claim events
   - Higher = real holder, not a flipper

3. **Tokens held > 7d post-claim** (20%)
   - Of all tokens the wallet has claimed, what fraction did they hold for > 7 days?
   - Higher = real holder

4. **Cluster status** (15%)
   - Is the wallet in a flagged sybil cluster?
   - Boolean signal: clean (full credit) or flagged (zero credit)
   - Cluster detection runs daily via behavioral analysis

5. **Wallet age** (10%)
   - How old is the wallet?
   - Older = more reputational weight (harder to fake)

6. **Refineries launched as verified deployer** (10%)
   - How many refineries this wallet has launched as a verified deployer (mint authority match)?
   - Higher = legitimate token operator

### Reputation tiers

| Score | Tier | Display color |
|---|---|---|
| 80-100 | Excellent | Green (`#22C55E`) |
| 60-79 | Good | Oil amber (`#F5A623`) |
| 40-59 | Neutral | Gray (`#A3A3A3`) |
| 20-39 | Risky | Yellow (`#F59E0B`) |
| 0-19 | Flagged | Red (`#EF4444`) |

### Where reputation is shown

- Inline on every refinery card (operator's reputation)
- On every wallet pill in directory tables
- On `/wallet/[addr]` public profile pages
- On `/leaderboard`
- On `/reputation` (methodology page)
- In claim flows (operator reputation visible to holder)
- In dashboard (your own reputation with trend)

### How operators can use reputation

- **Min-reputation filter** in directory (browsers can filter by op reputation)
- **Future:** reputation-gated launches (requires X reputation to launch)
- **Future:** exclude flagged clusters from your refinery's snapshots

### Sybil resistance

The cluster detection algorithm identifies:
- Wallets funded from the same source within a short window
- Wallets with similar transaction patterns
- Wallets with claim-and-dump behavior across multiple refineries

Flagged clusters are listed publicly. Wallets can dispute flagging (process TBD post-launch).

---

## Fee Schedule

### Launch fee
- **Amount:** 0.1 SOL (configurable per `treasury_config.launch_fee_lamports`)
- **Paid by:** operator at refinery creation
- **Goes to:** `treasury_config.fee_receiver_sol`
- **In SOL:** yes, paid in native SOL

### Deposit fee
- **Amount:** 1% of pool deposit (configurable per `treasury_config.deposit_fee_bps`)
- **Paid by:** operator at refinery creation AND on every top-up
- **Goes to:** `treasury_swap_pda`'s ATA for that token
- **In tokens:** yes, paid in the refinery's token
- **Off-chain swap:** daily cron job swaps treasury tokens to SOL via Jupiter aggregator
- **Cap:** maximum 10% (sanity limit, set at init_treasury)

### Claim fee
- **Amount:** 0.001 SOL (configurable per `treasury_config.claim_fee_lamports`)
- **Paid by:** holder per claim
- **Goes to:** `treasury_config.fee_receiver_sol`
- **In SOL:** yes, paid in native SOL

### Network fees + ATA rent (paid to Solana, not Sol Oil Factory)
- ~0.000005 SOL per signature (network fee)
- ~0.002 SOL one-time per token if holder doesn't have an ATA yet (refundable when ATA is closed)

---

## Token Support

### SPL-Token (Token Program)
Fully supported. Standard transfers via `transfer_checked`.

### Token-2022 (Token Program 2022)
Fully supported. Both legacy and Token-2022 mints work via `anchor_spl::token_interface`.

### Token-2022 extensions

**Supported (work transparently):**
- TransferFee — fee deducted automatically by token program. Pre-fee amount recorded in ClaimReceipt; post-fee amount received by holder.
- DefaultAccountState — irrelevant to claim flow.
- MintCloseAuthority — irrelevant.
- PermanentDelegate — flagged in launch UI; no program-side enforcement.

**Risk-flagged but allowed:**
- FreezeAuthority active — operator must acknowledge at launch. Frozen accounts cause claim CPI to fail; holder retries after thaw.

**Not supported (blocked at launch):**
- TransferHook — currently rejected. Reason: hook can run arbitrary CPI, not yet audited. Will be re-evaluated post-audit.

**Special handling:**
- Tokens with active mint authority — flagged but allowed. Operator's "Verified Deployer" badge is granted only if `token_mint.mint_authority == operator.key()`.

---

## What's Out of Scope (Parking Lot)

These ideas are **deferred** to v1.5+ or beyond. Documented to prevent re-litigation.

### Protocol-level

- **Permissionless / oracle-based snapshot submission** — replace designated authority
- **`challenge_snapshot` instruction** — slashing bond for fraudulent merkle roots
- **TransferHook extension support** — currently rejected at launch
- **`close_claim_receipt` sweep instruction** — recover rent from old ClaimReceipts after close
- **CPI Jupiter swap** — auto-swap treasury tokens on-chain (currently off-chain via cron)
- **Operator transferability** — currently permanently bound at init
- **Refinery cloning** — re-deploy with same params, new mint
- **True pro-rata scale-down** with retroactive adjustment
- **ZK-proof of holdings** — replace merkle entirely

### Frontend-level

- **Per-token barrel theming** — refinery pages take on token's color identity
- **Civic Pass / KYC tier** — verified humans only refineries
- **Refinery ratings / reviews UI** — let holders rate operators
- **i18n / translation** — English only for v1
- **DAO governance for platform parameters** — fees set by token holders
- **Mobile app** — web-only for v1
- **Browser extension** — web-only for v1

### Business-level

- **$SOF token** — no platform token planned
- **Staking** — no staking mechanism
- **Tokenomics** — pure throughput economics, no token gating

---

## Document History

- **2026-05-10** — Initial product spec consolidating token-refinery-design.md, multi-tenant-pivot.md, and architecture.md.
