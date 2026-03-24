import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { calculateOilData, getPrestigeTitle } from "@/lib/oilCalculator";

/**
 * POST /api/refine/claim
 * Body: { address: string }
 *
 * Claims a completed refine session:
 * 1. Verifies the refine timer has elapsed
 * 2. Marks the refine as claimed
 * 3. Upserts the wallet into the `wallets` table (leaderboard entry)
 *
 * This is the ONLY path that writes to the `wallets` table.
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

  // Find unclaimed refine where timer has elapsed
  const now = new Date();
  const { data: refine, error: fetchErr } = await supabase
    .from("refines")
    .select("*")
    .eq("wallet_address", address)
    .eq("claimed", false)
    .lte("ends_at", now.toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (fetchErr || !refine) {
    return NextResponse.json(
      { error: "No completed refine found to claim" },
      { status: 400 }
    );
  }

  // Mark refine as claimed + completed
  const { error: updateErr } = await supabase
    .from("refines")
    .update({ claimed: true, is_completed: true })
    .eq("id", refine.id);

  if (updateErr) {
    console.error("[refine/claim] update error:", updateErr.message);
    return NextResponse.json(
      { error: "Failed to claim refine" },
      { status: 500 }
    );
  }

  // Calculate stats for the wallets table
  const oilData = calculateOilData(refine.oil_units);
  const totalCrude = refine.crude_amount + refine.bags_crude;
  const prestigeTitle = getPrestigeTitle(totalCrude);

  // Upsert to wallets table (leaderboard entry)
  const { error: upsertErr } = await supabase
    .from("wallets")
    .upsert(
      {
        wallet_address: address,
        crude: refine.crude_amount,
        bags_crude: refine.bags_crude,
        total_crude: totalCrude,
        oil_units: refine.oil_units,
        barrels: oilData.barrels,
        prestige_title: prestigeTitle,
        last_refined_oil_units: refine.oil_units,
        last_updated: new Date().toISOString(),
      },
      { onConflict: "wallet_address" }
    );

  if (upsertErr) {
    console.error("[refine/claim] upsert error:", upsertErr.message);
    return NextResponse.json(
      { error: "Failed to update leaderboard" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    crude: refine.crude_amount,
    bagsCrude: refine.bags_crude,
    totalCrude,
    prestigeTitle,
    oilUnits: refine.oil_units,
  });
}
