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
import { tokenMetaFor, shortMint, shortPubkey } from "./token-registry";

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
  // refinery in parallel — needed for holders_eligible + the
  // age-of-snapshot indicator.
  const snapshots = await Promise.all(
    all.map(async (r) => {
      const idx = r.account.currentSnapshotIndex;
      if (!idx || idx === 0) return null;
      try {
        const snap = await program.account.snapshot.fetch(
          snapshotPda(r.publicKey, idx),
        );
        return snap;
      } catch {
        return null;
      }
    }),
  );

  const now = Math.floor(Date.now() / 1000);
  const ui: UiRefinery[] = all.map((r, i) => {
    const a = r.account;
    const snap = snapshots[i];
    return mapRefinery(r.publicKey, a, snap, i + 1, now);
  });

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
    let snap = null;
    if (a.currentSnapshotIndex && a.currentSnapshotIndex > 0) {
      try {
        snap = await program.account.snapshot.fetch(
          snapshotPda(pda, a.currentSnapshotIndex),
        );
      } catch {
        // snapshot may not exist yet for early-stage refineries
      }
    }
    const now = Math.floor(Date.now() / 1000);
    return mapRefinery(pda, a, snap, 0, now);
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
): UiRefinery {
  const mintStr = a.tokenMint.toBase58();
  const meta = tokenMetaFor(mintStr);

  const claimWindowEnd = a.claimWindowEnd?.toNumber?.() ?? 0;
  const claimWindowDaysLeft =
    claimWindowEnd === 0
      ? null
      : Math.max(0, Math.floor((claimWindowEnd - now) / 86400));

  const verification: VerificationTier = a.verifiedDeployer
    ? "verifiedDeployer"
    : a.verifiedCto
      ? "verifiedCto"
      : "unverified";

  const poolInitialBase = a.poolInitial?.toNumber?.() ?? 0;
  const poolRemainingBase = a.poolRemaining?.toNumber?.() ?? 0;
  const totalEligibleBase = snap?.totalEligibleBalance?.toNumber?.() ?? 0;

  // claimRatePer1Pct = pool_initial / 100 (tokens distributed per
  // 1% of total eligible supply held), in whole-token units.
  const claimRatePer1PctWhole = toWhole(poolInitialBase / 100, meta.decimals);

  return {
    id: pda.toBase58(),
    rank,
    tokenName: meta.name,
    tokenSymbol: meta.symbol,
    tokenMint: shortMint(mintStr),
    tokenMarkVariant: meta.variant,
    operator: shortPubkey(a.operator.toBase58()),
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
    snapshotAgeSeconds: snap ? now - snap.takenAt.toNumber() : 0,
    poolEmptyStrategy: poolEmptyStrategyEnumToUi(a.poolEmptyStrategy),
    perClaimCapBps: a.perClaimCapBps,
    claimWindowDaysLeft,
    status: statusEnumToUi(a.status, claimWindowDaysLeft),
    riskFlags: a.freezeAcknowledged ? ["freezeAuthority"] : [],
    launchedAtIso: new Date((a.createdAt?.toNumber?.() ?? 0) * 1000).toISOString(),
  };
}
