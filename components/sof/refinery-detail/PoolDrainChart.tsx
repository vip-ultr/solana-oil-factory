/**
 * Pool drain over the last 24h. Static SVG for v1 — when the
 * indexer goes live, swap for a Recharts Area chart consuming
 * snapshot points returned from
 * `GET /api/refineries/:pda/drain?range=24h`.
 */
export function PoolDrainChart() {
  return (
    <div className="sof-rd-chart-body">
      <svg
        className="sof-rd-chart-svg"
        viewBox="0 0 800 220"
        preserveAspectRatio="none"
        role="img"
        aria-label="Pool remaining over the last 24 hours, draining from 1.4M to 1.247M BONK"
      >
        <defs>
          <linearGradient id="sofRdChart1" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#F5A623" stopOpacity="0.25" />
            <stop offset="1" stopColor="#F5A623" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="sof-rd-chart-grid">
          <line x1="0" y1="40" x2="800" y2="40" />
          <line x1="0" y1="100" x2="800" y2="100" />
          <line x1="0" y1="160" x2="800" y2="160" />
        </g>
        <g className="sof-rd-chart-axis">
          <text x="6" y="36">1.40M</text>
          <text x="6" y="96">1.32M</text>
          <text x="6" y="156">1.24M</text>
          <text x="0" y="212">00:00</text>
          <text x="160" y="212">06:00</text>
          <text x="320" y="212">12:00</text>
          <text x="480" y="212">18:00</text>
          <text x="640" y="212">22:00</text>
          <text x="730" y="212" textAnchor="end">now</text>
        </g>
        <path
          d="M0,30 L80,38 L120,72 L180,80 L220,86 L280,98 L320,140 L360,148 L420,156 L500,162 L560,168 L620,170 L680,176 L740,180 L800,184 L800,220 L0,220 Z"
          fill="url(#sofRdChart1)"
        />
        <path
          d="M0,30 L80,38 L120,72 L180,80 L220,86 L280,98 L320,140 L360,148 L420,156 L500,162 L560,168 L620,170 L680,176 L740,180 L800,184"
          stroke="#F5A623"
          strokeWidth="1.6"
          fill="none"
        />
        <g>
          <circle cx="120" cy="72" r="4" fill="#F5A623" stroke="var(--bg-elevated)" strokeWidth="2" />
          <circle cx="320" cy="140" r="4" fill="#F5A623" stroke="var(--bg-elevated)" strokeWidth="2" />
          <text x="128" y="62" fill="#A3A3A3" fontFamily="var(--font-mono, JetBrains Mono)" fontSize="9">
            Snapshot #6
          </text>
          <text x="328" y="130" fill="#A3A3A3" fontFamily="var(--font-mono, JetBrains Mono)" fontSize="9">
            Snapshot #7
          </text>
        </g>
        <line
          x1="740"
          y1="20"
          x2="740"
          y2="200"
          stroke="#F5A623"
          strokeWidth="1"
          strokeDasharray="3 3"
          opacity="0.6"
        />
      </svg>
    </div>
  );
}
