"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useWalletConnection, useWalletSession, useSolTransfer } from "@solana/react-hooks";
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

export default function RefineryPage() {
  const { connected, disconnect, wallet } = useWalletConnection();
  const session = useWalletSession();
  const solTransfer = useSolTransfer();
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

  // Full fetch — clears data, shows loading skeleton (used for first load / search)
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

  // Background sync — keeps existing data visible, updates in-place
  const [syncing, setSyncing] = useState(false);
  async function syncWalletData(address: string) {
    setSyncing(true);
    try {
      const res = await fetch(`/api/wallet?address=${encodeURIComponent(address)}`);
      if (!res.ok) throw new Error("Failed to sync wallet data");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setSyncing(false);
    }
  }

  // Auto-extract: when verified and stored check found nothing, auto-fetch wallet data
  const autoExtractedRef = useRef<string | null>(null);
  useEffect(() => {
    if (
      connected &&
      solanaAddress &&
      isVerified &&
      storedChecked &&
      !data &&
      !loading &&
      !storedLoading &&
      !error &&
      autoExtractedRef.current !== solanaAddress
    ) {
      autoExtractedRef.current = solanaAddress;
      fetchWalletData(solanaAddress);
    }
  }, [connected, solanaAddress, isVerified, storedChecked, data, loading, storedLoading, error]);

  // Derived states
  // Speed Up handler — sends 0.002 SOL via useSolTransfer and verifies on backend
  const handleSpeedUp = useCallback(async (): Promise<boolean> => {
    if (!solanaAddress || !session) {
      console.error("[SpeedUp] No wallet connected", { solanaAddress, session: !!session });
      return false;
    }

    console.log("[SpeedUp] Initiating transfer", { wallet: solanaAddress });

    // Use framework-kit useSolTransfer hook — handles wallet popup, signing, and sending
    const sig = await solTransfer.send({
      amount: BigInt(2_000_000),
      destination: "DfUAhLYZ2n8XNv2rPZHtyQde6wf8A99KMiqsbSjqF3b4",
      authority: session,
    });

    console.log("[SpeedUp] Transaction sent", { signature: String(sig) });

    // Retry verification — solTransfer.send() resolves once the tx is submitted,
    // but Helius may need several seconds to index it at "confirmed" commitment.
    // We retry up to MAX_RETRIES times before surfacing an error to the user.
    const MAX_RETRIES = 5;
    const RETRY_DELAY_MS = 3_000;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));

      let json: { success?: boolean; error?: string };
      try {
        const res = await fetch("/api/verify-speedup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet: solanaAddress, signature: String(sig) }),
        });
        // Guard against non-JSON responses (e.g. Next.js 500 HTML error page)
        const text = await res.text();
        try {
          json = JSON.parse(text);
        } catch {
          console.error(`[SpeedUp] Non-JSON response on attempt ${attempt}:`, text.slice(0, 200));
          if (attempt < MAX_RETRIES) continue;
          return false;
        }
      } catch (fetchErr) {
        console.error(`[SpeedUp] Fetch error on attempt ${attempt}:`, fetchErr);
        if (attempt < MAX_RETRIES) continue;
        return false;
      }

      console.log(`[SpeedUp] Verification attempt ${attempt}/${MAX_RETRIES}`, json);

      if (json.success === true) return true;

      // Only retry on "not found / not yet confirmed" — fail fast on all other errors
      const isConfirmationDelay =
        typeof json.error === "string" &&
        (json.error.includes("not found") || json.error.includes("not yet confirmed"));

      if (!isConfirmationDelay || attempt === MAX_RETRIES) {
        console.error("[SpeedUp] Verification failed", json.error);
        return false;
      }

      console.log(`[SpeedUp] Not yet confirmed, waiting before retry ${attempt + 1}/${MAX_RETRIES}...`);
    }

    return false;
  }, [solanaAddress, session, solTransfer]);

  const isWalletReady = connected && solanaAddress;
  const showVerifyPrompt = isWalletReady && !isVerified && !data && !loading && !storedLoading && !error;

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

        {/* Verifying — auto sign in progress */}
        {showVerifyPrompt && verifying && (
          <div className="verify-prompt">
            <div className="verify-prompt-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h2 className="verify-prompt-title">Verifying Wallet</h2>
            <p className="verify-prompt-desc">
              Please sign the message in your wallet to verify ownership.
            </p>
          </div>
        )}

        {/* Verify failed — user rejected or error, show retry */}
        {showVerifyPrompt && !verifying && verifyError && (
          <div className="verify-prompt">
            <div className="verify-prompt-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h2 className="verify-prompt-title">Verification Required</h2>
            <p className="verify-prompt-error">{verifyError}</p>
            <button
              onClick={() => {
                handleVerify();
              }}
              className="btn-verify"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Try Again
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
                syncing={syncing}
                onCheckUpdates={() => syncWalletData(data.address)}
                middleSlot={
                  <BagsPanel
                    bagsActive={data.bagsActive ?? false}
                    totalFeesSol={data.totalFeesSol ?? 0}
                    bonusCrude={data.bonusCrude ?? 0}
                  />
                }
                onSpeedUp={isVerified && connected && solanaAddress === data.address ? handleSpeedUp : undefined}
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
