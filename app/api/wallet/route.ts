import { NextRequest, NextResponse } from "next/server";
import { getTransactionCount } from "@/lib/helius";
import { calculateOilData } from "@/lib/oilCalculator";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
  }

  try {
    const txCount = await getTransactionCount(address);
    const data = calculateOilData(txCount);

    return NextResponse.json({ address, ...data });
  } catch (error) {
    console.error("Failed to fetch wallet data:", error);
    return NextResponse.json({ error: "Failed to fetch wallet data" }, { status: 500 });
  }
}
