# 08 — Frontend Integration

**Audience:** Frontend developers
**Purpose:** How the frontend connects to the Anchor program, the indexer, and external services

This is the **how to integrate** doc. For program design, see [06-program-architecture.md](06-program-architecture.md). For program reference, see [07-program-reference.md](07-program-reference.md).

---

## The Three-Layer Stack

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: FRONTEND  (vip-ultr/solana-oil-factory)           │
│  Next.js 15 + Tailwind v4 + @solana/react-hooks             │
│  Hosted on Vercel Hobby                                     │
└──────────────────┬──────────────────────────────────────────┘
                   │
       ┌───────────┼───────────────────┐
       ▼           ▼                   ▼
┌──────────┐  ┌─────────────┐  ┌────────────────────────────┐
│ Anchor   │  │ Off-chain   │  │ External (3rd-party)       │
│ program  │  │ indexer     │  │  - Helius DAS API          │
│ (this    │  │ Supabase    │  │  - RugCheck                │
│  repo)   │  │  Edge Fns   │  │  - Jupiter Tokens V2       │
│          │  │  + pg_cron  │  │  - Solscan / Birdeye       │
└──────────┘  └─────────────┘  └────────────────────────────┘
   (live)      (Phase 2)        (live)
```

| Layer | Purpose | Status today |
|---|---|---|
| Anchor program | All on-chain state + auth + token movement | Implemented (devnet deploy = task #40) |
| Off-chain indexer | Read-side aggregation, merkle proofs, leaderboards | **Not yet built** — Phase 2 (4 weeks) |
| External services | Token metadata, safety checks, prices | Live |

**For the frontend right now:** mock against the shapes in this document. Anchor program will be deployed to devnet first; indexer is a separate Phase 2 effort.

---

## Quick-Start Setup

### Install client deps

```bash
cd ~/path/to/solana-oil-factory
npm install @coral-xyz/anchor@0.32.1
# Already installed:
# @solana/web3.js, @solana/react-hooks, @solana/spl-token, @supabase/supabase-js
```

### Get the IDL into the frontend

**Option A (simple, manual):** copy the JSON on each program change.
```bash
cp ~/dev/sol-oilfactory-program/target/idl/refinery.json \
   ~/path/to/solana-oil-factory/lib/refinery-idl.json
cp ~/dev/sol-oilfactory-program/target/types/refinery.ts \
   ~/path/to/solana-oil-factory/lib/refinery-types.ts
```

**Option B (production, automated):** publish a TypeScript client via Codama. Recommended post-mainnet.

### Environment variables

```env
# RPC — same Helius key as existing frontend
HELIUS_API_KEY=<your-helius-key>

# Cluster (devnet for v1; mainnet-beta after audit)
NEXT_PUBLIC_SOLANA_CLUSTER=devnet
NEXT_PUBLIC_REFINERY_PROGRAM_ID=2tPLLPQeLLNL4UDBbeagSUAABJcB3fHGTJaLGEzrx3rE

# Supabase (for the indexer — once deployed)
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role>

# RugCheck (server-side proxy)
RUGCHECK_API_KEY=<key>

# Existing
BAGS_API_KEY=<existing>

# ToS version pin
NEXT_PUBLIC_TOS_VERSION_HASH=<computed-from-current-tos>
```

### Anchor client construction

```ts
// lib/anchor-program.ts
import { AnchorProvider, Program, web3 } from '@coral-xyz/anchor';
import idl from './refinery-idl.json';
import type { Refinery } from './refinery-types';

export const REFINERY_PROGRAM_ID = new web3.PublicKey(
  process.env.NEXT_PUBLIC_REFINERY_PROGRAM_ID!,
);

