# 10 — Launch Checklist

**Audience:** Founder, ops, anyone tracking project progress
**Purpose:** Comprehensive list of what needs to happen before mainnet launch

This is a **living document**. Update as items complete or new requirements surface.

---

## Status Legend

- ✅ **Complete** — done and verified
- 🔄 **In progress** — actively being worked on
- ⏳ **Pending** — not started, on the roadmap
- ⚠️ **Blocked** — waiting on external dependency
- ❌ **Skipped** — deferred to post-v1 (parking lot)

---

## Phase 1 — Smart Contract (Devnet Deployment)

### Anchor program implementation

- ✅ Module structure scaffolded
- ✅ `init_treasury` instruction
- ✅ `init_refinery` instruction
- ✅ `deposit` instruction
- ✅ `submit_snapshot` instruction
- ✅ `claim` instruction (merkle-verified, replay-safe)
- ✅ `withdraw` instruction (lock-gated)
- ✅ `close_refinery` instruction
- ✅ `toggle_operator_pause` instruction
- ✅ `toggle_platform_pause` instruction
- ✅ `update_rate` instruction
- ✅ All 14 unit tests passing

### Pending implementation

- ⏳ `rotate_authority` instruction (admin tooling)
- ⏳ `set_verified_cto` instruction (admin tooling)
- ⏳ Pool accounting drift assertion (Q-3 enforcement)
- ⏳ TransferHook extension whitelist check at launch
- ⏳ Mint authority renouncement handling

### Tests

- 🔄 **Task #38** — LiteSVM unit tests (3-5 days)
  - Happy path for every instruction
  - Each authorization check
  - Each constraint check
  - Boundary values
  - Replay scenarios
  - Token-2022 transfer fee handling
  - Specific gnarly cases (overflow, rounding, race conditions)

- 🔄 **Task #39** — Surfpool fork tests (2 days)
  - Real Helius RPC behavior
  - Real Token-2022 mint with TransferFee
  - Off-chain Jupiter swap simulation

- ⏳ Code coverage report (target: 100% on token-moving instructions)

### Deployment

- 🔄 **Task #40** — Devnet deploy + IDL publish (half day)
  - Airdrop SOL to deploy keypair
  - `anchor deploy --provider.cluster devnet`
  - `anchor idl init` to publish IDL on-chain
  - Smoke test all 10 instructions via TS scripts
  - Document deployed account addresses

---

## Phase 2 — Off-Chain Infrastructure

### Indexer (Supabase Edge Functions + pg_cron)

- ⏳ Helius webhook receiver (mint events ingestion)
- ⏳ Snapshot job (per-refinery cadence: at-launch, hourly, daily, weekly)
- ⏳ Pool monitoring cron (low-pool notification)
- ⏳ Claim signature watcher (write claim events to DB)
- ⏳ Sybil cluster job (daily wallet re-clustering)
- ⏳ Reputation recompute (daily, all wallets)
- ⏳ Treasury swap job (daily Jupiter swap)
- ⏳ ToS version pin job (flag mismatched acceptances)

### API endpoints (Edge Functions)

- ⏳ `GET /api/refineries` — directory list
- ⏳ `GET /api/refineries/:pda` — single refinery detail
- ⏳ `GET /api/wallets/:wallet/eligible` — auto-detect eligibility + proofs
- ⏳ `GET /api/wallets/:wallet/profile` — public wallet profile
- ⏳ `GET /api/dashboard` — wallet-scoped dashboard
- ⏳ `GET /api/leaderboard` — multi-tab leaderboard
- ⏳ `GET /api/refineries/:pda/snapshots/:idx/proof` — merkle proof
- ⏳ `POST /api/refineries/:pda/snapshot` — trigger snapshot (operator)
- ⏳ `POST /api/tos/accept` — record ToS acceptance (SIWS)
- ⏳ `GET /api/tokens/:mint` — cached token info

### Realtime channels

- ⏳ `refinery:<pda>` (live pool drain)
- ⏳ `claims:global` (home-page activity ticker)
- ⏳ `claims:<wallet>` (holder dashboard)
- ⏳ `leaderboard:operators` (auto-refresh every 5min)

### Auth

- ⏳ Sign-In With Solana (SIWS) implementation
- ⏳ JWT issuance from Edge Function
- ⏳ Supabase RLS policies (public reads, wallet-scoped writes)

