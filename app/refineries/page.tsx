import type { Metadata } from "next";
import { RefineryDirectory } from "@/components/sof/refineries/RefineryDirectory";
import { fetchAllRefineries } from "@/lib/onchain/refineries";

export const metadata: Metadata = {
  title: "Refineries",
  description:
    "All Solana token refineries — filter by status, verification, and operator reputation. Sortable by pool size, claim rate, and closing time.",
};

// Always re-fetch — refineries can launch at any time and the
// list goes stale fast. ISR(60) would be a reasonable compromise
// later if devnet RPC starts complaining.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RefineriesPage() {
  const refineries = await fetchAllRefineries();
  return <RefineryDirectory refineries={refineries} />;
}
