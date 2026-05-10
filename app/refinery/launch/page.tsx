import type { Metadata } from "next";
import { ArrowRight, ExternalLink } from "lucide-react";
import {
  TokenMark,
  VerifiedBadge,
} from "@/components/sof/primitives";
import { Stepper } from "@/components/sof/refinery-launch/Stepper";

export const metadata: Metadata = {
  title: "Launch a refinery",
  description:
    "Reward holders of your token with on-chain claims. Anyone holding the token at snapshot time is eligible — no allowlist, no off-chain coordination. Setup takes about 5 minutes.",
};

export default function LaunchPage() {
  return (
    <>
      <div className="sof-lw-hdr">
        <div className="crumb">Launch / New refinery</div>
        <h1>Launch a refinery</h1>
        <p>
          Reward holders of your token with on-chain claims. Anyone holding the
          token at snapshot time is eligible — no allowlist, no off-chain
          coordination. Setup takes about 5 minutes.
        </p>
      </div>

      <Stepper />

      <div className="sof-lw-grid">
        <div className="sof-lw-main">
          {/* STEP 1 — Token */}
          <div className="sof-lw-card" data-step="1">
            <div className="sof-lw-card-head">
              <h3>1 · Choose token</h3>
              <span className="step-num">REQUIRED</span>
            </div>
            <div className="sof-lw-card-body">
              <div className="sof-lw-grp">
                <label className="sof-lw-lab">
                  Token mint address <span className="hint">SPL token only</span>
                </label>
                <input
                  className="sof-lw-input"
                  defaultValue="DezXAU8jNh3w7HnKQ5LVE3Y3vU4P2GrMqYx1c4tAKKM"
                />
                <div className="sof-lw-help ok">
                  ✓ Valid SPL mint · resolved as{" "}
                  <strong style={{ color: "var(--text-primary)" }}>Bonk (BONK)</strong>
                </div>
              </div>

              <div className="sof-lw-token-preview">
                <TokenMark variant="bonk" symbol="BONK" size={40} />
                <div>
                  <div className="nm">Bonk · BONK</div>
                  <div
                    style={{
                      fontSize: 11.5,
                      color: "var(--text-tertiary)",
                      fontFamily: "var(--font-mono, JetBrains Mono)",
                      marginTop: 2,
                    }}
                  >
                    Decimals 5 · Supply 88.7T · Holders 204,812
                  </div>
                </div>
                <div className="ml">
                  <VerifiedBadge tier="verifiedDeployer" />
                </div>
              </div>

              <div className="sof-lw-checks">
                <div className="sof-lw-check-row">
                  <span className="ind ok" aria-hidden="true" />
                  Wallet matches deployer authority
                  <span className="v ok">✓ Auto-verified</span>
                </div>
                <div className="sof-lw-check-row">
                  <span className="ind ok" aria-hidden="true" />
                  Mint authority renounced
                  <span className="v ok">renounced</span>
                </div>
                <div className="sof-lw-check-row">
                  <span className="ind ok" aria-hidden="true" />
                  Freeze authority renounced
                  <span className="v ok">renounced</span>
                </div>
                <div className="sof-lw-check-row">
                  <span className="ind warn" aria-hidden="true" />
                  Top-10 concentration
                  <span className="v warn">8.2%</span>
                </div>
                <div className="sof-lw-check-row">
                  <span className="ind ok" aria-hidden="true" />
                  Sufficient liquidity (Jupiter)
                  <span className="v ok">$1.4M</span>
                </div>
              </div>
              <p className="sof-lw-help" style={{ marginTop: 14 }}>
                Don&apos;t own the token?{" "}
                <a style={{ color: "var(--accent)", cursor: "pointer" }}>
                  CTO refineries are allowed
                </a>{" "}
                with elevated trust requirements. Your refinery will display an
                &quot;unverified deployer&quot; badge.
              </p>
            </div>
          </div>

          {/* STEP 2 — Mechanics */}
          <div className="sof-lw-card" data-step="2">
            <div className="sof-lw-card-head">
              <h3>2 · Mechanics</h3>
              <span className="step-num">CLAIM RULES</span>
            </div>
            <div className="sof-lw-card-body">
              <div className="sof-lw-grp">
                <label className="sof-lw-lab">
                  Claim rate{" "}
                  <span className="hint">tokens distributed per 1% of supply held</span>
                </label>
                <div className="sof-lw-row-2">
                  <div className="sof-lw-input-wrap">
                    <input className="sof-lw-input with-suffix" defaultValue="12,000" />
                    <span className="suffix">BONK / 1%</span>
                  </div>
                  <div className="sof-lw-input-wrap">
                    <input className="sof-lw-input with-suffix" defaultValue="5" />
                    <span className="suffix">% cap</span>
                  </div>
                </div>
                <div className="sof-lw-help">
                  A holder of <strong>2.4%</strong> of supply receives{" "}
                  <strong style={{ color: "var(--accent)" }}>28,800 BONK</strong> per
                  claim. Holders above 5% are capped at 5%.
                </div>
              </div>

              <div className="sof-lw-grp">
                <label className="sof-lw-lab">Snapshot cadence</label>
                <div className="sof-lw-seg" role="radiogroup" aria-label="Snapshot cadence">
                  <button type="button">15min</button>
                  <button type="button" className="on">Hourly</button>
                  <button type="button">4h</button>
                  <button type="button">Daily</button>
                  <button type="button">Custom</button>
                </div>
                <div className="sof-lw-snap-pic" aria-hidden="true">
                  <div className="axis" />
                  {[8, 21, 34, 47, 60, 73, 86].map((left, i) => (
                    <div key={left} className="tick" style={{ left: `${left}%` }}>
                      <span className="lab" style={{ left: 0 }}>+{i + 1}h</span>
                    </div>
                  ))}
                </div>
                <div className="sof-lw-help">
                  Holders are recorded once per snapshot. More frequent snapshots
                  reward active holding but cost more in fees.
                </div>
              </div>

              <div className="sof-lw-grp">
                <label className="sof-lw-lab">Claim window</label>
                <div className="sof-lw-row-3">
                  <div className="sof-lw-input-wrap">
                    <input className="sof-lw-input with-suffix" defaultValue="7" />
                    <span className="suffix">days</span>
                  </div>
                  <div className="sof-lw-input-wrap">
                    <input className="sof-lw-input with-suffix" defaultValue="0.001" />
                    <span className="suffix">SOL fee</span>
                  </div>
                  <div className="sof-lw-input-wrap">
                    <input
                      className="sof-lw-input with-suffix"
                      defaultValue="Auto-detect"
                    />
                    <span className="suffix">eligibility</span>
                  </div>
                </div>
                <div className="sof-lw-help">
                  After 7 days, unclaimed tokens are returned to your refinery
                  wallet. Claim fee covers indexer + on-chain costs.
                </div>
              </div>

              <details className="sof-lw-advanced" open>
                <summary>Advanced</summary>
                <div>
                  <div className="sof-lw-row-2" style={{ marginBottom: 14 }}>
                    <div className="sof-lw-grp" style={{ margin: 0 }}>
                      <label className="sof-lw-lab">Min wallet age</label>
                      <div className="sof-lw-input-wrap">
                        <input className="sof-lw-input with-suffix" defaultValue="0" />
                        <span className="suffix">days</span>
                      </div>
                    </div>
                    <div className="sof-lw-grp" style={{ margin: 0 }}>
                      <label className="sof-lw-lab">Min token balance</label>
                      <div className="sof-lw-input-wrap">
                        <input className="sof-lw-input with-suffix" defaultValue="0" />
                        <span className="suffix">tokens</span>
                      </div>
                    </div>
                  </div>
                  <div className="sof-lw-row-2">
                    <div className="sof-lw-grp" style={{ margin: 0 }}>
                      <label className="sof-lw-lab">Excluded wallets</label>
                      <input
                        className="sof-lw-input"
                        placeholder="Paste mint, LP, treasury…"
                      />
                    </div>
                    <div className="sof-lw-grp" style={{ margin: 0 }}>
                      <label className="sof-lw-lab">Note for claimants</label>
                      <input
                        className="sof-lw-input"
                        placeholder="Optional public message"
                      />
                    </div>
                  </div>
                </div>
              </details>
            </div>
          </div>

          {/* STEP 3 — Funding (current) */}
          <div className="sof-lw-card current" data-step="3">
            <div className="sof-lw-card-head">
              <h3>3 · Funding</h3>
              <span className="step-num current">CURRENT STEP</span>
            </div>
            <div className="sof-lw-card-body">
              <div className="sof-lw-grp">
                <label className="sof-lw-lab">
                  Total pool size <span className="hint">funded once at launch</span>
                </label>
                <div className="sof-lw-input-wrap">
                  <input
                    className="sof-lw-input with-suffix"
                    defaultValue="1,500,000"
                  />
                  <span className="suffix">BONK</span>
                </div>
                <div className="sof-lw-help">
                  ≈{" "}
                  <strong style={{ color: "var(--text-primary)" }}>$17,820</strong>{" "}
                  at current Jupiter price · refills allowed anytime via SDK.
                </div>
              </div>

              <div className="sof-lw-grp">
                <label className="sof-lw-lab">Funding wallet</label>
                <div className="sof-lw-input-wrap">
                  <input
                    className="sof-lw-input"
                    defaultValue="Hxk2…7gPZ (current connected wallet)"
                    disabled
                    style={{ opacity: 0.7 }}
                  />
                </div>
              </div>

              <div className="sof-lw-fund-vis">
                <div className="ttl">Cost breakdown · funded at launch</div>
                <div className="row">
                  <span className="l">Pool deposit (1,500,000 BONK)</span>
                  <span className="r">≈ $17,820</span>
                </div>
                <div className="row">
                  <span className="l">Platform fee (0.5% of pool)</span>
                  <span className="r">≈ $89.10</span>
                </div>
                <div className="row">
                  <span className="l">Snapshot infra (7d × 24 snapshots)</span>
                  <span className="r">0.42 SOL</span>
                </div>
                <div className="row">
                  <span className="l">Program rent (refundable)</span>
                  <span className="r">0.018 SOL</span>
                </div>
                <div className="row tot">
                  <span className="l">You&apos;ll sign for</span>
                  <span className="r">$17,909.10 + 0.438 SOL</span>
                </div>
              </div>

              <p className="sof-lw-help" style={{ marginTop: 12 }}>
                Pool tokens are escrowed in a program-derived account that only
                this refinery can spend.{" "}
                <a style={{ color: "var(--accent)", cursor: "pointer" }}>
                  Verify program on Solscan <ExternalLink size={10} style={{ display: "inline-block" }} />
                </a>
              </p>
            </div>
          </div>

          {/* STEP 4 — Review & sign */}
          <div className="sof-lw-card" data-step="4">
            <div className="sof-lw-card-head">
              <h3>4 · Review &amp; sign</h3>
              <span className="step-num">FINAL</span>
            </div>

            <div className="sof-lw-rev-grp">
              <h4>
                Token <a>Edit</a>
              </h4>
              <div className="sof-lw-rev-list">
                <div><span className="k">Symbol</span><span className="v">BONK</span></div>
                <div><span className="k">Mint</span><span className="v">DezX…AKKM</span></div>
                <div><span className="k">Decimals</span><span className="v">5</span></div>
                <div><span className="k">Operator</span><span className="v">Hxk2…7gPZ</span></div>
              </div>
            </div>
            <div className="sof-lw-rev-grp">
              <h4>
                Mechanics <a>Edit</a>
              </h4>
              <div className="sof-lw-rev-list">
                <div><span className="k">Rate</span><span className="v">12,000 / 1%</span></div>
                <div><span className="k">Cap</span><span className="v">5%</span></div>
                <div><span className="k">Snapshot cadence</span><span className="v">Hourly</span></div>
                <div><span className="k">Claim window</span><span className="v">7 days</span></div>
                <div><span className="k">Claim fee</span><span className="v">0.001 SOL</span></div>
                <div><span className="k">Eligibility</span><span className="v">Auto-detect</span></div>
              </div>
            </div>
            <div className="sof-lw-rev-grp">
              <h4>
                Funding <a>Edit</a>
              </h4>
              <div className="sof-lw-rev-list">
                <div><span className="k">Pool</span><span className="v">1,500,000 BONK</span></div>
                <div><span className="k">USD value</span><span className="v">≈ $17,820</span></div>
                <div><span className="k">Platform fee</span><span className="v">$89.10</span></div>
                <div><span className="k">Infra (7d)</span><span className="v">0.42 SOL</span></div>
              </div>
            </div>
            <div className="sof-lw-rev-grp">
              <h4>Total</h4>
              <div className="sof-lw-rev-list">
                <div>
                  <span className="k">You&apos;ll sign for</span>
                  <span
                    className="v"
                    style={{ color: "var(--accent)", fontSize: 14, fontWeight: 600 }}
                  >
                    $17,909 + 0.438 SOL
                  </span>
                </div>
                <div>
                  <span className="k">Refinery opens</span>
                  <span className="v">in ~3 minutes</span>
                </div>
              </div>

              <label className="sof-lw-consent">
                <input type="checkbox" defaultChecked />
                <span>
                  I understand this funding is non-custodial and immutable. Pool
                  tokens can only be claimed by token holders or returned after the
                  claim window. I have read the{" "}
                  <a style={{ color: "var(--accent)", cursor: "pointer" }}>
                    operator terms
                  </a>
                  .
                </span>
              </label>
            </div>

            <div className="sof-lw-nav">
              <button type="button" className="btn-ghost">
                ← Back
              </button>
              <button type="button" className="sof-btn sof-btn-primary">
                Sign &amp; launch refinery <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        <aside className="sof-lw-aside">
          <div className="sof-lw-card sof-lw-summary-card">
            <div className="head">
              <h4>Refinery preview</h4>
              <div className="nm">BONK Refinery</div>
            </div>
            <div className="body">
              <div className="row"><span className="k">Pool</span><span className="v">1,500,000 BONK</span></div>
              <div className="row"><span className="k">Rate</span><span className="v">12,000 / 1%</span></div>
              <div className="row"><span className="k">Cap</span><span className="v">5%</span></div>
              <div className="row"><span className="k">Snapshot</span><span className="v">Hourly · 168 total</span></div>
              <div className="row"><span className="k">Window</span><span className="v">7 days</span></div>
              <div className="row acc">
                <span className="k">Total cost</span>
                <span className="v">$17,909 + 0.44 SOL</span>
              </div>
            </div>
          </div>

          <div className="sof-lw-card sof-lw-help-card">
            <h5>What happens next</h5>
            <p style={{ margin: "0 0 8px" }}>
              After you sign, the refinery program creates a PDA escrow,
              transfers your funding, and queues the first snapshot. Holders can
              claim within ~3 minutes.
            </p>
            <p style={{ margin: "0 0 8px" }}>
              You can pause, top up, or close the refinery anytime from your{" "}
              <a>Operator dashboard</a>.
            </p>
            <p style={{ margin: 0 }}>
              Need help?{" "}
              <a>
                Read the operator guide <ExternalLink size={10} style={{ display: "inline-block" }} />
              </a>
            </p>
          </div>

          <div
            className="sof-lw-card sof-lw-help-card"
            style={{
              background: "rgba(245,158,11,0.05)",
              borderColor: "rgba(245,158,11,0.2)",
            }}
          >
            <h5 style={{ color: "#fbbf24" }}>⚠ Reputation impact</h5>
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>
              Operators who close early without notice lose reputation. Holders
              see your operator score on every refinery you launch.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
