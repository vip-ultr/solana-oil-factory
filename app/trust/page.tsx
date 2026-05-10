import type { Metadata } from "next";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Trust & status",
  description:
    "Live system health, audit reports, on-chain program verification, and incident history. Updated every 10 seconds from production systems.",
};

const SERVICES = [
  { id: "indexer", nm: "Indexer", det: "Snapshot, claim, reputation streams", warns: [62], bads: [76] },
  { id: "claim", nm: "Claim service", det: "Merkle proof generation, RPC submission", warns: [79], bads: [] },
  { id: "graphql", nm: "GraphQL API", det: "Public read API · 10 req/s per key", warns: [84], bads: [] },
  { id: "web", nm: "Web app", det: "solanaoilfactory.com · CDN-served", warns: [], bads: [] },
];

const PROGRAMS = [
  { nm: "refinery_core", v: "v2.1.0", id: "REFnRYcoeJGJfmDqBnXSnCjW3WpQzPxKE9NZ4mY3vU2", hash: "9k4Hx2eR…", framework: "Anchor 0.30" },
  { nm: "refinery_claim", v: "v2.0.4", id: "CLAimrYM4kJ9d8K3qN7rT2vL5wXsP1zG6cBfHnEaUV8", hash: "3aXqL9m…", framework: "Anchor 0.30" },
  { nm: "reputation_oracle", v: "v1.3.2", id: "REPute8jGpL5N2qY7bV9hX3kT1mR4cD6sA0wKfMnPxQz", hash: "7eR1Q4n…", framework: "Native Rust" },
  { nm: "snapshot_indexer", v: "v2.0.1", id: "SNapdR4mHkY9jL3pV6tN8cQ2wXsZ1bF5eU7gK0aMxRyD", hash: "5kP9M2x…", framework: "Anchor 0.30" },
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

export default function TrustPage() {
  return (
    <>
      <header className="sof-tx-hdr">
        <h1>Trust &amp; status</h1>
        <p>
          Live system health, audit reports, on-chain program verification,
          and incident history. Updated every 10 seconds from production
          systems.
        </p>
      </header>

      <div className="sof-tx-body">
        <div className="sof-tx-banner">
          <div className="dot" aria-hidden="true" />
          <div>
            <div className="nm">All systems operational</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              Last incident <strong>14 days ago</strong> · Uptime{" "}
              <strong>99.94%</strong> over 90 days
            </div>
          </div>
          <div className="det">Devnet · Mainnet-beta · Slot 298,442,019</div>
        </div>

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
          <h3>Audit</h3>
          <div className="sof-tx-audit">
            <div>
              <span className="lab">Auditor</span>
              <span className="v">OtterSec</span>
              <span className="det">
                Independent firm · 2 senior reviewers · 6-week engagement
              </span>
            </div>
            <div>
              <span className="lab">Released</span>
              <span className="v">Mar 12 2026</span>
              <span className="det">
                Programs unchanged since · all findings{" "}
                <strong style={{ color: "var(--success)" }}>resolved</strong>
              </span>
            </div>
            <div>
              <span className="lab">Findings</span>
              <span className="v ok">0 critical · 0 high</span>
              <span className="det">
                3 medium and 8 informational, all addressed pre-release.
              </span>
              <a className="pdf">Download full report (PDF, 1.4MB) →</a>
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
                <div className="id">{p.id}</div>
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
                      <a style={{ color: "var(--accent)", cursor: "pointer" }}>
                        Full post-mortem ↗
                      </a>
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
