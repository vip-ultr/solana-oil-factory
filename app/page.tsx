"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePhantom, useDisconnect, AddressType } from "@phantom/react-sdk";
import WalletSearch from "@/components/WalletSearch";
import BarrelGrid from "@/components/BarrelGrid";
import OilStats from "@/components/OilStats";
import WalletConnectModal from "@/components/WalletConnectModal";
import type { OilData } from "@/lib/oilCalculator";

type WalletData = OilData & { address: string };

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

  // Auto-load connected wallet data
  useEffect(() => {
    if (isConnected && solanaAddress) {
      fetchWalletData(solanaAddress);
    }
  }, [isConnected, solanaAddress]);

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
        {!data && !loading && !error && (
          <div className="empty-state">
            <p className="empty-state-text">Connect or Search Wallet to Enter the Refinery</p>
            <button onClick={openConnectModal} className="btn-connect btn-connect--large">
              Connect Wallet
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
              <OilStats data={data} />
            </section>
          </>
        )}

      </main>

      {/* Wallet Connect Modal — shows wallet options even if extensions aren't installed */}
      <WalletConnectModal isOpen={showConnectModal} onClose={closeConnectModal} />
    </div>
  );
}
