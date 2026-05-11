import type { Metadata } from "next";
import Link from "next/link";
import { PendingIndexerBanner, ReputationChip, WalletPill } from "@/components/sof/primitives";
import { LeaderboardControls } from "@/components/sof/leaderboard/LeaderboardControls";
import { LeaderboardSwitcher } from "@/components/sof/leaderboard/LeaderboardSwitcher";
import { topOperators } from "@/lib/indexer/aggregations";
import { formatTokens } from "@/lib/mock-data";
import { CrudeLeaderboard } from "@/components/sof/launchpad/CrudeLeaderboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Leaderboard",
  description:
    "Operators ranked by reputation, distribution, and holders served. $CRUDE earners ranked by lifetime refining. Computed from on-chain claim history + launchpad flow.",
};

export default function LeaderboardPage() {
  // Live aggregation from the indexer JSON.
  const operators = topOperators(50);

  const operatorsView = (
    <>
      <LeaderboardControls />

      <div className="sof-lb-body">
        {/* Podium */}
        <div className="sof-lb-podium">
          <div className="sof-lb-podium-card">
            <div className="rank">
              <b>#02</b> · Operator
            </div>
            <div className="who">
              <div
                className="av"
                style={{ background: "linear-gradient(135deg,#3b82f6,#a855f7)" }}
              />
              <div>
                <div className="nm">
                  RayLi…D9pT <ReputationChip score={88} />
                </div>
                <div className="pl">Verified · 5 refineries</div>
              </div>
            </div>
            <div className="stats">
              <div>
                <div className="k">Distributed</div>
                <div className="v">$184K</div>
              </div>
              <div>
                <div className="k">Holders</div>
                <div className="v">8,420</div>
              </div>
            </div>
          </div>

          <div className="sof-lb-podium-card first">
            <span className="crown" aria-hidden="true">👑</span>
            <div className="rank">
              <b>#01</b> · Operator of the week
            </div>
            <div className="who">
              <div
                className="av"
                style={{
                  background: "linear-gradient(135deg,#fbbf24,#f97316)",
                  width: 48,
                  height: 48,
                }}
              />
              <div>
                <div className="nm" style={{ fontSize: 18 }}>
                  5jVq…78dM <ReputationChip score={94} />
                </div>
                <div className="pl">
                  Verified deployer · 3 refineries · 0 closed early
                </div>
              </div>
            </div>
            <div className="stats">
              <div>
                <div className="k">Distributed (7d)</div>
                <div className="v" style={{ fontSize: 22, color: "#fbbf24" }}>
                  $284K
                </div>
              </div>
              <div>
                <div className="k">Holders served</div>
                <div className="v" style={{ fontSize: 22 }}>
                  14,820
                </div>
              </div>
            </div>
          </div>

          <div className="sof-lb-podium-card">
            <div className="rank">
              <b>#03</b> · Operator
            </div>
            <div className="who">
              <div
                className="av"
                style={{ background: "linear-gradient(135deg,#22c55e,#0891b2)" }}
              />
              <div>
                <div className="nm">
                  OrcaT…D7vM <ReputationChip score={82} />
                </div>
                <div className="pl">Verified · 4 refineries</div>
              </div>
            </div>
            <div className="stats">
              <div>
                <div className="k">Distributed</div>
                <div className="v">$142K</div>
              </div>
              <div>
                <div className="k">Holders</div>
                <div className="v">6,118</div>
              </div>
            </div>
          </div>
        </div>

        {/* Ranked table */}
        <table className="sof-lb-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Operator</th>
              <th>Reputation</th>
              <th className="num">Distributed (7d)</th>
              <th className="num">Holders</th>
              <th className="num">Refineries</th>
              <th>Trend</th>
              <th className="num">Δ rank</th>
            </tr>
          </thead>
          <tbody>
            {operators.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    padding: "32px 16px",
                    color: "var(--text-tertiary)",
                    fontSize: 13,
                    textAlign: "center",
                  }}
                >
                  No operator activity indexed yet on this cluster.
                  Operators show up here automatically once they
                  launch a refinery and holders start claiming.
                </td>
              </tr>
            ) : (
              operators.map((row) => (
                <tr key={row.operator}>
                  <td className="rk">
                    {row.rank.toString().padStart(2, "0")}
                  </td>
                  <td>
                    <div className="who">
                      <div className="av" aria-hidden="true" />
                      <div>
                        <Link
                          href={`/wallet/${row.operator}`}
                          className="nm"
                          style={{ color: "inherit", textDecoration: "none" }}
                        >
                          <WalletPill address={row.operator} />
                        </Link>
                        <div className="pl">
                          {row.refineryCount} refiner
                          {row.refineryCount === 1 ? "y" : "ies"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ color: "var(--text-tertiary)", fontSize: 12 }}>
                      v1.1
                    </span>
                  </td>
                  <td className="num">
                    {row.totalDistributed > 0
                      ? formatTokens(row.totalDistributed)
                      : "0"}
                  </td>
                  <td className="num">{row.uniqueHoldersServed}</td>
                  <td className="num">{row.refineryCount}</td>
                  <td>
                    <span
                      style={{ color: "var(--text-tertiary)", fontSize: 11 }}
                    >
                      —
                    </span>
                  </td>
                  <td className="num delta">—</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  const crudeView = (
    <div className="sof-lb-body">
      <CrudeLeaderboard />
    </div>
  );

  return (
    <>
      {operators.length === 0 && (
        <PendingIndexerBanner section="The leaderboard" />
      )}
      <header className="sof-lb-hdr">
        <h1>Leaderboard</h1>
        <p>
          Reputation is computed from on-chain claim history, snapshot
          consistency, and operator behavior. $CRUDE earners are ranked by
          lifetime refining through the launchpad flow.
        </p>
      </header>

      <LeaderboardSwitcher
        operatorsView={operatorsView}
        crudeView={crudeView}
      />
    </>
  );
}
