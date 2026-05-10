import { StatusPill, VerifiedBadge, TokenMark, PoolBar } from "@/components/sof/primitives";
import { formatTokens, snapshotStrategyLabel } from "@/lib/mock-data";
import type { Refinery } from "@/lib/mock-data";

const STEPS = [
  {
    num: "STEP 01",
    title: "Operators launch refineries",
    body: "An operator deposits tokens into program-owned escrow, sets a claim rate per 1% of supply held, picks snapshot cadence and a window.",
    meta: ["0.1 SOL launch fee", "1% deposit fee", "Squads-controlled escrow"],
  },
  {
    num: "STEP 02",
    title: "Snapshots verify holders",
    body: "At each snapshot, holder balances are captured directly from chain. A merkle root is published and signed; raw data stays public for any indexer to verify.",
    meta: ["Hourly cadence default", "Merkle proof per claim", "Public root"],
  },
  {
    num: "STEP 03",
    title: "Holders claim their share",
    body: "Eligible wallets submit a proof, receive tokens, and bank reputation. No registration. Auto-detected from on-chain balance.",
    meta: ["~0.001 SOL per claim", "One-tx proof + transfer", "Reputation +ΔS"],
  },
];

interface Props {
  /** Real refinery to render in the demo card. Null hides the
   *  card entirely — better than fabricating one. */
  featured: Refinery | null;
}

export function HowItWorks({ featured }: Props) {
  const fillPercent =
    featured && featured.poolInitial > 0
      ? Math.round((featured.poolRemaining / featured.poolInitial) * 100)
      : 0;

  return (
    <section className="sof-home-s">
      <div className="inner">
        <div className="sof-how-grid">
          <div>
            <div className="sof-home-section-head" style={{ display: "block", marginBottom: 32 }}>
              <div className="meta">§01 / How it works</div>
              <h2 className="font-display" style={{ fontSize: 36, fontWeight: 600, letterSpacing: "-0.02em", margin: 0, lineHeight: 1.05 }}>
                Three primitives.
                <br />
                One distribution surface.
              </h2>
              <p className="muted" style={{ margin: "18px 0 0", fontSize: 16, maxWidth: "48ch", lineHeight: 1.6 }}>
                From mint to claim, every action is on-chain and verifiable.
                No registration, no whitelist, no off-chain trust.
              </p>
            </div>

            <div className="sof-how-steps">
              {STEPS.map((step) => (
                <div key={step.num} className="sof-step">
                  <div className="num">{step.num}</div>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                    <div className="meta-row">
                      {step.meta.map((m) => (
                        <span key={m}>
                          <span className="dot" aria-hidden="true" />
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {featured && <DemoRefineryCard />}
        </div>
      </div>
    </section>
  );

  function DemoRefineryCard() {
    if (!featured) return null;
    return (
      <div className="sof-demo-card" aria-label={`Sample refinery — ${featured.tokenName}`}>
        <div className="head">
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <TokenMark variant={featured.tokenMarkVariant} symbol={featured.tokenSymbol} size={42} />
            <div>
              <div className="name">{featured.tokenName}</div>
              <div className="sym">
                {featured.tokenSymbol} · {featured.tokenMint}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <StatusPill status={featured.status} />
            <VerifiedBadge tier={featured.verification} />
          </div>
        </div>

        <div className="body">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <span className="tiny" style={{ textTransform: "uppercase", letterSpacing: "0.1em" }}>
              POOL REMAINING
            </span>
            <span className="font-mono" style={{ fontSize: 13, color: "var(--accent)" }}>
              {fillPercent}%
            </span>
          </div>
          <PoolBar remaining={featured.poolRemaining} initial={featured.poolInitial} animated />
          <div className="bar-row">
            <span className="l">0</span>
            <span className="r font-mono">
              {formatTokens(featured.poolRemaining)}{" "}
              <span style={{ color: "var(--text-tertiary)" }}>
                / {formatTokens(featured.poolInitial)}
              </span>
            </span>
          </div>

          <div className="sof-demo-stats">
            <div>
              <div className="k">Claim rate</div>
              <div className="v">
                {formatTokens(featured.claimRatePer1Pct)} <small>per 1%</small>
              </div>
            </div>
            <div>
              <div className="k">Holders eligible</div>
              <div className="v">{featured.holdersEligible.toLocaleString()}</div>
            </div>
            <div>
              <div className="k">Last snapshot</div>
              <div className="v">
                {Math.round(featured.snapshotAgeSeconds / 3600)}h ago{" "}
                <small>{snapshotStrategyLabel(featured.snapshotStrategy)}</small>
              </div>
            </div>
            <div>
              <div className="k">Closes</div>
              <div className="v">
                {featured.claimWindowDaysLeft === null
                  ? "Open-ended"
                  : `${featured.claimWindowDaysLeft}d left`}
              </div>
            </div>
          </div>
        </div>

        <div className="foot">
          <div>
            <div className="tiny" style={{ textTransform: "uppercase", letterSpacing: "0.1em" }}>
              YOU CAN CLAIM
            </div>
            <div className="font-mono" style={{ fontSize: 18, fontWeight: 500, color: "var(--accent)", marginTop: 2 }}>
              Connect to check
            </div>
          </div>
          <button type="button" className="sof-btn-claim">
            Open →
          </button>
        </div>
      </div>
    );
  }
}
