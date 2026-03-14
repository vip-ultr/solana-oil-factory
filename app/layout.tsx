import type { Metadata } from "next";
import type { ReactNode } from "react";
import Providers from "./providers";
import Footer from "@/components/Footer";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Solana Oil Factory",
  description: "Convert your Solana wallet activity into oil production",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
        <Footer />
      </body>
    </html>
  );
}
