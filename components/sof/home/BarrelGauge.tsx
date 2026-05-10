import Image from "next/image";

interface Tag {
  position: "tl" | "tr" | "bl" | "br";
  label: string;
  value: string;
  pinLabel?: string;
}

interface Props {
  /** Pool fill percentage (0-100) — drives the gauge stroke. */
  fillPercent: number;
  /** Mono caption that arcs along the top of the gauge. */
  arcLabel: string;
  tags: Tag[];
}

const CIRCUMFERENCE = 2 * Math.PI * 140; // 879.6

/**
 * Animated barrel gauge. Pure CSS animation — gauge stroke fills
 * from 0% to `fillPercent` over 900ms on mount via stroke-dashoffset.
 */
export function BarrelGauge({ fillPercent, arcLabel, tags }: Props) {
  const offset = CIRCUMFERENCE * (1 - fillPercent / 100);
  // Inline animation so the offset is dynamic per-instance (the
  // global `.sof-gauge-fill` keyframe is hardcoded to 83%).
  const animationName = `sof-gauge-fill-${Math.round(fillPercent)}`;
  return (
    <div className="sof-barrel-stage">
      <svg
        className="sof-gauge-svg"
        viewBox="0 0 400 400"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sofGaugeGrad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#F5A623" />
            <stop offset="100%" stopColor="#FF6B35" />
          </linearGradient>
        </defs>
        {/* outer dotted ring */}
        <circle
          cx="200"
          cy="200"
          r="160"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
          strokeDasharray="2 6"
        />
        {/* gauge track */}
        <circle
          cx="200"
          cy="200"
          r="140"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="10"
        />
        {/* gauge fill */}
        <circle
          cx="200"
          cy="200"
          r="140"
          fill="none"
          stroke="url(#sofGaugeGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
          transform="rotate(-90 200 200)"
          style={{
            animation: `${animationName} 900ms cubic-bezier(0.2, 0.7, 0.2, 1) 200ms forwards`,
          }}
        />
        {/* tick marks at 12/3/6/9 */}
        <g stroke="rgba(245,166,35,0.5)" strokeWidth="1.5">
          <line x1="200" y1="32" x2="200" y2="42" />
          <line x1="368" y1="200" x2="358" y2="200" />
          <line x1="200" y1="368" x2="200" y2="358" />
          <line x1="32" y1="200" x2="42" y2="200" />
        </g>
        <path
          id="sofTopArc"
          d="M 80 200 A 120 120 0 0 1 320 200"
          fill="none"
        />
        <text
          fill="#A3A3A3"
          fontFamily="var(--font-mono, JetBrains Mono)"
          fontSize="9"
          letterSpacing="2"
        >
          <textPath
            href="#sofTopArc"
            startOffset="50%"
            textAnchor="middle"
          >
            {arcLabel}
          </textPath>
        </text>
      </svg>

      <Image
        src="/assets/barrel.png"
        alt=""
        width={485}
        height={780}
        priority
        className="sof-barrel"
      />

      {tags.map((tag) => (
        <div key={tag.position} className={`sof-tag ${tag.position}`}>
          <span>
            {tag.label}
            {tag.pinLabel && <> <span className="pin">{tag.pinLabel}</span></>}
          </span>
          <b>{tag.value}</b>
        </div>
      ))}

      <style>{`
        @keyframes ${animationName} {
          to { stroke-dashoffset: ${offset}; }
        }
      `}</style>
    </div>
  );
}
