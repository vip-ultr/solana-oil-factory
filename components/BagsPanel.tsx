"use client";

import { useState } from "react";

interface BagsFeedToken {
  name: string;
  symbol: string;
  image: string;
  tokenMint: string;
}

interface BagsPanelProps {
  bagsActive: boolean;
  totalFeesSol: number;
  bonusCrude: number;
}

export default function BagsPanel({ bagsActive, totalFeesSol, bonusCrude }: BagsPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [feed, setFeed] = useState<BagsFeedToken[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedLoaded, setFeedLoaded] = useState(false);

  const handleToggleFeed = async () => {
    const next = !expanded;
    setExpanded(next);

    // Lazy-load feed on first expand
    if (next && !feedLoaded) {
      setFeedLoading(true);
      try {
        const res = await fetch("/api/bags/feed");
        const json = await res.json();
        setFeed(json.feed ?? []);
      } catch {
        setFeed([]);
      } finally {
        setFeedLoading(false);
        setFeedLoaded(true);
      }
    }
  };

  return (
    <section className="bags-section">
      <div className="panel bags-panel">
        <div className="bags-panel-header">
          <img src="/bags-icon.png" alt="Bags" className="bags-panel-icon" />
          <p className="panel-label bags-panel-label">Bags Refinery Data</p>
        </div>

        {bagsActive ? (
          <div className="bags-status bags-status-active">
            <svg
              className="bags-check-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span>Active on Bags</span>
          </div>
        ) : (
          <div className="bags-status bags-status-inactive">
            <p className="bags-inactive-title">No refinery activity detected.</p>
            <p className="bags-inactive-hint">
              Trade on <a href="https://bags.fm" target="_blank" rel="noopener noreferrer" className="bags-inline-link">Bags</a> to earn fee rewards and unlock bonus CRUDE.
            </p>
          </div>
        )}

        {bagsActive && (
          <div className="bags-output">
            <p className="bags-output-line">
              Refinery Output:{" "}
              <span className="bags-output-value">
                {totalFeesSol.toFixed(totalFeesSol < 0.01 ? 6 : 2)} SOL
              </span>
            </p>
            {bonusCrude > 0 && (
              <p className="bags-output-line bags-output-bonus">
                Bonus CRUDE:{" "}
                <span className="bags-output-value">+{bonusCrude.toLocaleString()}</span>
              </p>
            )}
          </div>
        )}

        {/* Collapsible feed */}
        <button className="bags-feed-toggle" onClick={handleToggleFeed}>
          <svg
            className={`bags-chevron${expanded ? " bags-chevron--open" : ""}`}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          Recent Launch Activity
        </button>

        {expanded && (
          <div className="bags-feed-list">
            {feedLoading && (
              <p className="bags-feed-loading">Loading...</p>
            )}
            {!feedLoading && feed.length === 0 && feedLoaded && (
              <p className="bags-feed-empty">No recent launches</p>
            )}
            {!feedLoading &&
              feed.map((token) => (
                <a
                  key={token.tokenMint}
                  href={`https://bags.fm/${token.tokenMint}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bags-feed-item"
                >
                  {token.image && (
                    <img
                      src={token.image}
                      alt={token.symbol}
                      className="bags-feed-item-img"
                      width={20}
                      height={20}
                    />
                  )}
                  <span className="bags-feed-item-name">{token.name}</span>
                  <span className="bags-feed-item-symbol">${token.symbol}</span>
                </a>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}
