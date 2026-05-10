# 05 — Design Prompt

**Audience:** Anyone using AI design tools to generate mockups
**Purpose:** Master prompt for HTML mockup generation

---

# Sol Oil Factory — Master Design Prompt

**For:** Claude (or any frontend design tool capable of generating interactive HTML mockups)
**Output target:** HTML mockups in artifacts (not Figma, not React components — single-file HTML/CSS/minimal JS per page)
**Target quality bar:** Hyperliquid, Vercel, Linear, Phantom, Jupiter
**Project:** Sol Oil Factory — a Solana token-distribution platform
**Project status:** Devnet only. Designing v1 mainnet-launch UI.

---

# READ THIS FIRST — Critical Context

You are designing the production frontend for **Sol Oil Factory**, a permissionless Solana token-distribution platform where token operators launch "refineries" (reward pools) that distribute tokens to verified holders based on on-chain snapshots.

## What this product actually is

Sol Oil Factory is **NOT another consumer DeFi app**. It is **infrastructure for token distribution**. The closest comparisons:

| Comparison | What they do | What we share |
|---|---|---|
| **Hyperliquid** | High-performance perpetuals DEX | Information density, professional dark UI, financial-instrument feel |
| **Vercel** | Cloud platform for developers | Operator dashboards, multi-tenant architecture, system reliability |
| **Linear** | Project management | Sidebar pattern, restraint, command palette, keyboard-first |
| **Phantom** | Solana wallet | Trust signals, sober crypto UI, clean transaction flows |
| **Jupiter** | Solana DEX aggregator | Solana-native, technical operator-facing UI |

The platform has 3 user types:
1. **Operators** — token project teams that launch refineries to distribute tokens to their holders
2. **Holders** — wallets eligible for claims based on on-chain token balances at snapshot time
3. **Browsers** — anyone exploring the directory (read-only, no wallet needed)

## The strategic frame (don't miss this)

The headline frame is **"Where real holders get rewarded."** This positions Sol Oil Factory's wallet reputation system as the differentiator. Reputation is the moat. Refineries are the activity that generates reputation data.

This means: **reputation must be visible everywhere**, designed as a fully-live first-class feature, not hidden behind a "coming soon" treatment. Show reputation scores inline on operator profiles, holder dashboards, leaderboards, claim flows, refinery cards. Reputation is the product.

---

# Aesthetic Direction — LOCKED

This is not exploration territory. The aesthetic was chosen through extensive deliberation across multiple decision batches. Do not deviate.

## The visual identity

**Industrial-meets-financial-infrastructure.** The "refinery" metaphor is real but expressed through:
- **Vocabulary** (operator, refinery, pool, snapshot, claim window, escrow)
- **Information design** (gauges, fill bars, monospace numbers)
- **Typography choices** (display font with character, monospace for data)
- **One canonical visual asset** (the barrel-gauge on the home hero)

**NOT through:**
- ❌ Decorative pipe SVGs
- ❌ Industrial pattern textures
- ❌ Steam-effect overlays
- ❌ Photoreal barrel imagery scattered across pages
- ❌ Steampunk or rust-colored aesthetics
- ❌ Any literal refinery imagery beyond the single hero barrel-gauge

The identity is carried by **typography + vocabulary + info-design**, not visual ornament. This is the distinguishing principle. Hyperliquid doesn't show literal trading floors. Vercel doesn't show literal servers. Linear doesn't show literal lines. Sol Oil Factory shouldn't show literal oil rigs.

## Typography — LOCKED

```css
--font-display: "Space Grotesk", sans-serif;   /* Headings, display copy */
--font-body: "Inter", sans-serif;              /* Body text, UI */
--font-mono: "JetBrains Mono", monospace;      /* Numbers, addresses, code */
```

**Why these specific fonts:**
- Space Grotesk has industrial/geometric character without being cold. The slightly squared letterforms reinforce the industrial frame.
- Inter is the web's most readable body font for dense UI.
- JetBrains Mono signals technical precision for numerical data.

**Type scale (use exactly):**
```css
--text-xs: 12px;      /* Captions, badges, table headers */
--text-sm: 14px;      /* Body, table cells, secondary text */
--text-base: 16px;    /* Default body */
--text-lg: 18px;      /* Subheadings */
--text-xl: 20px;      /* Card titles */
--text-2xl: 24px;     /* Section headings */
--text-3xl: 32px;     /* Page headings */
--text-5xl: 56px;     /* Hero headings */
--text-7xl: 72px;     /* Display only — hero on home */
```

**Numbers ALWAYS use JetBrains Mono.** Token amounts, addresses, percentages, USD values, counts. This is non-negotiable — it's how we signal precision.

## Color System — LOCKED

Both light and dark themes are required. Solana Mode (purple/green crypto-native) is **explicitly killed**. Don't include it.

### Dark theme (default)

