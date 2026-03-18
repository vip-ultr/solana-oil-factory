const BAGS_BASE_URL = "https://public-api-v2.bags.fm/api/v1";

interface BagsResponse<T> {
  success: boolean;
  response: T;
  error?: string;
}

interface ClaimablePosition {
  totalClaimableLamportsUserShare: number;
  claimableDisplayAmount: number;
  virtualPoolClaimableLamportsUserShare: number;
  dammPoolClaimableLamportsUserShare: number;
  programId: string;
  baseMint: string;
  isMigrated: boolean;
}

export interface BagsWalletData {
  totalFeesSol: number;
  bonusCrude: number;
  isActive: boolean;
  positionCount: number;
}

export interface BagsFeedToken {
  name: string;
  symbol: string;
  image: string;
  tokenMint: string;
}

async function bagsGet<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const apiKey = process.env.BAGS_API_KEY;
  if (!apiKey) throw new Error("BAGS_API_KEY not configured");

  const url = new URL(`${BAGS_BASE_URL}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) throw new Error(`Bags API error: ${res.status} ${res.statusText}`);

  const data: BagsResponse<T> = await res.json();
  if (!data.success) throw new Error(`Bags API failure: ${data.error ?? "Unknown error"}`);

  return data.response;
}

/**
 * Fetch claimable positions for a wallet and compute bonus CRUDE.
 * Returns safe defaults on any failure so it never blocks the main flow.
 */
export async function fetchBagsWalletData(wallet: string): Promise<BagsWalletData> {
  try {
    const positions = await bagsGet<ClaimablePosition[]>(
      "/token-launch/claimable-positions",
      { wallet }
    );

    const totalLamports = positions.reduce(
      (sum, p) => sum + (p.totalClaimableLamportsUserShare ?? 0),
      0
    );

    const totalFeesSol = totalLamports / 1_000_000_000;
    const bonusCrude = Math.floor(totalFeesSol * 500);

    return {
      totalFeesSol,
      bonusCrude,
      isActive: positions.length > 0,
      positionCount: positions.length,
    };
  } catch (err) {
    console.error("[bags] Failed to fetch wallet data:", err);
    return { totalFeesSol: 0, bonusCrude: 0, isActive: false, positionCount: 0 };
  }
}

/**
 * Fetch recent token launches from the Bags feed.
 * Returns up to 5 items. Returns [] on any failure.
 */
export async function fetchBagsFeed(): Promise<BagsFeedToken[]> {
  try {
    const feed = await bagsGet<Array<{
      name: string;
      symbol: string;
      image: string;
      tokenMint: string;
      status: string;
    }>>("/token-launch/feed");

    return feed.slice(0, 5).map(({ name, symbol, image, tokenMint }) => ({
      name,
      symbol,
      image,
      tokenMint,
    }));
  } catch (err) {
    console.error("[bags] Failed to fetch feed:", err);
    return [];
  }
}
