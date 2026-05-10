import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developers",
  description:
    "Build on a verifiable claim layer for Solana. Indexer GraphQL, three SDKs, and four on-chain programs. Free tier covers most use cases.",
};

const ENDPOINTS: { method: "get" | "post" | "ws"; path: string; desc: string }[] = [
  { method: "get", path: "/v1/refineries", desc: "List or filter active refineries" },
  { method: "get", path: "/v1/refineries/:id/snapshots", desc: "Snapshot history with merkle roots" },
  { method: "get", path: "/v1/wallets/:pubkey/eligibility", desc: "Check claim eligibility for a wallet" },
  { method: "get", path: "/v1/wallets/:pubkey/reputation", desc: "Reputation score + breakdown" },
  { method: "post", path: "/v1/refineries", desc: "Launch a refinery (signed tx)" },
  { method: "post", path: "/v1/claims", desc: "Submit a claim (signed tx)" },
  { method: "ws", path: "/v1/stream/snapshots", desc: "Live snapshot stream · all refineries" },
  { method: "ws", path: "/v1/stream/claims/:refinery", desc: "Live claim feed for one refinery" },
];

const SDKS = [
  { nm: "@sof/sdk", lang: "TS", install: "$ npm i @sof/sdk", det: "TypeScript / JavaScript. Web-first, browser-safe. Wraps GraphQL + claim flow + wallet adapter integration." },
  { nm: "sof-py", lang: "PYTHON", install: "$ pip install sof-py", det: "Pythonic client for indexers, dashboards, scripts. Async-first. Solders-compatible." },
  { nm: "sof-rs", lang: "RUST", install: "$ cargo add sof-rs", det: "Server-side. For programs that need to verify claims on-chain or build operator tooling. Anchor 0.30 compatible." },
];

const GUIDES = [
  { num: "01", h: "Launch your first refinery", p: "End-to-end: from token mint to first claim. ~12 minutes." },
  { num: "02", h: "Embed a claim button on your site", p: "Drop-in React component for token-holder rewards. ~5 minutes." },
  { num: "03", h: "Build a leaderboard with the indexer", p: "Subscribe to claims, rank wallets by frequency. ~15 minutes." },
  { num: "04", h: "Verify a refinery's program on-chain", p: "Match deployed bytecode against the verified hash." },
  { num: "05", h: "Reputation oracle integration", p: "Read another wallet's reputation in your own program." },
  { num: "06", h: "Self-hosting the indexer", p: "Run the indexer locally for backtesting or private claims." },
];

export default function DevelopersPage() {
  return (
    <>
      <header className="sof-dv-hero">
        <div className="meta">DEVELOPER PORTAL</div>
        <h1>Build on a verifiable claim layer for Solana.</h1>
        <p>
          Indexer GraphQL, three SDKs, and four on-chain programs. Free tier
          covers most use cases. Programs are verified, source is public,
          claims are non-custodial.
        </p>
        <div className="cta-row">
          <a className="sof-btn sof-btn-primary">Read the docs →</a>
          <a className="sof-btn sof-btn-secondary">View on GitHub ↗</a>
          <a className="sof-btn sof-btn-secondary">Get an API key</a>
        </div>
      </header>

      <div className="sof-dv-body">
        <section className="sof-dv-section">
          <h3>Quickstart · 30 seconds to first query</h3>
          <p className="sub">
            Every refinery, snapshot, and claim is queryable through one
            endpoint. No auth required for read; sign-with-wallet for writes.
          </p>
          <div className="sof-dv-code-grid">
            <div className="sof-dv-code-card">
              <div className="head">
                <h4>Fetch active refineries</h4>
                <span className="lang">GRAPHQL</span>
              </div>
              <pre>
                <span className="com"># curl https://api.sof.xyz/v1/graphql</span>
                {"\n"}<span className="key">query</span> ActiveRefineries {"{"}
                {"\n  "}<span className="fn">refineries</span>(status: ACTIVE, first: <span className="ty">20</span>) {"{"}
                {"\n    "}<span className="key">id</span> token {"{ symbol mint }"}
                {"\n    pool { remaining "}<span className="key">total</span>{" }"}
                {"\n    snapshots(last: "}<span className="ty">5</span>{") {"}
                {"\n      merkleRoot holders takenAt"}
                {"\n    }"}
                {"\n    operator {"}
                {"\n      "}<span className="key">wallet</span>{" reputation"}
                {"\n      verified"}
                {"\n    }"}
                {"\n    closesAt"}
                {"\n  }"}
                {"\n}"}
              </pre>
            </div>
            <div className="sof-dv-code-card">
              <div className="head">
                <h4>Submit a claim</h4>
                <span className="lang">TS · @sof/sdk</span>
              </div>
              <pre>
                <span className="key">import</span>{" {"} <span className="fn">SOF</span>,{" "}
                <span className="ty">Cluster</span> {"} "}<span className="key">from</span>{" "}
                <span className="str">&quot;@sof/sdk&quot;</span>;
                {"\n\n"}<span className="key">const</span> sof ={" "}
                <span className="key">new</span> <span className="fn">SOF</span>({"{"} cluster:{" "}
                <span className="ty">Cluster</span>.MainnetBeta {"}"});
                {"\n\n"}<span className="com">// auto-detects eligibility from on-chain balance</span>
                {"\n"}<span className="key">const</span> proof ={" "}
                <span className="key">await</span> sof.<span className="fn">eligibility</span>({"{"}
                {"\n  refineryId: "}<span className="str">&quot;REF…3xQ&quot;</span>,
                {"\n  wallet: pubkey,"}
                {"\n}"});
                {"\n\n"}<span className="key">if</span> (proof.eligible) {"{"}
                {"\n  "}<span className="key">const</span> tx ={" "}
                <span className="key">await</span> sof.<span className="fn">claim</span>(proof);
                {"\n  "}<span className="key">await</span> wallet.<span className="fn">signAndSend</span>(tx);
                {"\n}"}
              </pre>
            </div>
          </div>
        </section>

        <section className="sof-dv-section">
          <h3>API endpoints</h3>
          <p className="sub">
            REST + GraphQL + WebSocket. Free tier: 50,000 requests / month per
            key. Pro tier: pay-as-you-go.
          </p>
          <div className="sof-dv-endpoints">
            {ENDPOINTS.map((e) => (
              <div key={e.path} className="sof-dv-ep-row">
                <span className={`m ${e.method}`}>{e.method.toUpperCase()}</span>
                <span className="path">{e.path}</span>
                <span className="desc">{e.desc}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="sof-dv-section">
          <h3>SDKs</h3>
          <p className="sub">
            Three first-party clients. All open-source, all support both web
            and Node. Rust SDK is server-only.
          </p>
          <div className="sof-dv-sdk-grid">
            {SDKS.map((s) => (
              <div key={s.nm} className="sof-dv-sdk-card">
                <div className="nm">
                  {s.nm}
                  <span className="lang">{s.lang}</span>
                </div>
                <div className="install">{s.install}</div>
                <div className="det">{s.det}</div>
                <a>API reference →</a>
              </div>
            ))}
          </div>
        </section>

        <section className="sof-dv-section">
          <h3>Guides</h3>
          <p className="sub">Walkthroughs covering the most common integrations.</p>
          <div className="sof-dv-guide-list">
            {GUIDES.map((g) => (
              <div key={g.num} className="sof-dv-guide">
                <span className="num">{g.num}</span>
                <div>
                  <h5>{g.h}</h5>
                  <p>{g.p}</p>
                </div>
                <span className="ml">→</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
