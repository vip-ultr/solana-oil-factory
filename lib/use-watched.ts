"use client";

// Reactive hooks for the watchlist. Subscribes to:
//   - "storage" event   — fires for cross-tab updates to localStorage
//   - WATCHLIST_CHANGE_EVENT — fires for same-tab toggles
// so any component using these hooks re-renders the moment the
// watchlist changes, no matter which tab or which component made
// the change.

import { useEffect, useState } from "react";
import {
  WATCHLIST_CHANGE_EVENT,
  isWatched,
  listWatched,
  type WatchlistKind,
} from "./watchlist";

function subscribe(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(WATCHLIST_CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(WATCHLIST_CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function useWatched(kind: WatchlistKind, id: string): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(isWatched(kind, id));
    return subscribe(() => setOn(isWatched(kind, id)));
  }, [kind, id]);
  return on;
}

export function useWatchedList(kind: WatchlistKind): string[] {
  const [list, setList] = useState<string[]>([]);
  useEffect(() => {
    setList(listWatched(kind));
    return subscribe(() => setList(listWatched(kind)));
  }, [kind]);
  return list;
}

/** Total count across both kinds — useful for the sidebar badge. */
export function useWatchedCount(): { refineries: number; wallets: number; total: number } {
  const refineries = useWatchedList("refinery").length;
  const wallets = useWatchedList("wallet").length;
  return { refineries, wallets, total: refineries + wallets };
}
