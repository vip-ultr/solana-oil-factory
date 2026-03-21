"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useWalletConnection, useWalletSession } from "@solana/react-hooks";
import WalletSearch from "@/components/WalletSearch";
import BarrelHeroSection from "@/components/BarrelHeroSection";
import OilStats from "@/components/OilStats";
import BagsPanel from "@/components/BagsPanel";
import WalletConnectModal from "@/components/WalletConnectModal";
import type { OilData } from "@/lib/oilCalculator";

type WalletData = OilData & {
  address: string;
  partial?: boolean;
  lastRefinedOilUnits?: number;
  totalFeesSol?: number;
  bagsActive?: boolean;
};

export default function Home() {
  const { connected, disconnect, wallet } = useWalletConnection();
  const session = useWalletSession();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const openConnectModal = useCallback(() => setShowConnectModal(true), []);
  const closeConnectModal = useCallback(() => setShowConnectModal(false), []);
  const solanaAddress = session?.account?.address?.toString() ?? null;
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Verification state — persisted in sessionStorage per wallet address
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  // Track whether we've checked stored data for this wallet
  const [storedChecked, setStoredChecked] = useState(false);
  const [storedLoading, setStoredLoading] = useState(false);

  // Helper: sessionStorage key scoped to the wallet address
  const verifiedKey = solanaAddress ? `sof_verified_${solanaAddress}` : null;

  // On mount or wallet change: restore verification from sessionStorage
  useEffect(() => {
    setStoredChecked(false);
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

  // After verification, auto-load stored data from Supabase (cheap, no Helius call)
  useEffect(() => {
    if (!isVerified || !solanaAddress || storedChecked || data || loading) return;

    let cancelled = false;
    async function loadStored() {
      setStoredLoading(true);
      try {
        const res = await fetch(`/api/wallet/stored?address=${encodeURIComponent(solanaAddress!)}`);
        if (!res.ok) throw new Error("Failed to check stored data");
        const json = await res.json();
        if (!cancelled && json.found) {
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load stored data:", err);
      } finally {
        if (!cancelled) {
          setStoredChecked(true);
          setStoredLoading(false);
        }
      }
    }
    loadStored();

    return () => { cancelled = true; };
  }, [isVerified, solanaAddress, storedChecked, data, loading]);

  // Close connect modal when wallet connects
  useEffect(() => {
    if (connected) setShowConnectModal(false);
  }, [connected]);

  // Reset everything when wallet disconnects (not on initial mount)
  const wasConnectedRef = useRef(false);
  useEffect(() => {
    if (connected) {
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
  }, [connected]);

  async function handleVerify() {
    if (!session?.signMessage || !solanaAddress) return;

    setVerifying(true);
    setVerifyError(null);

    try {
      const message = `Solana Oil Factory\n\nVerify wallet ownership\n\nWallet: ${solanaAddress}\nTimestamp: ${Date.now()}`;
      await session.signMessage(new TextEncoder().encode(message));
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
  const isWalletReady = connected && solanaAddress;
  const showVerifyPrompt = isWalletReady && !isVerified && !data && !loading && !storedLoading && !error;
  // Only show extract prompt for first-time users (stored check done, no data found)
  const showExtractPrompt = isWalletReady && isVerified && !data && !loading && !storedLoading && storedChecked && !error;

  return (
    <div className="page">
      <main className="main">

        {/* Search */}
        <section className="search-section">
          <WalletSearch onSearch={fetchWalletData} loading={loading} />
        </section>

        {/* Empty state — no wallet connected, no search, not loading */}
        {!connected && !data && !loading && !error && (
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

        {/* Loading — stored data check */}
        {storedLoading && !loading && (
          <div className="loading-msg">
            Loading your refinery data...
          </div>
        )}

        {/* Loading — full extraction */}
        {loading && (
          <div className="loading-msg">
            Extracting oil from the blockchain...
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
            <BarrelHeroSection
              fillPercentages={data.fillPercentages}
              totalBarrels={data.barrels}
            />

            {/* Refinery → Bags Refinery Data → Production Stats */}
            <section className="stats-section">
              <OilStats
                data={data}
                isOwner={isVerified && connected && solanaAddress === data.address}
                onConnectWallet={openConnectModal}
                onRefined={(units) =>
                  setData((prev) =>
                    prev ? { ...prev, lastRefinedOilUnits: units } : prev
                  )
                }
                onCheckUpdates={() => fetchWalletData(data.address)}
                middleSlot={
                  <BagsPanel
                    bagsActive={data.bagsActive ?? false}
                    totalFeesSol={data.totalFeesSol ?? 0}
                    bonusCrude={data.bonusCrude ?? 0}
                  />
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
