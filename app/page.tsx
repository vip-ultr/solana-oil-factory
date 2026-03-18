"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePhantom, useDisconnect, AddressType } from "@phantom/react-sdk";
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
  const [showConnectModal, setShowConnectModal] = useState(false);
  const openConnectModal = useCallback(() => setShowConnectModal(true), []);
  const closeConnectModal = useCallback(() => setShowConnectModal(false), []);
  const solanaAddress = addresses.find((a) => a.addressType === AddressType.solana)?.address ?? null;
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Close connect modal when wallet connects
  useEffect(() => {
    if (isConnected) setShowConnectModal(false);
  }, [isConnected]);

  // Clear results when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setData(null);
      setError(null);
    }
  }, [isConnected]);

  async function fetchWalletData(address: string) {
    // Cancel any in-flight request so a newer fetch always wins
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

  // Whether to show the "connected, ready to extract" state
  const showExtractPrompt = isConnected && solanaAddress && !data && !loading && !error;

  return (
    <div className="page">
      {/* ── Header ── */}
      <header className="header">
        <h1 className="site-title">
          <img src="/logo.png" alt="Solana Oil Factory" className="site-logo" />
          <span className="site-title-text">Solana Oil Factory</span>
        </h1>
        <div className="wallet-controls">
          <a href="/leaderboard" className="lb-nav-link">
            Leaderboard
          </a>
          {isConnected && solanaAddress ? (
            <div className="connected-wallet">
              <span className="wallet-address">
                {solanaAddress.slice(0, 6)}...{solanaAddress.slice(-4)}
              </span>
              <button onClick={disconnect} className="btn-disconnect">
                Disconnect
              </button>
            </div>
          ) : (
            <button onClick={openConnectModal} className="btn-connect">
              Connect Wallet
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

        {/* Connected state — wallet linked, waiting for user to start extraction */}
        {showExtractPrompt && (
          <div className="extract-prompt">
            <div className="extract-prompt-icon">🛢</div>
            <h2 className="extract-prompt-title">Wallet Connected</h2>
            <p className="extract-prompt-address">
              {solanaAddress.slice(0, 6)}...{solanaAddress.slice(-4)}
            </p>
            <p className="extract-prompt-desc">
              Ready to scan your on-chain activity and convert it into oil production.
            </p>
            <button
              onClick={() => fetchWalletData(solanaAddress)}
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
                <h2 className="barrel-hero-title">Your Oil Barrels</h2>
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
                isOwner={isConnected && solanaAddress === data.address}
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
