import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("wallets")
    .select("wallet_address, crude, bonus_crude, total_crude, oil_units, barrels, prestige_title, last_updated")
    .order("total_crude", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[leaderboard]", error.message);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }

  return NextResponse.json({ leaderboard: data });
}
