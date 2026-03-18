import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * POST /api/refine
 * Body: { address: string, oilUnits: number }
 *
 * Marks the wallet as refined at the given oil unit count.
 * Called by the frontend after the refine animation completes.
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

  const { error } = await supabase
    .from("wallets")
    .update({ last_refined_oil_units: oilUnits })
    .eq("wallet_address", address);

  if (error) {
    console.error("[refine]", error.message);
    return NextResponse.json(
      { error: "Failed to save refine state" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
