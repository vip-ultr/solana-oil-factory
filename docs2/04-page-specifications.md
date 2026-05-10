# 04 — Page Specifications

**Audience:** Designers + frontend developers
**Purpose:** Verbatim copy for every page, every state, every piece of microcopy

---

# Sol Oil Factory — Page Writeups

**Version 1.0 · 2026-05-09**
**Purpose:** Verbatim copy for every page of the Sol Oil Factory frontend. This document is the source of truth for all UI text, microcopy, empty states, and inline mock data shown on each surface.

**How to use this:** When designing or building any page, use the copy here verbatim. Don't paraphrase. Don't substitute. If something isn't covered, add it to this document first, then implement.

**Scope:** Frontend UI only. Backend behavior is documented separately.

---

## Table of Contents

1. [Voice & Vocabulary](#voice--vocabulary)
2. [Global UI](#global-ui)
3. [Home (`/`)](#home-)
4. [Refineries Directory (`/refineries`)](#refineries-directory-refineries)
5. [Launch Refinery (`/refinery/launch`)](#launch-refinery-refinerylaunch)
6. [Token Page (`/refinery/[mint]`)](#token-page-refinerymint)
7. [Single Refinery (`/refinery/[mint]?r=[id]`)](#single-refinery-refinerymintridid)
8. [Solana Refinery (`/refinery/solana`)](#solana-refinery-refinerysolana)
9. [Launchpad Refineries (`/refinery/launchpad/*`)](#launchpad-refineries)
10. [Dashboard (`/dashboard`)](#dashboard-dashboard)
11. [Wallet Profile (`/wallet/[addr]`)](#wallet-profile-walletaddr)
12. [Leaderboard (`/leaderboard`)](#leaderboard-leaderboard)
13. [Reputation Methodology (`/reputation`)](#reputation-methodology-reputation)
14. [Trust (`/trust`)](#trust-trust)
15. [Developers (`/developers`)](#developers-developers)
16. [Help Center (`/help`, `/help/[slug]`)](#help-center)
17. [Legal (`/legal/terms`, `/legal/privacy`)](#legal)
18. [404 — Not Found](#404--not-found)
19. [Mock Data Master Reference](#mock-data-master-reference)

---

## Voice & Vocabulary

### Voice rules

- **Tense:** Present, declarative
- **Pronoun:** "We" when referring to Sol Oil Factory, "you" when referring to the reader
- **Tone:** Calm, technically precise, operator-grade. Never hype. Never marketing-speak.
- **Sentence length:** Short to medium. One idea per sentence.
- **Numbers:** Use real numbers. No "millions of users." No "trusted by industry leaders."
- **Banned words:** Unleash, reimagine, revolutionary, next-generation, game-changing, seamless, leverage, unlock, supercharge, harness, empower, robust, cutting-edge, world-class, best-in-class, ecosystem (when describing ourselves), passive income, yield (when not technically accurate), earn (when describing rewards — use "claim" or "receive")

### On-brand vocabulary (use these exact terms)

| Term | Meaning | When to use |
|---|---|---|
| Refinery | A distribution program for one specific token | Every UI surface |
| Operator | The wallet that launched a refinery | Always — never "creator", "deployer", "owner" |
| Holder | A wallet eligible to claim from a refinery | Always — never "user" when discussing eligibility |
| Pool | The operator's deposit | Always — never "vault", "treasury", "fund" |
| Snapshot | A point-in-time record of holders + balances | Always |
| Reputation | The 0–100 score for a wallet | Capitalized when used as the system; lowercase when used as the value |
| Drain | Pool size decreasing as claims happen | Use sparingly |
| Top up | Operator adding to the pool | Verb, two words |
| Closed refinery | Terminal state | Never "ended", "expired", "dead" |
| Verified deployer | Operator wallet matches mint authority | Always two words |
| Verified CTO | Manually-verified community takeover team | Acronym is fine |

### Tone examples (right vs wrong)

**Right:**
- "1,247 holders eligible. Snapshot taken 4 hours ago."
- "Pool drops to 84% remaining."
- "This wallet has claimed from 14 refineries. Reputation: 84."

**Wrong:**
- "1,247 amazing holders are ready to claim!"
- "The pool is filling up fast — get in now!"
- "This power user is crushing it across 14 refineries!"

---

## Global UI

These elements appear across every page.

### Sidebar Navigation

**Collapsed state (default, 64px wide):**
Icon-only. Tooltip on hover shows label.

**Expanded state (256px wide, on hover):**

```
[Sol Oil Factory logo]

— navigation —

🏠  Home
🛢  Refineries
✨  Launch Refinery
📊  Leaderboard

— refinery types (collapsible group) —

⛽  Solana Refinery
🚀  Launchpads
    └─ Pump
    └─ Bonk
    └─ Bags
    └─ Candle

— connected only —

📋  Dashboard

— spacer —

— footer —

☀  Light theme
☾  Dark theme
●  Devnet
[Connect Wallet] / [wallet chip]
```

> Note: Icons listed as emoji here for clarity — implement using Lucide line icons (Building2 for refineries, Plus for launch, Trophy for leaderboard, etc.). No emoji in the actual UI.

**Tooltip text (collapsed state):**
- Logo: "Sol Oil Factory · Home"
- Home: "Home"
- Refineries: "Browse all refineries"
- Launch: "Launch a refinery"
- Leaderboard: "Cross-refinery leaderboard"
- Solana Refinery: "Solana Refinery (activity-based)"
- Launchpads: "Launchpad refineries"
- Dashboard: "Your dashboard"
- Light theme: "Light theme"
- Dark theme: "Dark theme"
- Network pill: "Connected to Solana Devnet"

### Top Bar

Minimal, width-constrained to page max-width (1280px).

**Mobile-only hamburger** (left): opens sidebar drawer.

**Wrong-network warning banner** (full width, top, when applicable):
- Light: amber background, dark text
- Dark: amber background with red border, light text
- Copy: `Wrong network. Connected to Mainnet — switch to Devnet in your wallet to continue.`

### Connect Wallet Modal

**Title:** `Connect a wallet`

**Subtitle:** `Choose a wallet to connect. Sol Oil Factory does not store your private keys.`

**Wallet grid (3 primary wallets, large cards):**
- Phantom
- Solflare
- Backpack

**Expandable section:** `▾ More wallets`
When expanded, shows: Glow, Coin98, Trust Wallet, Math Wallet, Slope, Atomic Wallet (and any other wallet-standard-compatible wallets detected).

**After wallet selection (still in same modal):**

```
[Wallet icon] Connected to Phantom
Hxk2…7gPZ

—

Terms of Service

[Scrollable terms text — 240px tall on desktop, 320px on mobile]

—

☐  I have read and accept the Terms of Service and Privacy Policy.

[Sign & connect →]   (disabled until checkbox is ticked)
[Disconnect wallet]   (text-only, danger color)
```

**Sign & connect button copy:** `Sign & connect →`

**While signing:** `Sign in your wallet…` (button disabled, spinner inline)

**Error states:**
- User rejected sign: `Signature rejected. Try again or disconnect.`
- Network error: `Connection failed. Check your network and try again.`
- Wrong network: `Wallet is on the wrong network. Switch to Devnet and try again.`

**Bottom of modal (small text):**
`New to Solana? Get Phantom →` (links to phantom.com)

### Footer

Trust-strip + small status. Full-width band at bottom of every page.

**Top row — Trust strip (denser, monospace):**

```
Audited by [pending] · 1,247 wallets verified · $284,200 distributed lifetime · 247 active refineries
```

**Middle row — Sitemap (4 columns desktop, stacked mobile):**

| Product | Resources | Reputation | Legal |
|---|---|---|---|
| Refineries | Help Center | Reputation methodology | Terms of Service |
| Launch | Developers | Trust & status | Privacy Policy |
| Leaderboard | Discord | Wallet profiles | |
| Solana Refinery | X / Twitter | | |

**Bottom row — Colophon (small mono, muted):**

```
Sol Oil Factory · Built on Solana · Powered by Helius · Indexer healthy · Last block 4s ago

© 2026 Sol Oil Factory · v0.1.0-devnet
```

### Toast Notifications

Four severity tiers. Each has distinct visual treatment.

**Tier 1 — Trivial** (4s auto-dismiss, small toast bottom-right desktop, top mobile)
- `Address copied`
- `Theme switched to dark`
- `Filters cleared`
- `Disconnected`

**Tier 2 — Action confirmation** (8s auto-dismiss, includes tx hash + Solscan link)
- `Refinery launched. View on Solscan ↗`
- `Claimed 148.8 BONK. View on Solscan ↗`
- `Top-up complete. +6,200 RAY. View on Solscan ↗`
- `Refinery paused.`
- `Refinery closed. Unclaimed tokens returned.`

**Tier 3 — Errors** (10s persistent until dismissed, retry button where applicable)
- `Transaction rejected by wallet. [Retry]`
- `Network error. Check your connection. [Retry]`
- `Insufficient SOL for fees. Add SOL to your wallet.`
- `Refinery not found. The mint address may be invalid.`

**Tier 4 — Stakes alerts** (in-app notification panel, persistent until acknowledged)
- `Your BONK refinery pool is at 5% remaining. Top up or close before the window ends.`
- `Snapshot strategy updated. Next snapshot: 4h from now.`
- `Operator paused this refinery. Claims unavailable until unpaused.`

**Tier 5 — Live activity** (inline activity feed, never as transient toast)
- See activity feed copy in Single Refinery section.

---

## Home (`/`)

**Goal:** Orient a newcomer in 5 seconds. Get them either browsing the directory, learning what reputation is, or launching a refinery. Establish the "reputation layer" frame immediately.

### Section 1 — Hero

**Eyebrow (mono, uppercase, muted):**
`Permissionless Solana token distribution`

**Headline (Display 700, fluid 56px → 40px → 32px on mobile):**
`Where real holders get rewarded.`

**Subhead (Body L, max-width 540px):**
> Sol Oil Factory is the reputation layer for Solana. Operators distribute tokens to verified-active holders. Every refinery you participate in builds your wallet's score, used by every operator after you.

**Two CTAs:**
- Primary (accent fill): `Browse Refineries →`
- Secondary (outline): `Launch a Refinery`

**Trust micro-row below CTAs (Body S, muted, mono):**
`Powered by Helius · Audited by [pending] · 1,247 wallets verified · $284,200 distributed lifetime`

**Hero illustration (right side, 480px desktop, full-width mobile):**
The barrel asset, animated gauge fill at 62%. Caption directly below in mono small:
`62% of pool remaining · Pool drains as holders claim`

### Section 2 — How reputation works

**Eyebrow:** `01 — The Reputation Layer`

**Headline:** `Real holders build a score. Sybil farms don't.`

**Lead paragraph:**
> Every wallet on Sol Oil Factory has a Reputation score from 0 to 100. It's built from your participation across every refinery — how long you held, how many you claimed from, whether you flipped or stuck around. Operators use it as a sybil filter when launching their own refineries. Holders carry it across the entire Solana ecosystem.

**4-column signal grid (each column has icon + signal name + brief description):**

| Signal | What it tracks |
|---|---|
| Refineries claimed | Total successful claims, weighted by recency |
| Holding duration | Average time you held before claiming |
| Post-claim retention | Tokens still held >7 days after claim |
| Wallet age | Days of any chain activity |

**CTA below grid:**
`Read the full methodology →` (links to `/reputation`)

### Section 3 — Featured Refineries

**Eyebrow:** `02 — Active Refineries`

**Headline:** `Browse what's live.`

**Lead paragraph:**
> 247 active refineries. Every one launched by a real wallet, audited on-chain, with reputation-aware sybil defaults.

**Filter pill row (sticky on scroll within section):**
`All  ·  Active  ·  Closing soon  ·  By verified deployers`

**Grid (3 columns desktop, 2 tablet, 1 mobile — 6 featured cards):**

Each card:
```
[Token icon 40×40]  BONK
                    Bonk
                    Verified deployer ✓

Pool:               1.2M BONK ($4,820)
Claim rate:         1% gets 12,000 BONK
Eligible holders:   1,247
Avg reputation:     68

[Active] · 4h ago

View →
```

**Featured tokens (use mock data §10 of brief, top 6 by pool USD value):**
1. BONK — Verified deployer ✓ — Pool 1.2M BONK · 1,247 holders · Active
2. JUP — Verified deployer ✓ — Pool 8,400 JUP · 2,143 holders · Active
3. WIF — Verified CTO ✓ — Pool 84,000 WIF · 8,920 holders · Active
4. POPCAT — Unverified — Pool 142,000 POPCAT · 4,506 holders · Active
5. JTO — Verified deployer ✓ — Pool 12,500 JTO · 3,847 holders · Active
6. ORCA — Verified deployer ✓ — Pool 9,400 ORCA · 3,012 holders · Active

**CTA below grid:** `See all 247 refineries →` (links to `/refineries`)

### Section 4 — How a refinery works

**Eyebrow:** `03 — The Mechanism`

**Headline:** `From token deposit to holder claim.`

**4-step timeline (vertical, line down the left, numbered circles):**

**01 / Operator picks a token & deposits a pool**
Paste any Solana mint. Configure the rules. Our audited program holds the deposit in a PDA escrow. The team holds no keys.

**02 / Snapshot freezes eligible holders**
A point-in-time record of who held the token, with what balance. Sybil rules apply: wallet age, holding duration, cluster heuristics, minimum reputation.

**03 / Holders connect & claim**
We auto-detect every refinery a connected wallet is eligible for. One-click claim, on-chain, ~0.001 SOL gas.

**04 / Reputation accrues across refineries**
Real holders build a score. The score follows the wallet across every refinery on the platform.

### Section 5 — Three refinery types

**Eyebrow:** `04 — Refinery Catalog`

**Headline:** `Three ways to refine.`

**3-column row (each column visually distinct from the others, not identical "feature cards"):**

**Solana Refinery**
The flagship. Earn $CRUDE for any on-chain Solana activity. No operator, no token deposit — the chain itself is the source. 47,800 wallets active.
[`Visit Solana Refinery →`]

**Launchpad Refineries**
Pump · Bonk · Bags · Candle.
Earn $CRUDE for activity on each launchpad. One refinery per launchpad, platform-wide rewards. Useful if you trade on these venues regularly.
[`Browse Launchpads →`]

**Token Refineries**
NEW · 247 active.
Anyone can launch a refinery for any Solana token. Distribute the actual token to verified holders. Reputation-aware by default.
[`Launch a Refinery →`]

### Section 6 — Top operators preview

**Eyebrow:** `05 — Top Operators`

**Headline:** `Who's distributing the most.`

**Table (3 rows visible, "View Full Leaderboard →" link below):**

| # | Operator | Refineries | Lifetime distributed | Avg claimer reputation |
|---|---|---|---|---|
| 1 | RayLi…D9pT | 8 | $284,200 | 71 |
| 2 | Pyth9…D7ax | 5 | $189,400 | 68 |
| 3 | OrcaT…D7vM | 12 | $156,800 | 64 |

**CTA:** `View full leaderboard →` (links to `/leaderboard`)

### Section 7 — Final CTA

**Headline:** `Start refining.`

**Lead:**
> Connect a wallet to see what you're eligible for. Or launch a refinery for the token you operate.

**Two CTAs:**
- Primary: `Browse Refineries →`
- Secondary: `Launch a Refinery`

### Footer

(Global footer — see Global UI section.)

---

## Refineries Directory (`/refineries`)

**Goal:** Power-user browse surface. The user finds a refinery to claim from, or browses to find tokens they hold that have refineries.

### Header strip (sticky, 64px tall, blurred surface)

**Left:** Page title `All Refineries`

**Right (mono, muted):** `247 active · 89 closed in last 30d · Refresh`

### Filter row

**Search input (full-width on mobile, 320px desktop):**
Placeholder: `Search by token name, symbol, or mint address`

**Status filter (pill segmented control):**
`All  ·  Active  ·  Closing soon  ·  Closed`

**Sort dropdown:**
- Pool size (default, descending)
- Newest
- Highest claim rate
- Most claimers
- Closing soonest
- Highest avg reputation

**Operator filter (pill toggles):**
`✓ Verified deployer  ✓ Verified CTO  All operators`

**Min reputation filter (slider 0–80, default 0):**
Caption: `Min reputation of refinery's avg claimer: 0`

### Main table (TanStack Table)

**Column headers:**
| Token | Pool | Holders eligible | Claim rate | Snapshot | Operator | Avg rep | Status | Action |

**Row example (use BONK from mock data):**
```
[BONK icon] BONK · Bonk    1.2M BONK · $4,820    1,247    1% = 12,000 BONK    4h ago    [✓] Hxk2…7gPZ    68    [Active]    [Claim 148.8 BONK] / [View →]
```

**Action column logic:**
- If wallet connected AND eligible AND not yet claimed: `[Claim X tokens]` (primary fill)
- If wallet connected AND eligible AND already claimed: `[Claimed ✓]` (success state, disabled)
- If wallet connected AND not eligible: `[View →]` (outline)
- If wallet not connected: `[View →]` (outline)

**Row hover:** Background tint, slight 1px border accent.

**Row height:** 64px desktop, 96px mobile (stacked card layout).

### Right side panel (optional, expandable, 240px wide)

Only shows when wallet connected.

**Header:** `Your eligibility`

**Body:**
> You're eligible for 3 refineries. Total claimable: 161.2 BONK + 84 JUP + 1,420 POPCAT.

**List below:**
```
BONK Refinery
148.8 BONK ($0.57)
[Claim →]

JUP Refinery
84 JUP ($67.20)
[Claim →]

POPCAT Refinery
1,420 POPCAT ($85.20)
[Claim →]
```

### Empty / loading / error states

**Empty (no refineries match filters):**
- Heading: `No refineries match these filters.`
- Body: `247 refineries are active. Try clearing some filters.`
- CTA: `Clear filters →`

**Loading:**
- Skeleton with 8 row placeholders matching column structure

**Error:**
- Banner at top: `Failed to load refineries. [Retry]`
- Show stale data below if available

### Mobile layout

Table collapses to stacked card rows. Each card shows:
```
[Token icon] BONK · Bonk          [Active]
Pool: 1.2M BONK · $4,820
1,247 holders · 1% = 12,000 BONK
Operator: [✓] Hxk2…7gPZ · Avg rep 68
4h ago

[Claim 148.8 BONK]
```

---


## Launch Refinery (`/refinery/launch`)

**Goal:** An operator launches a refinery in under 2 minutes without confusion. Trust is established at every step.

**Layout:** Centered single column, max-width 640px. Step indicator at top.

### Step indicator

Horizontal row at top of every step:
`1. Token  ·  2. Identity  ·  3. Distribution  ·  4. Confirm`

Active step in accent color. Completed steps with checkmark in success color.

### Step 1 — Token contract address

**Header:** `Step 1 of 4`

**Heading:** `Which token are you distributing?`

**Lead:**
> Paste any Solana mint address. We'll fetch metadata and run a safety check.

**Input field:**
- Label: `Token mint address`
- Placeholder: `Paste a Solana mint address (e.g. DezX5p…AKKM)`
- Helper text below: `Mint addresses start with letters and end with letters or digits. ~32-44 characters.`

**On valid mint, fetch metadata. Loading state:**
- Skeleton card below input
- Mono text: `Fetching token metadata…`

**Once loaded — Token preview card (below input):**

```
[Token icon 64×64]
Bonk · BONK
Mint: DezX5pYz8sN…AKKM [copy]

Decimals: 5
Total supply: 88,847,000,000,000
Holders: 891,247
Current price: $0.0000039
Market cap: $346.5M
```

**Risk panel below preview (always visible, never hidden):**

**Heading:** `Risk check`

**Three categories:**

✅ **Clean signals (green):**
- `Jupiter verified`
- `Mint authority renounced`
- `Freeze authority renounced`
- `RugCheck: clean`

⚠ **Risk badges (amber):**
- `Mint authority active — operator can dilute supply at any time` (with checkbox: `I acknowledge`)
- `Freeze authority active — token transfers can be frozen by the authority` (with checkbox: `I acknowledge`)
- `Concentrated holder — top wallet holds >50%`
- `Low liquidity — fewer than 100 holders`

🚫 **Blockers (red, refinery cannot be created):**
- `Token on Solscan/Jupiter scam list — refinery cannot be launched`
- `RugCheck severity: danger — refinery cannot be launched`
- `Transfer fee >5% — refinery cannot be launched`

**Below the risk panel:**

```
[Continue →]    (disabled if any red blocker, or if any amber risk has unacknowledged checkbox)
```

**Helper text below button:**
`You can change the token before paying. Nothing is on-chain yet.`

### Step 2 — Operator identity

**Header:** `Step 2 of 4`

**Heading:** `Your operator identity`

**Lead:**
> Operators get a verification badge based on their relationship to the token's mint authority. The badge appears on every refinery they launch.

**Auto-detection result (one of three states):**

**State A — Verified deployer (green panel):**
```
✓ Verified deployer

Your wallet (Hxk2…7gPZ) matches the mint authority for BONK. Refineries you launch will display a Verified deployer badge.

This is the highest trust tier. Operators with this badge typically see 3-4× more claims than unverified operators.
```

**State B — Eligible for Verified CTO (neutral panel):**
```
Your wallet doesn't match the mint authority

The mint authority for BONK is `8z…3Ks`. You can request a Verified CTO badge if you're the project's current operator (e.g., the original team handed off control, or you led a community takeover).

[Request Verified CTO badge →]    (links to /dashboard?tab=verification)

You can launch the refinery now without a badge. The badge can be added retroactively after verification.
```

**State C — Unverified (neutral panel):**
```
Unverified operator

Your refinery will launch without a verification badge. Many refineries are launched without one — but verified operators see 3-4× more claims on average.

You can still launch. You can also apply for a Verified CTO badge later if you become the project's operator.
```

**Below the panel:**

`[← Back]    [Continue →]`

### Step 3 — Configure distribution

**Header:** `Step 3 of 4`

**Heading:** `How does the distribution work?`

**Lead:**
> Set the rules. Defaults are configured for a typical 30-day refinery with sybil-resistant settings.

**Two-column layout (single column on mobile):**

**Left column — Distribution settings**

**Reward pool size:**
- Number input + token symbol prefix
- Helper text below: `≈ 12,000 BONK per 1% holder · 1,247 eligible at current snapshot · You'll deposit 1,212,000 BONK + 1% deposit fee (12,120 BONK)`

**Claim rate framing:**
- Segmented control: `[Tokens per 1% of supply]  [Total pool ÷ holders evenly]`
- Default: Tokens per 1% of supply

**Snapshot strategy:**
- Radio group:
  - `At launch — single snapshot when refinery activates (default, recommended)`
  - `Hourly — fresh snapshot every hour`
  - `Daily — fresh snapshot every 24 hours`
  - `Weekly — fresh snapshot every 7 days`
- Helper text: `Recurring snapshots let new holders become eligible during the claim window. At-launch keeps the eligibility list fixed.`

**Pool-empty behavior:**
- Radio group:
  - `Pro-rata scale-down — if pool would over-distribute, all claims scale proportionally (default)`
  - `First-come-first-served — claims process in order until pool is empty`
- Helper text: `Pro-rata is fairer. FCFS rewards fast claimers but creates a "race to claim" UX.`

**Per-claim cap:**
- Slider 0.1% – 100%, default 5%
- Live caption: `A holder can claim at most 5% of remaining pool per epoch.`

**Claim window:**
- Number input (days), default 30
- Toggle: `Open-ended (no expiration)`
- Helper text: `After this window, unclaimed tokens are returnable to you (subject to a 7-day cooldown).`

**Right column — Sybil defenses (sticky on scroll, "Defaults look good" digest)**

**Header:** `Sybil defaults`

**4 toggles, all on by default:**

```
✓  Wallet age ≥ 30 days
   Requires the claimer's wallet to have any chain activity for at least 30 days.

✓  Holding duration ≥ 24 hours
   Requires the claimer to have held the token continuously for 24h before snapshot.

✓  Cluster filter
   Wallets funded from the same source share a single claim across the cluster.

✓  Min reputation: 0
   [Slider 0–80] — wallets below this Reputation score are filtered out.
```

**Verified-only mode (large switch at bottom):**
```
[Toggle off/on]  Verified-only mode

When on, combines: wallet age ≥ 90 days, holding duration ≥ 7 days, strict cluster filter. Recommended for high-value pools.
```

**Tooltip on each toggle:** Explains the rule and trade-off in 1-2 sentences.

**Below both columns:**

`[← Back]    [Continue →]`

### Step 4 — Confirm + pay

**Header:** `Step 4 of 4`

**Heading:** `Review and launch`

**Lead:**
> Final review. After signing, the launch fee + pool deposit are committed on-chain in one transaction.

**Summary card (recapping every choice from previous steps):**

```
Token                    BONK · Bonk
                         DezX5p…AKKM    [edit]

Operator identity        Verified deployer ✓
                         Hxk2…7gPZ    [edit]

Reward pool              1,200,000 BONK
                         ≈ 12,000 BONK per 1% holder    [edit]

Snapshot strategy        At launch (single)    [edit]

Pool-empty behavior      Pro-rata scale-down    [edit]

Per-claim cap            5% of remaining pool    [edit]

Claim window             30 days    [edit]

Sybil defaults           ✓ Wallet age ≥ 30d
                         ✓ Holding duration ≥ 24h
                         ✓ Cluster filter
                         ✓ Min reputation: 0    [edit]
```

**Fee breakdown (separate panel below summary):**

```
Fee breakdown

Launch fee                              0.1 SOL ($28.40)
Pool deposit                            1,200,000 BONK
Deposit fee (1% of deposit)             12,120 BONK (auto-swapped to SOL)
Estimated network fee                   ~0.00025 SOL

Total committed by you                  0.1 SOL + 1,212,120 BONK
```

**Custody disclosure panel (always visible, technical primary):**

```
Custody

Your tokens go into a program-owned PDA escrow at address `Esc5K…ABCD`. The Sol Oil Factory team holds no keys to this escrow — only the program's defined instructions can move tokens out.

Withdrawal is gated: you cannot withdraw while the claim window is open or for 7 days after it closes. This 7-day cooldown gives stragglers time to claim before the refinery winds down.

▾ How does this work in plain language?

   Your tokens go into an audited on-chain program. We don't hold them. You can pull
   them back after the claim window ends, plus a 7-day cooldown so stragglers can claim.
```

**Risk acknowledgment checkbox:**
```
☐  I have read the custody and risk disclosures, and I understand how this refinery will work.
```

**Final button:**
`[Sign & launch]    (large, primary fill, 56px tall, disabled until checkbox ticked)`

**While signing:**
`Sign in your wallet…`

**While confirming on-chain:**
`Confirming on-chain…    Tx: 5x7K…2Y9V    [view]`

### Confirmation screen (after successful launch)

**Full-screen takeover, centered content:**

**Heading:** `Refinery launched.`

**Body:**
> Your BONK refinery is live. Holders can now connect and claim.
> Snapshot is being taken — eligibility list will be ready in ~4 minutes.

**Stats panel:**
```
Refinery URL              solanaoilfactory.xyz/refinery/DezX5p…AKKM    [copy]
Tx signature              5x7K…2Y9V    [view on Solscan]
Pool                      1,200,000 BONK
Status                    Pending → Active in ~4m
```

**Two CTAs:**
- Primary: `View your refinery →`
- Secondary: `Share on X →`

**Helper text below:**
> The refinery will appear in the public directory once snapshot completes. You'll receive an in-app notification when it's live.

---

## Token Page (`/refinery/[mint]`)

**Goal:** When 1+ refineries exist for a token mint, this page lists them all with the token's trust report. When only 1 exists, redirect to `?r=<id>`.

### Header (140px tall)

```
[Token icon 64×64]    Bonk · BONK
                      Mint: DezX5pYz8sN…AKKM  [copy]

[Verified ✓]  [Mint authority renounced]  [Low liquidity ⚠]
```

**Three top-level stats (single row):**

```
Total pool across all refineries          Total holders eligible          Total claimed lifetime
1.2M BONK · $4,820                        1,247                            387,400 BONK · $1,540
```

### Refineries section

**Heading:** `3 refineries for BONK`

**Sort dropdown:** Pool size (default) · Newest · Highest claim rate · Most claimers · Closing soonest

**Refinery cards (stacked vertically, full width, ~140px tall each):**

```
[✓] Hxk2…7gPZ                                                            [Active] · 4h ago

Pool: 1.2M BONK · $4,820                              Avg reputation: 68
Snapshot: At launch · Per-claim cap: 5%               Sybil: All defaults on
Claim window: 30 days (27 left)

[View / Claim →]
```

**For each card, "Action" button logic:**
- Connected wallet eligible: `[Claim 148.8 BONK]`
- Connected wallet already claimed: `[Claimed ✓]`
- Not connected / not eligible: `[View →]`

### Trust Report section (collapsible, expanded by default)

**Heading:** `Trust report`

**4-column grid:**

**Token verification:**
- Jupiter verified: ✓
- Mint authority: Renounced ✓
- Freeze authority: Renounced ✓
- RugCheck severity: clean ✓

**Holder concentration:**
- Top 1 holder: 8.4% (LP)
- Top 10 holders: 22.1%
- Top 100 holders: 38.9%
- Total holders: 891,247

**Refinery history:**
- Total refineries launched: 4
- Currently active: 3
- Closed cleanly: 1
- Drained early: 0

**Recent on-chain activity:**
- Last 24h transfers: 8,420
- Last 7d transfers: 71,480
- Last 30d transfers: 312,000

**External links (mono, muted):**
- `View on Solscan ↗`
- `View on Jupiter ↗`
- `View on RugCheck ↗`
- `View on DexScreener ↗`

### Empty / error states

**No refineries (when entered URL but no refineries exist):**
- Heading: `No refineries for this token yet.`
- Body: `Be the first to launch one. The Trust Report below will help you decide if it's worth distributing for.`
- CTA: `Launch a refinery for BONK →`
- Below: full Trust Report still shown.

**Token not found:**
- Heading: `Token not found.`
- Body: `The mint address `<mint>` doesn't appear to be a valid Solana SPL token.`
- CTA: `← Back to Refineries`

---

## Single Refinery (`/refinery/[mint]?r=[id]`)

**The headline screen. Designed first, designed best. Everything important happens here.**

### Hero strip (180px tall)

**Left (60% width):**

**Eyebrow (mono, muted):**
`Refinery · Operated by Hxk2…7gPZ`

**Token name + symbol (Display 700, 36px):**
`Bonk · BONK`

**Verification badges row:**
`[✓ Verified deployer]  [Mint authority renounced]  [Snapshot: At launch]`

**Operated by line (Body S, muted):**
`Operated by Hxk2…7gPZ · Reputation 84 · Launched May 9, 2026`

**Two big stats side-by-side:**

```
Pool remaining                   Claim rate
744,000 BONK                     1% holders get 12,000 BONK
$2,990 · 62% of original         Per-claim cap: 5% of remaining
```

**Right (40% width):**
- The barrel asset, gauge filled to 62%
- Caption below (mono, small): `62% of pool remaining · Drains as holders claim`

### Claim block (only when wallet is connected)

**Large card, 1px border, 28px padding:**

**Eligibility status (one of four states):**

**State A — Eligible:**
```
You hold 12,400 BONK at snapshot. You can claim 148.8 BONK now.

[Claim 148.8 BONK →]    (large 56px button, primary fill)

Network fee ≈ 0.001 SOL · Token-2022 transfer fee 0% · You'll receive 148.8 BONK
```

**State B — Not eligible (didn't hold at snapshot):**
```
Your wallet held 0 BONK at the snapshot taken 4h ago.

To become eligible, buy BONK and wait for the next snapshot. This refinery uses at-launch snapshots — eligibility is fixed for this refinery.

[Buy BONK on Jupiter →]
```

**State C — Already claimed:**
```
You claimed 148.8 BONK on May 9 at 14:32 UTC.

[View on Solscan ↗]    Tx: 5x7K…2Y9V
```

**State D — Filtered by sybil rules:**
```
Your wallet is filtered from this refinery.

Reason: Wallet age below operator minimum (this refinery requires ≥ 30 days, your wallet is 18 days old).

[Read about sybil filters →]
```

### Stats grid (4 columns, 100px tall each)

```
Pool deposited        Total claimed          Holders claimed         Claim window left
1,200,000 BONK        387,400 BONK           240 / 1,247             27 days
$4,800                $1,540                 (19.2%)                 (closes Jun 8)
```

### Activity feed (right rail, 320px wide, scrollable)

**Header:** `Activity`

**Filter pills:** `[All] [Top claims] [Operator actions]`

**Feed rows (scrollable, infinite):**

```
[avatar] Hxk2…7gPZ        claimed 148.8 BONK        2m ago
         Reputation 84

[avatar] 4Bsd…91jU        claimed 12,000 BONK       5m ago
         Reputation 67

[avatar] 9wF7…3Lz8        claimed 84 BONK           8m ago
         Reputation 51

[avatar] 2zKp…hH4M        claimed 1,420 BONK        12m ago
         Reputation 42

[avatar] 8zZb…3Ksn        claimed 220 BONK          14m ago
         Reputation 21 (low)

[avatar] 7HpZ…44tL        claim filtered            19m ago
         Reason: Cluster flag

[avatar] Hxk2…7gPZ        topped up pool +6,200     35m ago
         (operator)

[avatar] Hxk2…7gPZ        snapshot taken            4h ago
         1,247 holders eligible

[avatar] Hxk2…7gPZ        launched refinery         4h ago
         (operator)
```

### Pool drain chart (320px tall, below stats grid)

**Heading:** `Pool over time`

**Chart:** Line chart, X = time since launch, Y = pool % remaining
**Annotations on chart:**
- Snapshot events (vertical dashed lines)
- Top-up events (small upward arrows)
- Pause/unpause events (small marker)

**Below the chart:**
`Snapshot at launch · 1,247 holders eligible · Avg claim: 1,614 BONK`

### Operator section (only visible to operator)

Collapsible panel, shows when connected wallet is the operator.

**Heading:** `Manage this refinery`

**Action buttons (2-column grid):**
```
[Top up pool]                    [Pause claims]
Add tokens to the pool           Temporarily block all claims
+1% deposit fee applies

[Update rate / snapshot]         [Withdraw]
Creates a new epoch              Available in 27 days
Mandatory new snapshot           (claim window + 7d cooldown)

[Close refinery]
Terminal. Refunds unclaimed.
```

**Each action has a tooltip explaining the policy and trade-offs.**

### ToS / risk footer (always visible, low-emphasis)

```
Sol Oil Factory does not vouch for this token. This refinery was launched permissionlessly by Hxk2…7gPZ. Read our risk disclosure for what this means.
[Risk disclosure →]
```

### Empty / paused states

**Refinery paused:**
- Full-width amber banner above the claim block:
  `[Paused] This refinery is paused by the operator. Claims will resume when unpaused.`
- Claim button disabled, helper text: `Claims unavailable until operator unpauses.`

**Refinery closed:**
- Full-width muted banner:
  `[Closed] This refinery closed on May 9, 2026. Total claimed: 387,400 BONK across 240 holders.`
- Claim block replaced with: `[Closed] Final stats below. No further claims accepted.`


---

## Solana Refinery (`/refinery/solana`)

**Goal:** The flagship refinery. Earn $CRUDE for any on-chain Solana activity. No operator, no token deposit — chain-wide.

### Hero

**Eyebrow:** `Solana Refinery · The flagship`

**Headline:** `Refine your activity into $CRUDE.`

**Subhead:**
> Every Solana transaction you make builds your $CRUDE balance. The longer you've been active on-chain, the more you accrue. $CRUDE feeds your Reputation score — and unlocks prestige titles as you climb the leaderboard.

**Right side — Barrel illustration:** Animated gauge fill at user's actual % toward next prestige tier (when connected).

**When NOT connected:**
- CTA: `Connect to extract your $CRUDE →`

**When connected:**
- Mono stats line:
  `47,800 wallets active · 12.4M $CRUDE total minted · You're rank 1,247 of 47,800`

### Your stats (only when connected)

Dense stats card, 6 columns:

```
Activity            Oil units    Barrels    $CRUDE balance    Prestige     Next tier
4,127 txs           4,127        82          12,400            Refiner      Senior Refiner (in 2,600 $CRUDE)
```

**Below the stats:**
- Primary CTA: `Start refining →`
- Secondary: `View your profile →` (links to `/wallet/[their-addr]`)

### How it works section

**Eyebrow:** `01 — How it works`

**Headline:** `From transaction count to $CRUDE.`

**4-step explainer:**

**01 / We count your transactions**
Every signed transaction your wallet makes on Solana mainnet is an "oil unit." Indexed via Helius. No action needed from you — connect a wallet and we tally what's already there.

**02 / Oil units convert to $CRUDE**
Every 10 oil units = 1 $CRUDE. Capped at 15,000 $CRUDE per refining session.

**03 / Refining locks in your $CRUDE**
Start a refining session. Wait 30 minutes to 6 hours (scales with your oil units). Claim. Your $CRUDE balance increases.

**04 / $CRUDE feeds Reputation**
Your $CRUDE balance is one of the signals that builds your wallet Reputation across the Sol Oil Factory ecosystem.

### Prestige tiers section

**Eyebrow:** `02 — Prestige`

**Headline:** `Climb 25 tiers, from Dry Well to Supreme PetroLord.`

**Lead:**
> Your prestige title is determined by total $CRUDE across the Solana Refinery + every Token Refinery you've claimed from. It's a marker — not a wall. There are no perks gated behind tiers.

**Tier table (collapsible, shows top 5 by default, "Show all 25" expand):**

| Tier | Title | $CRUDE required |
|---|---|---|
| 25 | Supreme PetroLord | 1,000,000+ |
| 24 | PetroLord | 500,000 |
| 23 | Oil Magnate | 250,000 |
| 22 | Refinery Baron | 100,000 |
| 21 | Crude King | 50,000 |
| ... | ... | ... |
| 1 | Dry Well | 0 |

### Active refinement (only when a refining session is active)

Dense panel showing:

```
Refining session active

Started: 2:14 PM UTC · Ends: 4:42 PM UTC (in 1h 28m)
Locked: 1,240 $CRUDE
Speed up: 0.002 SOL    [Speed up & claim now]

Cancel refinement (forfeits locked $CRUDE) [×]
```

### Empty / not-connected state

**Heading:** `Extract your activity history.`

**Lead:**
> Connect a Solana wallet and we'll index your full transaction history. The first read takes ~30 seconds for active wallets. Subsequent visits are instant.

**CTA:** `Connect Wallet →`


---

## Launchpad Refineries

**Four sub-pages:** `/refinery/launchpad/pump`, `/refinery/launchpad/bonk`, `/refinery/launchpad/bags`, `/refinery/launchpad/candle`.

**Shared structure across all four** — only the launchpad name, branding, and specific mechanics change. Use the structure below for each, with launchpad-specific copy in placeholders.

### Hero

**Eyebrow:** `Launchpad Refinery · {Launchpad name}`

**Headline:** `Refine your {Launchpad} activity.`

**Subhead (for Pump):**
> Earn $CRUDE for trading, deploying, or holding tokens launched on Pump.fun. Every Pump-bonded transaction your wallet makes builds your $CRUDE balance. Rewards are platform-wide — one refinery, every Pump user eligible.

**Subhead (for Bonk):**
> Earn $CRUDE for trading, deploying, or holding tokens launched on Bonk.fun. Same mechanics as the Pump refinery — different launchpad, separate $CRUDE balance.

**Subhead (for Bags):**
> Earn $CRUDE based on your Bags fee positions and trading activity. If you've collected fees from a Bags-launched token, that converts to $CRUDE here. Trades and deploys also count.

**Subhead (for Candle):**
> Earn $CRUDE for trading and deploying tokens on Candle. Fresh launchpad, fresh refinery. Same mechanics as the others.

### Your stats (only when connected)

For Pump / Bonk / Candle:

```
Pump activity     Pump $CRUDE     Pump barrels    Combined $CRUDE     Prestige
2,840 swaps       2,840           56              15,240               Refiner
```

For Bags (richer due to fee positions):

```
Bags fees         Swap activity    Fee $CRUDE    Tx $CRUDE    Total Bags $CRUDE
0.47 SOL          1,420 swaps      940           710          1,650
```

### How it works (sections vary slightly per launchpad)

For Pump / Bonk / Candle:

**01 / We track your launchpad activity**
Every transaction on the launchpad's bonding-curve and post-graduation pools counts.

**02 / Activity converts to $CRUDE**
- 2 swaps = 1 $CRUDE
- 1 token deployment = 100 $CRUDE
- Holding a launchpad token = 0 (holding alone doesn't count for launchpad refineries)

**03 / Refine to lock it in**
30 min – 6 hour timer, same as Solana Refinery.

**04 / Counts toward Reputation**
Launchpad $CRUDE feeds your wallet Reputation, same as Solana Refinery $CRUDE.

For Bags specifically:

**01 / We read your Bags fee positions**
Claimable fees from Bags-launched tokens are read via the Bags API. 1 SOL of fees = 2,000 $CRUDE.

**02 / We index your Bags swap activity**
Swaps on DBC and DAMM programs (Bags' v2) count: 2 swaps = 1 $CRUDE.

**03 / Refine to lock it in**
Same refining mechanics.

**04 / Counts toward Reputation**
Same as other refineries.

### Active refinement / empty / not-connected states

(Same patterns as Solana Refinery — adapt copy with launchpad name.)

---

## Dashboard (`/dashboard`)

**Goal:** Auth-gated. The home base for connected wallets. Three tabs: My Refineries, Claims Received, Reputation.

### Header

```
Dashboard                                                            Hxk2…7gPZ · Reputation 84

[Tab: My Refineries]  [Tab: Claims received]  [Tab: Reputation]
```

### Tab 1 — My Refineries

**Top stats (4 columns):**
```
Refineries operated   Active   Closed    Lifetime distributed
2                     2        0         $14,820
```

**Primary CTA above the table:**
`[Launch a new refinery →]`

**Secondary actions (text links right of CTA):**
`[Launch similar →] [My templates] [Bulk operations]`

**Table (TanStack Table):**

| Token | Status | Pool remaining | Holders claimed | Window left | Action |
|---|---|---|---|---|---|
| BONK | Active | 744K BONK · $2,990 | 240 / 1,247 (19%) | 27 days | [Manage →] |
| JUP | Active | 7,200 JUP · $5,760 | 1,820 / 2,143 (85%) | 12 days | [Manage →] |

**Empty state:**
```
You haven't launched a refinery yet.

Refineries are how you distribute tokens to your holders, on-chain, with reputation-aware sybil filtering. Launch fee is 0.1 SOL.

[Launch your first refinery →]
[Read about the launch flow →]
```

### Tab 2 — Claims received

**Top stats:**
```
Refineries claimed from    Lifetime value    This month   Avg holding before claim
14                          $240              $42          47 days
```

**Table:**

| Token | Amount claimed | When | Refinery operator | Status |
|---|---|---|---|---|
| BONK | 148.8 BONK | 2 hours ago | [✓] Hxk2…7gPZ | Active (more claims available) |
| JUP | 84 JUP | 3 days ago | [✓] 4Bsd…91jU | Active |
| WIF | 840 WIF | 2 weeks ago | [✓] 9wF7…3Lz8 | Active |
| MOTHER | 5,100 MOTHER | 1 month ago | 8zZb…3Ksn | Active |
| MEW | 480,000 MEW | 1 month ago | 6FdN…XnQ2 | Active |
| GIGA | 220,000 GIGA | 2 months ago | 7HpZ…44tL | Closed |
| ... | ... | ... | ... | ... |

**Filter pills:** `[All] [Still active] [Closed] [Claimed last 30 days]`

**Empty state:**
```
You haven't claimed from any refineries yet.

Connect a wallet that holds Solana tokens — we'll auto-detect any refineries you're eligible for.

[Browse refineries →]
```

### Tab 3 — Reputation

**Big number panel (top of tab):**

```
Reputation
84
[trend chart: last 90 days, sparkline showing slow climb]

This wallet is in the top 18% of active wallets.
```

**Breakdown table (signals + weights):**

```
What's contributing to your score

Signal                              Your value     Score impact
Refineries claimed from             14             +18
Avg holding duration before claim   47 days        +12
Tokens still held >7d post-claim    11 / 14        +9
Cluster flag                        clean          0 (not penalized)
Wallet age                          380 days       +6
Refineries launched as operator     2 (verified)   +5
Refineries closed cleanly           0 of 0         0
                                                   —
Total                                              +50 above baseline of 34
```

**Breakdown narrative:**

```
Why your score went up this week

+ 2 from new claim from JUP refinery
+ 1 from continued holding of WIF (>30 days)
- 1 from a flipped position (sold MOTHER within 7 days)

Net: +2 this week.
```

**Action links:**
- `[Read the Reputation methodology →]` (links to `/reputation`)
- `[Export your full breakdown as JSON]`

**Empty state (new wallet, low score):**
```
Your Reputation is just starting.

A new wallet starts at a baseline. Reputation builds as you participate in refineries — claim, hold, and your score grows.

[Browse refineries to claim from →]
```

### Power-operator features (visible in My Refineries tab)

**Launch Similar action (per refinery row):**
- Click `[Manage →]` → dropdown includes `[Launch similar refinery]`
- Opens launch flow Step 3 (skip Step 1 + 2) with all settings pre-filled from the source refinery
- Operator just needs to enter the new pool size + token

**My Templates:**
- Modal listing saved configurations
- Each template: name, snapshot strategy, sybil settings, claim window
- Actions per template: `[Use this →]` `[Edit]` `[Delete]`

**Bulk operations:**
- Modal listing all active refineries with checkboxes
- Bulk actions: `[Pause selected]` `[Top up selected]` `[Close selected]`
- Confirmation required for destructive actions

**Close refinery (graceful end-of-life flow):**
1. Modal asks: `Are you sure? This is irreversible.`
2. Optional message to holders: textarea, character limit 280 ("Visible on the closed refinery page for 6 months")
3. Refund preview: `1,200,000 BONK in pool · 744,000 BONK unclaimed · You will receive 744,000 BONK back`
4. Sign transaction
5. Confirmation: `Refinery closed. 744,000 BONK refunded to your wallet.`


---

## Wallet Profile (`/wallet/[addr]`)

**Goal:** Public-facing reputation page. Shareable URL. Anyone can view any wallet's profile.

### Header

```
[Jdenticon avatar 64×64]    Hxk2…7gPZ    [copy] [view on Solscan ↗]

Reputation 84    [Verified deployer ✓]    Last active 2h ago    Wallet age 380 days
```

### Stats summary (4 columns)

```
Refineries operated      Refineries claimed from     Lifetime $CRUDE    Prestige
2                        14                           28,400              Refiner
```

### Tabs

`[Activity]  [Refineries operated]  [Refineries claimed from]  [Reputation breakdown]`

### Tab 1 — Activity

**Recent on-chain activity (chronological feed, last 50 events):**

```
[icon] Claimed 148.8 BONK from BONK refinery     2h ago
[icon] Claim filtered from POPCAT refinery       4h ago
       Reason: Cluster flag (false positive — appeal in progress)
[icon] Topped up own BONK refinery +6,200 BONK   1d ago
[icon] Launched JUP refinery                     3d ago
[icon] Claimed 84 JUP from another JUP refinery  4d ago
[icon] $CRUDE balance increased to 28,400        1w ago
[icon] Claimed 840 WIF from WIF refinery         2w ago
...
```

### Tab 2 — Refineries operated

**Table:**

| Token | Status | Pool remaining | Total claimed | Lifetime $ | Window left |
|---|---|---|---|---|---|
| BONK | Active | 744K BONK · $2,990 | 240 / 1,247 (19%) | $1,540 | 27 days |
| JUP | Active | 7,200 JUP · $5,760 | 1,820 / 2,143 (85%) | $13,280 | 12 days |

**Below table:**
```
This operator's lifetime stats

Refineries launched     2 (both verified deployer)
Refineries closed       0 (none yet)
Drained early           0
Total distributed       $14,820
Avg claimer reputation  68
```

### Tab 3 — Refineries claimed from

**Same table as Dashboard Tab 2, but public-facing.**

### Tab 4 — Reputation breakdown

**Same as Dashboard Tab 3, but framed as observation rather than self-management.**

```
Hxk2…7gPZ's Reputation

84
[sparkline]

Top 18% of active wallets.

Signal breakdown
[same table as Dashboard]

This wallet has not been flagged for cluster anomaly.
This wallet is not on any operator's denylist.
```

### Empty / not-found states

**Wallet has no activity:**
- Heading: `Hxk2…7gPZ has no Sol Oil Factory activity yet.`
- Body: `This wallet hasn't claimed from or operated any refineries. Reputation: 0 (baseline).`

**Wallet not found / invalid:**
- Heading: `That wallet address isn't valid.`
- Body: `Solana wallet addresses are 32-44 characters. Check the address and try again.`

### Sharing

**Dynamic OG image:**
- Background: dark theme by default
- Centered: avatar + truncated address + reputation score (large)
- Below: "Sol Oil Factory · Reputation Layer for Solana"

---

## Leaderboard (`/leaderboard`)

**Goal:** Cross-refinery social proof. Multiple leaderboards across product surfaces.

### Header

```
Leaderboard

Refresh: every 60s · Last updated: 2 minutes ago
```

### Tabs

`[$CRUDE]  [Top operators]  [Top claimers]  [Top reputation]`

### Tab 1 — $CRUDE leaderboard

**Top 100 wallets by total $CRUDE balance (Solana Refinery + Launchpad refineries combined).**

**Table:**

| Rank | Wallet | Reputation | $CRUDE | Prestige | Active refineries |
|---|---|---|---|---|---|
| 🥇 1 | Hxk2…7gPZ | 84 | 28,400 | Refiner | 2 |
| 🥈 2 | 4Bsd…91jU | 67 | 24,820 | Refiner | 1 |
| 🥉 3 | 9wF7…3Lz8 | 51 | 22,140 | Junior Refiner | 0 |
| 4 | RayLi…D9pT | 71 | 19,840 | Junior Refiner | 8 |
| 5 | Pyth9…D7ax | 68 | 18,200 | Junior Refiner | 5 |
| ... | ... | ... | ... | ... | ... |
| 100 | OrcaT…D7vM | 64 | 6,420 | Apprentice | 12 |

> Use a small medal SVG for top 3 ranks (gold/silver/bronze). Not emoji.

### Tab 2 — Top operators

**By lifetime tokens distributed (USD value).**

| Rank | Operator | Refineries | Lifetime distributed | Avg claimer reputation |
|---|---|---|---|---|
| 1 | RayLi…D9pT | 8 | $284,200 | 71 |
| 2 | Pyth9…D7ax | 5 | $189,400 | 68 |
| 3 | OrcaT…D7vM | 12 | $156,800 | 64 |
| 4 | Hxk2…7gPZ | 2 | $14,820 | 78 |
| 5 | MndS…DwY3 | 4 | $11,200 | 62 |
| ... | ... | ... | ... | ... |

### Tab 3 — Top claimers (across token refineries)

| Rank | Wallet | Refineries claimed | Lifetime claimed value | Avg holding |
|---|---|---|---|---|
| 1 | Hxk2…7gPZ | 14 | $240 | 47 days |
| 2 | 4Bsd…91jU | 9 | $182 | 23 days |
| 3 | 9wF7…3Lz8 | 22 | $156 | 12 days |
| ... | ... | ... | ... | ... |

### Tab 4 — Top reputation scores

| Rank | Wallet | Reputation | Refineries claimed | Refineries operated | Wallet age |
|---|---|---|---|---|---|
| 1 | Hxk2…7gPZ | 84 | 14 | 2 (verified) | 380d |
| 2 | RayLi…D9pT | 71 | 6 | 8 (verified) | 720d |
| 3 | Pyth9…D7ax | 68 | 4 | 5 (verified) | 540d |
| ... | ... | ... | ... | ... | ... |

### Filter / sort controls (above each table)

- Time period: `All time · This year · This month · This week`
- Verification: `All operators · Verified deployer only · Verified CTO only`

### Mobile

Tables collapse to stacked card rows. Each row shows rank prominently.


---

## Reputation Methodology (`/reputation`)

**Goal:** Differentiator page. Public methodology. Reads as "trust us — and verify."

### Hero

**Eyebrow:** `The Reputation Layer`

**Headline:** `How we score wallets, in full.`

**Lead:**
> Reputation is the long-term moat of Sol Oil Factory. The score follows wallets across every refinery. Operators rely on it as a sybil filter. Holders carry it across the Solana ecosystem.
>
> This page explains exactly how the score is computed. Nothing is hidden. The methodology is intentionally open — if you can game it, we want to know.

### Section 1 — What the score measures

**Heading:** `What the score measures`

**Body:**
> Reputation is a 0–100 score for a wallet's *participation quality* on Sol Oil Factory and the broader Solana ecosystem. It's not a credit score. It's not a moral judgment. It's a single number that captures: have you been here a while, did you act like a real holder, did you stick around after claiming?

### Section 2 — The signal table

**Heading:** `Signals that build the score`

**Full table:**

| Signal | Weight | What it tracks | What raises it | What lowers it |
|---|---|---|---|---|
| Refineries claimed (recent) | High | Total successful claims, weighted by recency | Each new claim from a refinery | None — score doesn't decrease for not claiming |
| Holding duration before claim | High | Average days between buy and claim | Holding ≥ 7 days before claiming | Flipping (selling within 24h of buy) |
| Post-claim retention | Medium-high | Tokens still held >7 days after you claim them | Holding the token for 7+ days post-claim | Selling tokens within 7 days of claim |
| Wallet age | Medium | Days of any chain activity | Older wallets score higher | New wallets start lower (not zero) |
| Refineries launched (verified) | Medium | Refineries you've operated as Verified deployer or Verified CTO | Each verified refinery you launch | Launching unverified doesn't count negatively |
| Refineries closed cleanly | Low-medium | Refineries you closed with full distribution (not drained early) | Each clean close | Each drained close (operator pulled liquidity early) |
| Cluster flag | Penalty | Wallets funded by same source share a flagged cluster | Clear cluster (no flag) = 0 impact | Flagged cluster = significant penalty |
| Cross-refinery diversity | Low | Number of distinct tokens claimed from | Claiming from many different refineries | Claiming from one refinery many times has diminishing returns |

### Section 3 — Score decay

**Heading:** `Why scores decay over time`

**Body:**
> A high score earned in one big push, then nothing for a year, decays. Scores reflect *current* participation quality, not lifetime achievement.
>
> Decay is gradual: ~5 points lost per 90 days of complete inactivity. Active claiming and operating restore points immediately. The decay protects against "achievement gaming" — earning a high score then quitting the platform.

### Section 4 — How to raise your score

**Heading:** `What raises your score`

**Bullet list:**
- Claim from refineries (each claim is +signal)
- Hold tokens before claiming (don't snipe, hold)
- Hold tokens after claiming (don't flip)
- Maintain wallet activity (any chain activity counts toward wallet age)
- Launch verified refineries as an operator
- Close refineries cleanly (full distribution)

### Section 5 — How to lose your score

**Heading:** `What lowers your score`

**Bullet list:**
- Be in a flagged cluster (wallets funded by same source as known sybil farms)
- Flip tokens within 24 hours of buying or claiming
- Long inactivity (decay applies)
- Launch a refinery and drain it without distributing (operator behavior matters)

### Section 6 — Cluster detection

**Heading:** `How cluster detection works`

**Body:**
> Cluster detection identifies groups of wallets that behave like a single entity — funded from the same source, transacting together, claiming from the same refineries within suspiciously similar time windows.
>
> When a cluster is detected, all wallets in it share a single Reputation calculation rather than each gaming the score independently. This is what lets us protect refinery operators against sybil farming without forcing KYC.
>
> The exact cluster heuristics are not published — exposing them would help attackers evade detection. We commit publicly to:
> - Cluster detection runs daily, with appeals possible.
> - False positives are corrected within 7 days of an appeal.
> - Cluster flags expire after 90 days of clean activity from the wallet.

### Section 7 — Appealing a cluster flag

**Heading:** `If you've been wrongly flagged`

**Body:**
> If your wallet is flagged for a cluster you don't belong to, file an appeal:
> 1. Go to your Wallet Profile (`/wallet/<your-addr>`)
> 2. Click "Reputation breakdown" tab
> 3. If a cluster flag is shown, click "Appeal this flag"
> 4. Provide context: where the wallet was funded from, how long you've used it, etc.
> 5. We review within 7 business days.

### Section 8 — Open data

**Heading:** `Export your full breakdown`

**Body:**
> Every wallet can export its full Reputation breakdown as JSON. The data includes every signal, the value, the weight, the contribution to score, and the timestamp of each event.
>
> [Export your reputation data as JSON →]
>
> Operators can also access aggregate reputation data via the public API (see `/developers`).

### Section 9 — What Reputation does not do

**Heading:** `What Reputation does NOT do`

**Body:**
> - Reputation does not decide *if* you can claim from a refinery — that's set by each operator's sybil rules
> - Reputation is not a financial credit score — no lender uses it
> - Reputation does not mean we vouch for a wallet's intentions — it's a behavioral measurement, not a character endorsement
> - Reputation is not transferable — it lives at the wallet address, not the human
> - Reputation does not affect $CRUDE balance or prestige tier — those are separate systems

---

## Trust (`/trust`)

**Goal:** Public infrastructure proof. Operators send their team here to verify the platform isn't vaporware. Real-time, sparse, factual.

### Hero (small, factual)

**Eyebrow:** `Trust & status`

**Headline:** `Live system status. Public audit log.`

**Lead (Body L):**
> Real-time view of Sol Oil Factory's infrastructure: indexer health, RPC latency, audit status, lifetime metrics, and program addresses for verification.

**Right-side small panel:**
```
[● operational]    System status: All systems operational
                   Last incident: None to date.
```

### Section 1 — System status (live, auto-refreshing every 60s)

**Heading:** `System status`

**4-column grid of live status indicators:**

```
Helius RPC                       Indexer
● operational                    ● operational
Latency p50: 84ms                Lag: 6s behind chain
Latency p99: 412ms               Last block ingested: 4s ago

Refinery program                 Reputation recompute
● operational                    ● operational
Last upgrade: 14 days ago        Last run: 18h ago
0 incidents this quarter         12,400 wallets indexed
```

### Section 2 — Audit & bug bounty

**Heading:** `Audit & bug bounty status`

**Status grid:**

```
On-chain program audit
[Pending] OtterSec audit scheduled Q3 2026
Budget: $30k–80k (Solana Foundation grant applied for)
Until audit complete: devnet only

Bug bounty
[Pending] Immunefi bounty live at $50k tier
Will activate concurrent with audit completion
Devnet bounty available: report bugs at security@solanaoilfactory.xyz

Frontend audit
None planned (auditing on-chain code only)

Smart contract source
[GitHub: solanaoilfactory/anchor-program ↗]
[Solscan: program ID Esc5K…ABCD ↗]
```

### Section 3 — Lifetime metrics

**Heading:** `Lifetime metrics`

**6-column grid:**

```
Refineries launched           Active refineries           Closed cleanly
1,840                         247                          1,520

Wallets verified              Lifetime distributed        Lifetime claims
12,400                        $284,200                     46,800
```

### Section 4 — Program addresses (technical)

**Heading:** `Program addresses & deployments`

**Table:**

| Program | Address | Last upgrade | Solscan |
|---|---|---|---|
| Refinery program (devnet) | `Esc5K2A8Z…ABCD` | May 7, 2026 | [view ↗] |
| Reputation oracle (devnet) | `Rep7Y…XYZ1` | May 7, 2026 | [view ↗] |
| Treasury PDA (devnet) | `Treas9…0010` | — | [view ↗] |
| Refinery program (mainnet) | (not deployed) | — | — |

### Section 5 — Incident log

**Heading:** `Incident log`

**Body:**
> No incidents to date.
>
> When an incident occurs, it will be posted here within 4 hours, including: what happened, who was affected, what we did to resolve it, and what we changed to prevent recurrence.

(In the absence of incidents, this is genuinely the right copy. Don't manufacture incidents to look transparent.)

### Section 6 — How to report a problem

**Heading:** `Report a problem`

**Body:**
> - Security vulnerability: `security@solanaoilfactory.xyz` (PGP key: [link])
> - Refinery dispute (claim wrongly filtered, false cluster flag, etc.): use the appeal flow on your `/wallet/<addr>` page
> - General problem: `support@solanaoilfactory.xyz` or our [Discord ↗]


---

## Developers (`/developers`)

**Goal:** Signal that Sol Oil Factory is infrastructure, not just a product. The reputation API is the long-term moat — this page is where developers learn to consume it.

### Hero

**Eyebrow:** `For developers`

**Headline:** `Build on the reputation layer for Solana.`

**Lead:**
> Sol Oil Factory's Reputation system is consumable as a public API. Use it to filter sybil farms from your own airdrops, weight participation in your protocol, or display reputation badges in your interface.

**CTA row:**
- Primary: `Read the API docs →`
- Secondary: `Get an API key →`

### Section 1 — What you can do with the API

**Heading:** `Use cases`

**3-column row (visually distinct, not identical cards):**

**Sybil filter for airdrops**
> Before distributing your token, query Reputation for the eligible wallet list. Filter wallets below your threshold. Save 30-50% of pool from going to sybil farms.

**Weight participation in your protocol**
> Use Reputation to weight rewards, voting power, or fee tiers. Higher score = better treatment, transparently and on-chain.

**Display reputation badges in your UI**
> Show "Reputation 84" or "Top 18%" next to wallet addresses in your product. Auto-updates as wallets accrue or lose score.

### Section 2 — Quick start

**Heading:** `Quick start`

**Body:**
> Three steps to your first API call.

**Step 1 — Get an API key**
```
Sign up at solanaoilfactory.xyz/developers and connect your wallet.
Free tier: 10,000 requests/month.
Production tier: $99/mo for 1M requests, custom for higher volume.
```

**Step 2 — Make your first call**

```bash
curl https://api.solanaoilfactory.xyz/v1/reputation/Hxk2pYz8sN9wF73Lz8AKKM7gPZ \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Step 3 — Read the response**

```json
{
  "wallet": "Hxk2pYz8sN9wF73Lz8AKKM7gPZ",
  "reputation": 84,
  "tier_label": "top 18%",
  "last_recomputed": "2026-05-09T14:32:00Z",
  "signals": {
    "refineries_claimed": 14,
    "avg_holding_days": 47,
    "post_claim_retention_rate": 0.78,
    "cluster_flag": "clean",
    "wallet_age_days": 380,
    "refineries_operated_verified": 2
  },
  "history_url": "https://api.solanaoilfactory.xyz/v1/reputation/.../history"
}
```

### Section 3 — Available endpoints

**Heading:** `Endpoints`

**Table:**

| Endpoint | Method | What it returns |
|---|---|---|
| `/v1/reputation/{wallet}` | GET | Full Reputation breakdown for a wallet |
| `/v1/reputation/{wallet}/history` | GET | Historical Reputation values, last 90 days |
| `/v1/reputation/batch` | POST | Reputation for up to 1,000 wallets in one call |
| `/v1/refineries` | GET | List active refineries (paginated) |
| `/v1/refineries/{mint}` | GET | All refineries for a token mint |
| `/v1/refineries/{id}` | GET | Specific refinery details |
| `/v1/refineries/{id}/holders` | GET | Eligible holders for a refinery (operator-auth required) |
| `/v1/wallets/{wallet}/eligibility` | GET | Refineries this wallet is eligible for |
| `/v1/leaderboard` | GET | Cross-refinery leaderboards |

### Section 4 — Embed widget

**Heading:** `Embed a refinery on your site`

**Body:**
> One line of JavaScript. Auto-styled to match your theme.

**Code sample:**

```html
<div id="sof-refinery-embed"
     data-mint="DezX5pYz8sN9wF73Lz8AKKM"
     data-theme="auto"></div>

<script src="https://embed.solanaoilfactory.xyz/v1/refinery.js"></script>
```

**Below the code:**
- Live preview of what it looks like (mock embed showing BONK refinery)
- Customization options (theme, size, fields shown)

### Section 5 — Pricing

**Heading:** `Pricing`

**3-tier pricing table:**

```
Free tier              Production              Enterprise
Free                    $99/mo                 Custom

10,000 requests/mo      1,000,000 requests/mo  Custom volume
1 API key              5 API keys             Unlimited keys
Community support      Email support          SLA, dedicated support
                                              On-prem option
                                              Custom integrations

[Get started free →]   [Subscribe →]          [Contact sales →]
```

### Section 6 — Rate limits & errors

**Heading:** `Rate limits & errors`

**Body:**
> All tiers have per-second rate limits in addition to per-month volume:
> - Free: 5 req/sec
> - Production: 100 req/sec
> - Enterprise: custom
>
> When rate-limited, the API returns `429 Too Many Requests` with `Retry-After` header. Handle gracefully with exponential backoff.

### Section 7 — Status & changelog

**Heading:** `Status & changelog`

**Body:**
> - API uptime: 99.9% target (see `/trust` for live status)
> - Versioning: `/v1` is current. We commit to 12-month deprecation notice for breaking changes.
> - Changelog: [github.com/solanaoilfactory/api-changelog ↗]

### Section 8 — Resources

**Heading:** `Resources`

**Cards:**
- `[Full API reference ↗]`
- `[SDK: TypeScript / JavaScript ↗]`
- `[SDK: Python ↗]`
- `[Webhook docs ↗]`
- `[Status page ↗]`

---

## Help Center

### Index page (`/help`)

**Hero:**
**Eyebrow:** `Help Center`
**Headline:** `Find answers, fast.`
**Lead:** `Start with the question. We'll show the article. Search across everything we've documented.`

**Search bar (large, sticky on scroll):**
- Placeholder: `Search articles…`

**Categories grid (3 columns desktop, 1 mobile):**

```
For Holders                          For Operators                       Concepts
What is a refinery?                  How do I launch a refinery?         How does the snapshot work?
How do I claim?                      What does the 1% deposit fee do?   Pro-rata vs FCFS
Why am I not eligible?               How do I top up my pool?            Token-2022 transfer fees
What is reputation?                  When can I withdraw?                What is custody?
How do I check my balance?           How does the sybil filter work?     Verification badges
                                     How do I close a refinery?          Reputation methodology
```

**Discord link below grid:**
```
Can't find what you're looking for? Ask in our [Discord ↗].
```

### Article page (`/help/[slug]`)

**Layout:** Single column, max-width 720px, generous reading rhythm.

**Header:**
- Breadcrumb: `Help Center › For Holders › What is a refinery?`
- Article title (Display 700, large)
- Meta: `Last updated: May 9, 2026 · 4 min read`

**Article body:** Markdown-rendered. Body L (17px) with line-height 1.7.

**Article example — "What is a refinery?":**

```
# What is a refinery?

A refinery is an on-chain distribution program. An operator (someone running the refinery) deposits tokens into a program-owned PDA escrow. Holders of the token can then connect their wallet and claim a share of the pool.

The refinery enforces all the rules itself, on-chain. Sol Oil Factory does not hold the tokens — only the audited program does.

## The three refinery types

There are three refinery types on Sol Oil Factory:

1. **Solana Refinery** — Earn $CRUDE for any Solana on-chain activity. No operator, no token deposit. The chain itself is the source.

2. **Launchpad Refineries** — Pump, Bonk, Bags, Candle. Earn $CRUDE for activity on each launchpad. One refinery per launchpad, platform-wide rewards.

3. **Token Refineries** — Anyone can launch a refinery for any Solana token. The actual token is distributed to verified holders.

## What "non-custodial" means

The Sol Oil Factory team holds zero keys to refinery escrow. Tokens move only when:
- An operator triggers a withdrawal (subject to claim window + 7-day cooldown)
- A holder triggers a claim (subject to eligibility + sybil rules)
- A holder triggers a refinery close (refunds remaining pool)

The on-chain program enforces all of this. We can't override it. Read the full custody model on the [Trust page →](/trust).

## Related articles

- [How do I claim from a refinery?](/help/how-do-i-claim)
- [Why am I not eligible?](/help/why-am-i-not-eligible)
- [What is reputation?](/help/what-is-reputation)

[← Back to Help Center](/help)

Still confused? Ask on our [Discord ↗](https://discord.gg/solanaoilfactory).
```

**Footer of every article:**
- Related articles list
- Discord CTA
- "Was this article helpful?" yes/no buttons (sends feedback to internal)

### Empty / search states

**No search results:**
- `No articles found for "<query>".`
- `Try a different search, or [browse all articles →]`
- `Or ask in our [Discord ↗] — we'll add an article if it's a recurring question.`


---

## Legal

### `/legal/terms`

(See separate ToS document — `sof-tos-privacy.md` — for full Terms of Service text. The page itself is a long-form text page with table of contents, generous reading width, and the ToS rendered as markdown.)

**Page-level structure:**
- Hero: `Terms of Service` + `Last updated: May 9, 2026`
- Table of contents (sticky, left rail desktop, collapsible drawer mobile):
  1. Introduction
  2. The platform
  3. Eligibility
  4. Wallet & non-custody
  5. Refineries
  6. Reputation
  7. Fees
  8. Risks & disclaimers
  9. Prohibited activities
  10. Operator obligations
  11. Intellectual property
  12. Indemnification
  13. Liability
  14. Dispute resolution
  15. Termination
  16. Modifications
  17. Contact
- Body: Body L typography, generous line-height
- Footer: print/copy-link buttons

### `/legal/privacy`

(See separate Privacy Policy document — same `sof-tos-privacy.md` file — for full text.)

**Page-level structure:**
- Hero: `Privacy Policy` + `Last updated: May 9, 2026`
- Table of contents (sticky, left rail desktop):
  1. What we collect
  2. What we don't collect
  3. How we use what we collect
  4. Sharing & disclosure
  5. Data retention
  6. Your rights
  7. Cookies & analytics
  8. Children
  9. International users
  10. Changes
  11. Contact
- Body: Body L typography
- Footer: print/copy-link buttons

---

## 404 — Not Found

**Layout:** Full-screen centered, no sidebar, no top bar.

**Eyebrow (mono, muted):**
`Error 404 · Refinery not found`

**Headline (Display 700, large):**
`This page isn't here.`

**Body (Body L, max-width 480px):**
> Either the page moved, the URL is wrong, or it never existed. Either way, here's where you can go from here.

**Buttons row (4 outline buttons):**
`[← Home]   [Browse Refineries]   [Leaderboard]   [Help Center]`

**Mono note at bottom:**
`If you think something's broken, let us know: support@solanaoilfactory.xyz`

---

## Mock Data Master Reference

This section consolidates all mock data used across pages. Use these exact names, addresses, and numbers everywhere.

### Mock tokens (12 active refineries)

| Token | Symbol | Mint (truncated) | Operator | Pool | Holders | Claim rate (per 1%) | Status | Snapshot | Verified |
|---|---|---|---|---|---|---|---|---|---|
| Bonk | BONK | DezX5p…AKKM | Hxk2…7gPZ | 1.2M BONK · $4,820 | 1,247 | 12,000 BONK | Active | At launch | Verified deployer |
| Jupiter | JUP | JUPyiW…dpvS | 4Bsd…91jU | 8,400 JUP · $6,720 | 2,143 | 84 JUP | Active | Daily | Verified deployer |
| dogwifhat | WIF | EKpQHm…WFkW | 9wF7…3Lz8 | 84,000 WIF · $168,000 | 8,920 | 840 WIF | Active | At launch | Verified CTO |
| Popcat | POPCAT | 7GCihg…W5cy | 2zKp…hH4M | 142,000 POPCAT · $85,200 | 4,506 | 1,420 POPCAT | Active | Hourly | Unverified |
| Pyth | PYTH | HZ1JqV…3pH3 | Pyth9…D7ax | 41,000 PYTH · $14,350 | 6,201 | 410 PYTH | Closing soon | Weekly | Verified deployer |
| Jito | JTO | jtojto…1zb | 5jVq…78dM | 12,500 JTO · $28,750 | 3,847 | 125 JTO | Active | At launch | Verified deployer |
| Mother Iggy | MOTHER | 3S8qG…iyDM | 8zZb…3Ksn | 510,000 MOTHER · $1,840 | 1,128 | 5,100 MOTHER | Active | Daily | Unverified |
| MEW | MEW | MEW1g…tmZA | 6FdN…XnQ2 | 48M MEW · $240 | 22,144 | 480,000 MEW | Active | At launch | Unverified |
| Raydium | RAY | 4k3Dy…mq56 | RayLi…D9pT | 6,200 RAY · $14,200 | 4,891 | 62 RAY | Active | Daily | Verified deployer |
| Orca | ORCA | orcaE…Fnq3 | OrcaT…D7vM | 9,400 ORCA · $23,500 | 3,012 | 94 ORCA | Active | At launch | Verified deployer |
| Marinade | MNDE | MNDEF…YFu8 | MndS…DwY3 | 55,000 MNDE · $8,250 | 7,820 | 550 MNDE | Active | Weekly | Verified deployer |
| GIGACHAD | GIGA | 63LfDm…3eQy | 7HpZ…44tL | 22M GIGA · $820 | 14,302 | 220,000 GIGA | Closed | At launch | Unverified |

### Mock wallets (6 reference, with reputation breakdown)

| Wallet | Reputation | Refineries claimed | Avg holding | Refineries launched | Cluster | Wallet age | $CRUDE | Prestige |
|---|---|---|---|---|---|---|---|---|
| Hxk2…7gPZ | 84 | 14 | 47d | 2 (verified) | clean | 380d | 28,400 | Refiner |
| 4Bsd…91jU | 67 | 9 | 23d | 1 | clean | 220d | 24,820 | Refiner |
| 9wF7…3Lz8 | 51 | 22 | 12d | 0 | clean | 510d | 22,140 | Junior Refiner |
| 2zKp…hH4M | 42 | 6 | 38d | 0 | clean | 95d | 18,400 | Junior Refiner |
| 8zZb…3Ksn | 21 | 31 | 4d | 0 | flagged (cluster of 12) | 60d | 8,200 | Apprentice |
| 7HpZ…44tL | 8 | 47 | 1d | 0 | flagged (cluster of 38) | 18d | 1,400 | Dry Well |

### Mock activity feed (12 events, mix into screens)

```
[avatar] Hxk2…7gPZ      claimed 148.8 BONK              · 2m ago
[avatar] 4Bsd…91jU      claimed 12,000 BONK             · 5m ago
[avatar] 9wF7…3Lz8      claimed 84 JUP                  · 8m ago
[avatar] 2zKp…hH4M      claimed 1,420 POPCAT            · 12m ago
[avatar] 8zZb…3Ksn      claimed 220,000 GIGA            · 14m ago
[avatar] 7HpZ…44tL      claimed 5,100 MOTHER            · 19m ago
[avatar] 6FdN…XnQ2      claimed 480,000 MEW             · 22m ago
[avatar] RayLi…D9pT     topped up pool +6,200 RAY       · 35m ago
[avatar] OrcaT…D7vM     paused refinery (operator)      · 1h ago
[avatar] MndS…DwY3      claim window extended +7d       · 2h ago
[avatar] Hxk2…7gPZ      launched BONK refinery          · 4h ago
[avatar] Pyth9…D7ax     snapshot taken — 6,201 holders  · 4h ago
```

### Mock leaderboard (top 5 operators)

| # | Operator | Refineries | Lifetime distributed | Avg claimer reputation |
|---|---|---|---|---|
| 1 | RayLi…D9pT | 8 | $284,200 | 71 |
| 2 | Pyth9…D7ax | 5 | $189,400 | 68 |
| 3 | OrcaT…D7vM | 12 | $156,800 | 64 |
| 4 | Hxk2…7gPZ | 2 | $14,820 | 78 |
| 5 | MndS…DwY3 | 4 | $11,200 | 62 |

### System-wide stats (use across surfaces)

```
Refineries launched lifetime           1,840
Active refineries                      247
Closed refineries (last 30d)           89
Wallets verified                       12,400
Lifetime $ distributed                 $284,200
Lifetime claims                        46,800
Helius RPC latency p50                 84ms
Helius RPC latency p99                 412ms
Indexer lag                            6s
Last block ingested                    4s ago
Reputation recompute                   18h ago, 12,400 wallets indexed
Refinery program last upgrade          14 days ago
```

---

## Document end

**Total routes documented:** 20
**Last updated:** 2026-05-09
**Status:** Complete v1 — ready for design tool consumption.

If something is missing, add it to this document first, then implement.


---

# Addendum — Backend-Surfaced States (v1.1)

This section adds 8 frontend states discovered during cross-check against the Anchor program (`sol-oilfactory-program` commit `12d0543`) and frontend integration guide. None of these break existing decisions — they fill gaps in state coverage.

## Gap 1 — Rate Limit / Service Degraded States

### Tier 6 — Rate limited (new toast tier between trivial and error)

**When triggered:**
- Helius RPC returns 429
- Indexer API returns 429
- Wallet connection rate limited

**Toast copy:**
- `Rate limited. Retrying in 3 seconds…`
- `Service is busy. Try again in a moment.`
- `Too many requests. Please wait.`

**Visual treatment:**
- Persistent until resolved (auto-retry happens automatically)
- Amber border (between trivial gray and error red)
- Includes countdown timer when retry is scheduled
- Cancel button available

### Service Degraded Banner (system-wide)

**When triggered:**
- Indexer behind by >5 minutes
- Helius latency p99 >2 seconds
- Multiple consecutive 5xx errors

**Banner copy (across top of every page, below network warning if both):**

```
⚠ Some data may be delayed. Indexer is 8 minutes behind chain. [details →]
```

**Detail panel (when "details" is clicked):**

```
Service status

Helius RPC          ● slow (p99: 2.4s)
Indexer             ⚠ degraded (lag: 8m)
Reputation          ● operational

Some data on this site may be slightly stale. We're working to restore normal speed.

For real-time chain data, you can always view the relevant transactions on Solscan.

[Visit /trust for full status]
```

## Gap 2 — Indexer-Down Fallback States

### Single Refinery — State E (Eligible but proof unavailable)

(Adds to the 4 existing eligibility states on Single Refinery page.)

**When triggered:**
- User's wallet holds the token (Helius DAS confirms)
- Snapshot exists on-chain
- BUT: indexer can't return merkle proof (service down or syncing)

**Display in claim block:**

```
You appear eligible

Your wallet holds 12,400 BONK at the most recent snapshot. The claim service is temporarily unavailable to compute your proof.

[Refresh status →]    Auto-retries every 30 seconds.

We'll automatically attempt your claim when service is restored. You can also try again manually.
```

**Behavior:**
- Auto-refresh every 30 seconds
- Shows last-attempt timestamp
- Manual refresh button always available
- Falls back to a "Read about why this happens" help article link

## Gap 3 — Pre-Claim ATA Creation Flow

### Single Refinery — Claim block, first-time-for-token state

**When triggered:**
- User is eligible to claim
- User does NOT have an Associated Token Account for this mint yet
- We'll create the ATA in the same transaction as the claim

**Display in claim block:**

```
First-time claim for this token

You don't have a BONK token account yet. We'll create one in the same transaction.

You'll claim:        148.8 BONK
Network fee:         ~0.001 SOL
Token account rent:  ~0.002 SOL (refundable when account is closed)
Claim fee:           0.001 SOL
─────────────────────────────────────
Total cost:          ~0.004 SOL
You'll receive:      148.8 BONK

[Claim 148.8 BONK →]
```

**Helper text below button:**
`The 0.002 SOL rent stays in your token account. You can recover it later by closing the account if you no longer hold BONK.`

## Gap 4 — Snapshot-Pending States

### Single Refinery — Status: Pending Snapshot

**When triggered:**
- Refinery status is `Active` on-chain
- BUT: `current_snapshot_index == 0` (no snapshot yet)
- This is the gap between launch and first snapshot (~1-5 minutes for at-launch strategy)

**Replaces the claim block on Single Refinery page:**

```
Refinery active, awaiting first snapshot

This refinery launched 3 minutes ago. The first snapshot is being computed — we're indexing eligible holders and building the merkle root.

Claims will open as soon as the snapshot is ready.

[Snapshot in progress] · Auto-refreshes every 30s
Estimated time remaining: ~1 minute
```

**Above the "Activity" feed:**
Show only operator events (launch, deposit) — no claims yet possible.

### Operator Dashboard — My Refineries column behavior

**Status column for refineries with no snapshot yet:**
- Shows `[Pending snapshot]` chip (blue/info color) instead of `[Active]`
- Tooltip: `Refinery is active but awaiting first snapshot. Claims open once snapshot completes.`

## Gap 5 — Token-2022 Transfer Fee Disclosure on Claim

### Single Refinery — Claim block with Token-2022 transfer fee

**When triggered:**
- Eligible, ready to claim
- Mint has Token-2022 TransferFee extension active

**Display in claim block (additional row above the claim button):**

```
You can claim 148.8 BONK now.

⚠ This token has a 1% transfer fee.
   You'll receive ~147.3 BONK after the fee is deducted by the token program.
   Operator deposited 148.8 BONK on your behalf — the fee is taken at transfer time.

Network fee:    ~0.001 SOL
Claim fee:      0.001 SOL
You'll receive: ~147.3 BONK (after 1% transfer fee)

[Claim 148.8 BONK →]
```

**On any refinery card / row showing transfer-fee tokens:**
Add inline annotation: `(transfer fee: 1%)` next to claim rate.

Example in directory table:
```
Claim rate: 1% = 12,000 BONK (transfer fee: 1%)
```

## Gap 6 — Frozen Account Error Handling

### Tier 3 Error — Frozen ATA (specific error state)

**When triggered:**
- Claim transaction fails with token-program error indicating account is frozen
- This is distinct from generic "claim failed"

**Toast copy (Tier 3, persistent):**

```
Claim failed: your token account is frozen

The freeze authority for BONK has frozen your token account, blocking the transfer.

This is a token-level action by the BONK team — Sol Oil Factory cannot unfreeze accounts.

[Read about freeze authority →]    [Retry claim]
```

**Help center article needed:** `What is freeze authority and why might my account be frozen?`

**Single refinery page behavior after this error:**
- Claim block changes to State F (new): "Account frozen"
- Display:
```
Your BONK account is frozen

The freeze authority has frozen your token account. The freeze authority is set by the token's project team — contact them about thawing.

You can still claim from this refinery once your account is unfrozen.

[Read about freeze authority →]
```

## Gap 7 — Cluster-Aware URL Construction

### Implementation note (affects every external link)

**All Solscan links must include cluster parameter:**
- Devnet: `https://solscan.io/tx/<sig>?cluster=devnet`
- Mainnet: `https://solscan.io/tx/<sig>` (no param needed)

**Birdeye links:**
- Devnet: `https://birdeye.so/token/<mint>?chain=solana-devnet`
- Mainnet: `https://birdeye.so/token/<mint>?chain=solana`

**Trust page program addresses:**
- Auto-update based on `NEXT_PUBLIC_SOLANA_CLUSTER` env var
- Devnet program: `2tPLLPQeLLNL4UDBbeagSUAABJcB3fHGTJaLGEzrx3rE`
- Mainnet program: TBD at deploy

**Footer trust strip:**
- "Audited by [pending]" stays consistent
- Lifetime metrics auto-update from current cluster only (devnet metrics stay separate from mainnet metrics)

## Gap 8 — Epoch Advancement UX (Holder-Facing)

### Single Refinery — Notice when epoch advanced since user's last claim

**When triggered:**
- User connected and was eligible / claimed in a previous epoch
- Operator has called `update_rate` since then
- Current epoch ≠ epoch of user's last claim

**Banner above claim block (one-time per epoch, dismissible):**

```
This refinery's rules changed

Operator advanced to epoch 2 on May 9, 2026 at 14:32 UTC.

Changes:
• Per-claim cap: 5% → 8% of pool
• Snapshot strategy: At launch → Hourly
• Claim window extended: +30 days (now closes Jun 15)

Your next claim will follow the new rules.

[Read more about epoch changes →]    [Dismiss]
```

**Activity feed entry style:**

```
[icon] Operator advanced to epoch 2          14:32 UTC · 4h ago
       Per-claim cap: 5% → 8%
       Snapshot strategy: At launch → Hourly
       Window extended: +30 days
```

**Wallet profile activity tab:**
Show epoch-advancement events from refineries the user has interacted with.

---

## Updated State Reference — Single Refinery Page

The Single Refinery page now has **6 distinct claim-block states** instead of 4:

| State | When | Display |
|---|---|---|
| A — Not connected | No wallet | "Connect wallet to check eligibility" |
| B — Eligible | Wallet connected, in snapshot, not yet claimed | Standard claim block with amount + button |
| C — Already claimed | Wallet connected, ClaimReceipt PDA exists | "Claimed X on date · [Solscan link]" |
| D — Not eligible | Wallet connected, NOT in snapshot | "Buy + wait for next snapshot" |
| E — Eligible but proof unavailable | NEW: Holds token but indexer down | "You appear eligible · [Refresh →]" |
| F — Account frozen | NEW: Claim failed due to freeze | "Account frozen · contact token team" |

Plus the **3 refinery-level states** (orthogonal to claim block):
- Refinery active (claim block shown)
- Refinery operator-paused (claim block disabled, banner shown)
- Refinery pending-snapshot (claim block replaced with "awaiting snapshot")

Plus **2 platform-level states**:
- Platform paused (full-width banner across all pages)
- Service degraded (full-width banner with detail link)

Plus the **wrong-network state**:
- Persistent red banner across all pages

## Updated Notification Tier System

Original four tiers + new tier:

| Tier | Use case | Auto-dismiss | Visual |
|---|---|---|---|
| 1 — Trivial | Theme switched, address copied | 4s | Small toast |
| 2 — Action confirmation | Refinery launched, tokens claimed | 8s | Toast + tx link |
| 3 — Errors | Tx rejected, network error | 10s persistent | Red border |
| 4 — Stakes alerts | Pool low, refinery paused | None (in-app panel) | Persistent |
| 5 — Live activity | Wallet just claimed | None (inline feed) | Activity row |
| 6 — Rate limited (NEW) | API rate limit, retry pending | Auto-resolve | Amber border + countdown |

