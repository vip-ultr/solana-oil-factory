// Lightweight read endpoint that returns the live refinery
// list. Mirrors what server components get from
// fetchAllRefineries(); exposed so client surfaces (CommandPalette
// autocomplete, future client-side filters) can hydrate without
// importing server-only modules.

import { NextResponse } from "next/server";
import { fetchAllRefineries } from "@/lib/onchain/refineries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const refineries = await fetchAllRefineries();
    return NextResponse.json(
      { refineries },
      {
        // Tell the browser to cache for 30s — refineries change
        // when someone launches/closes/deposits, but the palette
        // is a navigation aid where a few seconds of staleness
        // is fine.
        headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
      },
    );
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to fetch refineries",
        refineries: [],
      },
      { status: 500 },
    );
  }
}
