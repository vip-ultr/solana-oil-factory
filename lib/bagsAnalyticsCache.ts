import { supabase } from "@/lib/supabase";

export interface BagsAnalyticsData {
  unique_tokens_traded: number;
  total_swap_transactions: number;
  tokens: string[];
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Returns cached analytics if fresh (within TTL), otherwise null.
 */
export async function getCachedAnalytics(
  wallet: string
): Promise<BagsAnalyticsData | null> {
  try {
    const { data, error } = await supabase
      .from("wallet_bags_analytics")
      .select("unique_tokens_traded, total_swap_transactions, tokens, updated_at")
      .eq("wallet_address", wallet)
      .maybeSingle();

    if (error || !data) return null;

    const age = Date.now() - new Date(data.updated_at).getTime();
    if (age > CACHE_TTL_MS) return null;

    return {
      unique_tokens_traded: data.unique_tokens_traded,
      total_swap_transactions: data.total_swap_transactions,
      tokens: data.tokens as string[],
    };
  } catch {
    console.error("[bagsAnalyticsCache] Cache read failed");
    return null;
  }
}

/**
 * Upserts analytics into the cache. Fire-and-forget — caller should not await.
 */
export async function setCachedAnalytics(
  wallet: string,
  analytics: BagsAnalyticsData
): Promise<void> {
  try {
    await supabase.from("wallet_bags_analytics").upsert(
      {
        wallet_address: wallet,
        unique_tokens_traded: analytics.unique_tokens_traded,
        total_swap_transactions: analytics.total_swap_transactions,
        tokens: analytics.tokens,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "wallet_address" }
    );
  } catch {
    console.error("[bagsAnalyticsCache] Cache write failed");
  }
}
