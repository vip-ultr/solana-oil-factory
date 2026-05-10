import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Footer() {
  return (
    <footer className="sof-footer">
      <div className="sof-foot-trust">
        <span className="led" aria-hidden="true" />
        <b>All systems operational</b>
        <span className="sep">·</span>
        <span>
          Indexer{" "}
          <b className="font-mono" style={{ color: "var(--success)" }}>
            2s
          </b>{" "}
          behind
        </span>
        <span className="sep">·</span>
        <span>
          Devnet · Slot <span className="font-mono">298,442,019</span>
        </span>
        <span className="sep">·</span>
        <span>
          Audit by <b>OtterSec</b> · Mar 2026
        </span>
        <span className="sep">·</span>
        <span>
          Programs <b>verified</b> on-chain
        </span>
      </div>

      <div className="sof-foot-grid">
        <div className="sof-foot-brand">
          <div className="lg">
            <Image src="/logo.png" alt="" width={24} height={24} />
            <span className="word">Solana Oil Factory</span>
          </div>
          <p>
            Verifiable on-chain claim infrastructure for Solana token operators.
            Open-source, audited, non-custodial.
          </p>
        </div>

        <div className="sof-foot-col">
          <h5>Product</h5>
          <ul>
            <li>
              <Link href="/refineries">Refineries</Link>
            </li>
            <li>
              <Link href="/leaderboard">Leaderboard</Link>
            </li>
            <li>
              <Link href="/refinery/launch">Launch refinery</Link>
            </li>
            <li>
              <Link href="/dashboard">Dashboard</Link>
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
            <li>
              <a
                href="https://github.com/vip-ultr/solana-oil-factory"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
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
        <span>
          © 2026 Solana Oil Factory · Not financial advice · Operators are
          independent and unaffiliated with the platform.
        </span>
        <ThemeToggle />
      </div>
    </footer>
  );
}
