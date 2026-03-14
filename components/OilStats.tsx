"use client";

import { useState } from "react";
import type { OilData } from "@/lib/oilCalculator";

interface OilStatsProps {
  data: OilData & { address: string };
}

export default function OilStats({ data }: OilStatsProps) {
  const [refined, setRefined] = useState(false);
  const [refining, setRefining] = useState(false);

  const handleRefine = () => {
    setRefining(true);
    setTimeout(() => {
      setRefining(false);
      setRefined(true);
    }, 5000);
  };

  const { address, oilUnits, barrels, crude, title } = data;

  const shareText = `🛢️ Solana Oil Factory

I just refined ${crude} $CRUDE

📊 Transactions: ${oilUnits}
🏷️ Title: ${title}

Check your barrel:
https://solanaoilfactory.xyz`;

  const handleShare = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      "_blank",
    );
  };

  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <>
      {/* ── Stats + Refinery row ── */}
      <div className="panels-row">
        {/* Stats Panel */}
        <div className="panel">
          <p className="panel-label">Production Stats</p>
          <div className="stats-grid">
            <div className="stat-card">
              <p className="stat-card-label">Wallet</p>
              <p className="stat-card-value">{shortAddress}</p>
            </div>
            <div className="stat-card">
              <p className="stat-card-label">Oil Units</p>
              <p className="stat-card-value">{oilUnits.toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <p className="stat-card-label">Barrels Produced</p>
              <p className="stat-card-value">{barrels.toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <p className="stat-card-label">$CRUDE Balance</p>
              <p className={`stat-card-value${refined ? " accent" : " dim"}`}>
                {refined ? crude.toLocaleString() : "—"}
              </p>
            </div>
          </div>

          {refined && (
            <div className="title-badge">
              <span className="title-badge-label">Prestige Title</span>
              <span className="title-badge-value">{title}</span>
            </div>
          )}
        </div>

        {/* Refinery Panel */}
        <div className="panel refinery-panel">
          <p className="panel-label">Refinery</p>
          <p className="refinery-desc">
            <h2>Refine to unlock your prestige title.</h2>
            <h1>How it works?</h1>
            <p>
              1. Every transaction generates <b>Oil Units</b>.
            </p>
            <p>
              2. 50 Oil Units fill one <b>oil barrel</b>.
            </p>
            <p>
              3. Every 10 Oil Units refine into <b>1 $CRUDE</b>.
            </p>
            <p>
              4. Your total $CRUDE determines your <b>Prestige Title</b>.
            </p>
          </p>
          {refining ? (
            <div className="loading-msg">⚙️ Refining your oil...</div>
          ) : !refined ? (
            <button onClick={handleRefine} className="btn-refine">
              🛢 Refine Oil
            </button>
          ) : (
            <div className="refined-result">
              <p className="refined-text">
                Refined <strong>{crude} $CRUDE</strong> — {title}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Share Panel (only after refining) ── */}
      {refined && (
        <div className="panel share-panel">
          <p className="panel-label">Share</p>
          <p className="share-desc">Share your refinery status.</p>
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
      )}
    </>
  );
}
