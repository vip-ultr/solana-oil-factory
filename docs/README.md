# Docs

Working notes for sol-oilfactory: architecture, decisions, and plans.

## Files

- `architecture.md` — Current state of the codebase. Data flow, DB schema, math, key files. Update when structure changes.
- `backend-strategy.md` — When and why to split into a separate backend. Trigger conditions and a phased plan.
- `multi-tenant-pivot.md` — Strategy for evolving from single-tenant gamification site to "any token can spin up a factory" platform. Market scan + product design + open questions.
- `solana-audit.md` — Severity-ranked correctness + security audit of the Solana integration. C1–C3 are the gating fixes before the multi-tenant pivot.

## Conventions

- One topic per file. New topic, new file.
- Date decisions you want to revisit later (e.g., `2026-05-07: chose X because Y`).
- When code changes invalidate a doc, update the doc in the same PR.
- Keep these honest. If a section is outdated or wrong, fix it or delete it — stale docs are worse than no docs.
