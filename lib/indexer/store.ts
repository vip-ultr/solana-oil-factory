// Read-side persistence for the indexer — Phase 2b.
//
// Events are queried from Supabase instead of the bundled events.json.
// All functions are async; callers (server components, API routes)
// must await them.
//
// The legacy events.json is kept on disk as a fallback for local dev
// without a Supabase connection, but is no longer imported here.

import { supabase } from "@/lib/supabase";
import type { EventName, IndexedEvent } from "./types";

export interface EventQuery {
  refinery?: string;
  wallet?: string;
  eventName?: string | string[];
  limit?: number;
}

function toIndexedEvent(row: Record<string, unknown>): IndexedEvent {
  return {
    signature:  row.signature  as string,
    logIndex:   row.log_index  as number,
    slot:       row.slot       as number,
    blockTime:  row.block_time as number | null,
    eventName:  row.event_name as EventName,
    data:       row.data       as Record<string, unknown>,
    refinery:   row.refinery   as string | null,
    wallet:     row.wallet     as string | null,
  };
}

/**
 * Load events from Supabase, optionally filtered. Pushes all
 * predicates to SQL so only the relevant rows cross the wire.
 * Results are newest-first (slot DESC, log_index DESC).
 */
export async function loadEvents(filter: EventQuery = {}): Promise<IndexedEvent[]> {
  let q = supabase
    .from("events")
    .select("signature, log_index, slot, block_time, event_name, data, refinery, wallet")
    .order("slot",      { ascending: false })
    .order("log_index", { ascending: false });

  if (filter.refinery)   q = q.eq("refinery", filter.refinery);
  if (filter.wallet)     q = q.eq("wallet",   filter.wallet);
  if (filter.eventName) {
    const names = Array.isArray(filter.eventName)
      ? filter.eventName
      : [filter.eventName];
    q = q.in("event_name", names);
  }
  if (filter.limit) q = q.limit(filter.limit);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(toIndexedEvent);
}

/** Alias kept for call-sites that don't pass a filter. */
export async function queryEvents(q: EventQuery = {}): Promise<IndexedEvent[]> {
  return loadEvents(q);
}
