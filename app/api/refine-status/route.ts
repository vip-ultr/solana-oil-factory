import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/refine-status?wallet=...
 *
 * Returns the current refine state for a wallet.
 * Possible statuses: "idle", "refining", "completed"
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet");

  if (!wallet) {
    return NextResponse.json({ error: "wallet param is required" }, { status: 400 });
  }

  const { data: refine, error } = await supabase
    .from("refines")
    .select("*")
    .eq("wallet_address", wallet)
    .eq("claimed", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !refine) {
    return NextResponse.json({ status: "idle" });
  }

  const now = new Date();
  const endsAt = new Date(refine.ends_at);
  const isComplete = now >= endsAt;

  if (isComplete) {
    // Lazily mark as completed in DB
    if (!refine.is_completed) {
      await supabase
        .from("refines")
        .update({ is_completed: true })
        .eq("id", refine.id);
    }

    return NextResponse.json({
      status: "completed",
      crudeAmount: refine.crude_amount,
      bagsCrude: refine.bags_crude,
      oilUnits: refine.oil_units,
      endsAt: refine.ends_at,
      startedAt: refine.started_at,
      durationMs: refine.duration_ms,
    });
  }

  // Still refining
  const remainingMs = endsAt.getTime() - now.getTime();

  return NextResponse.json({
    status: "refining",
    endsAt: refine.ends_at,
    startedAt: refine.started_at,
    durationMs: refine.duration_ms,
    remainingMs,
    crudeAmount: refine.crude_amount,
    bagsCrude: refine.bags_crude,
    oilUnits: refine.oil_units,
  });
}
