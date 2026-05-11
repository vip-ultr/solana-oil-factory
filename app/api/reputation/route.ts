// Server-side reputation lookup. Wallet pubkey in, score +
// tier + signal breakdown out. Used by the dashboard and
// any future client surface that needs the live v1 score
// without bundling the indexer JSON into the client chunk.

import { NextResponse } from "next/server";
import { computeReputation } from "@/lib/indexer/reputation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const wallet = url.searchParams.get("wallet");
  if (!wallet) {
    return NextResponse.json(
      { error: "wallet query param required" },
      { status: 400 },
    );
  }
  try {
    const result = computeReputation(wallet);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}
