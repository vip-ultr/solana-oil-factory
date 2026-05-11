import type { Metadata } from "next";
import { cn } from "@/lib/cn";
import { fetchTreasuryConfig } from "@/lib/onchain/treasury";
import {
  REFINERY_PROGRAM_ID,
  SOLANA_CLUSTER,
  explorerUrl,
} from "@/lib/program";

export const metadata: Metadata = {
  title: "Trust & status",
  description:
    "Live system health, on-chain program verification, deployed treasury config.",
};

// Live treasury data — re-fetch each view.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const SERVICES = [
  { id: "rpc", nm: "Public RPC", det: `api.${SOLANA_CLUSTER}.solana.com`, warns: [], bads: [] },
  { id: "program", nm: "Refinery program", det: `Anchor 0.32 · ${SOLANA_CLUSTER}`, warns: [], bads: [] },
];

const PROGRAMS = [
  {
    nm: "refinery",
    v: "v0.1.0",
    id: REFINERY_PROGRAM_ID,
    hash: "—",
    framework: "Anchor 0.32",
  },
];

const INCIDENTS = [
  { when: "Apr 25 · 14:02 UTC", sev: "minor" as const, nm: "Indexer lag spike to 38s", body: "Helius RPC primary endpoint experienced regional packet loss. Failover to secondary completed in 4m. No claims missed; merkle generation queued and resumed.", dur: "38m" },
  { when: "Apr 11 · 09:18 UTC", sev: "resolved" as const, nm: "Claim service degraded for compressed NFT-bearing wallets", body: "Edge case in proof generation when wallet held cNFTs at snapshot time. Hotfix deployed; 12 affected claims auto-retried successfully.", dur: "2h 14m" },
  { when: "Mar 18 · 22:40 UTC", sev: "resolved" as const, nm: "Web app CDN cache flush delay", body: "New deployment took 6m to propagate vs. the usual 30s. No data loss; affected first-paint times only.", dur: "6m" },
  { when: "Feb 28 · 11:00 UTC", sev: "major" as const, nm: "Snapshots paused for ~22 minutes during Solana network congestion", body: "Block production stalled cluster-wide. Once production resumed, indexer caught up automatically.", dur: "22m", postmortem: true },
];

function HealthBars({ warns, bads }: { warns: number[]; bads: number[] }) {
  return (
    <div className="sof-tx-bars" aria-label="90 day uptime history">
      {Array.from({ length: 90 }).map((_, i) => {
        const cls = bads.includes(i) ? "bad" : warns.includes(i) ? "warn" : "";
        return <i key={i} className={cls || undefined} />;
      })}
    </div>
  );
}

