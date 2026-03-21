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

// Register MWA so autoDiscover() picks it up as a connector option
if (typeof window !== "undefined") {
  try {
    registerMwa({
      appIdentity: {
        name: "Solana Oil Factory",
        uri: window.location.origin,
        icon: `${window.location.origin}/logo.png`,
      },
      authorizationCache: createDefaultAuthorizationCache(),
      chains: ["solana:mainnet"],
      chainSelector: createDefaultChainSelector(),
      onWalletNotFound: createDefaultWalletNotFoundHandler(),
    });
  } catch (e) {
    console.warn("MWA registration failed:", e);
  }
}

const endpoint =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com";

const websocketEndpoint =
  process.env.NEXT_PUBLIC_SOLANA_WS_URL ??
  endpoint.replace("https://", "wss://").replace("http://", "ws://");

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
