import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { ButtonLink } from "@/components/sof/primitives";
import type { Refinery } from "@/lib/mock-data";

interface HeroProps {
  /** Top refinery to feature in the status card. Null when no
   *  refinery has launched on this cluster yet. */
  featured: Refinery | null;
  /** Active refinery count from on-chain. */
  activeCount: number;
  /** Total refineries ever launched on this cluster. */
  totalCount: number;
}

export function HeroSection({ featured, activeCount, totalCount }: HeroProps) {
  return (
    <section className="sof-home-hero">
      <div className="sof-home-hero-grid">
        <div>
          <span className="sof-home-eyebrow">
            <span className="pulse" aria-hidden="true" />
            <span>
              <b>Devnet live</b> · v1 mainnet candidate
            </span>
          </span>

          <h1 className="sof-home-h1">
            Where real holders get <em>rewarded.</em>
          </h1>

          <p className="sof-home-sub">
            Permissionless token distribution for Solana. Operators reward
            verified holders, and every claim builds on-chain reputation.
          </p>

          <div className="sof-home-cta">
            <ButtonLink href="/refineries" variant="primary">
              Browse refineries <ArrowRight size={16} />
            </ButtonLink>
            <ButtonLink href="/refinery/launch" variant="secondary">
              Launch a refinery
            </ButtonLink>
          </div>

          <div className="sof-home-trust-micro">
            <span className="dot" aria-hidden="true" />
            <span>No registration</span>
            <span className="sep" aria-hidden="true">·</span>
            <span>No whitelist</span>
            <span className="sep" aria-hidden="true">·</span>
            <span>Verified on-chain</span>
          </div>
        </div>

        <div className="sof-hero-status">
          <div className="sof-hero-status-glow" aria-hidden="true" />

          <div className="sof-hero-status-eyebrow">
            <span className="pulse" aria-hidden="true" />
            <span>LIVE PLATFORM</span>
          </div>

          <div className="sof-hero-status-stat">
            <div className="num">{activeCount}</div>
            <div className="lab">
              Active {activeCount === 1 ? "refinery" : "refineries"} on devnet
            </div>
          </div>

          <div className="sof-hero-status-meta">
            <div className="row">
              <span className="k">Total launched</span>
              <span className="v">{totalCount}</span>
            </div>
            <div className="row">
              <span className="k">Network</span>
              <span className="v">Devnet</span>
            </div>
            <div className="row">
              <span className="k">Audit</span>
              <span className="v">Pending</span>
            </div>
          </div>

          {featured && (
            <Link
              href={`/refinery/${featured.id}`}
              className="sof-hero-status-feat"
            >
              <span className="k">Featured</span>
              <span className="v">{featured.tokenSymbol}</span>
              <ArrowUpRight size={13} strokeWidth={2} aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
