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

// Bags/Meteora program IDs — swaps through these programs are Bags swaps.
// Source: https://docs.bags.fm/principles/program-ids
const BAGS_PROGRAM_IDS = new Set([
  "dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN", // Meteora Dynamic Bonding Curve
  "cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG", // Meteora DAMM (AMM post-migration)
]);

/**
 * Checks if a transaction interacts with any Bags program.
 * Uses accountData (all accounts involved in the tx) to check for program IDs.
 */
function isBagsSwap(tx: HeliusEnrichedTransaction): boolean {
  if (tx.accountData) {
    for (const entry of tx.accountData) {
      if (BAGS_PROGRAM_IDS.has(entry.account)) {
        return true;
      }
    }
  }
  return false;
}

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

function getTokenLabels(tx: HeliusEnrichedTransaction): Array<{
  mint: string;
  symbol: string;
  name: string;
}> {
  const labels = new Map<string, { symbol: string; name: string }>();
  if (tx.tokenTransfers) {
    for (const t of tx.tokenTransfers) {
      if (!t.mint) continue;
      labels.set(t.mint, {
        symbol: t.tokenSymbol ?? "",
        name: t.tokenName ?? "",
      });
    }
  }
  return [...labels.entries()].map(([mint, v]) => ({ mint, ...v }));
}

/**
 * Returns Bags swap analytics for a wallet.
 *
 * Identifies Bags swaps by checking if the transaction interacts with
 * Bags/Meteora program IDs (DBC bonding curve or DAMM AMM).
 * Also matches against known Bags token mints as a secondary signal.
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

    // Step 2: Fetch swap-like transactions from Helius
    const swaps = await fetchSwapTransactions(wallet);
    if (swaps.length === 0) {
      console.log(`[bagsAnalyzer] ${wallet}: no swap-like transactions found`);
      setCachedAnalytics(wallet, EMPTY_ANALYTICS).catch(() => {});
      return EMPTY_ANALYTICS;
    }

    // Debug: inspect real Helius tx shape and token labels.
    const sample = swaps.slice(0, 2).map((tx) => ({
      signature: tx.signature,
      type: tx.type,
      tokenTransfers: tx.tokenTransfers?.slice(0, 4) ?? [],
      swapEvent: tx.events?.swap ?? null,
    }));
    console.log("[bagsAnalyzer] sample swap-like tx", JSON.stringify(sample));

    // Step 3: Count swaps that are Bags swaps
    // A swap is a Bags swap if:
    //   - It interacts with a Bags/Meteora program (DBC or DAMM), OR
    //   - It involves a known Bags token mint (from feed/positions)
    let bagsSwapCount = 0;
    const matchedMints = new Set<string>();
    const allSwapMints = new Set<string>();
    const observedLabels = new Map<string, { symbol: string; name: string }>();

    for (const tx of swaps) {
      const programMatch = isBagsSwap(tx);
      const txMints = getSwapMints(tx);
      const labels = getTokenLabels(tx);

      let mintMatch = false;
      if (knownBagsMints.size > 0) {
        for (const mint of txMints) {
          if (knownBagsMints.has(mint)) {
            mintMatch = true;
            break;
          }
        }
      }

      for (const mint of txMints) allSwapMints.add(mint);
      for (const label of labels) {
        observedLabels.set(label.mint, { symbol: label.symbol, name: label.name });
      }

      if (programMatch || mintMatch) {
        bagsSwapCount++;
        for (const mint of txMints) {
          matchedMints.add(mint);
        }
      }
    }

    // Step 4: Build result
    const unresolvedMints = [...matchedMints].filter((mint) => {
      const label = observedLabels.get(mint);
      return !label || (!label.symbol && !label.name);
    });
    if (unresolvedMints.length > 0) {
      const metadata = await fetchTokenMetadataBatch(unresolvedMints);
      for (const mint of unresolvedMints) {
        const meta = metadata.get(mint);
        if (meta) observedLabels.set(mint, { symbol: meta.symbol, name: meta.name });
      }
    }

    const sampleLabels = [...matchedMints]
      .slice(0, 8)
      .map((mint) => ({ mint, ...(observedLabels.get(mint) ?? { symbol: "", name: "" }) }));
    console.log("[bagsAnalyzer] matched token labels", JSON.stringify(sampleLabels));

    const analytics: BagsAnalyticsData = {
      unique_tokens_traded: matchedMints.size,
      total_swap_transactions: bagsSwapCount,
      tokens: [...matchedMints],
    };

    // Step 5: Fire-and-forget cache write
    setCachedAnalytics(wallet, analytics).catch(() => {});

    console.log(
      `[bagsAnalyzer] ${wallet}: ${bagsSwapCount} Bags swaps across ${matchedMints.size} tokens (from ${swaps.length} swap-like txs, ${allSwapMints.size} swap mints observed)`
    );

    return analytics;
  } catch (err) {
    console.error("[bagsAnalyzer] Failed for", wallet, err);
    return EMPTY_ANALYTICS;
  }
}
