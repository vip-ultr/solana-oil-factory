import { Eyebrow, ButtonLink } from "@/components/sof/primitives";
import { Flame, ArrowRight } from "lucide-react";

export function LaunchpadHero() {
  return (
    <header className="sof-lp-hero">
      <Eyebrow>Launchpad refining · pre-pivot product</Eyebrow>
      <h1>
        Turn your on-chain activity into <em>$CRUDE</em>.
      </h1>
      <p>
        Every Solana transaction makes oil. Every Bags launchpad swap makes
        more oil at a higher rate. Refine your oil to mint $CRUDE, claim a
        prestige title, and climb the leaderboard.
      </p>
      <div className="ctas">
        <ButtonLink href="#refine" variant="primary">
          <Flame size={16} aria-hidden="true" /> Start refining
        </ButtonLink>
        <ButtonLink href="#feed" variant="secondary">
          Recent Bags launches <ArrowRight size={14} />
        </ButtonLink>
      </div>
    </header>
  );
}
