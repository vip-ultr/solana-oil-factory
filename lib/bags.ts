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
  bagsCrude: number;
  isActive: boolean;
  positionCount: number;
  /** Token mints from the wallet's claimable fee positions */
  tokenMints: string[];
}

export interface BagsFeedToken {
  name: string;
  symbol: string;
  image: string;
  tokenMint: string;
  description?: string;
  twitter?: string;
  website?: string;
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
 * Fetch claimable positions for a wallet and compute Bags Refinery $CRUDE.
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
    const bagsCrude = Math.floor(totalFeesSol * 1000);

    return {
      totalFeesSol,
      bagsCrude,
      isActive: positions.length > 0,
      positionCount: positions.length,
      tokenMints: positions.map((p) => p.baseMint).filter(Boolean),
    };
  } catch (err) {
    console.error("[bags] Failed to fetch wallet data:", err);
    return { totalFeesSol: 0, bagsCrude: 0, isActive: false, positionCount: 0, tokenMints: [] };
  }
}

/**
 * Fetch recent token launches from the Bags feed.
 * Returns up to 5 items for display. Returns [] on any failure.
 */
export async function fetchBagsFeed(): Promise<BagsFeedToken[]> {
  try {
    const feed = await fetchBagsFeedRaw();
    return feed.slice(0, 5).map(({ name, symbol, description, image, tokenMint, twitter, website }) => ({
      name,
      symbol,
      description,
      image,
      tokenMint,
      twitter: twitter || undefined,
      website: website || undefined,
    }));
  } catch (err) {
    console.error("[bags] Failed to fetch feed:", err);
    return [];
  }
}

/**
 * Fetch ALL token mints from the Bags feed.
 * Used to build a set of known Bags tokens for swap identification.
 */
export async function fetchBagsFeedMints(): Promise<string[]> {
  try {
    const feed = await fetchBagsFeedRaw();
    return feed.map((t) => t.tokenMint).filter(Boolean);
  } catch (err) {
    console.error("[bags] Failed to fetch feed mints:", err);
    return [];
  }
}

async function fetchBagsFeedRaw(): Promise<Array<{
  name: string;
  symbol: string;
  description?: string;
  image: string;
  tokenMint: string;
  status: string;
  twitter?: string;
  website?: string;
}>> {
  return bagsGet("/token-launch/feed");
}
