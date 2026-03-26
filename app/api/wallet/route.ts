import { NextRequest, NextResponse } from "next/server";
import { getTransactionCount } from "@/lib/helius";
import { calculateOilData, calculateBagsOilData, getPrestigeTitle } from "@/lib/oilCalculator";
import { supabase } from "@/lib/supabase";
import { fetchBagsWalletData, fetchBagsFeedMints } from "@/lib/bags";
import { getBagsAnalytics } from "@/lib/bagsWalletAnalyzer";

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
    // Run Helius + Bags + Feed in parallel — failures never block the flow
    const [heliusResult, bagsResult, feedMintsResult] = await Promise.allSettled([
      getTransactionCount(address),
      fetchBagsWalletData(address),
      fetchBagsFeedMints(),
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
        : { totalFeesSol: 0, bagsCrude: 0, isActive: false, positionCount: 0, tokenMints: [] as string[] };

    // Build set of known Bags token mints from feed + wallet positions
    const feedMints =
      feedMintsResult.status === "fulfilled" ? feedMintsResult.value : [];
    const knownBagsMints = new Set<string>([...feedMints, ...bags.tokenMints]);

    // Analytics uses known mints to identify Bags swaps in Helius data
    const bagsAnalytics = await getBagsAnalytics(address, knownBagsMints);

    // Compute Bags oil data using combined CRUDE (fee + transaction)
    const bagsOilData = calculateBagsOilData(
      bagsAnalytics.total_swap_transactions,
      bags.totalFeesSol
    );

    const bagsCrude = bagsOilData.bagsCrude;
    const totalCrude = data.crude + bagsCrude;
    const title = getPrestigeTitle(totalCrude);

    // Fetch existing refine state (if any) from Supabase
    let lastRefinedOilUnits = 0;
    let lastRefinedBagsOilUnits = 0;
    const { data: existing } = await supabase
      .from("wallets")
      .select("last_refined_oil_units, last_refined_bags_oil_units")
      .eq("wallet_address", address)
      .maybeSingle();

    if (existing) {
      lastRefinedOilUnits = existing.last_refined_oil_units ?? 0;
      lastRefinedBagsOilUnits = existing.last_refined_bags_oil_units ?? 0;
    }

    // Check for active Bags refine session
    let activeBagsRefine = null;
    const { data: bagsRefine } = await supabase
      .from("bags_refines")
      .select("*")
      .eq("wallet_address", address)
      .eq("claimed", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (bagsRefine) {
      const now = new Date();
      const endsAt = new Date(bagsRefine.ends_at);
      activeBagsRefine = {
        status: now >= endsAt ? "completed" as const : "refining" as const,
        endsAt: bagsRefine.ends_at,
        startedAt: bagsRefine.started_at,
        durationMs: bagsRefine.duration_ms,
        crudeAmount: bagsRefine.crude_amount,
        feeCrude: bagsRefine.fee_crude,
        txCrude: bagsRefine.tx_crude,
        oilUnits: bagsRefine.oil_units,
      };
    }

    return NextResponse.json({
      address,
      ...data,
      title,
      bagsCrude,
      totalCrude,
      totalFeesSol: bags.totalFeesSol,
      bagsActive: bags.isActive,
      partial,
      lastRefinedOilUnits,
      bagsAnalytics,
      bagsOilData,
      lastRefinedBagsOilUnits,
      activeBagsRefine,
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
