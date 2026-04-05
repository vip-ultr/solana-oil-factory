"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useWalletConnection } from "@solana/react-hooks";
import { SiSolana } from "react-icons/si";
import WalletConnectModal from "@/components/WalletConnectModal";
import SectionWrapper from "@/components/SectionWrapper";
import InfoBlock from "@/components/InfoBlock";
import StatCard from "@/components/StatCard";
import IntegrationCard from "@/components/IntegrationCard";
import BarrelHeroSection from "@/components/BarrelHeroSection";
import BarrelGrid from "@/components/BarrelGrid";
import LeaderboardTable from "@/components/LeaderboardTable";

interface LeaderboardEntry {
  wallet_address: string;
  crude: number;
  bags_crude: number;
  total_crude: number;
  oil_units: number;
  barrels: number;
  prestige_title: string;
}

const MEDALS = ["🥇", "🥈", "🥉"];

// Mock data for demo barrels
const DEMO_BARREL_FILLS = [45, 78, 23, 91, 56, 34, 67, 89];

export default function HomePage() {
  const router = useRouter();
  const { connected } = useWalletConnection();

  const [showConnectModal, setShowConnectModal] = useState(false);
  const openConnectModal = useCallback(() => setShowConnectModal(true), []);
  const closeConnectModal = useCallback(() => setShowConnectModal(false), []);

  const [topWallets, setTopWallets] = useState<LeaderboardEntry[]>([]);

  // Close connect modal when wallet connects
  useEffect(() => {
    if (connected) setShowConnectModal(false);
  }, [connected]);

  // Fetch top 3 leaderboard entries
  useEffect(() => {
    fetch("/api/leaderboard?limit=3")
      .then((res) => res.json())
      .then((json) => {
        if (json.leaderboard) {
          const enriched = json.leaderboard.map((entry: any) => ({
            wallet_address: entry.wallet_address,
            crude: entry.crude ?? 0,
            bags_crude: entry.bags_crude ?? 0,
            total_crude: entry.total_crude ?? 0,
            oil_units: entry.oil_units ?? 0,
            barrels: entry.barrels ?? 0,
            prestige_title: entry.prestige_title ?? "New Refiner",
          }));
          setTopWallets(enriched);
        }
      })
      .catch(() => {});
  }, []);

  function handleEnterRefinery() {
    router.push("/refinery");
  }

  return (
    <div className="page">
      <main className="home-main">

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* 1. HERO SECTION */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <section className="home-hero">
          <h1 className="home-hero-title">Solana Oil Factory</h1>
          <p className="home-hero-subtitle">Turn your wallet into an on-chain oil empire</p>
          <p className="home-hero-desc">
            Convert on-chain activity into oil, refine it into $CRUDE, and compete across a global leaderboard powered by real wallet behavior.
          </p>

          {/* Hero Stats */}
          <div className="hero-stats">
            <StatCard label="Wallets Refined" value="2,847" icon="⛏️" />
            <StatCard label="$CRUDE Produced" value="12.4M" icon="🛢️" />
            <StatCard label="Transactions Processed" value="847K" icon="⚙️" />
          </div>

          <button onClick={handleEnterRefinery} className="home-hero-cta">
            Enter Refinery
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </button>
        </section>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* 2. WHAT IS SOLANA OIL FACTORY */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <SectionWrapper
          title="What is Solana Oil Factory?"
          withDivider={true}
        >
          <InfoBlock>
            <p>
              Solana Oil Factory transforms on-chain wallet activity into a structured production system.
            </p>
            <p style={{ marginTop: "1.2em" }}>
              <strong>Every transaction becomes oil.</strong> Oil is processed into barrels. Barrels are refined into <strong>$CRUDE</strong>.
            </p>
            <p style={{ marginTop: "1.2em" }}>
              Multiple refineries analyze different types of activity — from raw transactions to launchpad participation — and combine them into a single production output.
            </p>
            <p style={{ marginTop: "1.2em" }}>
              The result is a unified system where activity becomes measurable, comparable, and competitive.
            </p>
          </InfoBlock>
        </SectionWrapper>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* 3. REFINERY NETWORK */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <SectionWrapper
          title="The Refinery Network"
          subtitle="Different sources of on-chain activity feed into independent refineries."
          withDivider={true}
        >
          <div className="refinery-grid">
            {/* Solana Refinery */}
            <div className="home-refinery-card">
              <div className="home-refinery-icon">
                <SiSolana size={32} style={{ color: "var(--accent)" }} />
              </div>
              <h3 className="home-refinery-name">Solana Refinery</h3>
              <p className="home-refinery-desc">Analyzes wallet transactions and converts them into oil units and barrels.</p>
              <div className="refinery-status refinery-status--active">Active</div>
            </div>

            {/* Bags Refinery */}
            <div className="home-refinery-card">
              <div className="home-refinery-icon">
                <img src="/bags-icon.png" alt="Bags" className="home-refinery-logo" />
              </div>
              <h3 className="home-refinery-name">Bags Refinery</h3>
              <p className="home-refinery-desc">Processes launchpad activity and swap behavior to generate additional refinery output.</p>
              <div className="refinery-status refinery-status--active">Active</div>
            </div>

            {/* Candle Refinery */}
            <div className="home-refinery-card home-refinery-card--disabled">
              <div className="home-refinery-icon">
                <img src="/candle-icon.png" alt="Candle" className="home-refinery-logo" />
              </div>
              <h3 className="home-refinery-name">Candle Refinery</h3>
              <p className="home-refinery-desc">Will analyze live streaming engagement and on-chain interaction data from Candle.</p>
              <div className="refinery-status refinery-status--coming">Coming Soon</div>
            </div>

            {/* Pump.fun Refinery */}
            <div className="home-refinery-card home-refinery-card--disabled">
              <div className="home-refinery-icon">
                <img src="/pumpfun-icon.png" alt="Pump.fun" className="home-refinery-logo" />
              </div>
              <h3 className="home-refinery-name">Pump.fun Refinery</h3>
              <p className="home-refinery-desc">Upcoming refinery focused on memecoin launch and trading activity.</p>
              <div className="refinery-status refinery-status--coming">Coming Soon</div>
            </div>

            {/* Bonk.fun Refinery */}
            <div className="home-refinery-card home-refinery-card--disabled">
              <div className="home-refinery-icon">
                <img src="/bonkfun-icon.png" alt="Bonk.fun" className="home-refinery-logo" />
              </div>
              <h3 className="home-refinery-name">Bonk.fun Refinery</h3>
              <p className="home-refinery-desc">Future integration for expanded launchpad analytics across the Solana ecosystem.</p>
              <div className="refinery-status refinery-status--coming">Coming Soon</div>
            </div>
          </div>
        </SectionWrapper>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* 4. HOW IT WORKS (DETAILED SYSTEM) */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <SectionWrapper
          title="How It Works"
          subtitle="A four-stage production system"
          withDivider={true}
        >
          <div className="system-blocks">
            <div className="system-block">
              <div className="system-block-label">A. Extraction</div>
              <p className="system-block-desc">
                Wallet transactions and on-chain actions are scanned and converted into oil units. Launchpad activity is analyzed separately through integrated refineries.
              </p>
            </div>

            <div className="system-block">
              <div className="system-block-label">B. Processing</div>
              <p className="system-block-desc">
                Oil units are grouped into barrels. Each barrel represents accumulated on-chain activity.
              </p>
            </div>

            <div className="system-block">
              <div className="system-block-label">C. Refinement</div>
              <p className="system-block-desc">
                Barrels are refined into $CRUDE. Refining is time-based and scales with production size. Whale protection ensures fair distribution with capped output.
              </p>
            </div>

            <div className="system-block">
              <div className="system-block-label">D. Output</div>
              <p className="system-block-desc">
                Refined $CRUDE determines your prestige title and leaderboard position. Higher activity results in higher production and ranking.
              </p>
            </div>
          </div>
        </SectionWrapper>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* 5. BARREL VISUALIZATION */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <SectionWrapper
          title="Production Visualization"
          subtitle="Your refinery output is visualized through dynamic oil barrels that fill based on your activity."
          withDivider={true}
        >
          {connected ? (
            <BarrelHeroSection fillPercentages={DEMO_BARREL_FILLS} totalBarrels={DEMO_BARREL_FILLS.length} />
          ) : (
            <InfoBlock>
              <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: "40px 20px" }}>
                Connect your wallet to see your production barrels.
              </p>
            </InfoBlock>
          )}
        </SectionWrapper>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* 6. REFINERY TIMER SYSTEM */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <SectionWrapper
          title="Time-Based Refining"
          withDivider={true}
        >
          <InfoBlock>
            <p>
              <strong>Refining is not instant.</strong>
            </p>
            <p style={{ marginTop: "1.2em" }}>
              Production is processed over time based on your total oil units. Larger production batches take longer to refine, with a capped maximum duration.
            </p>
            <p style={{ marginTop: "1.2em" }}>
              Users can optionally speed up refining to complete instantly.
            </p>
          </InfoBlock>
        </SectionWrapper>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* 7. $CRUDE ECONOMY */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <SectionWrapper
          title="The $CRUDE System"
          withDivider={true}
        >
          <InfoBlock>
            <p>
              <strong>$CRUDE is the final output of all refinery activity.</strong>
            </p>
            <p style={{ marginTop: "1.2em" }}>
              It represents your total processed on-chain production across all refineries.
            </p>
            <div style={{ marginTop: "2em", paddingLeft: "1.5em" }}>
              <p style={{ marginBottom: "0.8em" }}>
                <strong>$CRUDE determines:</strong>
              </p>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                <li style={{ marginBottom: "0.6em" }}>• Prestige titles</li>
                <li style={{ marginBottom: "0.6em" }}>• Leaderboard ranking</li>
                <li>• Future rewards and distributions</li>
              </ul>
            </div>
          </InfoBlock>
        </SectionWrapper>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* 8. LEADERBOARD PREVIEW */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <SectionWrapper
          title="Top Refiners"
          withDivider={true}
        >
          {topWallets.length > 0 ? (
            <>
              <LeaderboardTable entries={topWallets} />
              <div style={{ marginTop: "2em", textAlign: "center" }}>
                <Link href="/leaderboard" className="home-lb-cta">
                  View Full Leaderboard
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </>
          ) : (
            <p className="home-lb-empty">Loading leaderboard...</p>
          )}
        </SectionWrapper>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* 9. INTEGRATIONS / POWERED BY */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <SectionWrapper
          title="Powered By"
          withDivider={true}
        >
          <div className="integration-grid">
            <IntegrationCard
              name="Helius"
              description="Provides indexed transaction data for wallet activity analysis."
              icon="📊"
            />
            <IntegrationCard
              name="Bags"
              description="Supplies launchpad data and fee-based insights."
              icon="🎒"
            />
            <IntegrationCard
              name="Supabase"
              description="Handles leaderboard storage and analytics caching."
              icon="🗄️"
            />
            <IntegrationCard
              name="Vercel"
              description="Delivers fast and scalable deployment."
              icon="⚡"
            />
          </div>
        </SectionWrapper>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* 10. ROADMAP */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <SectionWrapper
          title="Expansion Roadmap"
          withDivider={true}
        >
          <div className="roadmap-list">
            <div className="roadmap-item">
              <span className="roadmap-bullet">→</span>
              <p>Pump.fun Refinery Integration</p>
            </div>
            <div className="roadmap-item">
              <span className="roadmap-bullet">→</span>
              <p>Bonk.fun Refinery Integration</p>
            </div>
            <div className="roadmap-item">
              <span className="roadmap-bullet">→</span>
              <p>Advanced Wallet Profiles</p>
            </div>
            <div className="roadmap-item">
              <span className="roadmap-bullet">→</span>
              <p>Multi-source Production Aggregation</p>
            </div>
            <div className="roadmap-item">
              <span className="roadmap-bullet">→</span>
              <p>$CRUDE Token Launch & Airdrop</p>
            </div>
          </div>
        </SectionWrapper>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* 11. FINAL CTA */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <section className="home-final-cta">
          <h2>Start Your Refinery</h2>
          <p>
            Connect your wallet and begin converting your on-chain activity into production.
          </p>
          <button onClick={handleEnterRefinery} className="home-hero-cta">
            Enter Refinery
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </button>
        </section>

      </main>

      <WalletConnectModal isOpen={showConnectModal} onClose={closeConnectModal} />
    </div>
  );
}
