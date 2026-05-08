# Backend strategy

When and why to split sol-oilfactory into a separate backend service. Last reviewed: 2026-05-07.

## TL;DR

Don't split now. The current Next.js + Supabase setup is fine for the stage we're at. But the architecture has clear ceilings — know what they are, and split when a specific trigger fires.

## Trigger conditions (split when one of these is true)

1. **Helius cost explodes.** Today every wallet visit re-runs a 50s pagination loop. At any real DAU this is uneconomical. Fix is a continuously-updated index fed by Helius **webhooks** → our Postgres → our API. Webhooks need a long-lived endpoint that's reliable at burst — Vercel functions are a poor fit (cold starts, no retry control).
2. **We want real-time anything.** Live leaderboard, server-synced refine timers, "wallet just refined" notifications, in-app activity feed — none of that works on Vercel serverless. Needs WebSockets / SSE on a long-lived server.
3. **Refine timers should stop being client-driven.** Today the auto-claim is a `useEffect` in the user's browser. If they close the tab, nothing happens until they return. A worker that processes expiring refines (cron loop or queue) is a backend job.
4. **Anti-abuse needs stateful logic.** Sybil farming detection, fake-wallet filtering, rate limiting, scoring throttles — much easier with one stateful service than across N stateless functions.
5. **The `/api/refine` security hole forces a rewrite.** The route trusts client-supplied `oilUnits` and `bagsCrude`. Anyone can POST `oilUnits: 999999999` and mint themselves into the leaderboard. The right fix is "only refine values that are already in our indexed DB" — and the indexed DB basically requires a backend.

## Phased plan

### Phase 0 — Now (no backend split needed)

These are deferrable-no-longer fixes that don't require new infrastructure.

- Plug the `/api/refine` trust hole. Either re-fetch Helius server-side before insert (slow but correct) or treat the value as a request and verify before claim.
- Add Supabase RLS so the anon key can't write directly to `wallets` / `refines` / `bags_refines`. Move writes behind a service-role key in API routes only.
- Reconcile the Bags fee-rate drift between README (1 SOL = 1000 CRUDE) and code (× 2000).
- Move business logic into `lib/` so it's portable when we do split. Keep Next.js API routes thin.

### Phase 1 — When DAU justifies it (one worker service)

Add **one** worker — Node or Go on Fly.io / Railway, ~$5–20/mo to start.

- **Job 1: Helius webhook ingester.** Subscribe via Helius webhooks for tracked wallets. Insert into a new `wallet_transactions` table. This kills the per-visit pagination loop.
- **Job 2: Refine-timer cron.** Every minute, find rows where `ends_at <= now() AND claimed = false AND is_completed = false`, mark `is_completed = true`, optionally auto-claim into `wallets`. Removes client-side dependency.
- **Job 3: Leaderboard recompute / Bags analytics refresh.** Periodic batch instead of on-demand TTL cache misses.

Frontend keeps talking to Supabase + Vercel API routes, which now read from the indexed table instead of paginating Helius live. This is the real architectural change and pays for itself fast.

### Phase 2 — At scale (worker fleet, queue, dedicated indexer)

- Worker fleet behind a queue (Redis / SQS / Postgres-backed).
- Real-time push (WebSocket / SSE) for live leaderboard + timers + activity feed.
- Dedicated indexer if Helius cost or coverage becomes a problem — Geyser-fed if we go deep.
- Next.js becomes the thin presentation layer it should be.

## What this means for current code

To make the eventual split painless, write new code with these rules now:

- **Business logic in `lib/`, not in route handlers.** Route handlers are HTTP adapters. They parse, validate, call into `lib/`, and serialize the response. That's it. When we split, we lift `lib/` into the worker and rewrite the route handlers as thin proxies.
- **Treat Supabase as a database, not a backend.** No business logic in RLS policies, no Postgres functions doing computation. Logic lives in code we control.
- **Don't lean on Vercel-specific primitives.** No `unstable_cache`, no edge-runtime hacks. ISR is fine because it's portable.
- **Idempotent everything.** Refine claim, speedup verification, leaderboard upsert — all written so a worker can re-run them safely. Already mostly true; keep it that way.

## Cost framing

Every Solana app that hit real scale has a real backend. They didn't *start* with one — they split when a specific pain forced it. Build for the split, don't pay the operational cost until a trigger above fires.
