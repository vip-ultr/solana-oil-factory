"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { SolanaProvider } from "@solana/react-hooks";
import { createClient, autoDiscover } from "@solana/client";
import { SiwsProvider } from "@/components/sof/SiwsProvider";

// HTTP RPC routes through our backend proxy so the Helius API key never
// reaches the browser. See app/api/rpc/route.ts. Override with
// NEXT_PUBLIC_SOLANA_RPC_URL for devnet / custom endpoints (do NOT embed a
// Helius key in that override — it's exposed to every visitor).
const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "/api/rpc";

// WebSocket: defaults to public mainnet-beta (rate-limited). Vercel can't
// proxy WS upgrades, so authed Helius WS would expose the key — set
// NEXT_PUBLIC_SOLANA_WS_URL only if you have a dedicated WS provider with
// origin-locked auth.
const websocketEndpoint =
  process.env.NEXT_PUBLIC_SOLANA_WS_URL ??
  "wss://api.mainnet-beta.solana.com";

const solanaClient = createClient({
  endpoint,
  websocketEndpoint,
  walletConnectors: autoDiscover(),
});

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="sof-theme"
    >
      <SolanaProvider
        client={solanaClient}
        walletPersistence={{ autoConnect: false }}
      >
        <SiwsProvider>{children}</SiwsProvider>
      </SolanaProvider>
    </ThemeProvider>
  );
}
