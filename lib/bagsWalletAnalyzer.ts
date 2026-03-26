import {
  fetchSwapTransactions,
  fetchTokenMetadataBatch,
  type HeliusEnrichedTransaction,
} from "@/lib/helius";
import {
  getCachedAnalytics,
  setCachedAnalytics,
  type BagsAnalyticsData,
} from "@/lib/bagsAnalyticsCache";

const EMPTY_ANALYTICS: BagsAnalyticsData = {
  unique_tokens_traded: 0,
  total_swap_transactions: 0,
  tokens: [],
};

function isBagsToken(mint: string, name: string, symbol: string): boolean {
  return (
    mint.endsWith("BAGS") ||
    symbol.toLowerCase().includes("bags") ||
    name.toLowerCase().includes("bags")
  );
}

/**
 * Extracts token metadata directly from Enhanced Transactions API responses.
 * The API returns tokenName/tokenSymbol in tokenTransfers, so we try that first.
 * Returns a Map of mint → { name, symbol } for tokens that had inline metadata.
 * Also returns the set of mints that are missing metadata (need DAS fallback).
 */
function extractTokenInfo(txns: HeliusEnrichedTransaction[]): {
  knownTokens: Map<string, { name: string; symbol: string }>;
  unknownMints: Set<string>;
} {
  const knownTokens = new Map<string, { name: string; symbol: string }>();
  const allMints = new Set<string>();

  for (const tx of txns) {
    if (tx.tokenTransfers) {
      for (const t of tx.tokenTransfers) {
        if (!t.mint) continue;
        allMints.add(t.mint);
        // Enhanced API includes tokenName/tokenSymbol in tokenTransfers
        if ((t.tokenName || t.tokenSymbol) && !knownTokens.has(t.mint)) {
          knownTokens.set(t.mint, {
            name: t.tokenName ?? "",
            symbol: t.tokenSymbol ?? "",
          });
        }
      }
    }
    const swap = tx.events?.swap;
    if (swap) {
      for (const input of swap.tokenInputs ?? []) {
        if (input.mint) allMints.add(input.mint);
      }
      for (const output of swap.tokenOutputs ?? []) {
        if (output.mint) allMints.add(output.mint);
      }
    }
  }

  const unknownMints = new Set<string>();
  for (const mint of allMints) {
    if (!knownTokens.has(mint)) unknownMints.add(mint);
  }

  return { knownTokens, unknownMints };
}

/**
 * Returns Bags swap analytics for a wallet.
 * Checks Supabase cache first (10 min TTL), falls back to live Helius computation.
 * Never throws — returns safe defaults on any failure.
 */
export async function getBagsAnalytics(
  wallet: string
): Promise<BagsAnalyticsData> {
  try {
    // Step 1: Check cache
    const cached = await getCachedAnalytics(wallet);
    if (cached) {
      console.log("[bagsAnalyzer] Cache hit for", wallet);
      return cached;
    }

    // Step 2: Fetch swap transactions
    const swaps = await fetchSwapTransactions(wallet);
    if (swaps.length === 0) {
      setCachedAnalytics(wallet, EMPTY_ANALYTICS).catch(() => {});
      return EMPTY_ANALYTICS;
    }

    // Step 3: Extract token info from Enhanced API response first
    const { knownTokens, unknownMints } = extractTokenInfo(swaps);

    // Step 4: Fallback to DAS for mints missing metadata
    if (unknownMints.size > 0) {
      const dasMetadata = await fetchTokenMetadataBatch([...unknownMints]);
      for (const [mint, meta] of dasMetadata) {
        knownTokens.set(mint, meta);
      }
    }

    // Step 5: Identify Bags tokens (by metadata OR mint suffix "BAGS")
    const bagsTokens = new Map<string, string>(); // mint → display name
    for (const [mint, meta] of knownTokens) {
      if (isBagsToken(mint, meta.name, meta.symbol)) {
        bagsTokens.set(mint, meta.symbol || meta.name || mint.slice(0, 8));
      }
    }
    // Also catch mints ending in BAGS that had no metadata at all
    for (const tx of swaps) {
      const txMints: string[] = [];
      if (tx.tokenTransfers) {
        for (const t of tx.tokenTransfers) {
          if (t.mint) txMints.push(t.mint);
        }
      }
      const swap = tx.events?.swap;
      if (swap) {
        for (const input of swap.tokenInputs ?? []) {
          if (input.mint) txMints.push(input.mint);
        }
        for (const output of swap.tokenOutputs ?? []) {
          if (output.mint) txMints.push(output.mint);
        }
      }
      for (const mint of txMints) {
        if (mint.endsWith("BAGS") && !bagsTokens.has(mint)) {
          bagsTokens.set(mint, mint.slice(0, 8));
        }
      }
    }

    // Step 6: Count swap transactions involving at least one Bags token
    let bagsSwapCount = 0;
    for (const tx of swaps) {
      const txMints = new Set<string>();
      if (tx.tokenTransfers) {
        for (const t of tx.tokenTransfers) {
          if (t.mint) txMints.add(t.mint);
        }
      }
      const swap = tx.events?.swap;
      if (swap) {
        for (const input of swap.tokenInputs ?? []) {
          if (input.mint) txMints.add(input.mint);
        }
        for (const output of swap.tokenOutputs ?? []) {
          if (output.mint) txMints.add(output.mint);
        }
      }

      for (const mint of txMints) {
        if (bagsTokens.has(mint)) {
          bagsSwapCount++;
          break;
        }
      }
    }

    // Step 7: Build result
    const uniqueTokenNames = [...new Set(bagsTokens.values())];
    const analytics: BagsAnalyticsData = {
      unique_tokens_traded: bagsTokens.size,
      total_swap_transactions: bagsSwapCount,
      tokens: uniqueTokenNames,
    };

    // Step 8: Fire-and-forget cache write
    setCachedAnalytics(wallet, analytics).catch(() => {});

    return analytics;
  } catch (err) {
    console.error("[bagsAnalyzer] Failed for", wallet, err);
    return EMPTY_ANALYTICS;
  }
}
