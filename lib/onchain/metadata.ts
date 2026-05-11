// Token metadata fetcher — bridges the hardcoded registry to
// the Metaplex Token Metadata Program (devnet + mainnet) and
// then to Helius DAS (mainnet only). Best-effort: anything
// unresolved falls back to the truncated-mint registry default.

import { SOLANA_CLUSTER } from "@/lib/program";
import {
  tokenMetaFor,
  hasRegistryEntry,
  type TokenMeta,
} from "./token-registry";
import { fetchMetadataForMints, type MetaplexMetadata } from "./metaplex";

export interface ResolvedMeta {
  name: string;
  symbol: string;
  /** Direct image URL (Phantom-style logo). Resolved from the
   *  Metaplex JSON URI when present. */
  logoUrl?: string;
}

const URI_FETCH_TIMEOUT_MS = 4_000;

/**
 * Fetch the Metaplex JSON pointed to by `uri` and extract the
 * `image` field. Times out fast — failure just means no logo.
 */
async function resolveLogoFromUri(uri: string): Promise<string | undefined> {
  if (!uri) return undefined;
  // Some mints point to a non-HTTP URI (e.g. arweave native or
  // ipfs). Browsers handle most of them via gateways already
  // resolvable from the URI string.
  let normalized = uri;
  if (uri.startsWith("ipfs://")) {
    normalized = `https://ipfs.io/ipfs/${uri.slice("ipfs://".length)}`;
  }
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), URI_FETCH_TIMEOUT_MS);
    const res = await fetch(normalized, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return undefined;
    const json = (await res.json()) as { image?: string };
    if (!json || typeof json.image !== "string") return undefined;
    if (json.image.startsWith("ipfs://")) {
      return `https://ipfs.io/ipfs/${json.image.slice("ipfs://".length)}`;
    }
    return json.image;
  } catch {
    return undefined;
  }
}

/**
 * Resolve display metadata for `mints` not covered by the
 * hardcoded registry. Tries Metaplex first (every cluster) then
 * Helius DAS (mainnet only). For Metaplex hits, also fetches the
 * off-chain JSON to grab the logo image URL.
 */
export async function fetchMetadataFor(
  mints: string[],
): Promise<Map<string, ResolvedMeta>> {
  const result = new Map<string, ResolvedMeta>();
  if (mints.length === 0) return result;

  // Step 1 — Metaplex Token Metadata Program PDAs (devnet + mainnet).
  let metaplex: Map<string, MetaplexMetadata> = new Map();
  try {
    metaplex = await fetchMetadataForMints(mints);
  } catch {
    metaplex = new Map();
  }

  // Resolve logo URLs in parallel — bounded concurrency via
  // Promise.all over the small mint set we already filtered.
  const logoPromises: Promise<void>[] = [];
  for (const [mint, m] of metaplex.entries()) {
    if (!m.name && !m.symbol) continue;
    const entry: ResolvedMeta = {
      name: m.name || m.symbol,
      symbol: m.symbol || m.name,
    };
    result.set(mint, entry);
    if (m.uri) {
      logoPromises.push(
        resolveLogoFromUri(m.uri).then((logo) => {
          if (logo) entry.logoUrl = logo;
        }),
      );
    }
  }
  await Promise.all(logoPromises);

  // Step 2 — Helius DAS for mints that lacked a Metaplex PDA.
  const stillMissing = mints.filter((m) => !result.has(m));
  if (
    stillMissing.length > 0 &&
    SOLANA_CLUSTER === "mainnet" &&
    process.env.HELIUS_API_KEY
  ) {
    try {
      const { fetchTokenMetadataBatch } = await import("@/lib/helius");
      const helius = await fetchTokenMetadataBatch(stillMissing);
      for (const [mint, m] of helius.entries()) {
        result.set(mint, { name: m.name, symbol: m.symbol });
      }
    } catch {
      /* ignored */
    }
  }
  return result;
}

/**
 * Resolve a mint to a TokenMeta + optional logoUrl, blending the
 * hardcoded registry with a pre-fetched override map.
 */
export function tokenMetaWithOverride(
  mint: string,
  override: Map<string, ResolvedMeta>,
): TokenMeta & { logoUrl?: string } {
  if (hasRegistryEntry(mint)) return tokenMetaFor(mint);
  const live = override.get(mint);
  if (live) {
    return {
      symbol: live.symbol,
      name: live.name,
      variant: "default",
      decimals: 0,
      logoUrl: live.logoUrl,
    };
  }
  return tokenMetaFor(mint);
}
