"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePhantom, useDisconnect, useSolana, AddressType } from "@phantom/react-sdk";
import WalletSearch from "@/components/WalletSearch";
import BarrelGrid from "@/components/BarrelGrid";
import OilStats from "@/components/OilStats";
import WalletConnectModal from "@/components/WalletConnectModal";
import type { OilData } from "@/lib/oilCalculator";

type WalletData = OilData & {
  address: string;
  partial?: boolean;
  lastRefinedOilUnits?: number;
};

export default function Home() {
  const { isConnected, addresses } = usePhantom();
  const { disconnect } = useDisconnect();
  const { solana, isAvailable: isSolanaAvailable } = useSolana();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const openConnectModal = useCallback(() => setShowConnectModal(true), []);
  const closeConnectModal = useCallback(() => setShowConnectModal(false), []);
  const solanaAddress = addresses.find((a) => a.addressType === AddressType.solana)?.address ?? null;
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Verification state — persisted in sessionStorage per wallet address
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Helper: sessionStorage key scoped to the wallet address
  const verifiedKey = solanaAddress ? `sof_verified_${solanaAddress}` : null;

  // On mount or wallet change: restore verification from sessionStorage
  useEffect(() => {
    if (verifiedKey && typeof sessionStorage !== "undefined") {
      const stored = sessionStorage.getItem(verifiedKey);
      if (stored === "true") {
        setIsVerified(true);
        setVerifyError(null);
        return;
      }
    }
    setIsVerified(false);
    setVerifyError(null);
    setData(null);
  }, [solanaAddress]);

  // Close connect modal when wallet connects
  useEffect(() => {
    if (isConnected) setShowConnectModal(false);
  }, [isConnected]);

  // Reset everything when wallet disconnects (not on initial mount)
  const wasConnectedRef = useRef(false);
  useEffect(() => {
    if (isConnected) {
      wasConnectedRef.current = true;
    } else if (wasConnectedRef.current) {
      // User explicitly disconnected (was connected, now isn't)
      wasConnectedRef.current = false;
      setData(null);
      setError(null);
      setIsVerified(false);
      setVerifyError(null);
      // Clear all verification keys from sessionStorage
      if (typeof sessionStorage !== "undefined") {
        Object.keys(sessionStorage)
          .filter((k) => k.startsWith("sof_verified_"))
          .forEach((k) => sessionStorage.removeItem(k));
      }
    }
  }, [isConnected]);

  async function handleVerify() {
    if (!solana || !isSolanaAvailable || !solanaAddress) return;

    setVerifying(true);
    setVerifyError(null);

    try {
      const message = `Solana Oil Factory\n\nVerify wallet ownership\n\nWallet: ${solanaAddress}\nTimestamp: ${Date.now()}`;
      await solana.signMessage(message);
      setIsVerified(true);
      if (verifiedKey) sessionStorage.setItem(verifiedKey, "true");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      // User rejected the signature request
      if (msg.includes("reject") || msg.includes("cancel") || msg.includes("denied")) {
        setVerifyError("Signature rejected. Please sign the message to verify ownership.");
      } else {
        setVerifyError("Verification failed. Please try again.");
      }
    } finally {
      setVerifying(false);
    }
  }

  async function fetchWalletData(address: string) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(`/api/wallet?address=${encodeURIComponent(address)}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Failed to fetch wallet data");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  // Derived states
  const isWalletReady = isConnected && solanaAddress;
  const showVerifyPrompt = isWalletReady && !isVerified && !data && !loading && !error;
  const showExtractPrompt = isWalletReady && isVerified && !data && !loading && !error;

  return (
    <div className="page">
      {/* ── Header ── */}
      <header className="header">
        <h1 className="site-title">
          <img src="/logo.png" alt="Solana Oil Factory" className="site-logo" />
          <span className="site-title-text">Solana Oil Factory</span>
        </h1>
        <div className="wallet-controls">
          <Link href="/leaderboard" className="lb-nav-link">
            Leaderboard
          </Link>
          {isConnected && solanaAddress ? (
            <div className="wallet-chip">
              <span className={`wallet-chip-dot${isVerified ? "" : " wallet-chip-dot--pending"}`} />
              <span className="wallet-chip-addr">
                {solanaAddress.slice(0, 4)}...{solanaAddress.slice(-4)}
              </span>
              <button
                onClick={disconnect}
                className="wallet-chip-disconnect"
                aria-label="Disconnect wallet"
                title="Disconnect"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          ) : (
            <button onClick={openConnectModal} className="btn-connect">
              <svg className="btn-connect-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="3" />
                <path d="M16 12h.01" />
              </svg>
              <span>Connect</span>
            </button>
          )}
        </div>
      </header>

      {/* ── Main ── */}
      <main className="main">

        {/* Search */}
        <section className="search-section">
          <WalletSearch onSearch={fetchWalletData} loading={loading} />
        </section>

        {/* Empty state — no wallet connected, no search, not loading */}
        {!isConnected && !data && !loading && !error && (
          <div className="empty-state">
            <p className="empty-state-text">Connect or Search Wallet to Enter the Refinery</p>
            <button onClick={openConnectModal} className="btn-connect btn-connect--large">
              Connect Wallet
            </button>
          </div>
        )}

        {/* Verify ownership — wallet connected but not yet signed */}
        {showVerifyPrompt && (
          <div className="verify-prompt">
            <div className="verify-prompt-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h2 className="verify-prompt-title">Verify Wallet Ownership</h2>
            <p className="verify-prompt-address">
              {solanaAddress!.slice(0, 6)}...{solanaAddress!.slice(-4)}
            </p>
            <p className="verify-prompt-desc">
              Sign a message to prove you own this wallet.
              This is free and does not send any transaction.
            </p>
            {verifyError && (
              <p className="verify-prompt-error">{verifyError}</p>
            )}
            <button
              onClick={handleVerify}
              className="btn-verify"
              disabled={verifying}
            >
              {verifying ? (
                <>Waiting for signature...</>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Sign Message
                </>
              )}
            </button>
          </div>
        )}

        {/* Extract prompt — verified, ready to extract */}
        {showExtractPrompt && (
          <div className="extract-prompt">
            <div className="extract-prompt-icon">🛢</div>
            <h2 className="extract-prompt-title">Wallet Verified</h2>
            <p className="extract-prompt-address">
              {solanaAddress!.slice(0, 6)}...{solanaAddress!.slice(-4)}
            </p>
            <p className="extract-prompt-desc">
              Ready to scan your on-chain activity and convert it into oil production.
            </p>
            <button
              onClick={() => fetchWalletData(solanaAddress!)}
              className="btn-extract"
            >
              ⛏️ Start Extracting Oil
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="error-msg">⚠️ {error}</div>
        )}

        {/* Loading */}
        {loading && (
          <div className="loading-msg">
            ⚙️ Extracting oil from the blockchain...
          </div>
        )}

        {/* Results — Barrels first, then Stats */}
        {data && !loading && (
          <>
            {/* Partial data notice */}
            {data.partial && (
              <div className="partial-banner">
                <span className="partial-banner-icon">⚡</span>
                <div className="partial-banner-text">
                  <strong>Whale wallet detected!</strong> This wallet has more transactions than we
                  could count in time. The stats below show at least{" "}
                  <strong>{data.oilUnits.toLocaleString()}</strong> transactions — actual numbers
                  may be higher.
                </div>
              </div>
            )}

            {/* Hero: Barrel Grid */}
            <section className="barrel-hero-section">
              <div className="barrel-hero-header">
                <h2 className="barrel-hero-title">Oil Barrels</h2>
                <div className="barrel-hero-rule" />
              </div>
              <BarrelGrid
                fillPercentages={data.fillPercentages}
                totalBarrels={data.barrels}
              />
            </section>

            {/* Stats + Refinery + Share */}
            <section className="stats-section">
              <OilStats
                data={data}
                isOwner={isVerified && isConnected && solanaAddress === data.address}
                onConnectWallet={openConnectModal}
                onRefined={(units) =>
                  setData((prev) =>
                    prev ? { ...prev, lastRefinedOilUnits: units } : prev
                  )
                }
              />
            </section>
          </>
        )}

      </main>

      {/* Wallet Connect Modal — shows wallet options even if extensions aren't installed */}
      <WalletConnectModal isOpen={showConnectModal} onClose={closeConnectModal} />
    </div>
  );
}
