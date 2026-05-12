import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "./providers";
import { Sidebar } from "@/components/sof/Sidebar";
import { Footer } from "@/components/sof/Footer";
import {
  MobileTabBar,
  MobileTopBar,
} from "@/components/sof/MobileNav";
import { ChromeOverlay } from "@/components/sof/modals/ChromeOverlay";
import "../styles/globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
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
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Providers>
          <ChromeOverlay>
            <Sidebar />
            <MobileTopBar />
            <main className="sof-main">
              {children}
              <Footer />
            </main>
            <MobileTabBar />
          </ChromeOverlay>
        </Providers>
      </body>
    </html>
  );
}
