// Tiny localStorage-backed watchlist. Keys are namespaced ("refinery", "wallet")
// so the same id can be tracked across different kinds without collision.
//
// Reads return false during SSR; the consuming component must call
// `isWatched` from a `useEffect` (or via the `useWatched` hook).

const STORAGE_KEY = "sof:watchlist:v1";

type Kind = "refinery" | "wallet";

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
  } catch {
    /* quota / private mode — silently drop */
  }
}

export function isWatched(kind: Kind, id: string): boolean {
  return load()[kind].includes(id);
}

export function toggleWatched(kind: Kind, id: string): boolean {
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

export function listWatched(kind: Kind): string[] {
  return load()[kind].slice();
}
