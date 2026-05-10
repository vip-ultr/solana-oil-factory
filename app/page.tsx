import { HeroSection } from "@/components/sof/home/HeroSection";
import { TrustStrip } from "@/components/sof/home/TrustStrip";
import { HowItWorks } from "@/components/sof/home/HowItWorks";
import { ActivityTicker } from "@/components/sof/home/ActivityTicker";
import { FeaturedRefineries } from "@/components/sof/home/FeaturedRefineries";
import { ReputationExplainer } from "@/components/sof/home/ReputationExplainer";
import { FaqSection } from "@/components/sof/home/FaqSection";
import { fetchAllRefineries } from "@/lib/onchain/refineries";

// Always fresh — the home page surfaces the most recent refinery
// and live counters; caching would lie when a refinery launches.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const refineries = await fetchAllRefineries();
  const featured = refineries[0] ?? null;
  const activeCount = refineries.filter(
    (r) => r.status === "active" || r.status === "closingSoon",
  ).length;

  return (
    <>
      <HeroSection featured={featured} activeCount={activeCount} />
      <TrustStrip />
      <HowItWorks featured={featured} />
      <ActivityTicker />
      <FeaturedRefineries refineries={refineries} />
      <ReputationExplainer />
      <FaqSection />
    </>
  );
}
