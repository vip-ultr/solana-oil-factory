# 06 — Program Architecture

**Audience:** Backend developers, smart contract auditors
**Purpose:** Engineering design for the Anchor program — accounts, instructions, security invariants, design decisions

This is the **design** doc. For what's actually built, see [07-program-reference.md](07-program-reference.md). For how the frontend talks to it, see [08-frontend-integration.md](08-frontend-integration.md).

---

## Program Identity

| Field | Value |
|---|---|
| Repo | `vip-ultr/sol-oilfactory-program` |
| Crate name | `refinery` |
| Crate version | `0.1.0` |
| Devnet program ID | `2tPLLPQeLLNL4UDBbeagSUAABJcB3fHGTJaLGEzrx3rE` |
| Mainnet program ID | TBD (separate keypair generated at mainnet deploy) |
| Anchor version | 0.32.1 |
| Solana platform-tools | v1.52 |

---

## Program Scope

### What the program IS responsible for

- Holding operator-deposited reward pools in non-custodial PDA escrow accounts
- Recording snapshots (merkle root + total eligible balance + holder count)
- Validating holder claims via merkle proof against the recorded snapshot
- Enforcing per-claim caps and pool-empty distribution rules
- Enforcing the operator withdrawal lock (claim window + 7-day cooldown)
- Enforcing the Squads-derived pause authority and operator-level pause
- Closing refineries permanently and refunding unclaimed tokens
- Collecting launch + claim + deposit fees into the platform treasury

### What the program is NOT responsible for

- Computing the snapshot merkle tree (off-chain indexer)
- Filtering wallets for sybil rules (off-chain pre-merkle)
- Computing reputation scores (off-chain)
- Auto-swapping treasury tokens to SOL (off-chain cron via Jupiter)
- Helius webhook ingestion or any indexer concern
- Operator KYC (none required)

### Trust model

- **Snapshot authority:** designated keypair (set in `TreasuryConfig`). Only this signer can submit snapshots. The off-chain indexer service holds it. Rotatable.
- **Pause authority:** Squads-derived PDA. Day-one this is a 1-of-1 vault (founder alone signs); post-audit can be expanded to N-of-M without a program upgrade.
- **Operator:** controls their refinery's pause (operator-scope only — separate from platform pause), withdrawals (subject to lock), close, and rate updates.
- **Holders:** trustless — they prove eligibility via merkle proof.

---

## Architectural Decisions (Design-Time)

These are the v1 choices that shape the rest of the design. Each lists the alternative we considered and why we rejected it.

### 1. Merkle-proof claims (not on-chain holder list)

**Decision:** snapshots store only `(merkle_root, total_eligible_balance, holder_count)` on-chain. Holders pass a merkle proof + their `balance_at_snapshot` when claiming.

**Rejected:** storing the full holder list on-chain. Cost: ~$0.10 per holder × thousands of holders × per-snapshot = bankrupting on a free-tier product.

### 2. Designated snapshot authority

**Decision:** a single off-chain-controlled keypair (set in `TreasuryConfig.snapshot_authority`) is the only signer permitted to call `submit_snapshot`. The off-chain indexer service holds this keypair.

**Rejected:**
- *Operator submits their own root* — gameable; operator can include alt-wallets with inflated balances
- *Permissionless oracle* — premature complexity; v1.5+ direction
- *Multisig submitter* — adds latency to snapshot cadence

**Mitigations:**
- Keypair is rotatable via `rotate_authority` admin instruction
- Snapshot data is reconstructible from public RPC state — anyone can audit
- Future: `challenge_snapshot` instruction with slashing bond (v1.5+)

### 3. Squads-derived PDA for pause authority

**Decision:** `TreasuryConfig.pause_authority` stores a Squads vault address. Day-one Squads is configured 1-of-1; post-audit upgraded to multisig without any program change.

**Rejected:** hard-coding a single pubkey, requiring a program upgrade to introduce multisig.

### 4. Per-(refinery, holder) ClaimReceipt PDA for replay protection

**Decision:** every successful claim creates a `ClaimReceipt` PDA seeded by `[refinery, holder, snapshot_index]`. Existence prevents re-claim within the same snapshot.

**Rejected:**
- *Bitset of claimers in the Snapshot account* — hard to size for variable holder counts
- *Tx signature dedup* — not adversary-resistant

Cost: holder pays rent for their receipt PDA (~0.0015 SOL). Recoverable via a future `close_claim_receipt` sweep instruction once the refinery is closed.

### 5. Pool drain accounting via per-claim deduction

**Decision:** `Refinery.pool_remaining` is decremented atomically on each `claim`. When pool would underflow, apply pool-empty strategy.

