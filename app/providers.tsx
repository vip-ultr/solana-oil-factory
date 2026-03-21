"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { SolanaProvider } from "@solana/react-hooks";
import { createClient, autoDiscover } from "@solana/client";
import {
  registerMwa,
  createDefaultAuthorizationCache,
  createDefaultChainSelector,
  createDefaultWalletNotFoundHandler,
} from "@solana-mobile/wallet-standard-mobile";

const endpoint =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com";

const websocketEndpoint =
  process.env.NEXT_PUBLIC_SOLANA_WS_URL ??
  endpoint.replace("https://", "wss://").replace("http://", "ws://");

// Register Solana Mobile Wallet Adapter for native mobile wallet picker
if (typeof window !== "undefined") {
  registerMwa({
    appIdentity: {
      name: "Solana Oil Factory",
      uri: typeof window !== "undefined" ? window.location.origin : undefined,
      icon: typeof window !== "undefined" ? `${window.location.origin}/logo.png` : undefined,
    },
    authorizationCache: createDefaultAuthorizationCache(),
    chains: ["solana:mainnet"],
    chainSelector: createDefaultChainSelector(),
    onWalletNotFound: createDefaultWalletNotFoundHandler(),
  });
}

const solanaClient = createClient({
  endpoint,
  websocketEndpoint,
  walletConnectors: autoDiscover(),
});

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
      <SolanaProvider client={solanaClient}>{children}</SolanaProvider>
    </ThemeProvider>
  );
}
