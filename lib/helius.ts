const HELIUS_URL = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;
const PAGE_SIZE = 1000;

// Safety limits to prevent Vercel function timeouts
const MAX_PAGES = 150;               // 150,000 transactions max
const REQUEST_TIMEOUT_MS = 8_000;    // 8s per individual RPC call
const TOTAL_BUDGET_MS = 50_000;      // 50s total time budget (leaves headroom before Vercel's 60s)

export interface TransactionCountResult {
  count: number;
  /** true if we returned before reaching the end of the wallet's history */
  partial: boolean;
}

/**
 * Fetches a single page of transaction signatures from Helius.
 */
async function fetchSignaturePage(
  walletAddress: string,
  before?: string
): Promise<{ signature: string }[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const params: Record<string, unknown> = { limit: PAGE_SIZE };
  if (before) params.before = before;

  try {
    const res = await fetch(HELIUS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "sig-page",
        method: "getSignaturesForAddress",
        params: [walletAddress, params],
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Helius RPC error: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();

    if (json.error) {
      throw new Error(`RPC error: ${json.error.message ?? JSON.stringify(json.error)}`);
    }

    return Array.isArray(json.result) ? json.result : [];
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Counts total transactions for a wallet by paginating through
 * getSignaturesForAddress. Returns { count, partial }.
 *
 * `partial: true` means we stopped before reaching the end — due to
 * time budget, page cap, or a transient RPC failure mid-pagination.
 * The count is still valid and usable, just a lower bound.
 */
export async function getTransactionCount(
  walletAddress: string
): Promise<TransactionCountResult> {
  let total = 0;
  let before: string | undefined = undefined;
  let pages = 0;
  let partial = false;
  const startTime = Date.now();

  while (pages < MAX_PAGES) {
    // Check time budget before starting another page
    const elapsed = Date.now() - startTime;
    if (elapsed > TOTAL_BUDGET_MS) {
      console.warn(
        `[helius] Time budget exceeded (${elapsed}ms) at page ${pages} for ${walletAddress}, returning partial count: ${total}`
      );
      partial = true;
      break;
    }

    let batch: { signature: string }[];

    try {
      batch = await fetchSignaturePage(walletAddress, before);
    } catch (err) {
      // One retry with a short backoff for transient errors
      if (pages > 0) {
        await new Promise((r) => setTimeout(r, 500));
        try {
          batch = await fetchSignaturePage(walletAddress, before);
        } catch {
          console.warn(
            `[helius] Retry failed at page ${pages + 1} for ${walletAddress}, returning partial count: ${total}`
          );
          partial = true;
          break;
        }
      } else {
        // First page failed — propagate the error
        throw err;
      }
    }

    if (!batch || batch.length === 0) break;

    total += batch.length;
    pages++;

    // Fewer than a full page means we've reached the end
    if (batch.length < PAGE_SIZE) break;
    before = batch[batch.length - 1].signature;
  }

  if (pages >= MAX_PAGES) {
    console.warn(
      `[helius] Hit page cap (${MAX_PAGES}) for ${walletAddress}, returning count: ${total}`
    );
    partial = true;
  }

  return { count: total, partial };
}
