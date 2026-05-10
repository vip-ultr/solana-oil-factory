import type { Metadata } from "next";
import Link from "next/link";
import { PendingIndexerBanner, ReputationChip, WalletPill } from "@/components/sof/primitives";
import { LeaderboardControls } from "@/components/sof/leaderboard/LeaderboardControls";
import { cn } from "@/lib/cn";
import { topOperators } from "@/lib/indexer/aggregations";
import { formatTokens } from "@/lib/mock-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Leaderboard",
  description:
    "Operators ranked by reputation, distribution, and holders served. Computed from on-chain claim history, snapshot consistency, and operator behavior.",
};

interface Row {
  rank: string;
  name: string;
  pl: string;
  rep: number;
  repTier: "excellent" | "good" | "neutral" | "risky" | "flagged";
  distributed: string;
  holders: string;
  refineries: string;
  trend: "up" | "down" | "flat";
  delta: string;
  deltaTone: "up" | "dn" | "";
  avClass: "" | "b" | "c" | "d";
  you?: boolean;
}

const ROWS: Row[] = [
  { rank: "04", name: "Hxk2…7gPZ", pl: "Verified deployer", rep: 84, repTier: "excellent", distributed: "$112K", holders: "5,204", refineries: "2", trend: "up", delta: "+2", deltaTone: "up", avClass: "c" },
  { rank: "05", name: "MndS…DwY3", pl: "Verified · 6 refineries", rep: 79, repTier: "excellent", distributed: "$98K", holders: "4,812", refineries: "6", trend: "up", delta: "+1", deltaTone: "up", avClass: "d" },
  { rank: "06", name: "Pyth9…D7ax", pl: "Verified · 1 refinery", rep: 76, repTier: "excellent", distributed: "$84K", holders: "3,920", refineries: "1", trend: "flat", delta: "+0", deltaTone: "", avClass: "b" },
  { rank: "07", name: "JitoSL…M9pq", pl: "CTO · 2 refineries", rep: 72, repTier: "excellent", distributed: "$71K", holders: "3,402", refineries: "2", trend: "down", delta: "−1", deltaTone: "dn", avClass: "" },
  { rank: "08", name: "Drift…J3kL", pl: "Verified · 3 refineries", rep: 68, repTier: "good", distributed: "$58K", holders: "2,810", refineries: "3", trend: "up", delta: "+3", deltaTone: "up", avClass: "c" },
  { rank: "09", name: "You · 4Bsd…91jU", pl: "Verified · 2 refineries", rep: 67, repTier: "good", distributed: "$28.4K", holders: "2,108", refineries: "2", trend: "up", delta: "+5", deltaTone: "up", avClass: "d", you: true },
  { rank: "10", name: "RaydiumO…Lk2", pl: "CTO · 4 refineries", rep: 63, repTier: "good", distributed: "$22K", holders: "1,840", refineries: "4", trend: "flat", delta: "−2", deltaTone: "dn", avClass: "b" },
  { rank: "11", name: "Mango…Q2dT", pl: "Verified · 1 refinery", rep: 61, repTier: "good", distributed: "$18K", holders: "1,408", refineries: "1", trend: "flat", delta: "+0", deltaTone: "", avClass: "" },
  { rank: "12", name: "Tensor…Pq9Z", pl: "Verified · 2 refineries", rep: 58, repTier: "good", distributed: "$14K", holders: "1,182", refineries: "2", trend: "down", delta: "−4", deltaTone: "dn", avClass: "c" },
  { rank: "13", name: "Bonk…E5kQ", pl: "CTO · 1 refinery", rep: 52, repTier: "neutral", distributed: "$11K", holders: "948", refineries: "1", trend: "up", delta: "+1", deltaTone: "up", avClass: "d" },
  { rank: "14", name: "Marin…7uZP", pl: "Verified · 2 refineries", rep: 48, repTier: "neutral", distributed: "$8.4K", holders: "712", refineries: "2", trend: "flat", delta: "−1", deltaTone: "dn", avClass: "" },
  { rank: "15", name: "Phoenix…J0dX", pl: "Verified · 1 refinery", rep: 42, repTier: "neutral", distributed: "$5.8K", holders: "488", refineries: "1", trend: "flat", delta: "+0", deltaTone: "", avClass: "b" },
];

const TREND_PATHS: Record<string, { d: string; stroke: string }> = {
  up: { d: "M0,18 L10,16 L20,12 L30,14 L40,10 L50,8 L60,6 L70,4 L80,2", stroke: "var(--success)" },
  down: { d: "M0,8 L10,10 L20,12 L30,8 L40,10 L50,12 L60,14 L70,16 L80,18", stroke: "var(--error)" },
  flat: { d: "M0,12 L10,14 L20,12 L30,14 L40,12 L50,14 L60,12 L70,14 L80,12", stroke: "var(--text-tertiary)" },
};

export default function LeaderboardPage() {
  // Live aggregation from the indexer JSON.
  const operators = topOperators(50);

  return (
    <>
      {operators.length === 0 && (
        <PendingIndexerBanner section="The leaderboard" />
      )}
      <header className="sof-lb-hdr">
        <h1>Leaderboard</h1>
        <p>
          Reputation is computed from on-chain claim history, snapshot
          consistency, and operator behavior. Higher reputation unlocks
          features and signals trust to other holders.
        </p>
      </header>

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
}