### Estimated timeline: 4 weeks

---

## Phase 3 — Frontend Implementation

### Design

- ✅ Brand assets selected (logo, barrel, launchpad icons, wallet icons)
- ✅ Color system locked (dark + light themes)
- ✅ Typography locked (Space Grotesk + Inter + JetBrains Mono)
- ✅ Layout patterns locked (sidebar, footer, banners, modals)
- ✅ Page specifications written (verbatim copy for all 20 routes)
- ✅ Master design prompt written
- ⏳ HTML mockups (page-by-page generation)
- ⏳ Mockup review and iteration
- ⏳ Light theme parity check
- ⏳ Mobile design at 375px

### Implementation

- ⏳ Next.js 15 App Router setup
- ⏳ Tailwind v4 configuration with locked design tokens
- ⏳ Sidebar navigation (Linear/Notion/Vercel pattern)
- ⏳ Theme toggle (light/dark)
- ⏳ Wrong-network banner
- ⏳ Service-degraded banner (Gap 1)
- ⏳ Platform-pause banner
- ⏳ Connect modal (single unified flow with ToS)
- ⏳ Cmd+K command palette
- ⏳ Toast system (6 tiers)

### Pages (20 routes)

- ⏳ `/` — Home
- ⏳ `/refineries` — Directory
- ⏳ `/refinery/[mint]` — Single refinery (6 claim states)
- ⏳ `/refinery/[mint]?r=[id]` — Single refinery, specific PDA
- ⏳ `/refinery/launch` — 4-step launch form
- ⏳ `/refinery/solana` — Solana Refinery (legacy $CRUDE)
- ⏳ `/refinery/launchpad/pump` — Pump launchpad refineries
- ⏳ `/refinery/launchpad/bonk` — Bonk launchpad refineries
- ⏳ `/refinery/launchpad/bags` — Bags launchpad refineries
- ⏳ `/refinery/launchpad/candle` — Candle launchpad refineries
- ⏳ `/dashboard` — Wallet-scoped dashboard
- ⏳ `/wallet/[addr]` — Public wallet profile
- ⏳ `/leaderboard` — Multi-tab leaderboard
- ⏳ `/reputation` — Methodology page
- ⏳ `/trust` — Security + system status
- ⏳ `/developers` — API landing
- ⏳ `/help` — Help center index
- ⏳ `/help/[slug]` — Help articles
- ⏳ `/legal/terms` — Terms of Service
- ⏳ `/legal/privacy` — Privacy Policy
- ⏳ `/404` — Custom 404

### Help Center articles

- ⏳ "What is Sol Oil Factory?"
- ⏳ "How do refineries work?"
- ⏳ "How is reputation calculated?"
- ⏳ "What does Verified Deployer mean?"
- ⏳ "Why are you on devnet only?"
- ⏳ "What is freeze authority?"
- ⏳ "What happens during epoch advancement?"
- ⏳ "How do I withdraw my tokens after closing?"
- ⏳ "Why might my account be frozen?"
- ⏳ "How does cluster detection work?"

### Production-ready brand assets

- ⏳ Convert main Sol Oil Factory logo to SVG (replaces pixelated PNG)
- ⏳ Replace 4 launchpad icons with custom in-house icons
- ⏳ Vector version of barrel for small contexts (24px-64px)
- ⏳ Open Graph (OG) image templates for sharing
- ⏳ Favicon set (16x, 32x, 48x, 192x, 512x)
- ⏳ Apple touch icon
- ⏳ Manifest.json for PWA

### Estimated timeline: 8 weeks

---

## Phase 4 — Audit + Bug Bounty

### Smart contract audit

