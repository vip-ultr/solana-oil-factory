import type { Metadata } from "next";
import { ReputationChip, WalletPill } from "@/components/sof/primitives";

export const metadata: Metadata = {
  title: "Reputation methodology",
  description:
    "How Solana Oil Factory computes wallet reputation. A 0–100 score derived entirely from public on-chain history. Open-source — verify the calculation yourself.",
};

const TOC = [
  { id: "what", label: "What it measures" },
  { id: "formula", label: "The formula" },
  { id: "tiers", label: "5 tiers" },
  { id: "components", label: "Components" },
  { id: "examples", label: "Worked examples" },
  { id: "caveats", label: "Caveats & limits" },
  { id: "changelog", label: "Versions" },
];

const TIERS = [
  { name: "Risk", range: "0–24", desc: "Recently flagged, closed-early operator, or evident sybil" },
  { name: "Caution", range: "25–44", desc: "Limited history or one negative event" },
  { name: "Neutral", range: "45–59", desc: "Default starting tier — no signal either way" },
  { name: "Good", range: "60–79", desc: "Consistent claimer or operator with good track record" },
  { name: "Excellent", range: "80–100", desc: "Long-running, verified, consistent across many cycles" },
];

const COMPONENTS = [
  { letter: "C", name: "Claim consistency", weight: "25%", desc: "Streak of consecutive claims when eligible. Missing a claim does not penalize, but reduces uplift.", source: "refinery program logs", range: "0–25" },
  { letter: "O", name: "Operator behavior", weight: "25%", desc: "Refineries closed without notice, paused without resume, or refunded incomplete pools count negatively.", source: "refinery state transitions", range: "−15…+25" },
  { letter: "T", name: "Token deployment trust", weight: "20%", desc: "Whether the wallet deployed the token, has renounced authorities, sufficient liquidity, etc.", source: "SPL mint metadata + RugCheck feed", range: "0–20" },
  { letter: "A", name: "Wallet age", weight: "15%", desc: "Days since first observed transaction. Logarithmic — diminishing returns past 365 days.", source: "helius first-tx timestamp", range: "0–15" },
  { letter: "S", name: "Snapshot consistency", weight: "15%", desc: "For operators: ratio of snapshots delivered on schedule. For holders: presence at consecutive snapshots.", source: "indexer · merkle history", range: "0–15" },
];

const EXAMPLES = [
  { wallet: "Hxk2…7gPZ", c: 22, o: 24, t: 18, a: 12, s: 8, total: 84, tier: "excellent" as const, label: "Excellent" },
  { wallet: "4Bsd…91jU", c: 18, o: 14, t: 12, a: 14, s: 9, total: 67, tier: "good" as const, label: "Good" },
  { wallet: "9wF7…3Lz8", c: 8, o: -4, t: 10, a: 6, s: 4, total: 24, tier: "risky" as const, label: "Risk" },
];