**Rejected:** pre-allocating each holder's share at snapshot time (would require either on-chain holder list or a separate "allocation" account per holder per snapshot).

### 6. Pro-rata via fixed-point basis points

**Decision:** all share math in `u64` basis points with explicit precision factor `1e6`. Avoids floating point. Fits inside `u128` intermediate computation.

```
share_amount = (balance_at_snapshot × pool_remaining × 1_000_000) / (total_eligible_balance × 1_000_000)
             = (balance_at_snapshot × pool_remaining) / total_eligible_balance     (in u128)
```

Rounding: floor. Final dust (≤ `holder_count` lamports of token) rests in escrow until refinery closes.

### 7. Token-2022 native support

**Decision:** all token operations use `anchor_spl::token_interface` (which abstracts SPL-Token + Token-2022). Transfer-fee extension is handled — pre-fee amounts written to `ClaimReceipt`, post-fee amounts received by holder.

**Rejected:** SPL-Token-only support — half of new-token launches are Token-2022.

### 8. Permanent operator binding

**Decision:** `Refinery.operator` is set at init and immutable. No transfer instruction.

**Rejected:** transferable operatorship — opens a market for operator role + griefing risk + audit complexity.

---

## Account Types

All accounts use Anchor's `#[account]` macro.

### `TreasuryConfig` (singleton, PDA)

The platform-level config. One per program. Initialized once via `init_treasury`.

```rust
#[account]
pub struct TreasuryConfig {
    pub bump: u8,
    pub admin: Pubkey,                  // can rotate other authorities
    pub snapshot_authority: Pubkey,     // sole signer for submit_snapshot
    pub pause_authority: Pubkey,        // Squads-derived PDA address
    pub fee_receiver_sol: Pubkey,       // SOL fee destination
    pub treasury_swap_pda: Pubkey,      // PDA that receives 1% deposit fees in tokens
    pub launch_fee_lamports: u64,       // default: 100_000_000 (0.1 SOL)
    pub claim_fee_lamports: u64,        // default: 1_000_000 (0.001 SOL)
    pub deposit_fee_bps: u16,           // default: 100 (= 1%)
    pub paused: bool,                   // platform-wide emergency pause
    pub refineries_launched_count: u64, // running counter
    pub created_at: i64,
    pub _reserved: [u8; 64],
}
```

PDA seeds: `[b"treasury_config"]`. Size: 276 bytes.

### `Refinery` (per refinery, PDA)

```rust
#[account]
pub struct Refinery {
    pub bump: u8,
    pub operator: Pubkey,               // immutable
    pub token_mint: Pubkey,
    pub escrow_ata: Pubkey,
    pub created_at: i64,
    pub claim_window_end: i64,          // 0 = open-ended
    pub last_state_change: i64,
    pub status: RefineryStatus,         // Pending | Active | OperatorPaused | Closed
    pub pool_initial: u64,
    pub pool_total_deposited: u64,
    pub pool_remaining: u64,
    pub pool_total_claimed: u64,
    pub holders_claimed: u32,
    pub epoch: u32,
    pub claim_rate_basis: u64,
    pub per_claim_cap_bps: u16,
    pub pool_empty_strategy: PoolEmptyStrategy,  // ProRata | Fcfs
    pub snapshot_strategy: SnapshotStrategy,     // AtLaunch | Hourly | Daily | Weekly | PerEpochOnly
    pub current_snapshot_index: u32,
    pub verified_deployer: bool,
    pub verified_cto: bool,
    pub freeze_acknowledged: bool,
    pub _reserved: [u8; 64],
}
```

PDA seeds: `[b"refinery", token_mint, operator]`. Size: 260 bytes.

**Why include `operator` in seeds?** Multiple refineries per mint are allowed. Adding the operator key disambiguates.

### `Snapshot` (per snapshot, PDA)

```rust
#[account]
pub struct Snapshot {
    pub bump: u8,
    pub refinery: Pubkey,
    pub epoch: u32,
    pub snapshot_index: u32,
    pub merkle_root: [u8; 32],
    pub total_eligible_balance: u64,
    pub holder_count: u32,
    pub taken_at: i64,
    pub submitted_by: Pubkey,
    pub _reserved: [u8; 32],
}
```

PDA seeds: `[b"snapshot", refinery, &snapshot_index.to_le_bytes()]`. Size: 173 bytes.

### `ClaimReceipt` (per claim, PDA)

```rust
#[account]
pub struct ClaimReceipt {
    pub bump: u8,
    pub refinery: Pubkey,
    pub holder: Pubkey,
    pub snapshot_index: u32,
    pub balance_at_snapshot: u64,
    pub amount_claimed: u64,            // pre-Token-2022-fee
    pub claimed_at: i64,
}
```

