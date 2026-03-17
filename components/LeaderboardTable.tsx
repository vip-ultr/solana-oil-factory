"use client";

export interface LeaderboardEntry {
  wallet_address: string;
  crude: number;
  oil_units: number;
  barrels: number;
  prestige_title: string;
  last_updated: string;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function LeaderboardTable({ entries }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <p className="lb-empty">
        No wallets on the leaderboard yet. Be the first — search your wallet on the refinery.
      </p>
    );
  }

  return (
    <div className="lb-table-wrap">
      <table className="lb-table">
        <thead>
          <tr>
            <th className="lb-th lb-th-rank">#</th>
            <th className="lb-th lb-th-wallet">Wallet</th>
            <th className="lb-th lb-th-crude">$CRUDE</th>
            <th className="lb-th lb-th-title">Prestige Title</th>
            <th className="lb-th lb-th-txns">Transactions</th>
            <th className="lb-th lb-th-updated">Updated</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr key={entry.wallet_address} className="lb-row">
              <td className="lb-td lb-td-rank">{i + 1}</td>
              <td className="lb-td lb-td-wallet">
                <a
                  href={`https://solscan.io/account/${entry.wallet_address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lb-wallet-link"
                  title={entry.wallet_address}
                >
                  {truncateAddress(entry.wallet_address)}
                </a>
              </td>
              <td className="lb-td lb-td-crude">{entry.crude.toLocaleString()}</td>
              <td className="lb-td lb-td-title">{entry.prestige_title}</td>
              <td className="lb-td lb-td-txns">{entry.oil_units.toLocaleString()}</td>
              <td className="lb-td lb-td-updated">{timeAgo(entry.last_updated)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
