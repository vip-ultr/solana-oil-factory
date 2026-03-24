"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useWalletConnection } from "@solana/react-hooks";
import { SiSolana } from "react-icons/si";
import WalletConnectModal from "@/components/WalletConnectModal";

interface LeaderboardEntry {
  wallet_address: string;
  total_crude: number;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export default function HomePage() {
  const router = useRouter();
  const { connected } = useWalletConnection();

  const [showConnectModal, setShowConnectModal] = useState(false);
  const openConnectModal = useCallback(() => setShowConnectModal(true), []);
  const closeConnectModal = useCallback(() => setShowConnectModal(false), []);

  const [topWallets, setTopWallets] = useState<LeaderboardEntry[]>([]);

  // Close connect modal when wallet connects
  useEffect(() => {
    if (connected) setShowConnectModal(false);
  }, [connected]);

  // Fetch top 3 leaderboard entries
  useEffect(() => {
    fetch("/api/leaderboard?limit=3")
      .then((res) => res.json())
      .then((json) => {
        if (json.leaderboard) setTopWallets(json.leaderboard);
      })
      .catch(() => {});
  }, []);

  function handleEnterRefinery() {
    if (connected) {
      router.push("/refinery");
    } else {
      openConnectModal();
    }
  }

  return (
    <div className="page">
      <main className="home-main">

        {/* ── 1. HERO ── */}
        <section className="home-hero">
          <h1 className="home-hero-title">Solana Oil Factory</h1>
          <p className="home-hero-subtitle">Turn your wallet into an oil empire</p>
          <p className="home-hero-desc">
            Convert on-chain activity into oil, refine it into $CRUDE, and compete on the leaderboard.
          </p>
        </section>

        {/* ── 2. ACTIVE REFINERIES ── */}
        <section className="home-section">
          <h2 className="home-section-title">Active Refineries</h2>
          <div className="home-section-rule" />
          <div className="home-refineries-grid">
            {/* Solana Refinery */}
            <div className="home-refinery-card">
              <div className="home-refinery-icon">
                <SiSolana size={28} style={{ color: "var(--accent)" }} />
              </div>
              <h3 className="home-refinery-name">Solana Refinery</h3>
              <p className="home-refinery-desc">Convert wallet activity into oil</p>
              <Link href="/refinery" className="home-refinery-btn">Enter</Link>
            </div>

            {/* Bags Refinery */}
            <div className="home-refinery-card">
              <div className="home-refinery-icon">
                <img src="/bags-icon.png" alt="Bags" className="home-refinery-logo" />
              </div>
              <h3 className="home-refinery-name">Bags Refinery</h3>
              <p className="home-refinery-desc">Convert fee earnings into bonus $CRUDE</p>
              <Link href="/refinery" className="home-refinery-btn">Enter</Link>
            </div>

            {/* Pump.fun — Coming Soon */}
            <div className="home-refinery-card home-refinery-card--disabled">
              <div className="home-refinery-icon">
                <img src="/pumpfun-icon.png" alt="Pump.fun" className="home-refinery-logo" />
              </div>
              <h3 className="home-refinery-name">Pump.fun Refinery</h3>
              <span className="home-refinery-btn home-refinery-btn--disabled">Coming Soon</span>
            </div>

            {/* Bonk.fun — Coming Soon */}
            <div className="home-refinery-card home-refinery-card--disabled">
              <div className="home-refinery-icon">
                <img src="/bonkfun-icon.png" alt="Bonk.fun" className="home-refinery-logo" />
              </div>
              <h3 className="home-refinery-name">Bonk.fun Refinery</h3>
              <span className="home-refinery-btn home-refinery-btn--disabled">Coming Soon</span>
            </div>

            {/* Candle — Coming Soon */}
            <div className="home-refinery-card home-refinery-card--disabled">
              <div className="home-refinery-icon">
                <img src="/candle-icon.png" alt="Candle" className="home-refinery-logo" />
              </div>
              <h3 className="home-refinery-name">Candle Refinery</h3>
              <span className="home-refinery-btn home-refinery-btn--disabled">Coming Soon</span>
            </div>

            {/* Believe — Coming Soon */}
            <div className="home-refinery-card home-refinery-card--disabled">
              <div className="home-refinery-icon">
                <img src="/believe-icon.png" alt="Believe" className="home-refinery-logo" />
              </div>
              <h3 className="home-refinery-name">Believe Refinery</h3>
              <span className="home-refinery-btn home-refinery-btn--disabled">Coming Soon</span>
            </div>
          </div>
        </section>

        {/* ── 3. ENTER REFINERY CTA ── */}
        <div className="home-cta-divider">
          <button onClick={handleEnterRefinery} className="home-hero-cta">
            Enter Refinery
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* ── 4. HOW IT WORKS ── */}
        <section className="home-section">
          <h2 className="home-section-title">How It Works</h2>
          <div className="home-section-rule" />
          <div className="home-steps">
            <div className="home-step">
              <div className="home-step-num">1</div>
              <p className="home-step-label">Activity</p>
              <svg className="home-step-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
              <p className="home-step-result">Oil</p>
            </div>
            <div className="home-step">
              <div className="home-step-num">2</div>
              <p className="home-step-label">Refine</p>
              <svg className="home-step-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
              <p className="home-step-result">$CRUDE</p>
            </div>
            <div className="home-step">
              <div className="home-step-num">3</div>
              <p className="home-step-label">Compete</p>
              <svg className="home-step-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
              <p className="home-step-result">Leaderboard</p>
            </div>
          </div>
        </section>

        {/* ── 5. LEADERBOARD PREVIEW ── */}
        <section className="home-section">
          <h2 className="home-section-title">Top Refiners</h2>
          <div className="home-section-rule" />
          {topWallets.length > 0 ? (
            <div className="home-lb-list">
              {topWallets.map((entry, i) => (
                <div key={entry.wallet_address} className={`home-lb-row home-lb-row--${i + 1}`}>
                  <span className="home-lb-medal">{MEDALS[i]}</span>
                  <span className="home-lb-addr">
                    {entry.wallet_address.slice(0, 4)}...{entry.wallet_address.slice(-4)}
                  </span>
                  <span className="home-lb-crude">
                    {entry.total_crude.toLocaleString()} $CRUDE
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="home-lb-empty">Loading leaderboard...</p>
          )}
          <Link href="/leaderboard" className="home-lb-cta">
            View Full Leaderboard
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </Link>
        </section>

      </main>

      <WalletConnectModal isOpen={showConnectModal} onClose={closeConnectModal} />
    </div>
  );
}
