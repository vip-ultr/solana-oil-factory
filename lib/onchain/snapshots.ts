// Snapshot account fetcher.
//
// A refinery's snapshot history is fully on-chain — there's a
// `Snapshot` PDA per index. We fetch all of them via parallel
// reads from indices 1..currentSnapshotIndex; cheap because the
// number of snapshots per refinery is small (atLaunch = 1, weekly
// = ~52/year, even hourly = a few hundred for active refineries).

import { PublicKey } from "@solana/web3.js";
import { getProgram, snapshotPda } from "./client";

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

export interface SnapshotRow {
  index: number;
  takenAtUnix: number;
  holderCount: number;
  totalEligibleBalance: number;
  merkleRoot: string;
  pda: string;
}

export async function fetchSnapshots(
  refineryPda: string,
): Promise<SnapshotRow[]> {
  const program = getProgram();
  let refinery: PublicKey;
  try {
    refinery = new PublicKey(refineryPda);
  } catch {
    return [];
  }

  // Re-read the refinery to discover its currentSnapshotIndex;
  // the caller's earlier fetch may be a few seconds stale.
  let snapshotCount = 0;
  try {
    const r = await program.account.refinery.fetch(refinery);
    snapshotCount = r.currentSnapshotIndex ?? 0;
  } catch {
    return [];
  }
  if (snapshotCount <= 0) return [];

  // Parallel fetch indices 1..currentSnapshotIndex. Skip any
  // that don't decode (rare — only happens if a snapshot was
  // explicitly closed, which the program doesn't currently
  // support).
  const indices = Array.from({ length: snapshotCount }, (_, i) => i + 1);

  const fetched = await Promise.all(
    indices.map(async (index) => {
      const pda = snapshotPda(refinery, index);
      try {
        const a = await program.account.snapshot.fetch(pda);
        return {
          index,
          pda: pda.toBase58(),
          takenAtUnix: bnToNumberSafe(a.takenAt),
          holderCount: a.holderCount,
          totalEligibleBalance: bnToNumberSafe(a.totalEligibleBalance),
          merkleRoot: Buffer.from(a.merkleRoot).toString("hex"),
        } satisfies SnapshotRow;
      } catch {
        return null;
      }
    }),
  );

  // Newest first.
  return fetched
    .filter((s): s is SnapshotRow => s !== null)
    .sort((a, b) => b.index - a.index);
}
