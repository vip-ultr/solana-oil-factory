// Reputation v0 — minimal, transparent, derived purely from
// indexed events. Two components: claim consistency (max 50)
// and operator behavior (max 50). 100-point scale.
//
// Why so simple: the locked spec calls for six components
// (C/O/P/R/A/D), but four of them need data we don't index yet:
// wallet age (needs full tx-history walk), token-deployment
// trust (needs mint authority + metadata audit signals),
// snapshot consistency (needs cadence-vs-actual delta), and
// activity diversity (needs holdings across many unrelated
// refineries — devnet has 3 in total).
//
// v0 ships the components we *can* compute from the events
// JSON. The breakdown shows exactly which signals contributed
// so users see what is and isn't measured. v0.5 adds wallet
// age once we wire the on-chain getSignaturesForAddress walk.

import { loadEvents } from "./store";
import type { ReputationTier } from "@/lib/mock-data";

export interface ReputationSignal {
  /** One-letter component code, matches the docs. */
  code: "C" | "O";
  label: string;
  /** Weight contributed by this signal, 0..max. */
  value: number;
  /** Cap for this signal in the v0 scoring window. */
  max: number;
  /** Short, human-readable line for the breakdown panel. */
  detail: string;
}

export interface ReputationResult {
  walletPubkey: string;
  score: number;
  tier: ReputationTier;
  signals: ReputationSignal[];
  /** Counts that drove the score, useful for the breakdown UI. */
  context: {
    claimCount: number;
    distinctRefineriesClaimed: number;
    refineriesOperated: number;
    earlyClosures: number;
    isOperator: boolean;
    isClaimer: boolean;
  };
}

/** Derive the tier label from a 0..100 score. Mirrors the
 *  thresholds documented on /reputation. */
function tierFor(score: number): ReputationTier {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "neutral";
  if (score >= 20) return "risky";
  return "flagged";
}

export function computeReputation(walletPubkey: string): ReputationResult {
  const events = loadEvents();

  // ── Claim signals ───
  const myClaims = events.filter(
    (e) => e.eventName === "ClaimMade" && e.wallet === walletPubkey,
  );
  const distinctRefineries = new Set(
    myClaims.map((e) => e.refinery).filter((r): r is string => Boolean(r)),
  ).size;

  // C component (max 50):
  //   10 for the first claim
  //   +4 per additional claim, capped at 30 (so 6 claims = max)
  //   +10 if claims span 2+ different refineries
  let cValue = 0;
  if (myClaims.length >= 1) cValue += 10;
  if (myClaims.length >= 2) cValue += Math.min(30, (myClaims.length - 1) * 4);
  if (distinctRefineries >= 2) cValue += 10;
  cValue = Math.min(50, cValue);

  // ── Operator signals ───
  const myLaunches = events.filter(
    (e) =>
      e.eventName === "RefineryLaunched" &&
      e.data.operator === walletPubkey,
  );
  const myCloses = events.filter(
    (e) => e.eventName === "RefineryClosed" && e.wallet === walletPubkey,
  );

  // "Early closure" = a RefineryClosed event whose refinery
  // also has a RefineryLaunched with a non-zero claim_window_end
  // and the close happened before the window expired. We
  // approximate by checking close blockTime < claim_window_end
  // pulled from the launch event.
  const launchByRefinery = new Map<string, { windowEnd: number }>();
  for (const ev of myLaunches) {
    const refinery = ev.data.refinery as string | undefined;
    const windowEnd = Number(ev.data.claim_window_end ?? 0);
    if (refinery) launchByRefinery.set(refinery, { windowEnd });
  }
  let earlyClosures = 0;
  for (const ev of myCloses) {
    const refinery = ev.refinery;
    const meta = refinery ? launchByRefinery.get(refinery) : undefined;
    if (!meta) continue;
    if (meta.windowEnd === 0) continue; // open-ended — close is the only exit
    if (ev.blockTime !== null && ev.blockTime < meta.windowEnd) {
      earlyClosures += 1;
    }
  }

  // O component (max 50):
  //   30 for any successful launch
  //   +10 if zero early closures
  //   +10 for ≥3 launches (the operator-at-scale uplift)
  //   −20 per early closure (can drive O negative; total floored at 0)
  let oValue = 0;
  if (myLaunches.length >= 1) {
    oValue += 30;
    if (earlyClosures === 0) oValue += 10;
    if (myLaunches.length >= 3) oValue += 10;
    oValue -= 20 * earlyClosures;
  }
  oValue = Math.max(0, Math.min(50, oValue));

  const score = Math.max(0, Math.min(100, cValue + oValue));
  const tier = tierFor(score);

  const signals: ReputationSignal[] = [
    {
      code: "C",
      label: "Claim consistency",
      value: cValue,
      max: 50,
      detail:
        myClaims.length === 0
          ? "no claims indexed yet"
          : distinctRefineries >= 2
            ? `${myClaims.length} claims across ${distinctRefineries} refineries`
            : `${myClaims.length} claims at one refinery`,
    },
    {
      code: "O",
      label: "Operator behavior",
      value: oValue,
      max: 50,
      detail:
        myLaunches.length === 0
          ? "wallet has not operated any refinery"
          : earlyClosures > 0
            ? `${myLaunches.length} launches · ${earlyClosures} early closure${earlyClosures === 1 ? "" : "s"}`
            : `${myLaunches.length} launches · zero early closures`,
    },
  ];

  return {
    walletPubkey,
    score,
    tier,
    signals,
    context: {
      claimCount: myClaims.length,
      distinctRefineriesClaimed: distinctRefineries,
      refineriesOperated: myLaunches.length,
      earlyClosures,
      isOperator: myLaunches.length > 0,
      isClaimer: myClaims.length > 0,
    },
  };
}

