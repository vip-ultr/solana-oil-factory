"use client";

import { useState } from "react";
import Link from "next/link";
import { useWalletConnection } from "@solana/react-hooks";
import { SiSolana } from "react-icons/si";
import BarrelHeroSection from "@/components/BarrelHeroSection";

interface WalletProfileProps {
  address: string;
  oilUnits: number;
  barrels: number;
  fillPercentages: number[];
  /** Null until the wallet has completed and claimed at least one refine */
  claimedCrude: number | null;
  claimedBagsCrude: number | null;
  claimedTotalCrude: number | null;
  claimedTitle: string | null;
  /** True when a refine is currently in progress (timer running) */
  isRefining: boolean;
  rank: number | null;
  partial: boolean;
}

export default function WalletProfile({
  address,
  oilUnits,
  barrels,
  fillPercentages,
  claimedCrude,
  claimedBagsCrude,
  claimedTotalCrude,
  claimedTitle,
  isRefining,
  rank,
  partial,
}: WalletProfileProps) {
  const revealed = claimedTotalCrude !== null;
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

  const shareText = revealed
    ? `Solana Oil Factory \u{1F6E2}\u{FE0F}

${claimedTotalCrude!.toLocaleString()} $CRUDE${(claimedBagsCrude ?? 0) > 0 ? ` (${claimedBagsCrude!.toLocaleString()} from Bags Refinery)` : ""}

\u{1F4CA} Transactions: ${oilUnits.toLocaleString()}
\u{1F3F7}\u{FE0F} Title: ${claimedTitle}

Check this wallet:
https://solanaoilfactory.xyz/wallet/${address}`
    : `Solana Oil Factory \u{1F6E2}\u{FE0F}

\u{1F4CA} Transactions: ${oilUnits.toLocaleString()}

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

            {/* Activity metrics */}
            <div className="stats-grid stats-grid--two">
              <div className="stat-card">
                <p className="stat-card-label">Oil Units</p>
                <p className="stat-card-value">{oilUnits.toLocaleString()}</p>
              </div>
              <div className="stat-card">
                <p className="stat-card-label">Barrels Produced</p>
                <p className="stat-card-value">{barrels.toLocaleString()}</p>
              </div>
            </div>

            {/* $CRUDE Production Breakdown */}
            <div className="prod-breakdown">
              <p className="prod-breakdown-heading">$CRUDE Production</p>

              <div className="prod-breakdown-list">
                {/* Solana Refinery */}
                <div className="prod-breakdown-row">
                  <div className="prod-breakdown-source">
                    <span className="prod-breakdown-icon prod-breakdown-icon--solana">
                      <SiSolana size={13} />
                    </span>
                    <span className="prod-breakdown-name">Solana Refinery</span>
                    <span className="prod-breakdown-badge prod-breakdown-badge--active">Active</span>
                  </div>
                  <span className="prod-breakdown-value">
                    {revealed ? claimedCrude!.toLocaleString() : (isRefining ? "Refining…" : "—")}
                  </span>
                </div>

                {/* Bags Refinery */}
                <div className="prod-breakdown-row">
                  <div className="prod-breakdown-source">
                    <span className="prod-breakdown-icon">
                      <img src="/bags-icon.png" alt="Bags" />
                    </span>
                    <span className="prod-breakdown-name">Bags Refinery</span>
                    <span className="prod-breakdown-badge prod-breakdown-badge--active">Active</span>
                  </div>
                  <span className="prod-breakdown-value">
                    {revealed ? (claimedBagsCrude ?? 0).toLocaleString() : "—"}
                  </span>
                </div>

                {/* Coming soon refineries */}
                {[
                  { name: "Pump.fun", icon: "/pumpfun-icon.png" },
                  { name: "Bonk.fun", icon: "/bonkfun-icon.png" },
                  { name: "Candle",   icon: "/candle-icon.png" },
                  { name: "Believe",  icon: "/believe-icon.png" },
                ].map((r) => (
                  <div key={r.name} className="prod-breakdown-row prod-breakdown-row--inactive">
                    <div className="prod-breakdown-source">
                      <span className="prod-breakdown-icon">
                        <img src={r.icon} alt={r.name} />
                      </span>
                      <span className="prod-breakdown-name">{r.name} Refinery</span>
                      <span className="prod-breakdown-badge prod-breakdown-badge--soon">Soon</span>
                    </div>
                    <span className="prod-breakdown-value prod-breakdown-value--dim">—</span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="prod-breakdown-total">
                <span className="prod-breakdown-total-label">Total $CRUDE</span>
                <span className={`prod-breakdown-total-value${revealed ? " prod-breakdown-total-value--revealed" : ""}`}>
                  {revealed ? claimedTotalCrude!.toLocaleString() : (isRefining ? "Refining…" : "—")}
                </span>
              </div>
            </div>

            {revealed && (
              <div className="title-badge">
                <span className="title-badge-label">Prestige Title</span>
                <span className="title-badge-value">{claimedTitle}</span>
              </div>
            )}
          </div>
        </section>

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
