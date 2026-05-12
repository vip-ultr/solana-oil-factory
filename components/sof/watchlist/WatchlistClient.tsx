"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as Tabs from "@radix-ui/react-tabs";
import { ArrowUpRight, Star, Trash2, X } from "lucide-react";
import {
  ButtonLink,
  ReputationChip,
  StatusPill,
  TokenMark,
  WalletPill,
} from "@/components/sof/primitives";
import { useWatchedList } from "@/lib/use-watched";
import { clearWatched, removeWatched } from "@/lib/watchlist";
import { formatTokens } from "@/lib/mock-data";
import type { Refinery, ReputationTier } from "@/lib/mock-data";

interface WalletSummary {
  address: string;
  repScore: number;
  repTier: ReputationTier;
  claimCount: number;
  refineryCount: number;
  isOperator: boolean;
}

interface Props {
  refineries: Refinery[];
}

function truncateAddress(addr: string): string {
  return addr.length > 12 ? `${addr.slice(0, 4)}…${addr.slice(-4)}` : addr;
}

export function WatchlistClient({ refineries }: Props) {
  const watchedRefIds = useWatchedList("refinery");
  const watchedWallets = useWatchedList("wallet");

  // Wallet summaries fetched from the indexer after mount.
  const [walletSummaries, setWalletSummaries] = useState<Map<string, WalletSummary>>(new Map());

  useEffect(() => {
    if (watchedWallets.length === 0) {
      setWalletSummaries(new Map());
      return;
    }
    fetch("/api/watchlist/wallets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addresses: watchedWallets }),
    })
      .then((r) => r.json())
      .then((data: WalletSummary[]) => {
        setWalletSummaries(new Map(data.map((s) => [s.address, s])));
      })
      .catch(() => {});
  }, [watchedWallets]);

  const refRowMap = new Map(refineries.map((r) => [r.id, r]));
  const watchedRefs = watchedRefIds
    .map((id) => refRowMap.get(id))
    .filter((r): r is Refinery => Boolean(r));
  const orphanedRefIds = watchedRefIds.filter((id) => !refRowMap.has(id));

  return (
    <>
      <header className="sof-wl-hdr">
        <div>
          <h1>Watchlist</h1>
          <p>
            Refineries and wallets you&apos;ve starred. Saved per-browser in
            <code> localStorage</code> — clearing site data clears the list.
            Doesn&apos;t sync between devices.
          </p>
        </div>
      </header>

      <Tabs.Root defaultValue="refineries" className="sof-wl-tabs">
        <Tabs.List className="sof-wl-tabs-list" aria-label="Watchlist kinds">
          <Tabs.Trigger value="refineries" className="sof-wl-tab">
            <Star size={13} strokeWidth={1.8} aria-hidden="true" />
            <span className="lab">Refineries</span>
            <span className="cnt">{watchedRefs.length + orphanedRefIds.length}</span>
          </Tabs.Trigger>
          <Tabs.Trigger value="wallets" className="sof-wl-tab">
            <Star size={13} strokeWidth={1.8} aria-hidden="true" />
            <span className="lab">Wallets</span>
            <span className="cnt">{watchedWallets.length}</span>
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="refineries" className="sof-wl-panel">
          {watchedRefs.length === 0 && orphanedRefIds.length === 0 ? (
            <EmptyState
              title="No refineries saved yet"
              desc="Hit the star button on any refinery to save it here. The list is per-browser — nothing is sent to a server."
              ctaHref="/refineries"
              ctaLabel="Browse refineries"
            />
          ) : (
            <div className="sof-wl-list">
              {watchedRefs.map((r) => (
                <RefineryRow key={r.id} r={r} />
              ))}
              {orphanedRefIds.map((id) => (
                <OrphanRow key={id} kind="refinery" id={id} />
              ))}
              {watchedRefs.length + orphanedRefIds.length > 1 && (
                <ClearAllButton kind="refinery" />
              )}
            </div>
          )}
        </Tabs.Content>

        <Tabs.Content value="wallets" className="sof-wl-panel">
          {watchedWallets.length === 0 ? (
            <EmptyState
              title="No wallets saved yet"
              desc="Star a wallet from its profile page to save it here. Useful for tracking operators and active claimers."
              ctaHref="/refineries"
              ctaLabel="Find operators to watch"
            />
          ) : (
            <div className="sof-wl-list">
              {watchedWallets.map((addr) => (
                <WalletRow
                  key={addr}
                  address={addr}
                  summary={walletSummaries.get(addr)}
                />
              ))}
              {watchedWallets.length > 1 && <ClearAllButton kind="wallet" />}
            </div>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </>
  );
}

function RefineryRow({ r }: { r: Refinery }) {
  const poolPct =
    r.poolInitial > 0 ? Math.round((r.poolRemaining / r.poolInitial) * 100) : 0;
  return (
    <article className="sof-wl-row">
      <Link href={`/refinery/${r.id}`} className="sof-wl-row-main">
        <TokenMark
          variant={r.tokenMarkVariant}
          symbol={r.tokenSymbol}
          size={36}
          logoUrl={r.logoUrl}
        />
        <div className="sof-wl-id">
          <div className="nm">{r.tokenName}</div>
          <div className="sub">
            <span className="sym">{r.tokenSymbol}</span>
            <span className="dot" aria-hidden="true">·</span>
            <span className="mint">{r.tokenMint}</span>
          </div>
        </div>
      </Link>

      <div className="sof-wl-stats">
        <div className="sof-wl-stat">
          <span className="k">Pool</span>
          <span className="v">
            {formatTokens(r.poolRemaining)} <small>{r.tokenSymbol}</small>
          </span>
        </div>
        <div className="sof-wl-stat">
          <span className="k">Filled</span>
          <span className="v">{100 - poolPct}%</span>
        </div>
        <div className="sof-wl-stat">
          <span className="k">Holders</span>
          <span className="v">{r.holdersClaimed.toLocaleString()}</span>
        </div>
      </div>

      <div className="sof-wl-row-actions">
        <StatusPill status={r.status} />
        <Link
          href={`/refinery/${r.id}`}
          className="sof-wl-open"
          aria-label={`Open ${r.tokenName} refinery`}
        >
          Open <ArrowUpRight size={12} strokeWidth={2} aria-hidden="true" />
        </Link>
        <RemoveButton kind="refinery" id={r.id} label={r.tokenName} />
      </div>
    </article>
  );
}

function WalletRow({
  address,
  summary,
}: {
  address: string;
  summary?: WalletSummary;
}) {
  const loaded = summary !== undefined;
  return (
    <article className="sof-wl-row sof-wl-row-wallet">
      <Link href={`/wallet/${address}`} className="sof-wl-row-main">
        <WalletPill address={truncateAddress(address)} fullAddress={address} />
      </Link>

      <div className="sof-wl-stats">
        <div className="sof-wl-stat">
          <span className="k">Rep</span>
          <span className="v">
            {loaded ? (
              <ReputationChip score={summary.repScore} tier={summary.repTier} prefix="" />
            ) : (
              <span className="sof-wl-stat-loading" />
            )}
          </span>
        </div>
        <div className="sof-wl-stat">
          <span className="k">Claims</span>
          <span className="v">
            {loaded ? summary.claimCount.toLocaleString() : <span className="sof-wl-stat-loading" />}
          </span>
        </div>
        <div className="sof-wl-stat">
          <span className="k">Refineries</span>
          <span className="v">
            {loaded
              ? summary.refineryCount
              : <span className="sof-wl-stat-loading" />}
          </span>
        </div>
        {loaded && summary.isOperator && (
          <div className="sof-wl-stat">
            <span className="k">Role</span>
            <span className="v sof-wl-role-op">Operator</span>
          </div>
        )}
      </div>

      <div className="sof-wl-row-actions">
        <ButtonLink href={`/wallet/${address}`} variant="miniGhost">
          Profile
          <ArrowUpRight size={12} strokeWidth={2} aria-hidden="true" />
        </ButtonLink>
        <RemoveButton kind="wallet" id={address} label={truncateAddress(address)} />
      </div>
    </article>
  );
}

function OrphanRow({
  kind,
  id,
}: {
  kind: "refinery" | "wallet";
  id: string;
}) {
  return (
    <article className="sof-wl-row sof-wl-row-orphan">
      <div className="sof-wl-row-main">
        <div className="sof-wl-id">
          <div className="nm">{truncateAddress(id)}</div>
          <div className="sub">
            <span className="dim">
              {kind === "refinery"
                ? "Refinery not found in current cluster data — may be closed, on a different cluster, or pending indexer."
                : "Wallet not resolvable right now."}
            </span>
          </div>
        </div>
      </div>
      <div className="sof-wl-row-actions">
        <RemoveButton kind={kind} id={id} label={truncateAddress(id)} />
      </div>
    </article>
  );
}

function RemoveButton({
  kind,
  id,
  label,
}: {
  kind: "refinery" | "wallet";
  id: string;
  label: string;
}) {
  return (
    <button
      type="button"
      className="sof-wl-remove"
      onClick={() => removeWatched(kind, id)}
      title={`Remove ${label} from watchlist`}
      aria-label={`Remove ${label} from watchlist`}
    >
      <X size={13} strokeWidth={2} aria-hidden="true" />
    </button>
  );
}

function ClearAllButton({ kind }: { kind: "refinery" | "wallet" }) {
  return (
    <button
      type="button"
      className="sof-wl-clear"
      onClick={() => {
        if (
          confirm(
            `Remove all ${kind === "refinery" ? "refineries" : "wallets"} from your watchlist?`,
          )
        ) {
          clearWatched(kind);
        }
      }}
    >
      <Trash2 size={12} strokeWidth={1.8} aria-hidden="true" />
      Clear all
    </button>
  );
}

function EmptyState({
  title,
  desc,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  desc: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="sof-wl-empty">
      <div className="sof-wl-empty-icon" aria-hidden="true">
        <Star size={24} strokeWidth={1.5} />
      </div>
      <div className="sof-wl-empty-title">{title}</div>
      <p>{desc}</p>
      <Link href={ctaHref} className="sof-wl-empty-cta">
        {ctaLabel}
        <ArrowUpRight size={12} strokeWidth={2} aria-hidden="true" />
      </Link>
    </div>
  );
}
