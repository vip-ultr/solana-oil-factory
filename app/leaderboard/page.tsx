import type { Metadata } from "next";
import Link from "next/link";
import { PendingIndexerBanner, WalletPill } from "@/components/sof/primitives";
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
        <div
          className="sof-lb-meta"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 12,
            color: "var(--text-tertiary)",
            fontSize: 12.5,
          }}
        >
          <span>
            {operators.length} operator{operators.length === 1 ? "" : "s"} ranked
          </span>
          <span className="font-mono" style={{ letterSpacing: "0.04em" }}>
            DEVNET
          </span>
        </div>

        <table className="sof-lb-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Operator</th>
              <th>Reputation</th>
              <th className="num">Distributed (7d)</th>
              <th className="num">Holders</th>
              <th className="num">Refineries</th>
            </tr>
          </thead>
          <tbody>
            {operators.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
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
                      —
                    </span>
                  </td>
                  <td className="num">
                    {row.totalDistributed > 0
                      ? formatTokens(row.totalDistributed)
                      : <span style={{ color: "var(--text-tertiary)" }}>—</span>}
                  </td>
                  <td className="num">
                    {row.uniqueHoldersServed > 0
                      ? row.uniqueHoldersServed
                      : <span style={{ color: "var(--text-tertiary)" }}>—</span>}
                  </td>
                  <td className="num">{row.refineryCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {operators.length > 0 && operators.length < 10 && (
          <div
            style={{
              padding: "16px 4px 0",
              color: "var(--text-tertiary)",
              fontSize: 12.5,
              lineHeight: 1.6,
            }}
          >
            More operators will appear as refineries are launched and claims
            land. The board updates automatically — no submission required.
          </div>
        )}
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
