import {
  fetchSwapTransactions,
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

/**
 * Collects all token mints referenced in a swap transaction.
 */
function getSwapMints(tx: HeliusEnrichedTransaction): Set<string> {
  const mints = new Set<string>();
  if (tx.tokenTransfers) {
    for (const t of tx.tokenTransfers) {
      if (t.mint) mints.add(t.mint);
    }
  }
  const swap = tx.events?.swap;
  if (swap) {
    for (const input of swap.tokenInputs ?? []) {
      if (input.mint) mints.add(input.mint);
    }
    for (const output of swap.tokenOutputs ?? []) {
      if (output.mint) mints.add(output.mint);
    }
  }
  return mints;
}

/**
 * Returns Bags swap analytics for a wallet.
 *
 * @param knownBagsMints - Set of token mints known to be Bags tokens
 *   (from the Bags feed + claimable positions). Swaps involving any of
 *   these mints are counted as Bags swaps.
 *
 * Checks Supabase cache first (10 min TTL), falls back to live Helius computation.
 * Never throws — returns safe defaults on any failure.
 */
export async function getBagsAnalytics(
  wallet: string,
  knownBagsMints: Set<string>
): Promise<BagsAnalyticsData> {
  try {
    // Step 1: Check cache
    const cached = await getCachedAnalytics(wallet);
    if (cached) {
      console.log("[bagsAnalyzer] Cache hit for", wallet);
      return cached;
    }

    // If we have no known Bags mints, we can't identify any Bags swaps
    if (knownBagsMints.size === 0) {
      console.log("[bagsAnalyzer] No known Bags mints — skipping swap scan");
      setCachedAnalytics(wallet, EMPTY_ANALYTICS).catch(() => {});
      return EMPTY_ANALYTICS;
    }

    // Step 2: Fetch swap transactions from Helius
    const swaps = await fetchSwapTransactions(wallet);
    if (swaps.length === 0) {
      setCachedAnalytics(wallet, EMPTY_ANALYTICS).catch(() => {});
      return EMPTY_ANALYTICS;
    }

    // Step 3: Count swaps involving known Bags tokens
    let bagsSwapCount = 0;
    const matchedMints = new Set<string>();

    for (const tx of swaps) {
      const txMints = getSwapMints(tx);
      for (const mint of txMints) {
        if (knownBagsMints.has(mint)) {
          bagsSwapCount++;
          matchedMints.add(mint);
          break; // count each tx only once
        }
      }
    }

    // Step 4: Build result
    const analytics: BagsAnalyticsData = {
      unique_tokens_traded: matchedMints.size,
      total_swap_transactions: bagsSwapCount,
      tokens: [...matchedMints],
    };

    // Step 5: Fire-and-forget cache write
    setCachedAnalytics(wallet, analytics).catch(() => {});

    return analytics;
  } catch (err) {
    console.error("[bagsAnalyzer] Failed for", wallet, err);
    return EMPTY_ANALYTICS;
  }
}
