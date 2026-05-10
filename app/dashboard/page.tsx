import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  ButtonLink,
  ReputationChip,
  TokenMark,
  WalletPill,
} from "@/components/sof/primitives";
import { DashboardTabs } from "@/components/sof/dashboard/Tabs";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Operate, claim, and develop on Solana Oil Factory. Track your refineries, claims, reputation, and API usage in one place.",
};

export default function DashboardPage() {
  return (
    <>
      <header className="sof-dh-hdr">
        <div>
          <h1>Dashboard</h1>
          <div className="who">
            <WalletPill address="Hxk2…7gPZ" />
            <ReputationChip score={84} prefix="" />
            <span className="font-mono" style={{ color: "var(--text-tertiary)" }}>
              · Operator + holder
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            className="sof-btn"
            style={{
              border: "1px solid var(--border-subtle)",
              padding: "10px 14px",
              borderRadius: 6,
              fontSize: 13,
              color: "var(--text-secondary)",
              background: "transparent",
            }}
          >
            Export CSV
          </button>
          <ButtonLink href="/refinery/launch" variant="primary">
            <Plus size={14} strokeWidth={2} aria-hidden="true" />
            Launch refinery
          </ButtonLink>
        </div>
      </header>

      <DashboardTabs />

      <div className="sof-dh-body">
        {/* KPI strip */}
        <div className="sof-dh-kpi-grid">
          <div className="sof-dh-kpi">
            <div className="k">Active refineries</div>
            <div className="v">2</div>
            <div className="delta up">+1 last 30d</div>
          </div>
          <div className="sof-dh-kpi">
            <div className="k">Distributed (lifetime)</div>
            <div className="v">$28,440</div>
            <div className="delta up">+$3,820 last 7d</div>
          </div>
          <div className="sof-dh-kpi">
            <div className="k">Holders served</div>
            <div className="v">2,108</div>
            <div className="delta up">+412 last 7d</div>
          </div>
          <div className="sof-dh-kpi">
            <div className="k">Operator reputation</div>
            <div className="v">
              84<small>Excellent</small>
            </div>
            <div className="delta up">+0.4 last claim</div>
          </div>
        </div>

        {/* My refineries (operator) */}
        <div className="sof-dh-panel">
          <div className="sof-dh-panel-h">
            <h3>My refineries</h3>
            <span className="meta">2 active · 1 closing in 18d</span>
          </div>
          <table className="sof-dh-op-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Status</th>
                <th className="num">Pool remaining</th>
                <th className="num">Holders</th>
                <th className="num">Distributed</th>
                <th>Window</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <TokenMark variant="bonk" symbol="BONK" />
                    <div>
                      <div className="font-display" style={{ fontWeight: 600 }}>
                        Bonk
                      </div>
                      <div
                        className="font-mono"
                        style={{ fontSize: 11, color: "var(--text-tertiary)" }}
                      >
                        BONK
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="pill live">● LIVE</span>
                </td>
                <td className="num">
                  1,247,000
                  <div style={{ color: "var(--text-tertiary)", fontSize: 11, marginTop: 2 }}>
                    / 1,500,000 (83%)
                  </div>
                </td>
                <td className="num">
                  2,108
                  <div style={{ color: "var(--text-tertiary)", fontSize: 11, marginTop: 2 }}>
                    of 6,201
                  </div>
                </td>
                <td className="num">$14,820</td>
                <td>
                  <span className="font-mono" style={{ fontSize: 12 }}>
                    2d 14h
                  </span>
                </td>
                <td>
                  <div className="sof-dh-actions">
                    <button type="button">Top up</button>
                    <button type="button">Pause</button>
                    <button type="button" className="danger">
                      Close
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <TokenMark variant="wif" symbol="WIF" />
                    <div>
                      <div className="font-display" style={{ fontWeight: 600 }}>
                        dogwifhat
                      </div>
                      <div
                        className="font-mono"
                        style={{ fontSize: 11, color: "var(--text-tertiary)" }}
                      >
                        WIF
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="pill live">● LIVE</span>
                </td>
                <td className="num">
                  88,400
                  <div style={{ color: "var(--text-tertiary)", fontSize: 11, marginTop: 2 }}>
                    / 100,000 (88%)
                  </div>
                </td>
                <td className="num">
                  412
                  <div style={{ color: "var(--text-tertiary)", fontSize: 11, marginTop: 2 }}>
                    of 1,084
                  </div>
                </td>
                <td className="num">$13,620</td>
                <td>
                  <span className="font-mono" style={{ fontSize: 12 }}>
                    18d 0h
                  </span>
                </td>
                <td>
                  <div className="sof-dh-actions">
                    <button type="button">Top up</button>
                    <button type="button">Pause</button>
                    <button type="button" className="danger">
                      Close
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Distribution chart + activity feed */}
        <div className="sof-dh-split">
          <div className="sof-dh-panel">
            <div className="sof-dh-panel-h">
              <h3>Distribution · 7 days</h3>
              <span className="meta">Net distributed across both refineries</span>
            </div>
            <div style={{ padding: "14px 20px 18px" }}>
              <svg
                className="sof-dh-mini-svg"
                viewBox="0 0 800 160"
                preserveAspectRatio="none"
                aria-label="Distribution over the last 7 days"
              >
                <defs>
                  <linearGradient id="sofDhDg1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#F5A623" stopOpacity="0.25" />
                    <stop offset="1" stopColor="#F5A623" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <g stroke="#262626" strokeDasharray="2 4">
                  <line x1="0" y1="40" x2="800" y2="40" />
                  <line x1="0" y1="80" x2="800" y2="80" />
                  <line x1="0" y1="120" x2="800" y2="120" />
                </g>
                <path
                  d="M0,120 L100,110 L200,90 L300,70 L400,82 L500,55 L600,40 L700,30 L800,20 L800,160 L0,160 Z"
                  fill="url(#sofDhDg1)"
                />
                <path
                  d="M0,120 L100,110 L200,90 L300,70 L400,82 L500,55 L600,40 L700,30 L800,20"
                  stroke="#F5A623"
                  strokeWidth="1.6"
                  fill="none"
                />
                <g fontFamily="var(--font-mono, JetBrains Mono)" fontSize="9" fill="#737373">
                  <text x="0" y="155">Mon</text>
                  <text x="130" y="155">Tue</text>
                  <text x="260" y="155">Wed</text>
                  <text x="390" y="155">Thu</text>
                  <text x="520" y="155">Fri</text>
                  <text x="650" y="155">Sat</text>
                  <text x="770" y="155" textAnchor="end">Sun</text>
                </g>
              </svg>
            </div>
          </div>

          <div className="sof-dh-panel">
            <div className="sof-dh-panel-h">
              <h3>Activity</h3>
              <span className="meta">Last 24h</span>
            </div>
            <div className="sof-dh-feed">
              {[
                { ic: "green", body: <><b>Snapshot #7 published</b> for BONK · 6,201 holders</>, when: "2h ago", amt: "—" },
                { ic: "blue", body: <><b>Hxk2…7gPZ</b> claimed from BONK</>, when: "2h ago", amt: "148.8" },
                { ic: "green", body: <><b>RayLi…D9pT</b> claimed from WIF</>, when: "3h ago", amt: "88.4" },
                { ic: "amber", body: <><b>Pool drain alert</b> · BONK at 17% remaining (you set 20%)</>, when: "5h ago", amt: "—" },
                { ic: "green", body: <><b>Snapshot #6 published</b> for BONK · 6,184 holders</>, when: "3h ago", amt: "—" },
                { ic: "blue", body: <><b>Top-up</b> applied to WIF · 50,000 WIF</>, when: "12h ago", amt: "+50K" },
                { ic: "green", body: <>412 holders claimed in last 24h</>, when: "summary", amt: "$3.8K" },
              ].map((row, i) => (
                <div key={i} className="sof-dh-feed-item">
                  <div className={`ic ${row.ic}`}>
                    {row.ic === "green" ? "↑" : row.ic === "blue" ? "⇄" : "⚠"}
                  </div>
                  <div className="body">
                    {row.body}
                    <span className="when">{row.when}</span>
                  </div>
                  <span className="amt">{row.amt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Holder section preview */}
        <div className="sof-dh-panel">
          <div className="sof-dh-panel-h">
            <h3>Recent claims as holder</h3>
            <Link
              href="/wallet/Hxk2…7gPZ"
              style={{ color: "var(--accent)", fontSize: 12 }}
            >
              View all 14 →
            </Link>
          </div>
          <div>
            {[
              { mark: "bonk" as const, sym: "BONK", nm: "Bonk", amt: "148.8", usd: "$1.78", when: "2h ago" },
              { mark: "wif" as const, sym: "WIF", nm: "dogwifhat", amt: "88.4", usd: "$294.20", when: "3h ago" },
              { mark: "default" as const, sym: "PEPE", nm: "Pepe Coin", amt: "2,840.2", usd: "$42.18", when: "1d ago" },
              { mark: "jup" as const, sym: "JUP", nm: "Jupiter", amt: "12.4", usd: "$8.90", when: "2d ago" },
            ].map((r) => (
              <div key={r.sym} className="sof-dh-cc-row">
                <TokenMark variant={r.mark} symbol={r.sym} size={32} />
                <div>
                  <span className="nm">{r.nm}</span>
                  <span className="sym">{r.sym}</span>
                </div>
                <div>
                  <span className="amt">{r.amt}</span>
                  <span className="usd">{r.usd}</span>
                </div>
                <div className="when">{r.when}</div>
                <a className="lnk">tx ↗</a>
              </div>
            ))}
          </div>
        </div>

        {/* Developer section preview */}
        <div className="sof-dh-split">
          <div className="sof-dh-api-card">
            <h4>Indexer API · GraphQL</h4>
            <p>
              Read-only access to refineries, snapshots, claims, and reputation.
              Auto-rate-limited per key.{" "}
              <Link href="/developers" style={{ color: "var(--accent)" }}>
                Full docs →
              </Link>
            </p>
            <div className="sof-dh-code">
              <span className="com"># Query active refineries for a token</span>
              {"\n"}query {"{"}
              {"\n  refineries("}
              <span className="key">token</span>: <span className="str">&quot;DezX…AKKM&quot;</span>,{" "}
              <span className="key">status</span>: <span className="str">ACTIVE</span>) {"{"}
              {"\n    id pool { remaining total }"}
              {"\n    snapshots(last: 5) { merkleRoot holders takenAt }"}
              {"\n    operator { wallet reputation }"}
              {"\n  }"}
              {"\n}"}
            </div>
          </div>

          <div className="sof-dh-api-card">
            <h4>API keys</h4>
            <p>
              Two free keys per wallet.{" "}
              <span className="muted">
                Used 12,408 / 50,000 requests this month.
              </span>
            </p>
            <div className="sof-dh-usage-bar">
              <i style={{ width: "25%" }} />
            </div>
            <div style={{ marginTop: 14 }}>
              <div className="sof-dh-key-row">
                <span>
                  <span className="id">prod-</span>
                  <span className="val">9k4Hx…•••••</span>
                </span>
                <span className="ud">12,408 reqs · 30d</span>
              </div>
              <div className="sof-dh-key-row">
                <span>
                  <span className="id">test-</span>
                  <span className="val">3aXqL…•••••</span>
                </span>
                <span className="ud">0 reqs · 30d</span>
              </div>
            </div>
            <button
              type="button"
              style={{
                border: "1px solid var(--border-subtle)",
                padding: "8px 14px",
                borderRadius: 6,
                fontSize: 12,
                color: "var(--text-secondary)",
                marginTop: 14,
                background: "transparent",
              }}
            >
              + Generate new key
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
