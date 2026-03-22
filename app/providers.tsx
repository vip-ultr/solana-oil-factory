"use client";

import { useMemo, type ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { SolanaProvider } from "@solana/react-hooks";
import { createClient, autoDiscover, injected, phantom, solflare, backpack } from "@solana/client";

const endpoint =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com";

const websocketEndpoint =
  process.env.NEXT_PUBLIC_SOLANA_WS_URL ??
  endpoint.replace("https://", "wss://").replace("http://", "ws://");

// Singleton — created once in the browser, never during SSR
let cachedClient: ReturnType<typeof createClient> | null = null;

function getSolanaClient() {
  if (cachedClient) return cachedClient;
  cachedClient = createClient({
    endpoint,
    websocketEndpoint,
    walletConnectors: [
      ...autoDiscover(),
      // Explicit connectors ensure wallet detection in wallet browsers
      // where Wallet Standard registration may be delayed
      ...phantom(),
      ...solflare(),
      ...backpack(),
      // Universal fallback — catches any Wallet Standard wallet (Jupiter, Trust, etc.)
      injected(),
    ],
  });
  return cachedClient;
}

export default function Providers({ children }: { children: ReactNode }) {
  const solanaClient = useMemo(() => getSolanaClient(), []);

  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
      <SolanaProvider client={solanaClient}>{children}</SolanaProvider>
    </ThemeProvider>
  );
}
