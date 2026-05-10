// Hardcoded mint → display metadata for known tokens. Replaces a
// proper Helius DAS / Metaplex Metadata fetch for now — it's a
// strict upgrade compared to showing every refinery as
// "GgUtcQ…xqSQ" with no name.
//
// Add entries here as new refineries launch against named mints.
// Anything not in the registry falls back to a truncated mint
// pubkey + the "default" token-mark variant.

import type { TokenMarkVariant } from "@/lib/mock-data";

export interface TokenMeta {
  symbol: string;
  name: string;
  variant: TokenMarkVariant;
  decimals: number;
  /** Optional spot price in USD; null = unknown, no USD figures shown. */
  priceUsd?: number;
}

const REGISTRY: Record<string, TokenMeta> = {
  // === Demo refineries on devnet (launched via launch-demo-refineries.cts) ===
  GgUtcQyetKnxnnvZzGAYBcz1sh8kDmjYz8nfX4VTxqSQ: {
    symbol: "BARREL",
    name: "Barrel Token",
    variant: "default",
    decimals: 6,
  },
  DSSi1qijGJYgUxFrgTq5tefTq316jkU8rk4ZCgg23DZZ: {
    symbol: "REFINE",
    name: "Refine Coin",
    variant: "default",
    decimals: 6,
  },
  HEPiBHYAUXyVjrhPNKN8tXJjyUQdHBQajQ41qgrsbDz4: {
    symbol: "CRUDE",
    name: "Crude Holdings",
    variant: "default",
    decimals: 9,
  },

  // === Mainnet tokens (in case a refinery is launched against them) ===
  DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263: {
    symbol: "BONK",
    name: "Bonk",
    variant: "bonk",
    decimals: 5,
  },
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: {
    symbol: "USDC",
    name: "USD Coin",
    variant: "default",
    decimals: 6,
    priceUsd: 1,
  },
  EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm: {
    symbol: "WIF",
    name: "dogwifhat",
    variant: "wif",
    decimals: 6,
  },
};

export function tokenMetaFor(mint: string): TokenMeta {
  const meta = REGISTRY[mint];
  if (meta) return meta;
  return {
    symbol: shortMint(mint),
    name: "Unknown token",
    variant: "default",
    decimals: 0, // unknown — formatters fall back to base units
  };
}

/** Whether `mint` has a curated entry in the hardcoded registry.
 *  Used by metadata.ts to decide if a Helius lookup is worth
 *  attempting (registered mints take priority — their variants
 *  control how the UI renders the token mark). */
export function hasRegistryEntry(mint: string): boolean {
  return mint in REGISTRY;
}

export function shortMint(mint: string): string {
  if (mint.length <= 12) return mint;
  return `${mint.slice(0, 6)}…${mint.slice(-4)}`;
}

export function shortPubkey(pk: string): string {
  if (pk.length <= 12) return pk;
  return `${pk.slice(0, 4)}…${pk.slice(-4)}`;
}