export function getProgram(provider: AnchorProvider): Program<Refinery> {
  return new Program<Refinery>(idl as Refinery, provider);
}
```

---

## Reading On-Chain State

### PDA derivations (frontend computes these)

```ts
import { PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer';

const PROGRAM_ID = new PublicKey('2tPLLPQeLLNL4UDBbeagSUAABJcB3fHGTJaLGEzrx3rE');

const SEED_TREASURY_CONFIG = Buffer.from('treasury_config');
const SEED_REFINERY        = Buffer.from('refinery');
const SEED_ESCROW          = Buffer.from('escrow');
const SEED_SNAPSHOT        = Buffer.from('snapshot');
const SEED_CLAIM           = Buffer.from('claim');
const SEED_TREASURY_SWAP   = Buffer.from('treasury_swap');

export const findTreasuryConfigPda = () =>
  PublicKey.findProgramAddressSync([SEED_TREASURY_CONFIG], PROGRAM_ID);

export const findRefineryPda = (mint: PublicKey, operator: PublicKey) =>
  PublicKey.findProgramAddressSync(
    [SEED_REFINERY, mint.toBuffer(), operator.toBuffer()],
    PROGRAM_ID,
  );

export const findEscrowAuthorityPda = (refinery: PublicKey) =>
  PublicKey.findProgramAddressSync([SEED_ESCROW, refinery.toBuffer()], PROGRAM_ID);

export const findSnapshotPda = (refinery: PublicKey, snapshotIndex: number) => {
  const idxBuf = Buffer.alloc(4);
  idxBuf.writeUInt32LE(snapshotIndex, 0);
  return PublicKey.findProgramAddressSync(
    [SEED_SNAPSHOT, refinery.toBuffer(), idxBuf],
    PROGRAM_ID,
  );
};

export const findClaimReceiptPda = (
  refinery: PublicKey,
  holder: PublicKey,
  snapshotIndex: number,
) => {
  const idxBuf = Buffer.alloc(4);
  idxBuf.writeUInt32LE(snapshotIndex, 0);
  return PublicKey.findProgramAddressSync(
    [SEED_CLAIM, refinery.toBuffer(), holder.toBuffer(), idxBuf],
    PROGRAM_ID,
  );
};

export const findTreasurySwapPda = () =>
  PublicKey.findProgramAddressSync([SEED_TREASURY_SWAP], PROGRAM_ID);
```

### Fetch TreasuryConfig (singleton)

```ts
const [treasuryPda] = findTreasuryConfigPda();
const cfg = await program.account.treasuryConfig.fetch(treasuryPda);

// Use for: fee schedule display, platform-pause check
```

### Fetch Refinery

```ts
const [refineryPda] = findRefineryPda(tokenMint, operator);
const refinery = await program.account.refinery.fetch(refineryPda);

// Status helper:
function refineryStatus(r): 'pending' | 'active' | 'operatorPaused' | 'closed' {
  if ('active' in r.status) return 'active';
  if ('pending' in r.status) return 'pending';
  if ('operatorPaused' in r.status) return 'operatorPaused';
  return 'closed';
}
```

### Fetch Snapshot

```ts
const [snapshotPda] = findSnapshotPda(refineryPda, refinery.currentSnapshotIndex);
const snap = await program.account.snapshot.fetch(snapshotPda);

// To list ALL snapshots: use program.account.snapshot.all() with memcmp filter
// or loop from 1 to refinery.currentSnapshotIndex.
```

### Check claim eligibility

```ts
const [receiptPda] = findClaimReceiptPda(refineryPda, holder, snapshotIndex);

try {
  const receipt = await program.account.claimReceipt.fetch(receiptPda);
  // Receipt exists → already claimed
} catch (err) {
  // Account doesn't exist → not yet claimed
}
```

### List all refineries (directory page)

```ts
const allRefineries = await program.account.refinery.all();

// With memcmp filters:
const ACTIVE_DISCRIMINATOR_OFFSET = 8 + 1 + 32 + 32 + 32 + 8 + 8 + 8; // = 129
const ACTIVE_BYTE = Buffer.from([1]); // RefineryStatus::Active

const active = await program.account.refinery.all([
  { memcmp: { offset: ACTIVE_DISCRIMINATOR_OFFSET, bytes: bs58.encode(ACTIVE_BYTE) } },
]);
```

> **Performance note:** `getProgramAccounts` is rate-limited and slow on free Helius tiers. The frontend should cache refinery lists in Supabase (indexer's job) and only hit RPC for individual reads.

---

## Reading Off-Chain (External APIs)

### Helius DAS — wallet token holdings

For the "auto-detect eligibility" feature on holder connect:

```ts
const response = await fetch('/api/das/search-assets', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    ownerAddress: wallet.toBase58(),
    tokenType: 'fungible',
    limit: 1000,
  }),
});
const { items } = await response.json();
```

### Helius DAS — mint metadata

When operator pastes a mint address:

```ts
const response = await fetch('/api/das/get-asset', {
  method: 'POST',
  body: JSON.stringify({ id: mintAddress }),
});
const asset = await response.json();
// asset.content.metadata.name, .symbol
// asset.content.files[0].uri (icon URL)
// asset.token_info.decimals, .supply, .price_info
// asset.authorities (mint, freeze)
// asset.mint_extensions (Token-2022 extensions if applicable)
```

### RugCheck

```ts
const response = await fetch(`/api/rugcheck/summary?mint=${mintAddress}`);
const safety = await response.json();
// safety.score, safety.risks
```

**Frontend logic:** if `safety.risks` contains any `danger` or `warning`, block launch.

### Jupiter (verified status)

```ts
const response = await fetch(`https://lite-api.jup.ag/tokens/v2/search?query=${mintAddress}`);
const [token] = await response.json();
// token.tags includes 'verified' if Jupiter-verified
```

---

## Writing On-Chain (Instructions)

### Common patterns

```ts
import { web3, BN } from '@coral-xyz/anchor';

