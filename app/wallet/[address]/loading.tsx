export default function WalletLoading() {
  return (
    <div className="page">
      <main className="main">
        {/* Address header skeleton */}
        <div className="wl-skeleton-header">
          <div className="lb-skeleton-block" style={{ width: "160px", height: "22px" }} />
          <div className="lb-skeleton-block lb-skeleton-block--badge" style={{ width: "72px" }} />
        </div>

        {/* Barrel section skeleton */}
        <div className="barrel-hero-section">
          <div className="barrel-hero-header">
            <h2 className="barrel-hero-title">Oil Barrels</h2>
            <div className="barrel-hero-rule" />
          </div>
          <div className="wl-skeleton-barrels">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="wl-skeleton-barrel" style={{ animationDelay: `${i * 60}ms` }} />
            ))}
          </div>
        </div>

        {/* Panel skeletons */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="panel wl-skeleton-panel" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="lb-skeleton-block" style={{ width: "120px", height: "12px", marginBottom: "20px" }} />
            <div className="wl-skeleton-grid">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="wl-skeleton-stat">
                  <div className="lb-skeleton-block" style={{ width: "50%", height: "10px", marginBottom: "8px" }} />
                  <div className="lb-skeleton-block" style={{ width: "75%", height: "18px" }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
