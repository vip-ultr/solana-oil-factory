import { HeroSection } from "@/components/sof/home/HeroSection";
import { TrustStrip } from "@/components/sof/home/TrustStrip";
import { HowItWorks } from "@/components/sof/home/HowItWorks";
import { ActivityTicker } from "@/components/sof/home/ActivityTicker";
import { FeaturedRefineries } from "@/components/sof/home/FeaturedRefineries";
import { ReputationExplainer } from "@/components/sof/home/ReputationExplainer";
import { FaqSection } from "@/components/sof/home/FaqSection";
import { fetchAllRefineries } from "@/lib/onchain/refineries";
import { buildActivityFeed } from "@/lib/indexer/ui";

// Always fresh — the home page surfaces the most recent refinery
// and live counters; caching would lie when a refinery launches.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const refineries = await fetchAllRefineries();
  // Pick a refinery with actual activity to feature — first preference is
  // active with non-empty pool, then any active, then any. Falling back to
  // refineries[0] would surface empty/closed pools on devnet and make the
  // homepage card look like a placeholder.
  const featured =
    refineries.find(
      (r) =>
        (r.status === "active" || r.status === "closingSoon") &&
        r.poolInitial > 0 &&
        r.poolRemaining > 0,
    ) ??
    refineries.find(
      (r) => r.status === "active" || r.status === "closingSoon",
    ) ??
    refineries[0] ??
    null;
  const activeCount = refineries.filter(
    (r) => r.status === "active" || r.status === "closingSoon",
  ).length;
  const activity = await buildActivityFeed({ limit: 30 });

  return (
    <>
      <HeroSection
        featured={featured}
        activeCount={activeCount}
        totalCount={refineries.length}
      />
      <TrustStrip />
      <HowItWorks featured={featured} />
      <ActivityTicker events={activity} />
      <FeaturedRefineries refineries={refineries} />
      <ReputationExplainer />
      <FaqSection />
    </>
  );
}
