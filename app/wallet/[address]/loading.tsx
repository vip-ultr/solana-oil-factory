export default function WalletLoading() {
  return (
    <>
      <header className="sof-w-hdr">
        <div className="sof-w-hdr-id">
          <div className="sof-w-sk-line" style={{ width: 220, height: 28 }} />
          <div className="sof-w-sk-line" style={{ width: 320, height: 16, marginTop: 12 }} />
        </div>
      </header>

      <div className="sof-w-kpi-strip">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="sof-w-kpi sof-w-sk-card">
            <div className="sof-w-sk-line" style={{ width: 70, height: 9 }} />
            <div className="sof-w-sk-line" style={{ width: 60, height: 24, marginTop: 8 }} />
            <div className="sof-w-sk-line" style={{ width: 100, height: 9, marginTop: 6 }} />
          </div>
        ))}
      </div>

      <div className="sof-w-body">
        <div className="sof-w-panel">
          <div className="sof-w-rep-grid">
            <div className="sof-w-rep-cell sof-w-rep-cell-gauge" style={{ textAlign: "center" }}>
              <div className="sof-w-sk-circle" />
              <div className="sof-w-sk-line" style={{ width: 80, height: 12, margin: "20px auto 0" }} />
              <div className="sof-w-sk-line" style={{ width: "100%", height: 4, marginTop: 16, borderRadius: 999 }} />
            </div>
            <div className="sof-w-rep-cell">
              <div className="sof-w-sk-line" style={{ width: 110, height: 10 }} />
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="sof-w-sk-line" style={{ width: "100%", height: 12, marginTop: 14 }} />
              ))}
            </div>
            <div className="sof-w-rep-cell">
              <div className="sof-w-sk-line" style={{ width: 140, height: 10 }} />
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="sof-w-sk-line" style={{ width: i % 2 ? "92%" : "78%", height: 10, marginTop: 10 }} />
              ))}
            </div>
          </div>
        </div>

        <div className="sof-w-panel sof-w-sk-panel">
          <div className="sof-w-sk-line" style={{ width: 180, height: 14 }} />
          <div className="sof-w-sk-line" style={{ width: "100%", height: 12, marginTop: 18 }} />
          <div className="sof-w-sk-line" style={{ width: "92%", height: 12, marginTop: 10 }} />
          <div className="sof-w-sk-line" style={{ width: "85%", height: 12, marginTop: 10 }} />
        </div>

        <div className="sof-w-panel sof-w-sk-panel">
          <div className="sof-w-sk-line" style={{ width: 220, height: 14 }} />
          <div className="sof-w-sk-block" style={{ marginTop: 16, height: 120 }} />
        </div>
      </div>
    </>
  );
}
