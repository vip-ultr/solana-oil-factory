import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, Wallet, Factory, Star, Shield, Code2, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Help",
  description:
    "Most questions answered. For protocol-level issues check Trust & status; for code, the developer docs.",
};

const CATEGORIES = [
  { Icon: HelpCircle, h: "Getting started", p: "What's a refinery? How to claim. First-time wallet setup.", count: "14 articles" },
  { Icon: Wallet, h: "Claiming", p: "How eligibility is detected. Why a claim might fail. Fees explained.", count: "22 articles" },
  { Icon: Factory, h: "Operating a refinery", p: "Launching, funding, top-ups, pause/resume, closing.", count: "31 articles" },
  { Icon: Star, h: "Reputation", p: "How it's calculated. How to improve. What it doesn't measure.", count: "9 articles" },
  { Icon: Shield, h: "Security & trust", p: "Audit, programs, what we can and can't do.", count: "11 articles" },
  { Icon: Code2, h: "Developers & API", p: "SDK install, GraphQL queries, webhooks, rate limits.", count: "55 articles" },
];

const FAQS = [
  { q: "How is my eligibility determined?", a: "Eligibility is checked entirely on-chain at snapshot time. If your wallet held the underlying token at the most recent snapshot, you're eligible — no registration, no allowlist. The snapshot's merkle root is published on-chain, so anyone can independently verify your inclusion." },
  { q: "What does it cost to claim?", a: "A small claim fee (typically 0.001 SOL) covers indexer + program rent. The Solana network fee for the transaction itself is ~0.000005 SOL. There is no platform percentage taken from your claim amount." },
  { q: "Why did my claim fail with \"proof unavailable\"?", a: "The claim service is briefly unable to compute your merkle proof — usually a transient indexer issue. Eligibility is unchanged. Refresh in 30s, or leave the page open and we'll auto-retry. If it persists for >10 minutes, check our status page." },
  { q: "Can I run a refinery for a token I didn't deploy?", a: "Yes — these are called CTO (community takeover) refineries. They display an \"unverified deployer\" badge and have elevated trust requirements. The underlying token's holders still benefit; they just see a clearer signal that the operator isn't the original team." },
  { q: "What happens if an operator closes a refinery early?", a: "Tokens already claimed remain with claimers. Unclaimed tokens are returned to the operator. The operator's reputation takes a deduction in the O (operator behavior) component, recoverable over ~6 months of consistent operations." },
  { q: "Are pool funds custodial?", a: "No. Pool tokens are escrowed in a program-derived account (PDA) controlled only by the on-chain refinery program. Solana Oil Factory has no key, no override, no ability to seize funds. The only spend paths are claims by holders or returns at the end of the claim window." },
];

export default function HelpPage() {
  return (
    <>
      <header className="sof-hp-hero">
        <h1>How can we help?</h1>
        <p>
          Most questions answered below. For protocol-level issues check{" "}
          <Link href="/trust" style={{ color: "var(--accent)" }}>Trust &amp; status</Link>;
          for code questions, the{" "}
          <Link href="/developers" style={{ color: "var(--accent)" }}>developer docs</Link>.
        </p>
        <div className="sof-hp-search">
          <Search size={18} strokeWidth={1.8} style={{ color: "var(--text-tertiary)" }} aria-hidden="true" />
          <input placeholder="Search 142 articles…" />
          <span className="kbd">⌘K</span>
        </div>
      </header>

      <div className="sof-hp-body">
        <section>
          <div className="sof-hp-cat-grid">
            {CATEGORIES.map((c) => (
              <div key={c.h} className="sof-hp-cat">
                <div className="ic">
                  <c.Icon size={18} strokeWidth={1.6} aria-hidden="true" />
                </div>
                <h4>{c.h}</h4>
                <p>{c.p}</p>
                <div className="count">
                  <span>{c.count}</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="sof-hp-faq">
          <h3>Frequently asked</h3>
          <div className="sof-hp-faq-list">
            {FAQS.map((f, i) => (
              <details key={f.q} className="sof-hp-faq-item" open={i === 0}>
                <summary>
                  <span className="q">{f.q}</span>
                  <span className="ic">+</span>
                </summary>
                <div className="a">{f.a}</div>
              </details>
            ))}
          </div>
        </section>

        <section>
          <div className="sof-hp-contact">
            <div>
              <h4>Still need help?</h4>
              <p>
                For protocol-level questions, prefer Discord — most answers
                come within minutes from operators or the core team.
              </p>
              <div className="ch">
                <span className="nm">✉ support@solanaoilfactory.com</span>
                <span className="det">
                  ~6h response · for issues with claims, your account, or
                  refineries you operate.
                </span>
              </div>
            </div>
            <div>
              <h4>Community</h4>
              <p>
                Public discussions and live status updates from the core team
                and operators.
              </p>
              <div className="ch">
                <span className="nm">💬 Discord · 4,820 members</span>
                <span className="det">#claim-help · #operators · #devs</span>
              </div>
              <div className="ch" style={{ marginTop: 14 }}>
                <span className="nm">𝕏 @solanaoilfactory</span>
                <span className="det">Outage notices and protocol updates.</span>
              </div>
              <div className="ch" style={{ marginTop: 14 }}>
                <span className="nm">⚠ Security disclosures</span>
                <span className="det">
                  security@solanaoilfactory.com · PGP key on Trust page
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
