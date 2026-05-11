// Server-side passthrough for indexer events (Phase 2b: Supabase).
// Used by client surfaces (dashboard, wallet profile activity)
// that need to filter by wallet / refinery / event name without
// importing server-only modules.

import { NextResponse } from "next/server";
import { queryEvents } from "@/lib/indexer/store";
import { buildActivityFeed } from "@/lib/indexer/ui";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const refinery = url.searchParams.get("refinery") ?? undefined;
  const wallet = url.searchParams.get("wallet") ?? undefined;
  const eventName = url.searchParams.get("eventName") ?? undefined;
  const limit = Math.min(
    200,
    Math.max(1, parseInt(url.searchParams.get("limit") ?? "50", 10) || 50),
  );
  const shape = url.searchParams.get("shape") ?? "raw";

  try {
    if (shape === "activity") {
      const events = await buildActivityFeed({
        refinery,
        wallet,
        eventName: eventName as never,
        limit,
      });
      return NextResponse.json({ events });
    }
    const events = await queryEvents({
      refinery,
      wallet,
      eventName,
      limit,
    });
    return NextResponse.json({ events });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to fetch events",
        events: [],
      },
      { status: 500 },
    );
  }
}
