import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import {
  ButtonLink,
  Eyebrow,
  ServiceDegradedBanner,
  StatusPill,
} from "@/components/sof/primitives";
import { MOCK_SYSTEM_STATS, formatUsd } from "@/lib/mock-data";

export default function HomePage() {
  const stats = MOCK_SYSTEM_STATS;

  return (
    <>
      <ServiceDegradedBanner lagSeconds={stats.indexerLagSeconds} />

      <section
        style={{
          padding: "48px 64px 40px",
          borderBottom: "1px solid var(--border-subtle)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(var(--grid-line) 1px,transparent 1px),linear-gradient(90deg,var(--grid-line) 1px,transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 75% 40%,#000 0%,transparent 75%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: "1.2fr .8fr",
            gap: 48,
            alignItems: "center",
            maxWidth: 1280,
          }}
        >
          <div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 11px 5px 8px",
                borderRadius: 9999,
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                fontSize: 12,
                color: "var(--text-secondary)",
                marginBottom: 28,
                fontWeight: 500,
              }}
            >
              <Sparkles size={12} style={{ color: "var(--accent)" }} />
              <span>
                Permissionless Solana token distribution ·{" "}
                <strong style={{ color: "var(--text-primary)" }}>
                  {stats.refineriesActive} active
                </strong>
              </span>
            </span>

            <h1
              className="font-display"
              style={{
                fontWeight: 600,
                fontSize: 60,
                lineHeight: 1.02,
                letterSpacing: "-0.035em",
                margin: "0 0 18px",
                maxWidth: "14ch",
              }}
            >
              Where real holders get{" "}
              <em style={{ fontStyle: "normal", color: "var(--accent)" }}>
                rewarded.
              </em>
            </h1>

            <p
              className="muted"
              style={{
                fontSize: 19,
                lineHeight: 1.55,
                maxWidth: "54ch",
                margin: "0 0 36px",
              }}
            >
              Solana Oil Factory is the reputation layer for Solana. Operators
              distribute tokens to verified-active holders. Every refinery you
              participate in builds your wallet&apos;s score, used by every
              operator after you.
            </p>

            <div style={{ display: "flex", gap: 14, marginBottom: 28 }}>
              <ButtonLink href="/refineries" variant="primary">
                Browse refineries <ArrowRight size={16} />
              </ButtonLink>
              <ButtonLink href="/refinery/launch" variant="secondary">
                Launch a refinery
              </ButtonLink>
            </div>

            <div
              className="muted"
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 20,
                fontSize: 13,
              }}
            >
              <span>
                Powered by{" "}
                <strong
                  className="font-mono"
                  style={{ color: "var(--text-primary)", fontWeight: 500 }}
                >
                  Helius
                </strong>
              </span>
              <span style={{ color: "var(--text-disabled)" }}>·</span>
              <span>
                Audited by{" "}
                <strong style={{ color: "var(--text-primary)" }}>OtterSec</strong>
              </span>
              <span style={{ color: "var(--text-disabled)" }}>·</span>
              <span>
                <strong
                  className="font-mono"
                  style={{ color: "var(--text-primary)", fontWeight: 500 }}
                >
                  {stats.walletsVerified.toLocaleString("en-US")}
                </strong>{" "}
                wallets verified
              </span>
              <span style={{ color: "var(--text-disabled)" }}>·</span>
              <span>
                <strong
                  className="font-mono"
                  style={{ color: "var(--text-primary)", fontWeight: 500 }}
                >
                  {formatUsd(stats.lifetimeDistributedUsd)}
                </strong>{" "}
                distributed lifetime
              </span>
            </div>
          </div>

          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1/1",
              maxWidth: 300,
              marginLeft: "auto",
              display: "grid",
              placeItems: "center",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: "28%",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 50% 50%, rgba(245,166,35,.20), transparent 65%)",
                filter: "blur(8px)",
              }}
            />
            <Image
              src="/assets/barrel.png"
              alt=""
              width={485}
              height={780}
              priority
              style={{
                position: "relative",
                height: "38%",
                width: "auto",
                zIndex: 2,
                filter: "drop-shadow(0 10px 16px rgba(0,0,0,.5))",
              }}
            />
          </div>
        </div>
      </section>

      {/* Foundation status — temporary, removed once full home lands */}
      <section
        style={{
          padding: "48px 64px",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ maxWidth: 1280 }}>
          <Eyebrow>Build status</Eyebrow>
          <h2
            className="font-display"
            style={{
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              margin: "12px 0",
            }}
          >
            Foundation in place. Full pages landing next.
          </h2>
          <p
            className="muted"
            style={{ fontSize: 15, maxWidth: "60ch", margin: "0 0 24px" }}
          >
            Design tokens, sidebar chrome, footer trust strip, theme toggle,
            shared primitives, and the typed mock-data layer are wired. The
            full Home, Refineries directory, Single Refinery, Launch wizard,
            Dashboard, and the rest of the 20 routes land in subsequent
            commits.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <StatusPill status="active" />
            <StatusPill status="pendingSnapshot" />
            <StatusPill status="closingSoon" />
            <StatusPill status="operatorPaused" />
            <StatusPill status="closed" />
          </div>
        </div>
      </section>
    </>
  );
}
