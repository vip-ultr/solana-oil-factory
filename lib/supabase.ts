import { createClient, SupabaseClient } from "@supabase/supabase-js";

// SERVER-ONLY. This client uses the Supabase service role key which bypasses RLS.
// Never import this module from a client component. The runtime guard below catches
// accidental client-side imports; the env var being non-NEXT_PUBLIC means the key
// itself is not bundled into the browser even if a leak somehow occurred.
if (typeof window !== "undefined") {
  throw new Error(
    "[lib/supabase] server-only module imported from client code"
  );
}

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  }
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  _client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

// Lazy-init proxy so module load doesn't read env (Next.js evaluates routes at
// build time during page-data collection). Env errors fire on first DB call.
// Methods are bound to the real client so chaining and internal `this` work.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getClient();
    const value = Reflect.get(client, prop);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
