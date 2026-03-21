"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWalletConnection, useWalletSession } from "@solana/react-hooks";

export default function ProfilePage() {
  const { connected } = useWalletConnection();
  const session = useWalletSession();
  const router = useRouter();
  const solanaAddress = session?.account.address?.toString() ?? null;

  // Redirect to wallet profile when connected
  useEffect(() => {
    if (connected && solanaAddress) {
      router.replace(`/wallet/${solanaAddress}`);
    }
  }, [connected, solanaAddress, router]);

  // While redirecting, render nothing
  if (connected && solanaAddress) return null;

  return (
    <div className="page">
      <main className="main">
        <div className="profile-connect-prompt">
          <div className="profile-connect-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>
          <h2 className="profile-connect-title">No wallet connected</h2>
          <p className="profile-connect-desc">
            Connect your Solana wallet to view your refinery profile.
          </p>
        </div>
      </main>
    </div>
  );
}
