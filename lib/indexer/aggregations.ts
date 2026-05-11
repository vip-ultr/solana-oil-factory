// Cross-event aggregations for views that need more than a
// flat event feed. Operate over the bundled events.json — same
// constraints as queryEvents (small dataset, no indexes).

import { loadEvents } from "./store";
import { tokenMetaFor, shortPubkey } from "@/lib/onchain/token-registry";

export interface ClaimantRow {
  rank: number;
  holder: string;
  totalClaimed: number;
  claimCount: number;
  firstClaimUnix: number | null;
}

/**
 * Top claimants for a refinery, ordered by total amount claimed.
 * Aggregates ClaimMade events; returns at most `limit` rows.
 * Empty array for refineries without indexed claims.
 */
export function topClaimantsForRefinery(
  refineryPda: string,
  limit: number = 7,
): ClaimantRow[] {
  const claims = loadEvents().filter(
    (e) => e.eventName === "ClaimMade" && e.refinery === refineryPda,
  );

  type Acc = { holder: string; total: number; count: number; first: number | null };
  const byHolder = new Map<string, Acc>();
  for (const e of claims) {
    const holder = (e.data.holder as string) ?? e.wallet;
    if (!holder) continue;
    const amount = Number(e.data.amount_claimed ?? 0);
    if (!Number.isFinite(amount)) continue;
    const ts = e.blockTime;
    const acc = byHolder.get(holder) ?? { holder, total: 0, count: 0, first: null };
    acc.total += amount;
    acc.count += 1;
    if (ts !== null && (acc.first === null || ts < acc.first)) acc.first = ts;
    byHolder.set(holder, acc);
  }

  const sorted = [...byHolder.values()].sort((a, b) => b.total - a.total);
  return sorted.slice(0, limit).map((row, i) => ({
    rank: i + 1,
    holder: row.holder,
    totalClaimed: row.total,
    claimCount: row.count,
    firstClaimUnix: row.first,
  }));
}

export interface OperatorRow {
  rank: number;
  operator: string;
  refineryCount: number;
  totalDistributed: number;
  uniqueHoldersServed: number;
}

/**
 * Aggregate operator stats across every refinery they've
 * launched. Sorted by total distributed (a holders-claimed ×
 * per-claim-amount sum, in base units).
 */
export function topOperators(limit: number = 50): OperatorRow[] {
  const events = loadEvents();

  // refinery PDA → operator (authoritative once we see a launch)
  const refineryToOperator = new Map<string, string>();
  for (const e of events) {
    if (e.eventName === "RefineryLaunched") {
      const op = e.data.operator as string | undefined;
      const ref = e.data.refinery as string | undefined;
      if (op && ref) refineryToOperator.set(ref, op);
    }
  }

  type Acc = {
    operator: string;
    refineries: Set<string>;
    distributed: number;
    holders: Set<string>;
  };
  const byOp = new Map<string, Acc>();
  const ensure = (op: string): Acc => {
    let acc = byOp.get(op);
    if (!acc) {
      acc = { operator: op, refineries: new Set(), distributed: 0, holders: new Set() };
      byOp.set(op, acc);
    }
    return acc;
  };

  for (const e of events) {
    if (e.eventName === "RefineryLaunched") {
      const op = e.data.operator as string;
      const ref = e.data.refinery as string;
      ensure(op).refineries.add(ref);
    } else if (e.eventName === "ClaimMade") {
      const ref = e.refinery;
      if (!ref) continue;
      const op = refineryToOperator.get(ref);
      if (!op) continue;
      const acc = ensure(op);
      acc.distributed += Number(e.data.amount_claimed ?? 0);
      const holder = e.data.holder as string | undefined;
      if (holder) acc.holders.add(holder);
    }
  }

  const sorted = [...byOp.values()].sort(
    (a, b) => b.distributed - a.distributed,
  );
  return sorted.slice(0, limit).map((acc, i) => ({
    rank: i + 1,
    operator: acc.operator,
    refineryCount: acc.refineries.size,
    totalDistributed: acc.distributed,
    uniqueHoldersServed: acc.holders.size,
  }));
}

/**
 * Compact "operator profile" for a wallet — used by
 * /wallet/[address]. Returns null if the wallet hasn't operated
 * any refinery (purely a holder).
 */
export function operatorStatsFor(
  walletPubkey: string,
): OperatorRow | null {
  const all = topOperators(10_000);
  return all.find((row) => row.operator === walletPubkey) ?? null;
}

/**
 * Format a hex merkle-root for display: first 8 + … + last 4.
 * Used by the snapshot history table.
 */
export function shortHex(hex: string): string {
  if (!hex) return "—";
  if (hex.length <= 16) return hex;
  return `${hex.slice(0, 8)}…${hex.slice(-4)}`;
}

export { tokenMetaFor, shortPubkey };
