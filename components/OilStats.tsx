"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type React from "react";
import type { OilData } from "@/lib/oilCalculator";

interface RefineStatusData {
  status: "idle" | "refining" | "completed";
  endsAt?: string;
  startedAt?: string;
  durationMs?: number;
  crudeAmount?: number;
  bonusCrude?: number;
  oilUnits?: number;
}

interface OilStatsProps {
  data: OilData & {
    address: string;
    lastRefinedOilUnits?: number;
    /** Active refine session from stored wallet response */
    activeRefine?: RefineStatusData | null;
  };
  /** true only when the viewed wallet is the connected wallet */
  isOwner: boolean;
  /** opens the wallet connect modal */
  onConnectWallet: () => void;
  /** called after a successful claim so the parent can update its state */
  onRefined?: (oilUnits: number) => void;
  /** triggers a background sync to detect new transactions */
  onCheckUpdates?: () => void;
  /** whether a background sync is in progress */
  syncing?: boolean;
  /** content rendered between Refinery and Production Stats panels */
  middleSlot?: React.ReactNode;
}

export default function OilStats({
  data,
  isOwner,
  onConnectWallet,
  onRefined,
  onCheckUpdates,
  syncing = false,
  middleSlot,
}: OilStatsProps) {
  const { address, oilUnits, barrels, crude, title } = data;
  const bonusCrude = data.bonusCrude ?? 0;
  const totalCrude = data.totalCrude ?? crude;
  const lastRefined = data.lastRefinedOilUnits ?? 0;

  // Derive refine state from persisted data
  const alreadyRefined = lastRefined > 0;
  const hasNewTransactions = oilUnits > lastRefined;

  // Start "revealed" if the wallet was previously refined (grandfathered wallets)
  const [revealed, setRevealed] = useState(alreadyRefined);
  const [showOwnerMsg, setShowOwnerMsg] = useState(false);

  // ── Refine timer state ──
  const [refineStatus, setRefineStatus] = useState<"idle" | "refining" | "completed" | "claimed">(
    alreadyRefined ? "claimed" : "idle"
  );
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState("");
  const [pendingCrude, setPendingCrude] = useState<{ crude: number; bonusCrude: number } | null>(null);
  const [startingRefine, setStartingRefine] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // When data changes (e.g. different wallet searched), reset local state
  useEffect(() => {
    const wasRefined = (data.lastRefinedOilUnits ?? 0) > 0;
    setRevealed(wasRefined);
    setShowOwnerMsg(false);
    setStartingRefine(false);
    setClaiming(false);

    // Initialize from activeRefine if provided (from stored wallet response)
    if (data.activeRefine && data.activeRefine.status !== "idle") {
      if (data.activeRefine.status === "refining") {
        setRefineStatus("refining");
        setEndsAt(new Date(data.activeRefine.endsAt!).getTime());
        setPendingCrude({
          crude: data.activeRefine.crudeAmount ?? 0,
          bonusCrude: data.activeRefine.bonusCrude ?? 0,
        });
      } else if (data.activeRefine.status === "completed") {
        setRefineStatus("completed");
        setPendingCrude({
          crude: data.activeRefine.crudeAmount ?? 0,
          bonusCrude: data.activeRefine.bonusCrude ?? 0,
        });
      }
    } else if (wasRefined) {
      setRefineStatus("claimed");
    } else {
      setRefineStatus("idle");
    }
  }, [address, data.lastRefinedOilUnits, data.activeRefine]);

  // Fetch refine status on mount (if not provided via activeRefine)
  useEffect(() => {
    if (!address || data.activeRefine) return;
    // Only fetch if not already determined
    if (refineStatus === "claimed") return;

    fetch(`/api/refine-status?wallet=${encodeURIComponent(address)}`)
      .then((r) => r.json())
      .then((res: RefineStatusData) => {
        if (res.status === "refining") {
          setRefineStatus("refining");
          setEndsAt(new Date(res.endsAt!).getTime());
          setPendingCrude({
            crude: res.crudeAmount ?? 0,
            bonusCrude: res.bonusCrude ?? 0,
          });
        } else if (res.status === "completed") {
          setRefineStatus("completed");
          setPendingCrude({
            crude: res.crudeAmount ?? 0,
            bonusCrude: res.bonusCrude ?? 0,
          });
        }
      })
      .catch(() => {});
  }, [address]);

  // ── Countdown timer ──
  useEffect(() => {
    if (refineStatus !== "refining" || !endsAt) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const tick = () => {
      const diff = endsAt - Date.now();
      if (diff <= 0) {
        setRefineStatus("completed");
        setRemaining("00:00:00");
        // Re-fetch to get confirmed crude amounts
        fetch(`/api/refine-status?wallet=${encodeURIComponent(address)}`)
          .then((r) => r.json())
          .then((res: RefineStatusData) => {
            if (res.status === "completed") {
              setPendingCrude({
                crude: res.crudeAmount ?? 0,
                bonusCrude: res.bonusCrude ?? 0,
              });
            }
          })
          .catch(() => {});
        return;
      }
      const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
      setRemaining(`${h}:${m}:${s}`);
    };

    tick(); // immediate first tick
    timerRef.current = setInterval(tick, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [refineStatus, endsAt, address]);

  // ── Start refine ──
  const handleRefine = useCallback(async () => {
    if (!isOwner) {
      setShowOwnerMsg(true);
      return;
    }

    setStartingRefine(true);
    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, oilUnits, bonusCrude }),
      });
      const json = await res.json();

      if (json.success) {
        setRefineStatus("refining");
        setEndsAt(new Date(json.endsAt).getTime());
        setPendingCrude({
          crude: json.crudeAmount ?? 0,
          bonusCrude: json.bonusCrude ?? 0,
        });
      } else if (json.error) {
        console.error("Refine error:", json.error);
      }
    } catch (err) {
      console.error("Failed to start refine:", err);
    } finally {
      setStartingRefine(false);
    }
  }, [isOwner, address, oilUnits, bonusCrude]);

  // ── Claim CRUDE ──
  const handleClaim = useCallback(async () => {
    setClaiming(true);
    try {
      const res = await fetch("/api/refine/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const json = await res.json();

      if (json.success) {
        setRefineStatus("claimed");
        setRevealed(true);
        setPendingCrude(null);
        onRefined?.(oilUnits);
      } else {
        console.error("Claim error:", json.error);
      }
    } catch (err) {
      console.error("Failed to claim:", err);
    } finally {
      setClaiming(false);
    }
  }, [address, oilUnits, onRefined]);

  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  const shareText = `Solana Oil Factory \u{1F6E2}\u{FE0F}

I just refined ${totalCrude.toLocaleString()} CRUDE${bonusCrude > 0 ? ` (${bonusCrude.toLocaleString()} bonus from @BagsApp)` : ""}

\u{1F4CA} Transactions: ${oilUnits.toLocaleString()}
\u{1F3F7}\u{FE0F} Title: ${title}

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
    // Starting refine (brief loading)
    if (startingRefine) {
      return <div className="loading-msg">Starting refine...</div>;
    }

    // Not the owner — show connect message
    if (showOwnerMsg && !isOwner) {
      return (
        <div className="refine-owner-msg">
          <p className="refine-owner-text">
            Only connected wallets can refine oil, connect this wallet to
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

    // ── Timer active — refining in progress ──
    if (refineStatus === "refining") {
      const pendingTotal = pendingCrude
        ? pendingCrude.crude + pendingCrude.bonusCrude
        : 0;
      return (
        <div className="refine-timer-container">
          <p className="refine-timer-label">Refining your oil...</p>
          <div className="refine-timer">{remaining || "--:--:--"}</div>
          {pendingTotal > 0 && (
            <p className="refine-pending-amount">
              {pendingTotal.toLocaleString()} $CRUDE pending
            </p>
          )}
        </div>
      );
    }

    // ── Completed — ready to claim ──
    if (refineStatus === "completed") {
      const pendingTotal = pendingCrude
        ? pendingCrude.crude + pendingCrude.bonusCrude
        : 0;
      return (
        <div className="refine-claim-container">
          <p className="refine-claim-label">Refinement complete!</p>
          {pendingTotal > 0 && (
            <p className="refine-claim-amount">
              {pendingTotal.toLocaleString()} $CRUDE ready
            </p>
          )}
          <button
            onClick={handleClaim}
            className="btn-refine btn-refine--claim"
            disabled={claiming}
          >
            {claiming ? "Claiming..." : "Claim $CRUDE"}
          </button>
        </div>
      );
    }

    // ── Already claimed + has NEW transactions → can re-refine ──
    if (revealed && hasNewTransactions && isOwner) {
      const newTxCount = oilUnits - lastRefined;
      return (
        <div className="refine-new-txns">
          <p className="refine-new-txns-text">
            <strong>{newTxCount.toLocaleString()}</strong> New transactions
            detected since your last refine. Refine again to update your stats!
          </p>
          <button onClick={handleRefine} className="btn-refine btn-refine--rerefine">
            🛢 Refine Oil
          </button>
        </div>
      );
    }

    // ── Already claimed, no new transactions ──
    if (revealed && !hasNewTransactions) {
      return (
        <div className="refine-done-msg">
          <p className="refine-done-text">
            Refined — <strong>{totalCrude.toLocaleString()} $CRUDE</strong>
          </p>
          <p className="refine-done-sub">
            Make more transactions on Solana to unlock more barrels, then come back to
            refine again!
          </p>
          {isOwner && onCheckUpdates && (
            <>
              <div className="refine-done-divider" />
              <button
                onClick={onCheckUpdates}
                className={`btn-check-updates${syncing ? " btn-check-updates--syncing" : ""}`}
                disabled={syncing}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={syncing ? "spin" : ""}
                >
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                {syncing ? "Syncing..." : "Sync Transactions"}
              </button>
            </>
          )}
        </div>
      );
    }

    // ── Never refined — show refine button ──
    return (
      <button onClick={handleRefine} className="btn-refine">
        🛢 Refine Oil
      </button>
    );
  };

  return (
    <div className="oil-stats-grid">
      {/* ── Bags slot (full-width on desktop, between refinery+stats on mobile) ── */}
      <div className="oil-stats-bags">{middleSlot}</div>

      {/* ── Refinery Panel ── */}
      <div className="panel refinery-panel oil-stats-refinery">
        <p className="panel-label"> CRUDE OIL Refinery</p>
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

      {/* ── Production Stats Panel ── */}
      <div className="panel oil-stats-production">
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
            {revealed ? (
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
            ) : refineStatus === "refining" || refineStatus === "completed" ? (
              <p className="stat-card-value dim">Pending...</p>
            ) : (
              <p className="stat-card-value dim">—</p>
            )}
          </div>
        </div>

        {revealed && (
          <div className="title-badge">
            <span className="title-badge-label">Prestige Title</span>
            <span className="title-badge-value">{title}</span>
          </div>
        )}
      </div>

      {/* ── Share Panel (only after claiming) ── */}
      {revealed && (
        <div className="panel share-panel oil-stats-share">
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
    </div>
  );
}
