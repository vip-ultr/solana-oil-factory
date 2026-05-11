import { NextResponse } from "next/server";
import { fetchTreasuryConfig } from "@/lib/onchain/treasury";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/treasury — returns the live treasury_config from devnet.
 * Used by the /admin page to render current authorities and gate
 * the rotation form by comparing the connected wallet to
 * treasury_config.admin.
 */
export async function GET() {
  const cfg = await fetchTreasuryConfig();
  if (!cfg) {
    return NextResponse.json(
      { error: "treasury_config not initialised on this cluster" },
      { status: 404 },
    );
  }
  return NextResponse.json(cfg);
}
