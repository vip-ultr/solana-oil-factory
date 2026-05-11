"use client";

/**
 * Refineries directory.
 *
 * For v1 this uses plain useMemo + array filter — fast and ergonomic
 * for the 12-row mock dataset. When the live indexer ships and the
 * dataset can grow into the thousands, swap the array logic for
 * @tanstack/react-table (already a dep) and add server-side
 * pagination via the indexer endpoint.
 */
import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Download, Plus, ChevronDown, ArrowDown } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  ButtonLink,
  ReputationChip,
  StatusPill,
  TokenMark,
  VerifiedBadge,
  WalletPill,
} from "@/components/sof/primitives";
import {
  formatTokens,
  formatUsd,
  formatRelativeTime,
} from "@/lib/mock-data";
import type { Refinery, RefineryStatus } from "@/lib/mock-data";

type StatusFilter = "all" | RefineryStatus;
type SortKey = "poolUsd" | "newest" | "highestRate" | "mostClaimers" | "closingSoonest" | "highestRep";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "poolUsd", label: "Pool size (USD)" },
  { value: "newest", label: "Newest" },
  { value: "highestRate", label: "Highest claim rate" },
  { value: "mostClaimers", label: "Most claimers" },
  { value: "closingSoonest", label: "Closing soonest" },
  { value: "highestRep", label: "Highest avg reputation" },
];

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "closingSoon", label: "Closing" },
  { value: "closed", label: "Closed" },
  { value: "operatorPaused", label: "Paused" },
];

interface RefineryDirectoryProps {
  refineries: Refinery[];
}