/**
 * Build a 7×53 grid of claim counts per (day-of-week, week)
 * for the heatmap. Anchored to the current week, walking back
 * 53 weeks. Returns counts in row-major order (week × day).
 */
export function buildClaimHeatmap(walletPubkey: string): {
  /** counts[week][dayOfWeek 0=Sun..6=Sat] */
  counts: number[][];
  totalClaims: number;
  longestStreakDays: number;
} {
  const events = loadEvents().filter(
    (e) => e.eventName === "ClaimMade" && e.wallet === walletPubkey,
  );

  const weeks = 53;
  const days = 7;
  const counts: number[][] = Array.from({ length: weeks }, () =>
    Array(days).fill(0),
  );

  const now = new Date();
  // Anchor at this week's Sunday so cells line up week-to-week.
  const sunday = new Date(now);
  sunday.setUTCHours(0, 0, 0, 0);
  sunday.setUTCDate(sunday.getUTCDate() - sunday.getUTCDay());

  const dayMs = 86_400_000;
  const claimDays = new Set<string>();
  for (const e of events) {
    if (!e.blockTime) continue;
    const ts = new Date(e.blockTime * 1000);
    const dayKey = `${ts.getUTCFullYear()}-${ts.getUTCMonth()}-${ts.getUTCDate()}`;
    claimDays.add(dayKey);

    const diffDays = Math.floor(
      (sunday.getTime() - ts.getTime()) / dayMs +
        (6 - ts.getUTCDay()),
    );
    if (diffDays < 0 || diffDays >= weeks * days) continue;
    const week = weeks - 1 - Math.floor(diffDays / days);
    const dow = ts.getUTCDay();
    counts[week][dow] += 1;
  }

  // Compute longest contiguous-day streak across all claim days.
  const sortedKeys = [...claimDays].sort();
  let longest = 0;
  let current = 0;
  let prev: number | null = null;
  for (const key of sortedKeys) {
    const [y, m, d] = key.split("-").map(Number);
    const ts = Date.UTC(y, m, d);
    if (prev !== null && ts - prev === dayMs) {
      current += 1;
    } else {
      current = 1;
    }
    if (current > longest) longest = current;
    prev = ts;
  }

  return {
    counts,
    totalClaims: events.length,
    longestStreakDays: longest,
  };
}
