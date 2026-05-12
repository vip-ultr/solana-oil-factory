"use client";

import { useWalletConnection } from "@solana/react-hooks";

/**
 * Wallet-aware text for refinery card CTAs. Shows "Connect to check"
 * when no wallet is connected; flips to "Check on refinery →" once
 * a wallet exists. Real eligibility is computed server-side on the
 * refinery detail page — this is just the home-page hint.
 */
export function ClaimStatusText() {
  const { connected, wallet } = useWalletConnection();
  const hasAddress = Boolean(wallet?.account?.address);
  if (!connected || !hasAddress) return <>Connect to check</>;
  return <>Open to check eligibility →</>;
}