- ⏳ Apply for Solana Foundation audit grant
- ⏳ Get quotes from audit firms:
  - OtterSec (https://osec.io)
  - Ackee Blockchain (https://ackee.xyz)
  - Sec3 (https://www.sec3.dev)
  - Neodyme (https://neodyme.io)
- ⏳ Select firm and sign engagement
- ⏳ Pre-audit code freeze
- ⏳ Audit kickoff
- ⏳ Initial findings review
- ⏳ Implementation of audit fixes
- ⏳ Re-audit / verification pass
- ⏳ Final report received
- ⏳ Public audit report published on `/trust`

**Budget:** $30-80k

**Estimated timeline:** 6-12 weeks (depends on firm availability)

### Bug bounty

- ⏳ Set up Immunefi profile
- ⏳ Configure tier ($50K minimum for mainnet)
- ⏳ Define scope (program + critical frontend paths)
- ⏳ Define out-of-scope (UI bugs, social engineering, etc.)
- ⏳ Live before mainnet announcement

---

## Phase 5 — Legal + Compliance

### Entity formation

- ⏳ Decide jurisdiction (Cayman vs BVI)
- ⏳ Engage corporate counsel
- ⏳ Form offshore entity
- ⏳ Open business bank account
- ⏳ Register intellectual property (logo, name)
- ⏳ Trademark "Sol Oil Factory" (jurisdiction TBD)

**Budget:** $20-30k

### Terms of Service + Privacy Policy

- ✅ Draft v1 written
- ⏳ Lawyer review
- ⏳ Iterate on lawyer feedback
- ⏳ Final version locked
- ⏳ Pin ToS version hash in `NEXT_PUBLIC_TOS_VERSION_HASH`
- ⏳ Implement re-prompt on ToS version change

### Compliance

- ⏳ Geographic restriction policy (US, OFAC-sanctioned countries)
- ⏳ IP geolocation check at frontend
- ⏳ Add geo-blocking to ToS
- ⏳ KYC/AML evaluation (likely none required for v1, but document why)
- ⏳ Tax registration (jurisdiction-specific)

### Estimated timeline: 8-12 weeks (parallel with audit)

---

## Phase 6 — Mainnet Launch

### Pre-launch (final week)

- ⏳ Squads multisig configured
  - 1-of-1 day-one (founder alone)
  - Documented expansion path to 3-of-5
- ⏳ Squads vault assigned as program upgrade authority
- ⏳ Squads vault assigned as `treasury_config.pause_authority`
- ⏳ `treasury_config.snapshot_authority` keypair generated and secured
- ⏳ `treasury_config.fee_receiver_sol` Squads vault address set
- ⏳ Test mainnet deployment to a private staging environment
- ⏳ Final security review with audit firm
- ⏳ Final production smoke test on staging mainnet

### Launch day

- ⏳ Deploy program to mainnet (`anchor deploy --provider.cluster mainnet-beta`)
- ⏳ Publish IDL on-chain
- ⏳ Call `init_treasury` (one-shot, upgrade-authority gated)
- ⏳ Verify all admin addresses set correctly
- ⏳ Update `NEXT_PUBLIC_REFINERY_PROGRAM_ID` to mainnet program
- ⏳ Update `NEXT_PUBLIC_SOLANA_CLUSTER` to mainnet-beta
- ⏳ Frontend deploy to Vercel (production)
- ⏳ Update DNS to point to production frontend
- ⏳ Switch banners (no more devnet warning)
- ⏳ Monitor first transactions

### Post-launch (first 24 hours)

- ⏳ Active monitoring of all events
- ⏳ Watch for any pause-trigger conditions
- ⏳ Customer support availability
- ⏳ Bug bounty active

### Post-launch (first week)

- ⏳ First operator launches monitored
- ⏳ First claims monitored
- ⏳ First snapshots taken
- ⏳ Daily reputation recompute verified
- ⏳ Treasury swap cron verified
- ⏳ All alerting working

### Post-launch (first month)

- ⏳ Public retrospective post (transparency)
- ⏳ Audit report published
- ⏳ First operator success story (case study)
- ⏳ Reputation methodology validated against real data

---

## Marketing + Communications

### Pre-launch

- ⏳ Twitter account setup (@SolOilFactory)
- ⏳ Discord server (founder + technical channel)
- ⏳ GitHub repos (program + frontend) — public after audit
- ⏳ Documentation site (this doc set)
- ⏳ Press kit (logo, screenshots, copy)
- ⏳ Beta tester recruitment (devnet)
- ⏳ Devnet testnet event ($CRUDE giveaway, hands-on testing)

### Launch announcements

- ⏳ Twitter announcement
- ⏳ Solana Foundation post
- ⏳ Helius blog (RPC partner)
- ⏳ Solana Compass listing
- ⏳ Solscan partner integration
- ⏳ Birdeye listing

### Ongoing

- ⏳ Weekly progress posts (transparency)
- ⏳ Monthly metrics post (lifetime distributed, refineries launched, etc.)
- ⏳ Quarterly retrospective

---

## Operations + Infrastructure

### Hosting

- ⏳ Vercel Pro upgrade (from Hobby)
- ⏳ Helius pro tier (from free)
- ⏳ Supabase Pro tier (from free)
- ⏳ Upstash Redis Pro tier (from free)
- ⏳ Domain renewal (sol-oilfactory.xyz)

### Monitoring + alerting

- ⏳ Sentry for frontend errors
- ⏳ Helius webhook delivery monitoring
- ⏳ Indexer lag alerting (>5 min triggers degraded banner + ops alert)
- ⏳ RPC error rate alerting
- ⏳ Treasury swap failure alerting
- ⏳ Snapshot job failure alerting
- ⏳ Reputation recompute failure alerting

### Backups + recovery

- ⏳ Supabase database backups (Supabase handles this automatically on Pro)
- ⏳ Snapshot authority keypair secured (encrypted, multi-location)
- ⏳ Squads vault recovery process documented
- ⏳ Disaster recovery runbook
- ⏳ Service restoration runbook

### Customer support

- ⏳ Discord moderator(s) recruited
- ⏳ Support ticketing system (e.g., Linear or Help Scout)
- ⏳ FAQ + Help Center articles complete
- ⏳ Initial response SLA defined (24 hours for v1)

### Estimated timeline: 4 weeks

---

## Mainnet Launch Criteria — All Five Required

This is the **gate**. All five must be met before mainnet deployment is even considered.

1. ⏳ **Audit complete** — by OtterSec, Ackee Blockchain, Sec3, or Neodyme. Final report received.
2. ⏳ **Bug bounty live on Immunefi** at $50K+ tier.
3. ⏳ **Solana Foundation audit grant** — application submitted (approval optional but preferred).
4. ⏳ **100% branch coverage** on token-moving instruction paths (LiteSVM + Surfpool).
5. ⏳ **Squads multisig** configured for upgrade authority + pause authority.

Until all five are met: **devnet only**.

---

## Estimated Total Timeline

| Phase | Duration | Cumulative |
|---|---|---|
| Phase 1 — Smart contract complete | 1-2 weeks (from now) | 2 weeks |
| Phase 2 — Off-chain infrastructure | 4 weeks | 6 weeks |
| Phase 3 — Frontend implementation | 8 weeks | 14 weeks |
| Phase 4 — Audit + bug bounty | 6-12 weeks | 20-26 weeks |
| Phase 5 — Legal | 8-12 weeks (parallel) | (no extension) |
| Phase 6 — Mainnet launch | 1 week | 21-27 weeks |

**Realistic mainnet target:** 5-7 months from today (May 2026 → October-December 2026).

---

## Budget Summary

| Item | Estimated cost |
|---|---|
| Smart contract audit | $30,000 - $80,000 |
| Bug bounty (Immunefi minimum + reserves) | $50,000+ |
| Legal + entity formation | $20,000 - $30,000 |
| Hosting (Year 1, paid tiers) | ~$5,000 |
| Marketing (founder time + minimal paid) | ~$5,000 |
| **Total Year 1 budget** | **$110,000 - $170,000** |

### Revenue projection (conservative)

- Year 1: $50,000 - $200,000 (depending on operator adoption)
- Break-even: end of Year 1 to mid Year 2

### Revenue projection (optimistic)

- Year 1: $500,000+ (heavy operator adoption + viral launches)
- Break-even: month 3-6

---

## Key Risk Factors

### Technical risks

- **Audit findings require major rework** — buffer 4 weeks for remediation
- **Helius API changes** — monitor changelog, have fallback RPC ready
- **Solana network issues** — out of our control, document outage protocol
- **Token-2022 edge cases** — extensive test coverage required

### Business risks

- **Slow operator adoption** — mitigation: outreach to existing token projects pre-launch
- **Competitor launches similar product** — mitigation: reputation system as moat
- **Regulatory crackdown on token distribution** — mitigation: offshore entity, no US users (geo-block)

### Operational risks

- **Founder burnout (one developer)** — mitigation: AI tooling (Claude Code, Codex), focus on shipping over polish
- **Snapshot authority key compromise** — mitigation: rotation capability, off-chain reconstructibility
- **Multisig key loss** — mitigation: documented recovery process, hardware wallets

---

## Document History

- **2026-05-10** — Initial launch checklist consolidating all known requirements across protocol, frontend, audit, legal, and ops.
