import type { Metadata } from "next";
import Link from "next/link";
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
    .select("wallet_address, crude, bonus_crude, total_crude, oil_units, barrels, prestige_title, last_updated")
    .gt("total_crude", 0)
    .order("total_crude", { ascending: false })
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
        <h1 className="site-title">
          <img src="/logo.png" alt="Solana Oil Factory" className="site-logo" />
          <span className="site-title-text">Solana Oil Factory</span>
        </h1>
        <Link href="/" className="lb-nav-link">
          ← Back to Refinery
        </Link>
      </header>

      <main className="main">
        <div className="lb-header">
          <div className="barrel-hero-header">
            <h2 className="barrel-hero-title">Global Leaderboard</h2>
            <div className="barrel-hero-rule" />
          </div>
          <p className="lb-subtitle">
            Wallets are ranked by CRUDE produced. <br />
            Leaderboard is updated whenever a wallet joins the refinery.
          </p>
        </div>

        <LeaderboardTable entries={entries} />
      </main>
    </div>
  );
}
