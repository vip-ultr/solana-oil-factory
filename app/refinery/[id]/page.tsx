import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Copy, ExternalLink, Share2, Star } from "lucide-react";
import {
  ButtonLink,
  PendingIndexerBanner,
  ReputationChip,
  StatusPill,
  TokenMark,
  VerifiedBadge,
  WalletPill,
} from "@/components/sof/primitives";
import { EligibilityPanel } from "@/components/sof/refinery-detail/EligibilityPanel";
import { PoolDrainChart } from "@/components/sof/refinery-detail/PoolDrainChart";
import {
  formatTokens,
  formatUsd,
  formatRelativeTime,
} from "@/lib/mock-data";
import { fetchRefinery } from "@/lib/onchain/refineries";
import { fetchSnapshots } from "@/lib/onchain/snapshots";
import { fetchMint, formatSupply } from "@/lib/onchain/mint";
import { explorerUrl } from "@/lib/program";
import { buildActivityFeed } from "@/lib/indexer/ui";
import {
  topClaimantsForRefinery,
  operatorStatsFor,
} from "@/lib/indexer/aggregations";
import { computeReputation } from "@/lib/indexer/reputation";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Always-fresh — refinery accounts can update on every claim,
// deposit, or pause toggle. Caching would lie.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const r = await fetchRefinery(id);
  if (!r) return { title: "Refinery not found" };
  return {
    title: `${r.tokenName} (${r.tokenSymbol}) Refinery`,
    description: `Claim ${r.tokenSymbol} from a refinery operated by ${r.operator}. Pool ${formatTokens(r.poolRemaining)} ${r.tokenSymbol} · ${r.holdersEligible.toLocaleString()} eligible holders.`,
  };
}

