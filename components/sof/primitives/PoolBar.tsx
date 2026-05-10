import { cn } from "@/lib/cn";

interface Props {
  remaining: number;
  initial: number;
  /** Show the shimmer animation overlay (used on active "live" cards). */
  animated?: boolean;
  /** Track height in px. Defaults to 8. */
  height?: number;
  className?: string;
}

/**
 * Pool drain bar — fill turns warning amber when ≤25% remaining and
 * danger red when ≤5%. Optional shimmer for live cards.
 */
export function PoolBar({ remaining, initial, animated = false, height = 8, className }: Props) {
  const pct = initial > 0 ? Math.max(0, Math.min(100, (remaining / initial) * 100)) : 0;
  const tone =
    pct <= 5 ? "var(--error)" : pct <= 25 ? "var(--warning)" : undefined;

  const fillStyle: React.CSSProperties = {
    height: "100%",
    width: `${pct}%`,
    borderRadius: 9999,
    background: tone
      ? tone
      : "linear-gradient(90deg, var(--accent-pressed), var(--accent))",
    position: "relative",
    transition: "width 320ms cubic-bezier(0.16, 1, 0.3, 1)",
  };

  return (
    <div
      className={cn(className)}
      style={{
        height,
        borderRadius: 9999,
        background: "var(--bg-input)",
        overflow: "hidden",
        position: "relative",
      }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Pool ${Math.round(pct)}% remaining`}
    >
      <div style={fillStyle}>
        {animated && (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
              backgroundSize: "200% 100%",
              animation: "sof-shimmer 3s linear infinite",
            }}
          />
        )}
      </div>
      <style>{`
        @keyframes sof-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -100% 0; }
        }
      `}</style>
    </div>
  );
}
