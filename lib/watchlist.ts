// Tiny localStorage-backed watchlist. Keys are namespaced ("refinery", "wallet")
// so the same id can be tracked across different kinds without collision.
//
// Reads return false during SSR; the consuming component must call
// `isWatched` from a `useEffect`, or use the reactive hooks from
// `lib/use-watched.ts` which subscribe to the change event below.

const STORAGE_KEY = "sof:watchlist:v1";

/** Custom DOM event dispatched on every toggle so same-tab listeners
 * stay in sync. Cross-tab sync still relies on the native `storage`
 * event the browser fires automatically on localStorage writes. */
export const WATCHLIST_CHANGE_EVENT = "sof:watchlist-changed";

export type WatchlistKind = "refinery" | "wallet";

interface Store {
  refinery: string[];
  wallet: string[];
}

function load(): Store {
  if (typeof window === "undefined") return { refinery: [], wallet: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { refinery: [], wallet: [] };
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      refinery: Array.isArray(parsed.refinery) ? parsed.refinery : [],
      wallet: Array.isArray(parsed.wallet) ? parsed.wallet : [],
    };
  } catch {
    return { refinery: [], wallet: [] };
  }
}

function save(store: Store): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    window.dispatchEvent(new CustomEvent(WATCHLIST_CHANGE_EVENT));
  } catch {
    /* quota / private mode — silently drop */
  }
}

export function isWatched(kind: WatchlistKind, id: string): boolean {
  return load()[kind].includes(id);
}

export function toggleWatched(kind: WatchlistKind, id: string): boolean {
  const store = load();
  const list = store[kind];
  const idx = list.indexOf(id);
  if (idx >= 0) {
    list.splice(idx, 1);
    save(store);
    return false;
  }
  list.push(id);
  save(store);
  return true;
}

export function removeWatched(kind: WatchlistKind, id: string): void {
  const store = load();
  const idx = store[kind].indexOf(id);
  if (idx < 0) return;
  store[kind].splice(idx, 1);
  save(store);
}

export function listWatched(kind: WatchlistKind): string[] {
  return load()[kind].slice();
}

export function clearWatched(kind: WatchlistKind): void {
  const store = load();
  store[kind] = [];
  save(store);
}
