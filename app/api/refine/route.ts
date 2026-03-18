import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { calculateOilData } from "@/lib/oilCalculator";

/**
 * POST /api/refine
 * Body: { address: string, oilUnits: number }
 *
 * Marks the wallet as refined and upserts it to the leaderboard.
 * This is the ONLY path that writes wallet data to Supabase —
 * no refine = no leaderboard entry.
 */
export async function POST(request: NextRequest) {
  let body: { address?: string; oilUnits?: number };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { address, oilUnits } = body;

  if (!address || typeof oilUnits !== "number") {
    return NextResponse.json(
      { error: "address (string) and oilUnits (number) are required" },
      { status: 400 }
    );
  }

  // Compute stats from oil units
  const data = calculateOilData(oilUnits);

  // Upsert wallet with leaderboard stats + refine state in a single write
  const { error } = await supabase
    .from("wallets")
    .upsert(
      {
        wallet_address: address,
        crude: data.crude,
        oil_units: data.oilUnits,
        barrels: data.barrels,
        prestige_title: data.title,
        last_refined_oil_units: oilUnits,
        last_updated: new Date().toISOString(),
      },
      { onConflict: "wallet_address" }
    );

  if (error) {
    console.error("[refine]", error.message);
    return NextResponse.json(
      { error: "Failed to save refine state" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
