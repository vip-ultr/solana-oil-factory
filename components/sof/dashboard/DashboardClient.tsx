"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useWalletConnection } from "@solana/react-hooks";
import { Plus, Wallet, ExternalLink } from "lucide-react";
import {
  ButtonLink,
  ReputationChip,
  StatusPill,
  TokenMark,
  WalletPill,
} from "@/components/sof/primitives";
import { useSiws } from "@/components/sof/SiwsProvider";
import { openConnectModal } from "@/components/sof/modals/ChromeOverlay";
import type {
  Refinery,
  RefineryStatus,
  TokenMarkVariant,
} from "@/lib/mock-data";
import { formatTokens } from "@/lib/mock-data";
import { explorerUrl } from "@/lib/program";

interface ActivityEvent {
  id: string;
  kind: string;
  wallet: string;
  amount?: number;
  tokenSymbol?: string;
  detail?: string;
  agoSeconds: number;
}

interface ReputationView {
  score: number;
  tier: string;
  signals: { code: string; label: string; value: number; max: number }[];
}

const TIER_LABEL: Record<string, string> = {
  excellent: "Excellent",
  good: "Good",
  neutral: "Neutral",
  risky: "Caution",
  flagged: "Risk",
};

function relativeTime(seconds: number): string {
  if (seconds < 60) return `${Math.max(1, Math.floor(seconds))}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function DashboardClient() {
  const { wallet, connected } = useWalletConnection();
  const { authed, signIn, signing } = useSiws();
  const address = wallet?.account?.address?.toString() ?? null;

  const [refineries, setRefineries] = useState<Refinery[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [claims, setClaims] = useState<ActivityEvent[]>([]);
  const [rep, setRep] = useState<ReputationView | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch everything for the connected wallet once authed.
  useEffect(() => {
    if (!address || !authed) {
      setRefineries([]);
      setActivity([]);
      setClaims([]);
      setRep(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetch("/api/refineries").then((r) => r.json()),
      fetch(`/api/indexer/events?wallet=${address}&shape=activity&limit=20`).then(
        (r) => r.json(),
      ),
      fetch(
        `/api/indexer/events?wallet=${address}&eventName=ClaimMade&shape=activity&limit=10`,
      ).then((r) => r.json()),
      fetch(`/api/reputation?wallet=${address}`).then((r) => r.json()),
    ])
      .then(([refRes, actRes, claimRes, repRes]) => {
        if (cancelled) return;
        setRefineries(Array.isArray(refRes.refineries) ? refRes.refineries : []);
        setActivity(Array.isArray(actRes.events) ? actRes.events : []);
        setClaims(Array.isArray(claimRes.events) ? claimRes.events : []);
        if (repRes && typeof repRes.score === "number") setRep(repRes);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [address, authed]);

  // Disconnected state.
  if (!connected) {
    return (
      <div className="sof-dh-empty">
        <Wallet aria-hidden="true" />
        <h1>Connect your wallet to see your dashboard</h1>
        <p>
          We&apos;ll surface every refinery you operate, every claim you&apos;ve
          made, and your live reputation — all read straight from devnet.
        </p>
        <button
          type="button"
          className="sof-btn sof-btn-primary"
          onClick={openConnectModal}
        >
          <Wallet size={14} strokeWidth={2} aria-hidden="true" />
          Connect wallet
        </button>
      </div>
    );
  }

  // Connected but not signed-in.
  if (!authed) {
    return (
      <div className="sof-dh-empty">
        <Wallet aria-hidden="true" />
        <h1>Sign to view your dashboard</h1>
        <p>
          One free signature confirms you control the wallet. No funds move; no
          transaction is broadcast.
        </p>
        <button
          type="button"
          className="sof-btn sof-btn-primary"
          onClick={() => void signIn()}
          disabled={signing}
        >
          {signing ? "Signing…" : "Sign to verify"}
        </button>
      </div>
    );
  }

  const operatedRefineries = refineries.filter(
    (r) => r.operatorFull === address,
  );
  const totalDistributed = operatedRefineries.reduce(
    (acc, r) => acc + (r.poolInitial - r.poolRemaining),
    0,
  );
  const totalHoldersServed = operatedRefineries.reduce(
    (acc, r) => acc + r.holdersClaimed,
    0,
  );
  const activeOperated = operatedRefineries.filter(
    (r) => r.status === "active" || r.status === "closingSoon",
  ).length;

  return (
    <>
      <header className="sof-dh-hdr">
        <div>
          <h1>Dashboard</h1>
          <div className="who">
            <WalletPill address={address!} />
            {rep && <ReputationChip score={rep.score} prefix="" />}
            <span className="font-mono" style={{ color: "var(--text-tertiary)" }}>
              ·{" "}
              {operatedRefineries.length > 0 && claims.length > 0
                ? "Operator + holder"
                : operatedRefineries.length > 0
                  ? "Operator"
                  : claims.length > 0
                    ? "Holder"
                    : "Connected"}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <ButtonLink href="/refinery/launch" variant="primary">
            <Plus size={14} strokeWidth={2} aria-hidden="true" />
            Launch refinery
          </ButtonLink>
        </div>
      </header>

      <div className="sof-dh-body">
        {/* KPI strip */}
        <div className="sof-dh-kpi-grid">
          <div className="sof-dh-kpi">
            <div className="k">Active refineries</div>
            <div className="v">{activeOperated}</div>
            <div className="delta">
              {operatedRefineries.length} operated total
            </div>
          </div>
          <div className="sof-dh-kpi">
            <div className="k">Distributed (base units)</div>
            <div className="v">{formatTokens(totalDistributed)}</div>
            <div className="delta">across operated refineries</div>
          </div>
          <div className="sof-dh-kpi">
            <div className="k">Holders served</div>
            <div className="v">{totalHoldersServed.toLocaleString()}</div>
            <div className="delta">
              {operatedRefineries.length === 0
                ? "operate a refinery to grow"
                : `${activeOperated} live`}
            </div>
          </div>
          <div className="sof-dh-kpi">
            <div className="k">Reputation</div>
            <div className="v">
              {rep ? (
                <>
                  {rep.score}
                  <small>{TIER_LABEL[rep.tier] ?? rep.tier}</small>
                </>
              ) : (
                <span style={{ color: "var(--text-tertiary)" }}>—</span>
              )}
            </div>
            <div className="delta">v1 · 6 signals</div>
          </div>
        </div>

        {/* My refineries (operator) */}
        <div className="sof-dh-panel">
          <div className="sof-dh-panel-h">
            <h3>My refineries</h3>
            <span className="meta">
              {operatedRefineries.length === 0
                ? "none yet"
                : `${operatedRefineries.length} operated`}
            </span>
          </div>
          {operatedRefineries.length === 0 ? (
            <div
              style={{
                padding: "32px 20px",
                color: "var(--text-tertiary)",
                fontSize: 13,
                textAlign: "center",
              }}
            >
              You haven&apos;t launched a refinery on this cluster.{" "}
              <Link href="/refinery/launch" style={{ color: "var(--accent)" }}>
                Launch one →
              </Link>
            </div>
          ) : (
            <table className="sof-dh-op-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Status</th>
                  <th className="num">Pool remaining</th>
                  <th className="num">Holders claimed</th>
                  <th>Window</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {operatedRefineries.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Link
                        href={`/refinery/${r.id}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          color: "inherit",
                          textDecoration: "none",
                        }}
                      >
                        <TokenMark
                          variant={r.tokenMarkVariant}
                          symbol={r.tokenSymbol}
                          logoUrl={r.logoUrl}
                        />
                        <div>
                          <div
                            className="font-display"
                            style={{ fontWeight: 600 }}
                          >
                            {r.tokenName}
                          </div>
                          <div
                            className="font-mono"
                            style={{ fontSize: 11, color: "var(--text-tertiary)" }}
                          >
                            {r.tokenSymbol}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td>
                      <StatusPill status={r.status} />
                    </td>
                    <td className="num">
                      {formatTokens(r.poolRemaining)}
                      <div
                        style={{
                          color: "var(--text-tertiary)",
                          fontSize: 11,
                          marginTop: 2,
                        }}
                      >
                        / {formatTokens(r.poolInitial)}
                      </div>
                    </td>
                    <td className="num">{r.holdersClaimed.toLocaleString()}</td>
                    <td>
                      <span className="font-mono" style={{ fontSize: 12 }}>
                        {r.claimWindowDaysLeft === null
                          ? "open-ended"
                          : `${r.claimWindowDaysLeft}d`}
                      </span>
                    </td>
                    <td>
                      <Link
                        href={`/refinery/${r.id}`}
                        className="sof-rd-ext"
                        style={{ fontSize: 12 }}
                      >
                        Manage <ExternalLink size={11} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Activity */}
        <div className="sof-dh-panel">
          <div className="sof-dh-panel-h">
            <h3>Activity</h3>
            <span className="meta">{activity.length} events indexed</span>
          </div>
          {activity.length === 0 ? (
            <div
              style={{
                padding: "32px 20px",
                color: "var(--text-tertiary)",
                fontSize: 13,
                textAlign: "center",
              }}
            >
              No on-chain activity from this wallet yet. Launching a refinery
              or claiming will show up here.
            </div>
          ) : (
            <div className="sof-dh-feed">
              {activity.map((row) => {
                const ic =
                  row.kind === "claim"
                    ? "green"
                    : row.kind === "topUp"
                      ? "blue"
                      : row.kind === "launched"
                        ? "blue"
                        : row.kind === "pause"
                          ? "amber"
                          : "green";
                return (
                  <div key={row.id} className="sof-dh-feed-item">
                    <div className={`ic ${ic}`}>
                      {ic === "green" ? "↑" : ic === "blue" ? "⇄" : "⚠"}
                    </div>
                    <div className="body">
                      <b>{row.kind}</b>
                      {row.tokenSymbol ? ` · ${row.tokenSymbol}` : ""}
                      {row.detail ? ` · ${row.detail}` : ""}
                      <span className="when">{relativeTime(row.agoSeconds)}</span>
                    </div>
                    <span className="amt">
                      {row.amount !== undefined ? formatTokens(row.amount) : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent claims */}
        <div className="sof-dh-panel">
          <div className="sof-dh-panel-h">
            <h3>Recent claims</h3>
            <span className="meta">
              {claims.length === 0
                ? "no claims yet"
                : `${claims.length} indexed`}
            </span>
          </div>
          {claims.length === 0 ? (
            <div
              style={{
                padding: "32px 20px",
                color: "var(--text-tertiary)",
                fontSize: 13,
                textAlign: "center",
              }}
            >
              When you claim from a refinery, the receipt will appear here.{" "}
              <Link href="/refineries" style={{ color: "var(--accent)" }}>
                Browse open refineries →
              </Link>
            </div>
          ) : (
            <div>
              {claims.map((c) => (
                <div key={c.id} className="sof-dh-cc-row">
                  <TokenMark
                    variant={(c.tokenSymbol as TokenMarkVariant) ?? "default"}
                    symbol={c.tokenSymbol ?? "?"}
                    size={32}
                  />
                  <div>
                    <span className="nm">{c.tokenSymbol ?? "—"}</span>
                  </div>
                  <div>
                    <span className="amt">
                      {c.amount !== undefined ? formatTokens(c.amount) : "—"}
                    </span>
                  </div>
                  <div className="when">{relativeTime(c.agoSeconds)}</div>
                  <a
                    className="lnk"
                    href={explorerUrl(c.id.split("-")[0], "tx")}
                    target="_blank"
                    rel="noreferrer"
                  >
                    tx ↗
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {loading && (
          <div
            style={{
              padding: "10px 14px",
              fontSize: 12,
              color: "var(--text-tertiary)",
              textAlign: "center",
            }}
          >
            Refreshing live data…
          </div>
        )}
      </div>
    </>
  );
}