PDA seeds: `[b"claim", refinery, holder, &snapshot_index.to_le_bytes()]`. Size: 101 bytes.

Existence of the PDA = "this holder claimed this snapshot."

### `EscrowAuthority` (PDA, no on-chain account)

PDA seeds: `[b"escrow", refinery]`. Used only as a signer authority for CPIs that move tokens out of the escrow ATA.

### `TreasurySwap` (PDA, no on-chain account)

PDA seeds: `[b"treasury_swap"]`. Used as the owner of per-mint deposit-fee ATAs.

---

## Instructions

The program exposes **10 instructions** in the IDL.

### Operator-callable

1. **`init_refinery`** — launch a refinery (atomic launch + deposit + 1% fee + Refinery init)
2. **`deposit`** — top up an existing refinery's pool
3. **`withdraw`** — pull tokens from pool (lock-gated)
4. **`close_refinery`** — terminal close, refund remainder
5. **`toggle_operator_pause`** — toggle Active ↔ OperatorPaused
6. **`update_rate`** — advance epoch with new params

### Holder-callable

7. **`claim`** — claim pro-rata share against a specific snapshot (replay-safe via ClaimReceipt PDA)

### Admin-callable

8. **`init_treasury`** — one-time platform initialization (upgrade-authority gated)
9. **`submit_snapshot`** — snapshot authority publishes merkle root for a refinery
10. **`toggle_platform_pause`** — Squads-PDA-gated emergency pause

### Detailed instruction reference

For full account constraints, args, validations, and behaviors, see [07-program-reference.md](07-program-reference.md). This doc focuses on design rationale.

---

## Error Codes

```rust
#[error_code]
pub enum ErrorCode {
    Unauthorized = 6000,
    PlatformPaused = 6001,
    RefineryNotActive = 6002,
    RefineryClosed = 6003,
    RefineryAlreadyClosed = 6004,
    InvalidStateForToggle = 6005,
    PoolMustBePositive = 6006,
    ClaimCapOutOfRange = 6007,
    ClaimWindowTooShort = 6008,
    ClaimRateMustBePositive = 6009,
    DepositFeeTooHigh = 6010,
    InsufficientOperatorBalance = 6011,
    FreezeAuthorityActiveNotAcknowledged = 6012,
    DepositMustBePositive = 6013,
    WithdrawAmountInvalid = 6014,
    WithdrawalLocked = 6015,
    EpochMismatch = 6016,
    SnapshotMismatch = 6017,
    SnapshotStaleEpoch = 6018,
    EmptySnapshot = 6019,
    MerkleProofInvalid = 6020,
    BalanceMustBePositive = 6021,
    ClaimWindowClosed = 6022,
    PoolEmpty = 6023,
    UnsupportedToken2022Extension = 6024,    // reserved
    NumericalOverflow = 6025,
    PoolAccountingDrift = 6026,              // reserved
}
```

Codes 6024 and 6026 are reserved — declared but not yet returned. Earmarked for audit-hardening pass.

---

## Events (12 total)

The program emits 12 event types. The off-chain indexer subscribes via Helius webhooks.

| Event | Emitted by | Key fields |
|---|---|---|
| `TreasuryInitialized` | `init_treasury` | admin, authorities, fees |
| `RefineryLaunched` | `init_refinery` | refinery, operator, token_mint, pool_initial |
| `RefineryDeposit` | `deposit` | refinery, amount, fee, pool_remaining_after |
| `SnapshotSubmitted` | `submit_snapshot` | refinery, merkle_root, holder_count |
| `ClaimMade` | `claim` | refinery, holder, amount_claimed |
| `OperatorWithdraw` | `withdraw` | refinery, amount, pool_remaining_after |
| `RefineryClosed` | `close_refinery` | refinery, refund_amount |
| `RefineryPauseToggled` | `toggle_operator_pause` | refinery, now_paused |
| `PlatformPauseToggled` | `toggle_platform_pause` | now_paused |
| `EpochAdvanced` | `update_rate` | refinery, new_epoch |
| `VerifiedCtoAssigned` | TBD admin instruction | refinery, operator |
| `AuthorityRotated` | TBD admin instruction | which, previous, current |

---

## Security Invariants

These are the promises the program makes. The audit will verify each one.

### Token movement
- **I-1.** Tokens leave `escrow_ata` only via `claim`, `withdraw`, or `close_refinery`
- **I-2.** `claim` cannot transfer more than `min(pro_rata_share, per_claim_cap, pool_remaining)`
- **I-3.** `withdraw` cannot execute while claim window is open OR within 7 days after window close
- **I-4.** `close_refinery` transfers strictly the current escrow balance back to operator

