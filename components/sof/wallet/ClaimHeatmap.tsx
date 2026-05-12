"use client";

/**
 * 53-week claim activity heatmap (GitHub-contrib style).
 *
 * Axis labels are computed from real dates anchored to the same
 * current-week Sunday used by buildClaimHeatmap — no prop changes
 * needed. Shows month names (+ abbreviated year on Jan / year-wrap)
 * across the top and Mon/Wed/Fri day labels on the left.
 *
 * On mobile the outer container scrolls horizontally; scroll is
 * anchored to the right (most recent week) on mount.
 */

import { useRef, useEffect } from "react";

const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

// Only label Mon (1), Wed (3), Fri (5) — same convention as GitHub.
const DAY_LABELS = [null, "Mon", null, "Wed", null, "Fri", null];

interface Props {
  /** counts[week][dayOfWeek 0=Sun..6=Sat]. 53 weeks, week 0 = oldest. */
  counts: number[][];
}

function levelClass(count: number): string {
  if (count === 0) return "";
  if (count >= 5) return "l4";
  if (count >= 3) return "l3";
  if (count >= 2) return "l2";
  return "l1";
}

export function ClaimHeatmap({ counts }: Props) {
  const outerRef = useRef<HTMLDivElement>(null);
  const weeks = counts.length;

  // On mobile the container scrolls — anchor to the right (newest week)
  // so the user sees current activity without having to scroll first.
  useEffect(() => {
    const el = outerRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  // Anchor: Sunday of the current week (UTC), same as buildClaimHeatmap.
  const now = new Date();
  const currentSunday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - now.getUTCDay()),
  );

  // One Date per week column, week 0 = oldest.
  const weekStarts: Date[] = Array.from({ length: weeks }, (_, i) => {
    const d = new Date(currentSunday);
    d.setUTCDate(d.getUTCDate() - (weeks - 1 - i) * 7);
    return d;
  });

  // Month label: set only at the first column of a new month.
  // Append abbreviated year when the year changes (e.g. "Jan '26").
  const monthLabels: (string | null)[] = Array(weeks).fill(null);
  let lastMonth = -1;
  let lastYear = -1;
  for (let i = 0; i < weeks; i++) {
    const m = weekStarts[i].getUTCMonth();
    const y = weekStarts[i].getUTCFullYear();
    if (m !== lastMonth) {
      const showYear = lastYear !== -1 && y !== lastYear;
      monthLabels[i] = showYear
        ? `${MONTHS[m]} '${String(y).slice(2)}`
        : MONTHS[m];
      lastMonth = m;
      lastYear = y;
    }
  }

  return (
    <div className="sof-w-heatmap-outer" ref={outerRef}>

      {/* ── Month label row ── */}
      <div className="sof-w-heatmap-axis-row">
        <div className="sof-w-heatmap-corner" aria-hidden="true" />
        <div className="sof-w-heatmap-months" aria-hidden="true">
          {monthLabels.map((label, i) => (
            <div key={i} className="sof-w-heatmap-month-cell">
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Day labels + cell grid ── */}
      <div className="sof-w-heatmap-axis-row">
        <div className="sof-w-heatmap-days" aria-hidden="true">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="sof-w-heatmap-day-cell">
              {label}
            </div>
          ))}
        </div>

        <div
          className="sof-w-heatmap"
          role="img"
          aria-label="Claim activity over the last 53 weeks"
        >
          {counts.map((weekCounts, week) =>
            weekCounts.map((count, day) => {
              const date = weekStarts[week];
              const cellDate = new Date(date);
              cellDate.setUTCDate(date.getUTCDate() + day);
              const dateStr = cellDate.toISOString().slice(0, 10);
              return (
                <div
                  key={`${week}-${day}`}
                  className={`cell${count ? ` ${levelClass(count)}` : ""}`}
                  title={
                    count
                      ? `${count} claim${count === 1 ? "" : "s"} · ${dateStr}`
                      : dateStr
                  }
                />
              );
            }),
          )}
        </div>
      </div>

    </div>
  );
}
