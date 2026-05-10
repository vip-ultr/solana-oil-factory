// Token metadata fetcher — bridges the hardcoded token-registry
// to Helius's DAS getAssetBatch. We only hit Helius for mints
// that miss the hardcoded registry; the registry is the
// authoritative override (it controls token-mark variants, which
// the UI ultimately styles).
//
// Helius DAS is mainnet-only. On devnet / testnet we skip the
// network call and return an empty map — refineries against
// freshly-minted devnet tokens still fall through to the
// truncated-mint display.

import { SOLANA_CLUSTER } from "@/lib/program";
import {
  tokenMetaFor,
  hasRegistryEntry,
  type TokenMeta,
} from "./token-registry";

/**
 * Fetch DAS metadata for `mints` that aren't covered by the
 * hardcoded registry. Returns a map of mint → { name, symbol }
 * for the ones Helius resolved. Cluster + API-key guarded so
 * the function is a no-op when neither preconditions hold.
 */
export async function fetchMetadataFor(
  mints: string[],
): Promise<Map<string, { name: string; symbol: string }>> {
  const result = new Map<string, { name: string; symbol: string }>();
  if (mints.length === 0) return result;
  if (SOLANA_CLUSTER !== "mainnet") return result;
  if (!process.env.HELIUS_API_KEY) return result;

  // Lazy import to keep helius (which transitively pulls big
  // tx-history walkers) out of the bundle for routes that
  // don't actually need it.
  const { fetchTokenMetadataBatch } = await import("@/lib/helius");
  try {
    const meta = await fetchTokenMetadataBatch(mints);
    for (const [mint, m] of meta.entries()) {
      result.set(mint, { name: m.name, symbol: m.symbol });
    }
  } catch {
    // Helius blip — fall through with empty map. Caller's
    // registry-fallback path takes over.
  }
  return result;
}

/**
 * Resolve a mint to a TokenMeta, blending the hardcoded
 * registry with an optional metadata override. Synchronous —
 * call sites that want Helius should pass the pre-fetched map.
 */
export function tokenMetaWithOverride(
  mint: string,
  override: Map<string, { name: string; symbol: string }>,
): TokenMeta {
  if (hasRegistryEntry(mint)) return tokenMetaFor(mint);
  const live = override.get(mint);
  if (live) {
    return {
      symbol: live.symbol,
      name: live.name,
      variant: "default",
      decimals: 0, // helius DAS doesn't return decimals; mint
                   // fetch handles those callers that need them
    };
  }
  return tokenMetaFor(mint);
}
