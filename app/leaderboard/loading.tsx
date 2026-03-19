export default function LeaderboardLoading() {
  return (
    <div className="page">
      <main className="main">
        <div className="lb-header">
          <div className="barrel-hero-header">
            <h2 className="barrel-hero-title">Global Leaderboard</h2>
            <div className="barrel-hero-rule" />
          </div>
          <p className="lb-subtitle">
            Wallets are ranked by CRUDE produced. <br />
            Leaderboard is updated whenever a wallet joins the refinery.
          </p>
        </div>

        <div className="lb-skeleton-wrap">
          {/* Header row */}
          <div className="lb-skeleton-header">
            <div className="lb-skeleton-cell lb-skeleton-cell--rank" />
            <div className="lb-skeleton-cell lb-skeleton-cell--wallet" />
            <div className="lb-skeleton-cell lb-skeleton-cell--crude" />
            <div className="lb-skeleton-cell lb-skeleton-cell--title" />
          </div>
          {/* Skeleton rows */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="lb-skeleton-row" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="lb-skeleton-cell lb-skeleton-cell--rank">
                <div className="lb-skeleton-block" />
              </div>
              <div className="lb-skeleton-cell lb-skeleton-cell--wallet">
                <div className="lb-skeleton-block" style={{ width: "70%" }} />
              </div>
              <div className="lb-skeleton-cell lb-skeleton-cell--crude">
                <div className="lb-skeleton-block" style={{ width: "55%", marginLeft: "auto" }} />
              </div>
              <div className="lb-skeleton-cell lb-skeleton-cell--title">
                <div className="lb-skeleton-block lb-skeleton-block--badge" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
