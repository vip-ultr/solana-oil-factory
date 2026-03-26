"use client";

import { useState } from "react";

interface BagsFeedToken {
  name: string;
  symbol: string;
  image: string;
  tokenMint: string;
  description?: string;
  twitter?: string;
  website?: string;
}

interface BagsPanelProps {
  bagsActive: boolean;
}

export default function BagsPanel({ bagsActive }: BagsPanelProps) {
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
          <p className="panel-label bags-panel-label">Bags Feed</p>
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
              Trade on <a href="https://bags.fm" target="_blank" rel="noopener noreferrer" className="bags-inline-link">Bags</a> to generate refinery output.
            </p>
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
          Recent Launches
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
                <div key={token.tokenMint} className="bags-feed-card">
                  {/* Top row: token identity + socials */}
                  <div className="bags-feed-card-main">
                    <a
                      href={`https://bags.fm/${token.tokenMint}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bags-feed-card-identity"
                    >
                      {token.image && (
                        <img
                          src={token.image}
                          alt={token.symbol}
                          className="bags-feed-card-img"
                          width={32}
                          height={32}
                        />
                      )}
                      <div className="bags-feed-card-info">
                        <span className="bags-feed-card-name">{token.name}</span>
                        <span className="bags-feed-card-symbol">${token.symbol}</span>
                      </div>
                    </a>

                    {/* Social links */}
                    <div className="bags-feed-card-socials">
                      {token.twitter && (
                        <a
                          href={token.twitter.startsWith("http") ? token.twitter : `https://x.com/${token.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bags-feed-social-link"
                          title="Twitter / X"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        </a>
                      )}
                      {token.website && (
                        <a
                          href={token.website.startsWith("http") ? token.website : `https://${token.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bags-feed-social-link"
                          title="Website"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M2 12h20" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                          </svg>
                        </a>
                      )}
                      <a
                        href={`https://bags.fm/${token.tokenMint}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bags-feed-social-link bags-feed-social-link--bags"
                        title="View on Bags"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    </div>
                  </div>

                  {/* Description — desktop only */}
                  {token.description && (
                    <p className="bags-feed-card-desc">{token.description}</p>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}
