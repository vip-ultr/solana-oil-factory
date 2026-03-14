import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Space_Grotesk } from "next/font/google";
import Providers from "./providers";
import Footer from "@/components/Footer";
import "../styles/globals.css";

const font = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Solana Oil Factory",
  description: "Convert your Solana wallet activity into oil production",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={font.variable}>
      <body>
        <div style={{ flex: 1 }}>
          <Providers>{children}</Providers>
        </div>
        <Footer />
      </body>
    </html>
  );
}
