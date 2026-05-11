"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { TokenMark } from "@/components/sof/primitives";
import type { Refinery } from "@/lib/mock-data";
import { cn } from "@/lib/cn";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface Item {
  key: string;
  group: string;
  label: React.ReactNode;
  detail?: { text: string; live?: boolean };
  kbd?: string;
  iconNode?: React.ReactNode;
  iconText?: string;
  onPick: () => void;
}

export function CommandPalette({ open, onClose }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [refineries, setRefineries] = useState<Refinery[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Lazy-fetch live refineries the first time the palette opens.
  // Subsequent opens use the cached list — server-side response
  // also has Cache-Control for 30s.
  useEffect(() => {
    if (!open || hydrated) return;
    let cancelled = false;
    fetch("/api/refineries")
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (Array.isArray(json.refineries)) {
          setRefineries(json.refineries);
        }
        setHydrated(true);
      })
      .catch(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, [open, hydrated]);

  // Build the static + dynamic item list.
  const items = useMemo<Item[]>(() => {
    const list: Item[] = [];
    const q = query.trim().toLowerCase();

    // RECENT (only when no query) — show the 2 newest live refineries.
    if (!q && refineries.length > 0) {
      for (const r of refineries.slice(0, 2)) {
        list.push({
          key: `recent-${r.id}`,
          group: "Recent",
          label: (
            <>
              <b>{r.tokenSymbol}</b> refinery
            </>
          ),
          detail:
            r.claimWindowDaysLeft !== null
              ? { text: `● ${r.claimWindowDaysLeft}d left`, live: true }
              : { text: "● open-ended", live: true },
          iconNode: (
            <TokenMark
              variant={r.tokenMarkVariant}
              symbol={r.tokenSymbol}
              size={18}
              logoUrl={r.logoUrl}
            />
          ),
          onPick: () => router.push(`/refinery/${r.id}`),
        });
      }
      list.push({
        key: "recent-dashboard",
        group: "Recent",
        label: (
          <>
            Open my <b>dashboard</b>
          </>
        ),
        kbd: "⌘D",
        iconText: "↗",
        onPick: () => router.push("/dashboard"),
      });
    }

    // QUICK ACTIONS
    list.push({
      key: "act-launch",
      group: "Quick actions",
      label: <>Launch a new refinery</>,
      kbd: "⌘L",
      iconText: "+",
      onPick: () => router.push("/refinery/launch"),
    });
    list.push({
      key: "act-browse",
      group: "Quick actions",
      label: (
        <>
          Browse{" "}
          {refineries.length > 0 ? (
            <>
              all <b>{refineries.length}</b> refineries
            </>
          ) : (
            <>refineries</>
          )}
        </>
      ),
      kbd: "⌘R",
      iconText: "⌖",
      onPick: () => router.push("/refineries"),
    });
    list.push({
      key: "act-leaderboard",
      group: "Quick actions",
      label: <>View leaderboard</>,
      kbd: "⌘B",
      iconText: "★",
      onPick: () => router.push("/leaderboard"),
    });
    list.push({
      key: "act-theme",
      group: "Quick actions",
      label: <>Toggle light / dark theme</>,
      kbd: "T",
      iconText: "⚡",
      onPick: () => {
        const html = document.documentElement;
        const next = html.dataset.theme === "dark" ? "light" : "dark";
        html.dataset.theme = next;
        try { localStorage.setItem("sof-theme", next); } catch {}
      },
    });

    // TOKEN MATCHES (when query)
    if (q) {
      const matches = refineries.filter((r) =>
        [r.tokenSymbol, r.tokenName, r.tokenMint, r.operator, r.id]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
      matches.forEach((r) => {
        list.push({
          key: `match-${r.id}`,
          group: `Refineries · ${matches.length} match${matches.length === 1 ? "" : "es"}`,
          label: (
            <>
              <b>{r.tokenSymbol}</b> Refinery · operated by {r.operator}
            </>
          ),
          detail:
            r.claimWindowDaysLeft !== null
              ? { text: `● ${r.claimWindowDaysLeft}d`, live: true }
              : { text: "● open" },
          iconNode: (
            <TokenMark
              variant={r.tokenMarkVariant}
              symbol={r.tokenSymbol}
              size={18}
              logoUrl={r.logoUrl}
            />
          ),
          onPick: () => router.push(`/refinery/${r.id}`),
        });
      });
    }

    // HELP (always last)
    list.push({
      key: "help-claim",
      group: "Help",
      label: <>How does claiming work?</>,
      iconText: "?",
      onPick: () => router.push("/help"),
    });
    list.push({
      key: "help-rep",
      group: "Help",
      label: <>How is reputation calculated?</>,
      iconText: "📊",
      onPick: () => router.push("/reputation"),
    });

    return list;
  }, [query, router, refineries]);

  // Group items for rendering
  const grouped = useMemo(() => {
    const groups: Record<string, Item[]> = {};
    items.forEach((i) => {
      if (!groups[i.group]) groups[i.group] = [];
      groups[i.group].push(i);
    });
    return groups;
  }, [items]);

  // Reset selection when query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Lock scroll + handle keys
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(items.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = items[activeIndex];
        if (item) {
          item.onPick();
          onClose();
        }
      }
    }
    addEventListener("keydown", onKey);
    return () => {
      removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, items, activeIndex, onClose]);

  if (!open) return null;

  let runningIndex = -1;

  return (
    <div
      className="sof-mo-scrim"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sof-mo-palette">
        <div className="sof-mo-pal-input">
          <Search aria-hidden="true" />
          {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search refineries, wallets, mints, or commands…"
            aria-label="Command palette search"
          />
          <span className="esc">esc</span>
        </div>
        <div className="sof-mo-pal-list" role="listbox">
          {items.length === 0 ? (
            <div className="sof-mo-pal-empty">
              No matches for &quot;{query}&quot;.
            </div>
          ) : (
            Object.entries(grouped).map(([groupName, groupItems]) => (
              <div key={groupName} className="sof-mo-pal-grp">
                <div className="ttl">{groupName}</div>
                {groupItems.map((item) => {
                  runningIndex += 1;
                  const isActive = runningIndex === activeIndex;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      className={cn("sof-mo-pal-row")}
                      onMouseEnter={() => setActiveIndex(runningIndex)}
                      onClick={() => {
                        item.onPick();
                        onClose();
                      }}
                    >
                      <span className="ic">
                        {item.iconNode ?? item.iconText}
                      </span>
                      <span className="lab">{item.label}</span>
                      {item.detail && (
                        <span className={cn("det", item.detail.live && "live")}>
                          {item.detail.text}
                        </span>
                      )}
                      {item.kbd && <span className="kbd">{item.kbd}</span>}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <div className="sof-mo-pal-foot">
          <div className="group">
            <span className="item">
              <span className="kbd">↑↓</span>navigate
            </span>
            <span className="item">
              <span className="kbd">↵</span>open
            </span>
            <span className="item">
              <span className="kbd">⌘↵</span>open in new tab
            </span>
          </div>
          <div className="group">
            <span>v2.1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
