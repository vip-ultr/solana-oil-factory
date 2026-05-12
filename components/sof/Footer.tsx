import Image from "next/image";
import Link from "next/link";
import { FaXTwitter, FaDiscord, FaGithub } from "react-icons/fa6";

// TODO — replace these with your actual handles when ready. The
// icons + structure are wired; only the href values need to change.
const SOCIAL_LINKS = [
  {
    key: "x",
    label: "Follow on X",
    href: "https://x.com/",
    Icon: FaXTwitter,
  },
  {
    key: "discord",
    label: "Join the Discord",
    href: "https://discord.gg/",
    Icon: FaDiscord,
  },
  {
    key: "github",
    label: "View source on GitHub",
    href: "https://github.com/vip-ultr/solana-oil-factory",
    Icon: FaGithub,
  },
] as const;

export function Footer() {
  return (
    <footer className="sof-footer">
      <div className="sof-foot-trust">
        <span className="led" aria-hidden="true" />
        <b>Devnet</b>
        <span className="sep">·</span>
        <span>Audit pending</span>
        <span className="sep">·</span>
        <span>Not financial advice</span>
      </div>

      <div className="sof-foot-grid">
        <div className="sof-foot-brand">
          <div className="lg">
            <Image src="/logo.png" alt="" width={24} height={24} />
            <span className="word">Solana Oil Factory</span>
          </div>
          <p>
            Verifiable on-chain claim infrastructure for Solana token operators.
            Non-custodial · live on devnet · audit pending.
          </p>

          <div className="sof-foot-social" aria-label="Community">
            {SOCIAL_LINKS.map(({ key, label, href, Icon }) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="sof-foot-social-btn"
                aria-label={label}
                title={label}
              >
                <Icon aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        <div className="sof-foot-col">
          <h5>Product</h5>
          <ul>
            <li>
              <Link href="/refineries">Refineries</Link>
            </li>
            <li>
              <Link href="/refinery/launch">Launch refinery</Link>
            </li>
            <li>
              <Link href="/wallet">Profile</Link>
            </li>
          </ul>
        </div>

        <div className="sof-foot-col">
          <h5>Trust</h5>
          <ul>
            <li>
              <Link href="/trust">Audit reports</Link>
            </li>
            <li>
              <Link href="/trust">Status page</Link>
            </li>
            <li>
              <Link href="/trust">Programs on-chain</Link>
            </li>
            <li>
              <Link href="/reputation">Reputation methodology</Link>
            </li>
          </ul>
        </div>

        <div className="sof-foot-col">
          <h5>Developers</h5>
          <ul>
            <li>
              <Link href="/developers">Docs</Link>
            </li>
            <li>
              <Link href="/developers">SDK</Link>
            </li>
            <li>
              <Link href="/developers">API reference</Link>
            </li>
          </ul>
        </div>

        <div className="sof-foot-col">
          <h5>Company</h5>
          <ul>
            <li>
              <a>Blog</a>
            </li>
            <li>
              <a>Brand</a>
            </li>
            <li>
              <Link href="/legal/terms">Terms</Link>
            </li>
            <li>
              <Link href="/legal/privacy">Privacy</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="sof-foot-bottom">
        <span className="legal">
          © 2026 Solana Oil Factory · Not financial advice · Operators are
          independent and unaffiliated with the platform.
        </span>
      </div>
    </footer>
  );
}
