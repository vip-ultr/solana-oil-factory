const HELIUS_URL = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;
const HELIUS_ENHANCED_URL = `https://api.helius.xyz/v0`;
const PAGE_SIZE = 1000;

// Safety limits to prevent Vercel function timeouts
const MAX_PAGES = 150;               // 150,000 transactions max
const REQUEST_TIMEOUT_MS = 8_000;    // 8s per individual RPC call
const TOTAL_BUDGET_MS = 50_000;      // 50s total time budget (leaves headroom before Vercel's 60s)

// Swap analytics limits
const SWAP_PAGE_SIZE = 100;
const MAX_SWAP_PAGES = 10;
const SWAP_BUDGET_MS = 15_000;

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

// ── Swap Analytics (Enhanced Transactions API) ──────────────────────

export interface HeliusTokenTransfer {
  mint: string;
  tokenAmount: number;
  tokenStandard?: string;
  tokenName?: string;
  tokenSymbol?: string;
}

export interface HeliusEnrichedTransaction {
  signature: string;
  type: string;
  tokenTransfers: HeliusTokenTransfer[];
  events?: {
    swap?: {
      tokenInputs?: { mint: string; tokenStandard?: string }[];
      tokenOutputs?: { mint: string; tokenStandard?: string }[];
    };
  };
}

/**
 * Fetches enriched SWAP transactions for a wallet using the Helius
 * Enhanced Transactions REST API. Paginated with a dedicated time budget.
 */
export async function fetchSwapTransactions(
  walletAddress: string
): Promise<HeliusEnrichedTransaction[]> {
  const apiKey = process.env.HELIUS_API_KEY;
  if (!apiKey) throw new Error("HELIUS_API_KEY not configured");

  const all: HeliusEnrichedTransaction[] = [];
  let before: string | undefined;
  let pages = 0;
  let retries = 0;
  const startTime = Date.now();

  while (pages < MAX_SWAP_PAGES) {
    if (Date.now() - startTime > SWAP_BUDGET_MS) {
      console.warn(`[helius] Swap fetch time budget exceeded at page ${pages}`);
      break;
    }

    const url = new URL(
      `${HELIUS_ENHANCED_URL}/addresses/${walletAddress}/transactions`
    );
    url.searchParams.set("api-key", apiKey);
    url.searchParams.set("type", "SWAP");
    url.searchParams.set("limit", String(SWAP_PAGE_SIZE));
    if (before) url.searchParams.set("before-signature", before);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(url.toString(), { signal: controller.signal });
      if (!res.ok) {
        throw new Error(`Helius Enhanced API error: ${res.status}`);
      }

      const body = await res.json();

      // Handle runtime type filtering continuation pattern:
      // API may return an error with a continuation signature when no
      // SWAP matches exist in the current search window.
      if (body && typeof body === "object" && "error" in body) {
        const errMsg = String(body.error ?? "");
        const match = errMsg.match(/before-signature.*?set to (\S+)/i);
        if (match?.[1]) {
          before = match[1];
          retries++;
          if (retries > MAX_SWAP_PAGES) break; // prevent infinite loops
          continue;
        }
        break;
      }

      const batch: HeliusEnrichedTransaction[] = Array.isArray(body)
        ? body
        : [];
      if (batch.length === 0) break;

      retries = 0;
      all.push(...batch);
      pages++;

      if (batch.length < SWAP_PAGE_SIZE) break;
      before = batch[batch.length - 1].signature;
    } catch (err) {
      if (pages === 0) throw err;
      console.warn(`[helius] Swap fetch failed at page ${pages}, returning partial`);
      break;
    } finally {
      clearTimeout(timeout);
    }
  }

  return all;
}

export interface TokenMetadata {
  name: string;
  symbol: string;
}

/**
 * Resolves token mint addresses to name/symbol via Helius DAS getAssetBatch.
 * Returns a Map; missing/failed mints are simply omitted.
 */
export async function fetchTokenMetadataBatch(
  mints: string[]
): Promise<Map<string, TokenMetadata>> {
  const result = new Map<string, TokenMetadata>();
  if (mints.length === 0) return result;

  const BATCH_SIZE = 1000;
  for (let i = 0; i < mints.length; i += BATCH_SIZE) {
    const chunk = mints.slice(i, i + BATCH_SIZE);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(HELIUS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "das-batch",
          method: "getAssetBatch",
          params: { ids: chunk },
        }),
        signal: controller.signal,
      });

      if (!res.ok) continue;

      const json = await res.json();
      const assets = json.result;
      if (!Array.isArray(assets)) continue;

      for (const asset of assets) {
        const id = asset?.id;
        const content = asset?.content?.metadata;
        if (id && content) {
          result.set(id, {
            name: content.name ?? "",
            symbol: content.symbol ?? "",
          });
        }
      }
    } catch {
      console.warn(`[helius] DAS batch failed for chunk starting at index ${i}`);
    } finally {
      clearTimeout(timeout);
    }
  }

  return result;
}
