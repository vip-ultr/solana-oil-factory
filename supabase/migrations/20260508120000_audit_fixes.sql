-- Audit fixes (see docs/solana-audit.md):
--   H2 — Enable RLS on every table. Without policies, only the service role
--        (used by API routes via lib/supabase.ts) can read/write. Anon key is
--        denied — even if it were embedded in the client bundle, it would be
--        useless for tampering with leaderboard or refine state.
--
--   H1 — Replay-prevention via unique index on tx_signature. Speedup payments
--        previously relied on a SELECT-then-UPDATE check which races under
--        concurrent requests. The DB now enforces uniqueness atomically and
--        the UPDATE in /api/verify-speedup catches 23505 to surface the
--        replay error cleanly.
--
-- Apply via the Supabase dashboard SQL editor, or `supabase db push` if the
-- CLI is wired up. Idempotent — safe to re-run.

-- ============================================================
-- H2: Row-level security
-- ============================================================

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE refines ENABLE ROW LEVEL SECURITY;
ALTER TABLE bags_refines ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_bags_analytics ENABLE ROW LEVEL SECURITY;

-- No policies are defined intentionally. Service role bypasses RLS, so the
-- API routes in app/api/**/route.ts continue to work. Anon role gets nothing.
--
-- If a future client component needs to read the leaderboard directly without
-- going through /api/leaderboard, add a SELECT policy:
--   CREATE POLICY "anon can read leaderboard" ON wallets
--     FOR SELECT TO anon USING (true);

-- ============================================================
-- H1: Replay-prevention via unique tx_signature
-- ============================================================

-- Partial indexes so refines without a speedup signature (the common case)
-- aren't bound by the constraint.
CREATE UNIQUE INDEX IF NOT EXISTS refines_tx_signature_unique
  ON refines (tx_signature)
  WHERE tx_signature IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS bags_refines_tx_signature_unique
  ON bags_refines (tx_signature)
  WHERE tx_signature IS NOT NULL;
