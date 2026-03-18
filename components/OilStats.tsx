"use client";

import { useState, useEffect } from "react";
import type { OilData } from "@/lib/oilCalculator";

interface OilStatsProps {
  data: OilData & { address: string; lastRefinedOilUnits?: number };
  /** true only when the viewed wallet is the connected wallet */
  isOwner: boolean;
  /** opens the wallet connect modal */
  onConnectWallet: () => void;
  /** called after a successful refine so the parent can update its state */
  onRefined?: (oilUnits: number) => void;
}

export default function OilStats({
  data,
  isOwner,
  onConnectWallet,
  onRefined,
}: OilStatsProps) {
  const { address, oilUnits, barrels, crude, title } = data;
  const lastRefined = data.lastRefinedOilUnits ?? 0;

  // Derive refine state from persisted data
  const alreadyRefined = lastRefined > 0;
  const hasNewTransactions = oilUnits > lastRefined;

  // Start "revealed" if the wallet was previously refined (show $CRUDE immediately)
  const [revealed, setRevealed] = useState(alreadyRefined);
  const [refining, setRefining] = useState(false);
  const [showOwnerMsg, setShowOwnerMsg] = useState(false);

  // When data changes (e.g. different wallet searched), reset local state
  useEffect(() => {
    setRevealed(lastRefined > 0);
    setRefining(false);
    setShowOwnerMsg(false);
  }, [address, lastRefined]);

  const handleRefine = async () => {
    if (!isOwner) {
      setShowOwnerMsg(true);
      return;
    }

    setRefining(true);

    // Start the animation, then persist the refine
    setTimeout(async () => {
      // Save refine state to Supabase
      try {
        await fetch("/api/refine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, oilUnits }),
        });
      } catch (err) {
        console.error("Failed to persist refine:", err);
      }

      setRefining(false);
      setRevealed(true);
      onRefined?.(oilUnits);
    }, 5000);
  };

  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  const shareText = `Solana Oil Factory 🛢️

I just refined ${crude.toLocaleString()} CRUDE

📊 Transactions: ${oilUnits.toLocaleString()}
🏷️ Title: ${title}

Check your barrel:
https://solanaoilfactory.xyz`;

  const handleShare = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      "_blank"
    );
  };

  // Determine what the refinery panel should show
  const renderRefineryAction = () => {
    // Currently refining
    if (refining) {
      return <div className="loading-msg">⚙️ Refining your oil...</div>;
    }

    // Not the owner — show connect message
    if (showOwnerMsg && !isOwner) {
      return (
        <div className="refine-owner-msg">
          <p className="refine-owner-text">
            You can only refine oil from your own wallet. Connect this wallet to
            refine.
          </p>
          <button
            onClick={onConnectWallet}
            className="btn-refine btn-refine--connect"
          >
            Connect Wallet to Refine
          </button>
        </div>
      );
    }

    // Already refined and has NEW transactions → can re-refine
    if (revealed && hasNewTransactions && isOwner) {
      const newTxCount = oilUnits - lastRefined;
      return (
        <div className="refine-new-txns">
          <p className="refine-new-txns-text">
            <strong>{newTxCount.toLocaleString()}</strong> new transactions
            detected since your last refine. Re-refine to update your stats!
          </p>
          <button onClick={handleRefine} className="btn-refine btn-refine--rerefine">
            🛢 Re-Refine Oil
          </button>
        </div>
      );
    }

    // Already refined, no new transactions
    if (revealed && !hasNewTransactions) {
      return (
        <div className="refine-done-msg">
          <p className="refine-done-text">
            ✅ Already refined — <strong>{crude.toLocaleString()} $CRUDE</strong>
          </p>
          <p className="refine-done-sub">
            Make more transactions on Solana to unlock new oil, then come back to
            re-refine.
          </p>
        </div>
      );
    }

    // Never refined — show refine button
    return (
      <button onClick={handleRefine} className="btn-refine">
        🛢 Refine Oil
      </button>
    );
  };

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
              <p
                className={`stat-card-value${revealed ? " accent" : " dim"}`}
              >
                {revealed ? crude.toLocaleString() : "—"}
              </p>
            </div>
          </div>

          {revealed && (
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
          {renderRefineryAction()}
        </div>
      </div>

      {/* ── Share Panel (only after refining) ── */}
      {revealed && (
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