```css
/* Background layers */
--bg-base: #0A0A0A;          /* Page background */
--bg-elevated: #141414;      /* Cards, panels */
--bg-overlay: #1F1F1F;       /* Modals, dropdowns */
--bg-input: #1A1A1A;         /* Form inputs */

/* Borders */
--border-subtle: #1F1F1F;    /* Card borders, divider lines */
--border-strong: #2D2D2D;    /* Input borders, focused states */

/* Text */
--text-primary: #F5F5F5;     /* Headings, primary content */
--text-secondary: #A3A3A3;   /* Body, descriptions */
--text-tertiary: #6B6B6B;    /* Captions, metadata */
--text-disabled: #4A4A4A;    /* Disabled UI */

/* Brand accent — oil amber */
--accent: #F5A623;           /* Primary CTAs, active states */
--accent-hover: #E89505;     /* Hover state */
--accent-pressed: #C77F00;   /* Pressed state */
--accent-bg: rgba(245, 166, 35, 0.1);  /* Subtle accent backgrounds */

/* Semantic colors */
--success: #22C55E;          /* Verified, success states */
--warning: #F59E0B;           /* Warnings, low-pool alerts */
--error: #EF4444;             /* Errors, dangerous actions */
--info: #3B82F6;              /* Info banners */

/* Reputation tiers */
--rep-excellent: #22C55E;     /* 80-100 */
--rep-good: #F5A623;          /* 60-79 */
--rep-neutral: #A3A3A3;       /* 40-59 */
--rep-risky: #F59E0B;         /* 20-39 */
--rep-flagged: #EF4444;       /* 0-19 */
```

### Light theme

```css
/* Background layers */
--bg-base: #FAFAFA;          /* Page background */
--bg-elevated: #FFFFFF;      /* Cards, panels */
--bg-overlay: #FFFFFF;       /* Modals, dropdowns */
--bg-input: #F5F5F5;         /* Form inputs */

/* Borders */
--border-subtle: #E5E5E5;
--border-strong: #D4D4D4;

/* Text */
--text-primary: #0A0A0A;
--text-secondary: #525252;
--text-tertiary: #737373;
--text-disabled: #A3A3A3;

/* Brand accent — same oil amber, slightly adjusted */
--accent: #E89505;           /* Slightly darker for contrast on white */
--accent-hover: #C77F00;
--accent-pressed: #A36800;
--accent-bg: rgba(245, 166, 35, 0.08);

/* Semantic colors stay the same */
--success: #16A34A;
--warning: #D97706;
--error: #DC2626;
--info: #2563EB;
```

**Default to dark theme** for the design phase. Light theme should look genuinely good, not like an afterthought — but lead with dark because it's the financial-instrument default.

