import { Suspense, cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  ExternalLink,
  Info,
  Sparkles,
} from "lucide-react";
import {
  StatusPill,
  TokenMark,
  VerifiedBadge,
} from "@/components/sof/primitives";
import { WalletProfileTabs } from "@/components/sof/wallet/WalletProfileTabs";
import { ClaimHeatmap } from "@/components/sof/wallet/ClaimHeatmap";
import {
  WalletViewerControls,
  WalletOwnerPill,
} from "@/components/sof/wallet/WalletViewerControls";
import { WalletCopyButton } from "@/components/sof/wallet/WalletCopyButton";
import { fetchRefinery } from "@/lib/onchain/refineries";
import { tokenMetaFor } from "@/lib/onchain/token-registry";
import { loadEvents } from "@/lib/indexer/store";
import type { IndexedEvent } from "@/lib/indexer/types";
import {
  computeReputation,
  buildClaimHeatmap,
} from "@/lib/indexer/reputation";
import { formatTokens } from "@/lib/mock-data";
import type { Refinery, TokenMarkVariant } from "@/lib/mock-data";
import { solscanUrl } from "@/lib/program";

interface PageProps {
  params: Promise<{ address: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { address } = await params;
  return {
    title: `${address} — Wallet profile`,
    description:
      "Public wallet profile on Solana Oil Factory. Reputation, claim history, operated refineries, and snapshot eligibility.",
  };
}

const CIRCUMFERENCE = 2 * Math.PI * 74;

const TIER_LABEL: Record<string, string> = {
  excellent: "Excellent",
  good: "Good",
  neutral: "Neutral",
  risky: "Caution",
  flagged: "Risk",
};

const TIER_INDEX: Record<string, number> = {
  flagged: 0,
  risky: 1,
  neutral: 2,
  good: 3,
  excellent: 4,
};

// ── Per-request cache wrappers ────────────────────────────────────────────────
// React cache() deduplicates identical calls within a single render pass.
// KpiStrip and RepPanel both need reputation — only one DB round-trip happens.

const getClaims = cache((address: string) =>
  loadEvents({ wallet: address, eventName: "ClaimMade" }),
);

const getWalletLaunches = cache((address: string) =>
  loadEvents({ wallet: address, eventName: "RefineryLaunched" }),
);

const getReputation = cache((address: string) => computeReputation(address));

const getHeatmap = cache((address: string) => buildClaimHeatmap(address));

const getTimeline = cache((address: string) =>
  loadEvents({ wallet: address, limit: 100 }),
);

// Build mint map only for refineries this wallet has touched — replaces the
// full-table loadEvents({ eventName: "RefineryLaunched" }) scan.
async function getRefineryMintMap(address: string): Promise<Map<string, string>> {
  const [claims, launches] = await Promise.all([
    getClaims(address),
    getWalletLaunches(address),
  ]);

  const map = new Map<string, string>();
  for (const e of launches) {
    const ref = e.data.refinery as string | undefined;
    const mint = e.data.token_mint as string | undefined;
    if (ref && mint) map.set(ref, mint);
  }

  const claimedIds = [
    ...new Set(claims.map((c) => c.refinery).filter((r): r is string => Boolean(r))),
  ];
  const missingIds = claimedIds.filter((id) => !map.has(id));

  if (missingIds.length > 0) {
    const launchArrays = await Promise.all(
      missingIds.map((id) => loadEvents({ refinery: id, eventName: "RefineryLaunched" })),
    );
    for (const evts of launchArrays) {
      for (const e of evts) {
        const ref = e.data.refinery as string | undefined;
        const mint = e.data.token_mint as string | undefined;
        if (ref && mint) map.set(ref, mint);
      }
    }
  }

  return map;
}

// Targeted operator stats — replaces operatorStatsFor → topOperators(10000).
async function getOperatorStats(address: string) {
  const launches = await getWalletLaunches(address);
  const operatedIds = [
    ...new Set(launches.map((e) => e.data.refinery as string).filter(Boolean)),
  ];
  if (operatedIds.length === 0) return null;

  const claimsArrays = await Promise.all(
    operatedIds.map((id) => loadEvents({ refinery: id, eventName: "ClaimMade" })),
  );
  const allClaims = claimsArrays.flat();
  const totalDistributed = allClaims.reduce(
    (sum, e) => sum + Number(e.data.amount_claimed ?? 0),
    0,
  );
  const uniqueHolders = new Set(
    allClaims.map((e) => e.data.holder as string).filter(Boolean),
  );

  return { totalDistributed, uniqueHoldersServed: uniqueHolders.size };
}

// ── Page shell — renders immediately, no awaits ───────────────────────────────

export default async function WalletPage({ params }: PageProps) {
  const { address } = await params;
  const truncated =
    address.length > 12
      ? `${address.slice(0, 4)}…${address.slice(-4)}`
      : address;

  return (
    <>
      <header className="sof-w-hdr">
        <div className="sof-w-hdr-top">
          <div className="sof-w-hdr-id">
            <h1>{truncated}</h1>
            <WalletCopyButton address={address} />
            <VerifiedBadge tier="verifiedDeployer" />
            <WalletOwnerPill address={address} />
          </div>
          <div className="sof-w-hdr-actions">
            <WalletViewerControls address={address} truncated={truncated} />
          </div>
        </div>

        <div className="sof-w-hdr-stats">
          <div className="sof-w-stat-chip">
            <span className="k">Network</span>
            <span className="v">
              <span className="led" aria-hidden="true" />
              Devnet
            </span>
          </div>
          <Suspense fallback={<WalletAgeFallback />}>
            <WalletAgeChips address={address} />
          </Suspense>
          <a
            href={solscanUrl(address, "address")}
            target="_blank"
            rel="noreferrer"
            className="sof-w-stat-chip linkable"
          >
            <span className="k">On-chain</span>
            <span className="v">
              Solscan
              <ExternalLink size={11} strokeWidth={2} aria-hidden="true" />
            </span>
          </a>
        </div>
      </header>

      <Suspense fallback={<KpiStripSkeleton />}>
        <KpiStrip address={address} />
      </Suspense>

      <div className="sof-w-body">
        <Suspense fallback={<RepSkeleton />}>
          <RepPanel address={address} />
        </Suspense>

        <Suspense fallback={<TabsSkeleton />}>
          <TabsPanel address={address} />
        </Suspense>

        <Suspense fallback={<HeatmapSkeleton />}>
          <HeatmapPanel address={address} />
        </Suspense>

        <div className="sof-w-warning-card">
          <h5>
            <Sparkles size={13} strokeWidth={2} aria-hidden="true" />
            Treat reputation as a signal, not a guarantee
          </h5>
          <p>
            Reputation reflects past on-chain behavior, not a guarantee of
            future actions. Always verify the underlying token and operator
            independently before participating.
          </p>
        </div>
      </div>
    </>
  );
}

// ── Async server components ───────────────────────────────────────────────────

async function KpiStrip({ address }: { address: string }) {
  const [rep, claims, launches, opStats] = await Promise.all([
    getReputation(address),
    getClaims(address),
    getWalletLaunches(address),
    getOperatorStats(address),
  ]);

  const operatedCount = new Set(
    launches.map((e) => e.data.refinery as string).filter(Boolean),
  ).size;

  return (
    <div className="sof-w-kpi-strip">
      <KpiTile
        label="Reputation"
        value={rep.score}
        sub={TIER_LABEL[rep.tier] ?? rep.tier}
        accent
      />
      <KpiTile
        label="Claims"
        value={claims.length.toLocaleString()}
        sub={claims.length === 0 ? "no claims yet" : "since first claim"}
      />
      <KpiTile
        label="Refineries operated"
        value={operatedCount}
        sub={
          opStats
            ? `${formatTokens(opStats.totalDistributed)} distributed`
            : "—"
        }
      />
      <KpiTile
        label="Holders served"
        value={opStats?.uniqueHoldersServed ?? 0}
        sub="across operated refineries"
      />
      <KpiTile label="Streak" value="—" sub="ships with v1.1" muted />
    </div>
  );
}

async function RepPanel({ address }: { address: string }) {
  const reputation = await getReputation(address);
  const fillOffset = CIRCUMFERENCE * (1 - reputation.score / 100);

  return (
    <div className="sof-w-panel">
      <div className="sof-w-panel-h">
        <h3>Reputation</h3>
        <span className="meta">v1 · 6 signals</span>
      </div>
      <div className="sof-w-rep-grid">
        <div className="sof-w-rep-cell sof-w-rep-cell-gauge">
          <div className="sof-w-gauge">
            <div className="ring">
              <svg
                viewBox="0 0 170 170"
                aria-hidden="true"
                focusable="false"
                role="presentation"
                preserveAspectRatio="xMidYMid meet"
              >
                <circle
                  cx="85"
                  cy="85"
                  r="74"
                  fill="none"
                  stroke="var(--bg-input)"
                  strokeWidth="10"
                />
                <circle
                  cx="85"
                  cy="85"
                  r="74"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE.toFixed(2)}
                  strokeDashoffset={fillOffset.toFixed(2)}
                  transform="rotate(-90 85 85)"
                />
              </svg>
              <div className="v">
                <span className="num">{reputation.score}</span>
                <span className="lab">/ 100</span>
              </div>
            </div>
            <div className="tier">
              {TIER_LABEL[reputation.tier] ?? reputation.tier}
            </div>
            <div className="tier-bar">
              {[0, 1, 2, 3, 4].map((idx) => (
                <div
                  key={idx}
                  className={
                    idx === TIER_INDEX[reputation.tier] ? "on" : undefined
                  }
                />
              ))}
            </div>
            <div className="tier-labels">
              <span>Risk</span>
              <span>Caution</span>
              <span>Neutral</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>
          </div>
        </div>

        <div className="sof-w-rep-cell sof-w-rep-cell-bars">
          <div className="sof-w-rep-cell-h">Signal breakdown</div>
          <div className="sof-w-brk">
            {reputation.signals.map((s) => (
              <div key={s.code} className="sof-w-brk-row">
                <span className="k">
                  <b>{s.code}</b> · {s.label}
                </span>
                <span className="bar" aria-hidden="true">
                  <i style={{ width: `${(s.value / s.max) * 100}%` }} />
                </span>
                <span className="v">
                  {s.value}/{s.max}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="sof-w-rep-cell sof-w-rep-cell-details">
          <div className="sof-w-rep-cell-h">How each signal was earned</div>
          <div className="sof-w-brk-detail">
            {reputation.signals.map((s) => (
              <div key={s.code}>
                <strong>{s.code}.</strong> {s.detail}
              </div>
            ))}
          </div>
          <Link href="/reputation" className="sof-w-rep-methodology">
            <Info size={12} strokeWidth={2} aria-hidden="true" />
            How is this calculated?
          </Link>
        </div>
      </div>
    </div>
  );
}

async function TabsPanel({ address }: { address: string }) {
  const [claims, launches, timeline] = await Promise.all([
    getClaims(address),
    getWalletLaunches(address),
    getTimeline(address),
  ]);

  const refineryMintMap = await getRefineryMintMap(address);

  const operatedIds = [
    ...new Set(launches.map((e) => e.data.refinery as string).filter(Boolean)),
  ];
  const operatedResults = await Promise.all(operatedIds.map((id) => fetchRefinery(id)));
  const operatedRefineries = operatedResults.filter((r): r is Refinery => r !== null);

  const claimedIds = [
    ...new Set(claims.map((c) => c.refinery).filter((r): r is string => Boolean(r))),
  ];
  const snapshots =
    claimedIds.length > 0
      ? await Promise.all(
          claimedIds.map((id) =>
            loadEvents({ refinery: id, eventName: "SnapshotSubmitted" }),
          ),
        ).then((arrays) =>
          arrays
            .flat()
            .sort((a, b) => b.slot - a.slot || b.logIndex - a.logIndex),
        )
      : ([] as IndexedEvent[]);

  return (
    <div className="sof-w-panel">
      <WalletProfileTabs
        tabs={[
          {
            value: "claims",
            label: "Recent claims",
            count: claims.length,
            panel: (
              <ClaimsPanel claims={claims} refineryMintMap={refineryMintMap} />
            ),
          },
          {
            value: "refineries",
            label: "Refineries",
            count: operatedRefineries.length,
            panel: <OperatedPanel operated={operatedRefineries} />,
          },
          {
            value: "snapshots",
            label: "Snapshots",
            panel: (
              <SnapshotsPanel
                snapshots={snapshots}
                claims={claims}
                refineryMintMap={refineryMintMap}
              />
            ),
          },
          {
            value: "activity",
            label: "Reputation events",
            panel: (
              <ReputationEventsPanel
                events={timeline}
                refineryMintMap={refineryMintMap}
              />
            ),
          },
        ]}
      />
    </div>
  );
}

async function HeatmapPanel({ address }: { address: string }) {
  const heatmap = await getHeatmap(address);

  return (
    <div className="sof-w-panel">
      <div className="sof-w-panel-h">
        <h3>Claim activity · 53 weeks</h3>
        <span className="meta">
          {heatmap.totalClaims} claim
          {heatmap.totalClaims === 1 ? "" : "s"}
          {heatmap.longestStreakDays > 0 &&
            ` · longest streak ${heatmap.longestStreakDays} day${heatmap.longestStreakDays === 1 ? "" : "s"}`}
        </span>
      </div>
      <ClaimHeatmap counts={heatmap.counts} />
      <div className="sof-w-heatmap-legend">
        Less
        <div className="leg" aria-hidden="true">
          <div style={{ background: "var(--bg-input)" }} />
          <div style={{ background: "rgba(245,166,35,0.25)" }} />
          <div style={{ background: "rgba(245,166,35,0.5)" }} />
          <div style={{ background: "rgba(245,166,35,0.75)" }} />
          <div style={{ background: "var(--accent)" }} />
        </div>
        More
      </div>
    </div>
  );
}

async function WalletAgeChips({ address }: { address: string }) {
  const rep = await getReputation(address);
  const { tenureDays, firstSeenUnix } = rep.context;

  return (
    <>
      <div className="sof-w-stat-chip">
        <span className="k">Wallet age</span>
        <span className="v">{tenureDays > 0 ? `${tenureDays} days` : "—"}</span>
      </div>
      <div className="sof-w-stat-chip">
        <span className="k">First seen</span>
        <span className="v">
          {firstSeenUnix
            ? new Date(firstSeenUnix * 1000).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "—"}
        </span>
      </div>
    </>
  );
}

function WalletAgeFallback() {
  return (
    <>
      <div className="sof-w-stat-chip">
        <span className="k">Wallet age</span>
        <div className="sof-w-sk-line" style={{ width: 58, height: 11, marginTop: 2 }} />
      </div>
      <div className="sof-w-stat-chip">
        <span className="k">First seen</span>
        <div className="sof-w-sk-line" style={{ width: 78, height: 11, marginTop: 2 }} />
      </div>
    </>
  );
}

// ── Skeleton fallbacks ────────────────────────────────────────────────────────

function KpiStripSkeleton() {
  return (
    <div className="sof-w-kpi-strip">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="sof-w-kpi sof-w-sk-card">
          <div className="sof-w-sk-line" style={{ width: 70, height: 9 }} />
          <div className="sof-w-sk-line" style={{ width: 60, height: 24, marginTop: 8 }} />
          <div className="sof-w-sk-line" style={{ width: 100, height: 9, marginTop: 6 }} />
        </div>
      ))}
    </div>
  );
}

