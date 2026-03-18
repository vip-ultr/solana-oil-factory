import { NextRequest, NextResponse } from "next/server";
import { getTransactionCount } from "@/lib/helius";
import { calculateOilData, getPrestigeTitle } from "@/lib/oilCalculator";
import { supabase } from "@/lib/supabase";
import { fetchBagsWalletData } from "@/lib/bags";

// Allow this route to run up to 60s on Vercel (Pro plan).
// Hobby plan caps at 10s regardless — upgrade if large wallets still timeout.
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
  }

  try {
    // Run Helius + Bags calls in parallel — Bags failure never blocks the flow
    const [heliusResult, bagsResult] = await Promise.allSettled([
      getTransactionCount(address),
      fetchBagsWalletData(address),
    ]);

    // Helius is required
    if (heliusResult.status === "rejected") {
      throw heliusResult.reason;
    }

    const { count: txCount, partial } = heliusResult.value;
    const data = calculateOilData(txCount);

    // Bags is optional — use safe defaults on failure
    const bags =
      bagsResult.status === "fulfilled"
        ? bagsResult.value
        : { totalFeesSol: 0, bonusCrude: 0, isActive: false, positionCount: 0 };

    const bonusCrude = bags.bonusCrude;
    const totalCrude = data.crude + bonusCrude;
    const title = getPrestigeTitle(totalCrude);

    // Fetch existing refine state (if any) from Supabase
    let lastRefinedOilUnits = 0;
    const { data: existing } = await supabase
      .from("wallets")
      .select("last_refined_oil_units")
      .eq("wallet_address", address)
      .single();

    if (existing) {
      lastRefinedOilUnits = existing.last_refined_oil_units ?? 0;
    }

    // NOTE: We do NOT upsert to Supabase here.
    // Wallets only appear on the leaderboard after refining (via /api/refine).

    return NextResponse.json({
      address,
      ...data,
      // Override title with totalCrude-based title
      title,
      bonusCrude,
      totalCrude,
      totalFeesSol: bags.totalFeesSol,
      bagsActive: bags.isActive,
      partial,
      lastRefinedOilUnits,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    const isTimeout =
      message.includes("abort") || message.includes("timeout");

    console.error(
      `[wallet route] ${isTimeout ? "TIMEOUT" : "ERROR"} for ${address}:`,
      message
    );

    return NextResponse.json(
      {
        error: isTimeout
          ? "This wallet has too many transactions — fetching timed out. Please try again."
          : "Failed to fetch wallet data",
      },
      { status: isTimeout ? 504 : 500 }
    );
  }
}
