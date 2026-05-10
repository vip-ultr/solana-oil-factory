import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/sof/primitives";
import { BarrelGauge } from "./BarrelGauge";
import { MOCK_REFINERIES, MOCK_SYSTEM_STATS, formatTokens } from "@/lib/mock-data";

export function HeroSection() {
  const featured = MOCK_REFINERIES[0]; // BONK
  const fillPercent = Math.round((featured.poolRemaining / featured.poolInitial) * 100);
  const stats = MOCK_SYSTEM_STATS;

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
              <b>{stats.refineriesActive}</b> active refineries
            </span>
            <span className="sep">·</span>
            <span>
              <b>1.84M</b> tokens distributed
            </span>
            <span className="sep">·</span>
            <span>
              <b>327</b> unique holders
            </span>
            <span className="sep">·</span>
            <span>
              <b>6</b> verified operators
            </span>
          </div>
        </div>

        <BarrelGauge
          fillPercent={fillPercent}
          arcLabel="POOL · BONK · REFINERY #1"
          tags={[
            {
              position: "tl",
              label: "POOL REMAINING",
              value: `${formatTokens(featured.poolRemaining)} BONK`,
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
              value: `${featured.holdersClaimed.toLocaleString()} / ${featured.holdersEligible.toLocaleString()}`,
            },
            {
              position: "br",
              label: "NEXT SNAPSHOT",
              value: "00:51:24",
            },
          ]}
        />
      </div>
    </section>
  );
}
