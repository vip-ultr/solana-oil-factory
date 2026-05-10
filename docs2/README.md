# Sol Oil Factory — Project Documentation

**Status:** Devnet · Pre-mainnet planning complete
**Last updated:** May 10, 2026
**Repository:** `vip-ultr/solana-oil-factory` (frontend) · `vip-ultr/sol-oilfactory-program` (Anchor program)

---

## What is Sol Oil Factory?

Sol Oil Factory is a permissionless token-distribution platform on Solana. Token operators launch "refineries" (reward pools) that distribute tokens to verified holders based on on-chain balance snapshots. The platform's strategic differentiator is a wallet reputation system that builds value across refineries — making it harder for sybils to game and easier for legitimate operators to identify quality holders.

**Strategic frame:** "Where real holders get rewarded."

**Three product surfaces:**
1. **Solana Refinery** (existing $CRUDE-for-activity legacy system)
2. **Launchpad Refineries** (Pump · Bonk · Bags · Candle — read activity from existing launchpads)
3. **Token Refineries** (NEW headline feature — anyone launches a refinery for any Solana token)

---

## Documentation Index

This documentation set is organized for different audiences. Read in order if you're new; skip to the section you need if you're working on a specific area.

### For everyone

- **[01-overview.md](01-overview.md)** — Strategic context, target users, market positioning, competitive landscape
- **[02-product-spec.md](02-product-spec.md)** — Complete protocol specification: refineries, snapshots, reputation, fees

### For frontend developers + designers

- **[03-design-system.md](03-design-system.md)** — Visual identity, typography, colors, layout patterns, component patterns
- **[04-page-specifications.md](04-page-specifications.md)** — Every page, every state, every piece of copy (verbatim)
- **[05-design-prompt.md](05-design-prompt.md)** — Master prompt for AI-driven design generation

### For backend developers

