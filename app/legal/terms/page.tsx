import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of service",
  description:
    "Solana Oil Factory Terms of Service. Non-custodial. Operators are independent. Reputation is informational, not advice.",
};

export default function TermsPage() {
  return (
    <>
      <h1>Terms of service</h1>
      <div className="meta">v3.2 · effective Mar 1 2026 · supersedes all prior versions</div>

      <p>
        Welcome to Solana Oil Factory (&quot;SOF&quot;, &quot;we&quot;,
        &quot;us&quot;). By using this site, you agree to these terms. If you
        don&apos;t agree, don&apos;t use the service. Plain-language summary
        below; legal language follows.
      </p>

      <div className="callout">
        <b>Plain-language summary.</b> SOF is non-custodial — we never hold
        your tokens. Refinery operators are independent and unaffiliated with
        us. Reputation is informational, not advice. You&apos;re responsible
        for verifying any token before participating. Crypto is risky.
      </div>

      <h2>What this service is</h2>
      <p>
        SOF provides a web interface and indexing service over a set of
        public, audited on-chain programs that allow token operators to fund
        pools and token holders to claim from them. We do not operate those
        programs as a custodian; the programs run on Solana under their
        published addresses.
      </p>

      <h2>Non-custodial nature</h2>
      <p>
        SOF never takes custody of your tokens or your private keys. All
        claims, deposits, and refunds are executed by on-chain programs that
        you sign for directly with your wallet. We do not have, and cannot be
        compelled to produce, custody of any user&apos;s funds.
      </p>

      <h2>Operators are independent</h2>
      <p>
        Each refinery is created and funded by an independent third party
        (&quot;operator&quot;). SOF does not endorse, vet, or take
        responsibility for the actions of any operator. The &quot;verified
        deployer&quot; badge confirms only that the operator wallet matches
        the deploy authority of the underlying token; it is not a
        recommendation.
      </p>

      <h2>Reputation is informational</h2>
      <p>
        Reputation scores are computed from public on-chain history using the
        open methodology at{" "}
        <Link href="/reputation" style={{ color: "var(--accent)" }}>
          Reputation methodology
        </Link>
        . They are intended as a signal, not as financial or trust advice. A
        high reputation does not guarantee future behavior.
      </p>

      <h2>Risk acknowledgment</h2>
      <p>
        Crypto is risky. Refinery operators may close pools early, tokens may
        lose value, programs may have bugs despite audits, and the underlying
        Solana network may experience outages. By using the service you
        accept these risks.
      </p>
      <ul>
        <li>SOF makes no representation that any particular claim will succeed.</li>
        <li>SOF is not responsible for losses arising from operator behavior, token volatility, or network issues.</li>
        <li>Tax treatment of claims is your responsibility.</li>
      </ul>

      <h2>Prohibited use</h2>
      <p>
        You may not use SOF to launder funds, evade sanctions, or facilitate
        illegal activity. We may block IPs from sanctioned jurisdictions;
        this does not affect the underlying on-chain programs, which remain
        permissionless.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The Solana Oil Factory name, brand, and code are owned by Solana Oil
        Factory, Inc. Our on-chain programs are open-source under MIT.
        Forking and redeploying is allowed; using our brand is not.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, SOF&apos;s aggregate
        liability is limited to the platform fees you paid us in the 6
        months preceding any claim. This is not a substitute for
        understanding the risks of crypto.
      </p>

      <h2>Disputes</h2>
      <p>
        These terms are governed by the laws of the State of Delaware, USA.
        Disputes are resolved through binding arbitration in San Francisco,
        except for intellectual-property disputes which may be brought in any
        court of competent jurisdiction.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        We may update these terms; material changes are announced 30 days in
        advance via the in-app banner and an updated effective date here.
        Continued use constitutes acceptance.
      </p>

      <h2>Contact</h2>
      <p>
        Questions: <b>legal@solanaoilfactory.com</b>. Security disclosures:{" "}
        <b>security@solanaoilfactory.com</b> (PGP key on the{" "}
        <Link href="/trust" style={{ color: "var(--accent)" }}>
          Trust page
        </Link>
        ).
      </p>
    </>
  );
}
