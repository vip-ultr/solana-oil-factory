"use client";

import { useState } from "react";
import Link from "next/link";
import { useWalletConnection } from "@solana/react-hooks";
import BarrelHeroSection from "@/components/BarrelHeroSection";
import BagsPanel from "@/components/BagsPanel";

interface WalletProfileProps {
  address: string;
  oilUnits: number;
  barrels: number;
  fillPercentages: number[];
  crude: number;
  bonusCrude: number;
  totalCrude: number;
  title: string;
  totalFeesSol: number;
  bagsActive: boolean;
  rank: number | null;
  partial: boolean;
}

export default function WalletProfile({
  address,
  oilUnits,
  barrels,
  fillPercentages,
  crude,
  bonusCrude,
  totalCrude,
  title,
  totalFeesSol,
  bagsActive,
  rank,
  partial,
}: WalletProfileProps) {
  const { wallet } = useWalletConnection();
  const connectedAddress = wallet?.account?.address?.toString() ?? null;
  const isOwner = connectedAddress === address;

  const [copied, setCopied] = useState(false);

  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = address;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareText = `Solana Oil Factory \u{1F6E2}\u{FE0F}

${totalCrude.toLocaleString()} CRUDE${bonusCrude > 0 ? ` (${bonusCrude.toLocaleString()} bonus from @BagsApp)` : ""}

\u{1F4CA} Transactions: ${oilUnits.toLocaleString()}
\u{1F3F7}\u{FE0F} Title: ${title}

Check this wallet:
https://solanaoilfactory.xyz/wallet/${address}`;

  const handleShare = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      "_blank"
    );
  };

  return (
    <div className="page">
      <main className="main">
        {/* Wallet Header */}
        <section className="profile-wallet-header">
          <div className="profile-address-row">
            <span className="profile-address">{shortAddress}</span>
            <button
              onClick={handleCopy}
              className="profile-copy-btn"
              title="Copy full address"
            >
              {copied ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
              )}
            </button>
            {copied && <span className="profile-copied-tooltip">Copied!</span>}
          </div>
          <span className={`profile-badge${isOwner ? " profile-badge--verified" : ""}`}>
            {isOwner ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Verified
              </>
            ) : (
              "Unverified"
            )}
          </span>
        </section>

        {/* Partial data notice */}
        {partial && (
          <div className="partial-banner">
            <span className="partial-banner-icon">⚡</span>
            <div className="partial-banner-text">
              <strong>Whale wallet detected!</strong> This wallet has more transactions than we
              could count in time. The stats below show at least{" "}
              <strong>{oilUnits.toLocaleString()}</strong> transactions — actual numbers
              may be higher.
            </div>
          </div>
        )}

        {/* Barrel Grid */}
        <BarrelHeroSection
          fillPercentages={fillPercentages}
          totalBarrels={barrels}
        />

        {/* Stats */}
        <section className="stats-section">
          <div className="panel">
            <p className="panel-label">Production Stats</p>
            <div className="stats-grid">
              <div className="stat-card">
                <p className="stat-card-label">Oil Units</p>
                <p className="stat-card-value">{oilUnits.toLocaleString()}</p>
              </div>
              <div className="stat-card">
                <p className="stat-card-label">Barrels Produced</p>
                <p className="stat-card-value">{barrels.toLocaleString()}</p>
              </div>
              <div className="stat-card">
                <p className="stat-card-label">Base CRUDE</p>
                <p className="stat-card-value">{crude.toLocaleString()}</p>
              </div>
              <div className="stat-card">
                <p className="stat-card-label">$CRUDE Balance</p>
                <div className="crude-breakdown">
                  <p className="crude-base">
                    Base: <span>{crude.toLocaleString()}</span>
                  </p>
                  {bonusCrude > 0 && (
                    <p className="crude-bonus">
                      Bonus (Bags): <span>+{bonusCrude.toLocaleString()}</span>
                    </p>
                  )}
                  <p className="crude-total">
                    Total: <span className="stat-card-value accent">{totalCrude.toLocaleString()}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="title-badge">
              <span className="title-badge-label">Prestige Title</span>
              <span className="title-badge-value">{title}</span>
            </div>
          </div>
        </section>

        {/* Bags Panel */}
        <BagsPanel
          bagsActive={bagsActive}
          totalFeesSol={totalFeesSol}
          bonusCrude={bonusCrude}
        />

        {/* Rank */}
        <section className="stats-section">
          <div className="panel profile-rank-panel">
            <p className="panel-label">Leaderboard Rank</p>
            {rank !== null ? (
              <div className="profile-rank-content">
                <p className="profile-rank-value">#{rank}</p>
                <p className="profile-rank-label">Global Ranking</p>
                <Link href="/leaderboard" className="profile-rank-link">
                  View Leaderboard
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ) : (
              <div className="profile-rank-content">
                <p className="profile-rank-unranked">Unranked</p>
                <p className="profile-rank-label">Refine to appear on the leaderboard</p>
              </div>
            )}
          </div>
        </section>

        {/* Share */}
        <section className="stats-section">
          <div className="panel share-panel">
            <p className="panel-label">Share</p>
            <p className="share-desc">Share this wallet&apos;s refinery stats.</p>
            <button onClick={handleShare} className="btn-share">
              Share on&nbsp;
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                width="17"
                height="17"
                aria-label="X"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>
            <div className="share-preview">
              <p className="share-preview-text">{shareText}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
