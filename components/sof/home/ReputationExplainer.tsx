import { ButtonLink, WalletPill } from "@/components/sof/primitives";
import { MOCK_WALLETS, REPUTATION_SIGNALS } from "@/lib/mock-data";

const SIGNAL_VALUES: { name: string; value: string; bar: number; tone?: "success" }[] = [
  { name: "Refineries claimed successfully", value: "14", bar: 90 },
  { name: "Average holding duration", value: "47d", bar: 78 },
  { name: "Tokens held > 7d post-claim", value: "11 / 14", bar: 79 },
  { name: "Cluster status", value: "Clean", bar: 100, tone: "success" },
  { name: "Wallet age", value: "380d", bar: 84 },
  { name: "Refineries launched (verified deployer)", value: "2", bar: 64 },
];

const TIERS: { name: string; range: string; color: string }[] = [
  { name: "Excellent", range: "80 – 100", color: "var(--rep-excellent)" },
  { name: "Good", range: "60 – 79", color: "var(--rep-good)" },
  { name: "Neutral", range: "40 – 59", color: "var(--rep-neutral)" },
  { name: "Risky", range: "20 – 39", color: "var(--rep-risky)" },
  { name: "Flagged", range: "0 – 19", color: "var(--rep-flagged)" },
];

export function ReputationExplainer() {
  const w = MOCK_WALLETS[0]; // Hxk2…7gPZ — score 84

  // void the unused signal weights for now (we display the human values
  // above; the weights table is on /reputation methodology page).
  void REPUTATION_SIGNALS;

  return (
    <section className="sof-home-s elevated">
      <div className="inner">
        <div className="sof-rep-grid">
          <div className="sof-rep-card">
            <div className="top">
              <WalletPill address={w.address} />
              <ReputationSparkline />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: 24,
                marginBottom: 6,
              }}
            >
              <div className="sof-rep-score">
                <span className="num">{w.reputation}</span>
                <div>
                  <div className="out">/ 100</div>
                  <div className="tier">EXCELLENT</div>
                </div>
              </div>
              <div className="tiny" style={{ textAlign: "right", lineHeight: 1.5 }}>
                <div>Recomputed 4h ago</div>
                <div>+3 vs 30d ago</div>
              </div>
            </div>

            <div className="sof-signals">
              {SIGNAL_VALUES.map((s) => (
                <div key={s.name} className="sof-signal">
                  <span className="nm">{s.name}</span>
                  <span
                    className="vl"
                    style={s.tone === "success" ? { color: "var(--success)" } : undefined}
                  >
                    {s.value}
                  </span>
                  <span className="sof-sigbar">
                    <i style={{ width: `${s.bar}%` }} />
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="sof-rep-copy">
            <div
              className="font-mono"
              style={{
                fontSize: 11,
                color: "var(--text-tertiary)",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                marginBottom: 14,
              }}
            >
              §03 / Reputation is the moat
            </div>
            <h2>
              Reputation is built
              <br />
              from on-chain behavior.
            </h2>
            <p>
              Successful claims, holding duration, and clean cluster history
              raise scores. Quick-flips and sybil patterns lower them.
              Recomputed daily, public methodology, no black box.
            </p>
            <p>
              Operators can filter directories by minimum reputation. Holders
              carry their score across every refinery — wallet-level, not
              refinery-level.
            </p>

            <div className="sof-tier-list">
              {TIERS.map((t) => (
                <div key={t.name} className="sof-tier-row">
                  <span className="swatch" style={{ background: t.color }} />
                  <span className="nm">{t.name}</span>
                  <span className="rg">{t.range}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24 }}>
              <ButtonLink href="/reputation" variant="secondary">
                Read methodology →
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReputationSparkline() {
  return (
    <svg
      className="sof-rep-trend"
      viewBox="0 0 160 60"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sofRepGrad1" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#22C55E" stopOpacity="0.35" />
          <stop offset="1" stopColor="#22C55E" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0,40 L20,38 L40,32 L60,34 L80,28 L100,22 L120,18 L140,14 L160,10 L160,60 L0,60 Z"
        fill="url(#sofRepGrad1)"
      />
      <path
        d="M0,40 L20,38 L40,32 L60,34 L80,28 L100,22 L120,18 L140,14 L160,10"
        stroke="#22C55E"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}
