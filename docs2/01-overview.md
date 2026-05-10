# 01 — Project Overview

**Audience:** Everyone (read this first)
**Purpose:** Strategic context — what we're building, why, and for whom

---

## What is Sol Oil Factory?

Sol Oil Factory is a **permissionless token-distribution platform on Solana**. It lets any token operator launch a "refinery" — a reward pool that distributes tokens to verified on-chain holders based on snapshots of their balances.

The strategic insight is simple: **token projects need ways to reward their real holders, and holders need ways to verify they're getting fair distribution from legitimate operators**. Sol Oil Factory provides infrastructure for both.

The differentiator is wallet reputation. Every refinery interaction builds reputation data. Over time, this creates a network effect — operators trust the platform because they can identify real holders; holders trust the platform because they can identify real operators.

---

## The Three Refinery Types

Sol Oil Factory ships with three distinct refinery surfaces:

### 1. Solana Refinery (existing legacy system)

The original $CRUDE-for-activity refinery. Users earn $CRUDE tokens by performing tracked on-chain activities. This system pre-existed the platform redesign and is integrated as one refinery type among the three.

**URL:** `/refinery/solana`
**Status:** Active, generating activity data
**Mechanic:** activity-based, not snapshot-based

### 2. Launchpad Refineries

Pre-configured refineries that read activity from existing Solana launchpads. There are four:

- **Pump Refinery** — `/refinery/launchpad/pump` (reads activity from pump.fun)
- **Bonk Refinery** — `/refinery/launchpad/bonk` (reads activity from bonk.fun)
- **Bags Refinery** — `/refinery/launchpad/bags` (reads activity from bags.fm)
- **Candle Refinery** — `/refinery/launchpad/candle` (reads activity from candle launchpad)

Each launchpad refinery aggregates refineries for tokens that graduated from that launchpad. Sol Oil Factory does NOT have partnerships with these launchpads — it indexes their public on-chain activity.

**Status:** Designed, not yet implemented
**Mechanic:** snapshot-based, scoped to launchpad activity

### 3. Token Refineries (NEW — the headline feature)

Anyone can launch a refinery for any Solana token. The operator deposits tokens into a PDA-owned escrow, configures distribution rules, and the platform handles snapshots, claims, and reputation tracking.

**URL pattern:** `/refinery/[mint]`
**Status:** Anchor program implemented; frontend designed
**Mechanic:** snapshot-based, fully permissionless

---

## Strategic Positioning

### The frame: "Where real holders get rewarded"

This is the locked positioning. It's a **reputation-first** frame, not a yield-first frame. The implication is:

- Reputation is the moat (no competitor has it)
- Refineries are the activity that generates reputation data
- Operators come for the distribution mechanics, stay for the reputation insights
- Holders come for the claims, stay because their reputation has value

The wedge: **Streamflow is rails, not a category. Bags/Pump/Bonk are launchpads, not competitors.** Sol Oil Factory is the first platform to combine permissionless distribution + cross-refinery reputation. That combination is the long-term defensibility.

### Target users

**Operators (token project teams):**
- Need to distribute tokens to holders fairly
- Want to identify real holders (not sybils)
- Care about reputation as a signal for future airdrops, governance, etc.
- Currently use: Streamflow (technical), spreadsheet airdrops (manual), nothing (do nothing)

**Holders (crypto-native users):**
- Hold tokens across multiple Solana projects
- Want to claim distributions efficiently
- Care about their on-chain reputation
- Currently use: Twitter for airdrop announcements, manual claim sites, nothing

**Browsers (curious users):**
- Want to discover token distribution opportunities
- Want to evaluate operator legitimacy
- May convert to holders if they see compelling refineries

### Why this positioning works

**Information asymmetry.** Holders don't know which refineries are legitimate. Operators don't know which holders are real. Sol Oil Factory closes both gaps with on-chain data.

**Network effects.** Reputation data improves with each refinery launch. More refineries → more data → better reputation → more trust → more refineries.

**Permissionless = scaling.** Operators don't need approval. The platform takes 1% deposit fee + 0.1 SOL launch fee — pure throughput economics.

---

## What Sol Oil Factory is NOT

To prevent scope creep, here's what we explicitly are NOT:

