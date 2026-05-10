"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWalletConnection } from "@solana/react-hooks";
import { Plus, Wallet, Loader2, ArrowRight, Zap } from "lucide-react";
import {
  ButtonLink,
  PoolBar,
  WalletPill,
} from "@/components/sof/primitives";
import { openConnectModal } from "@/components/sof/modals/ChromeOverlay";

interface WalletStats {
  // From /api/wallet — keys mirror the route's response shape.
  oilUnits: number;
  barrels: number;
  crude: number;
  bagsCrude: number;
  totalCrude: number;
  title: string;
  totalFeesSol: number;
  bagsActive: boolean;
  bagsAnalytics?: {
    total_swap_transactions: number;
    unique_tokens_traded: number;
  };
}

interface RefineStatus {
  status: "idle" | "refining" | "completed";
  crudeAmount?: number;
  oilUnits?: number;
  remainingMs?: number;
  endsAt?: string;
}

type StreamKind = "solana" | "bags";

export function RefineCard() {
  const { connected, wallet } = useWalletConnection();
  const address = wallet?.account?.address?.toString() ?? null;

  const [stats, setStats] = useState<WalletStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [solanaStatus, setSolanaStatus] = useState<RefineStatus | null>(null);
  const [bagsStatus, setBagsStatus] = useState<RefineStatus | null>(null);
  const [busy, setBusy] = useState<StreamKind | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Polling timer ref so we can clear when the component unmounts
  // or the wallet disconnects.
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStats = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/wallet?address=${address}`);
      if (!res.ok) throw new Error(`wallet fetch ${res.status}`);
      setStats(await res.json());
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [address]);

  const fetchStatuses = useCallback(async () => {
    if (!address) return;
    try {
      const [s, b] = await Promise.all([
        fetch(`/api/refine-status?wallet=${address}`).then((r) => r.json()),
        fetch(`/api/bags-refine-status?wallet=${address}`).then((r) => r.json()),
      ]);
      setSolanaStatus(s);
      setBagsStatus(b);
    } catch {
      // Network blip — ignore, the next poll will re-try.
    }
  }, [address]);

  // Bootstrap when a wallet connects; stop everything when it
  // disconnects.
  useEffect(() => {
    if (!connected || !address) {
      setStats(null);
      setSolanaStatus(null);
      setBagsStatus(null);
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
      return;
    }
    fetchStats();
    fetchStatuses();
    pollRef.current = setInterval(fetchStatuses, 4_000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [connected, address, fetchStats, fetchStatuses]);

  async function startRefine(kind: StreamKind) {
    if (!address || busy) return;
    setBusy(kind);
    setErr(null);
    try {
      const url = kind === "bags" ? "/api/bags-refine" : "/api/refine";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? `refine ${res.status}`);
      await fetchStatuses();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  async function claimRefine(kind: StreamKind) {
    if (!address || busy) return;
    setBusy(kind);
    setErr(null);
    try {
      const url = kind === "bags" ? "/api/bags-refine/claim" : "/api/refine/claim";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? `claim ${res.status}`);
      await Promise.all([fetchStats(), fetchStatuses()]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  if (!connected || !address) {
    return (
      <section className="sof-lp-refine sof-lp-refine-cta">
        <div className="card">
          <Wallet aria-hidden="true" />
          <h2>Connect a wallet to start refining</h2>
          <p>
            We&apos;ll read your on-chain transaction count and any
            Bags launchpad activity to compute your refining yield.
            Free signature only — no SOL moved.
          </p>
          <button
            type="button"
            className="sof-btn sof-btn-primary"
            onClick={openConnectModal}
          >
            <Plus size={14} strokeWidth={2} aria-hidden="true" />
            Connect wallet
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="sof-lp-refine">
      <div className="sof-lp-refine-head">
        <div>
          <WalletPill address={address} />
          {stats?.title && <span className="title">{stats.title}</span>}
        </div>
        <div className="totals">
          <span>
            <b>{(stats?.totalCrude ?? 0).toLocaleString()}</b> $CRUDE
          </span>
          <span className="sep">·</span>
          <span>
            <b>{(stats?.barrels ?? 0).toLocaleString()}</b> barrels
          </span>
        </div>
      </div>

      {err && (
        <div className="sof-lp-err" role="alert">
          {err}
        </div>
      )}

      <div className="sof-lp-streams">
        <StreamCard
          kind="solana"
          title="Solana refine"
          eyebrow="Transaction count → $CRUDE (capped 15k)"
          oilUnits={stats?.oilUnits ?? 0}
          oilLabel="tx count (oil units)"
          earned={stats?.crude ?? 0}
          status={solanaStatus}
          busy={busy === "solana"}
          loading={loading}
          onStart={() => startRefine("solana")}
          onClaim={() => claimRefine("solana")}
        />
        <StreamCard
          kind="bags"
          title="Bags refine"
          eyebrow="Bags swaps + fee positions (no cap)"
          oilUnits={stats?.bagsAnalytics?.total_swap_transactions ?? 0}
          oilLabel={`bags swaps · ${(stats?.totalFeesSol ?? 0).toFixed(3)} SOL fees`}
          earned={stats?.bagsCrude ?? 0}
          status={bagsStatus}
          busy={busy === "bags"}
          loading={loading}
          onStart={() => startRefine("bags")}
          onClaim={() => claimRefine("bags")}
        />
      </div>
    </section>
  );
}

interface StreamCardProps {
  kind: StreamKind;
  title: string;
  eyebrow: string;
  oilUnits: number;
  oilLabel: string;
  earned: number;
  status: RefineStatus | null;
  busy: boolean;
  loading: boolean;
  onStart: () => void;
  onClaim: () => void;
}

function StreamCard({
  kind,
  title,
  eyebrow,
  oilUnits,
  oilLabel,
  earned,
  status,
  busy,
  loading,
  onStart,
  onClaim,
}: StreamCardProps) {
  const isRefining = status?.status === "refining";
  const isCompleted = status?.status === "completed";
  const remainingMs = status?.remainingMs ?? 0;
  const remainingMin = Math.max(0, Math.ceil(remainingMs / 60_000));

  return (
    <div className="sof-lp-stream" data-kind={kind}>
      <div className="hd">
        <span className="ey">{eyebrow}</span>
        <h3>{title}</h3>
      </div>

      <dl className="stats">
        <div>
          <dt>{oilLabel}</dt>
          <dd>{oilUnits.toLocaleString()}</dd>
        </div>
        <div>
          <dt>$CRUDE earned</dt>
          <dd>{earned.toLocaleString()}</dd>
        </div>
      </dl>

      {isRefining && (
        <div className="active">
          <Loader2 className="spin" aria-hidden="true" />
          <div>
            <div className="lab">Refining…</div>
            <div className="meta">
              ~{remainingMin}m left ·{" "}
              {(status?.crudeAmount ?? 0).toLocaleString()} $CRUDE on the way
            </div>
          </div>
        </div>
      )}

      {isCompleted && (
        <div className="ready">
          <Zap aria-hidden="true" />
          <div>
            <div className="lab">Ready to claim</div>
            <div className="meta">
              {(status?.crudeAmount ?? 0).toLocaleString()} $CRUDE
            </div>
          </div>
        </div>
      )}

      <div className="action">
        {isCompleted ? (
          <button
            type="button"
            className="sof-btn sof-btn-primary"
            onClick={onClaim}
            disabled={busy || loading}
          >
            {busy ? "Claiming…" : "Claim $CRUDE →"}
          </button>
        ) : isRefining ? (
          <button type="button" className="sof-btn sof-btn-secondary" disabled>
            Refining in progress
          </button>
        ) : (
          <button
            type="button"
            className="sof-btn sof-btn-primary"
            onClick={onStart}
            disabled={busy || loading || oilUnits === 0}
          >
            {busy
              ? "Starting…"
              : oilUnits === 0
                ? "No activity to refine"
                : "Start refining →"}
          </button>
        )}
      </div>
    </div>
  );
}
