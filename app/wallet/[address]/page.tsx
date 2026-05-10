import type { Metadata } from "next";
import Link from "next/link";
import {
  ButtonLink,
  PendingIndexerBanner,
  StatusPill,
  TokenMark,
  VerifiedBadge,
} from "@/components/sof/primitives";
import { WalletTabs } from "@/components/sof/wallet/WalletTabs";
import { ClaimHeatmap } from "@/components/sof/wallet/ClaimHeatmap";
import { fetchAllRefineries } from "@/lib/onchain/refineries";
import { tokenMetaFor } from "@/lib/onchain/token-registry";
import { loadEvents } from "@/lib/indexer/store";
import { operatorStatsFor } from "@/lib/indexer/aggregations";
import { formatTokens } from "@/lib/mock-data";

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

const REPUTATION = 84;
const CIRCUMFERENCE = 2 * Math.PI * 74; // ~464.96
const FILL_OFFSET = CIRCUMFERENCE * (1 - REPUTATION / 100); // ~74.4

export default async function WalletPage({ params }: PageProps) {
  const { address } = await params;
  const truncated =
    address.length > 12
      ? `${address.slice(0, 4)}…${address.slice(-4)}`
      : address;

  // Live indexer-derived data for this wallet.
  const allEvents = loadEvents();
  const claims = allEvents.filter(
    (e) => e.eventName === "ClaimMade" && e.wallet === address,
  );
  const opStats = operatorStatsFor(address);

  // Build a refinery PDA → token mint lookup from RefineryLaunched
  // events so we can show token symbols on the claim rows.
  const refineryMintMap = new Map<string, string>();
  const refineryOperatorMap = new Map<string, string>();
  for (const e of allEvents) {
    if (e.eventName !== "RefineryLaunched") continue;
    const ref = e.data.refinery as string | undefined;
    const mint = e.data.token_mint as string | undefined;
    const op = e.data.operator as string | undefined;
    if (ref && mint) refineryMintMap.set(ref, mint);
    if (ref && op) refineryOperatorMap.set(ref, op);
  }

  // Operated-refinery rows (live on-chain refinery accounts
  // filtered by operator). `fetchAllRefineries` is cheap on
  // devnet; bigger clusters would want a getProgramAccounts
  // memcmp filter, deferred to v1.1.
  const allRefineries = await fetchAllRefineries();
  const operatedRefineries = allRefineries.filter(
    (r) => refineryOperatorMap.get(r.id) === address,
  );

  return (
    <>
      <PendingIndexerBanner section="The reputation gauge + claim heatmap" />
      <div className="sof-w-crumb">
        <Link href="/leaderboard">Leaderboard</Link> / Wallet
      </div>

      <header className="sof-w-hdr">
        <div className="av" aria-hidden="true" />
        <div>
          <h1>
            <span>{truncated}</span>
            <span className="pl">{address}</span>
          </h1>
          <div className="meta">
            <VerifiedBadge tier="verifiedDeployer" />
            <span className="sep">·</span>
            <span>
              Wallet age{" "}
              <strong style={{ color: "var(--text-primary)" }}>380 days</strong>
            </span>
            <span className="sep">·</span>
            <span>
              First seen{" "}
              <strong style={{ color: "var(--text-primary)" }}>Apr 25 2025</strong>
            </span>
            <span className="sep">·</span>
            <a className="sof-rd-ext" style={{ cursor: "pointer" }}>
              Solscan ↗
            </a>
          </div>
        </div>
        <div className="actions">
          <button
            type="button"
            style={{
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
              padding: "9px 14px",
              borderRadius: 6,
              fontSize: 13,
              background: "transparent",
            }}
          >
            Watch
          </button>
          <button
            type="button"
            style={{
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
              padding: "9px 14px",
              borderRadius: 6,
              fontSize: 13,
              background: "transparent",
            }}
          >
            Share
          </button>
          <ButtonLink href="/dashboard" variant="primary">
            Connect as this wallet
          </ButtonLink>
        </div>
      </header>

      <div className="sof-w-kpi-strip">
        <div className="it">
          <div className="k">Reputation</div>
          <div className="v">
            <span style={{ color: "var(--text-tertiary)" }}>—</span>
            <small>v1.1</small>
          </div>
          <div className="sub">Score lands with the indexer</div>
        </div>
        <div className="it">
          <div className="k">Claims</div>
          <div className="v">{claims.length.toLocaleString()}</div>
          <div className="sub">
            {claims.length === 0 ? "no claims yet" : `since first claim`}
          </div>
        </div>
        <div className="it">
          <div className="k">Refineries operated</div>
          <div className="v">
            {operatedRefineries.length}
            {operatedRefineries.length > 0 && <small>active</small>}
          </div>
          <div className="sub">
            {opStats
              ? `${formatTokens(opStats.totalDistributed)} distributed`
              : "—"}
          </div>
        </div>
        <div className="it">
          <div className="k">Unique holders served</div>
          <div className="v">{opStats?.uniqueHoldersServed ?? 0}</div>
          <div className="sub">across operated refineries</div>
        </div>
        <div className="it">
          <div className="k">Streak</div>
          <div className="v" style={{ color: "var(--text-tertiary)" }}>
            —
          </div>
          <div className="sub">Daily-streak calc lands with v1.1</div>
        </div>
      </div>

      <div className="sof-w-body">
        <div className="sof-w-col-l">
          <div className="sof-w-panel">
            <WalletTabs />
            {claims.length === 0 ? (
              <div
                style={{
                  padding: "32px 20px",
                  color: "var(--text-tertiary)",
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                This wallet hasn&apos;t claimed anywhere yet. Browse{" "}
                <Link
                  href="/refineries"
                  style={{ color: "var(--accent)" }}
                >
                  open refineries
                </Link>{" "}
                — eligibility is auto-detected from holdings at snapshot time.
              </div>
            ) : (
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
                      : { symbol: "—", name: "Unknown", variant: "default" as const };
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
                        <td className="fade">
                          {(claims.length - i).toString().padStart(2, "0")}
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <TokenMark
                              variant={meta.variant}
                              symbol={meta.symbol}
                              size={28}
                            />
                            <span
                              className="font-display"
                              style={{ fontWeight: 600 }}
                            >
                              {meta.name}
                            </span>
                            <span className="fade">{meta.symbol}</span>
                          </div>
                        </td>
                        <td className="num">{formatTokens(amount)}</td>
                        <td>#{snapshotIndex ?? "?"}</td>
                        <td className="fade">{when}</td>
                        <td>
                          <a
                            className="fade"
                            href={`https://explorer.solana.com/tx/${c.signature}?cluster=devnet`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {c.signature.slice(0, 4)}…{c.signature.slice(-4)} ↗
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="sof-w-panel">
            <div className="sof-w-panel-h">
              <h3>Claim activity · 53 weeks</h3>
              <span className="meta">47 claims · longest streak 14 days</span>
            </div>
            <ClaimHeatmap address={address} />
            <div className="sof-w-heatmap-legend">
              Less
              <div className="leg">
                <div style={{ background: "var(--bg-input)" }} />
                <div style={{ background: "rgba(245,166,35,0.25)" }} />
                <div style={{ background: "rgba(245,166,35,0.5)" }} />
                <div style={{ background: "rgba(245,166,35,0.75)" }} />
                <div style={{ background: "var(--accent)" }} />
              </div>
              More
            </div>
          </div>

          <div className="sof-w-panel">
            <div className="sof-w-panel-h">
              <h3>Operated refineries</h3>
              <span className="meta">
                {operatedRefineries.length === 0
                  ? "—"
                  : `${operatedRefineries.length} on devnet`}
              </span>
            </div>
            {operatedRefineries.length === 0 ? (
              <div
                style={{
                  padding: "20px 16px",
                  color: "var(--text-tertiary)",
                  fontSize: 12.5,
                  lineHeight: 1.6,
                }}
              >
                This wallet hasn&apos;t operated a refinery on this
                cluster.{" "}
                <Link
                  href="/refinery/launch"
                  style={{ color: "var(--accent)" }}
                >
                  Launch one →
                </Link>
              </div>
            ) : (
              <table className="sof-w-tbl">
                <thead>
                  <tr>
                    <th>Token</th>
                    <th className="num">Pool remaining</th>
                    <th className="num">Holders claimed</th>
                    <th>Status</th>
                    <th>Launched</th>
                  </tr>
                </thead>
                <tbody>
                  {operatedRefineries.map((rf) => (
                    <tr key={rf.id}>
                      <td>
                        <Link
                          href={`/refinery/${rf.id}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            color: "inherit",
                            textDecoration: "none",
                          }}
                        >
                          <TokenMark
                            variant={rf.tokenMarkVariant}
                            symbol={rf.tokenSymbol}
                          />
                          <div>
                            <div
                              className="font-display"
                              style={{ fontWeight: 600 }}
                            >
                              {rf.tokenName}
                            </div>
                            <div className="fade">{rf.tokenSymbol}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="num">{formatTokens(rf.poolRemaining)}</td>
                      <td className="num">{rf.holdersClaimed}</td>
                      <td>
                        <StatusPill status={rf.status} />
                      </td>
                      <td className="fade">
                        {new Date(rf.launchedAtIso).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <aside className="sof-w-col-r">
          <div className="sof-w-panel">
            <div className="sof-w-panel-h">
              <h3>Reputation</h3>
              <span className="meta">v2 · since Mar 2026</span>
            </div>
            <div className="sof-w-gauge">
              <div className="ring">
                <svg viewBox="0 0 170 170" width="170" height="170">
                  <circle
                    cx="85"
                    cy="85"
                    r="74"
                    fill="none"
                    stroke="#262626"
                    strokeWidth="10"
                  />
                  <circle
                    cx="85"
                    cy="85"
                    r="74"
                    fill="none"
                    stroke="#F5A623"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE.toFixed(2)}
                    strokeDashoffset={FILL_OFFSET.toFixed(2)}
                  />
                </svg>
                <div className="v">
                  <span className="num">{REPUTATION}</span>
                  <span className="lab">/ 100</span>
                </div>
              </div>
              <div className="tier">Excellent</div>
              <div className="tier-bar">
                <div />
                <div />
                <div />
                <div className="on" />
                <div />
              </div>
              <div className="tier-labels">
                <span>Risk</span>
                <span>Caution</span>
                <span>Neutral</span>
                <span>Good</span>
                <span>Excellent</span>
              </div>
            </div>
            <div className="sof-w-brk">
              {[
                { k: "Claim consistency", bar: 88, v: "+22" },
                { k: "Operator behavior", bar: 92, v: "+24" },
                { k: "Token deployment trust", bar: 80, v: "+18" },
                { k: "Wallet age (380d)", bar: 60, v: "+12" },
                { k: "Snapshot consistency", bar: 50, v: "+8" },
              ].map((r) => (
                <div key={r.k} className="sof-w-brk-row">
                  <span className="k">{r.k}</span>
                  <span className="bar">
                    <i style={{ width: `${r.bar}%` }} />
                  </span>
                  <span className="v">{r.v}</span>
                </div>
              ))}
              <div
                className="sof-w-brk-row"
                style={{
                  borderTop: "1px solid var(--border-subtle)",
                  marginTop: 6,
                  paddingTop: 10,
                }}
              >
                <span className="k">Total</span>
                <span style={{ flex: 1 }} />
                <span
                  className="v"
                  style={{ color: "var(--accent)", fontSize: 14 }}
                >
                  84 / 100
                </span>
              </div>
            </div>
            <div style={{ padding: "0 20px 18px" }}>
              <Link href="/reputation" style={{ color: "var(--accent)", fontSize: 12 }}>
                How is this calculated? →
              </Link>
            </div>
          </div>

          <div className="sof-w-warning-card">
            <h5>⚠ Treat reputation as a signal, not a guarantee</h5>
            <p style={{ margin: 0 }}>
              Reputation reflects past on-chain behavior, not a guarantee of
              future actions. Always verify the underlying token and operator
              independently before participating.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