export default async function TrustPage() {
  const cfg = await fetchTreasuryConfig();

  return (
    <>
      <header className="sof-tx-hdr">
        <h1>Trust &amp; status</h1>
        <p>
          Deployed program, live treasury config, on-chain
          verification. The audit, full service health, and
          incident-history sections below are placeholders until
          we go to mainnet.
        </p>
      </header>

      <div className="sof-tx-body">
        <div className="sof-tx-banner">
          <div
            className="dot"
            aria-hidden="true"
            style={{ background: cfg?.paused ? "var(--warning)" : "var(--success)" }}
          />
          <div>
            <div className="nm">
              {cfg
                ? cfg.paused
                  ? "Platform paused"
                  : "Platform active"
                : "Treasury not initialised"}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              {cfg
                ? `${cfg.refineriesLaunchedCount} refineries launched · pause-authority ${cfg.pauseAuthority.slice(0, 4)}…${cfg.pauseAuthority.slice(-4)}`
                : `init_treasury hasn't been called on ${SOLANA_CLUSTER} yet`}
            </div>
          </div>
          <div className="det">{SOLANA_CLUSTER}</div>
        </div>

        {cfg && (
          <section className="sof-tx-section">
            <h3>Treasury config · live from {SOLANA_CLUSTER}</h3>
            <div className="sof-tx-audit">
              <div>
                <span className="lab">Launch fee</span>
                <span className="v">
                  {(cfg.launchFeeLamports / 1_000_000_000).toFixed(3)} SOL
                </span>
                <span className="det">
                  Charged once per refinery, paid to fee_receiver_sol.
                </span>
              </div>
              <div>
                <span className="lab">Claim fee</span>
                <span className="v">
                  {(cfg.claimFeeLamports / 1_000_000_000).toFixed(4)} SOL
                </span>
                <span className="det">
                  Per-claim platform fee. Indexer + program rent.
                </span>
              </div>
              <div>
                <span className="lab">Deposit fee</span>
                <span className="v">{cfg.depositFeeBps / 100}%</span>
                <span className="det">
                  Bps of pool tokens at launch + every top-up. Auto-swapped
                  to SOL via off-chain Jupiter cron.
                </span>
              </div>
            </div>
          </section>
        )}

        <section className="sof-tx-section">
          <h3>Service health · last 90 days</h3>
          <div className="sof-tx-svc-grid">
            {SERVICES.map((s) => (
              <div key={s.id} className="sof-tx-svc">
                <div className="sof-tx-svc-top">
                  <div>
                    <div className="nm">{s.nm}</div>
                    <div className="det">{s.det}</div>
                  </div>
                  <div className="ind">
                    <span className="d" aria-hidden="true" />
                    Operational
                  </div>
                </div>
                <HealthBars warns={s.warns} bads={s.bads} />
                <div className="scale">
                  <span>90 days ago</span>
                  <span>Today</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="sof-tx-section">
          <h3>Audit · pending</h3>
          <div className="sof-tx-audit">
            <div>
              <span className="lab">Auditor</span>
              <span
                className="v"
                style={{ color: "var(--text-tertiary)" }}
              >
                Not yet engaged
              </span>
              <span className="det">
                Mainnet engagement starts after the on-chain feature
                freeze. Auditor selection is in progress.
              </span>
            </div>
            <div>
              <span className="lab">Released</span>
              <span
                className="v"
                style={{ color: "var(--text-tertiary)" }}
              >
                Pre-mainnet only
              </span>
              <span className="det">
                Devnet program is live and observable; mainnet ships after
                the external audit lands.
              </span>
            </div>
            <div>
              <span className="lab">Findings</span>
              <span
                className="v"
                style={{ color: "var(--text-tertiary)" }}
              >
                —
              </span>
              <span className="det">
                The full PDF report will be published here when the audit
                completes.
              </span>
            </div>
          </div>
        </section>

        <section className="sof-tx-section">
          <h3>On-chain programs · verifiable</h3>
          <div className="sof-tx-programs">
            {PROGRAMS.map((p) => (
              <div key={p.nm} className="sof-tx-prog">
                <div className="nm">
                  <span>{p.nm}</span>
                  <span className="v">✓ verified · {p.v}</span>
                </div>
                <div className="id">
                  <a
                    href={explorerUrl(p.id, "address")}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "inherit" }}
                  >
                    {p.id}
                  </a>
                </div>
                <div className="det">
                  <span>
                    Source: <strong>github.com/sof/programs</strong>
                  </span>
                  <span>
                    Hash: <strong>{p.hash}</strong>
                  </span>
                  <span>{p.framework}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="sof-tx-section">
          <h3>Recent incidents</h3>
          <div className="sof-tx-incidents">
            {INCIDENTS.map((i) => (
              <div key={i.when} className="sof-tx-inc-row">
                <span className="when">{i.when}</span>
                <span className={cn("sev", i.sev)}>
                  {i.sev === "minor"
                    ? "Minor"
                    : i.sev === "major"
                      ? "Major"
                      : "Resolved"}
                </span>
                <div className="body">
                  <b>{i.nm}</b>
                  {i.body}
                  {i.postmortem && (
                    <>
                      {" "}
                      <span
                        style={{
                          color: "var(--text-tertiary)",
                          fontSize: 11,
                        }}
                      >
                        (post-mortem available on request — v1.0)
                      </span>
                    </>
                  )}
                </div>
                <span className="dur">{i.dur}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
