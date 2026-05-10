import { cn } from "@/lib/cn";
import { reputationTierOf } from "@/lib/mock-data";
import type { ReputationTier } from "@/lib/mock-data";

interface Props {
  score: number;
  /** Override the tier explicitly (otherwise derived from score). */
  tier?: ReputationTier;
  /** Prefix label, e.g. "Rep" → "Rep 84". */
  prefix?: string;
  className?: string;
}

export function ReputationChip({ score, tier, prefix, className }: Props) {
  const t = tier ?? reputationTierOf(score);
  return (
    <span
      className={cn("sof-rep-chip", t, className)}
      aria-label={`Reputation ${score} of 100, tier ${t}`}
    >
      {prefix ? `${prefix} ` : ""}
      {score}
    </span>
  );
}
