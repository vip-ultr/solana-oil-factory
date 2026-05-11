// Deployed-program constants. Lives here (not next.config) so
// every consumer reaches for the same source of truth, and so a
// future cluster swap is a one-line edit + a redeploy.
//
// Program ID is stable across clusters because we control the
// program keypair. Cluster is inferred from the RPC URL — we
// don't expose a separate `NEXT_PUBLIC_CLUSTER` var because it
// would just be a second source of truth that could drift.

export const REFINERY_PROGRAM_ID =
  process.env.NEXT_PUBLIC_REFINERY_PROGRAM_ID ??
  "2tPLLPQeLLNL4UDBbeagSUAABJcB3fHGTJaLGEzrx3rE";

export const TREASURY_AUTHORITY =
  process.env.NEXT_PUBLIC_TREASURY_AUTHORITY ?? "";

export const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "/api/rpc";

export type SolanaCluster = "mainnet" | "devnet" | "testnet" | "localnet";

export function inferCluster(rpcUrl: string): SolanaCluster {
  if (rpcUrl.includes("devnet")) return "devnet";
  if (rpcUrl.includes("testnet")) return "testnet";
  if (rpcUrl.includes("127.0.0.1") || rpcUrl.includes("localhost")) return "localnet";
  return "mainnet";
}

export const SOLANA_CLUSTER: SolanaCluster = inferCluster(SOLANA_RPC_URL);

/**
 * Solana Explorer URL for an address or signature, scoped to the
 * current cluster. Returns the right `?cluster=devnet` query so
 * users land on the correct network when they click through.
 */
export function explorerUrl(
  ref: string,
  type: "address" | "tx" = "address",
): string {
  const base = `https://explorer.solana.com/${type}/${ref}`;
  if (SOLANA_CLUSTER === "mainnet") return base;
  return `${base}?cluster=${SOLANA_CLUSTER}`;
}

/** Solscan link — same cluster-aware logic as the explorer helper. */
export function solscanUrl(
  ref: string,
  type: "address" | "tx" | "token" = "address",
): string {
  const path = type === "tx" ? "tx" : type === "token" ? "token" : "account";
  const base = `https://solscan.io/${path}/${ref}`;
  if (SOLANA_CLUSTER === "mainnet") return base;
  return `${base}?cluster=${SOLANA_CLUSTER}`;
}

/** Birdeye token chart. Mainnet-only — Birdeye doesn't index devnet. */
export function birdeyeUrl(mint: string): string {
  return `https://birdeye.so/token/${mint}?chain=solana`;
}

/** Jupiter swap link for a given mint. Mainnet-only. */
export function jupiterUrl(mint: string): string {
  return `https://jup.ag/swap/SOL-${mint}`;
}
