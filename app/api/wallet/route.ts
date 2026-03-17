import { NextRequest, NextResponse } from "next/server";
import { getTransactionCount } from "@/lib/helius";
import { calculateOilData } from "@/lib/oilCalculator";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
  }

  try {
    const txCount = await getTransactionCount(address);
    const data = calculateOilData(txCount);

    // Fire-and-forget upsert — never blocks the response
    supabase
      .from("wallets")
      .upsert(
        {
          wallet_address: address,
          crude: data.crude,
          oil_units: data.oilUnits,
          barrels: data.barrels,
          prestige_title: data.title,
          last_updated: new Date().toISOString(),
        },
        { onConflict: "wallet_address" }
      )
      .then(({ error }) => {
        if (error) console.error("[supabase upsert]", error.message);
      });

    return NextResponse.json({ address, ...data });
  } catch (error) {
    console.error("Failed to fetch wallet data:", error);
    return NextResponse.json({ error: "Failed to fetch wallet data" }, { status: 500 });
  }
}
