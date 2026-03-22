import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * POST /api/refine
 * Body: { address: string, oilUnits: number, bonusCrude?: number }
 *
 * Creates a timed refine session in the `refines` table.
 * CRUDE is locked until the timer completes and the user claims.
 * The `wallets` table (leaderboard) is NOT touched here — only on claim.
 */
export async function POST(request: NextRequest) {
  let body: { address?: string; oilUnits?: number; bonusCrude?: number };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { address, oilUnits, bonusCrude } = body;

  if (!address || typeof oilUnits !== "number") {
    return NextResponse.json(
      { error: "address (string) and oilUnits (number) are required" },
      { status: 400 }
    );
  }

  // Check for existing unclaimed refine
  const { data: existing } = await supabase
    .from("refines")
    .select("id, ends_at, claimed")
    .eq("wallet_address", address)
    .eq("claimed", false)
    .limit(1)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "A refine is already in progress for this wallet" },
      { status: 409 }
    );
  }

  // Calculate CRUDE with 15,000 cap
  const CRUDE_CAP = 15000;
  const rawCrude = Math.floor(oilUnits / 10);
  const cappedCrude = Math.min(rawCrude, CRUDE_CAP);
  const safeBonusCrude = typeof bonusCrude === "number" ? bonusCrude : 0;
  const cappedBonus = Math.min(safeBonusCrude, CRUDE_CAP - cappedCrude);

  // Calculate refine duration: 10 oil units = 1 minute, max 6 hours
  const durationMinutes = Math.min(oilUnits / 10, 360);
  const durationMs = Math.round(durationMinutes * 60 * 1000);
  const now = new Date();
  const endsAt = new Date(now.getTime() + durationMs);

  // Insert refine session
  const { error } = await supabase.from("refines").insert({
    wallet_address: address,
    oil_units: oilUnits,
    crude_amount: cappedCrude,
    bonus_crude: cappedBonus,
    duration_ms: durationMs,
    started_at: now.toISOString(),
    ends_at: endsAt.toISOString(),
    is_completed: false,
    claimed: false,
  });

  if (error) {
    console.error("[refine]", error.message);
    // Handle unique constraint violation (race condition)
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A refine is already in progress for this wallet" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to start refine session" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    endsAt: endsAt.toISOString(),
    durationMs,
    crudeAmount: cappedCrude,
    bonusCrude: cappedBonus,
  });
}
