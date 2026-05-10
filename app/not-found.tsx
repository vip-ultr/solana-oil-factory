import Link from "next/link";

export default function NotFound() {
  return (
    <div className="sof-nf-stage">
      <div className="sof-nf-card">
        <div className="sof-nf-code">
          <span>ERR · NOT_FOUND</span>
        </div>
        <div className="sof-nf-art" aria-hidden="true">
          404
        </div>
        <h1>This refinery doesn&apos;t exist.</h1>
        <p className="det">
          Either the URL is wrong, the refinery was closed, or the
          operator&apos;s pool was drained and the page archived. We log
          nothing about how you got here.
        </p>
        <div className="sof-nf-actions">
          <Link href="/refineries" className="sof-btn sof-btn-primary">
            Browse active refineries →
          </Link>
          <Link href="/" className="sof-btn sof-btn-secondary">
            Back to home
          </Link>
        </div>
        <div className="sof-nf-suggest">
          <div className="ttl">You might be looking for</div>
          <Link href="/refinery/ref-bonk">
            <span>BONK Refinery</span>
            <span className="det">Active · 2d 14h left</span>
          </Link>
          <Link href="/leaderboard">
            <span>Operator leaderboard</span>
            <span className="det">1,047 ranked</span>
          </Link>
          <Link href="/help">
            <span>Help · &quot;Why did my claim fail?&quot;</span>
            <span className="det">142 articles</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