- ❌ NOT a token launchpad (we don't launch tokens, we distribute existing tokens)
- ❌ NOT a DEX (we don't facilitate trading)
- ❌ NOT a yield farm (we don't generate yield, we distribute pre-deposited rewards)
- ❌ NOT a governance platform (we don't run DAOs)
- ❌ NOT custodial (operator's tokens go to PDA escrow, not Sol Oil Factory's wallet)
- ❌ NOT a wallet (we use existing wallets via wallet adapter)
- ❌ NOT a KYC service (no identity verification beyond on-chain wallet ownership)

If a feature request doesn't map to **"distribute tokens to verified on-chain holders + build cross-refinery reputation,"** it's out of scope.

---

## Competitive Landscape

### Direct comparisons

**Streamflow** (streamflow.finance)
- Token streaming + vesting infrastructure
- Used by token projects for team/investor vesting
- Strong technical foundation, weak end-user UX
- **Our differentiator:** permissionless launching, holder-facing UI, reputation system

**Earnify** (earnify.so) and similar airdrop platforms
- Centralized airdrop distribution
- Often custodial or off-chain
- **Our differentiator:** non-custodial PDA escrow, on-chain verification, public reputation

**Manual airdrops via Solana CLI**
- Spreadsheet → Solana CLI → many transactions
- Technical, error-prone, no UI
- **Our differentiator:** UI, automation, audit trail

### Adjacent comparisons

**Jupiter** — DEX aggregator, adjacent infrastructure
**Phantom** — wallet, adjacent UX layer
**Helius** — RPC infrastructure, dependency

### Reference quality bar

Sol Oil Factory targets the **infrastructure tier** of crypto products. Reference quality bar:

- **Hyperliquid** — perpetuals DEX (information density, professional dark UI, financial-instrument feel)
- **Vercel** — cloud platform (operator dashboards, multi-tenant architecture, system reliability)
- **Linear** — project management (sidebar pattern, restraint, command palette, keyboard-first)
- **Phantom** — Solana wallet (trust signals, sober crypto UI, clean transaction flows)
- **Jupiter** — Solana DEX (technical operator-facing UI, performance over flash)

NOT consumer crypto apps (Uniswap, OpenSea), NOT meme platforms (pump.fun), NOT degen products.

---

## Project Origin and Founder Context

### Founder: Ammar Usamah (`vip-ultr` on GitHub)

- Solana developer with extensive history across multiple repos
- Active in Web3 product building, UI/UX design, community tooling
- Previously contributed to: Percolator (perpetuals DEX), Candle Elite (community dashboard), discord-notify (notification service)
- Operates from Nigeria
- Working style: practical, output-focused, prefers direct technical communication

### Why this matters for the project

- **Founder is technical** — can implement frontend + backend solo, doesn't need a team
- **Founder is in Nigeria** — needs offshore entity (Cayman or BVI) for US/EU user access; estimated $20-30k legal budget
- **Founder is bootstrapped** — no VC, runs lean, devnet-only until audit complete
- **Founder is part of $CNDL community** — has crypto-native instincts, understands operator/holder dynamics from inside

### Project history (relevant context)

The platform evolved from `$CRUDE` (the original Solana Refinery activity-token system) through several pivots:

1. **Phase 1:** `$CRUDE` activity-based rewards (still live as one refinery type)
2. **Phase 2:** Multi-tenant pivot — added launchpad refineries (still being built)
3. **Phase 3 (current):** Token refineries + reputation system — the headline feature

The frame "Where real holders get rewarded" is Phase 3's positioning. It explicitly subsumes and elevates the earlier work rather than replacing it.

---

## Why Devnet Only (For Now)

Sol Oil Factory is **strictly devnet-only** until ALL of the following are met:

1. **Smart contract audit complete** — by OtterSec, Ackee Blockchain, Sec3, or Neodyme
2. **Bug bounty live on Immunefi** at the $50K+ tier
3. **Solana Foundation audit grant** application submitted (and ideally approved)
4. **100% branch coverage** on token-moving instruction paths (LiteSVM + Surfpool)
5. **Squads multisig** configured for upgrade authority + pause authority

These are non-negotiable. The risk of a rug or exploit on a fresh-from-the-developer Anchor program is too high to take to mainnet without these guardrails.

**Estimated timeline to mainnet:** 3-6 months from devnet deploy, depending on audit availability.

---

## Funding Model

Sol Oil Factory generates revenue from three sources:

### 1. Launch fee — 0.1 SOL per refinery

Paid by the operator at refinery creation. Goes to `treasury_config.fee_receiver_sol`. Currently configured as a regular wallet; will be migrated to a Squads vault before mainnet.

**Volume estimate:** 100 refineries/month × 0.1 SOL × $200/SOL = **$2,000/month** (conservative)

### 2. Deposit fee — 1% of pool

Paid by the operator at refinery creation and on every top-up. Tokens go to a per-mint ATA owned by the `treasury_swap_pda`. An off-chain cron job swaps these tokens to SOL via Jupiter aggregator daily.

**Volume estimate:** 1% of $1M total deposits/month = **$10,000/month** (assuming aggressive operator adoption)

### 3. Claim fee — 0.001 SOL per claim

Paid by the holder per claim. Goes to `treasury_config.fee_receiver_sol`.

**Volume estimate:** 10,000 claims/month × 0.001 SOL × $200/SOL = **$2,000/month**

### Total revenue projection (Year 1, conservative)

**$14,000/month × 12 = $168,000/year**

This is enough to cover:
- Audit ($30-80k)
- Legal entity setup + ongoing ($20-30k)
- Helius pro tier (~$200/month)
- Vercel pro tier (~$20/month)
- Founder runway (Nigeria-cost-of-living)

The platform doesn't need VC to be sustainable. It needs proof of demand to justify post-audit growth.

---

## What's Different About This Project

### Honest about scope

Most "Solana DeFi" projects pretend to be more than they are. Sol Oil Factory is explicitly:
- One Anchor program with 10 instructions
- One frontend with 20 routes
- One indexer (Phase 2) with ~20 endpoints
- One reputation system
- That's it

No tokenomics. No DAO. No $SOF token. No staking. No yield. No farms. No L2.

### Honest about devnet

Most projects fudge the devnet/mainnet line in marketing. Sol Oil Factory has a **persistent red banner** at the top of every page reminding users they're on devnet. Tokens have no value. Refineries don't transfer to mainnet. This is a feature, not a bug — it builds trust by being honest about pre-launch status.

### Honest about reputation

Most "reputation" systems are either centralized (we score, you trust) or hand-wavy (we'll figure it out later). Sol Oil Factory's reputation system has:
- 6 explicit signals with declared weights
- Public methodology page (`/reputation`)
- Daily recompute via cron
- Explicit dispute mechanism (planned, post-launch)

You can audit how a wallet got its score. That's the differentiator.

### Honest about the team

It's one developer + AI tools (Claude Code, OpenAI Codex) + the broader Solana ecosystem (Helius, Anchor, Squads). Not a "team of 50 ex-FAANG engineers." This shapes design decisions: the frontend can't have 100 features, the indexer can't poll every block, the audit can't take a year.

---

## Document History

- **2026-05-10** — Initial overview consolidating multi-tenant pivot doc, BRIEF.md, founder context.
