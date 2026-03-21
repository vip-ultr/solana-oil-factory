"use client";

import type { ReactNode } from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { PhantomProvider, AddressType, darkTheme, PhantomSDKConfig } from "@phantom/react-sdk";

const phantomConfig: PhantomSDKConfig = {
  providers: ["injected"],
  addressTypes: [AddressType.solana],
};

function PhantomWrapper({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  return (
    <PhantomProvider
      config={phantomConfig}
      theme={resolvedTheme === "dark" ? darkTheme : undefined}
      appName="Solana Oil Factory"
    >
      {children}
    </PhantomProvider>
  );
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
      <PhantomWrapper>{children}</PhantomWrapper>
    </ThemeProvider>
  );
}
