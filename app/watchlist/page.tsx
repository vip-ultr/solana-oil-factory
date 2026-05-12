import type { Metadata } from "next";
import { WatchlistClient } from "@/components/sof/watchlist/WatchlistClient";
import { fetchAllRefineries } from "@/lib/onchain/refineries";

export const metadata: Metadata = {
  title: "Watchlist",
  description:
    "Refineries and wallets you've starred. Saved per-browser in localStorage; clearing browser data clears the list.",
};

// Always-fresh: refinery state changes per claim/snapshot/pause,
// so the watchlist needs to reflect the latest server data.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WatchlistPage() {
  const refineries = await fetchAllRefineries();
  return <WatchlistClient refineries={refineries} />;
}
