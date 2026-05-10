import Image from "next/image";
import { ExternalLink } from "lucide-react";
import type { BagsFeedToken } from "@/lib/bags";

interface Props {
  feed: BagsFeedToken[];
}

export function LaunchpadFeed({ feed }: Props) {
  return (
    <section className="sof-lp-section">
      <div className="hd">
        <h2 className="font-display">Recent Bags launches</h2>
        <span className="meta">Live from bags.fm · trade these to bank Bags-stream oil</span>
      </div>

      {feed.length === 0 ? (
        <div className="sof-lp-feed-empty">
          The Bags API didn&apos;t return any recent launches just
          now. Refresh in a few minutes — this section comes back
          when the upstream feed does.
        </div>
      ) : (
        <div className="sof-lp-feed-grid">
          {feed.map((t) => (
            <article key={t.tokenMint} className="sof-lp-feed-card">
              <div className="lp-feed-img">
                {t.image ? (
                  <Image
                    src={t.image}
                    alt=""
                    width={56}
                    height={56}
                    unoptimized
                  />
                ) : (
                  <span aria-hidden="true">{(t.symbol ?? "?").slice(0, 2)}</span>
                )}
              </div>
              <div className="lp-feed-meta">
                <div className="nm">{t.name || t.symbol}</div>
                <div className="sym">${t.symbol}</div>
                {t.description && (
                  <p className="desc">{t.description}</p>
                )}
              </div>
              <a
                className="lp-feed-ext"
                href={`https://bags.fm/${t.tokenMint}`}
                target="_blank"
                rel="noreferrer"
              >
                Open on Bags <ExternalLink size={11} />
              </a>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
