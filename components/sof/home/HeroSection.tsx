import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/sof/primitives";
import { BarrelGauge } from "./BarrelGauge";
import type { Refinery } from "@/lib/mock-data";
import { formatTokens } from "@/lib/mock-data";

interface HeroProps {
  /** Top refinery to feature in the barrel gauge. Null when no
   *  refinery has launched on this cluster yet. */
  featured: Refinery | null;
  /** Active refinery count from on-chain. */
  activeCount: number;
}

export function HeroSection({ featured, activeCount }: HeroProps) {
  const fillPercent =
    featured && featured.poolInitial > 0
      ? Math.round((featured.poolRemaining / featured.poolInitial) * 100)
      : 0;

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
            Permissionless token distribution on Solana. Operators launch
            refineries. Holders claim their share. Reputation builds with
            every claim.
          </p>

          <div className="sof-home-cta">
            <ButtonLink href="/refineries" variant="primary">
              Browse refineries <ArrowRight size={16} />
            </ButtonLink>
            <ButtonLink href="/refinery/launch" variant="secondary">
              Launch a refinery
            </ButtonLink>
          </div>

          <div className="sof-home-metric-strip">
            <span>
              <b>{activeCount}</b> active refineries
            </span>
            {/* Aggregate counters (tokens distributed, unique
                holders, verified operators) require an off-chain
                indexer to compute across every claim and
                refinery. Hidden until the indexer ships in v1.1
                rather than fabricated. */}
          </div>
        </div>

        {featured ? (
          <BarrelGauge
            fillPercent={fillPercent}
            arcLabel={`POOL · ${featured.tokenSymbol} · FEATURED`}
            tags={[
              {
                position: "tl",
                label: "POOL REMAINING",
                value: `${formatTokens(featured.poolRemaining)} ${featured.tokenSymbol}`,
              },
              {
                position: "tr",
                label: `${fillPercent}%`,
                pinLabel: "FILLED",
                value: `of ${formatTokens(featured.poolInitial)} initial`,
              },
              {
                position: "bl",
                label: "HOLDERS CLAIMED",
                value:
                  featured.holdersEligible > 0
                    ? `${featured.holdersClaimed.toLocaleString()} / ${featured.holdersEligible.toLocaleString()}`
                    : `${featured.holdersClaimed.toLocaleString()} so far`,
              },
              {
                position: "br",
                label:
                  featured.claimWindowDaysLeft === null
                    ? "WINDOW"
                    : "WINDOW LEFT",
                value:
                  featured.claimWindowDaysLeft === null
                    ? "Open-ended"
                    : `${featured.claimWindowDaysLeft}d`,
              },
            ]}
          />
        ) : (
          <BarrelGauge
            fillPercent={0}
            arcLabel="NO ACTIVE REFINERIES"
            tags={[
              {
                position: "tl",
                label: "POOL REMAINING",
                value: "—",
              },
              {
                position: "tr",
                label: "0%",
                pinLabel: "FILLED",
                value: "no refinery yet",
              },
              {
                position: "bl",
                label: "HOLDERS CLAIMED",
                value: "—",
              },
              {
                position: "br",
                label: "STATUS",
                value: "Awaiting first launch",
              },
            ]}
          />
        )}
      </div>
    </section>
  );
}
