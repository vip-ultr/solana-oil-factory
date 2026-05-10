// Reputation v0.5 — five components derived purely from
// indexed events. C and O carry over from v0 (max 50 each);
// new in v0.5: P (token-deployment trust, max 30),
// R (tenure on the platform, max 20), A (activity diversity,
// max 20). The raw sum can exceed 100; we cap at 100 so v0
// callers see the same upper bound.
//
// What's still missing for v1:
//   - True wallet age (needs full getSignaturesForAddress walk
//     to the wallet's first-ever tx; expensive without a
//     dedicated cache). v0.5 uses "time since first SOF event"
//     as a proxy.
//   - Snapshot consistency (D component) — needs to compare
//     each refinery's stated cadence to actual snapshot
//     timestamps. Deferred.
//   - Token deployment trust beyond the verified_deployer flag
//     — needs per-mint metadata + audit signals. Deferred.

import { loadEvents } from "./store";
import type { ReputationTier } from "@/lib/mock-data";

export interface ReputationSignal {
  /** One-letter component code, matches the docs. */
  code: "C" | "O" | "P" | "R" | "A";
  label: string;
  /** Weight contributed by this signal, 0..max. */
  value: number;
  /** Cap for this signal in the v0.5 scoring window. */
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
    verifiedDeployerCount: number;
    earlyClosures: number;
    tenureDays: number;
    distinctRefineriesAny: number;
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

  // ── P — Token-deployment trust (max 30) ───
  // +10 per refinery launched as the verified deployer of its
  // token. Capped — three "real launches" hits max.
  const verifiedDeployerCount = myLaunches.filter(
    (e) => e.data.verified_deployer === true,
  ).length;
  const pValue = Math.min(30, verifiedDeployerCount * 10);

  // ── R — Tenure on the platform (max 20) ───
  // True wallet age would need a getSignaturesForAddress walk
  // back to the first ever tx. v0.5 uses "time since the
  // wallet first appeared in any indexed SOF event" as a
  // proxy that costs nothing extra to compute.
  const myEvents = events.filter((e) => e.wallet === walletPubkey);
  let firstSeen: number | null = null;
  for (const e of myEvents) {
    if (e.blockTime === null) continue;
    if (firstSeen === null || e.blockTime < firstSeen) firstSeen = e.blockTime;
  }
  const now = Math.floor(Date.now() / 1000);
  const tenureDays =
    firstSeen !== null ? Math.floor((now - firstSeen) / 86_400) : 0;
  let rValue = 0;
  if (tenureDays >= 7) rValue += 5;
  if (tenureDays >= 30) rValue += 5;
  if (tenureDays >= 90) rValue += 10;

  // ── A — Activity diversity (max 20) ───
  // Number of distinct refineries the wallet has touched —
  // either claimed from or launched. Rewards spreading
  // activity across the ecosystem instead of concentrating
  // on one refinery.
  const distinctAny = new Set<string>([
    ...myClaims.map((e) => e.refinery).filter((r): r is string => Boolean(r)),
    ...myLaunches.map((e) => e.data.refinery as string).filter(Boolean),
  ]).size;
  let aValue = 0;
  if (distinctAny >= 2) aValue = 5;
  if (distinctAny >= 3) aValue = 10;
  if (distinctAny >= 5) aValue = 15;
  if (distinctAny >= 8) aValue = 20;

  // Composite score — raw sum capped at 100. The cap means a
  // wallet maxing C+O alone still tops out at 100, but a
  // diversified wallet can hit 100 with lower C/O.
  const rawSum = cValue + oValue + pValue + rValue + aValue;
  const score = Math.max(0, Math.min(100, rawSum));
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
    {
      code: "P",
      label: "Token deployment trust",
      value: pValue,
      max: 30,
      detail:
        verifiedDeployerCount === 0
          ? myLaunches.length === 0
            ? "no operator history"
            : "operator launched without verified deployer flag"
          : `${verifiedDeployerCount} refiner${verifiedDeployerCount === 1 ? "y" : "ies"} as verified deployer`,
    },
    {
      code: "R",
      label: "Platform tenure",
      value: rValue,
      max: 20,
      detail:
        tenureDays === 0
          ? "no SOF activity indexed"
          : `${tenureDays} day${tenureDays === 1 ? "" : "s"} since first SOF event`,
    },
    {
      code: "A",
      label: "Activity diversity",
      value: aValue,
      max: 20,
      detail:
        distinctAny === 0
          ? "wallet has not touched any refinery"
          : distinctAny === 1
            ? "active at one refinery"
            : `active across ${distinctAny} refineries`,
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
      verifiedDeployerCount,
      earlyClosures,
      tenureDays,
      distinctRefineriesAny: distinctAny,
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
