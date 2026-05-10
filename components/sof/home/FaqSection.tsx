import Link from "next/link";

const FAQS: { q: string; a: React.ReactNode; defaultOpen?: boolean }[] = [
  {
    q: "What is a refinery?",
    a: "A refinery is a permissionless, program-owned escrow holding tokens that an operator wants to distribute to verified holders. Each refinery has a configured claim rate, snapshot cadence, and window. Once launched, it operates without operator custody — claims are settled by the on-chain program against a published merkle root.",
    defaultOpen: true,
  },
  {
    q: "How do I know a refinery is legitimate?",
    a: (
      <>
        Look for the <code>Verified Deployer</code> badge — these refineries
        are operated by the wallet that minted the token. Beyond that, every
        refinery exposes a Token Trust Report (RugCheck score, mint authority,
        freeze authority, transfer fee), and the operator&apos;s wallet shows
        public reputation and history.
      </>
    ),
  },
  {
    q: "What does Verified Deployer mean?",
    a: "The wallet launching the refinery is the same wallet that minted the token. We verify this on-chain at launch — no off-chain attestation. Verified CTO is a separate path for community takeovers, applied for off-chain.",
  },
  {
    q: "How is reputation calculated?",
    a: "Six on-chain signals weighted: refineries claimed (25%), average holding duration (20%), tokens held >7d post-claim (20%), cluster status (15%), wallet age (10%), refineries launched as verified deployer (10%). Recomputed daily. Methodology is fully public.",
  },
  {
    q: "Why are you on devnet only?",
    a: "v1 is undergoing audit, and program upgrade authority is gated behind a Squads multisig. Tokens distributed on devnet have no real-world value. Mainnet launch follows audit completion.",
  },
  {
    q: "How do I withdraw my tokens after closing a refinery?",
    a: "When the claim window closes (or you close it manually), undistributed tokens become withdrawable from your operator dashboard. The withdraw transaction is a single signed instruction to the refinery's escrow PDA.",
  },
];

const PlusIcon = (
  <svg
    className="icn"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export function FaqSection() {
  return (
    <section className="sof-home-s">
      <div className="inner" style={{ maxWidth: 920 }}>
        <div
          className="sof-home-section-head"
          style={{ marginBottom: 24 }}
        >
          <div>
            <div className="meta">§04 / Common questions</div>
            <h2 className="font-display">FAQ.</h2>
          </div>
          <Link href="/help" className="sof-btn-mini ghost">
            Visit help center →
          </Link>
        </div>

        <div className="sof-faq">
          {FAQS.map((item) => (
            <details key={item.q} open={item.defaultOpen}>
              <summary>
                {item.q}
                {PlusIcon}
              </summary>
              <div className="answer">{item.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
