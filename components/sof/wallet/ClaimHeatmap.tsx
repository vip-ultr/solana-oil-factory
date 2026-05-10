/**
 * 53 weeks × 7 days claim activity heatmap (GitHub-contrib style).
 *
 * Server-rendered with real claim counts — the `counts` prop is
 * a 53×7 grid built by lib/indexer/reputation.buildClaimHeatmap
 * from the indexer's ClaimMade events. Empty cells stay grey.
 */
interface Props {
  /** counts[week][dayOfWeek 0=Sun..6=Sat]. */
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
  // Flatten in column-major order (week, dayOfWeek) so the CSS
  // grid lays out the way the design expects: weeks across the
  // x-axis, days down the y-axis.
  const cells: { count: number; weekIdx: number; dayIdx: number }[] = [];
  for (let week = 0; week < counts.length; week++) {
    for (let day = 0; day < 7; day++) {
      cells.push({
        count: counts[week]?.[day] ?? 0,
        weekIdx: week,
        dayIdx: day,
      });
    }
  }

  return (
    <div
      className="sof-w-heatmap"
      aria-label="Claim activity over the last 53 weeks"
    >
      {cells.map(({ count, weekIdx, dayIdx }) => (
        <div
          key={`${weekIdx}-${dayIdx}`}
          className={count ? `cell ${levelClass(count)}` : "cell"}
          title={count ? `${count} claim${count === 1 ? "" : "s"}` : undefined}
        />
      ))}
    </div>
  );
}
