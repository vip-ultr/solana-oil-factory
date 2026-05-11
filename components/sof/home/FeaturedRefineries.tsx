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

  // Prefer a refinery that actually has a populated pool for the hero
  // slot — featuring an empty refinery (0 of 0 initial) looks like the
  // site is broken. Falls back to the first refinery if none qualify.
  const populated = refineries.filter((r) => r.poolInitial > 0);
  const ordered = populated.length > 0 ? populated : refineries;
  const [hero, ...rest] = ordered.slice(0, 5);

  return (
    <section className="sof-home-s">
      <div className="inner">
        <div className="sof-home-section-head">
          <div>
            <h2 className="font-display">Featured refineries</h2>
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
              {r.poolInitial > 0 ? (
                <>
                  {formatTokens(r.poolRemaining)}
                  <small>
                    {r.tokenSymbol} · {fillPercent}% of{" "}
                    {formatTokens(r.poolInitial)} initial
                  </small>
                </>
              ) : (
                <span style={{ color: "var(--text-tertiary)" }}>—</span>
              )}
            </div>
          </div>
          {r.poolInitial > 0 && <Sparkline />}
        </div>

        <div className="sof-meta-grid">
          <div>
            <div className="k">Claim rate</div>
            <div className="v">
              {r.claimRatePer1Pct > 0
                ? `${formatTokens(r.claimRatePer1Pct)} / 1%`
                : "—"}
            </div>
          </div>
          <div>
            <div className="k">Eligible</div>
            <div className="v">
              {r.holdersEligible > 0
                ? `${r.holdersEligible.toLocaleString()} wallets`
                : "—"}
            </div>
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
            {r.poolInitial > 0 ? (
              <>
                {formatTokens(r.poolRemaining)} <small>{r.tokenSymbol}</small>
              </>
            ) : (
              <span style={{ color: "var(--text-tertiary)" }}>—</span>
            )}
          </span>
        </div>
        <div className="sof-kv">
          <span className="k">Rate / 1%</span>
          <span className="v">
            {r.claimRatePer1Pct > 0 ? formatTokens(r.claimRatePer1Pct) : "—"}
          </span>
        </div>
        <div className="sof-kv">
          <span className="k">{isClosing ? "Closes in" : "Snapshot"}</span>
          <span
            className="v"
            style={isClosing ? { color: "var(--warning)" } : undefined}
          >
            {isClosing
              ? `${r.claimWindowDaysLeft}d`
              : r.snapshotAgeSeconds > 0
                ? formatRelativeTime(r.snapshotAgeSeconds)
                : "—"}
          </span>
        </div>
        {r.poolInitial > 0 && (
          <div style={{ marginTop: 10 }}>
            <PoolBar remaining={r.poolRemaining} initial={r.poolInitial} />
          </div>
        )}
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
