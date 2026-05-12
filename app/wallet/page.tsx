"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWalletConnection } from "@solana/react-hooks";
import { Wallet, ShieldCheck, Sparkles } from "lucide-react";
import { openConnectModal } from "@/components/sof/modals/ChromeOverlay";

export default function WalletIndexPage() {
  const { connected, wallet } = useWalletConnection();
  const router = useRouter();
  const solanaAddress = wallet?.account?.address?.toString() ?? null;

  useEffect(() => {
    if (connected && solanaAddress) {
      router.replace(`/wallet/${solanaAddress}`);
    }
  }, [connected, solanaAddress, router]);

  if (connected && solanaAddress) return null;

  return (
    <div className="sof-wp-empty-stage">
      <div className="sof-wp-empty-backdrop" aria-hidden="true" />
      <div className="sof-wp-empty-card">
        <div className="sof-wp-empty-icon" aria-hidden="true">
          <Wallet size={26} strokeWidth={1.5} />
        </div>

        <div className="sof-wp-empty-eyebrow">WALLET PROFILE</div>
        <h1 className="sof-wp-empty-title">Connect to view your profile</h1>
        <p className="sof-wp-empty-desc">
          Connect your Solana wallet to see your reputation score, claim
          history, operated refineries, and snapshot eligibility — all read
          straight from devnet.
        </p>

        <div className="sof-wp-empty-actions">
          <button
            type="button"
            className="sof-btn sof-btn-primary"
            onClick={openConnectModal}
          >
            <Wallet size={14} strokeWidth={2} aria-hidden="true" />
            Connect wallet
          </button>
        </div>

        <div className="sof-wp-empty-features">
          <div className="sof-wp-empty-feature">
            <ShieldCheck size={14} strokeWidth={1.8} className="ok" aria-hidden="true" />
            <span>Non-custodial — your keys never leave your wallet</span>
          </div>
          <div className="sof-wp-empty-feature">
            <Sparkles size={14} strokeWidth={1.8} className="acc" aria-hidden="true" />
            <span>Free SIWS signature — no gas, no transaction</span>
          </div>
        </div>
      </div>
    </div>
  );
}
