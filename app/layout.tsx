import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import Providers from "./providers";
import { Sidebar } from "@/components/sof/Sidebar";
import { Footer } from "@/components/sof/Footer";
import { ThemeFab } from "@/components/sof/ThemeToggle";
import "../styles/globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://solanaoilfactory.xyz"),
  title: {
    default: "Solana Oil Factory — Where real holders get rewarded.",
    template: "%s · Solana Oil Factory",
  },
  description:
    "Permissionless Solana token distribution. Operators distribute tokens to verified-active holders. Every refinery you participate in builds your wallet's reputation, used by every operator after you.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Solana Oil Factory",
    description: "Where real holders get rewarded.",
    siteName: "Solana Oil Factory",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Providers>
          <Sidebar />
          <main className="sof-main">
            {children}
            <Footer />
          </main>
          <ThemeFab />
        </Providers>
      </body>
    </html>
  );
}
