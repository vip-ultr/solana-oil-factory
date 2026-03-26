import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * POST /api/bags-refine
 * Body: { address: string, swapCount: number, totalFeesSol: number }
 *
 * Creates a timed Bags refine session in the `bags_refines` table.
 */
export async function POST(request: NextRequest) {
  let body: { address?: string; swapCount?: number; totalFeesSol?: number };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { address, swapCount, totalFeesSol } = body;

  if (!address || typeof swapCount !== "number" || typeof totalFeesSol !== "number") {
    return NextResponse.json(
      { error: "address (string), swapCount (number), and totalFeesSol (number) are required" },
      { status: 400 }
    );
  }

  // Check for existing unclaimed Bags refine
  const { data: existing } = await supabase
    .from("bags_refines")
    .select("id")
    .eq("wallet_address", address)
    .eq("claimed", false)
    .limit(1)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "A Bags refine is already in progress for this wallet" },
      { status: 409 }
    );
  }

  // Calculate CRUDE (no cap)
  const BAGS_CRUDE_RATE = 2;
  const feeCrude = Math.floor(totalFeesSol * 2000);
  const txCrude = Math.floor(swapCount / BAGS_CRUDE_RATE);
  const crudeAmount = feeCrude + txCrude;

  // Duration: min 30 min, max 6 hours
  const durationMinutes = Math.max(30, Math.min(crudeAmount, 360));
  const durationMs = Math.round(durationMinutes * 60 * 1000);
  const now = new Date();
  const endsAt = new Date(now.getTime() + durationMs);

  const { error } = await supabase.from("bags_refines").insert({
    wallet_address: address,
    oil_units: swapCount,
    crude_amount: crudeAmount,
    fee_crude: feeCrude,
    tx_crude: txCrude,
    duration_ms: durationMs,
    started_at: now.toISOString(),
    ends_at: endsAt.toISOString(),
    is_completed: false,
    claimed: false,
  });

  if (error) {
    console.error("[bags-refine]", error.message);
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A Bags refine is already in progress for this wallet" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to start Bags refine session" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    endsAt: endsAt.toISOString(),
    durationMs,
    crudeAmount,
    feeCrude,
    txCrude,
  });
}
