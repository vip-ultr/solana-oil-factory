import axios from "axios";

const HELIUS_URL = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;
const PAGE_SIZE = 1000;

export async function getTransactionCount(walletAddress: string): Promise<number> {
  let total = 0;
  let before: string | undefined = undefined;

  while (true) {
    const params: Record<string, unknown> = { limit: PAGE_SIZE };
    if (before) params.before = before;

    const response = await axios.post(HELIUS_URL, {
      jsonrpc: "2.0",
      id: "1",
      method: "getSignaturesForAddress",
      params: [walletAddress, params],
    });

    const batch: { signature: string }[] = response.data.result;
    if (!Array.isArray(batch) || batch.length === 0) break;

    total += batch.length;

    // Fewer than a full page means we've reached the end
    if (batch.length < PAGE_SIZE) break;
    before = batch[batch.length - 1].signature;
  }

  return total;
}
