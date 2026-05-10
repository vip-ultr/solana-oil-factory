/**
 * 53 weeks × 7 days claim activity heatmap (GitHub-contrib style).
 * Levels seeded deterministically from the wallet address so SSR
 * output matches every render. Production version pulls real claim
 * timestamps from the indexer and bucket-counts per day.
 */
interface Props {
  address: string;
}

const TOTAL = 53 * 7;

function hash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function lcg(seed: number) {
  let s = seed || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

export function ClaimHeatmap({ address }: Props) {
  const rand = lcg(hash(address));
  const cells = Array.from({ length: TOTAL }, () => {
    const d = rand();
    if (d > 0.85) return "l4";
    if (d > 0.7) return "l3";
    if (d > 0.5) return "l2";
    if (d > 0.3) return "l1";
    return "";
  });

  return (
    <div className="sof-w-heatmap" aria-label="Claim activity over the last 53 weeks">
      {cells.map((cls, i) => (
        <div key={i} className={cls ? `cell ${cls}` : "cell"} />
      ))}
    </div>
  );
}