export default async function RefineryPage({ params }: PageProps) {
  const { id } = await params;
  const r = await fetchRefinery(id);
  if (!r) notFound();

  const poolPct =
    r.poolInitial > 0 ? Math.round((r.poolRemaining / r.poolInitial) * 100) : 0;
  const claimPct =
    r.holdersEligible > 0
      ? Math.round((r.holdersClaimed / r.holdersEligible) * 100)
      : 0;

  // Live recent-claims feed for this refinery, sourced from the
  // indexer JSON. Returns 0 rows for fresh refineries — the
  // empty-state branch below handles that.
  const recentClaims = buildActivityFeed({
    refinery: id,
    eventName: "ClaimMade",
    limit: 8,
  });

  // Snapshot history (on-chain) + top claimants (indexer
  // aggregation) + token-mint metadata — fetched in parallel.
  const [snapshots, topClaimants, mintInfo] = await Promise.all([
    fetchSnapshots(id),
    Promise.resolve(topClaimantsForRefinery(id, 7)),
    r.tokenMintFull ? fetchMint(r.tokenMintFull) : Promise.resolve(null),
  ]);

  // Operator stats from indexer + reputation v0 score.
  const operatorStats = r.operatorFull
    ? operatorStatsFor(r.operatorFull)
    : null;
  const operatorRep = r.operatorFull ? computeReputation(r.operatorFull) : null;

  return (
    <>
      <PendingIndexerBanner section="The token-info panel and operator-history numbers" />
      <div className="sof-rd-crumb">
        <Link href="/refineries">Refineries</Link>
        <span className="sep">/</span>
        <span>{r.tokenSymbol}</span>
      </div>

      <header className="sof-rd-hdr">
        <div className="sof-rd-hdr-l">
          <TokenMark
            variant={r.tokenMarkVariant}
            symbol={r.tokenSymbol}
            size={64}
            className="lg"
          />
          <div className="sof-rd-hdr-meta">
            <h1>
              {r.tokenName} <span className="sym">{r.tokenSymbol}</span>{" "}
              <StatusPill status={r.status} />
            </h1>
            <div className="row">
              <VerifiedBadge tier={r.verification} />
              <button type="button" className="sof-rd-copy-mint">
                {r.tokenMint}
                <Copy aria-hidden="true" strokeWidth={2} />
              </button>
              <a className="sof-rd-ext">
                Solscan <ExternalLink size={11} />
              </a>
              <a className="sof-rd-ext">
                Birdeye <ExternalLink size={11} />
              </a>
              <a className="sof-rd-ext">
                Jupiter <ExternalLink size={11} />
              </a>
            </div>
          </div>
        </div>
        <div className="sof-rd-hdr-r">
          <button type="button" className="sof-rd-share" title="Share" aria-label="Share refinery">
            <Share2 size={14} strokeWidth={1.6} />
          </button>
          <button type="button" className="sof-rd-share" title="Watch" aria-label="Watch refinery">
            <Star size={14} strokeWidth={1.6} />
          </button>
          <button type="button" className="sof-btn sof-btn-primary">
            Check eligibility →
          </button>
        </div>
      </header>

      <div className="sof-rd-stat-strip">
        <div className="sof-rd-stat">
          <div className="k">Pool remaining</div>
          <div className="v">
            {formatTokens(r.poolRemaining)}
            <small>{r.tokenSymbol}</small>
          </div>
          <div className="sub">
            of {formatTokens(r.poolInitial)} initial ·{" "}
            <span style={{ color: "var(--success)" }}>
              {formatUsd(r.poolRemainingUsd)}
            </span>
          </div>
          <div className="sparkbar">
            <i style={{ width: `${poolPct}%` }} />
          </div>
        </div>
        <div className="sof-rd-stat">
          <div className="k">Holders claimed</div>
          <div className="v">
            {r.holdersClaimed.toLocaleString()}
            <small>/ {r.holdersEligible.toLocaleString()}</small>
          </div>
          <div className="sub">{claimPct}% participation</div>
          <div className="sparkbar">
            <i style={{ width: `${claimPct}%` }} />
          </div>
        </div>
        <div className="sof-rd-stat">
          <div className="k">Claim rate</div>
          <div className="v">
            {formatTokens(r.claimRatePer1Pct)}
            <small>/ 1%</small>
          </div>
          <div className="sub">
            tokens per 1% of supply held · cap {r.perClaimCapBps / 100}%
          </div>
        </div>
        <div className="sof-rd-stat">
          <div className="k">{r.claimWindowDaysLeft === null ? "Window" : "Closes in"}</div>
          <div className="v">
            {r.claimWindowDaysLeft === null
              ? "Open-ended"
              : `${r.claimWindowDaysLeft}d`}
          </div>
          <div className={r.claimWindowDaysLeft && r.claimWindowDaysLeft <= 1 ? "sub warn" : "sub"}>
            {r.claimWindowDaysLeft === null
              ? "No expiration set"
              : "Window ends Dec 15, 18:00 UTC"}
          </div>
        </div>
      </div>

      <section className="sof-rd-body">
        <div className="sof-rd-col-l">
          {/* Pool drain chart */}
          <div className="sof-rd-panel">
            <div className="sof-rd-panel-head">
              <h3>Pool drain · 24h</h3>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <span className="meta">
                  Net:{" "}
                  <span style={{ color: "var(--error)" }}>
                    −138,200 {r.tokenSymbol}
                  </span>
                </span>
                <div className="sof-rd-seg-mini">
                  <button type="button">1H</button>
                  <button type="button" className="on">24H</button>
                  <button type="button">7D</button>
                  <button type="button">ALL</button>
                </div>
              </div>
            </div>
            <PoolDrainChart />
          </div>

          {/* Recent claims — live from the indexer */}
          <div className="sof-rd-panel">
            <div className="sof-rd-panel-head">
              <h3>Recent claims</h3>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span className="meta">{r.holdersClaimed.toLocaleString()} total</span>
              </div>
            </div>
            <div>
              {recentClaims.length === 0 ? (
                <div
                  style={{
                    padding: "20px 16px",
                    color: "var(--text-tertiary)",
                    fontSize: 12.5,
                    lineHeight: 1.6,
                  }}
                >
                  No claims yet. Connect a wallet eligible for the latest
                  snapshot and it&apos;ll show up here.
                </div>
              ) : (
                recentClaims.map((c) => (
                  <div key={c.id} className="sof-rd-feed-row">
                    <WalletPill address={c.wallet} />
                    <span className="amt">
                      {c.amount !== undefined ? formatTokens(c.amount) : "—"}
                    </span>
                    <span className="ago">{formatRelativeTime(c.agoSeconds)}</span>
                    <a
                      className="lnk"
                      aria-label="View transaction"
                      href={`https://explorer.solana.com/tx/${c.id.split("-")[0]}?cluster=devnet`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink size={11} />
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Snapshot history — live from on-chain Snapshot PDAs */}
          <div className="sof-rd-panel">
            <div className="sof-rd-panel-head">
              <h3>Snapshot history</h3>
              <span className="meta">
                {snapshots.length === 0
                  ? "No snapshots yet"
                  : `${snapshots.length} snapshot${snapshots.length === 1 ? "" : "s"}`}
              </span>
            </div>
            {snapshots.length === 0 ? (
              <div
                style={{
                  padding: "20px 16px",
                  color: "var(--text-tertiary)",
                  fontSize: 12.5,
                  lineHeight: 1.6,
                }}
              >
                The platform snapshot authority hasn&apos;t published a
                merkle root for this refinery yet. The first claim
                window opens once snapshot #1 lands.
              </div>
            ) : (
              <table className="sof-rd-mtable">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>#</th>
                    <th>Taken at</th>
                    <th className="num">Holders</th>
                    <th className="num">Eligible supply</th>
                    <th>Merkle root</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshots.map((s) => (
                    <tr key={s.index}>
                      <td className="fade">
                        {s.index.toString().padStart(2, "0")}
                      </td>
                      <td>{new Date(s.takenAtUnix * 1000).toUTCString()}</td>
                      <td className="num">{s.holderCount.toLocaleString()}</td>
                      <td className="num">
                        {formatTokens(s.totalEligibleBalance)}
                      </td>
                      <td>
                        <a
                          className="sof-rd-snap-merkle font-mono"
                          href={`https://explorer.solana.com/address/${s.pda}?cluster=devnet`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {s.merkleRoot.slice(0, 8)}…
                          {s.merkleRoot.slice(-4)}{" "}
                          <ExternalLink
                            size={10}
                            style={{ display: "inline-block" }}
                          />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Top claimants — live from indexer ClaimMade events */}
          <div className="sof-rd-panel">
            <div className="sof-rd-panel-head">
              <h3>Top claimants</h3>
              <span className="meta">By total claimed</span>
            </div>
            {topClaimants.length === 0 ? (
              <div
                style={{
                  padding: "20px 16px",
                  color: "var(--text-tertiary)",
                  fontSize: 12.5,
                  lineHeight: 1.6,
                }}
              >
                Top claimants will populate once the first claim
                lands. Eligible wallets can claim once snapshot #1
                is published.
              </div>
            ) : (
              <table className="sof-rd-mtable">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>#</th>
                    <th>Wallet</th>
                    <th className="num">Total claimed</th>
                    <th className="num">Claims</th>
                    <th>First claim</th>
                  </tr>
                </thead>
                <tbody>
                  {topClaimants.map((c) => (
                    <tr key={c.holder}>
                      <td className="fade">
                        {c.rank.toString().padStart(2, "0")}
                      </td>
                      <td>
                        <WalletPill address={c.holder} />
                      </td>
                      <td className="num">{formatTokens(c.totalClaimed)}</td>
                      <td className="num">{c.claimCount}</td>
                      <td className="fade">
                        {c.firstClaimUnix
                          ? new Date(c.firstClaimUnix * 1000).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right column */}
        <aside className="sof-rd-col-r">
          <EligibilityPanel refinery={r} initialState="b" />

          <div className="sof-rd-panel">
            <div className="sof-rd-panel-head">
              <h3>Token info</h3>
              {r.tokenMintFull && (
                <a
                  className="sof-rd-ext"
                  style={{ fontSize: 11 }}
                  href={explorerUrl(r.tokenMintFull, "address")}
                  target="_blank"
                  rel="noreferrer"
                >
                  Explorer <ExternalLink size={10} />
                </a>
              )}
            </div>
            <div className="sof-rd-token-info">
              <div>
                <div className="k">Decimals</div>
                <div className="v">{mintInfo?.decimals ?? "—"}</div>
              </div>
              <div>
                <div className="k">Supply</div>
                <div className="v">
                  {mintInfo
                    ? formatSupply(mintInfo.supply, mintInfo.decimals)
                    : "—"}
                </div>
              </div>
              <div>
                <div className="k">Mint authority</div>
                <div
                  className="v"
                  style={{
                    color: mintInfo?.mintAuthority
                      ? "var(--warning)"
                      : "var(--success)",
                  }}
                >
                  {mintInfo
                    ? mintInfo.mintAuthority
                      ? "Active"
                      : "Renounced"
                    : "—"}
                </div>
              </div>
              <div>
                <div className="k">Freeze authority</div>
                <div
                  className="v"
                  style={{
                    color: mintInfo?.freezeAuthority
                      ? "var(--warning)"
                      : "var(--success)",
                  }}
                >
                  {mintInfo
                    ? mintInfo.freezeAuthority
                      ? "Active"
                      : "Renounced"
                    : "—"}
                </div>
              </div>
              <div>
                <div className="k">Market cap</div>
                <div className="v" style={{ color: "var(--text-tertiary)" }}>
                  v1.1
                </div>
              </div>
              <div>
                <div className="k">Holders (chain)</div>
                <div className="v" style={{ color: "var(--text-tertiary)" }}>
                  v1.1
                </div>
              </div>
            </div>
          </div>

          <div className="sof-rd-panel">
            <div className="sof-rd-panel-head">
              <h3>Token trust report</h3>
              <span
                className="meta"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--success)",
                  }}
                />
                RugCheck 92/100
              </span>
            </div>
            <div>
              {[
                { nm: "Mint authority", val: "Renounced", tone: "ok" as const },
                { nm: "Freeze authority", val: "Renounced", tone: "ok" as const },
                { nm: "Transfer fee", val: "0%", tone: "ok" as const },
                { nm: "Top-10 concentration", val: "8.2%", tone: "ok" as const },
                { nm: "Liquidity (24h)", val: "Healthy ($1.4M)", tone: "warn" as const },
                { nm: "LP burned", val: "Yes (98.4%)", tone: "ok" as const },
              ].map((row) => (
                <div key={row.nm} className="sof-rd-risk-row">
                  <span className="nm">
                    <span className={`ind ${row.tone}`} aria-hidden="true" />
                    {row.nm}
                  </span>
                  <span className={`vl ${row.tone}`}>{row.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sof-rd-panel">
            <div className="sof-rd-panel-head">
              <h3>Operator</h3>
            </div>
            <div className="sof-rd-op-card">
              <div className="top">
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <WalletPill address={r.operatorFull ?? r.operator} />
                  {operatorRep && (
                    <ReputationChip score={operatorRep.score} prefix="" />
                  )}
                </div>
                {r.operatorFull && (
                  <ButtonLink
                    href={`/wallet/${r.operatorFull}`}
                    variant="miniGhost"
                  >
                    Profile <ExternalLink size={10} />
                  </ButtonLink>
                )}
              </div>
              <div className="sof-rd-op-stats">
                <div>
                  <div className="k">Refineries</div>
                  <div className="v">{operatorStats?.refineryCount ?? 0}</div>
                </div>
                <div>
                  <div className="k">Distributed</div>
                  <div className="v">
                    {operatorStats
                      ? formatTokens(operatorStats.totalDistributed)
                      : "0"}
                  </div>
                </div>
                <div>
                  <div className="k">Holders served</div>
                  <div className="v">
                    {operatorStats?.uniqueHoldersServed ?? 0}
                  </div>
                </div>
                <div>
                  <div className="k">Wallet age</div>
                  <div
                    className="v"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    v0.5
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.5 }}>
                {r.verification === "verifiedDeployer"
                  ? `Verified deployer. Same wallet that minted ${r.tokenSymbol}.`
                  : r.verification === "verifiedCto"
                    ? `Verified community takeover. Manually verified by Solana Oil Factory after the original deployer abandoned the project.`
                    : `Unverified operator. Wallet doesn't match the mint authority and has not applied for a Verified CTO badge. Check operator reputation and history before claiming.`}
              </div>
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
