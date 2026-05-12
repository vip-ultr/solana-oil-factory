import { NextRequest, NextResponse } from "next/server";
import { computeReputation } from "@/lib/indexer/reputation";
import type { ReputationTier } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export interface WalletSummary {
  address: string;
  repScore: number;
  repTier: ReputationTier;
  claimCount: number;
  refineryCount: number;
  isOperator: boolean;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const raw: unknown = (body as Record<string, unknown>).addresses;
  const addresses: string[] = Array.isArray(raw) ? raw.slice(0, 15) : [];

  if (addresses.length === 0) {
    return NextResponse.json([] as WalletSummary[]);
  }

  const results = await Promise.all(
    addresses.map(async (addr): Promise<WalletSummary> => {
      try {
        const rep = await computeReputation(addr);
        return {
          address: addr,
          repScore: rep.score,
          repTier: rep.tier,
          claimCount: rep.context.claimCount,
          refineryCount: rep.context.distinctRefineriesClaimed,
          isOperator: rep.context.isOperator,
        };
      } catch {
        return {
          address: addr,
          repScore: 0,
          repTier: "flagged",
          claimCount: 0,
          refineryCount: 0,
          isOperator: false,
        };
      }
    }),
  );

  return NextResponse.json(results);
}
