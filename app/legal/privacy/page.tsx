import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How Solana Oil Factory handles personal data. Wallets are pseudonymous; we collect only what's needed to operate the service.",
};

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy policy</h1>
      <div className="meta">v3.2 · effective Mar 1 2026</div>

      <p>
        Solana Oil Factory respects your privacy. We collect the minimum
        information needed to operate the service, never sell your data, and
        keep on-chain activity public-by-design.
      </p>

      <div className="callout">
        <b>Plain-language summary.</b> Connecting a wallet shares only your
        public address with us — no email, no name, no KYC. We log requests
        for rate limiting and abuse prevention. Cookies are functional only,
        not for ad tracking.
      </div>

      <h2>What we collect</h2>
      <p>
        We collect (1) your wallet&apos;s public address when you connect,
        (2) anonymized request logs (IP truncated to /24, user-agent,
        timestamp) for security, and (3) optional contact details if you
        submit a support ticket or sign up for an API key.
      </p>

      <h2>What we don&apos;t collect</h2>
      <ul>
        <li>Private keys, seed phrases, or signatures beyond what&apos;s required to authenticate.</li>
        <li>Real names, government IDs, or KYC info.</li>
        <li>Cross-site tracking pixels or third-party advertising cookies.</li>
        <li>Browsing history outside this domain.</li>
      </ul>

      <h2>How we use what we collect</h2>
      <p>
        Wallet addresses are stored to render your dashboard, compute your
        reputation, and surface refineries you&apos;re eligible for. Request
        logs are used only for abuse mitigation and are auto-deleted after 30
        days. Support tickets are deleted when the ticket is closed plus 90
        days.
      </p>

      <h2>On-chain data is public</h2>
      <p>
        Every claim, snapshot, refinery launch, and reputation calculation
        is recorded on Solana. Anyone can read them — that&apos;s how the
        service works. We don&apos;t add new privacy guarantees on top of
        what&apos;s public, nor do we hide what&apos;s already on-chain.
      </p>

      <h2>Cookies</h2>
      <p>
        Three functional cookies: theme preference (light/dark), connected
        wallet hint (last-used wallet for autoconnect), and ToS acceptance
        version. Set with <code>SameSite=Strict</code> and{" "}
        <code>Secure</code> attributes. No analytics cookies.
      </p>

      <h2>Third-party services</h2>
      <p>
        We use Helius for Solana RPC (request data: pubkey + IP). We use
        Vercel for hosting (request logs: standard server access logs). Both
        are bound by their own privacy policies, which we&apos;ve reviewed
        and consider acceptable for our use case.
      </p>

      <h2>Your rights</h2>
      <p>
        You can request export or deletion of any personal data tied to your
        wallet by emailing <b>privacy@solanaoilfactory.com</b>. We respond
        within 30 days. Note: on-chain data cannot be deleted — only your
        off-chain associations (e.g. support tickets, API keys).
      </p>

      <h2>Children</h2>
      <p>
        SOF is not intended for users under 18. We do not knowingly collect
        information from minors. If you believe a minor has connected, email{" "}
        <b>privacy@solanaoilfactory.com</b> and we will delete any associated
        records.
      </p>

      <h2>Jurisdiction</h2>
      <p>
        SOF operates from Delaware, USA. Regardless of your jurisdiction,
        these terms govern; you may have additional rights under your
        local privacy law (e.g. GDPR, CCPA), which we respect.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        Material changes are announced 30 days in advance. Effective date
        updates here.
      </p>

      <h2>Contact</h2>
      <p>
        Privacy questions: <b>privacy@solanaoilfactory.com</b>. Data
        protection officer: <b>dpo@solanaoilfactory.com</b>.
      </p>
    </>
  );
}
