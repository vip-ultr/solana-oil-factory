import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { calculateOilData, getPrestigeTitle } from "@/lib/oilCalculator";
import { fetchBagsWalletData } from "@/lib/bags";

/**
 * GET /api/wallet/stored?address=...
 *
 * Returns stored wallet data from Supabase WITHOUT calling Helius.
 * Used for returning users so they don't have to re-extract every visit.
 * Returns { found: false } if the wallet has never been refined.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
  }

  try {
    const { data: existing, error } = await supabase
      .from("wallets")
      .select("wallet_address, crude, bonus_crude, total_crude, oil_units, barrels, prestige_title, last_refined_oil_units, last_updated")
      .eq("wallet_address", address)
      .single();

    if (error || !existing) {
      // Wallet not found in DB — first-time user
      return NextResponse.json({ found: false });
    }

    // Recalculate fill percentages from stored oil_units
    const oilData = calculateOilData(existing.oil_units);

    // Fetch bags data (quick call, non-blocking if it fails)
    let bags = { totalFeesSol: 0, bonusCrude: 0, isActive: false, positionCount: 0 };
    try {
      bags = await fetchBagsWalletData(address);
    } catch {
      // Use stored bonus_crude as fallback
      bags.bonusCrude = existing.bonus_crude ?? 0;
      bags.isActive = (existing.bonus_crude ?? 0) > 0;
    }

    // Recompute total crude with fresh bags data
    const bonusCrude = bags.bonusCrude;
    const totalCrude = oilData.crude + bonusCrude;
    const title = getPrestigeTitle(totalCrude);

    // Check for active (unclaimed) refine session
    let activeRefine = null;
    try {
      const { data: refineRow } = await supabase
        .from("refines")
        .select("crude_amount, bonus_crude, oil_units, ends_at, started_at, duration_ms, is_completed")
        .eq("wallet_address", address)
        .eq("claimed", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (refineRow) {
        const isComplete = new Date() >= new Date(refineRow.ends_at);
        activeRefine = {
          status: isComplete ? "completed" : "refining",
          endsAt: refineRow.ends_at,
          startedAt: refineRow.started_at,
          durationMs: refineRow.duration_ms,
          crudeAmount: refineRow.crude_amount,
          bonusCrude: refineRow.bonus_crude,
          oilUnits: refineRow.oil_units,
        };
      }
    } catch {
      // No active refine — that's fine
    }

    return NextResponse.json({
      found: true,
      address,
      ...oilData,
      title,
      bonusCrude,
      totalCrude,
      totalFeesSol: bags.totalFeesSol,
      bagsActive: bags.isActive,
      partial: false,
      lastRefinedOilUnits: existing.last_refined_oil_units ?? 0,
      activeRefine,
    });
  } catch (err) {
    console.error("[wallet/stored]", err);
    return NextResponse.json(
      { error: "Failed to load stored wallet data" },
      { status: 500 }
    );
  }
}
