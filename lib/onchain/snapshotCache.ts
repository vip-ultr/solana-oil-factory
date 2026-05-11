// Local snapshot cache — Phase 2 stopgap for the eligible-
// holder list that the on-chain Snapshot account doesn't store.
// Stored in localStorage so the operator who submitted the
// snapshot (and any holder who's claimed since) can build
// proofs without re-deriving the tree.
//
// Production v3 would push this to a public indexer + IPFS
// pin so any holder can claim without trusting the operator's
// browser cache. For local devnet testing, this works.

export interface CachedSnapshot {
  refinery: string;
  snapshotIndex: number;
  /** Hex-encoded merkle root, matches the on-chain account. */
  merkleRoot: string;
  totalEligibleBalance: string; // bigint as decimal string
  holderCount: number;
  /** Holders + balances, in the order they were added to the tree. */
  entries: { pubkey: string; balance: string }[];
  takenAtUnix: number;
}

const KEY_PREFIX = "sof-snapshot:";

function key(refinery: string, snapshotIndex: number): string {
  return `${KEY_PREFIX}${refinery}:${snapshotIndex}`;
}

export function saveSnapshotCache(snap: CachedSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      key(snap.refinery, snap.snapshotIndex),
      JSON.stringify(snap),
    );
  } catch {
    /* quota or private mode */
  }
}

export function loadSnapshotCache(
  refinery: string,
  snapshotIndex: number,
): CachedSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key(refinery, snapshotIndex));
    if (!raw) return null;
    return JSON.parse(raw) as CachedSnapshot;
  } catch {
    return null;
  }
}