const tx = await program.methods
  .someInstruction(args)
  .accounts({ /* required accounts */ })
  .rpc({ commitment: 'confirmed' });

// For multi-instruction or manual control:
const ix = await program.methods.someInstruction(args).accounts({...}).instruction();
const tx = new web3.Transaction().add(ix);
const sig = await provider.sendAndConfirm(tx);
```

### Detecting token program for a mint

```ts
async function getTokenProgramForMint(mint: PublicKey): Promise<PublicKey> {
  const info = await connection.getAccountInfo(mint);
  return info!.owner; // either TOKEN_PROGRAM_ID or TOKEN_2022_PROGRAM_ID
}
```

### `init_refinery` (operator launches)

```ts
async function launchRefinery({
  mint, poolInitial, claimRateBasis, perClaimCapBps,
  poolEmptyStrategy, snapshotStrategy, claimWindowSeconds, freezeAcknowledged,
}: LaunchRefineryArgs): Promise<{ tx: string; refinery: PublicKey }> {
  const operator = provider.wallet.publicKey;
  const tokenProgram = await getTokenProgramForMint(mint);

  const [treasuryConfig] = findTreasuryConfigPda();
  const [refinery]       = findRefineryPda(mint, operator);
  const [escrowAuthority] = findEscrowAuthorityPda(refinery);
  const [treasurySwapPda] = findTreasurySwapPda();

  const operatorAta       = getAssociatedTokenAddressSync(mint, operator, true, tokenProgram);
  const escrowAta         = getAssociatedTokenAddressSync(mint, escrowAuthority, true, tokenProgram);
  const treasurySwapAta   = getAssociatedTokenAddressSync(mint, treasurySwapPda, true, tokenProgram);

  const cfg = await program.account.treasuryConfig.fetch(treasuryConfig);

  const tx = await program.methods
    .initRefinery({
      poolInitial, claimRateBasis, perClaimCapBps,
      poolEmptyStrategy: { [poolEmptyStrategy]: {} } as any,
      snapshotStrategy: { [snapshotStrategy]: {} } as any,
      claimWindowSeconds, freezeAcknowledged,
    })
    .accounts({
      operator,
      tokenMint: mint,
      operatorAta,
      treasuryConfig,
      feeReceiverSol: cfg.feeReceiverSol,
      treasurySwapPda,
      treasurySwapAta,
      refinery,
      escrowAuthority,
      escrowAta,
      tokenProgram,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc({ commitment: 'confirmed' });

  return { tx, refinery };
}
```

### `claim` (holder claims)

```ts
async function claim({
  refineryPda,
  snapshotIndex,
  balanceAtSnapshot,
  merkleProof,
}: ClaimArgs): Promise<string> {
  const refinery = await program.account.refinery.fetch(refineryPda);
  const holder = provider.wallet.publicKey;
  const tokenProgram = await getTokenProgramForMint(refinery.tokenMint);

  const [treasuryConfig] = findTreasuryConfigPda();
  const [snapshotPda]    = findSnapshotPda(refineryPda, snapshotIndex);
  const [escrowAuthority] = findEscrowAuthorityPda(refineryPda);
  const [claimReceipt]   = findClaimReceiptPda(refineryPda, holder, snapshotIndex);

  const cfg = await program.account.treasuryConfig.fetch(treasuryConfig);
  const holderAta = getAssociatedTokenAddressSync(refinery.tokenMint, holder, true, tokenProgram);

  return program.methods
    .claim({
      snapshotIndex,
      balanceAtSnapshot,
      merkleProof: merkleProof.map(p => Array.from(p)),
    })
    .accounts({
      holder,
      tokenMint: refinery.tokenMint,
      holderAta,
      treasuryConfig,
      feeReceiverSol: cfg.feeReceiverSol,
      refinery: refineryPda,
      snapshot: snapshotPda,
      escrowAta: refinery.escrowAta,
      escrowAuthority,
      claimReceipt,
      tokenProgram,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc({ commitment: 'confirmed' });
}
```

**Pre-flight UX:** before calling `claim`, the frontend should:
1. Verify holder's ATA exists. If not, include `createAssociatedTokenAccountInstruction` in the same tx.
2. Check `claim_receipt` PDA does NOT exist (else show "Already claimed" state).
3. Compute the projected share locally so the user sees the amount before signing.

### Other instructions

For `deposit`, `withdraw`, `close_refinery`, `toggle_operator_pause`, `update_rate` — same pattern as above. See full code examples in the original `frontend-integration.md` source doc.

---

## Events (Live UI)

### Subscribe directly via Anchor

```ts
const listener = program.addEventListener('ClaimMade', (event, slot) => {
  appendToFeed(event);
});

// Cleanup:
return () => program.removeEventListener(listener);
```

### All 12 event payloads

| Event | Use case |
|---|---|
| `TreasuryInitialized` | one-time at deploy |
| `RefineryLaunched` | new refinery confirmation |
| `RefineryDeposit` | operator topped up |
| `SnapshotSubmitted` | new snapshot available |
| `ClaimMade` | live activity feed |
| `OperatorWithdraw` | operator pulled funds |
| `RefineryClosed` | refinery terminal |
| `RefineryPauseToggled` | operator paused/unpaused |
| `PlatformPauseToggled` | global pause |
| `EpochAdvanced` | rules changed |
| `VerifiedCtoAssigned` | admin verified operator |
| `AuthorityRotated` | admin changed authorities |

---

## Off-Chain API (Indexer — Phase 2)

**Status:** these endpoints are **planned, not yet built**. Frontend should mock against these shapes during the design phase.

### Auth model

| Endpoint type | Auth |
|---|---|
| Public reads | Supabase anon key (RLS allows public SELECT) |
| Wallet-scoped reads | Supabase anon key + wallet signature (SIWS) |
| Writes | Wallet signature; service-role for indexer-internal |
| Admin | Service-role only |

### Endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/refineries` | Directory list with filtering, sorting, pagination |
| `GET /api/refineries/:pda` | Single refinery detail |
| `GET /api/wallets/:wallet/eligible` | Auto-detect eligible refineries + pre-computed merkle proofs |
| `GET /api/wallets/:wallet/profile` | Public wallet profile |
| `GET /api/dashboard` | Operator + holder dashboard data |
| `GET /api/leaderboard` | Top operators / claimers / reputation |
| `GET /api/refineries/:pda/snapshots/:idx/proof` | Merkle proof for one (refinery, snapshot, holder) |
| `POST /api/refineries/:pda/snapshot` | Trigger snapshot ahead of cadence (operator) |
| `POST /api/tos/accept` | Record ToS acceptance |
| `GET /api/tokens/:mint` | Cached token info |

### Realtime channels

| Channel | Use |
|---|---|
| `refinery:<pda>` | Refinery detail page (live pool drain) |
| `claims:global` | Home-page activity ticker |
| `claims:<wallet>` | Holder dashboard |
| `leaderboard:operators` | Leaderboard page |

```ts
const channel = supabase
  .channel('refinery:Hxk2…7gPZ')
  .on('broadcast', { event: 'pool_drain' }, payload => updateUi(payload))
  .subscribe();
```

For full TypeScript shapes, see the original `frontend-integration.md` source.

---

## Common Workflows

### Browse refineries (anonymous)

```
1. GET /api/refineries?status=active&sort=poolUsd  → directory list
2. User clicks a row → GET /api/refineries/:pda    → detail page
3. (Optional) GET /api/tokens/:mint                → live price refresh
```

### Connect + auto-detect eligibility

```
1. Wallet connects
2. ToS modal shown → user accepts → POST /api/tos/accept
3. GET /api/wallets/:wallet/eligible
   → returns list + merkle proofs
4. Render "You have 3 refineries to claim from" banner
```

If indexer is down, fallback to:
```
1. Helius DAS searchAssets (frontend-direct)
2. Cross-reference against cached refinery list
3. Show eligibility but disable Claim button (proof unavailable)
```

### Claim from a refinery

```
1. From eligibility list OR refinery detail → user clicks Claim
2. Frontend builds claim tx
3. Wallet signs → tx submitted → confirmed
4. Subscribe to ClaimMade event for live UI update
5. Refetch eligibility to update banner
```

### Launch a refinery (4-step form)

```
1. Step 1: GET /api/tokens/:mint → metadata + risk flags
   GET /api/rugcheck/summary → safety report
   Block if danger or transfer fee > 5%
2. Step 2: Check on-chain mint authority match → verifiedDeployer
3. Step 3: Configure (client-side only)
4. Step 4: Build init_refinery tx → sign + submit → subscribe to RefineryLaunched
   On confirm: redirect to /refinery/<mint>?r=<refineryPda>
```

### Operator dashboard

```
1. Wallet connects + ToS accepted
2. SIWS auth → JWT
3. GET /api/dashboard → returns refineries + claims + reputation
4. Per-refinery management: standard detail page + operator-only actions
```

---

## Error Handling

### Mapping ErrorCode → user copy

```ts
import { AnchorError } from '@coral-xyz/anchor';

const ERROR_USER_MESSAGES: Record<number, string> = {
  6000: 'You are not authorized for this action.',
  6001: 'Sol Oil Factory is temporarily paused. Please try again later.',
  6002: 'This refinery is not currently active.',
  6003: 'This refinery is closed.',
  6004: 'This refinery is already closed.',
  6005: 'Invalid state for this action.',
  6006: 'Reward pool must be greater than 0.',
  6007: 'Per-claim cap must be between 0.1% and 100%.',
  6008: 'Claim window must be at least 60 seconds (or 0 for open-ended).',
  6009: 'Claim rate must be greater than 0.',
  6010: 'Deposit fee too high (max 10%).',
  6011: 'Insufficient balance for pool + 1% deposit fee.',
  6012: 'Acknowledge the freeze authority risk to proceed.',
  6013: 'Deposit amount must be greater than 0.',
  6014: 'Withdrawal amount invalid.',
  6015: 'Withdrawal locked: claim window open or 7-day cooldown active.',
  6016: 'Snapshot epoch mismatch. Refresh and try again.',
  6017: 'Snapshot belongs to a different refinery.',
  6018: 'Snapshot is from a stale epoch.',
  6019: 'Snapshot must include at least one holder.',
  6020: 'Eligibility proof failed verification. Refresh and try again.',
  6021: 'Your share is too small to claim from this snapshot.',
  6022: 'Claim window has closed for this refinery.',
  6023: 'Refinery pool is empty.',
  6024: 'This token uses an unsupported Token-2022 extension.',
  6025: 'Numerical overflow.',
  6026: 'Pool accounting mismatch. Contact support.',
};

try {
  await launchRefinery(args);
  toast.success('Refinery launched!');
} catch (err) {
  if (err instanceof AnchorError) {
    const code = err.error.errorCode.number;
    const message = ERROR_USER_MESSAGES[code] ?? err.error.errorMessage;
    toast.error(message);
  } else if (err instanceof WalletSignTransactionError) {
    toast.info('Transaction canceled.');
  } else {
    toast.error('Unexpected error. Please try again.');
    captureException(err);
  }
}
```

### RPC errors

| Error | Frontend response |
|---|---|
| `429 Too Many Requests` | Tier 6 toast: "Rate limited. Retrying in Ns…" |
| `503 Service Unavailable` | Switch to fallback RPC if configured |
| `Blockhash not found` | Refetch blockhash + retry |
| `Transaction simulation failed` | Surface to console; show "Failed to send tx" |

---

## TypeScript Types

### Anchor enum normalization

```ts
export type RefineryStatusStr = 'pending' | 'active' | 'operatorPaused' | 'closed';
export type PoolEmptyStrategyStr = 'proRata' | 'fcfs';
export type SnapshotStrategyStr = 'atLaunch' | 'hourly' | 'daily' | 'weekly' | 'perEpochOnly';

export function normalizeRefineryStatus(status: any): RefineryStatusStr {
  return Object.keys(status)[0] as RefineryStatusStr;
}
```

### Risk flags

```ts
export type RiskFlag =
  | 'mintable'
  | 'concentrated'
  | 'lowLiquidity'
  | 'freezeAuthority'
  | 'transferFee';
```

### Verification badge

```ts
export type VerificationBadge = 'verifiedDeployer' | 'verifiedCto' | 'unverified';

export function getVerificationBadge(r: { verifiedDeployer: boolean; verifiedCto: boolean }): VerificationBadge {
  if (r.verifiedDeployer) return 'verifiedDeployer';
  if (r.verifiedCto) return 'verifiedCto';
  return 'unverified';
}
```

---

## Cluster-Aware URL Construction

All Solscan and Birdeye links must include cluster parameter for devnet:

```ts
const cluster = process.env.NEXT_PUBLIC_SOLANA_CLUSTER;

// Solscan
const solscanTx = `https://solscan.io/tx/${sig}${cluster === 'devnet' ? '?cluster=devnet' : ''}`;
const solscanAccount = `https://solscan.io/account/${addr}${cluster === 'devnet' ? '?cluster=devnet' : ''}`;

// Birdeye
const birdeyeToken = `https://birdeye.so/token/${mint}?chain=${cluster === 'devnet' ? 'solana-devnet' : 'solana'}`;

// Solana Explorer (alternative to Solscan)
const explorerTx = `https://explorer.solana.com/tx/${sig}${cluster === 'devnet' ? '?cluster=devnet' : ''}`;
```

---

## What's NOT YET Available (Mock These)

The frontend should ship with mocks for everything in this section. When the corresponding backend lands, swap mock for real fetch.

| Surface | Real source | Status |
|---|---|---|
| All on-chain reads | Anchor + Helius RPC | **Available after #40 devnet deploy** |
| All on-chain writes (10 instructions) | Anchor program | **Available after #40** |
| Event subscription | Anchor `addEventListener` | **Available after #40** |
| `/api/refineries` | Supabase indexer | **Phase 2 — not yet built** |
| `/api/refineries/:pda` | Supabase indexer | **Phase 2** |
| `/api/wallets/:wallet/eligible` | Edge Function | **Phase 2** |
| `/api/wallets/:wallet/profile` | Supabase indexer | **Phase 2** |
| `/api/dashboard` | Supabase indexer | **Phase 2** |
| `/api/leaderboard` | Supabase indexer | Partial — $CRUDE leaderboard exists |
| `/api/refineries/:pda/snapshots/:idx/proof` | Edge Function | **Phase 2** |
| Helius DAS proxy routes | Next.js | **Mostly exists** |
| `/api/rugcheck/summary` | Next.js | **New** |
| `/api/tos/accept` | Edge Function | **New** |
| `/api/tokens/:mint` | Supabase cache | **Phase 2** |
| Realtime channels | Supabase Realtime | **Phase 2** |
| Wallet auth (SIWS) | Edge Function | **Phase 2** |
| Reputation score | Supabase cron | **Phase 2** |

---

## Document History

- **2026-05-10** — Initial integration guide. Snapshot at program commit `12d0543`. Indexer endpoints are spec-only — Phase 2 build not yet started. Reorganized as `08-frontend-integration.md` in consolidated documentation set.
