import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 100, 1), 100) : 100;

  const { data, error } = await supabase
    .from("wallets")
    .select("wallet_address, crude, bags_crude, total_crude, oil_units, barrels, prestige_title, last_updated")
    .gt("total_crude", 0)
    .order("total_crude", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[leaderboard]", error.message);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }

  return NextResponse.json({ leaderboard: data });
}
