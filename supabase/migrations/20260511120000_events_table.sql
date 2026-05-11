-- Phase 2b: move indexer events from bundled JSON to Supabase.
--
-- Two tables:
--   events         — one row per decoded Anchor emit! event
--   indexer_cursor — singleton per program, tracks the resume point
--
-- Apply via: supabase db push  OR  paste into the Supabase dashboard SQL editor.

-- ============================================================
-- events
-- ============================================================

CREATE TABLE IF NOT EXISTS events (
  id          BIGSERIAL   PRIMARY KEY,
  signature   TEXT        NOT NULL,
  log_index   INT         NOT NULL,
  slot        BIGINT      NOT NULL,
  block_time  BIGINT,                    -- Unix seconds; null if RPC omitted it
  event_name  TEXT        NOT NULL,
  data        JSONB       NOT NULL DEFAULT '{}',
  refinery    TEXT,                      -- Refinery PDA (base58); null for platform events
  wallet      TEXT,                      -- Primary actor pubkey (base58)

  CONSTRAINT events_signature_log_index_unique UNIQUE (signature, log_index)
);

-- Covering indexes for the four common filter shapes:
--   1. refinery feed  — WHERE refinery = $1
--   2. wallet feed    — WHERE wallet = $1
--   3. event-name     — WHERE event_name = $1 (used by aggregations)
--   4. chronological  — ORDER BY slot DESC, log_index DESC (default sort)
CREATE INDEX IF NOT EXISTS events_refinery_idx
  ON events (refinery, slot DESC, log_index DESC)
  WHERE refinery IS NOT NULL;

CREATE INDEX IF NOT EXISTS events_wallet_idx
  ON events (wallet, slot DESC, log_index DESC)
  WHERE wallet IS NOT NULL;

CREATE INDEX IF NOT EXISTS events_event_name_idx
  ON events (event_name, slot DESC, log_index DESC);

CREATE INDEX IF NOT EXISTS events_slot_idx
  ON events (slot DESC, log_index DESC);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
-- No policies: service role (API routes) bypasses RLS; anon gets nothing.

-- ============================================================
-- indexer_cursor
-- ============================================================

CREATE TABLE IF NOT EXISTS indexer_cursor (
  program_id      TEXT        PRIMARY KEY,
  last_signature  TEXT,
  last_slot       BIGINT,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE indexer_cursor ENABLE ROW LEVEL SECURITY;