### Replay protection
- **I-5.** A holder cannot claim twice for the same `(refinery, snapshot_index)` — ClaimReceipt PDA blocks re-init
- **I-6.** Snapshot indices are monotonic per refinery. Old snapshots cannot be re-used in newer epochs

### Authority
- **I-7.** Only `treasury_config.snapshot_authority` can call `submit_snapshot`
- **I-8.** Only `refinery.operator` can call `deposit`, `withdraw`, `close_refinery`, `toggle_operator_pause`, `update_rate`
- **I-9.** Only `treasury_config.pause_authority` can call `toggle_platform_pause`
- **I-10.** `refinery.operator` is set once at init and never mutated
- **I-19.** Only the program's upgrade authority can call `init_treasury` (one-shot, front-run-resistant)

### Math / overflow
- **I-11.** All multiplications that could exceed `u64::MAX` use `u128` intermediates and check the final cast
- **I-12.** Every subtraction on `pool_remaining` is `checked_sub`; underflow returns `NumericalOverflow`
- **I-13.** Per-claim share is floor-rounded; sum of all shares ≤ `pool_initial` regardless of rounding

### Configuration constraints
- **I-14.** `per_claim_cap_bps in [10, 10_000]` enforced at `init_refinery` and `update_rate`
- **I-15.** `claim_window_seconds == 0 OR >= 60` enforced
- **I-16.** `pool_initial > 0` enforced

### Token-2022 safety
- **I-17.** Any extension not in the v1 whitelist is rejected at `init_refinery` (TransferHook is the explicit reject)
- **I-18.** `transfer_checked` is used for all CPIs (validates decimals against on-chain mint)

---

## State Machine

```
              init_refinery
                   │
                   ▼
              [Active] ──────────── pause (operator) ────────► [OperatorPaused]
                 ▲ │                                                │
                 │ │ unpause                                        │
                 │ │                                                │
                 │ └──────── claim/deposit/snapshot ────────► (back to Active)
                 │ │
                 │ │ update_rate (epoch++)
                 │ │
                 │ ▼
              [Active w/ new epoch — claims need new snapshot]
                 │
                 │ close_refinery
                 ▼
              [Closed]   ◄── terminal, no transitions out
```

**Platform-pause is orthogonal:** when `treasury_config.paused == true`, all per-refinery actions except `close_refinery` are blocked, but no state transition on the refinery itself.

---

## Resolved Design Questions (Q-1 through Q-5)

Locked at user direction during design phase. Each implementation must follow the locked answer.

### Q-1: Combined-tx launch
**Decision:** `init_refinery` is one atomic transaction: launch fee + pool deposit + 1% deposit fee + Refinery account init. Atomic = no half-state. Operator signs once.

### Q-2: Merkle hash function
**Decision:** SHA-256 with domain separation. Leaf: `sha256(0x00 || holder_pubkey || balance_le_u64)`. Internal nodes: `sha256(0x01 || min(left, right) || max(left, right))`.

**Amendment history:** initially proposed as keccak256 (OpenZeppelin convention). Switched to SHA-256 because (a) it's the native Solana hash, (b) audit firms working on Solana programs are more familiar with SHA-256 merkles, (c) avoids pulling a separate keccak dependency.

### Q-3: Pool accounting
**Decision:** track `pool_remaining` in struct AND assert against escrow ATA balance after each state-changing instruction. Mismatch = `PoolAccountingDrift` error and tx fails.

### Q-4: Per-claim cap basis
**Decision:** per-claim cap applies to `pool_remaining` (recomputes per claim). Cap shrinks naturally with drain.

### Q-5: PDA retention after close
**Decision:** `Refinery` and `Snapshot` PDAs stay after close (historical record). `ClaimReceipt` PDAs also stay (rent paid by holder at claim time). Future `close_claim_receipt` sweep can recover rent.

---

## Out of Scope (Parking Lot)

Real future ideas. Do not build now.

- Permissionless / oracle-based snapshot submission (replace designated authority)
- `challenge_snapshot` instruction with slashing bond
- TransferHook extension support (Token-2022)
- `close_claim_receipt` sweep instruction (rent recovery)
- Cross-program-invocation Jupiter swap (auto-swap treasury on-chain)
- Operator transferability
- Refinery cloning ("re-deploy with same params, new mint")
- True pro-rata scale-down with retroactive adjustment
- ZK-proof of holdings (replace merkle)

---

## Document History

- **2026-05-09** — Initial program design. Mirrors protocol spec at locked version 2026-05-09. Q-1 through Q-5 resolved.
- **2026-05-10** — Reorganized as `06-program-architecture.md` in consolidated documentation set.
