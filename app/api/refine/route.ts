import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getTransactionCount } from "@/lib/helius";

// Allow up to 60s for Helius pagination on whale wallets.
export const maxDuration = 60;

/**
 * POST /api/refine
 * Body: { address: string }
 *
 * Creates a timed Solana refine session.
 *
 * Server-side authoritative: the wallet's tx count is fetched from Helius here,
 * not trusted from the request body. (The earlier API accepted client-supplied
 * `oilUnits` which was trivially spoofable — anyone could mint themselves to
 * the top of the leaderboard by POSTing an inflated value.)
 *
 * The Bags bonus is no longer rolled in here — Bags has its own dedicated
 * /api/bags-refine flow with its own server-side verification.
 */
export async function POST(request: NextRequest) {
  let body: { address?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { address } = body;

  if (!address || typeof address !== "string") {
    return NextResponse.json(
      { error: "address (string) is required" },
      { status: 400 }
    );
  }

  // Check for existing unclaimed refine
  const { data: existing } = await supabase
    .from("refines")
    .select("id")
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

  // Server-side: fetch the wallet's current tx count from Helius.
  let oilUnits: number;
  try {
    const result = await getTransactionCount(address);
    oilUnits = result.count;
  } catch (err) {
    console.error("[/api/refine] getTransactionCount failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch wallet transaction count" },
      { status: 502 }
    );
  }

  if (oilUnits <= 0) {
    return NextResponse.json(
      { error: "No transactions found for this wallet" },
      { status: 400 }
    );
  }

  // Calculate CRUDE with 15,000 cap
  const CRUDE_CAP = 15000;
  const rawCrude = Math.floor(oilUnits / 10);
  const cappedCrude = Math.min(rawCrude, CRUDE_CAP);

  // Calculate refine duration: 10 oil units = 1 minute, min 30 min, max 6 hours
  const durationMinutes = Math.max(30, Math.min(oilUnits / 10, 360));
  const durationMs = Math.round(durationMinutes * 60 * 1000);
  const now = new Date();
  const endsAt = new Date(now.getTime() + durationMs);

  const { error } = await supabase.from("refines").insert({
    wallet_address: address,
    oil_units: oilUnits,
    crude_amount: cappedCrude,
    bags_crude: 0,
    duration_ms: durationMs,
    started_at: now.toISOString(),
    ends_at: endsAt.toISOString(),
    is_completed: false,
    claimed: false,
  });

  if (error) {
    console.error("[refine]", error.message);
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
    oilUnits,
    crudeAmount: cappedCrude,
    bagsCrude: 0,
  });
}
