import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { WalletPill } from "@/components/sof/primitives";

interface Row {
  wallet_address: string;
  total_crude: number;
  bags_crude: number;
  crude: number;
  prestige_title: string | null;
}

async function fetchTopByCrude(limit: number): Promise<Row[]> {
  try {
    const { data, error } = await supabase
      .from("wallets")
      .select(
        "wallet_address, total_crude, bags_crude, crude, prestige_title",
      )
      .gt("total_crude", 0)
      .order("total_crude", { ascending: false })
      .limit(limit);
    if (error) {
      console.error("[crude-leaderboard]", error.message);
      return [];
    }
    return (data ?? []) as Row[];
  } catch (err) {
    console.error("[crude-leaderboard] fetch failed", err);
    return [];
  }
}

export async function CrudeLeaderboard() {
  const top = await fetchTopByCrude(10);

  return (
    <section className="sof-lp-section">
      <div className="hd">
        <h2 className="font-display">Top $CRUDE earners</h2>
        <Link href="/leaderboard" className="meta sof-lp-link">
          Full leaderboard →
        </Link>
      </div>

      {top.length === 0 ? (
        <div className="sof-lp-feed-empty">
          No wallets have refined yet on this database. Be the first
          — connect above and start refining.
        </div>
      ) : (
        <ol className="sof-lp-lb">
          {top.map((row, i) => (
            <li key={row.wallet_address}>
              <span className="rk">#{(i + 1).toString().padStart(2, "0")}</span>
              <WalletPill address={row.wallet_address} />
              {row.prestige_title && (
                <span className="ti">{row.prestige_title}</span>
              )}
              <span className="vl font-mono">
                {row.total_crude.toLocaleString()} $CRUDE
              </span>
              <span className="sub">
                Solana {row.crude.toLocaleString()} · Bags{" "}
                {row.bags_crude.toLocaleString()}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
