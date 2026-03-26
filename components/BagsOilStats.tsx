"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { BagsOilData } from "@/lib/oilCalculator";

interface BagsRefineStatusData {
  status: "idle" | "refining" | "completed";
  endsAt?: string;
  startedAt?: string;
  durationMs?: number;
  crudeAmount?: number;
  feeCrude?: number;
  txCrude?: number;
  oilUnits?: number;
}

interface BagsOilStatsProps {
  data: BagsOilData & {
    address: string;
    totalFeesSol: number;
    lastRefinedBagsOilUnits?: number;
    activeBagsRefine?: BagsRefineStatusData | null;
  };
  isOwner: boolean;
  onConnectWallet: () => void;
  onRefined?: (oilUnits: number) => void;
  onCheckUpdates?: () => void;
  syncing?: boolean;
  onSpeedUp?: () => Promise<boolean>;
}

export default function BagsOilStats({
  data,
  isOwner,
  onConnectWallet,
  onRefined,
  onCheckUpdates,
  syncing = false,
  onSpeedUp,
}: BagsOilStatsProps) {
  const { address, oilUnits, barrels, feeCrude, txCrude, bagsCrude, title } = data;
  const lastRefined = data.lastRefinedBagsOilUnits ?? 0;

  const alreadyRefined = lastRefined > 0;
  const hasNewTransactions = oilUnits > lastRefined;

  const [revealed, setRevealed] = useState(alreadyRefined);
  const [showOwnerMsg, setShowOwnerMsg] = useState(false);

  const [refineStatus, setRefineStatus] = useState<"idle" | "refining" | "completed" | "claimed">(
    alreadyRefined ? "claimed" : "idle"
  );
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState("");
  const [pendingCrude, setPendingCrude] = useState<number | null>(null);
  const [startingRefine, setStartingRefine] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState(false);
  const [speedingUp, setSpeedingUp] = useState(false);
  const [speedUpError, setSpeedUpError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset state on data change
  useEffect(() => {
    const wasRefined = (data.lastRefinedBagsOilUnits ?? 0) > 0;
    setRevealed(wasRefined);
    setShowOwnerMsg(false);
    setStartingRefine(false);
    setClaiming(false);

    if (data.activeBagsRefine && data.activeBagsRefine.status !== "idle") {
      if (data.activeBagsRefine.status === "refining") {
        setRefineStatus("refining");
        setEndsAt(new Date(data.activeBagsRefine.endsAt!).getTime());
        setPendingCrude(data.activeBagsRefine.crudeAmount ?? 0);
      } else if (data.activeBagsRefine.status === "completed") {
        setRefineStatus("completed");
        setPendingCrude(data.activeBagsRefine.crudeAmount ?? 0);
      }
    } else if (wasRefined) {
      setRefineStatus("claimed");
    } else {
      setRefineStatus("idle");
    }
  }, [address, data.lastRefinedBagsOilUnits, data.activeBagsRefine]);

  // Fetch refine status on mount
  useEffect(() => {
    if (!address || data.activeBagsRefine) return;
    if (refineStatus === "claimed") return;

    fetch(`/api/bags-refine-status?wallet=${encodeURIComponent(address)}`)
      .then((r) => r.json())
      .then((res: BagsRefineStatusData) => {
        if (res.status === "refining") {
          setRefineStatus("refining");
          setEndsAt(new Date(res.endsAt!).getTime());
          setPendingCrude(res.crudeAmount ?? 0);
        } else if (res.status === "completed") {
          setRefineStatus("completed");
          setPendingCrude(res.crudeAmount ?? 0);
        }
      })
      .catch(() => {});
  }, [address]);

  // Countdown timer
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
        fetch(`/api/bags-refine-status?wallet=${encodeURIComponent(address)}`)
          .then((r) => r.json())
          .then((res: BagsRefineStatusData) => {
            if (res.status === "completed") {
              setPendingCrude(res.crudeAmount ?? 0);
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

    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [refineStatus, endsAt, address]);

  // Start Bags refine
  const handleRefine = useCallback(async () => {
    if (!isOwner) {
      setShowOwnerMsg(true);
      return;
    }

    setStartingRefine(true);
    try {
      const res = await fetch("/api/bags-refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          swapCount: oilUnits,
          totalFeesSol: data.totalFeesSol,
        }),
      });
      const json = await res.json();

      if (json.success) {
        setRefineStatus("refining");
        setEndsAt(new Date(json.endsAt).getTime());
        setPendingCrude(json.crudeAmount ?? 0);
      } else if (json.error) {
        console.error("Bags refine error:", json.error);
      }
    } catch (err) {
      console.error("Failed to start Bags refine:", err);
    } finally {
      setStartingRefine(false);
    }
  }, [isOwner, address, oilUnits, data.totalFeesSol]);

  // Claim Bags CRUDE
  const handleClaim = useCallback(async () => {
    setClaiming(true);
    setClaimError(false);
    try {
      const res = await fetch("/api/bags-refine/claim", {
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
        console.error("Bags claim error:", json.error);
        setClaimError(true);
      }
    } catch (err) {
      console.error("Failed to claim Bags:", err);
      setClaimError(true);
    } finally {
      setClaiming(false);
    }
  }, [address, oilUnits, onRefined]);

  // Auto-claim when completed
  useEffect(() => {
    if (refineStatus !== "completed") return;
    setClaimError(false);
    handleClaim();
  }, [refineStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  // Speed Up
  const handleSpeedUp = useCallback(async () => {
    if (!onSpeedUp) return;
    setSpeedingUp(true);
    setSpeedUpError(null);
    try {
      const success = await onSpeedUp();
      if (success) {
        const res = await fetch(`/api/bags-refine-status?wallet=${encodeURIComponent(address)}`);
        const statusData: BagsRefineStatusData = await res.json();
        if (statusData.status === "completed") {
          setRefineStatus("completed");
          setPendingCrude(statusData.crudeAmount ?? 0);
        }
      } else {
        setSpeedUpError("Speed up verification failed. Please try again.");
      }
    } catch (err) {
      console.error("[BagsSpeedUp] error:", err);
      const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
      const isRejection =
        msg.includes("reject") || msg.includes("cancel") ||
        msg.includes("denied") || msg.includes("decline") || msg.includes("user abort");
      setSpeedUpError(isRejection ? "Transaction rejected." : "Speed up failed. Please try again.");
    } finally {
      setSpeedingUp(false);
    }
  }, [onSpeedUp, address]);

  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  const renderRefineryAction = () => {
    if (startingRefine) {
      return <div className="loading-msg">Starting Bags refine...</div>;
    }

    if (showOwnerMsg && !isOwner) {
      return (
        <div className="refine-owner-msg">
          <p className="refine-owner-text">
            Only connected wallets can refine. Connect this wallet to refine.
          </p>
          <button onClick={onConnectWallet} className="btn-refine btn-refine--connect">
            Connect Wallet to Refine
          </button>
        </div>
      );
    }

    if (refineStatus === "refining") {
      return (
        <div className="refine-timer-container">
          <p className="refine-timer-label">Refining your Bags oil...</p>
          <div className="refine-timer">{remaining || "--:--:--"}</div>
          {pendingCrude != null && pendingCrude > 0 && (
            <p className="refine-pending-amount">
              {pendingCrude.toLocaleString()} $CRUDE pending
            </p>
          )}
          {isOwner && onSpeedUp && (
            <>
              <button onClick={handleSpeedUp} className="btn-speedup" disabled={speedingUp}>
                {speedingUp ? "Verifying payment..." : "\u26A1 Speed Up \u2192 0.002 SOL"}
              </button>
              {speedUpError && <p className="speedup-error">{speedUpError}</p>}
            </>
          )}
        </div>
      );
    }

    if (refineStatus === "completed") {
      return (
        <div className="refine-claim-container">
          {claimError ? (
            <>
              <p className="refine-claim-label">Refinement complete!</p>
              {pendingCrude != null && pendingCrude > 0 && (
                <p className="refine-claim-amount">{pendingCrude.toLocaleString()} $CRUDE ready</p>
              )}
              <button onClick={handleClaim} className="btn-refine btn-refine--claim" disabled={claiming}>
                {claiming ? "Claiming..." : "Retry Claim"}
              </button>
            </>
          ) : (
            <>
              <p className="refine-claim-label">Claiming your $CRUDE...</p>
              {pendingCrude != null && pendingCrude > 0 && (
                <p className="refine-claim-amount">{pendingCrude.toLocaleString()} $CRUDE</p>
              )}
            </>
          )}
        </div>
      );
    }

    if (revealed && hasNewTransactions && isOwner) {
      const newSwaps = oilUnits - lastRefined;
      return (
        <div className="refine-new-txns">
          <p className="refine-new-txns-text">
            <strong>{newSwaps.toLocaleString()}</strong> New Bags swaps detected since your last
            refine. Refine again to update your stats!
          </p>
          <button onClick={handleRefine} className="btn-refine btn-refine--rerefine">
            Refine Bags Oil
          </button>
        </div>
      );
    }

    if (revealed && !hasNewTransactions) {
      return (
        <div className="refine-done-msg">
          <p className="refine-done-text">
            Refined — <strong>{bagsCrude.toLocaleString()} $CRUDE</strong>
          </p>
          <p className="refine-done-sub">
            Make more swaps on Bags to unlock more barrels, then come back to refine again!
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
                  width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
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

    return (
      <button onClick={handleRefine} className="btn-refine">
        Refine Bags Oil
      </button>
    );
  };

  return (
    <div className="oil-stats-grid">
      <div className="panel refinery-panel oil-stats-refinery">
        <p className="panel-label">Bags CRUDE Refinery</p>
        <div className="refinery-desc">
          <h2>Refine your Bags activity into $CRUDE.</h2>
          <h1>How it works?</h1>
          <p>1. Every Bags swap generates <b>Oil Units</b>.</p>
          <p>2. 50 Oil Units fill one <b>oil barrel</b>.</p>
          <p>3. Every 2 Oil Units refine into <b>1 $CRUDE</b>.</p>
          <p>4. Fee positions also generate <b>bonus $CRUDE</b>.</p>
        </div>
        {renderRefineryAction()}
      </div>

      <div className="panel oil-stats-production">
        <p className="panel-label">Bags Production Stats</p>
        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-card-label">Wallet</p>
            <p className="stat-card-value">{shortAddress}</p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Swap Oil Units</p>
            <p className="stat-card-value">{oilUnits.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Barrels Produced</p>
            <p className="stat-card-value">{barrels.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Fee $CRUDE</p>
            {revealed ? (
              <p className="stat-card-value accent">{feeCrude.toLocaleString()}</p>
            ) : refineStatus === "refining" || refineStatus === "completed" ? (
              <p className="stat-card-value dim">Pending...</p>
            ) : (
              <p className="stat-card-value">-</p>
            )}
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Transaction $CRUDE</p>
            {revealed ? (
              <p className="stat-card-value accent">{txCrude.toLocaleString()}</p>
            ) : refineStatus === "refining" || refineStatus === "completed" ? (
              <p className="stat-card-value dim">Pending...</p>
            ) : (
              <p className="stat-card-value">-</p>
            )}
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Total Bags $CRUDE</p>
            {revealed ? (
              <p className="stat-card-value accent">{bagsCrude.toLocaleString()}</p>
            ) : refineStatus === "refining" || refineStatus === "completed" ? (
              <p className="stat-card-value dim">Pending...</p>
            ) : (
              <p className="stat-card-value">-</p>
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
    </div>
  );
}
