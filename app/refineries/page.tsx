import type { Metadata } from "next";
import { ServiceDegradedBanner } from "@/components/sof/primitives";
import { RefineryDirectory } from "@/components/sof/refineries/RefineryDirectory";
import { MOCK_SYSTEM_STATS } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Refineries",
  description:
    "All Solana token refineries — filter by status, verification, and operator reputation. Sortable by pool size, claim rate, and closing time.",
};

export default function RefineriesPage() {
  return (
    <>
      <ServiceDegradedBanner lagSeconds={MOCK_SYSTEM_STATS.indexerLagSeconds} />
      <RefineryDirectory />
    </>
  );
}
