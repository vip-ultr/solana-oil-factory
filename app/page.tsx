import { ServiceDegradedBanner } from "@/components/sof/primitives";
import { HeroSection } from "@/components/sof/home/HeroSection";
import { TrustStrip } from "@/components/sof/home/TrustStrip";
import { HowItWorks } from "@/components/sof/home/HowItWorks";
import { ActivityTicker } from "@/components/sof/home/ActivityTicker";
import { FeaturedRefineries } from "@/components/sof/home/FeaturedRefineries";
import { ReputationExplainer } from "@/components/sof/home/ReputationExplainer";
import { FaqSection } from "@/components/sof/home/FaqSection";
import { MOCK_SYSTEM_STATS } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <>
      <ServiceDegradedBanner lagSeconds={MOCK_SYSTEM_STATS.indexerLagSeconds} />
      <HeroSection />
      <TrustStrip />
      <HowItWorks />
      <ActivityTicker />
      <FeaturedRefineries />
      <ReputationExplainer />
      <FaqSection />
    </>
  );
}
