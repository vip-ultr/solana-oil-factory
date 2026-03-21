import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Space_Grotesk } from "next/font/google";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
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
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={font.variable} suppressHydrationWarning>
      <body>
        {/* ── Splash screen — server-rendered, auto-fades via CSS ── */}
        <div id="splash" aria-hidden="true">
          <img src="/logo.png" alt="" width={72} height={72} />
        </div>
        <style>{`
          #splash {
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-base, #0a0a0a);
            animation: splashOut 0.3s ease 4s forwards;
          }
          #splash img {
            animation: splashPulse 1.5s ease-in-out infinite;
            border-radius: 20px;
          }
          @keyframes splashPulse {
            0%, 100% { opacity: 0.5; transform: scale(0.92); }
            50% { opacity: 1; transform: scale(1.06); }
          }
          @keyframes splashOut {
            to { opacity: 0; visibility: hidden; pointer-events: none; }
          }
        `}</style>

        <Providers>
          <Navbar />
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {children}
          </div>
        </Providers>
        <Footer />
      </body>
    </html>
  );
}
