import { NextResponse } from "next/server";
import { fetchBagsFeed } from "@/lib/bags";

export async function GET() {
  const feed = await fetchBagsFeed();
  return NextResponse.json({ feed });
}
