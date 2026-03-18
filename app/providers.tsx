"use client";

import type { ReactNode } from "react";
import { PhantomProvider, AddressType, darkTheme, PhantomSDKConfig } from "@phantom/react-sdk";

const phantomConfig: PhantomSDKConfig = {
  providers: ["injected"],
  addressTypes: [AddressType.solana],
};

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <PhantomProvider
      config={phantomConfig}
      theme={darkTheme}
      appName="Solana Oil Factory"
      appIcon="/logo.png"
    >
      {children}
    </PhantomProvider>
  );
}
