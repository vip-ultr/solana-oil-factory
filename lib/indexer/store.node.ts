// Node-only write side for the indexer — Phase 2b.
//
// Writes events + cursor to Supabase instead of events.json.
// Imported only by scripts/indexer.cts — never by any server
// component or Vercel function.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import ws from "ws";
import type { IndexedEvent, IndexerCursor } from "./types";

const PROGRAM_ID = "2tPLLPQeLLNL4UDBbeagSUAABJcB3fHGTJaLGEzrx3rE";

function getClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: ws as unknown as typeof WebSocket },
  });
}

/** Read the resume cursor for this program. Returns a blank cursor on first run. */
export async function loadCursor(): Promise<IndexerCursor> {
  const { data, error } = await getClient()
    .from("indexer_cursor")
    .select("program_id, last_signature, last_slot, updated_at")
    .eq("program_id", PROGRAM_ID)
    .maybeSingle();

  if (error) throw error;
  return {
    programId:     PROGRAM_ID,
    lastSignature: data?.last_signature ?? null,
    lastSlot:      data?.last_slot      ?? null,
    updatedAt:     data?.updated_at     ?? new Date(0).toISOString(),
  };
}

/** Persist the cursor after a successful run. */
export async function saveCursor(cursor: IndexerCursor): Promise<void> {
  const { error } = await getClient()
    .from("indexer_cursor")
    .upsert({
      program_id:     cursor.programId,
      last_signature: cursor.lastSignature,
      last_slot:      cursor.lastSlot,
      updated_at:     new Date().toISOString(),
    });
  if (error) throw error;
}

/** Bulk-insert new events. Duplicates are silently ignored via ON CONFLICT DO NOTHING. */
export async function insertEvents(events: IndexedEvent[]): Promise<void> {
  if (events.length === 0) return;

  const db = getClient();
  const rows = events.map((e) => ({
    signature:  e.signature,
    log_index:  e.logIndex,
    slot:       e.slot,
    block_time: e.blockTime,
    event_name: e.eventName,
    data:       e.data,
    refinery:   e.refinery,
    wallet:     e.wallet,
  }));

  // Supabase REST has a practical limit of ~1 MB per request body.
  // 100-row chunks comfortably stay under that.
  const CHUNK = 100;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await db
      .from("events")
      .upsert(rows.slice(i, i + CHUNK), {
        onConflict:       "signature,log_index",
        ignoreDuplicates: true,
      });
    if (error) throw error;
  }
}
