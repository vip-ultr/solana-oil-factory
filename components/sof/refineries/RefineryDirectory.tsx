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
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Search, Plus, ChevronDown, ArrowDown } from "lucide-react";
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

function formatAge(launchedAtIso: string): string {
  const ms = Date.now() - new Date(launchedAtIso).getTime();
  if (Number.isNaN(ms)) return "—";
  if (ms < 0) return "—";
  const seconds = ms / 1000;
  if (seconds < 60) return seconds < 5 ? "now" : `${Math.floor(seconds)}s`;
  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.floor(minutes)}m`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.floor(hours)}h`;
  const days = hours / 24;
  if (days < 30) return `${Math.floor(days)}d`;
  const months = days / 30;
  if (months < 12) return `${Math.floor(months)}mo`;
  const years = days / 365;
  return `${Math.floor(years)}y`;
}

/** Adaptive USD price formatter — shows micro-prices with extra
 *  precision so sub-cent values don't all collapse to "$0.00". */
function formatPriceUsd(price: number): string {
  if (price === 0) return "$0";
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(6)}`;
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
        </div>
        <div className="actions">
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
        <div className="sof-table-scroll">
        <table className="sof-refineries">
          <thead>
            <tr>
              <th className="sof-col-token" style={{ width: 300 }}>Token</th>
              <th className="num" style={{ width: 100 }}>MCAP</th>
              <th className="num" style={{ width: 110 }}>Price</th>
              <th style={{ width: 80 }}>Age</th>
              <th style={{ width: 80 }}>Rep</th>
              <th
                className={cn("sortable num")}
                style={{ width: 120 }}
                onClick={() => setSort("poolUsd")}
              >
                Pool{" "}
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
              <th className="num" style={{ width: 90 }}>Filled</th>
              <th className="num" style={{ width: 100 }}>Rate / 1%</th>
              <th style={{ width: 150 }}>Last snapshot</th>
              <th className="num" style={{ width: 80 }}>Holders</th>
              <th style={{ width: 150 }}>Risk</th>
              <th style={{ width: 130 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <Row key={r.id} r={r} />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={11} style={{ padding: 32, textAlign: "center" }}>
                  <EmptyState
                    refineries={refineries}
                    onClear={() => {
                      setSearch("");
                      setStatusFilter("all");
                      setVerifiedOnly(false);
                      setMinRep(0);
                    }}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>

        {/* Mobile card list — desktop table is hidden at <768px. */}
        <div className="sof-refineries-mobile" aria-hidden="false">
          {filtered.length === 0 ? (
            <EmptyState
              refineries={refineries}
              onClear={() => {
                setSearch("");
                setStatusFilter("all");
                setVerifiedOnly(false);
                setMinRep(0);
              }}
            />
          ) : (
            filtered.map((r) => <MobileCard key={r.id} r={r} />)
          )}
        </div>

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

function Row({ r }: { r: Refinery }) {
  const router = useRouter();
  const href = `/refinery/${r.id}`;
  const poolPct = r.poolInitial > 0 ? Math.round((r.poolRemaining / r.poolInitial) * 100) : 0;
  const poolBarTone = poolPct < 20 ? "danger" : poolPct < 35 ? "warn" : "";
  const priceUsd =
    r.poolInitial > 0 && r.poolUsd > 0 ? r.poolUsd / r.poolInitial : 0;
  const ageStr = formatAge(r.launchedAtIso);

  return (
    <tr
      className="sof-refinery-row"
      role="link"
      tabIndex={0}
      onClick={() => router.push(href)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(href);
        }
      }}
      aria-label={`Open ${r.tokenName} refinery`}
    >
      <td className="sof-col-token">
        <div className="sof-tk">
          <span className="rank">#{r.rank}</span>
          <TokenMark
            variant={r.tokenMarkVariant}
            symbol={r.tokenSymbol}
            logoUrl={r.logoUrl}
          />
          <div className="meta">
            <span className="sym">{r.tokenSymbol}</span>
            <span className="sol">/SOL</span>
            <span className="nm">{r.tokenName}</span>
          </div>
        </div>
      </td>
      <td className="num">
        {r.marketCapUsd && r.marketCapUsd > 0 ? (
          <span className="sof-mcap">{formatUsd(r.marketCapUsd)}</span>
        ) : (
          <span style={{ color: "var(--text-tertiary)" }}>—</span>
        )}
      </td>
      <td className="num">
        {priceUsd > 0 ? (
          <span className="sof-price">{formatPriceUsd(priceUsd)}</span>
        ) : (
          <span style={{ color: "var(--text-tertiary)" }}>—</span>
        )}
      </td>
      <td>
        <span className="sof-age">{ageStr}</span>
      </td>
      <td>
        <ReputationChip score={r.operatorReputation} />
      </td>
      <td className="num">
        {r.poolInitial > 0 ? (
          <span className="sof-pool-amt">{formatTokens(r.poolRemaining)}</span>
        ) : (
          <span style={{ color: "var(--text-tertiary)" }}>—</span>
        )}
      </td>
      <td className="num">
        {r.poolInitial > 0 ? (
          <div className="sof-fill-cell">
            <span className="pct">{poolPct}%</span>
            <div className={cn("sof-pool-bar-thin", poolBarTone)}>
              <div className="fill" style={{ transform: `scaleX(${poolPct / 100})` }} />
            </div>
          </div>
        ) : (
          <span style={{ color: "var(--text-tertiary)" }}>—</span>
        )}
      </td>
      <td className="num">
        {r.claimRatePer1Pct > 0 ? (
          formatTokens(r.claimRatePer1Pct)
        ) : (
          <span style={{ color: "var(--text-tertiary)" }}>—</span>
        )}
      </td>
      <td style={{ whiteSpace: "nowrap" }}>
        {r.snapshotAgeSeconds > 0 ? (
          formatRelativeTime(r.snapshotAgeSeconds)
        ) : (
          <span style={{ color: "var(--text-tertiary)" }}>No snapshot yet</span>
        )}
      </td>
      <td className="num">
        {r.holdersEligible > 0 ? (
          r.holdersEligible.toLocaleString()
        ) : (
          <span style={{ color: "var(--text-tertiary)" }}>—</span>
        )}
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
      <td style={{ whiteSpace: "nowrap" }}>
        <StatusPill status={r.status} />
      </td>
    </tr>
  );
}

/**
 * Mobile-friendly card representation of one Refinery row. The
 * desktop table is hidden under 768px and this stacked card layout
 * takes its place — same data, but each metric gets its own line so
 * nothing has to fight for horizontal space at 375px.
 */
function MobileCard({ r }: { r: Refinery }) {
  const poolPct =
    r.poolInitial > 0
      ? Math.round((r.poolRemaining / r.poolInitial) * 100)
      : 0;
  const isClosed = r.status === "closed";
  const windowText =
    r.claimWindowDaysLeft === null
      ? "Open-ended"
      : r.claimWindowDaysLeft === 0
        ? "Closed"
        : `${r.claimWindowDaysLeft}d left`;
  const isUrgent =
    r.claimWindowDaysLeft !== null && r.claimWindowDaysLeft <= 1;

  return (
    <article className="sof-rm-card">
      <header className="sof-rm-head">
        <div className="sof-rm-tk">
          <TokenMark
            variant={r.tokenMarkVariant}
            symbol={r.tokenSymbol}
            logoUrl={r.logoUrl}
            size={40}
          />
          <div className="meta">
            <span className="sym">{r.tokenSymbol}</span>
            <span className="nm">{r.tokenName}</span>
            <span className="mint">{r.tokenMint}</span>
          </div>
        </div>
        <StatusPill status={r.status} />
      </header>

      <div className="sof-rm-op">
        <WalletPill address={r.operator} />
        <ReputationChip score={r.operatorReputation} />
        <VerifiedBadge tier={r.verification} />
      </div>

      <dl className="sof-rm-kv">
        <div>
          <dt>Pool</dt>
          <dd>
            {r.poolInitial > 0 ? (
              <>
                <span className="a">{formatTokens(r.poolRemaining)}</span>
                {r.poolRemainingUsd > 0 && (
                  <span className="b">{formatUsd(r.poolRemainingUsd)}</span>
                )}
                <span className="b">{poolPct}% of initial</span>
              </>
            ) : (
              <span className="muted">—</span>
            )}
          </dd>
        </div>
        <div>
          <dt>Rate / 1%</dt>
          <dd>
            {r.claimRatePer1Pct > 0 ? (
              <span className="a">{formatTokens(r.claimRatePer1Pct)}</span>
            ) : (
              <span className="muted">—</span>
            )}
          </dd>
        </div>
        <div>
          <dt>Snapshot</dt>
          <dd>
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
          </dd>
        </div>
        <div>
          <dt>Window</dt>
          <dd className={isUrgent ? "urgent" : undefined}>
            <span className="a">{windowText}</span>
          </dd>
        </div>
      </dl>

      <footer className="sof-rm-foot">
        <Link href={`/refinery/${r.id}`} className="sof-btn-mini ghost">
          View
        </Link>
        {!isClosed && (
          <Link
            href={`/refinery/${r.id}?action=claim`}
            className="sof-btn-mini primary"
          >
            Claim
          </Link>
        )}
      </footer>
    </article>
  );
}

function EmptyState({
  refineries,
  onClear,
}: {
  refineries: Refinery[];
  onClear: () => void;
}) {
  return (
    <div>
      <div
        className="font-display"
        style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}
      >
        No refineries match these filters.
      </div>
      <div className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
        {refineries.length} refineries are indexed. Try clearing some
        filters.
      </div>
      <button
        type="button"
        className="sof-btn-mini ghost"
        onClick={onClear}
      >
        Clear filters →
      </button>
    </div>
  );
}
