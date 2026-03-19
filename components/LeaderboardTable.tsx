"use client";

export interface LeaderboardEntry {
  wallet_address: string;
  crude: number;
  bonus_crude: number;
  total_crude: number;
  oil_units: number;
  barrels: number;
  prestige_title: string;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}


function titleStyle(title: string): { bg: string; color: string } {
  const t = title.toLowerCase();
  if (t.includes("legend") || t.includes("baron") || t.includes("tycoon") || t.includes("emperor") || t.includes("sultan"))
    return { bg: "rgba(245,166,35,0.15)", color: "#f5a623" };
  if (t.includes("elite") || t.includes("lord") || t.includes("magnate") || t.includes("king") || t.includes("royal"))
    return { bg: "rgba(153,69,255,0.15)", color: "#AB9FF2" };
  if (t.includes("master") || t.includes("chief") || t.includes("executive") || t.includes("mogul"))
    return { bg: "rgba(20,241,149,0.12)", color: "#14F195" };
  if (t.includes("senior") || t.includes("veteran") || t.includes("refiner"))
    return { bg: "rgba(252,111,53,0.15)", color: "#FC6F35" };
  return { bg: "rgba(160,160,160,0.08)", color: "#888" };
}

const TOP3 = [
  { label: "1ST", emoji: "🥇", color: "#f5a623", glow: "rgba(245,166,35,0.5)" },
  { label: "2ND", emoji: "🥈", color: "#b0b8c4", glow: "rgba(176,184,196,0.4)" },
  { label: "3RD", emoji: "🥉", color: "#cd7f32", glow: "rgba(205,127,50,0.4)" },
];

export default function LeaderboardTable({ entries }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <p className="lb-empty">
        No wallets on the leaderboard yet. Be the first — search your wallet on the refinery.
      </p>
    );
  }

  const maxCrude = entries[0].total_crude || 1;

  return (
    <div className="lb-table-wrap">
      <table className="lb-table">
        <thead>
          <tr className="lb-thead-row">
            <th className="lb-th lb-th-rank">
              <span className="lb-th-inner">
                {/* <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> */}
                Rank
              </span>
            </th>
            <th className="lb-th lb-th-wallet">
              <span className="lb-th-inner">
                {/* <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="7" width="20" height="14" rx="3"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg> */}
                Wallet
              </span>
            </th>
            <th className="lb-th lb-th-crude">
              <span className="lb-th-inner lb-th-right">
                <span className="lb-th-crude-full">CRUDE Production</span>
                <span className="lb-th-crude-short">CRUDE</span>
              </span>
            </th>
            <th className="lb-th lb-th-title">
              <span className="lb-th-inner">
                {/* <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg> */}
                Prestige
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => {
            const pct = Math.max(3, Math.round((entry.total_crude / maxCrude) * 100));
            const ts = titleStyle(entry.prestige_title);
            const isTop3 = i < 3;

            return (
              <tr
                key={entry.wallet_address}
                className={`lb-row${isTop3 ? ` lb-row-top${i + 1}` : ""}`}
                style={{ animationDelay: `${i * 35}ms` }}
              >
                {/* Rank */}
                <td className="lb-td lb-td-rank">
                  {isTop3 ? (<>
                    <span
                      className={`lb-medal lb-medal-desktop lb-medal-${i + 1}`}
                      style={{ color: TOP3[i].color, borderColor: TOP3[i].color, boxShadow: `0 0 10px ${TOP3[i].glow}` }}
                    >
                      {TOP3[i].label}
                    </span>
                    <span className="lb-medal-mobile">{TOP3[i].emoji}</span>
                  </>) : (
                    <span className="lb-rank-num">{i + 1}</span>
                  )}
                </td>

                {/* Wallet — prestige badge stacks below on mobile */}
                <td className="lb-td lb-td-wallet">
                  <a
                    href={`https://solscan.io/account/${entry.wallet_address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lb-wallet-link"
                  >
                    {truncateAddress(entry.wallet_address)}
                  </a>
                  <span
                    className="lb-prestige-mobile"
                    style={{ background: ts.bg, color: ts.color, borderColor: `${ts.color}44` }}
                  >
                    {entry.prestige_title}
                  </span>
                </td>

                {/* CRUDE with progress bar */}
                <td className="lb-td lb-td-crude">
                  <div className="lb-crude-wrap">
                    <span className="lb-crude-num">{entry.total_crude.toLocaleString()}</span>
                    <div className="lb-crude-bar-bg">
                      <div
                        className={`lb-crude-bar${i === 0 ? " lb-crude-bar-gold" : ""}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* Prestige badge */}
                <td className="lb-td lb-td-title">
                  <span
                    className="lb-prestige-badge"
                    style={{ background: ts.bg, color: ts.color, borderColor: `${ts.color}44` }}
                  >
                    {entry.prestige_title}
                  </span>
                </td>

              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
