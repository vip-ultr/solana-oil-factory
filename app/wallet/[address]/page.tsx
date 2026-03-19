import type { Metadata } from "next";
import { getTransactionCount } from "@/lib/helius";
import { calculateOilData, getPrestigeTitle } from "@/lib/oilCalculator";
import { fetchBagsWalletData } from "@/lib/bags";
import { supabase } from "@/lib/supabase";
import WalletProfile from "./WalletProfile";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface Props {
  params: Promise<{ address: string }>;
}

// Solana base58 check (32-44 chars, alphanumeric no 0OIl)
function isValidSolanaAddress(addr: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address } = await params;
  const short = `${address.slice(0, 6)}...${address.slice(-4)}`;
  return {
    title: `${short} — Solana Oil Factory`,
    description: `View oil production stats for wallet ${short}`,
  };
}

export default async function WalletProfilePage({ params }: Props) {
  const { address } = await params;

  // Validate address
  if (!isValidSolanaAddress(address)) {
    return (
      <div className="page">
        <main className="main">
          <div className="error-msg">Invalid wallet address.</div>
        </main>
      </div>
    );
  }

  try {
    // Fetch Helius + Bags in parallel
    const [heliusResult, bagsResult] = await Promise.allSettled([
      getTransactionCount(address),
      fetchBagsWalletData(address),
    ]);

    if (heliusResult.status === "rejected") {
      throw heliusResult.reason;
    }

    const { count: txCount, partial } = heliusResult.value;
    const oilData = calculateOilData(txCount);

    const bags =
      bagsResult.status === "fulfilled"
        ? bagsResult.value
        : { totalFeesSol: 0, bonusCrude: 0, isActive: false, positionCount: 0 };

    const bonusCrude = bags.bonusCrude;
    const totalCrude = oilData.crude + bonusCrude;
    const title = getPrestigeTitle(totalCrude);

    // Get leaderboard rank (efficient COUNT query)
    let rank: number | null = null;
    const { data: existing } = await supabase
      .from("wallets")
      .select("wallet_address")
      .eq("wallet_address", address)
      .single();

    if (existing) {
      const { count } = await supabase
        .from("wallets")
        .select("*", { count: "exact", head: true })
        .gt("total_crude", totalCrude);
      rank = count !== null ? count + 1 : null;
    }

    return (
      <WalletProfile
        address={address}
        oilUnits={oilData.oilUnits}
        barrels={oilData.barrels}
        fillPercentages={oilData.fillPercentages}
        crude={oilData.crude}
        bonusCrude={bonusCrude}
        totalCrude={totalCrude}
        title={title}
        totalFeesSol={bags.totalFeesSol}
        bagsActive={bags.isActive}
        rank={rank}
        partial={partial}
      />
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const isTimeout = message.includes("abort") || message.includes("timeout");

    return (
      <div className="page">
        <main className="main">
          <div className="error-msg">
            {isTimeout
              ? "This wallet has too many transactions — fetching timed out. Please try again."
              : "Could not load wallet data. Please try again later."}
          </div>
        </main>
      </div>
    );
  }
}