export function RefineryDirectory({ refineries }: RefineryDirectoryProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minRep, setMinRep] = useState(0);
  const [sort, setSort] = useState<SortKey>("poolUsd");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = {
      all: refineries.length,
      active: 0,
      closingSoon: 0,
      closed: 0,
      operatorPaused: 0,
      pendingSnapshot: 0,
    };
    for (const r of refineries) {
      c[r.status as StatusFilter] = (c[r.status as StatusFilter] ?? 0) + 1;
    }
    return c;
  }, [refineries]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = refineries.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (verifiedOnly && r.verification === "unverified") return false;
      if (r.operatorReputation < minRep) return false;
      if (q) {
        const hay = [r.tokenSymbol, r.tokenName, r.tokenMint, r.operator]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    rows = [...rows].sort((a, b) => {
      switch (sort) {
        case "poolUsd":
          return b.poolRemainingUsd - a.poolRemainingUsd;
        case "newest":
          return b.launchedAtIso.localeCompare(a.launchedAtIso);
        case "highestRate":
          return b.claimRatePer1Pct - a.claimRatePer1Pct;
        case "mostClaimers":
          return b.holdersClaimed - a.holdersClaimed;
        case "closingSoonest":
          return (
            (a.claimWindowDaysLeft ?? Number.POSITIVE_INFINITY) -
            (b.claimWindowDaysLeft ?? Number.POSITIVE_INFINITY)
          );
        case "highestRep":
          return b.operatorReputation - a.operatorReputation;
      }
    });
    return rows;
  }, [refineries, search, statusFilter, verifiedOnly, minRep, sort]);

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Pool size";

  return (
    <>
      <header className="sof-dir-head">
        <div>
          <h1>Refineries</h1>
          <div className="sub">
            <b>{counts.active}</b> active
            <span className="sep">·</span>
            <b>{counts.closingSoon}</b> closing soon
            <span className="sep">·</span>
            <b>{counts.closed}</b> closed
            <span className="sep">·</span>
            indexed{" "}
            <span className="font-mono" style={{ color: "var(--text-secondary)" }}>
              2 sec ago
            </span>
          </div>
        </div>
        <div className="actions">
          <button
            type="button"
            className="sof-btn sof-btn-secondary"
            disabled={filtered.length === 0}
            onClick={() => exportRefineriesCsv(filtered)}
          >
            <Download size={14} strokeWidth={1.6} aria-hidden="true" />
            Export CSV
          </button>
          <ButtonLink href="/refinery/launch" variant="primary">
            <Plus size={14} strokeWidth={2} aria-hidden="true" />
            Launch refinery
          </ButtonLink>
        </div>
      </header>

      <div className="sof-filter-bar">
        <div className="sof-search">
          <Search aria-hidden="true" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by mint, symbol, or operator wallet…"
            aria-label="Search refineries"
          />
          <span className="kbd">⌘K</span>
        </div>

        <div className="sof-seg" role="tablist" aria-label="Status filter">
          {STATUS_TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={statusFilter === t.value}
              className={cn(statusFilter === t.value && "on")}
              onClick={() => setStatusFilter(t.value)}
            >
              {t.label}{" "}
              <span className="ct">{counts[t.value] ?? 0}</span>
            </button>
          ))}
        </div>

        <label className="sof-toggle">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
          />
          <span className="sw" aria-hidden="true" />
          <span>Verified only</span>
        </label>

        <div className="sof-slider-wrap">
          <span>Min rep</span>
          <input
            type="range"
            min={0}
            max={100}
            value={minRep}
            onChange={(e) => setMinRep(Number(e.target.value))}
            aria-label="Minimum operator reputation"
          />
          <span className="val font-mono">{minRep}</span>
        </div>

        <div style={{ position: "relative" }}>
          <button
            type="button"
            className="sof-sort-btn"
            onClick={() => setSortMenuOpen((o) => !o)}
            aria-expanded={sortMenuOpen}
            aria-haspopup="listbox"
          >
            <span className="lab">Sort:</span>
            <span>{sortLabel}</span>
            <ChevronDown size={12} strokeWidth={2} aria-hidden="true" />
          </button>
          {sortMenuOpen && (
            <ul
              role="listbox"
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: 6,
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-strong)",
                borderRadius: 6,
                listStyle: "none",
                padding: 4,
                margin: 0,
                minWidth: 200,
                boxShadow: "0 8px 24px rgba(0,0,0,.3)",
                zIndex: 40,
              }}
            >
              {SORT_OPTIONS.map((o) => (
                <li key={o.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={sort === o.value}
                    onClick={() => {
                      setSort(o.value);
                      setSortMenuOpen(false);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 10px",
                      borderRadius: 4,
                      fontSize: 12.5,
                      color:
                        sort === o.value
                          ? "var(--accent)"
                          : "var(--text-primary)",
                      background:
                        sort === o.value
                          ? "var(--accent-bg)"
                          : "transparent",
                    }}
                  >
                    {o.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <section className="sof-table-wrap">
        <div className="sof-meta-row">
          <span className="sel">
            Showing {filtered.length} of {refineries.length} refineries
          </span>
          <span>
            Live from <span className="font-mono">devnet</span>
          </span>
        </div>

        <table className="sof-refineries">
          <thead>
            <tr>
              <th style={{ width: 220 }}>Token</th>
              <th style={{ width: 200 }}>Operator</th>
              <th
                className={cn("sortable num")}
                style={{ width: 160 }}
                onClick={() => setSort("poolUsd")}
              >
                Pool remaining{" "}
                {sort === "poolUsd" && (
                  <ArrowDown
                    size={11}
                    strokeWidth={2.4}
                    className="arr inline-block"
                    style={{ verticalAlign: "middle" }}
                    aria-hidden="true"
                  />
                )}
              </th>
              <th className="num" style={{ width: 140 }}>
                Rate / 1%
              </th>
              <th style={{ width: 140 }}>Snapshot</th>
              <th style={{ width: 130 }}>Window</th>
              <th style={{ width: 170 }}>Risk</th>
              <th style={{ width: 90 }}>Status</th>
              <th className="num" style={{ width: 120 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <Row key={r.id} r={r} />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: 32, textAlign: "center" }}>
                  <div>
                    <div
                      className="font-display"
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        marginBottom: 6,
                      }}
                    >
                      No refineries match these filters.
                    </div>
                    <div className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
                      {refineries.length} refineries are indexed. Try
                      clearing some filters.
                    </div>
                    <button
                      type="button"
                      className="sof-btn-mini ghost"
                      onClick={() => {
                        setSearch("");
                        setStatusFilter("all");
                        setVerifiedOnly(false);
                        setMinRep(0);
                      }}
                    >
                      Clear filters →
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div
          className="sof-pagination"
          style={{ justifyContent: "flex-start" }}
        >
          <span style={{ color: "var(--text-tertiary)", fontSize: 12 }}>
            Showing {filtered.length.toLocaleString()} of{" "}
            {refineries.length.toLocaleString()} refineries
            {filtered.length !== refineries.length && " (filtered)"}
          </span>
        </div>
      </section>
    </>
  );
}

function exportRefineriesCsv(rows: Refinery[]): void {
  if (typeof window === "undefined" || rows.length === 0) return;
  const header = [
    "rank",
    "token_symbol",
    "token_name",
    "token_mint",
    "operator",
    "pool_remaining",
    "pool_initial",
    "pool_remaining_usd",
    "holders_eligible",
    "holders_claimed",
    "claim_rate_per_1pct",
    "snapshot_strategy",
    "status",
    "verification",
    "claim_window_days_left",
    "launched_at_iso",
  ].join(",");
  const escape = (v: string | number | null) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const lines = rows.map((r) =>
    [
      r.rank,
      r.tokenSymbol,
      r.tokenName,
      r.tokenMintFull ?? r.tokenMint,
      r.operatorFull ?? r.operator,
      r.poolRemaining,
      r.poolInitial,
      r.poolRemainingUsd,
      r.holdersEligible,
      r.holdersClaimed,
      r.claimRatePer1Pct,
      r.snapshotStrategy,
      r.status,
      r.verification,
      r.claimWindowDaysLeft,
      r.launchedAtIso,
    ]
      .map(escape)
      .join(","),
  );
  const csv = [header, ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  const a = document.createElement("a");
  a.href = url;
  a.download = `sof-refineries-${ts}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function Row({ r }: { r: Refinery }) {
  const poolPct = r.poolInitial > 0 ? Math.round((r.poolRemaining / r.poolInitial) * 100) : 0;
  const poolBarTone = poolPct < 20 ? "danger" : poolPct < 35 ? "warn" : "";
  const isClosed = r.status === "closed";
  const windowKind: "open" | "urgent" | "closed" | "normal" =
    r.claimWindowDaysLeft === null
      ? "open"
      : r.claimWindowDaysLeft === 0
        ? "closed"
        : r.claimWindowDaysLeft <= 1
          ? "urgent"
          : "normal";
  const windowText =
    windowKind === "open"
      ? "Open-ended"
      : windowKind === "closed"
        ? "Closed"
        : `${r.claimWindowDaysLeft}d left`;

  return (
    <tr>
      <td>
        <div className="sof-tk">
          <TokenMark
            variant={r.tokenMarkVariant}
            symbol={r.tokenSymbol}
            logoUrl={r.logoUrl}
          />
          <div className="meta">
            <span className="sym">{r.tokenSymbol}</span>
            <span className="nm">{r.tokenName}</span>
            <span className="mint">{r.tokenMint}</span>
          </div>
        </div>
      </td>
      <td>
        <div className="sof-op-cell">
          <div className="sof-op-row">
            <WalletPill address={r.operator} />
            <ReputationChip score={r.operatorReputation} />
          </div>
          <VerifiedBadge tier={r.verification} />
        </div>
      </td>
      <td>
        <div className="sof-pool-cell">
          {r.poolInitial > 0 ? (
            <>
              <div className="sof-pool-vals">
                <span className="a">{formatTokens(r.poolRemaining)}</span>
                {r.poolRemainingUsd > 0 && (
                  <span className="b">{formatUsd(r.poolRemainingUsd)}</span>
                )}
              </div>
              <div className={cn("sof-pool-bar-thin", poolBarTone)}>
                <div className="fill" style={{ transform: `scaleX(${poolPct / 100})` }} />
              </div>
              <span className="sof-pct">{poolPct}% of initial</span>
            </>
          ) : (
            <span className="a" style={{ color: "var(--text-tertiary)" }}>—</span>
          )}
        </div>
      </td>
      <td className="num">
        <div className="sof-rate-cell">
          {r.claimRatePer1Pct > 0 ? (
            <>
              <span className="a">{formatTokens(r.claimRatePer1Pct)}</span>
              {r.poolUsd > 0 && (
                <span className="b">{formatUsd(r.poolUsd / 100)}</span>
              )}
            </>
          ) : (
            <span className="a" style={{ color: "var(--text-tertiary)" }}>—</span>
          )}
        </div>
      </td>
      <td>
        <div className="sof-snap-cell">
          <span className="a">
            {r.snapshotAgeSeconds > 0
              ? formatRelativeTime(r.snapshotAgeSeconds)
              : "No snapshot yet"}
          </span>
          <span className="b">
            {r.holdersEligible > 0
              ? `${r.holdersEligible.toLocaleString()} holders`
              : "—"}
          </span>
        </div>
      </td>
      <td>
        <div className={cn("sof-win-cell", windowKind === "urgent" && "urgent")}>
          <span>{windowText}</span>
          {windowKind === "normal" && <span className="b">closes</span>}
        </div>
      </td>
      <td>
        <div className="sof-risk-cell">
          {r.riskFlags.length === 0 ? (
            <span className="sof-risk ok">Clean</span>
          ) : (
            r.riskFlags.map((flag) => (
              <span
                key={flag}
                className={cn(
                  "sof-risk",
                  (flag === "transferFee" || flag === "lowLiquidity") && "warn",
                  flag === "freezeAuthority" && "danger",
                )}
              >
                {flag === "mintable"
                  ? "Mint authority"
                  : flag === "freezeAuthority"
                    ? "Freeze auth"
                    : flag === "concentrated"
                      ? "Concentrated"
                      : flag === "lowLiquidity"
                        ? "Low liquidity"
                        : flag === "transferFee"
                          ? `Transfer fee ${(r.transferFeeBps ?? 0) / 100}%`
                          : flag}
              </span>
            ))
          )}
          {r.hasTransferFee && r.transferFeeBps && r.transferFeeBps > 0 && !r.riskFlags.includes("transferFee") && (
            <span className="sof-risk warn">Transfer fee {r.transferFeeBps / 100}%</span>
          )}
        </div>
      </td>
      <td>
        <StatusPill status={r.status} />
      </td>
      <td>
        <div className="sof-row-actions">
          <Link href={`/refinery/${r.id}`} className="sof-btn-mini ghost">
            View
          </Link>
          {!isClosed && (
            <Link href={`/refinery/${r.id}?action=claim`} className="sof-btn-mini primary">
              Claim
            </Link>
          )}
        </div>
      </td>
    </tr>
  );
}
