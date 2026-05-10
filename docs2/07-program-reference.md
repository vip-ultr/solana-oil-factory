# 07 — Program Reference

**Audience:** Backend developers, frontend integrators, auditors
**Purpose:** Post-implementation snapshot — what's actually in the program right now

This is the **what's built** doc. For the design rationale, see [06-program-architecture.md](06-program-architecture.md). For frontend integration, see [08-frontend-integration.md](08-frontend-integration.md).

**Snapshot as of:** 2026-05-10, commit `12d0543`
**Status:** Phase 1 instruction set complete. Tests + devnet deploy pending.

---

## Repository

| Field | Value |
|---|---|
| Repo | `vip-ultr/sol-oilfactory-program` |
| Visibility | Private |
| Default branch | `main` |
| Local path (WSL) | `~/dev/sol-oilfactory-program` |
| Remote URL | `https://github.com/vip-ultr/sol-oilfactory-program.git` |
| Sibling repo | `vip-ultr/solana-oil-factory` (frontend) |

### Commit history

```
12d0543  feat(program): implement withdraw + close + pause + update_rate
cf0faf0  feat(program): implement claim (merkle-verified, replay-safe)
3abd71a  feat(program): implement submit_snapshot (authority-gated)
1cf50dc  feat(program): implement deposit (operator pool top-up)
30dc5f0  feat(program): implement init_refinery (atomic launch + deposit)
1abd56b  feat(program): implement init_treasury (upgrade-authority gated)
81b81dc  feat(program): scaffold module structure + program design doc
18cf286  chore: initial scaffold
```

---

## Build Environment

| Tool | Version |
|---|---|
| Solana CLI / Agave | 3.1.15 |
| Solana platform-tools | v1.52 |
| Rust toolchain | stable (managed by `rust-toolchain.toml`) |
| Anchor | 0.32.1 |
| Node | 20.18.1 |
| OS | Ubuntu 22.04 LTS in WSL2 |

### Cargo dependencies

```toml
[dependencies]
anchor-lang = { version = "0.32.1", features = ["init-if-needed"] }
anchor-spl  = { version = "0.32.1", features = ["token", "token_2022", "associated_token"] }
solana-sha256-hasher = "2.3"
```

### Build commands

```bash
# Build BPF program + IDL
anchor build

# Run unit tests
cargo test --lib --manifest-path programs/refinery/Cargo.toml

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Sync program ID
anchor keys sync
```

### Last verified build
- Build: clean in 32.46s
- Tests: clean in 56.10s
- All 14 unit tests pass

---

## Module Structure

```
programs/refinery/
├── Cargo.toml
└── src/
    ├── lib.rs                       Entry point — `#[program]` mod
    ├── constants.rs                 PDA seeds, fee defaults, validation bounds, BPF Loader Upgradeable ID, merkle prefixes
    ├── errors.rs                    27 typed `ErrorCode` variants
    ├── events.rs                    12 `#[event]` types
    ├── state/
    │   ├── treasury_config.rs       Singleton platform config (276 bytes)
    │   ├── refinery.rs              Per-refinery account + 3 enums (260 bytes)
    │   ├── snapshot.rs              Per-snapshot merkle root (173 bytes)
    │   └── claim_receipt.rs         Replay protection PDA (101 bytes)
    ├── instructions/
    │   ├── init_treasury.rs         Singleton init, upgrade-authority gated
    │   ├── init_refinery.rs         Atomic launch + deposit + fee
    │   ├── deposit.rs               Operator pool top-up
    │   ├── submit_snapshot.rs       Snapshot authority publishes merkle root
    │   ├── claim.rs                 Holder claim with merkle proof
    │   ├── withdraw.rs              Operator pulls from pool (lock-gated)
    │   ├── close_refinery.rs        Terminal close
    │   ├── pause.rs                 toggle_operator_pause + toggle_platform_pause
    │   └── update_rate.rs           Operator advances epoch
    └── utils/
        ├── math.rs                  compute_pro_rata_share + per_claim_cap + deposit_fee
        └── merkle.rs                hash_leaf + verify_proof