## Spacing System

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
--space-32: 128px;
```

## Border Radius

```css
--radius-sm: 4px;     /* Inputs, buttons */
--radius-md: 8px;     /* Cards */
--radius-lg: 12px;    /* Modals */
--radius-pill: 9999px; /* Pills, badges */
```

Industrial = sharper corners. Don't go softer than 4px on most elements. Cards use 8px max. Avoid rounded-full circles for buttons (too consumer-app).

---

# Anti-AI Rules — DO NOT VIOLATE

These are explicit visual prohibitions. Every modern AI design tool generates these by default. **Do the opposite.**

## Banned visual patterns

❌ **Gradient blobs** — no purple-to-blue gradient orbs floating in backgrounds
❌ **Glassmorphism by default** — no frosted-glass overlay everywhere
❌ **Center-aligned everything** — left-align is the default
❌ **Identical 4-card feature rows** — break out of the 4-up grid pattern
❌ **Emoji in UI** — never. Not in headings, not in buttons, not in tooltips
❌ **3D illustrations** — no isometric crypto bro graphics
❌ **Neon glow effects** — no electric blue glow on cards
❌ **Oversized shadows** — keep shadows tight and functional
❌ **SVG patterns as backgrounds** — no diagonal stripes, no dots, no waves
❌ **Oversized whitespace** — fill the viewport with information, this is a financial tool
❌ **"Unleash X" / "Reimagined" copy** — banned phrases
❌ **Fake testimonial sections** — no fake user quotes
❌ **Modal-without-Esc-to-close** — every modal must close on Esc
❌ **Toasts <4s for destructive actions** — destructive toasts persist 10s minimum
❌ **Auto-playing animations** — animations only on user interaction or page load
❌ **Center-aligned hero with floating product preview** — done to death
❌ **Generic "code" mockup graphics** — no fake terminal screenshots

## Banned copy patterns

❌ "Powered by AI" / "AI-powered" — irrelevant to this product
❌ "Revolutionary" / "Revolutionizing" — banned
❌ "Web3 native" — show, don't tell
❌ Excessive exclamation marks
❌ All-caps marketing speak
❌ Made-up statistics (no "10,000+ refineries launched!" when devnet has 12)

## Required treatments

✅ **Asymmetric layouts** — break the symmetric grid expectation
✅ **Information density** — operators want to see lots of data at once
✅ **Monospace numbers everywhere** — token amounts, USD values, percentages
✅ **Bare data over decorated data** — no chart-junk, no decorative axes
✅ **Sharp transitions** — 150ms ease-out is the default. Don't go slower.
✅ **Tabular alignment** — columns of numbers must right-align with consistent decimals

---

# Layout System

## Sidebar Navigation (LOCKED — Linear/Notion/Vercel pattern)

The site uses a **collapsible sidebar** as the primary navigation. This is non-negotiable.

**Behavior:**
- **Collapsed default:** 64px wide, icon-only
- **Expanded on hover:** 256px wide, icon + label
- **Transition:** 150ms ease-out
- **Sticky:** stays visible during scroll
- **Footer pinned:** network indicator (Devnet pill) + connect button live in sidebar footer

**Sidebar contents (top to bottom):**

```
┌─────────────────────────┐
│ [SOF Logo]              │  ← Logo (links home)
├─────────────────────────┤
│ ⌂  Home                 │
│ ⊞  Refineries           │  ← Browse all refineries
│ ⚡ Launch refinery      │  ← Operator action
│ ◊  Dashboard            │  ← Wallet-scoped (shown when connected)
│ ☰  Leaderboard          │
│ ✓  Reputation           │
├─────────────────────────┤
│ ?  Help                 │  ← /help
│ §  Trust                │  ← /trust (security + status)
│ </>  Developers         │  ← API docs
├─────────────────────────┤
│ [Devnet pill]           │  ← Network indicator
│ [Connect wallet]        │  ← Connect button when not connected
│                         │  ← Wallet pill when connected
└─────────────────────────┘
```

**Mobile:** sidebar becomes a hidden drawer (hamburger menu top-left), with a **bottom-bar tab switcher** showing 4 items: Home, Refineries, Dashboard, Leaderboard.

## Wrong-Network Banner (LOCKED — persistent red)

When the user's wallet is on the wrong cluster (e.g., mainnet but app is on devnet), show a **persistent red banner across the top** above all content:

```
⚠ Wrong network. Switch your wallet to Solana Devnet to continue.    [Switch network]
```

This banner pushes content down. It does NOT auto-dismiss. It clears only when the wallet network changes.

## Service Degraded Banner (NEW — gap 1)

When indexer is >5min behind or RPC p99 >2s, show a **persistent amber banner** below the wrong-network banner (or at the top if no network issue):

```
⚠ Some data may be delayed. Indexer is 8 minutes behind chain.    [Details →]
```

Less prominent than wrong-network (amber, not red). Dismissible per-session.

## Platform Pause Banner

When the platform is paused via Squads multisig, show a **persistent red banner** with full-width attention:

```
⚠ Sol Oil Factory is temporarily paused. Claims and launches are unavailable.    [Read the announcement →]
```

## Footer (Trust Strip)

Minimalist footer. Single horizontal trust strip + small status indicator. Reference: Aave, Vercel.

```
Sol Oil Factory · Audited by [Pending] · Status: ● Operational · Built on Solana · Made with Helius
```

Below trust strip, sitemap links in 4 columns:
- **Product:** Refineries, Launch, Dashboard, Leaderboard
- **Trust:** Reputation, Trust, Security
- **Developers:** API, Documentation, GitHub
- **Legal:** Terms, Privacy, Contact

Below sitemap: small copyright line + theme toggle (light/dark) + language selector (English only for v1, but show the chevron).

---

# Mock Data — USE EXACTLY

These are the **locked mock values**. Do not invent your own. Every screen showing data must use these.

## Mock Refineries (12)

| # | Token | Symbol | Mint | Operator | Pool | Rate (per 1%) | Status | Verified |
|---|---|---|---|---|---|---|---|---|
| 1 | Bonk | BONK | DezX…AKKM | Hxk2…7gPZ | 1,247,000 | 12,000 | active | deployer |
| 2 | Jupiter | JUP | JUPyi…dpvS | 4Bsd…91jU | 8,400 | 84 | active | deployer |
| 3 | dogwifhat | WIF | EKpQ…WFkW | 9wF7…3Lz8 | 84,000 | 840 | active | cto |
| 4 | Popcat | POPCAT | 7GCi…W5cy | 2zKp…hH4M | 142,000 | 1,420 | active | unverified |
| 5 | Pyth | PYTH | HZ1J…3pH3 | Pyth9…D7ax | 41,000 | 410 | closingSoon | deployer |
| 6 | Jito | JTO | jtojtomep…1zb | 5jVq…78dM | 12,500 | 125 | active | deployer |
| 7 | Mother Iggy | MOTHER | 3S8q…iyDM | 8zZb…3Ksn | 510,000 | 5,100 | active | unverified |
| 8 | MEW | MEW | MEW1…tmZA | 6FdN…XnQ2 | 48,000,000 | 480,000 | active | unverified |
| 9 | Raydium | RAY | 4k3D…mq56 | RayLi…D9pT | 6,200 | 62 | active | deployer |
| 10 | Orca | ORCA | orcaE…Fnq3 | OrcaT…D7vM | 9,400 | 94 | active | deployer |
| 11 | Marinade | MNDE | MNDE…YFu8 | MndS…DwY3 | 55,000 | 550 | active | deployer |
| 12 | GIGACHAD | GIGA | 63LfDmN…3eQy | 7HpZ…44tL | 22,000,000 | 220,000 | closed | unverified |

## Mock Wallets with Reputation (6)

| Wallet | Reputation | Refineries claimed | Avg holding | Refineries launched | Cluster | Wallet age |
|---|---|---|---|---|---|---|
| Hxk2…7gPZ | 84 | 14 | 47d | 2 (verified deployer) | clean | 380d |
| 4Bsd…91jU | 67 | 9 | 23d | 1 | clean | 220d |
| 9wF7…3Lz8 | 51 | 22 | 12d | 0 | clean | 510d |
| 2zKp…hH4M | 42 | 6 | 38d | 0 | clean | 95d |
| 8zZb…3Ksn | 21 | 31 | 4d | 0 | flagged (cluster of 12) | 60d |
| 7HpZ…44tL | 8 | 47 | 1d | 0 | flagged (cluster of 38) | 18d |

## Mock Recent Claims Feed

```
Hxk2…7gPZ      claimed 148.8 BONK              · 2m ago
4Bsd…91jU      claimed 12,000 BONK             · 5m ago
9wF7…3Lz8      claimed 84 JUP                  · 8m ago
2zKp…hH4M      claimed 1,420 POPCAT            · 12m ago
8zZb…3Ksn      claimed 220,000 GIGA            · 14m ago
7HpZ…44tL      claimed 5,100 MOTHER            · 19m ago
6FdN…XnQ2      claimed 480,000 MEW             · 22m ago
RayLi…D9pT     topped up pool +6,200 RAY       · 35m ago
OrcaT…D7vM     paused refinery (operator)      · 1h ago
MndS…DwY3      claim window extended +7d       · 2h ago
Hxk2…7gPZ      launched BONK refinery          · 4h ago
Pyth9…D7ax     snapshot taken — 6,201 holders  · 4h ago
```

## Mock Top Operators (Leaderboard)

| # | Operator | Refineries | Lifetime distributed (USD) | Avg claimer reputation |
|---|---|---|---|---|
| 1 | RayLi…D9pT | 8 | $284,200 | 71 |
| 2 | Pyth9…D7ax | 5 | $189,400 | 68 |
| 3 | OrcaT…D7vM | 12 | $156,800 | 64 |
| 4 | Hxk2…7gPZ | 2 | $14,820 | 78 |
| 5 | MndS…DwY3 | 4 | $11,200 | 62 |

---

# Pages to Design

You are designing **20 routes**. Some are simple (404, legal). The bulk of design effort goes into 8 core surfaces. Below is the priority order.

## Priority 1 — Core Surfaces (must be excellent)

### 1. Home (`/`)

**Purpose:** Sell the platform to operators and holders. Convert browsers to active users.

**Hero block:**
- Display headline (72px Space Grotesk): "Where real holders get rewarded."
- Sub-headline (20px Inter, secondary text): "Permissionless token distribution on Solana. Operators launch refineries. Holders claim their share. Reputation builds with every claim."
- **Two CTAs side by side, asymmetric weight:**
  - Primary (oil amber, large): "Browse refineries →"
  - Secondary (outline, large): "Launch a refinery"
- **Hero visual:** the barrel-gauge — a stylized industrial barrel with a circular pool-fill gauge wrapped around it, showing "1,247,000 BONK" remaining out of "1,500,000 BONK" initial. The fill gauge animates from 0 to 83% on page load (single 600ms ease-out, no looping).
- Below CTAs: small inline metric strip:
  ```
  12 active refineries · 1.84M tokens distributed · 327 unique holders · 6 verified operators
  ```

**Trust strip (immediately below hero):**
- 4-column horizontal: "Audited by [Pending]" · "Solana Devnet" · "Built on the Anchor framework" · "Open-source program"

**How it works (3-step, NOT 4-card row):**
- **Asymmetric layout** — left column has all 3 steps stacked, right column has a live demo (animated pool drain or a sample refinery card)
- Step 1: "Operators launch refineries" — operator deposits tokens into escrow, sets distribution rules
- Step 2: "Snapshots verify holders" — on-chain holder balances captured, merkle root submitted
- Step 3: "Holders claim their share" — eligible wallets prove ownership, receive tokens

**Live activity ticker:**
- Horizontal scroll showing recent claims (mock data feed above)
- 200px tall, full-width, 30s scroll loop
- Each row: wallet pill · action · token amount · time-ago · tx link
- Auto-pauses on hover; click to view refinery

**Featured refineries (5-up grid, NOT 4-up):**
- Asymmetry: first card spans 2 columns, remaining 3 single columns, with a 5th card pinned right
- Each card: token icon, symbol, pool remaining, claim rate, status pill, verified badge, "Claim" button if connected & eligible

**Reputation explainer:**
- Side-by-side: left = wallet card showing reputation 84 (Hxk2…7gPZ) with signal breakdown; right = explanation copy
- Copy: "Reputation is built from on-chain behavior. Successful claims, holding duration, and clean cluster history raise scores. Quick-flips and sybil patterns lower them."

**FAQ accordion (5-7 items):**
- "What is a refinery?"
- "How do I know a refinery is legitimate?"
- "What does Verified Deployer mean?"
- "How is reputation calculated?"
- "Why are you on devnet only?"
- "How do I withdraw my tokens after closing a refinery?"

**Footer:** standard trust-strip + sitemap (described in Layout section).

### 2. Refineries Directory (`/refineries`)

**Purpose:** Browse all refineries with filtering, sorting, and search.

**Header:**
- H1 (32px Space Grotesk): "Refineries"
- Below: "12 active · 1 closing soon · 1 closed"

**Filter bar (horizontal, sticky):**
- Search input (mint address, symbol, or operator wallet)
- Status filter pills: All · Active · Closing soon · Closed · Operator paused
- "Verified only" toggle
- "Min reputation" slider (0-100)
- Sort dropdown: Pool size (USD) · Newest · Closing soonest · Highest rate · Most claimers

**Table (TanStack Table — full feature set):**

Columns:
1. **Token** — icon (32x32) · symbol · name · mint (truncated, copyable)
2. **Operator** — wallet pill · reputation score (color-coded) · verified badge
3. **Pool** — remaining (mono) · USD value · % of initial
4. **Claim rate** — tokens per 1% (mono) · USD equiv
5. **Snapshot** — last taken (relative time) · holder count
6. **Window** — closes in (countdown) or "Open-ended"
7. **Risk** — badges for: mintable, freeze authority, transfer fee, low liquidity, concentrated
8. **Status** — pill: Active / Closing / Paused / Closed
9. **Action** — Claim button (if eligible) / View button (otherwise)

Row hover: subtle elevation increase. Row click: navigate to refinery detail.

**Empty state (filters return zero):**
"No refineries match these filters. Try clearing some constraints, or be the first to launch."

**Pagination:** cursor-based, 50 per page, "Load more" button at bottom.

### 3. Single Refinery (`/refinery/[mint]`)

**Purpose:** Show all details for one refinery. THE most-visited page after directory. Spend the most design effort here.

**Header (full-width):**
- Large token icon (64x64), symbol, name on left
- Status pill, verified badge, mint address (copyable, truncated) below
- Right side: action buttons depending on user state:
  - Not connected: "Connect to claim →"
  - Connected & eligible: "Claim 148.8 BONK →" (oil amber, prominent)
  - Connected & already claimed: "Claimed 148.8 BONK · View tx →"
  - Connected & not eligible: "Buy BONK on Jupiter →" (outline)

**Stats strip (4 columns):**
1. Pool remaining (large mono number) · "of 1,500,000 initial"
2. Holders claimed (count) · "of 6,201 eligible"
3. Claim rate · "tokens per 1% of supply held"
4. Closes in (countdown) or "Open-ended"

**Two-column main content:**

**Left column (2/3 width):**
- **Pool drain chart** — 24h timeseries showing pool_remaining decreasing. Subtle area chart. Key markers: snapshot taken, large claims.
- **Recent claims feed** — table showing last 30 claims. Columns: wallet pill, amount (mono), time-ago, tx link.
- **Snapshot history** — table of all snapshots taken. Columns: index, taken-at, holders, total eligible, merkle root (truncated, expand for full).
- **Top claimants** — 10 highest-claim wallets for this refinery. Wallet pill, total claimed, claims count.

**Right column (1/3 width):**
- **Eligibility check** — depending on user state (see 6 states below)
- **Token info card** — name, symbol, decimals, supply, market cap, holder count, Jupiter verified badge
- **Token Trust Report** — RugCheck score, risk flags listed individually with color coding
- **Operator info** — wallet pill, reputation, refineries-launched count, lifetime distributed (USD), verified badge

**The 6 eligibility states (right column displays the appropriate one):**

**State A — Not connected:**
```
┌─────────────────────────────┐
│ Eligibility check           │
│                             │
│ Connect your wallet to see  │
│ if you can claim from this  │
│ refinery.                   │
│                             │
│ [Connect wallet →]          │
└─────────────────────────────┘
```

**State B — Eligible:**
```
┌─────────────────────────────┐
│ You can claim now           │
│                             │
│ Snapshot 7 · taken 2h ago   │
│ Your balance: 12,400 BONK   │
│ Pool share: 0.99% (cap: 5%) │
│                             │
│ ─────────────────────────── │
│ You'll receive: 148.8 BONK  │
│ Network fee:    ~0.001 SOL  │
│ Claim fee:      0.001 SOL   │
│                             │
│ [Claim 148.8 BONK →]        │
│                             │
│ Auto-detected from on-chain │
│ balance. No registration.   │
└─────────────────────────────┘
```

**State C — Already claimed:**
```
┌─────────────────────────────┐
│ ✓ Claimed                   │
│                             │
│ You claimed 148.8 BONK from │
│ snapshot 7 on May 9 at 14:32│
│ UTC.                        │
│                             │
│ Tx: 4xK2…3hPq [↗ Solscan]   │
│                             │
│ Next snapshot: in ~50 min   │
│ (hourly cadence)            │
└─────────────────────────────┘
```

**State D — Not eligible:**
```
┌─────────────────────────────┐
│ Not in this snapshot        │
│                             │
│ Your wallet doesn't hold    │
│ BONK at the most recent     │
│ snapshot (taken 2h ago).    │
│                             │
│ Buy BONK and hold until the │
│ next snapshot to qualify    │
│ for the next claim cycle.   │
│                             │
│ Next snapshot: in ~50 min   │
│                             │
│ [Buy BONK on Jupiter →]     │
└─────────────────────────────┘
```

**State E — Eligible but proof unavailable (NEW):**
```
┌─────────────────────────────┐
│ You appear eligible         │
│                             │
│ Your wallet holds 12,400    │
│ BONK at the most recent     │
│ snapshot. The claim service │
│ is temporarily unavailable  │
│ to compute your proof.      │
│                             │
│ [Refresh status →]          │
│ Auto-retries every 30s.     │
│                             │
│ We'll automatically attempt │
│ your claim when service is  │
│ restored.                   │
└─────────────────────────────┘
```

**State F — Account frozen (NEW):**
```
┌─────────────────────────────┐
│ ⚠ Your BONK account is      │
│   frozen                    │
│                             │
│ The freeze authority has    │
│ frozen your token account.  │
│ This is a token-level       │
│ action by the BONK team —   │
│ contact them about thawing. │
│                             │
│ You can still claim from    │
│ this refinery once your     │
│ account is unfrozen.        │
│                             │
│ [Read about freeze authority │
│  →]                         │
└─────────────────────────────┘
```

**Pending snapshot state (replaces eligibility card entirely):**
```
┌─────────────────────────────┐
│ Refinery active, awaiting   │
│ first snapshot              │
│                             │
│ This refinery launched 3    │
│ minutes ago. The first      │
│ snapshot is being computed. │
│                             │
│ Claims open as soon as it's │
│ ready (~1 more minute).     │
│                             │
│ [Snapshot in progress]      │
│ Auto-refreshes every 30s    │
└─────────────────────────────┘
```

**Operator-paused banner (full-width, above main content):**
"⏸ Operator has paused this refinery. Claims are temporarily disabled."

### 4. Launch Refinery (`/refinery/launch`)

**Purpose:** 4-step form for operators to launch a new refinery.

**Stepper at top (horizontal, 4 dots with labels):**
1. Token & risk check
2. Operator identity
3. Configure distribution
4. Confirm & sign

**Step 1: Token & risk check**
- Input: Mint address (paste or type)
- Live preview card showing:
  - Token icon, name, symbol
  - Decimals, supply
  - Mint authority (active or renounced)
  - Freeze authority (active or renounced)
  - RugCheck risk badges
  - Jupiter verified status
- Validation gates:
  - Block if RugCheck score < threshold or has "danger" flag
  - Block if transfer fee > 5%
  - Warn if freeze authority active (require checkbox acknowledgment)
- "Continue" button disabled until token passes filter

**Step 2: Operator identity**
- Auto-detect: is the connected wallet the mint authority?
  - If YES: "Verified Deployer ✓" badge, continue immediately
  - If NO: offer "Apply for Verified CTO" (separate flow, off-chain) OR continue as Unverified Operator
- Show explanation of each path's implications (reputation impact, badge displayed on refinery)

**Step 3: Configure distribution**
- Pool initial: token amount input (mono) + USD equivalent
- Claim rate basis: tokens per 1% of supply held
- Per-claim cap: slider 0.1% – 100% (default 5%)
- Pool empty strategy: radio (Pro-rata vs FCFS)
- Snapshot strategy: dropdown (At launch · Hourly · Daily · Weekly · Per-epoch only)
- Claim window: dropdown (Open-ended · 7 days · 14 days · 30 days · 90 days · Custom)
- Live preview panel on right side showing:
  - "If you launch with these settings:"
  - "1% holder of 1M supply (= 10,000 tokens) would claim 12,000 BONK per snapshot"
  - "Your refinery would last ~14 hours at current claim rate (assuming 100 holders claiming)"

**Step 4: Confirm & sign**
- Full summary of all settings
- Cost breakdown:
  - Launch fee: 0.1 SOL
  - Pool deposit: 1,500,000 BONK
  - 1% deposit fee: 15,000 BONK (auto-swapped to SOL via Jupiter)
  - Network fee: ~0.001 SOL
  - **Total: 1,515,000 BONK + 0.101 SOL**
- ToS acceptance checkbox
- Big "Sign & launch" button
- After signing: show progress (transaction submitted → confirmed → snapshot starting → live)

### 5. Dashboard (`/dashboard`)

**Purpose:** Wallet-scoped overview. Operators see their refineries, holders see their claims and reputation.

**Layout: tabs at top**
- "My refineries" (operator view)
- "Claims received" (holder view)
- "Reputation" (both)

**Header (always shown):**
- Wallet pill (large)
- Reputation score with mini-trend chart (90 days)
- Wallet age, first activity, last activity

**My Refineries tab:**
- Table of refineries this wallet operates
- Columns: Token, Pool remaining, Status, Last snapshot, Action (Manage button)
- "Launch new refinery →" CTA prominent
- Empty state: "You haven't launched a refinery yet. Become an operator and reward your holders."

**Claims Received tab:**
- Table of all claims this wallet has made
- Columns: Token, Refinery, Amount claimed, Date, Tx link
- Total claimed (sum) at top
- Empty state: "You haven't claimed from any refineries yet. Browse refineries to find one you're eligible for."

**Reputation tab:**
- Big reputation score (e.g., 84) with tier label ("Excellent")
- 6 signal breakdowns with icons and values:
  - Refineries claimed successfully: 14
  - Average holding duration: 47d
  - Tokens held > 7d post-claim: 11/14
  - Cluster status: Clean
  - Wallet age: 380d
  - Refineries launched (verified deployer): 2
- 90-day trend chart
- Last recomputed timestamp

### 6. Public Wallet Profile (`/wallet/[addr]`)

**Purpose:** Public view of any wallet's reputation and history. Shareable.

**Header:**
- Wallet pill (large) with copy button
- Reputation score (big, color-coded)
- Wallet age, first activity, total refineries claimed, total tokens claimed (USD)

**Two-column layout:**

**Left column:**
- Reputation breakdown (same 6 signals as Dashboard)
- 90-day trend
- Cluster analysis (small panel showing if wallet is in any flagged cluster)

**Right column:**
- Refineries operated (if any) — table
- Refineries claimed from (recent 20) — table
- Activity timeline (verified events)

**Dynamic OG image:**
- Generated for sharing (Twitter cards, etc.)
- Shows: wallet pill, reputation score, top stats, branded
- 1200x630, dark theme by default

### 7. Leaderboard (`/leaderboard`)

**Purpose:** Multiple ranking views — operators, claimers, reputation leaders.

**Tabs at top:**
- Top operators (by lifetime distributed USD)
- Top claimers (by claims count)
- Top reputation (by score)
- Top $CRUDE balance (existing system)

**Each leaderboard:**
- Top 50 entries
- Columns vary by leaderboard type
- Always show: rank, wallet pill, primary metric (mono), secondary metric, reputation score
- Highlight top 3 with subtle treatment (gold/silver/bronze accent on rank number, NOT garish — just colored numerals)

**Filter bar:**
- Time period: All time · 30d · 7d
- Verified only toggle

### 8. Reputation Methodology (`/reputation`)

**Purpose:** Explain how reputation is calculated. THIS IS A KEY DIFFERENTIATOR PAGE.

**Hero:**
- H1: "How reputation works"
- Subhead: "Reputation is built from on-chain behavior, computed daily, and visible publicly."

**Section 1: The 6 signals**
- Each signal in its own panel with formula and example
- Refineries claimed successfully (weight: 25%)
- Average holding duration (weight: 20%)
- Tokens held > 7d post-claim (weight: 20%)
- Cluster status (weight: 15%)
- Wallet age (weight: 10%)
- Refineries launched as verified deployer (weight: 10%)

**Section 2: How it's computed**
- Plain-language explanation
- Daily recompute via cron
- Public methodology (no black box)
- Rate of change (fast vs slow signals)

**Section 3: How operators can use it**
- Min-reputation filters in directory
- Exclude flagged clusters from claims (future feature)
- Reputation-gated launches (future feature)

**Section 4: Sybil resistance**
- Cluster detection methodology
- Wallet age requirement
- Behavioral signals

**Section 5: FAQ**
- "Can I improve my reputation?"
- "Why is my reputation low?"
- "How is cluster detection done?"
- "Can my reputation be wrong?"
- "How do I dispute a flagged cluster?"

## Priority 2 — Supporting Pages (functional, not flashy)

### 9. Solana Refinery (`/refinery/solana`)

The existing $CRUDE-for-activity refinery (legacy system, integrated into the new platform). Same layout as Single Refinery page, but with $CRUDE-specific branding and the "activity-based" claim mechanic explained.

### 10. Launchpad Refineries

Four pages, all same template:
- `/refinery/launchpad/pump`
- `/refinery/launchpad/bonk`
- `/refinery/launchpad/bags`
- `/refinery/launchpad/candle`

Each page lists all refineries for tokens that graduated from that launchpad. Filter automatically applied. Use the launchpad's icon (provided assets) in the header. Below header, standard refineries directory table filtered to that launchpad.

### 11. Trust (`/trust`)

**Purpose:** Security signals + system status. Replaces an "About" page.

**Sections:**
- **Security:** Audited by [Pending], bug bounty status, Squads multisig info, devnet-only notice
- **Open source:** Anchor program GitHub link, frontend GitHub link, license
- **System status:** Live status of components (Helius, Indexer, Reputation, Database) with last-checked timestamps
- **Lifetime metrics:** Total refineries launched, tokens distributed (USD equiv), unique holders, claims processed
- **Audit summary:** When audit completes, link to full report
- **Contact:** security@sof.xyz, GitHub issues, Discord
- **Devnet disclaimer:** "Sol Oil Factory is currently on devnet. Tokens have no real-world value."

### 12. Developers (`/developers`)

**Purpose:** API landing page. Stub for now — full docs are external.

**Sections:**
- Hero: "Build on Sol Oil Factory"
- Quick start (code snippets)
- API endpoints (key ones, link to full docs)
- TypeScript SDK (npm package, install instructions)
- GitHub link (program + frontend)
- Discord (developer channel)

### 13. Help (`/help` and `/help/[slug]`)

**Purpose:** Support center.

`/help` — search bar, category grid (Getting started, For operators, For holders, Troubleshooting, Reputation, Security)
`/help/[slug]` — individual articles, sidebar nav, table of contents on right

### 14. Legal (`/legal/terms`, `/legal/privacy`)

Standard legal pages. Long-form text, single column, max-width 720px. Generated TOC on right side. Last-updated timestamp at top. Use the ToS document we drafted as the source.

### 15. 404

Custom 404 page. Industrial vibe — maybe an empty oil drum graphic with "This page doesn't exist (yet)."

## Priority 3 — System UI

### 16. Connect Modal (LOCKED — single unified flow)

When user clicks "Connect wallet":
1. Modal opens (not a separate page)
2. Shows wallet grid: Phantom · Solflare · Backpack
3. Below grid: small "New to Solana?" link → opens help article
4. **One unified flow:** ToS checkbox + "Sign & connect" button (combines wallet selection + ToS in one action)
5. After clicking: wallet popup → user signs SIWS challenge → connected
6. Modal closes, sidebar updates to show connected state

**Re-prompt ToS on every reconnect** (locked decision — friction trade-off accepted).

### 17. Command Palette (Cmd+K)

Reference: Linear, Vercel.
- Triggered by Cmd+K (Mac) or Ctrl+K (Windows)
- Centered modal, ~600px wide
- Search input at top
- Results below, organized by category:
  - Pages (Home, Refineries, Dashboard, etc.)
  - Refineries (filtered by query)
  - Wallets (filtered by query)
  - Tokens (filtered by query)
  - Actions (Launch refinery, Connect wallet, Toggle theme, etc.)
- Keyboard nav (arrow keys, Enter to select, Esc to close)
- Recent searches at top when input is empty

### 18. Notification Toasts

6 tiers (locked):
- **Tier 1 — Trivial** (4s, gray): "Theme switched to light", "Address copied"
- **Tier 2 — Action confirmation** (8s, includes tx link): "Refinery launched ✓", "Claimed 148.8 BONK ✓"
- **Tier 3 — Errors** (10s persistent, red border): "Transaction rejected", "Claim failed"
- **Tier 4 — Stakes alerts** (in-app panel, no toast): "Pool low — top up?", "Refinery paused"
- **Tier 5 — Live activity** (inline feed, not toast): "Hxk2…7gPZ just claimed 148.8 BONK"
- **Tier 6 — Rate limited** (auto-resolve, amber border + countdown): "Rate limited. Retrying in 3 seconds…"

Position: top-right, stacked. Max 5 visible at once (older toasts dismiss).

---

# What I Want From You

## Per-page deliverables

For EACH page, generate:
1. **Single-file HTML mockup** (HTML + inline CSS + minimal JS)
2. **Both light and dark themes** rendered (toggle visible in mockup, but default to dark)
3. **Desktop (1280px) AND mobile (375px) views** — at parity quality
4. **All states represented:**
   - Connected and not connected (where relevant)
   - Empty / loading / populated states
   - Error states where applicable
   - The 6 claim eligibility states for Single Refinery
5. **Real mock data populated** — use the mock data tables above

## Build order (do not skip ahead)

1. **Home** — establishes the visual language
2. **Refineries directory** — proves the table system works
3. **Single Refinery** — the most-visited page, highest design effort
4. **Connect modal + Command palette** — system-wide UI components
5. **Launch Refinery** — operator flow validation
6. **Dashboard** — wallet-scoped UI
7. **Public Wallet Profile** — shareable surface
8. **Leaderboard** — competitive surface
9. **Reputation methodology** — strategic differentiator
10. **Trust + Developers + Help** — supporting pages
11. **Legal pages + 404** — finishing touches

After EACH page, present it for review before continuing. Do not generate all 20 pages in one shot.

## Quality bar

The reference is **Hyperliquid + Vercel + Linear**. Not Uniswap. Not OpenSea. Not consumer crypto apps. Operators using this product are running token projects with real money. Holders are crypto-native. Both audiences expect:
- Information density without clutter
- Sober, professional treatment
- Real numbers in real places
- No marketing fluff
- Performance over flash

## Files to consult for additional detail

If anything is ambiguous, refer to:
1. `sof-page-writeups.md` — verbatim copy for every page (~2,500 lines)
2. `sof-design-decisions.md` — locked design decisions across 4 batches
3. `sof-tos-privacy.md` — legal copy

These three documents are the source of truth. This prompt is the entry point.

---

# Brand Assets Reference

You have the following assets available (already provided):
- `logo.png` — Sol Oil Factory main logo (gear with oil drop, oil amber on transparent). **Note: pixelated PNG. Will appear blurry at large sizes — this is the asset, not a design tool issue. SVG conversion is a pre-production task.** Use as-is for design phase.
- `barrel.png` — black industrial barrel with "OIL" label (photographic). Use only on home hero, never elsewhere.
- `pumpfun-icon.png`, `bonkfun-icon.png`, `bags-icon.png`, `candle-icon.png` — 4 launchpad refinery icons. Use as-is for design phase. **Production note: these will be replaced with custom in-house icons before mainnet launch.**
- `phantom-icon.png`, `solflare-icon.png`, `backpack-icon.png` — official wallet brands (correct usage, industry standard).

NO believe-icon. The Believe launchpad was uploaded by mistake and is NOT in scope.

---

# Final Reminders

✅ **Dark theme is the default and primary** — get it right first
✅ **Mobile and desktop at parity quality** — no half-baked mobile
✅ **Reputation is the moat** — show it everywhere, treat it as a first-class feature
✅ **Anti-AI rules are NOT optional** — re-read them before generating each page
✅ **Mock data is locked** — use the values provided exactly
✅ **Industrial identity through typography + vocabulary, NOT decorative ornament**

Build slowly. Build well. The bar is Hyperliquid quality.

When you're ready, start with the home page.