- **[06-program-architecture.md](06-program-architecture.md)** — Anchor program design: accounts, instructions, security invariants
- **[07-program-reference.md](07-program-reference.md)** — Post-implementation snapshot of the program (what's actually built)
- **[08-frontend-integration.md](08-frontend-integration.md)** — How the frontend talks to the program + indexer

### For legal + ops

- **[09-terms-and-privacy.md](09-terms-and-privacy.md)** — Terms of Service + Privacy Policy drafts (lawyer review needed)
- **[10-launch-checklist.md](10-launch-checklist.md)** — What needs to happen before mainnet

---

## Project Status Snapshot

### What's done

- ✅ Protocol specification locked (50+ design decisions across 4 batches)
- ✅ Anchor program implemented (10 instructions, 4 account types)
- ✅ All program unit tests passing (14 tests)
- ✅ Frontend documentation complete (page-by-page copy + states)
- ✅ Design system locked (typography, colors, layout, anti-AI rules)
- ✅ Brand assets selected (logo, barrel, launchpad icons, wallet icons)
- ✅ ToS + Privacy drafted
- ✅ Design prompt for mockup generation written

### What's in progress

- 🔄 LiteSVM integration tests (#38)
- 🔄 Surfpool fork tests (#39)
- 🔄 Devnet deploy + IDL publish (#40)

### What's pending

- ⏳ Frontend design mockups (HTML artifacts, page-by-page)
- ⏳ Frontend implementation (Next.js 15 + Tailwind v4)
- ⏳ Off-chain indexer (Phase 2 — Supabase Edge Functions + pg_cron + Helius webhooks)
- ⏳ Smart contract audit (OtterSec / Ackee / Sec3 / Neodyme)
- ⏳ Bug bounty on Immunefi ($50k+ tier)
- ⏳ Squads multisig configuration
- ⏳ Lawyer review of ToS
- ⏳ Mainnet deployment

---

## Tech Stack Summary

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind v4
- **Wallet:** `@solana/react-hooks`
- **Hosting:** Vercel Hobby
- **Realtime:** Supabase Realtime channels (Phase 2)

### Backend (on-chain)
- **Framework:** Anchor 0.32.1
- **Toolchain:** Solana 3.1.15, Rust stable, BPF v1.52
- **Token support:** SPL-Token + Token-2022 native
- **Devnet program ID:** `2tPLLPQeLLNL4UDBbeagSUAABJcB3fHGTJaLGEzrx3rE`

### Backend (off-chain — Phase 2)
- **Indexer:** Supabase Edge Functions + pg_cron
- **Event source:** Helius webhooks
- **Caching:** Upstash Redis
- **External services:** RugCheck, Jupiter Tokens V2, Helius DAS

### Trust model
- **Snapshot authority:** designated keypair (off-chain indexer service) — rotatable
- **Pause authority:** Squads PDA (1-of-1 day-one, N-of-M post-audit)
- **Operator:** permanent binding per refinery (set at init, never mutated)
- **Holder:** trustless via merkle proof

---

## Key Decisions (Locked)

These decisions cannot be revisited without revisiting all downstream documentation. Listed for reference.

### Strategic positioning
- Frame: "Where real holders get rewarded" (reputation as the moat)
- Custody model: own Anchor program with PDA escrow (NOT Streamflow)
- Target audience: crypto-native operators + holders, not retail consumers
- Reference quality bar: Hyperliquid, Vercel, Linear, Phantom, Jupiter

### Visual identity
- Theme: Light + Dark only (Solana Mode killed)
- Typography: Space Grotesk (display) + Inter (body) + JetBrains Mono (numbers)
- Color: Oil amber accent on neutral base
- Industrial identity carried through typography + vocabulary + info-design (NOT decorative ornament)

### Architecture
- 20 routes (sitemap locked)
- Sidebar navigation pattern (Linear/Notion/Vercel) — collapsed-by-default 64px, hover-expand to 256px
- Mobile parity at 375px (not afterthought)
- TanStack Table + shadcn primitives (component foundation)
- HTML artifacts for design phase (not Figma, not React)

### Protocol
- Merkle-based snapshots (SHA-256, sorted-pair OZ-style)
- ClaimReceipt PDAs for replay protection
- 1% deposit fee (auto-swapped to SOL via Jupiter, off-chain)
- 0.1 SOL launch fee + 0.001 SOL claim fee
- 7-day withdrawal cooldown after claim window closes
- Per-refinery + platform-wide pause states

### Operations
- Devnet only until audit + bug bounty live
- Founder operates from Nigeria, needs offshore entity (Cayman/BVI)
- $30-80k audit budget · $20-30k legal budget
- Single domain (sol-oilfactory.xyz) — no marketing/app split

---

## How to Read This Documentation

### If you're new to the project (recommended path)

1. Start with **[01-overview.md](01-overview.md)** — what we're building and why
2. Read **[02-product-spec.md](02-product-spec.md)** — what the product does
3. Skim **[03-design-system.md](03-design-system.md)** — visual language
4. Reference others as needed

### If you're a designer

1. **[03-design-system.md](03-design-system.md)** — visual rules (READ FIRST)
2. **[04-page-specifications.md](04-page-specifications.md)** — every page in detail
3. **[05-design-prompt.md](05-design-prompt.md)** — the prompt to feed to your design tool

### If you're a frontend dev

1. **[02-product-spec.md](02-product-spec.md)** — product behavior
2. **[08-frontend-integration.md](08-frontend-integration.md)** — backend contract
3. **[04-page-specifications.md](04-page-specifications.md)** — what to build
4. **[03-design-system.md](03-design-system.md)** — how it should look

### If you're a backend dev

1. **[06-program-architecture.md](06-program-architecture.md)** — engineering design
2. **[07-program-reference.md](07-program-reference.md)** — current state of code
3. **[08-frontend-integration.md](08-frontend-integration.md)** — frontend contract

### If you're working on legal/ops

1. **[09-terms-and-privacy.md](09-terms-and-privacy.md)** — current drafts
2. **[10-launch-checklist.md](10-launch-checklist.md)** — what's needed before mainnet

---

## Repository Structure

```
solana-oil-factory/                     ← frontend repo
├── docs/                               ← THIS DOCUMENTATION
│   ├── README.md                       ← you are here
│   ├── 01-overview.md
│   ├── 02-product-spec.md
│   ├── 03-design-system.md
│   ├── 04-page-specifications.md
│   ├── 05-design-prompt.md
│   ├── 06-program-architecture.md
│   ├── 07-program-reference.md
│   ├── 08-frontend-integration.md
│   ├── 09-terms-and-privacy.md
│   └── 10-launch-checklist.md
├── app/                                ← Next.js App Router
├── components/                         ← UI components
├── lib/                                ← utilities
└── public/                             ← static assets

sol-oilfactory-program/                 ← Anchor program repo (sibling)
├── programs/refinery/                  ← Rust source
├── tests/                              ← integration tests
└── docs/                               ← engineering specs (mirrored in this doc set)
```

---

## Glossary

**Refinery** — a reward pool launched by an operator to distribute tokens to verified holders.

**Operator** — the wallet that launches and manages a refinery. Permanently bound at init.

**Holder** — a wallet eligible for claims based on on-chain token balance at snapshot time.

**Snapshot** — a merkle-rooted attestation of eligible holders and their balances at a specific point in time.

**Claim** — a single token distribution from a refinery's escrow to a holder, triggered by a valid merkle proof.

**Claim window** — the time period during which claims are allowed. Can be open-ended or fixed-duration.

**Pool** — the tokens deposited into a refinery's escrow PDA, available for distribution to holders.

**Per-claim cap** — maximum percentage of remaining pool any single wallet can claim from a single snapshot.

**Pool empty strategy** — what happens when claims would exceed remaining pool: pro-rata (scale down) or FCFS (first-come-first-served).

**Epoch** — a rule-version increment. When operator calls `update_rate`, epoch advances and a new snapshot is required.

**Reputation** — a 0-100 score per wallet, computed from on-chain behavior signals. Recomputed daily.

**Verified Deployer** — operator's wallet matches the token's mint authority. Auto-detected on-chain.

**Verified CTO** — operator manually verified by Sol Oil Factory team via off-chain process.

**$CRUDE** — the legacy "activity-based" reward token from the original Solana Refinery.

**Cluster** — a group of wallets identified as related through behavior analysis. Flagged clusters lower reputation.

---

## Glossary of Acronyms

- **ATA** — Associated Token Account
- **CPI** — Cross-Program Invocation
- **DEX** — Decentralized Exchange
- **PDA** — Program Derived Address
- **RPC** — Remote Procedure Call
- **SIWS** — Sign-In With Solana
- **SPL** — Solana Program Library
- **SDK** — Software Development Kit
- **CTO** — Community TakeOver
- **FCFS** — First Come First Served
- **ToS** — Terms of Service
- **MFA** — Multi-Factor Authentication
- **OG** — Open Graph (social media metadata)

---

## Document Changelog

- **2026-05-10** — Initial documentation set. Consolidates all planning across protocol spec, frontend design, page writeups, ToS/Privacy, and program implementation.
