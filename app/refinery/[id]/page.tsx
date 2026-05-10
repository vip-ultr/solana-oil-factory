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

  return (
    <>
      <PendingIndexerBanner section="The activity, snapshot history, top claimants, token info, and operator-history panels" />
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

          {/* Recent claims */}
          <div className="sof-rd-panel">
            <div className="sof-rd-panel-head">
              <h3>Recent claims</h3>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span className="meta">{r.holdersClaimed.toLocaleString()} total</span>
                <a className="sof-rd-ext" style={{ fontSize: 11.5 }}>
                  View all <ExternalLink size={10} />
                </a>
              </div>
            </div>
            <div>
              {[
                { w: "Hxk2…7gPZ", a: "148.8", ago: "2m ago" },
                { w: "4Bsd…91jU", a: "12,000", ago: "5m ago" },
                { w: "9wF7…3Lz8", a: "3,840", ago: "8m ago" },
                { w: "2zKp…hH4M", a: "1,420", ago: "12m ago" },
                { w: "8zZb…3Ksn", a: "22,000", ago: "14m ago" },
                { w: "Pyth9…D7ax", a: "5,100", ago: "19m ago" },
                { w: "6FdN…XnQ2", a: "88", ago: "22m ago" },
                { w: "RayLi…D9pT", a: "412", ago: "35m ago" },
              ].map((c) => (
                <div key={c.w + c.ago} className="sof-rd-feed-row">
                  <WalletPill address={c.w} />
                  <span className="amt">{c.a}</span>
                  <span className="ago">{c.ago}</span>
                  <a className="lnk" aria-label="View transaction">
                    <ExternalLink size={11} />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Snapshot history */}
          <div className="sof-rd-panel">
            <div className="sof-rd-panel-head">
              <h3>Snapshot history</h3>
              <span className="meta">7 snapshots · hourly cadence</span>
            </div>
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
                {[
                  { n: "07", t: "Dec 12 · 14:00 UTC", h: "6,201", e: "204,812", m: "5kP9…M2x4" },
                  { n: "06", t: "Dec 12 · 13:00 UTC", h: "6,184", e: "203,990", m: "3hQz…J7t1" },
                  { n: "05", t: "Dec 12 · 12:00 UTC", h: "6,142", e: "203,008", m: "8aT4…N9p2" },
                  { n: "04", t: "Dec 12 · 11:00 UTC", h: "6,089", e: "201,544", m: "2bV8…K3w7" },
                  { n: "03", t: "Dec 12 · 10:00 UTC", h: "6,012", e: "200,021", m: "9dF2…X1m6" },
                  { n: "02", t: "Dec 12 · 09:00 UTC", h: "5,948", e: "198,772", m: "7eR1…Q4n8" },
                  { n: "01", t: "Dec 12 · 08:00 UTC", h: "5,802", e: "196,401", m: "4cS6…L0v3" },
                ].map((s) => (
                  <tr key={s.n}>
                    <td className="fade">{s.n}</td>
                    <td>{s.t}</td>
                    <td className="num">{s.h}</td>
                    <td className="num">{s.e}</td>
                    <td>
                      <a className="sof-rd-snap-merkle">
                        {s.m} <ExternalLink size={10} style={{ display: "inline-block" }} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Top claimants */}
          <div className="sof-rd-panel">
            <div className="sof-rd-panel-head">
              <h3>Top claimants</h3>
              <span className="meta">By total claimed</span>
            </div>
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
                {[
                  { n: "01", w: "4Bsd…91jU", rep: 67, t: "84,000", c: "7", f: "Dec 5" },
                  { n: "02", w: "RayLi…D9pT", rep: 71, t: "62,400", c: "7", f: "Dec 5" },
                  { n: "03", w: "OrcaT…D7vM", rep: 64, t: "48,000", c: "7", f: "Dec 5" },
                  { n: "04", w: "5jVq…78dM", rep: 71, t: "36,000", c: "6", f: "Dec 6" },
                  { n: "05", w: "MndS…DwY3", rep: 62, t: "28,800", c: "6", f: "Dec 6" },
                  { n: "06", w: "9wF7…3Lz8", rep: 51, t: "22,800", c: "5", f: "Dec 7" },
                  { n: "07", w: "Hxk2…7gPZ", rep: 84, t: "18,400", c: "5", f: "Dec 7" },
                ].map((row) => (
                  <tr key={row.n}>
                    <td className="fade">{row.n}</td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <WalletPill address={row.w} />
                        <ReputationChip score={row.rep} />
                      </span>
                    </td>
                    <td className="num">{row.t}</td>
                    <td className="num">{row.c}</td>
                    <td className="fade">{row.f}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <aside className="sof-rd-col-r">
          <EligibilityPanel refinery={r} initialState="b" />

          <div className="sof-rd-panel">
            <div className="sof-rd-panel-head">
              <h3>Token info</h3>
              <a className="sof-rd-ext" style={{ fontSize: 11 }}>
                Jupiter <ExternalLink size={10} />
              </a>
            </div>
            <div className="sof-rd-token-info">
              <div>
                <div className="k">Decimals</div>
                <div className="v">5</div>
              </div>
              <div>
                <div className="k">Supply</div>
                <div className="v">88.7T</div>
              </div>
              <div>
                <div className="k">Market cap</div>
                <div className="v">$1.42B</div>
              </div>
              <div>
                <div className="k">Holders (chain)</div>
                <div className="v">204,812</div>
              </div>
              <div>
                <div className="k">24h volume</div>
                <div className="v">$184M</div>
              </div>
              <div>
                <div className="k">Listed</div>
                <div className="v" style={{ color: "var(--success)" }}>
                  Jupiter ✓
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
                  <WalletPill address={r.operator} />
                  <ReputationChip score={r.operatorReputation} prefix="" />
                </div>
                <ButtonLink href={`/wallet/${r.operator}`} variant="miniGhost">
                  Profile <ExternalLink size={10} />
                </ButtonLink>
              </div>
              <div className="sof-rd-op-stats">
                <div>
                  <div className="k">Refineries</div>
                  <div className="v">2</div>
                </div>
                <div>
                  <div className="k">Distributed</div>
                  <div className="v">$14,820</div>
                </div>
                <div>
                  <div className="k">Avg rep of claimers</div>
                  <div className="v">78</div>
                </div>
                <div>
                  <div className="k">Wallet age</div>
                  <div className="v">380d</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.5 }}>
                {r.verification === "verifiedDeployer"
                  ? `Verified deployer. Same wallet that minted ${r.tokenSymbol}. No prior refineries closed early or paused without notice.`
                  : r.verification === "verifiedCto"
                    ? `Verified community takeover. Manually verified by Solana Oil Factory after the original deployer abandoned the project.`
                    : `Unverified operator. Wallet doesn't match the mint authority and has not applied for a Verified CTO badge. Check operator reputation and history before claiming.`}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                Last on-chain action {formatRelativeTime(r.snapshotAgeSeconds)}
              </div>
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
