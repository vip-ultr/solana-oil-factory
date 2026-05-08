import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { fetchBagsWalletData, fetchBagsFeedMints } from "@/lib/bags";
import { getBagsAnalytics } from "@/lib/bagsWalletAnalyzer";

// Bags analytics + claimable-positions can each take 10–30s.
export const maxDuration = 60;

/**
 * POST /api/bags-refine
 * Body: { address: string }
 *
 * Creates a timed Bags refine session. Server-side authoritative on swapCount
 * and totalFeesSol — client-supplied values are ignored. (The earlier API
 * accepted both from the body, which let anyone POST inflated numbers and
 * mint themselves Bags CRUDE without actually trading on Bags.)
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

  // Server-side: fetch fee positions + analytics in parallel.
  const [bagsResult, feedMintsResult] = await Promise.allSettled([
    fetchBagsWalletData(address),
    fetchBagsFeedMints(),
  ]);

  const bags =
    bagsResult.status === "fulfilled"
      ? bagsResult.value
      : { totalFeesSol: 0, bagsCrude: 0, isActive: false, positionCount: 0, tokenMints: [] as string[] };

  const feedMints = feedMintsResult.status === "fulfilled" ? feedMintsResult.value : [];
  const knownBagsMints = new Set<string>([...feedMints, ...bags.tokenMints]);

  let analytics: { total_swap_transactions: number };
  try {
    analytics = await getBagsAnalytics(address, knownBagsMints);
  } catch (err) {
    console.error("[/api/bags-refine] getBagsAnalytics failed:", err);
    return NextResponse.json(
      { error: "Failed to compute Bags analytics" },
      { status: 502 }
    );
  }

  const swapCount = analytics.total_swap_transactions;
  const totalFeesSol = bags.totalFeesSol;

  // Calculate CRUDE (no cap on Bags)
  const BAGS_CRUDE_RATE = 2;
  const feeCrude = Math.floor(totalFeesSol * 2000);
  const txCrude = Math.floor(swapCount / BAGS_CRUDE_RATE);
  const crudeAmount = feeCrude + txCrude;

  if (crudeAmount <= 0) {
    return NextResponse.json(
      { error: "No Bags activity found for this wallet" },
      { status: 400 }
    );
  }

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
    swapCount,
    totalFeesSol,
    crudeAmount,
    feeCrude,
    txCrude,
  });
}
