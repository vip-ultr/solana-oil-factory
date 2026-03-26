import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { calculateBagsOilData, getPrestigeTitle } from "@/lib/oilCalculator";

/**
 * POST /api/bags-refine/claim
 * Body: { address: string }
 *
 * Claims a completed Bags refine session:
 * 1. Verifies the timer has elapsed
 * 2. Marks the refine as claimed
 * 3. Upserts wallet with Bags CRUDE data and recomputes total_crude
 */
export async function POST(request: NextRequest) {
  let body: { address?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { address } = body;

  if (!address) {
    return NextResponse.json({ error: "address is required" }, { status: 400 });
  }

  // Find unclaimed Bags refine where timer has elapsed
  const now = new Date();
  const { data: refine, error: fetchErr } = await supabase
    .from("bags_refines")
    .select("*")
    .eq("wallet_address", address)
    .eq("claimed", false)
    .lte("ends_at", now.toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (fetchErr || !refine) {
    return NextResponse.json(
      { error: "No completed Bags refine found to claim" },
      { status: 400 }
    );
  }

  // Mark refine as claimed
  const { error: updateErr } = await supabase
    .from("bags_refines")
    .update({ claimed: true, is_completed: true })
    .eq("id", refine.id);

  if (updateErr) {
    console.error("[bags-refine/claim] update error:", updateErr.message);
    return NextResponse.json(
      { error: "Failed to claim Bags refine" },
      { status: 500 }
    );
  }

  // Read current Solana crude from wallets to compute correct total_crude
  let solanaCrude = 0;
  const { data: existing } = await supabase
    .from("wallets")
    .select("crude")
    .eq("wallet_address", address)
    .maybeSingle();

  if (existing) {
    solanaCrude = existing.crude ?? 0;
  }

  const bagsCrude = refine.crude_amount;
  const totalCrude = solanaCrude + bagsCrude;
  const prestigeTitle = getPrestigeTitle(totalCrude);
  const bagsOilData = calculateBagsOilData(refine.oil_units, refine.fee_crude / 2000);

  // Upsert to wallets table
  const { error: upsertErr } = await supabase
    .from("wallets")
    .upsert(
      {
        wallet_address: address,
        bags_crude: bagsCrude,
        bags_oil_units: refine.oil_units,
        bags_barrels: bagsOilData.barrels,
        last_refined_bags_oil_units: refine.oil_units,
        total_crude: totalCrude,
        prestige_title: prestigeTitle,
        last_updated: new Date().toISOString(),
      },
      { onConflict: "wallet_address" }
    );

  if (upsertErr) {
    console.error("[bags-refine/claim] upsert error:", upsertErr.message);
    return NextResponse.json(
      { error: "Failed to update leaderboard" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    bagsCrude,
    feeCrude: refine.fee_crude,
    txCrude: refine.tx_crude,
    totalCrude,
    prestigeTitle,
    oilUnits: refine.oil_units,
  });
}