```

Total source files: **17 .rs files** + 1 `Cargo.toml`.
Total Rust LoC (excluding tests): roughly **1,700 lines**.

---

## Constants (constants.rs)

### BPF Loader Upgradeable

```rust
pub const BPF_LOADER_UPGRADEABLE_ID: Pubkey =
    pubkey!("BPFLoaderUpgradeab1e11111111111111111111111");
```

Hardcoded because Anchor 0.32's slimmed `solana_program` re-export doesn't include `bpf_loader_upgradeable`.

### PDA seeds

```rust
pub const SEED_TREASURY_CONFIG: &[u8] = b"treasury_config";
pub const SEED_REFINERY: &[u8]        = b"refinery";
pub const SEED_ESCROW: &[u8]          = b"escrow";
pub const SEED_SNAPSHOT: &[u8]        = b"snapshot";
pub const SEED_CLAIM: &[u8]           = b"claim";
pub const SEED_TREASURY_SWAP: &[u8]   = b"treasury_swap";
```

### Fee schedule defaults

```rust
pub const DEFAULT_LAUNCH_FEE_LAMPORTS: u64 = 100_000_000; // 0.1 SOL
pub const DEFAULT_CLAIM_FEE_LAMPORTS: u64  = 1_000_000;   // 0.001 SOL
pub const DEFAULT_DEPOSIT_FEE_BPS: u16     = 100;         // 1%
pub const MAX_DEPOSIT_FEE_BPS: u16         = 1_000;       // 10% (admin sanity cap)
```

### Per-claim cap range

```rust
pub const MIN_PER_CLAIM_CAP_BPS: u16 = 10;     // 0.1%
pub const MAX_PER_CLAIM_CAP_BPS: u16 = 10_000; // 100%
```

### Claim window + cooldown

```rust
pub const MIN_CLAIM_WINDOW_SECONDS: i64       = 60;          // 1 minute
pub const WITHDRAWAL_COOLDOWN_SECONDS: i64    = 7 * 86_400;  // 7 days
```

### Merkle domain separators

```rust
pub const MERKLE_LEAF_PREFIX: u8 = 0x00;
pub const MERKLE_NODE_PREFIX: u8 = 0x01;
```

---

## Instruction Reference (Detailed)

For each: signature, accounts, args, validations, behavior, errors, events.

### `init_treasury`

**Purpose:** one-time platform initialization.

**Signature:** `pub fn init_treasury(ctx: Context<InitTreasury>, args: InitTreasuryArgs) -> Result<()>`

**Args:**
```rust
pub struct InitTreasuryArgs {
    pub snapshot_authority: Pubkey,
    pub pause_authority: Pubkey,
    pub fee_receiver_sol: Pubkey,
    pub launch_fee_lamports: u64,
    pub claim_fee_lamports: u64,
    pub deposit_fee_bps: u16,
}
```

**Authorization:** signer must equal program's BPF Loader Upgradeable upgrade authority.

**Validations:** `args.deposit_fee_bps <= MAX_DEPOSIT_FEE_BPS`

**Errors:** `Unauthorized`, `DepositFeeTooHigh`

**Events:** `TreasuryInitialized`

### `init_refinery`

**Purpose:** operator launches a refinery for a given mint. Atomic: pays launch fee + transfers pool + transfers 1% deposit fee + initializes Refinery account in one transaction.

**Signature:** `pub fn init_refinery(ctx: Context<InitRefinery>, args: InitRefineryArgs) -> Result<()>`

**Args:**
```rust
pub struct InitRefineryArgs {
    pub pool_initial: u64,
    pub claim_rate_basis: u64,
    pub per_claim_cap_bps: u16,
    pub pool_empty_strategy: PoolEmptyStrategy,
    pub snapshot_strategy: SnapshotStrategy,
    pub claim_window_seconds: i64,        // 0 = open-ended
    pub freeze_acknowledged: bool,
}
```

**Validations:**
- `!treasury_config.paused`
- `args.pool_initial > 0`
- `args.claim_rate_basis > 0`
- `args.per_claim_cap_bps in [10, 10_000]`
- `args.claim_window_seconds == 0 || >= 60`
- `operator_ata.amount >= pool_initial + deposit_fee`
- If freeze authority active: `args.freeze_acknowledged == true`

**Behavior:**
1. Compute `verified_deployer = (mint.mint_authority == Some(operator.key()))` from on-chain state
2. SOL transfer `operator → fee_receiver_sol` for `launch_fee_lamports`
3. `transfer_checked` `operator_ata → escrow_ata` for `pool_initial`
4. `transfer_checked` `operator_ata → treasury_swap_ata` for `deposit_fee`
5. Initialize Refinery, status = Active, all distribution config from args
6. Increment `treasury_config.refineries_launched_count`
7. Emit `RefineryLaunched`

**Errors:** `PlatformPaused`, `PoolMustBePositive`, `ClaimRateMustBePositive`, `ClaimCapOutOfRange`, `ClaimWindowTooShort`, `InsufficientOperatorBalance`, `FreezeAuthorityActiveNotAcknowledged`, `NumericalOverflow`, `Unauthorized`

### `deposit`

**Purpose:** operator tops up an existing refinery's pool. Same 1% fee semantics as launch.

**Args:** `DepositArgs { amount: u64 }`

**Validations:**
- `!treasury_config.paused`
- `args.amount > 0`
- `signer == refinery.operator`
- `refinery.status in {Active, OperatorPaused}` (Closed rejected)
- `operator_ata.amount >= amount + deposit_fee`

**Behavior:** `transfer_checked` operator → escrow + operator → treasury_swap, update accounting, emit `RefineryDeposit`.

**Errors:** `PlatformPaused`, `DepositMustBePositive`, `Unauthorized`, `RefineryClosed`, `InsufficientOperatorBalance`, `NumericalOverflow`

### `submit_snapshot`

**Purpose:** platform snapshot authority publishes the merkle root for one refinery's eligible-holder set.

**Args:**
```rust
pub struct SubmitSnapshotArgs {
    pub merkle_root: [u8; 32],
    pub total_eligible_balance: u64,
    pub holder_count: u32,
    pub epoch: u32,             // must match refinery.epoch
}
```

**Validations:**
- `!treasury_config.paused`
- `treasury_config.snapshot_authority == snapshot_authority.key()`
- `refinery.status == Active`
- `args.epoch == refinery.epoch`
- `args.holder_count > 0`
- `args.total_eligible_balance > 0`

**Behavior:** increment `current_snapshot_index`, init Snapshot PDA, emit `SnapshotSubmitted`.

**Errors:** `Unauthorized`, `PlatformPaused`, `RefineryNotActive`, `EpochMismatch`, `EmptySnapshot`, `NumericalOverflow`

### `claim`

**Purpose:** holder claims their pro-rata share against a specific snapshot. Verifies merkle proof, applies per-claim cap, transfers tokens, creates ClaimReceipt PDA.

**Args:**
```rust
pub struct ClaimArgs {
    pub snapshot_index: u32,
    pub balance_at_snapshot: u64,
    pub merkle_proof: Vec<[u8; 32]>,
}
```

**Validations:**
- `!treasury_config.paused`
- `args.balance_at_snapshot > 0`
- `refinery.status == Active`
- `refinery.pool_remaining > 0`
- `refinery.claim_window_end == 0 || now <= refinery.claim_window_end`
- `snapshot.refinery == refinery.key()`
- `snapshot.epoch == refinery.epoch`
- Merkle proof verifies
- ClaimReceipt PDA does not already exist (init collision blocks re-claim)
- `share_capped > 0`

**Share math:**
```
raw_share    = balance_at_snapshot × pool_remaining / total_eligible_balance
per_claim    = pool_remaining × per_claim_cap_bps / 10_000
share_capped = min(raw_share, per_claim, pool_remaining)
```

**Behavior:**
1. SOL transfer `holder → fee_receiver_sol` for `claim_fee_lamports`
2. `transfer_checked` `escrow_ata → holder_ata` for `share_capped` (signed by escrow_authority PDA)
3. Update Refinery accounting (pool_remaining decreases, totals increase)
4. Initialize ClaimReceipt with `amount_claimed = share_capped` (pre-Token-2022-fee)
5. Emit `ClaimMade`

**Errors:** `PlatformPaused`, `BalanceMustBePositive`, `RefineryNotActive`, `PoolEmpty`, `ClaimWindowClosed`, `MerkleProofInvalid`, `SnapshotMismatch`, `SnapshotStaleEpoch`, `Unauthorized`, `NumericalOverflow`

### `withdraw`

**Purpose:** operator pulls tokens from the pool. Lock-gated.

**Args:** `WithdrawArgs { amount: u64 }`

**Validations:**
- `!treasury_config.paused`
- `args.amount > 0` and `<= refinery.pool_remaining`
- `signer == refinery.operator`
- `refinery.status in {Active, OperatorPaused}`
- `refinery.claim_window_end != 0` (open-ended cannot withdraw — must close first)
- `now >= refinery.claim_window_end + 7 * 86_400` (window closed + cooldown)

**Behavior:** `transfer_checked` escrow → operator (signed by escrow_authority PDA), update accounting, emit `OperatorWithdraw`.

**Errors:** `PlatformPaused`, `WithdrawAmountInvalid`, `Unauthorized`, `RefineryClosed`, `WithdrawalLocked`, `NumericalOverflow`

### `close_refinery`

**Purpose:** operator closes the refinery permanently. Refunds remaining pool. Terminal.

**Args:** none

**Validations:**
- `signer == refinery.operator`
- `refinery.status != Closed`
- **No cooldown / claim-window check** — operator can close at any time

**Behavior:** transfer `pool_remaining` from escrow → operator, set status to Closed, emit `RefineryClosed`.

**Errors:** `Unauthorized`, `RefineryAlreadyClosed`

### `toggle_operator_pause`

**Purpose:** operator-scope pause toggle. Flips one refinery between Active and OperatorPaused.

**Validations:**
- `signer == refinery.operator`
- `refinery.status in {Active, OperatorPaused}` (Closed rejected)

**Behavior:** flip status, emit `RefineryPauseToggled`.

**Errors:** `Unauthorized`, `InvalidStateForToggle`

### `toggle_platform_pause`

**Purpose:** platform-wide emergency pause. Flips `treasury_config.paused`. Squads-PDA gated.

**Validations:** `treasury_config.pause_authority == pause_authority.key()`

**Behavior:** flip `paused`, emit `PlatformPauseToggled`.

**Effect when paused:** `init_refinery`, `deposit`, `submit_snapshot`, `claim`, `withdraw` all return `PlatformPaused`. `close_refinery` and the two pause toggles remain enabled.

**Errors:** `Unauthorized`

### `update_rate`

**Purpose:** operator advances the refinery to a new epoch with updated distribution params.

**Args:**
```rust
pub struct UpdateRateArgs {
    pub new_claim_rate_basis: Option<u64>,
    pub new_per_claim_cap_bps: Option<u16>,
    pub new_pool_empty_strategy: Option<PoolEmptyStrategy>,
    pub new_snapshot_strategy: Option<SnapshotStrategy>,
    pub new_claim_window_extension_seconds: Option<i64>,
}
```

**Validations:**
- `signer == refinery.operator`
- `refinery.status in {Active, OperatorPaused}`
- For each `Some(_)` value: same range checks as `init_refinery`

**Behavior:** apply each `Some(_)` field, increment epoch, emit `EpochAdvanced`.

**Errors:** `Unauthorized`, `RefineryClosed`, plus validation errors

---

## Token-2022 Handling

The program uses `anchor_spl::token_interface` throughout, which dispatches to either SPL-Token or Token-2022 based on the mint's program owner.

### Supported Token-2022 extensions

- **TransferFee** — fee deducted automatically. Pre-fee amount in `ClaimReceipt.amount_claimed`; post-fee amount received by holder.
- **DefaultAccountState** — irrelevant to claim.
- **MintCloseAuthority** — irrelevant.
- **PermanentDelegate** — flagged in launch UI; no program-side enforcement.

### Risk-flagged but allowed

- **FreezeAuthority active** — operator must set `freeze_acknowledged = true`. If holder's ATA is frozen at claim time, CPI fails; holder retries after thaw.

### Earmarked for future hardening

- **TransferHook** — currently NOT whitelisted. Error `UnsupportedToken2022Extension` (6024) reserved but not yet returned. Audit-hardening pass will add explicit extension-whitelist checks.

### CPI pattern

```rust
let cpi_ctx = CpiContext::new_with_signer(
    ctx.accounts.token_program.to_account_info(),
    TransferChecked { from, mint, to, authority },
    signer_seeds,
);
token_interface::transfer_checked(cpi_ctx, amount, token_mint.decimals)?;
```

---

## Current Test Coverage

### Unit tests (14 passing)

```
test test_id ... ok                                      ← Anchor auto-test
test utils::math::tests::pro_rata_basic ... ok
test utils::math::tests::pro_rata_floors ... ok
test utils::math::tests::pro_rata_huge ... ok
test utils::math::tests::per_claim_cap_basic ... ok
test utils::math::tests::per_claim_cap_full ... ok
test utils::math::tests::deposit_fee_default_one_percent ... ok
test utils::merkle::tests::leaf_is_deterministic ... ok
test utils::merkle::tests::leaf_changes_on_balance ... ok
test utils::merkle::tests::node_is_sort_invariant ... ok
test utils::merkle::tests::single_leaf_tree_proof_is_empty ... ok
test utils::merkle::tests::two_leaf_tree_proof_verifies ... ok
test utils::merkle::tests::bad_proof_fails ... ok
test utils::merkle::tests::four_leaf_tree_proof_verifies ... ok