function RepSkeleton() {
  return (
    <div className="sof-w-panel">
      <div className="sof-w-rep-grid">
        <div className="sof-w-rep-cell sof-w-rep-cell-gauge" style={{ textAlign: "center" }}>
          <div className="sof-w-sk-circle" />
          <div className="sof-w-sk-line" style={{ width: 80, height: 12, margin: "20px auto 0" }} />
          <div className="sof-w-sk-line" style={{ width: "100%", height: 4, marginTop: 16, borderRadius: 999 }} />
        </div>
        <div className="sof-w-rep-cell">
          <div className="sof-w-sk-line" style={{ width: 110, height: 10 }} />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="sof-w-sk-line" style={{ width: "100%", height: 12, marginTop: 14 }} />
          ))}
        </div>
        <div className="sof-w-rep-cell">
          <div className="sof-w-sk-line" style={{ width: 140, height: 10 }} />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="sof-w-sk-line" style={{ width: i % 2 ? "92%" : "78%", height: 10, marginTop: 10 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TabsSkeleton() {
  return (
    <div className="sof-w-panel sof-w-sk-panel">
      <div className="sof-w-sk-line" style={{ width: 180, height: 14 }} />
      <div className="sof-w-sk-line" style={{ width: "100%", height: 12, marginTop: 18 }} />
      <div className="sof-w-sk-line" style={{ width: "92%", height: 12, marginTop: 10 }} />
      <div className="sof-w-sk-line" style={{ width: "85%", height: 12, marginTop: 10 }} />
    </div>
  );
}

function HeatmapSkeleton() {
  return (
    <div className="sof-w-panel sof-w-sk-panel">
      <div className="sof-w-sk-line" style={{ width: 220, height: 14 }} />
      <div className="sof-w-sk-block" style={{ marginTop: 16, height: 120 }} />
    </div>
  );
}

// ── UI primitives ─────────────────────────────────────────────────────────────

function KpiTile({
  label,
  value,
  sub,
  accent,
  muted,
}: {
  label: string;
  value: number | string;
  sub: string;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`sof-w-kpi${accent ? " accent" : ""}${muted ? " muted" : ""}`}
    >
      <div className="k">{label}</div>
      <div className="v">{value}</div>
      <div className="sub">{sub}</div>
    </div>
  );
}

function ClaimsPanel({
  claims,
  refineryMintMap,
}: {
  claims: Awaited<ReturnType<typeof loadEvents>>;
  refineryMintMap: Map<string, string>;
}) {
  if (claims.length === 0) {
    return (
      <EmptyPanel
        title="No claims yet"
        desc="This wallet hasn't claimed anywhere yet."
        action={{ href: "/refineries", label: "Browse open refineries" }}
      />
    );
  }

  return (
    <div className="sof-w-tbl-wrap">
      <table className="sof-w-tbl">
        <thead>
          <tr>
            <th style={{ width: 50 }}>#</th>
            <th>Refinery</th>
            <th className="num">Amount</th>
            <th>Snapshot</th>
            <th>When</th>
            <th>Tx</th>
          </tr>
        </thead>
        <tbody>
          {claims.map((c, i) => {
            const ref = c.refinery ?? "";
            const mint = ref ? refineryMintMap.get(ref) : undefined;
            const meta = mint
              ? tokenMetaFor(mint)
              : {
                  symbol: "—",
                  name: "Unknown",
                  variant: "default" as const,
                };
            const amount = Number(c.data.amount_claimed ?? 0);
            const snapshotIndex =
              typeof c.data.snapshot_index === "number"
                ? c.data.snapshot_index
                : typeof c.data.snapshot_index === "string"
                  ? c.data.snapshot_index
                  : "?";
            const when = c.blockTime
              ? new Date(c.blockTime * 1000).toLocaleString()
              : "—";
            return (
              <tr key={`${c.signature}-${c.logIndex}`}>
                <td data-label="#" className="fade">
                  {(claims.length - i).toString().padStart(2, "0")}
                </td>
                <td data-label="Refinery">
                  <RefineryCell
                    refineryId={ref}
                    name={meta.name}
                    symbol={meta.symbol}
                    variant={meta.variant}
                  />
                </td>
                <td data-label="Amount" className="num">
                  {formatTokens(amount)}
                </td>
                <td data-label="Snapshot">#{snapshotIndex ?? "?"}</td>
                <td data-label="When" className="fade">
                  {when}
                </td>
                <td data-label="Tx">
                  <a
                    className="fade sof-w-txlink"
                    href={`https://explorer.solana.com/tx/${c.signature}?cluster=devnet`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {c.signature.slice(0, 4)}…{c.signature.slice(-4)}
                    <ExternalLink size={10} strokeWidth={2} aria-hidden="true" />
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RefineryCell({
  refineryId,
  name,
  symbol,
  variant,
}: {
  refineryId: string;
  name: string;
  symbol: string;
  variant: TokenMarkVariant;
}) {
  const inner = (
    <div className="sof-w-token-row">
      <TokenMark variant={variant} symbol={symbol} size={28} />
      <div className="sof-w-token-id">
        <span className="nm">{name}</span>
        <span className="sym">{symbol}</span>
      </div>
    </div>
  );
  if (!refineryId) return inner;
  return (
    <Link href={`/refinery/${refineryId}`} className="sof-w-cell-link">
      {inner}
    </Link>
  );
}

function OperatedPanel({ operated }: { operated: Refinery[] }) {
  if (operated.length === 0) {
    return (
      <EmptyPanel
        title="Not operating a refinery yet"
        desc="This wallet hasn't operated a refinery on this cluster."
        action={{ href: "/refinery/launch", label: "Launch one" }}
      />
    );
  }
  return (
    <div className="sof-w-tbl-wrap">
      <table className="sof-w-tbl">
        <thead>
          <tr>
            <th>Token</th>
            <th className="num">Pool remaining</th>
            <th className="num">Holders claimed</th>
            <th>Status</th>
            <th>Launched</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {operated.map((rf) => (
            <tr key={rf.id}>
              <td data-label="Token">
                <Link
                  href={`/refinery/${rf.id}`}
                  className="sof-w-cell-link"
                >
                  <div className="sof-w-token-row">
                    <TokenMark
                      variant={rf.tokenMarkVariant}
                      symbol={rf.tokenSymbol}
                      logoUrl={rf.logoUrl}
                    />
                    <div className="sof-w-token-id">
                      <span className="nm">{rf.tokenName}</span>
                      <span className="sym">{rf.tokenSymbol}</span>
                    </div>
                  </div>
                </Link>
              </td>
              <td data-label="Pool remaining" className="num">
                {formatTokens(rf.poolRemaining)}
              </td>
              <td data-label="Holders claimed" className="num">
                {rf.holdersClaimed}
              </td>
              <td data-label="Status">
                <StatusPill status={rf.status} />
              </td>
              <td data-label="Launched" className="fade">
                {new Date(rf.launchedAtIso).toLocaleDateString()}
              </td>
              <td data-label="">
                <Link
                  href={`/refinery/${rf.id}`}
                  className="sof-w-row-cta"
                  aria-label={`Manage ${rf.tokenName}`}
                >
                  Manage
                  <ArrowUpRight size={11} strokeWidth={2} aria-hidden="true" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Snapshots panel ──────────────────────────────────────────────────────────

const SNAP_CLAIM_DELAY = 86_400;

function SnapshotsPanel({
  snapshots,
  claims,
  refineryMintMap,
}: {
  snapshots: IndexedEvent[];
  claims: IndexedEvent[];
  refineryMintMap: Map<string, string>;
}) {
  if (snapshots.length === 0) {
    return (
      <EmptyPanel
        title="No snapshot history yet"
        desc="Snapshots from refineries you have claimed in will appear here once a snapshot is submitted."
      />
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const claimedKeys = new Set(
    claims.map((c) => `${c.refinery}-${c.data.snapshot_index}`),
  );

  return (
    <div className="sof-w-tbl-wrap">
      <table className="sof-w-tbl">
        <thead>
          <tr>
            <th>Refinery</th>
            <th className="num">Snapshot</th>
            <th className="num">Eligible holders</th>
            <th>Submitted</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {snapshots.map((s) => {
            const ref = s.refinery ?? "";
            const mint = ref ? refineryMintMap.get(ref) : undefined;
            const meta = mint
              ? tokenMetaFor(mint)
              : { symbol: "—", name: "Unknown", variant: "default" as const };
            const snapshotIndex = s.data.snapshot_index as number;
            const holderCount = Number(s.data.holder_count ?? 0);
            const submittedAt = s.blockTime;
            const isPending =
              submittedAt !== null && now - submittedAt < SNAP_CLAIM_DELAY;
            const isClaimed = claimedKeys.has(`${ref}-${snapshotIndex}`);

            let statusLabel: string;
            let statusClass: string;
            if (isClaimed) {
              statusLabel = "Claimed";
              statusClass = "claimed";
            } else if (isPending) {
              statusLabel = "Pending";
              statusClass = "pending";
            } else {
              statusLabel = "Not claimed";
              statusClass = "missed";
            }

            return (
              <tr key={`${s.signature}-${s.logIndex}`}>
                <td data-label="Refinery">
                  <RefineryCell
                    refineryId={ref}
                    name={meta.name}
                    symbol={meta.symbol}
                    variant={meta.variant}
                  />
                </td>
                <td data-label="Snapshot" className="num">
                  #{snapshotIndex}
                </td>
                <td data-label="Eligible holders" className="num">
                  {holderCount.toLocaleString()}
                </td>
                <td data-label="Submitted" className="fade">
                  {submittedAt
                    ? new Date(submittedAt * 1000).toLocaleString()
                    : "—"}
                </td>
                <td data-label="Status">
                  <span className={`sof-snap-pill ${statusClass}`}>
                    {statusLabel}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Reputation events panel ───────────────────────────────────────────────────

const REP_EVENT_META: Record<
  string,
  { signal: string; positive: boolean; describe: (e: IndexedEvent) => string }
> = {
  ClaimMade: {
    signal: "+C",
    positive: true,
    describe: (e) => {
      const amt = formatTokens(Number(e.data.amount_claimed ?? 0));
      return `Claimed ${amt} tokens`;
    },
  },
  RefineryLaunched: {
    signal: "+O",
    positive: true,
    describe: () => "Launched a refinery",
  },
  RefineryClosed: {
    signal: "O",
    positive: false,
    describe: () => "Closed refinery",
  },
  RefineryDeposit: {
    signal: "—",
    positive: true,
    describe: (e) => `Deposited ${formatTokens(Number(e.data.amount ?? 0))} tokens`,
  },
  OperatorWithdraw: {
    signal: "—",
    positive: false,
    describe: (e) => `Withdrew ${formatTokens(Number(e.data.amount ?? 0))} tokens`,
  },
  SnapshotSubmitted: {
    signal: "+D",
    positive: true,
    describe: (e) =>
      `Snapshot #${e.data.snapshot_index} · ${Number(e.data.holder_count ?? 0).toLocaleString()} holders`,
  },
  EpochAdvanced: {
    signal: "—",
    positive: true,
    describe: () => "Epoch advanced",
  },
};

const REP_EVENT_NAMES = new Set(Object.keys(REP_EVENT_META));

function ReputationEventsPanel({
  events,
  refineryMintMap,
}: {
  events: IndexedEvent[];
  refineryMintMap: Map<string, string>;
}) {
  const filtered = events.filter((e) => REP_EVENT_NAMES.has(e.eventName));

  if (filtered.length === 0) {
    return (
      <EmptyPanel
        title="No reputation events yet"
        desc="Claims, launches, deposits, and other wallet activity will appear here as an audit log."
      />
    );
  }

  return (
    <div className="sof-w-tbl-wrap">
      <table className="sof-w-tbl">
        <thead>
          <tr>
            <th style={{ width: 52 }}>Signal</th>
            <th>Event</th>
            <th>Refinery</th>
            <th>When</th>
            <th>Tx</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((e) => {
            const meta = REP_EVENT_META[e.eventName];
            const ref = e.refinery ?? "";
            const mint = ref ? refineryMintMap.get(ref) : undefined;
            const tokenMeta = mint ? tokenMetaFor(mint) : null;
            const when = e.blockTime
              ? new Date(e.blockTime * 1000).toLocaleString()
              : "—";
            return (
              <tr key={`${e.signature}-${e.logIndex}`}>
                <td data-label="Signal">
                  <span
                    className={`sof-rep-delta ${meta.positive ? "pos" : "neg"}`}
                  >
                    {meta.signal}
                  </span>
                </td>
                <td data-label="Event">{meta.describe(e)}</td>
                <td data-label="Refinery">
                  {ref ? (
                    <RefineryCell
                      refineryId={ref}
                      name={tokenMeta?.name ?? "Unknown"}
                      symbol={tokenMeta?.symbol ?? "—"}
                      variant={tokenMeta?.variant ?? "default"}
                    />
                  ) : (
                    <span className="fade">—</span>
                  )}
                </td>
                <td data-label="When" className="fade">
                  {when}
                </td>
                <td data-label="Tx">
                  <a
                    className="fade sof-w-txlink"
                    href={`https://explorer.solana.com/tx/${e.signature}?cluster=devnet`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {e.signature.slice(0, 4)}…{e.signature.slice(-4)}
                    <ExternalLink size={10} strokeWidth={2} aria-hidden="true" />
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function EmptyPanel({
  title,
  desc,
  action,
}: {
  title: string;
  desc: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="sof-w-empty">
      <div className="sof-w-empty-title">{title}</div>
      <p>{desc}</p>
      {action && (
        <Link href={action.href} className="sof-w-empty-cta">
          {action.label}
          <ArrowUpRight size={12} strokeWidth={2} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
