// Live refinery accounts — fetched from devnet via getProgramAccounts.

import { PublicKey } from "@solana/web3.js";
import type {
  Refinery as UiRefinery,
  RefineryStatus,
  SnapshotStrategy,
  PoolEmptyStrategy,
  VerificationTier,
} from "@/lib/mock-data";
import { getProgram, snapshotPda } from "./client";
import {
  tokenMetaFor,
  hasRegistryEntry,
  shortMint,
  shortPubkey,
} from "./token-registry";
import { fetchMetadataFor, tokenMetaWithOverride } from "./metadata";
import { computeReputation } from "@/lib/indexer/reputation";

/**
 * BN → number that survives values past Number.MAX_SAFE_INTEGER.
 * `BN.toNumber()` throws above 2^53 — common for u64 pools on
 * high-decimal tokens (10M @ 9 decimals = 1e16). We fall back to
 * parseFloat(bn.toString()), which keeps display-grade precision
 * even past the safe-integer ceiling.
 */
function bnToNumberSafe(bn: any): number {
  if (bn === null || bn === undefined) return 0;
  if (typeof bn === "number") return bn;
  try {
    return bn.toNumber();
  } catch {
    try {
      return parseFloat(bn.toString());
    } catch {
      return 0;
    }
  }
}

/**
 * Convert a base-unit u64 amount into a "whole tokens" number,
 * where the unit ratio is 10^decimals. Returns 0 if decimals is
 * unknown (registry miss) — the UI can choose to render base
 * units instead, but for grids/cards it's better to show 0 than
 * a misleading 1e9 figure.
 */
function toWhole(baseUnits: number, decimals: number): number {
  if (decimals <= 0) return 0;
  return baseUnits / Math.pow(10, decimals);
}

function statusEnumToUi(status: any, claimWindowDaysLeft: number | null): RefineryStatus {
  // anchor enum lands as { active: {} } / { closed: {} } / { operatorPaused: {} } / { pending: {} }
  const key = Object.keys(status ?? {})[0];
  if (key === "closed") return "closed";
  if (key === "operatorPaused") return "operatorPaused";
  if (key === "pending") return "pendingSnapshot";
  // Active — surface "closingSoon" if window is < 3 days.
  if (claimWindowDaysLeft !== null && claimWindowDaysLeft <= 3) return "closingSoon";
  return "active";
}

function snapshotStrategyEnumToUi(s: any): SnapshotStrategy {
  const key = Object.keys(s ?? {})[0];
  if (key === "atLaunch") return "atLaunch";
  if (key === "hourly") return "hourly";
  if (key === "daily") return "daily";
  if (key === "weekly") return "weekly";
  if (key === "perEpochOnly") return "perEpochOnly";
  return "atLaunch";
}

function poolEmptyStrategyEnumToUi(s: any): PoolEmptyStrategy {
  const key = Object.keys(s ?? {})[0];
  if (key === "fcfs") return "fcfs";
  return "proRata";
}

interface RawRefinery {
  publicKey: PublicKey;
  account: any;
}

/**
 * Fetch every live Refinery account on the program. Returns an
 * array sorted newest-first by created_at — matches the design's
 * "newest at the top of the directory" ordering.
 */
export async function fetchAllRefineries(): Promise<UiRefinery[]> {
  const program = getProgram();
  const all: RawRefinery[] = await program.account.refinery.all();

  // Sort by createdAt desc.
  all.sort(
    (a, b) =>
      (b.account.createdAt?.toNumber?.() ?? 0) -
      (a.account.createdAt?.toNumber?.() ?? 0),
  );

  // Fetch the latest snapshot (current_snapshot_index) per
  // refinery + Helius metadata for any mints not in the
  // hardcoded registry. Both run in parallel.
  const unknownMints = Array.from(
    new Set(
      all
        .map((r) => r.account.tokenMint.toBase58())
        .filter((m) => !hasRegistryEntry(m)),
    ),
  );
  const [snapshots, metaOverride] = await Promise.all([
    Promise.all(
      all.map(async (r) => {
        const idx = r.account.currentSnapshotIndex;
        if (!idx || idx === 0) return null;
        try {
          return await program.account.snapshot.fetch(
            snapshotPda(r.publicKey, idx),
          );
        } catch {
          return null;
        }
      }),
    ),
    fetchMetadataFor(unknownMints),
  ]);

  const now = Math.floor(Date.now() / 1000);
  const ui: UiRefinery[] = all.map((r, i) => {
    const a = r.account;
    const snap = snapshots[i];
    return mapRefinery(r.publicKey, a, snap, i + 1, now, metaOverride);
  });

  // Backfill live operator reputation. Dedupe by operator address —
  // one operator can run multiple refineries, no point computing the
  // same reputation twice. Failures default to 0 (treated identically
  // to "unknown" by ReputationChip).
  const uniqueOperators = Array.from(
    new Set(ui.map((r) => r.operatorFull).filter((a): a is string => Boolean(a))),
  );
  const reps = await Promise.all(
    uniqueOperators.map((addr) =>
      computeReputation(addr).then(
        (r) => r.score,
        () => 0,
      ),
    ),
  );
  const repByOperator = new Map(uniqueOperators.map((addr, i) => [addr, reps[i]]));
  for (const r of ui) {
    if (r.operatorFull) {
      r.operatorReputation = repByOperator.get(r.operatorFull) ?? 0;
    }
  }

  return ui;
}

