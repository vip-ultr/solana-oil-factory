import type { Metadata } from "next";
import Link from "next/link";
import {
  ButtonLink,
  StatusPill,
  TokenMark,
  VerifiedBadge,
} from "@/components/sof/primitives";
import { WalletTabs } from "@/components/sof/wallet/WalletTabs";
import { ClaimHeatmap } from "@/components/sof/wallet/ClaimHeatmap";

interface PageProps {
  params: Promise<{ address: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { address } = await params;
  return {
    title: `${address} — Wallet profile`,
    description:
      "Public wallet profile on Solana Oil Factory. Reputation, claim history, operated refineries, and snapshot eligibility.",
  };
}

const REPUTATION = 84;
const CIRCUMFERENCE = 2 * Math.PI * 74; // ~464.96
const FILL_OFFSET = CIRCUMFERENCE * (1 - REPUTATION / 100); // ~74.4

export default async function WalletPage({ params }: PageProps) {
  const { address } = await params;
  const truncated =
    address.length > 12
      ? `${address.slice(0, 4)}…${address.slice(-4)}`
      : address;

  return (
    <>
      <div className="sof-w-crumb">
        <Link href="/leaderboard">Leaderboard</Link> / Wallet
      </div>

      <header className="sof-w-hdr">
        <div className="av" aria-hidden="true" />
        <div>
          <h1>
            <span>{truncated}</span>
            <span className="pl">{address}</span>
          </h1>
          <div className="meta">
            <VerifiedBadge tier="verifiedDeployer" />
            <span className="sep">·</span>
            <span>
              Wallet age{" "}
              <strong style={{ color: "var(--text-primary)" }}>380 days</strong>
            </span>
            <span className="sep">·</span>
            <span>
              First seen{" "}
              <strong style={{ color: "var(--text-primary)" }}>Apr 25 2025</strong>
            </span>
            <span className="sep">·</span>
            <a className="sof-rd-ext" style={{ cursor: "pointer" }}>
              Solscan ↗
            </a>
          </div>
        </div>
        <div className="actions">
          <button
            type="button"
            style={{
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
              padding: "9px 14px",
              borderRadius: 6,
              fontSize: 13,
              background: "transparent",
            }}
          >
            Watch
          </button>
          <button
            type="button"
            style={{
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
              padding: "9px 14px",
              borderRadius: 6,
              fontSize: 13,
              background: "transparent",
            }}
          >
            Share
          </button>
          <ButtonLink href="/dashboard" variant="primary">
            Connect as this wallet
          </ButtonLink>
        </div>
      </header>

      <div className="sof-w-kpi-strip">
        <div className="it">
          <div className="k">Reputation</div>
          <div className="v">
            {REPUTATION}<small>Excellent</small>
          </div>
          <div className="sub" style={{ color: "var(--success)" }}>
            +0.4 last claim
          </div>
        </div>
        <div className="it">
          <div className="k">Total claimed</div>
          <div className="v">
            $1,420<small>USD</small>
          </div>
          <div className="sub">across 47 claims</div>
        </div>
        <div className="it">
          <div className="k">Refineries operated</div>
          <div className="v">
            2<small>active</small>
          </div>
          <div className="sub">$28K distributed</div>
        </div>
        <div className="it">
          <div className="k">Holders served</div>
          <div className="v">2,108</div>
          <div className="sub">avg rep 78</div>
        </div>
        <div className="it">
          <div className="k">Streak</div>
          <div className="v">14 days</div>
          <div className="sub">Last claim 2h ago</div>
        </div>
      </div>

      <div className="sof-w-body">
        <div className="sof-w-col-l">
          <div className="sof-w-panel">
            <WalletTabs />
            <table className="sof-w-tbl">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>#</th>
                  <th>Refinery</th>
                  <th className="num">Amount</th>
                  <th className="num">USD</th>
                  <th>Snapshot</th>
                  <th>When</th>
                  <th>Tx</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { n: "47", mark: "bonk" as const, sym: "BONK", nm: "Bonk", amt: "148.8", usd: "$1.78", snap: "#7", when: "2h ago", tx: "4xK2…3hPq" },
                  { n: "46", mark: "wif" as const, sym: "WIF", nm: "dogwifhat", amt: "88.4", usd: "$294.20", snap: "#3", when: "3h ago", tx: "9pL8…2sRq" },
                  { n: "45", mark: "default" as const, sym: "PEPE", nm: "Pepe Coin", amt: "2,840.2", usd: "$42.18", snap: "#12", when: "1d ago", tx: "2bV8…K3w7" },
                  { n: "44", mark: "jup" as const, sym: "JUP", nm: "Jupiter", amt: "12.4", usd: "$8.90", snap: "#1", when: "2d ago", tx: "5kP9…M2x4" },
                  { n: "43", mark: "bonk" as const, sym: "BONK", nm: "Bonk", amt: "142.1", usd: "$1.71", snap: "#6", when: "2d ago", tx: "8aT4…N9p2" },
                  { n: "42", mark: "bonk" as const, sym: "BONK", nm: "Bonk", amt: "138.8", usd: "$1.66", snap: "#5", when: "3d ago", tx: "3hQz…J7t1" },
                  { n: "41", mark: "ray" as const, sym: "RAY", nm: "Raydium", amt: "8.2", usd: "$22.40", snap: "#2", when: "3d ago", tx: "7eR1…Q4n8" },
                ].map((row) => (
                  <tr key={row.n}>
                    <td className="fade">{row.n}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <TokenMark variant={row.mark} symbol={row.sym} size={28} />
                        <span className="font-display" style={{ fontWeight: 600 }}>
                          {row.nm}
                        </span>
                        <span className="fade">{row.sym}</span>
                      </div>
                    </td>
                    <td className="num">{row.amt}</td>
                    <td className="num">{row.usd}</td>
                    <td>{row.snap}</td>
                    <td className="fade">{row.when}</td>
                    <td>
                      <a className="fade" style={{ cursor: "pointer" }}>
                        {row.tx} ↗
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sof-w-panel">
            <div className="sof-w-panel-h">
              <h3>Claim activity · 53 weeks</h3>
              <span className="meta">47 claims · longest streak 14 days</span>
            </div>
            <ClaimHeatmap address={address} />
            <div className="sof-w-heatmap-legend">
              Less
              <div className="leg">
                <div style={{ background: "var(--bg-input)" }} />
                <div style={{ background: "rgba(245,166,35,0.25)" }} />
                <div style={{ background: "rgba(245,166,35,0.5)" }} />
                <div style={{ background: "rgba(245,166,35,0.75)" }} />
                <div style={{ background: "var(--accent)" }} />
              </div>
              More
            </div>
          </div>

          <div className="sof-w-panel">
            <div className="sof-w-panel-h">
              <h3>Operated refineries</h3>
            </div>
            <table className="sof-w-tbl">
              <thead>
                <tr>
                  <th>Token</th>
                  <th className="num">Pool</th>
                  <th className="num">Distributed</th>
                  <th className="num">Holders</th>
                  <th>Status</th>
                  <th>Launched</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <TokenMark variant="bonk" symbol="BONK" />
                      <div>
                        <div className="font-display" style={{ fontWeight: 600 }}>Bonk</div>
                        <div className="fade">BONK</div>
                      </div>
                    </div>
                  </td>
                  <td className="num">1.5M</td>
                  <td className="num">$14,820</td>
                  <td className="num">2,108</td>
                  <td><StatusPill status="active" /></td>
                  <td className="fade">Dec 5 · 7d ago</td>
                </tr>
                <tr>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <TokenMark variant="wif" symbol="WIF" />
                      <div>
                        <div className="font-display" style={{ fontWeight: 600 }}>dogwifhat</div>
                        <div className="fade">WIF</div>
                      </div>
                    </div>
                  </td>
                  <td className="num">100K</td>
                  <td className="num">$13,620</td>
                  <td className="num">412</td>
                  <td><StatusPill status="active" /></td>
                  <td className="fade">Nov 28 · 12d ago</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <aside className="sof-w-col-r">
          <div className="sof-w-panel">
            <div className="sof-w-panel-h">
              <h3>Reputation</h3>
              <span className="meta">v2 · since Mar 2026</span>
            </div>
            <div className="sof-w-gauge">
              <div className="ring">
                <svg viewBox="0 0 170 170" width="170" height="170">
                  <circle
                    cx="85"
                    cy="85"
                    r="74"
                    fill="none"
                    stroke="#262626"
                    strokeWidth="10"
                  />
                  <circle
                    cx="85"
                    cy="85"
                    r="74"
                    fill="none"
                    stroke="#F5A623"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE.toFixed(2)}
                    strokeDashoffset={FILL_OFFSET.toFixed(2)}
                  />
                </svg>
                <div className="v">
                  <span className="num">{REPUTATION}</span>
                  <span className="lab">/ 100</span>
                </div>
              </div>
              <div className="tier">Excellent</div>
              <div className="tier-bar">
                <div />
                <div />
                <div />
                <div className="on" />
                <div />
              </div>
              <div className="tier-labels">
                <span>Risk</span>
                <span>Caution</span>
                <span>Neutral</span>
                <span>Good</span>
                <span>Excellent</span>
              </div>
            </div>
            <div className="sof-w-brk">
              {[
                { k: "Claim consistency", bar: 88, v: "+22" },
                { k: "Operator behavior", bar: 92, v: "+24" },
                { k: "Token deployment trust", bar: 80, v: "+18" },
                { k: "Wallet age (380d)", bar: 60, v: "+12" },
                { k: "Snapshot consistency", bar: 50, v: "+8" },
              ].map((r) => (
                <div key={r.k} className="sof-w-brk-row">
                  <span className="k">{r.k}</span>
                  <span className="bar">
                    <i style={{ width: `${r.bar}%` }} />
                  </span>
                  <span className="v">{r.v}</span>
                </div>
              ))}
              <div
                className="sof-w-brk-row"
                style={{
                  borderTop: "1px solid var(--border-subtle)",
                  marginTop: 6,
                  paddingTop: 10,
                }}
              >
                <span className="k">Total</span>
                <span style={{ flex: 1 }} />
                <span
                  className="v"
                  style={{ color: "var(--accent)", fontSize: 14 }}
                >
                  84 / 100
                </span>
              </div>
            </div>
            <div style={{ padding: "0 20px 18px" }}>
              <Link href="/reputation" style={{ color: "var(--accent)", fontSize: 12 }}>
                How is this calculated? →
              </Link>
            </div>
          </div>

          <div className="sof-w-warning-card">
            <h5>⚠ Treat reputation as a signal, not a guarantee</h5>
            <p style={{ margin: 0 }}>
              Reputation reflects past on-chain behavior, not a guarantee of
              future actions. Always verify the underlying token and operator
              independently before participating.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
