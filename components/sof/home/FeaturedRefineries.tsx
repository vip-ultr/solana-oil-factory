import {
  ButtonLink,
  StatusPill,
  TokenMark,
  VerifiedBadge,
} from "@/components/sof/primitives";
import { PoolBar } from "@/components/sof/primitives";
import { formatTokens, formatRelativeTime } from "@/lib/mock-data";
import type { Refinery } from "@/lib/mock-data";

interface Props {
  refineries: Refinery[];
}

export function FeaturedRefineries({ refineries }: Props) {
  if (refineries.length === 0) return null;

  // Hero card + up to 4 compact cards.
  const [hero, ...rest] = refineries.slice(0, 5);

  return (
    <section className="sof-home-s">
      <div className="inner">
        <div className="sof-home-section-head">
          <div>
            <div className="meta">§02 / Live refineries</div>
            <h2 className="font-display">Featured.</h2>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span className="muted" style={{ fontSize: 13 }}>
              Newest first · live from devnet
            </span>
            <ButtonLink href="/refineries" variant="secondary">
              View all {refineries.length} →
            </ButtonLink>
          </div>
        </div>

        <div className="sof-feat-grid">
          <HeroCard refinery={hero} />
          {rest.map((r) => (
            <CompactCard key={r.id} refinery={r} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HeroCard({ refinery: r }: { refinery: Refinery }) {
  const fillPercent =
    r.poolInitial > 0 ? Math.round((r.poolRemaining / r.poolInitial) * 100) : 0;
  return (
    <div className="sof-feat-card hero-card">
      <div className="head">
        <div className="h-l">
          <TokenMark
            variant={r.tokenMarkVariant}
            symbol={r.tokenSymbol}
            size={48}
            logoUrl={r.logoUrl}
          />
          <div>
            <div className="name">{r.tokenName}</div>
            <div className="sym">
              {r.tokenSymbol} · {r.tokenMint}
            </div>
          </div>
        </div>
        <div className="pillrow">
          <StatusPill status={r.status} />
          <VerifiedBadge tier={r.verification} />
        </div>
      </div>

      <div className="body">
        <div className="sof-pool-block">
          <div>
            <div className="tiny" style={{ textTransform: "uppercase", letterSpacing: "0.1em" }}>
              POOL REMAINING
            </div>
            <div className="sof-pool-num">
              {formatTokens(r.poolRemaining)}
              <small>
                {r.tokenSymbol} · {fillPercent}% of {formatTokens(r.poolInitial)} initial
              </small>
            </div>
          </div>
          <Sparkline />
        </div>

        <div className="sof-meta-grid">
          <div>
            <div className="k">Claim rate</div>
            <div className="v">{formatTokens(r.claimRatePer1Pct)} / 1%</div>
          </div>
          <div>
            <div className="k">Eligible</div>
            <div className="v">{r.holdersEligible.toLocaleString()} wallets</div>
          </div>
          <div>
            <div className="k">Closes</div>
            <div className="v">
              {r.claimWindowDaysLeft === null
                ? "Open-ended"
                : `${r.claimWindowDaysLeft}d left`}
            </div>
          </div>
        </div>
      </div>

      <div className="foot">
        <span className="sof-foot-meta">
          Last snapshot {formatRelativeTime(r.snapshotAgeSeconds)} · #
          {r.holdersClaimed > 0 ? Math.ceil(r.holdersClaimed / 100) : 1}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <ButtonLink
            href={`/refinery/${r.id}`}
            variant="miniGhost"
          >
            Details
          </ButtonLink>
          <ButtonLink
            href={`/refinery/${r.id}?action=claim`}
            variant="miniPrimary"
          >
            Check eligibility
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

function CompactCard({ refinery: r }: { refinery: Refinery }) {
  const fillPercent =
    r.poolInitial > 0 ? Math.round((r.poolRemaining / r.poolInitial) * 100) : 0;
  const isClosing = r.status === "closingSoon";
  return (
    <div className="sof-feat-card">
      <div className="head">
        <div className="h-l">
          <TokenMark
            variant={r.tokenMarkVariant}
            symbol={r.tokenSymbol}
            logoUrl={r.logoUrl}
          />
          <div>
            <div className="name">{r.tokenName}</div>
            <div className="sym">
              {r.tokenSymbol} · {r.tokenMint}
            </div>
          </div>
        </div>
        <StatusPill status={r.status} />
      </div>

      <div className="body">
        <div className="sof-kv">
          <span className="k">Pool</span>
          <span className="v">
            {formatTokens(r.poolRemaining)} <small>{r.tokenSymbol}</small>
          </span>
        </div>
        <div className="sof-kv">
          <span className="k">Rate / 1%</span>
          <span className="v">{formatTokens(r.claimRatePer1Pct)}</span>
        </div>
        <div className="sof-kv">
          <span className="k">{isClosing ? "Closes in" : "Snapshot"}</span>
          <span
            className="v"
            style={isClosing ? { color: "var(--warning)" } : undefined}
          >
            {isClosing
              ? `${r.claimWindowDaysLeft}d`
              : formatRelativeTime(r.snapshotAgeSeconds)}
          </span>
        </div>
        <div style={{ marginTop: 10 }}>
          <PoolBar remaining={r.poolRemaining} initial={r.poolInitial} />
        </div>
      </div>

      <div className="foot">
        <span
          className="sof-foot-meta"
          style={
            r.verification === "unverified"
              ? { color: "var(--warning)" }
              : undefined
          }
        >
          {r.verification === "verifiedDeployer"
            ? "Verified deployer"
            : r.verification === "verifiedCto"
              ? "Verified CTO"
              : "Unverified operator"}
        </span>
        <ButtonLink
          href={`/refinery/${r.id}`}
          variant={
            r.status === "active" || r.status === "closingSoon"
              ? "miniPrimary"
              : "miniGhost"
          }
        >
          {fillPercent > 0 && r.status !== "closed" ? "Claim" : "View"}
        </ButtonLink>
      </div>
    </div>
  );
}

function Sparkline() {
  return (
    <svg
      className="sof-spark"
      viewBox="0 0 140 60"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sofSpark1" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#F5A623" stopOpacity="0.4" />
          <stop offset="1" stopColor="#F5A623" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0,8 L18,12 L36,18 L54,16 L72,28 L90,30 L108,40 L126,46 L140,52 L140,60 L0,60 Z"
        fill="url(#sofSpark1)"
      />
      <path
        d="M0,8 L18,12 L36,18 L54,16 L72,28 L90,30 L108,40 L126,46 L140,52"
        stroke="#F5A623"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}
