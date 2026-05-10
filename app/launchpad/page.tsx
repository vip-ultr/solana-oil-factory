import type { Metadata } from "next";
import { fetchBagsFeed } from "@/lib/bags";
import { LaunchpadHero } from "@/components/sof/launchpad/LaunchpadHero";
import { RefineCard } from "@/components/sof/launchpad/RefineCard";
import { LaunchpadFeed } from "@/components/sof/launchpad/LaunchpadFeed";
import { CrudeLeaderboard } from "@/components/sof/launchpad/CrudeLeaderboard";

export const metadata: Metadata = {
  title: "Launchpad refining",
  description:
    "Refine your wallet's on-chain activity into $CRUDE. Solana transactions count. Bags launchpad swaps count more. Claim, climb the leaderboard, build prestige.",
};

// The launchpad surfaces are mostly server-side data — the Bags
// feed + leaderboard are heavy enough to want a runtime fetch
// per request rather than a stale build-time snapshot.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LaunchpadPage() {
  // Bags feed is best-effort — failure surfaces as an empty
  // grid, never breaks the page. Leaderboard is fetched inside
  // CrudeLeaderboard via supabase since it needs the service-
  // role client which isn't safe to call at the page level.
  let feed: Awaited<ReturnType<typeof fetchBagsFeed>> = [];
  try {
    feed = await fetchBagsFeed();
  } catch {
    feed = [];
  }

  return (
    <>
      <LaunchpadHero />
      <RefineCard />
      <LaunchpadFeed feed={feed.slice(0, 6)} />
      <CrudeLeaderboard />
    </>
  );
}
