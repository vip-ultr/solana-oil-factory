import Image from "next/image";
import { ExternalLink } from "lucide-react";
import type { BagsFeedToken } from "@/lib/bags";

interface Props {
  feed: BagsFeedToken[];
}

// Anything in the Bags feed is "fresh" by definition (the API
// returns the most recent launches). We mark the top 3 as "new"
// for an explicit upcoming-refinery affordance — users browsing
// Bags can grab these for Bags-stream oil before the rest of
// the wallet population.
const NEW_THRESHOLD = 3;

export function LaunchpadFeed({ feed }: Props) {
  return (
    <section id="feed" className="sof-lp-feed">
      <header>
        <h2>Recent Bags launches</h2>
        <p>
          Live from <code>bags.fm</code>. Trade these to bank Bags-stream
          oil — newer launches get a <span className="dot" /> tag so you can
          spot the ones that just hit the market.
        </p>
      </header>

      {feed.length === 0 ? (
        <div className="empty">
          The Bags API didn&apos;t return any recent launches just now.
          Refresh in a few minutes — this section comes back when the
          upstream feed does.
        </div>
      ) : (
        <div className="grid">
          {feed.map((t, i) => {
            const isNew = i < NEW_THRESHOLD;
            return (
              <article
                key={t.tokenMint}
                className={`card${isNew ? " new" : ""}`}
              >
                {isNew && <span className="tag">NEW LAUNCH</span>}
                <div className="img">
                  {t.image ? (
                    <Image
                      src={t.image}
                      alt={t.name || t.symbol || "Token"}
                      width={56}
                      height={56}
                      unoptimized
                    />
                  ) : (
                    <span aria-hidden="true">
                      {(t.symbol ?? "?").slice(0, 2)}
                    </span>
                  )}
                </div>
                <div className="meta">
                  <div className="nm">{t.name || t.symbol}</div>
                  <div className="sym">${t.symbol}</div>
                  {t.description && <p className="desc">{t.description}</p>}
                </div>
                <a
                  className="ext"
                  href={`https://bags.fm/${t.tokenMint}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open on Bags <ExternalLink size={11} />
                </a>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
