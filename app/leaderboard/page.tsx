import type { Metadata } from "next";
import LeaderboardTable, { type LeaderboardEntry } from "@/components/LeaderboardTable";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Leaderboard — Solana Oil Factory",
  description: "Top Solana wallets ranked by $CRUDE production",
};

export const revalidate = 60;

async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("wallets")
    .select("wallet_address, crude, oil_units, barrels, prestige_title, last_updated")
    .order("crude", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[leaderboard page]", error.message);
    return [];
  }

  return data ?? [];
}

export default async function LeaderboardPage() {
  const entries = await getLeaderboard();

  return (
    <div className="page">
      <header className="header">
        <h1 className="site-title">🛢 Solana Oil Factory</h1>
        <a href="/" className="lb-nav-link">
          ← Back to Refinery
        </a>
      </header>

      <main className="main">
        <div className="lb-header">
          <div className="barrel-hero-header">
            <h2 className="barrel-hero-title">Global Leaderboard</h2>
            <div className="barrel-hero-rule" />
          </div>
          <p className="lb-subtitle">
            Top {entries.length} wallets ranked by $CRUDE produced. Updates whenever any wallet is searched.
          </p>
        </div>

        <LeaderboardTable entries={entries} />
      </main>
    </div>
  );
}