export default function ReputationPage() {
  return (
    <div className="sof-doc">
      <aside className="sof-doc-toc">
        <h6>On this page</h6>
        <ul>
          {TOC.map((t, i) => (
            <li key={t.id}>
              <a href={`#${t.id}`} className={i === 0 ? "on" : undefined}>
                {t.label}
              </a>
            </li>
          ))}
        </ul>
      </aside>

      <article className="sof-doc-main">
        <header className="sof-doc-hdr">
          <div className="meta">Methodology · v2.1 · Updated Mar 8 2026</div>
          <h1>How reputation is calculated</h1>
          <p className="lead">
            A 0–100 score derived entirely from public on-chain history. Same
            inputs always yield the same score. Open-source — verify the
            calculation yourself or run it locally.
          </p>
        </header>

        <section id="what">
          <h2>What it measures <span className="nm">PRINCIPLES</span></h2>
          <p>
            Reputation is a <b>signal of past on-chain behavior</b>, not a
            vouch. It tells you whether a wallet has shown up consistently to
            claim, distributed predictably as an operator, and held tokens
            long enough to demonstrate intent — all measurable from chain
            state.
          </p>
          <p>What it intentionally does <b>not</b> use:</p>
          <ul>
            <li>Off-chain identity (Twitter, Discord, KYC). Those introduce platform dependence.</li>
            <li>USD value of holdings — a wallet&apos;s worth says nothing about its trustworthiness.</li>
            <li>Manual moderation, allowlists, or admin overrides. Score is deterministic.</li>
          </ul>
        </section>

        <section id="formula">
          <h2>The formula <span className="nm">DETERMINISTIC</span></h2>
          <p>
            Score is a weighted sum of five components, each normalized 0–1,
            scaled to 0–100, and clamped:
          </p>
          <div className="sof-doc-formula">
            score = 100 × ( <span className="v">w₁</span>·C +{" "}
            <span className="v">w₂</span>·O + <span className="v">w₃</span>·T +{" "}
            <span className="v">w₄</span>·A + <span className="v">w₅</span>·S )<br />
            <span className="c">where w = (0.25, 0.25, 0.20, 0.15, 0.15) and Σwᵢ = 1.0</span>
          </div>
          <p>
            Components: <b>C</b> = claim consistency, <b>O</b> = operator
            behavior, <b>T</b> = token-deployment trust, <b>A</b> = wallet age,{" "}
            <b>S</b> = snapshot consistency. Definitions in the next section.
          </p>
        </section>

        <section id="tiers">
          <h2>5 tiers <span className="nm">DISPLAY</span></h2>
          <p>
            The numeric score is displayed alongside one of five tiers. Tiers
            are styled consistently across the platform — same color, same
            shape — so you learn to read them at a glance.
          </p>
          <div className="sof-doc-tiers">
            {TIERS.map((t) => (
              <div key={t.name} className="sof-doc-tier">
                <div className="top" />
                <div className="nm">{t.name}</div>
                <div className="rng">{t.range}</div>
                <div className="desc">{t.desc}</div>
              </div>
            ))}
          </div>
          <p>
            New wallets start at <b>Neutral (50)</b>, not zero. Reputation
            accrues with activity; it doesn&apos;t punish absence.
          </p>
        </section>

        <section id="components">
          <h2>Components <span className="nm">5 INPUTS</span></h2>
          <table className="sof-doc-brk-tbl">
            <thead>
              <tr>
                <th>Component</th>
                <th>Weight</th>
                <th>Source</th>
                <th className="num">Range</th>
              </tr>
            </thead>
            <tbody>
              {COMPONENTS.map((c) => (
                <tr key={c.letter}>
                  <td>
                    <b>
                      {c.letter} — {c.name}
                    </b>
                    <div
                      style={{
                        color: "var(--text-tertiary)",
                        fontSize: 11.5,
                        marginTop: 3,
                      }}
                    >
                      {c.desc}
                    </div>
                  </td>
                  <td>
                    <span className="sof-rep-chip neutral">{c.weight}</span>
                  </td>
                  <td>
                    <code>{c.source}</code>
                  </td>
                  <td className="num">{c.range}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section id="examples">
          <h2>Worked examples <span className="nm">3 WALLETS</span></h2>
          <p>To make this concrete, here&apos;s how three real wallets break down:</p>
          <table className="sof-doc-brk-tbl">
            <thead>
              <tr>
                <th>Wallet</th>
                <th className="num">C</th>
                <th className="num">O</th>
                <th className="num">T</th>
                <th className="num">A</th>
                <th className="num">S</th>
                <th className="num">Total</th>
                <th>Tier</th>
              </tr>
            </thead>
            <tbody>
              {EXAMPLES.map((e) => (
                <tr key={e.wallet}>
                  <td>
                    <WalletPill address={e.wallet} />
                  </td>
                  <td className="num">{e.c}</td>
                  <td className={e.o < 0 ? "num neg" : "num"}>{e.o}</td>
                  <td className="num">{e.t}</td>
                  <td className="num">{e.a}</td>
                  <td className="num">{e.s}</td>
                  <td className="num">
                    <b>{e.total}</b>
                  </td>
                  <td>
                    <ReputationChip score={e.total} tier={e.tier} prefix="" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            The third wallet&apos;s negative O reflects an operator who closed
            a refinery 3 days early without resuming. Their score is recoverable
            — successful operations restore the deduction over ~6 months.
          </p>
        </section>

        <section id="caveats">
          <h2>Caveats &amp; limits <span className="nm">READ THIS</span></h2>
          <div className="sof-doc-callout">
            <h4>⚠ Reputation is not a guarantee</h4>
            <p>
              A high score reflects past behavior, not future intent. Always
              verify the underlying token (mint authority, liquidity,
              top-holder concentration) before participating in any refinery —
              regardless of operator score.
            </p>
          </div>
          <ul>
            <li>
              <b>Sybil resistance is partial.</b> A motivated attacker can age
              multiple wallets in parallel. Reputation favors single,
              long-running wallets but does not solve sybil.
            </li>
            <li>
              <b>Score lags by ~1 epoch.</b> Reputation updates at the end of
              each refinery&apos;s claim window, not in real-time. Recent
              activity may not be reflected for up to 7 days.
            </li>
            <li>
              <b>Operator behavior weights more than holder behavior.</b>{" "}
              Closing a pool early or pausing without resume is treated as a
              signal, intentionally — at the cost of operators who legitimately
              need to close (e.g. exploit response).
            </li>
            <li>
              <b>Token trust (T) is partly external.</b> If RugCheck adjusts a
              token&apos;s score, your operator reputation reflects that within
              24h.
            </li>
          </ul>
        </section>

        <section id="changelog">
          <h2>Versions <span className="nm">CHANGELOG</span></h2>
          <table className="sof-doc-brk-tbl">
            <thead>
              <tr>
                <th>Version</th>
                <th>Released</th>
                <th>Changes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>v2.1</b></td>
                <td>Mar 8 2026</td>
                <td>Added snapshot consistency component (S). Reduced wallet age weight 20% → 15%.</td>
              </tr>
              <tr>
                <td>v2.0</td>
                <td>Jan 12 2026</td>
                <td>Five-component model. New tier names. Public methodology (this doc).</td>
              </tr>
              <tr>
                <td>v1.0</td>
                <td>Sep 2 2025</td>
                <td>Initial three-component model (claim count, age, deployment).</td>
              </tr>
            </tbody>
          </table>
          <p style={{ marginTop: 18 }}>
            <a style={{ color: "var(--accent)", cursor: "pointer" }}>
              Source code (github.com/sof/reputation) ↗
            </a>{" "}
            — verify the calculation, file issues, propose changes via PR.
          </p>
        </section>
      </article>
    </div>
  );
}