test result: ok. 14 passed; 0 failed; 0 ignored
```

### Integration tests

**None yet.** `tests/refinery.ts` is a placeholder that only verifies the program ID matches.

Real per-instruction tests land in #38 (LiteSVM) and #39 (Surfpool fork).

### Coverage gap

| Instruction | Unit tests | Integration tests | Real-validator tests |
|---|---|---|---|
| `init_treasury` | n/a | none | none |
| `init_refinery` | indirect | none | none |
| `deposit` | indirect | none | none |
| `submit_snapshot` | n/a | none | none |
| `claim` | direct (math + merkle) | none | none |
| `withdraw` | n/a | none | none |
| `close_refinery` | n/a | none | none |
| `toggle_operator_pause` | n/a | none | none |
| `toggle_platform_pause` | n/a | none | none |
| `update_rate` | n/a | none | none |

---

## What's NOT Yet Built (Phase 1 Remaining Work)

### #38 — LiteSVM unit tests

**Scope:** Rust-side integration tests against in-process Solana validator. For every instruction:
1. Happy path
2. Each authorization check (wrong signer fails)
3. Each constraint check (invalid args fail with specific error)
4. Boundary values (`0`, `u64::MAX`, exactly cap, exactly remaining)
5. Replay scenarios

**Specific gnarly cases:**
- `claim` against snapshot with overflow risk in u128 path
- `claim` for holder whose share rounds to zero (returns `BalanceMustBePositive`)
- `withdraw` exactly at boundary vs 1s before
- `update_rate` invalidating outstanding snapshot
- Token-2022 with TransferFee — verify accounting handles fee deduction
- Race condition on duplicate refinery init for same mint

**Estimated effort:** 3-5 days.

### #39 — Surfpool fork tests

**Scope:** integration tests forking real devnet state.
- Real Helius RPC behavior
- Real Token-2022 mint with TransferFee
- Real Jupiter aggregator route (off-chain swap simulated)

**Estimated effort:** 2 days.

### #40 — Devnet deploy + IDL publish

**Scope:**
- `solana airdrop 5 --url devnet` to deploy keypair
- `anchor deploy --provider.cluster devnet`
- `anchor idl init` to publish on-chain
- Smoke-test all 10 instructions via TS scripts

**Estimated effort:** half day.

### After Phase 1 (audit gating)

NOT v1 program scope but mainnet-launch gates:
1. Audit complete (OtterSec / Ackee / Sec3 / Neodyme — $30-80k budget)
2. Bug bounty live on Immunefi at $50k+ tier
3. Squads multisig configured for upgrade authority + pause authority
4. Lawyer review of ToS

---

## Trust Model (Current Implementation)

| Authority | Held by | Set at | Mutable via | Risk if compromised |
|---|---|---|---|---|
| Program upgrade authority | Deployer keypair (eventually Squads multisig) | Program deploy | `solana program set-upgrade-authority` | Full control — can upgrade program |
| `treasury_config.admin` | Initial deployer | `init_treasury` (gated on upgrade authority) | `rotate_authority` (TBD) | Could rotate other authorities |
| `treasury_config.snapshot_authority` | Off-chain indexer keypair | `init_treasury` | `rotate_authority` (TBD) | Could submit fraudulent snapshots; mitigated by reconstructibility |
| `treasury_config.pause_authority` | Squads vault | `init_treasury` | `rotate_authority` (TBD) | Could pause/unpause; cannot drain funds |
| `refinery.operator` | Per-refinery, set by caller | `init_refinery` | **Never** | Could close refinery prematurely |
| Holder authority | Anyone in merkle tree | `submit_snapshot` | Merkle inclusion | None — proof verification + replay protection |

---

## Open Issues / Known Limitations

### Resolved (locked in design)
- Q-1 LOCKED: combined-tx `init_refinery`
- Q-2 LOCKED: SHA-256 merkle (amended from initial keccak proposal)
- Q-3 LOCKED: track `pool_remaining` in struct + assert against escrow
- Q-4 LOCKED: per-claim cap basis = `pool_remaining`
- Q-5 LOCKED: retain Refinery + Snapshot PDAs after close

### Still open

- **`rotate_authority` instruction** referenced but not yet implemented
- **`set_verified_cto` instruction** sketched but not yet implemented
- **Q-3 escrow assertion** documented but not yet enforced in code (audit-hardening item)
- **TransferHook extension whitelist check** not yet returned (error code reserved)
- **Mint authority renouncement check** — currently only flags risk via `verified_deployer` flag

---

## References

### In this repo
- `programs/refinery/src/` — Rust source
- `target/idl/refinery.json` — Generated IDL
- `target/deploy/refinery.so` — Compiled BPF binary
- `target/deploy/refinery-keypair.json` — Program keypair (gitignored)

### Sibling repo (`vip-ultr/solana-oil-factory`)
- Frontend code + this documentation set

### External
- Anchor docs: https://www.anchor-lang.com/docs
- Solana docs: https://solana.com/docs
- Token-2022 spec: https://spl.solana.com/token-2022
- Squads protocol: https://docs.squads.so

---

## Document History

- **2026-05-10** — Initial reference. Snapshot at commit `12d0543`. Phase 1 instruction set complete; tests + deploy pending. Reorganized as `07-program-reference.md` in consolidated documentation set.