/**
 * Fetch a single refinery by its PDA address. Returns null if
 * the address doesn't decode to a Refinery account.
 */
export async function fetchRefinery(id: string): Promise<UiRefinery | null> {
  const program = getProgram();
  let pda: PublicKey;
  try {
    pda = new PublicKey(id);
  } catch {
    return null;
  }
  try {
    const a = await program.account.refinery.fetch(pda);
    const mintStr = a.tokenMint.toBase58();
    const [snap, metaOverride] = await Promise.all([
      a.currentSnapshotIndex && a.currentSnapshotIndex > 0
        ? program.account.snapshot
            .fetch(snapshotPda(pda, a.currentSnapshotIndex))
            .catch(() => null)
        : Promise.resolve(null),
      hasRegistryEntry(mintStr)
        ? Promise.resolve(new Map())
        : fetchMetadataFor([mintStr]),
    ]);
    const now = Math.floor(Date.now() / 1000);
    const ui = mapRefinery(pda, a, snap, 0, now, metaOverride);
    if (ui.operatorFull) {
      ui.operatorReputation = await computeReputation(ui.operatorFull)
        .then((r) => r.score)
        .catch(() => 0);
    }
    return ui;
  } catch {
    return null;
  }
}

function mapRefinery(
  pda: PublicKey,
  a: any,
  snap: any | null,
  rank: number,
  now: number,
  metaOverride: Map<string, { name: string; symbol: string }>,
): UiRefinery {
  const mintStr = a.tokenMint.toBase58();
  const meta = tokenMetaWithOverride(mintStr, metaOverride);

  const claimWindowEnd = bnToNumberSafe(a.claimWindowEnd);
  const claimWindowDaysLeft =
    claimWindowEnd === 0
      ? null
      : Math.max(0, Math.floor((claimWindowEnd - now) / 86400));

  const verification: VerificationTier = a.verifiedDeployer
    ? "verifiedDeployer"
    : a.verifiedCto
      ? "verifiedCto"
      : "unverified";

  const poolInitialBase = bnToNumberSafe(a.poolInitial);
  const poolRemainingBase = bnToNumberSafe(a.poolRemaining);

  // claimRatePer1Pct = pool_initial / 100 (tokens distributed per
  // 1% of total eligible supply held), in whole-token units.
  const claimRatePer1PctWhole = toWhole(poolInitialBase / 100, meta.decimals);

  return {
    id: pda.toBase58(),
    rank,
    tokenName: meta.name,
    tokenSymbol: meta.symbol,
    tokenMint: shortMint(mintStr),
    tokenMintFull: mintStr,
    tokenMarkVariant: meta.variant,
    logoUrl: meta.logoUrl ?? null,
    operator: shortPubkey(a.operator.toBase58()),
    operatorFull: a.operator.toBase58(),
    currentSnapshotIndex: a.currentSnapshotIndex ?? 0,
    operatorReputation: 0, // pending indexer
    verification,
    poolInitial: toWhole(poolInitialBase, meta.decimals),
    poolRemaining: toWhole(poolRemainingBase, meta.decimals),
    poolUsd: meta.priceUsd
      ? toWhole(poolInitialBase, meta.decimals) * meta.priceUsd
      : 0,
    poolRemainingUsd: meta.priceUsd
      ? toWhole(poolRemainingBase, meta.decimals) * meta.priceUsd
      : 0,
    holdersEligible: snap?.holderCount ?? 0,
    holdersClaimed: a.holdersClaimed ?? 0,
    claimRatePer1Pct: claimRatePer1PctWhole,
    snapshotStrategy: snapshotStrategyEnumToUi(a.snapshotStrategy),
    snapshotAgeSeconds: snap ? now - bnToNumberSafe(snap.takenAt) : 0,
    poolEmptyStrategy: poolEmptyStrategyEnumToUi(a.poolEmptyStrategy),
    perClaimCapBps: a.perClaimCapBps,
    claimWindowDaysLeft,
    claimWindowEndIso: claimWindowEnd > 0 ? new Date(claimWindowEnd * 1000).toISOString() : null,
    status: statusEnumToUi(a.status, claimWindowDaysLeft),
    riskFlags: a.freezeAcknowledged ? ["freezeAuthority"] : [],
    launchedAtIso: new Date(bnToNumberSafe(a.createdAt) * 1000).toISOString(),
  };
}
