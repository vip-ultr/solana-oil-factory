# Sol Oil Factory — Frontend Design Brief

**Version 1.0 · 2026-05-09**
**Author:** Ammar (founder) · **Recipient:** Claude Design (Figma)
**Repo:** github.com/vip-ultr/solana-oil-factory · **Companion spec:** `../token-refinery-design.md`

---

## 0. How to read this brief

You are designing the complete frontend of **Sol Oil Factory** — a permissionless, non-custodial token-distribution platform on Solana. This brief is your single source of truth. Read it in order, end to end, before opening Figma.

**Deliverable:** a Figma file with every page in §7 designed across all three themes in §4.2, plus the component library in §8, plus mobile variants per §11. Final list in §14.

**Bar:** OpenSea / Vercel / Linear quality. If a screen feels generic, throw it away and start over. We will *never ship something that looks AI-generated.* Read §3 carefully — those are non-negotiable.

**Data:** there is no live backend yet. Every screen must use the mock data tables in §10. Use the same names and numbers everywhere — consistency across screens is what makes a design feel real.

**Assets:** see `assets/README.md` for what's bundled. URLs for everything else are inline in this brief.

---

## 1. The product in one paragraph

Sol Oil Factory is a platform where anyone can launch a **Token Refinery** — a non-custodial, on-chain distribution program that pays the *holders of any Solana token* a share of a reward pool, by virtue of holding. An operator picks a token, deposits a reward pool, and configures distribution; holders connect their wallet, the app auto-detects which refineries they're eligible for, and they claim. There are also two existing refinery types — the **Solana Refinery** (rewards on-chain activity with $CRUDE, our in-app score) and **Launchpad Refineries** (Pump / Bonk / Bags). The new Token Refinery is the headline feature for this redesign. The product theme is industrial — refineries, barrels, oil, prestige. Cross-refinery wallet **reputation** is a first-class concept: every wallet has a 0–100 trust score that operators can use as a sybil filter and that holders can build over time.

---

## 2. The bar

This is the level we're shooting for. Study the *visual language* of these — typography, density, restraint, microcopy:

| Reference | Why | URL |
|---|---|---|
| OpenSea | Token grids, filter UX, dark-mode density | https://opensea.io |
| Vercel Dashboard | Minimal, typographic, restrained palette | https://vercel.com/dashboard |
| Linear | Side nav on hover, command palette feel | https://linear.app |
| Phantom Wallet | Solana-native polish, money-handling clarity | https://phantom.com |
| Jupiter (jup.ag) | Solana DeFi UI density | https://jup.ag |
| Drift Protocol | Solana power-user dashboards | https://drift.trade |
| Notion | Side nav animation, content-first surfaces | https://notion.so |
| Helius Dashboard | Developer-tool aesthetic | https://dashboard.helius.dev |

Use WebFetch to pull these for inspiration when you need to study a pattern. Do **not** copy lockups, layouts, or compositions — internalize the feel and produce something original.

---

## 3. Anti-AI guardrails — read this twice

A design feels AI-generated when it commits any of these sins. Every one of them is banned.

**Banned visual moves:**
1. **No abstract gradient blobs** as decorative hero elements. No purple-to-pink "vibes" rectangles.
2. **No glassmorphism by default.** Use it surgically (one or two surfaces at most — modal backdrop, optionally the navbar). Never apply `backdrop-blur` to every card.
3. **No center-aligned everything.** Hero text can be left-aligned. Most product surfaces should be left-aligned.
4. **No "feature card" rows of 4 identical tiles** with an icon + 3 lines of text. That is the most overused AI-design pattern on the internet.
5. **No emoji in the UI** unless it's data the user produced (e.g. a leaderboard medal). No emoji empty states. No emoji buttons.
6. **No 3D illustrations** of coins, robots, isometric servers, or hands-holding-phones. None.
7. **No "neon glow on everything."** Glow is for emphasis (active state, primary CTA, Solana Mode highlight), not ambient.
8. **No drop-shadows the size of the element.** Shadows are 4–24px y-offset, low opacity (0.06–0.12). Never `0 20px 60px rgba(0,0,0,0.4)`.
9. **No SVG patterns** as page backgrounds (dot grids, diagonal lines, hex grids). Backgrounds are flat color or, at most, a single very-low-opacity noise texture.
10. **No oversized whitespace.** This is a power-user product. Operators want data density. Cards should hold real information, not 3 lines and 80px of padding.

**Banned copy moves:**
1. No **"Unleash X"**, **"Reimagined"**, **"Powered by AI"** (we don't use AI in the product), **"Next-generation"**, **"Web3 done right"**.
2. No **rocket / fire / chart-up emoji** in microcopy.
3. No **placeholder Lorem Ipsum** anywhere — every word in the design is real product copy.
4. No **fake stats** ("500K active users") on a brand-new product. Use real numbers from §10 mock data, or omit the stat.
5. No **passive "Connect to get started"** if there's a more useful state we could show. Pre-connect, show the public directory.

**Banned interaction moves:**
1. No **modal that doesn't close on Esc or overlay click**.
2. No **toast that lasts < 4 seconds for a destructive confirmation**.
3. No **loading spinners as the entire empty state**. Show a skeleton with the actual layout.
4. No **disabled buttons without tooltip explaining why**.

**What replaces the banned stuff:**
- **Typography over ornament.** Typographic hierarchy is the design.
- **Real product copy** that names real things ("Snapshot taken 4h ago · 1,247 eligible holders").
- **Microinteractions that reflect actual state** (a `pending` chip animates; an `active` chip is solid).
- **Information density** — show counts, percentages, addresses, timestamps, and let the user scan.

---

## 4. Brand identity

### 4.1 Existing assets — start here

We have a real brand already. Don't reinvent it.

- **Logo** (`assets/brand/logo.png`) — hex-stamp wordmark. Used as favicon and navbar mark.
- **Barrel** (`assets/brand/barrel.png`, `barrel.svg`) — the hero illustration. The product is "refining oil from your wallet activity." The barrel **is the brand.**
- **Wallet icons** (`assets/wallets/`) — Phantom, Solflare, Backpack. Used in the connect modal.
- **Partner icons** (`assets/refineries/`) — Bags, Pump.fun, Bonk.fun, Candle, Believe, Helius. Used on home + directory.

**Vibe statement:** *Industrial American refinery aesthetic meets clean Web3 product UI.* Think pipelines, barrels, prestige titles, hard-edged badges — but rendered with Vercel-grade typographic restraint, not skeuomorphic illustration. The product is fundamentally serious (real money, real tokens) and the design tone reflects that.

### 4.2 Color tokens — Light / Dark / Solana Mode

The current product runs Light + Dark with an oil-amber accent. We're adding a third theme: **Solana Mode** (opt-in, never auto). All three themes share the same CSS variable names — implementation already exists in `styles/globals.css`.

#### Light theme (default for `prefers-color-scheme: light`)
```
--bg-base:        #f5f5f7
--bg-surface:     #ffffff
--bg-elevated:    #f0f0f2
--bg-highlight:   #e8e8ea
--border-subtle:  #e2e2e4
--border-base:    #c8c8ca
--border-mid:     #b0b0b2
--text-primary:   #1a1a1a
--text-secondary: #555555
--text-muted:     #888888
--text-dim:       #aaaaaa
--accent:         #e09515   (oil amber)
--accent-hover:   #c88210
--accent-glow:    rgba(224, 149, 21, 0.22)
--green:          #22c55e   (success / verified)
--red:            #c0392b   (danger / risk)
```

#### Dark theme (default for `prefers-color-scheme: dark`)
```
--bg-base:        #080808
--bg-surface:     #0f0f0f
--bg-elevated:    #141414
--bg-highlight:   #1a1a1a
--border-subtle:  #1a1a1a
--border-base:    #2a2a2a
--border-mid:     #333333
--text-primary:   #f0f0f0
--text-secondary: #aaaaaa
--text-muted:     #666666
--text-dim:       #444444
--accent:         #f5a623   (oil amber, brighter for dark BG)
--accent-hover:   #e09515
--accent-glow:    rgba(245, 166, 35, 0.22)
--green:          #22c55e
--red:            #E84125
```

#### Solana Mode (opt-in only)
```
--bg-base:        #0a0014   (deep purple-black, not pure black)
--bg-surface:     #120526
--bg-elevated:    #1a0a30
--bg-highlight:   #240e3d
--border-subtle:  #2a1145
--border-base:    #3a1d5c
--border-mid:     #4d2a76
--text-primary:   #f5f0ff
--text-secondary: #bcaee0
--text-muted:     #8a7cb8
--text-dim:       #5e547a
--solana-green:   #14F195   (the brand mint)
--solana-purple:  #9945FF   (the brand purple)
--accent:         #14F195   (Solana Mode reassigns accent → mint green)
--accent-hover:   #00D982
--accent-glow:    rgba(20, 241, 149, 0.28)
--gradient-brand: linear-gradient(135deg, #9945FF 0%, #14F195 100%)
```

**Solana Mode usage rules:**
- The mint-to-purple gradient (`--gradient-brand`) appears **once per screen, max** — typically as a thin top border on the navbar, or behind the primary CTA on hover.
- Headings can use `--solana-green` for emphasis sparingly (one phrase per section).
- Body text stays in `--text-primary` — never colored gradient text in body copy. That's a banned AI-design move.
- The barrel illustration in Solana Mode gets a faint purple-to-green inner-glow on the gauge fill, not a recolor of the barrel itself.

#### Theme switcher placement
Bottom of the side nav, persistent. Three icons: ☀ (light), ☾ (dark), ◈ (Solana Mode — diamond glyph). Use SF Symbols-style line icons; no emoji.

### 4.3 Typography

Already locked in code, do not change without reason:

- **Display:** Space Grotesk (700) — page titles, refinery names, marketing surfaces. Tight tracking (-0.02em).
- **Body:** Inter (400/500/600) — everything else. Default tracking.
- **Mono:** JetBrains Mono (500) — wallet addresses, token amounts, on-chain numbers. Always tabular-nums.

**Type scale (rems, base 16):**
| Use | Size | Weight | Line-height | Letter-spacing |
|---|---|---|---|---|
| Hero | 3.5rem (56px) | 700 | 1.05 | -0.03em |
| H1 | 2.25rem (36px) | 700 | 1.1 | -0.02em |
| H2 | 1.5rem (24px) | 600 | 1.2 | -0.015em |
| H3 | 1.125rem (18px) | 600 | 1.3 | -0.01em |
| Body L | 1rem (16px) | 400 | 1.55 | 0 |
| Body | 0.9375rem (15px) | 400 | 1.55 | 0 |
| Body S | 0.8125rem (13px) | 400 | 1.5 | 0 |
| Caption | 0.75rem (12px) | 500 | 1.4 | 0.01em |
| Mono S | 0.8125rem (13px) | 500 | 1.4 | 0 |
| Number L (claim amount) | 2rem (32px) | 600 mono | 1.1 | -0.01em |

**Number formatting rules:**
- Token balances: tabular-nums, `1,247.50 BONK` (commas for thousands, decimals shown only for non-integer).
- USD amounts: `$1,247.50` with `.00` only if truly zero cents.
- Wallet addresses: `Hxk2…7gPZ` (4-char prefix + ellipsis + 4-char suffix) for display; full on hover or click-to-copy.
- Percentages: `12.4%` (one decimal) for normal stats, `0.001%` for tiny ones.
- Time: relative ("4h ago", "2 days ago") in feeds, absolute ("May 9, 2026 · 14:32 UTC") on hover or detail rows.
- Big numbers: `2.4M`, `847k`, `1.2B` for compact contexts; full numbers in detail rows.

### 4.4 The barrel + oil metaphor

The product is themed: refineries, barrels, oil. This is *the* differentiator. Use it consciously, not constantly.

**Where the barrel belongs:**
- Home hero (animated fill on the headline barrel — already implemented).
- Single-refinery page, top-right (barrel filled to "% of pool remaining").
- Empty states for refinery surfaces (a hand-drawn empty barrel — gauge at 0%).

**Where the barrel does NOT belong:**
- Settings pages, ToS, leaderboard rows, wallet profile, dashboard tabs.

**Oil/refinery copy phrases that are on-brand** (use sparingly):
- "Refine your tokens"
- "Pool" (the deposit) — never "vault" or "treasury" in user copy
- "Snapshot" (the eligibility freeze)
- "Operator" (the launcher) — never "creator", "deployer", or "owner" in UI
- "Holder" — never "user" when talking about the eligible role
- "Drain" / "Top up" (for pool size changes)
- "Closed refinery" — terminal state

**Avoid the metaphor when:**
- Talking about real money risk. Say "you may receive less than expected if the token has transfer fees" — don't say "less oil flows when the pipeline taxes you."

---

## 5. Information architecture

```
/
├─ /refineries                            Directory of all token refineries
├─ /refinery/launch                       4-step launch form
├─ /refinery/<token-mint>                 Token page — lists ALL refineries for this mint
│  └─ ?r=<refinery-id>                    Specific refinery (claim UI + stats)
├─ /refinery/solana                       Existing Solana Refinery (activity → $CRUDE)
├─ /refinery/launchpad/
│  ├─ pump
│  ├─ bonk
│  ├─ bags
│  └─ candle
├─ /dashboard                             Operator + holder dashboard (auth-gated)
│  ├─ ?tab=refineries                     Refineries this wallet has launched
│  ├─ ?tab=claims                         Claims received
│  └─ ?tab=reputation                     Cross-refinery score
├─ /wallet/<addr>                         Public wallet profile
├─ /leaderboard                           Cross-refinery leaderboard
└─ /legal/
   ├─ terms
   └─ privacy
```

**Auth model:** wallet-connect, no email/password. Connection state determines access:
- Public: `/`, `/refineries`, `/refinery/*`, `/wallet/*`, `/leaderboard`, `/legal/*`.
- Connected: above + `/dashboard`, claim actions, launch actions.
- Every (re)connect triggers a ToS modal that must be accepted before any action — see §6.5.

---

## 6. Global UI framework

### 6.1 Side navigation

**Pattern:** Linear / Notion — collapsed-to-icons by default (52px wide), expanded-on-hover (224px wide). Animation: 150ms ease-out, no Framer overhead. Icons are line icons (Lucide or hand-drawn equivalents), 18×18px.

**Items (top to bottom):**
1. Sol Oil Factory logo (32×32, links to `/`)
2. — divider —
3. Home (`/`)
4. Refineries (`/refineries`) — *primary destination, slight emphasis*
5. Launch Refinery (`/refinery/launch`) — accent color tint
6. Leaderboard (`/leaderboard`)
7. Solana Refinery (`/refinery/solana`) — sub-item style
8. Launchpads (`/refinery/launchpad`) — collapsible group with pump / bonk / bags / candle children
9. — divider —
10. Dashboard (`/dashboard`) — **only visible when connected**
11. — spacer (push to bottom) —
12. Theme switcher (3 icons inline)
13. Wallet chip (connected state) OR Connect button (disconnected)

**Mobile:** side nav becomes a bottom-bar tab switcher with 4 items max — Home, Refineries, Launch (centered, accent fill), Leaderboard, Dashboard. The remaining items live in a hamburger drawer accessed from a top-bar menu.

### 6.2 Top bar

Minimal. Width-constrained to the page (max-width 1280px). Content:
- (Mobile only) Hamburger menu — opens the side-nav drawer
- (Right) Network indicator: "🟢 Devnet" pill (color: green dot + text, never an emoji — use a 6px solid circle). On mainnet, "🟢 Mainnet". When network is wrong, "⚠ Wrong network — switch to Devnet" red pill.
- (Right) Wallet chip — connected state shows truncated address + a small avatar (Jdenticon-style, deterministic from wallet pubkey) + chevron-down for menu. Disconnected: a "Connect Wallet" button (accent fill, not outline).

### 6.3 Theme switcher

Three icons, inline, in the side nav footer. Selected theme has a 1px ring in the accent color. Tooltips: "Light theme", "Dark theme", "Solana mode (vibrant)".

Persist in `localStorage` under key `sof.theme`. Default = `system`.

### 6.4 ToS modal pattern

**Trigger:** every wallet (re)connect. `localStorage` records the last-accepted ToS hash. If hash differs from current ToS version, re-prompt.

**Content:**
- Title: "Terms of Service"
- One-paragraph human summary at top (3–4 lines max), e.g.:
  > "Sol Oil Factory is a non-custodial platform. Funds are held in audited on-chain programs — the team holds no keys. Crypto carries risk. Sanctioned-country residents cannot use this product. By continuing you agree to the full Terms below."
- Scrollable terms block (250–320px tall on desktop), monospace borders.
- One checkbox: "I have read and accept the Terms of Service and Privacy Policy."
- Two buttons: **Continue** (accent, disabled until checkbox), **Disconnect wallet** (outline, danger-tone text).
- ESC key triggers Disconnect (cannot dismiss without choice).

### 6.5 Splash screen

Already implemented. Logo pulses for 4s, fades out. Don't redesign — just reference the existing pattern.

---

## 7. Pages — page-by-page layouts

For each page below: design it in **Light**, **Dark**, and **Solana Mode**. Mobile variants per §11. Every state in §7.10 must have a designed variant where applicable.

### 7.1 / — Home

**Goal:** orient a newcomer in 5 seconds. Get them either browsing the directory or launching a refinery.

**Above the fold (1440px wide):**
- Side nav (collapsed, left).
- **Hero block** — 760px wide, left-aligned, 80px top padding:
  - Eyebrow (caption size, --text-muted): "PERMISSIONLESS SOLANA TOKEN DISTRIBUTION"
  - H1 (Display 700, 56px): "Reward your holders. **On-chain.** Without writing code."
    - "On-chain" is in `--accent` color
  - Subhead (Body L, 17px, --text-secondary, max 540px wide): "Launch a Token Refinery for any Solana token in 90 seconds. Holders auto-detect their eligibility, claim non-custodially through our audited program. You set the rules."
  - Two CTAs side by side:
    - **Launch a Refinery** — primary (accent fill, 13px padding-y, 22px padding-x, 600 weight)
    - **Browse Refineries** — secondary (outline, same sizing)
  - Below: a tiny row of trust-by-association — "Powered by Helius · Audited by [pending] · Built on Solana" — Body S, --text-muted.
- **Hero illustration** (right side, 480px wide) — the barrel, animated fill at ~62%. Behind it: a faint vertical line (1px, --border-subtle) suggesting a refinery pipe. NOT a gradient blob. The barrel is the only visual.

**Below the fold:**

**Section 2 — "Featured Refineries"** (3 columns, 6 cards desktop / 2 tablet / 1 mobile):
- Pull from §10.1 mock data, top 6 by pool value
- Each card: token icon (40×40, rounded-md), name + symbol, status badge (Active / Closing soon / Closed), pool size in token + USD, claim rate ("1% holders get 12,000 BONK"), "View →" link
- Card has hover state: 1px border becomes accent, subtle 1px y-translate

**Section 3 — "How a Token Refinery works"** (4-step explainer, but NOT identical cards):
- Use a numbered timeline pattern — vertical line down the left, step numbers in circles, content right-aligned to the line.
- Steps:
  1. **Operator picks a token & deposits a pool** — copy: "Paste any Solana mint. Our program holds the deposit in a PDA escrow. You're not custodying anything."
  2. **Snapshot freezes eligible holders** — copy: "By default, a single snapshot at launch. Operator can opt into recurring."
  3. **Holders connect & claim** — copy: "Auto-detection finds every refinery they're eligible for. One-click claim, on-chain, ~0.001 SOL gas."
  4. **Reputation accrues across refineries** — copy: "Real holders build a trust score. Sybil farms don't."
- Each step has a small inline diagram (use line-only SVG: a token icon → a barrel → wallets, etc.) NOT decorative gradients.

**Section 4 — "Three refinery types"** (the existing system + the new one):
- Three columns, but visually distinct (not feature-card-row pattern):
  - **Solana Refinery** — uses `<SiSolana>` icon, copy about $CRUDE/activity, link to `/refinery/solana`
  - **Launchpad Refineries** — small grid of partner icons (Pump, Bonk, Bags, Candle), copy about platform-wide rewards
  - **Token Refineries** *(NEW badge)* — barrel icon, copy about any-SPL distribution, link to `/refineries`

**Section 5 — Top operators leaderboard preview** (3 rows + "View Full Leaderboard →"):
- Use §10.4 mock data
- Same row pattern as `/leaderboard`, just truncated

**Section 6 — Footer** (existing footer, audit when implementing).

**State variants:**
- Connected: hero CTA changes to "Open Dashboard" (primary) + "Browse Refineries" (secondary).
- Disconnected: as above.

### 7.2 /refineries — Directory

**Goal:** the user finds a refinery to claim from, or browses to find tokens they hold that have refineries.

**Layout:**

**Header strip** (sticky on scroll, 64px tall, blurred surface):
- Left: page title "All Token Refineries" (H2)
- Right: count "247 active · 89 closed in last 30d" (Body S, --text-muted)
- Below header, filter row:
  - **Search input** — placeholder: "Search by token name, symbol, or mint address"
  - **Status filter** — pill segmented control: All | Active | Closing soon | Closed
  - **Sort dropdown** — Pool size (default) | Newest | Highest claim rate | Most claimers | Closing soonest
  - **Operator badge filter** — pill toggles: ✓ Verified deployer | ✓ Verified CTO | All operators
  - **Min reputation filter** — slider 0–80 (default 0)

**Main area: a TABLE** (not a card grid). This is a power-user product. Density matters.
- Columns:
  | Token | Pool | Holders eligible | Claim rate | Snapshot | Operator | Status | Action |
  |---|---|---|---|---|---|---|---|
  | icon + name + symbol | "1.2M BONK · $4,820" | "1,247" | "1% = 12,000 BONK" | "4h ago" | badge + truncated wallet | chip | "Claim" or "View" |
- Row height: 64px. Hover = `--bg-highlight`.
- "Claim" button only shown if connected wallet is in eligible set (mock: green) — otherwise "View →".
- If wallet has unclaimed → small unclaimed-amount badge on the row.
- Empty state: "No refineries match these filters. Clear filters →"

**Right side panel** (240px, optional, expandable):
- "Your eligibility" section — when connected, show: "You're eligible for 3 refineries" + small list with claim amounts.

**Mobile:** table collapses to cards. Keep the same data — token / pool / claim rate / status / action — just stacked.

### 7.3 /refinery/launch — Multi-step launch form

**Goal:** an operator launches a refinery in under 2 minutes without confusion.

**Layout:** centered single-column, max-width 640px. Step indicator at top.

**Step indicator:** Horizontal — `1. Token · 2. Identity · 3. Distribution · 4. Confirm`. Active step in accent. Completed steps with a checkmark in `--green`.

**Step 1 — Token contract address:**
- Large input: "Paste a Solana mint address" — autofocus
- On valid mint, fetch metadata in <1s. Show a loading skeleton.
- Once loaded: a token preview card appears below — icon, name, symbol, supply, holder count, current price.
- **Risk panel** below the preview — clearly demarcated, never hidden:
  - ✅ Green badges: "Jupiter verified", "Authorities renounced", "RugCheck clean"
  - ⚠ Yellow badges: "Mint authority active — operator can dilute", "Concentrated holder — top wallet >50%", "Low liquidity — <100 holders"
  - 🚫 Red blocks (cannot launch): "Token on scam list", "RugCheck danger", "Transfer fee >5%"
  - Where freeze authority is active: explicit checkbox: "I acknowledge that the freeze authority is active and may freeze claims at any time." Required to proceed.
- Continue button at bottom (disabled until valid token selected and no red blocks).

**Step 2 — Operator identity:**
- Auto-detect runs in background.
- Three states:
  - **Verified deployer ✓** — "Your wallet is the mint authority. You'll show a Verified Deployer badge on your refinery." Green panel.
  - **Eligible for Verified CTO** — "Your wallet doesn't match the mint authority. You can request CTO verification with proof of project takeover." Link to a separate flow (form on a sub-page; not designed in this brief — placeholder).
  - **Unverified** — "Your refinery will launch without a verification badge. You can still launch." Neutral panel.
- Continue button.

**Step 3 — Configure distribution** — the meat. Two-column on desktop:

Left column:
- **Reward pool size** — number input + token-symbol prefix. Below the input, a live computation: "≈ 12,000 BONK per 1% holder · 1,247 eligible at current snapshot"
- **Claim rate framing toggle** — segmented: "Tokens per 1% of supply" / "Total pool ÷ holders evenly"
- **Snapshot strategy** — radio group:
  - At launch (default, recommended)
  - Hourly
  - Daily
  - Weekly
- **Pool-empty behavior** — radio:
  - Pro-rata scale-down (default)
  - First-come-first-served
- **Per-claim cap** — slider 0.1% – 100%, default 5%. Live caption: "A holder can claim at most 5% of remaining pool per epoch."
- **Claim window** — number input (days), default 30. Toggle for "open-ended."

Right column (a "Defaults look good" digest, sticky on scroll):
- Title: "Sybil defenses (defaults)"
- 4 toggles, all on by default:
  - ✓ Wallet age ≥ 30 days
  - ✓ Holding duration ≥ 24 hours
  - ✓ Cluster filter (shared funding sources)
  - ✓ Min reputation: 0 (slider, can raise)
- "Verified-only mode" big switch at the bottom — when on, shows: "Combines wallet age ≥ 90d, holding duration ≥ 7d, strict cluster filter."
- Tooltip on each: explains the rule and trade-off.

Continue button.

**Step 4 — Confirm + pay:**
- A summary card recapping every choice. Editable inline (each row has an edit pencil).
- **Fee breakdown** clearly itemized:
  - Launch fee: 0.1 SOL
  - Deposit fee: 1% of deposit, in deposited token (auto-swapped to SOL daily)
  - Total tokens transferred: pool + deposit fee
  - Estimated network fee: 0.00025 SOL
- **Custody disclosure** in a thin panel:
  > "Your tokens will be held in a program-owned PDA escrow. Neither Sol Oil Factory nor any third party can withdraw them — only you, subject to claim-window-lock + 7-day cooldown after window closes, or holders claiming under the rules above."
- **Risk acknowledgment** checkbox: "I have configured this refinery and understand the rules."
- Big primary button: **Sign & launch** — opens wallet for one combined transaction.
- After tx broadcast: full-screen confirmation showing tx signature, link to Solscan, and link to the new refinery page.

### 7.4 /refinery/<token-mint> — Token page (multiple refineries)

**When this page is shown:** there are 1+ refineries for this token mint. (When only 1, redirect transparently to `?r=<id>`.)

**Layout:**

**Header (140px tall):**
- Token icon (64×64) + Token name (H1) + Symbol (Body L, --text-secondary) + mint address (mono, truncated, click-to-copy)
- Row of risk + verification badges (small chips)
- Three top-level stats: "Total pool across all refineries · Total holders eligible · Total claimed lifetime"

**Main:**
- "X refineries for this token" heading + sort dropdown (default: by pool size desc)
- **Refinery cards stacked vertically** (full width, ~140px tall):
  - Operator badge + truncated wallet
  - Pool remaining + status chip
  - Snapshot strategy + per-claim cap + claim window
  - Right side: "View →" or "Claim X tokens →"

### 7.5 /refinery/<token-mint>?r=<refinery-id> — Single refinery

**The headline screen.** Designed first, designed best.

**Layout (desktop, 1280px):**

**Top hero strip (180px):**
- Left (60% width):
  - Eyebrow: "REFINERY · `8z…3Ks` operator" (small, muted)
  - Token name + symbol (Display 700, 36px) + verification badges inline
  - Subline: "Operated by `Hxk2…7gPZ` · Launched May 9, 2026" (Body S)
  - Risk badges row (Mintable / Concentrated / etc. if applicable)
  - Two stats large + side by side: **Pool remaining** (mono number L) and **Claim rate** ("1% holders get 12,000 BONK")
- Right (40% width):
  - Barrel illustration, gauge filled to actual % remaining. Caption below: "62% of original pool remaining"

**Below hero — claim block** (only when wallet is connected & eligible):
- Big card, 1px border-mid, 28px padding:
  - Eligibility status:
    - Eligible → "You hold 12,400 BONK at snapshot. You can claim **148.8 BONK** now." (mono, accent color on amount)
    - Not eligible → "Your wallet held 0 BONK at the snapshot taken 4h ago. Buy tokens and wait for the next snapshot." (faded)
    - Already claimed → "You claimed 148.8 BONK on May 9 · [tx link]" (green checkmark)
  - Claim button (huge, 56px tall, accent fill) or disabled state with reason
  - Below button: "Network fee ≈ 0.001 SOL · Token-2022 transfer fee 0% · You'll receive **148.8 BONK**"

**Stats grid** (4 columns, 100px tall each):
| Pool deposited | Total claimed | Holders claimed | Claim window left |
|---|---|---|---|
| 1.2M BONK · $4,820 | 387,400 BONK · $1,540 | 240 / 1,247 | 27 days |

**Activity feed** (right rail, 320px wide, scrollable):
- Live claims feed, top to bottom:
  - `Hxk2…7gPZ claimed 148.8 BONK · 2m ago`
  - `4Bsd…91jU claimed 12,000 BONK · 5m ago`
  - ... 30 visible, infinite scroll
- Each row: avatar + truncated wallet + amount + relative time
- Filter: All claims / Top claims / Operator actions

**Activity chart** (below stats grid, 320px tall):
- Line chart of pool drain over time. X = time since launch. Y = pool remaining %.
- Annotations for snapshot events, top-up events, pause/unpause.
- Use `--text-muted` axis lines, `--accent` line, no fill gradient. Recharts or D3.

**Operator section** (collapsible, only visible to operator):
- "Manage this refinery" panel — top up, withdraw (locked / unlocked indicator), pause, update rate, close. Each action with the policy explanation.

**ToS / risk footer** (always visible, low-emphasis):
- "Sol Oil Factory does not vouch for tokens listed. This refinery was permissionlessly launched by `Hxk2…7gPZ`. Read our risk disclosure."

### 7.6 /dashboard — Operator + holder dashboard

**Auth-gated.** Three tabs:

**Tab 1 — My Refineries:**
- Table of refineries this wallet has launched
- Columns: Token | Status | Pool remaining | Holders claimed | Window left | Action
- Action column: "Manage →" links to the per-refinery page in operator mode
- Above the table: a primary CTA "Launch a new refinery →"

**Tab 2 — Claims received:**
- Table of refineries this wallet has CLAIMED FROM
- Columns: Token | Amount claimed | When | Refinery operator | Status (Active / Closed)
- Above: lifetime stats — "You've claimed from 14 refineries · ~$240 lifetime value"

**Tab 3 — Reputation:**
- Big number: your score (0–100), large, mono
- Trend chart (last 90 days, sparkline)
- Breakdown: each contributing signal with weight + your value
  - Refineries claimed from: 14 → +18 score
  - Avg holding duration: 47d → +12
  - Tokens held >7d post-claim: 11/14 → +9
  - Cluster flag: clear → +0 penalty
  - Wallet age: 380d → +6
  - Refineries launched: 2 → +5
- "Why your score went up/down this week" — diff narrative.

### 7.7 /wallet/<addr> — Public wallet profile

**Goal:** a public-facing reputation page. Shareable URL.

**Header:**
- Jdenticon avatar (64×64)
- Truncated address + copy button + Solscan link
- Reputation score badge (large, 0–100, mono)
- Connection status: "Last active 2 days ago"

**Tabs:**
- Activity: claims, launches, recent on-chain events
- Refineries operated: list of refineries this wallet has launched
- Refineries claimed from: list of token refineries claimed
- Reputation breakdown: same content as dashboard tab 3 (public)

### 7.8 /leaderboard

**Existing page, evolving for v1.** Now spans:
- $CRUDE leaderboard (existing) — Solana Refinery + Launchpad refineries combined
- Token Refinery operators leaderboard (new) — by lifetime tokens distributed × USD price
- Top claimers across token refineries (new)
- Top reputation scores (new)

Tabs at top, table below for each. Same row pattern as §7.2 directory but with rank column and medal cells for top 3 (use a small medal SVG, not an emoji).

### 7.9 /legal/terms + /legal/privacy

**Long-form text pages.** Single column, max-width 720px, reading-optimized.
- Last-updated date at top
- Table of contents (sticky on scroll, left rail on desktop, collapsible drawer on mobile)
- Body uses Body L (17px) with generous line-height (1.7)
- Section headings styled as H2 / H3
- Example clauses are pre-written by lawyer; mock with Lorem only for layout but final copy will replace.

### 7.10 Empty / loading / error / paused states

For each page in §7.1–7.8, design:
- **Loading:** skeleton with the actual layout (gray blocks the size of real content). No spinners except for in-flight actions (claim button → spinner during sign).
- **Empty:** for a list with 0 items. Headline + one-line explainer + CTA. Example: "/dashboard?tab=refineries" empty: "You haven't launched a refinery yet." + "Launch your first →"
- **Error:** banner at top of the page (red panel, 1px border, 12px padding). Message + retry button. Don't block the page; show what we can.
- **Paused:** specifically for refinery pages. A full-width amber banner above the claim block: "This refinery is paused by the operator. Claims will resume when unpaused." Disable the claim button.

---

## 8. Component library inventory

Design these as reusable Figma components. Variants where listed.

**Buttons:**
- Primary (accent fill)
- Secondary (outline, accent text)
- Tertiary (text-only, accent)
- Destructive (red outline → red fill on hover)
- Sizes: sm (32px), md (40px), lg (48px), xl (56px)
- States: default, hover, focus (2px ring), active, disabled, loading

**Inputs:**
- Text input (default, focus, error, disabled)
- Search input (with leading icon, optional clear)
- Number input (with stepper)
- Address input (with paste detection + validation tick)
- Textarea
- Select / dropdown (with search, multi-select variant)
- Slider (single-thumb, with value caption)
- Checkbox
- Radio group
- Toggle switch

**Cards:**
- Refinery card (compact, used in directory grid)
- Refinery row (table-row variant for directory list)
- Stat card (label + big number + delta)
- Token preview card (for launch step 1)

**Chips / badges:**
- Status chip (Active / Pending / Paused / Closed / Closing soon) — color-coded
- Verification chip (Verified deployer ✓, Verified CTO ✓)
- Risk chip (Mintable, Concentrated, Low liquidity, Freeze authority active)
- Token-2022 chip (Transfer fee 1.5%, Permanent delegate)
- Network chip (Devnet / Mainnet)

**Wallet UI:**
- Connect modal (3 wallets visible: Phantom, Solflare, Backpack — with "More wallets" expanding panel)
- Wallet chip (connected state in navbar)
- ToS modal (covered in §6.4)
- Sign-tx modal (mock — shown when waiting for wallet sig: "Sign in your wallet" + cancel)

**Tables:**
- Standard table row (64px tall, hover state, click-to-navigate variant)
- Mobile card-row (stacked variant of the table row)

**Charts:**
- Line chart (single series) — used for pool drain
- Sparkline (compact line for trend) — used for reputation
- Bar chart (single series, horizontal) — used for top-claimants

**Misc:**
- Avatar (Jdenticon, 24/32/40/64 sizes)
- Toast (success / error / info / warning)
- Tooltip
- Dropdown menu
- Tab bar (segmented / underlined variants)
- Pagination
- Step indicator (for launch form)

---

## 9. Interaction & motion

- **Default duration:** 150ms ease-out for most state changes (hover, active).
- **Page transitions:** none. Instant. Web3 users hate fluff.
- **Modal enter:** 200ms fade + 12px slide-up.
- **Toast enter:** 250ms slide-from-bottom on mobile, slide-from-right on desktop. Dismiss after 6s (or 10s for errors).
- **Number animations:** when a number changes (claim succeeds → pool drops), tween 600ms with `requestAnimationFrame`. Use easing `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Barrel fill:** existing animation. 800ms ease-in-out on initial mount, then live-updates on epoch changes.
- **Skeleton shimmer:** 1500ms loop, low contrast.
- **Hover reveal of side nav:** 150ms width transition. Don't animate items individually — just the container.

---

## 10. Mock data — use these exact values

**Use these exact tokens, wallets, numbers across every screen.** Consistency is what makes the design feel real.

### 10.1 Twelve sample token refineries

| Token | Symbol | Mint (truncated) | Operator | Pool deposit | Holders eligible | Claim rate (per 1%) | Status | Snapshot strategy | Verified |
|---|---|---|---|---|---|---|---|---|---|
| Bonk | BONK | DezX…AKKM | Hxk2…7gPZ | 1,247,000 BONK ($4,820) | 1,247 | 12,000 BONK | Active | At launch | Verified deployer |
| Jupiter | JUP | JUPyi…dpvS | 4Bsd…91jU | 8,400 JUP ($6,720) | 2,143 | 84 JUP | Active | Daily | Verified deployer |
| dogwifhat | WIF | EKpQ…WFkW | 9wF7…3Lz8 | 84,000 WIF ($168,000) | 8,920 | 840 WIF | Active | At launch | Verified CTO |
| Popcat | POPCAT | 7GCi…W5cy | 2zKp…hH4M | 142,000 POPCAT ($85,200) | 4,506 | 1,420 POPCAT | Active | Hourly | Unverified |
| Pyth | PYTH | HZ1J…3pH3 | Pyth9…D7ax | 41,000 PYTH ($14,350) | 6,201 | 410 PYTH | Closing soon | Weekly | Verified deployer |
| Jito | JTO | jtojtomep…1zb | 5jVq…78dM | 12,500 JTO ($28,750) | 3,847 | 125 JTO | Active | At launch | Verified deployer |
| Mother Iggy | MOTHER | 3S8q…iyDM | 8zZb…3Ksn | 510,000 MOTHER ($1,840) | 1,128 | 5,100 MOTHER | Active | Daily | Unverified |
| MEW | MEW | MEW1…tmZA | 6FdN…XnQ2 | 48,000,000 MEW ($240) | 22,144 | 480,000 MEW | Active | At launch | Unverified |
| Raydium | RAY | 4k3D…mq56 | RayLi…D9pT | 6,200 RAY ($14,200) | 4,891 | 62 RAY | Active | Daily | Verified deployer |
| Orca | ORCA | orcaE…Fnq3 | OrcaT…D7vM | 9,400 ORCA ($23,500) | 3,012 | 94 ORCA | Active | At launch | Verified deployer |
| Marinade | MNDE | MNDE…YFu8 | MndS…DwY3 | 55,000 MNDE ($8,250) | 7,820 | 550 MNDE | Active | Weekly | Verified deployer |
| GIGACHAD | GIGA | 63LfDmN…3eQy | 7HpZ…44tL | 22,000,000 GIGA ($820) | 14,302 | 220,000 GIGA | Closed | At launch | Unverified |

**For token icons:** use the public Jupiter token list CDN (`https://static.jup.ag/jup/icon.png` etc.) — Claude Design can WebFetch the Jupiter token list to get icon URLs by mint. If a mock token isn't on Jupiter, use a deterministic color block with the symbol initial (no emoji, no AI-generated coin art).

### 10.2 Six sample wallets with reputation

| Wallet | Reputation | Refineries claimed | Avg holding | Refineries launched | Cluster flag | Wallet age |
|---|---|---|---|---|---|---|
| Hxk2…7gPZ | 84 | 14 | 47d | 2 (verified deployer on both) | clean | 380d |
| 4Bsd…91jU | 67 | 9 | 23d | 1 | clean | 220d |
| 9wF7…3Lz8 | 51 | 22 | 12d (flipper-leaning) | 0 | clean | 510d |
| 2zKp…hH4M | 42 | 6 | 38d | 0 | clean | 95d |
| 8zZb…3Ksn | 21 | 31 | 4d (flipper) | 0 | flagged (cluster of 12) | 60d |
| 7HpZ…44tL | 8 | 47 | 1d | 0 | flagged (cluster of 38) | 18d |

### 10.3 Recent claims feed (mix into activity feeds across screens)

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

### 10.4 Top operators leaderboard

| # | Operator | Refineries operated | Lifetime distributed (USD) | Avg reputation of claimers |
|---|---|---|---|---|
| 1 | RayLi…D9pT | 8 | $284,200 | 71 |
| 2 | Pyth9…D7ax | 5 | $189,400 | 68 |
| 3 | OrcaT…D7vM | 12 | $156,800 | 64 |
| 4 | Hxk2…7gPZ | 2 | $14,820 | 78 |
| 5 | MndS…DwY3 | 4 | $11,200 | 62 |

---

## 11. Mobile breakpoints

- **xs:** ≤ 360px (small phones — design for, never break)
- **sm:** 361–640px (most phones)
- **md:** 641–1024px (tablet)
- **lg:** 1025–1440px (laptop, default)
- **xl:** > 1441px (desktop)

**Rules:**
- Side nav collapses to bottom-bar at < 1024px.
- Multi-column launch form collapses to single column at < 768px.
- Tables collapse to stacked card rows at < 768px.
- Hero scales down: 56px → 40px → 32px at xs.
- Right rails (activity feeds) collapse below main content at < 1024px, with a collapsible toggle.

Design every page at **lg** (default 1280px frame in Figma) AND **sm** (375px frame).

---

## 12. Accessibility

- WCAG AA contrast minimum throughout. Solana Mode in particular: `--text-secondary` against `--bg-base` must hit 4.5:1.
- Every interactive element has a visible focus state (2px ring, accent color, 2px offset).
- All icons that aren't decorative have aria-labels.
- Form fields have associated labels (visible, not just placeholder).
- Toasts announce via aria-live="polite" (errors via aria-live="assertive").
- Modals trap focus and return focus on close.
- Keyboard nav: Tab through interactive elements in logical order; Esc closes modals and dropdowns.
- Color is never the only signal — risk badges have icons + color, status chips have text + color.

---

## 13. Visual references — fetch on demand

When you need to study a pattern, WebFetch these. **Don't bundle screenshots** in this brief.

| For | Fetch |
|---|---|
| Token grid + filter UX | https://opensea.io/collections |
| Side nav animation | https://linear.app + https://notion.so |
| Solana brand colors | https://solana.com/branding |
| DeFi dashboard density | https://drift.trade + https://app.kamino.finance |
| Token swap UX (for launch flow inspiration) | https://jup.ag |
| Wallet connect flow | https://phantom.com (open the connect modal) |
| Public wallet profile pattern | https://debank.com + https://birdeye.so |
| Long-form legal page | https://vercel.com/legal/terms |
| Documentation typography | https://docs.solana.com |

Pull the Solana wordmark / logo on demand from solana.com/branding for Solana Mode treatments.

---

## 14. Deliverables — what to return

A single Figma file with these pages, organized in this order:

**Page 0 — Cover** — title, brief author, version, contents.

**Page 1 — Foundations:**
- Color tokens (light, dark, Solana mode) — swatches with names + hex
- Type scale specimen
- Spacing scale (4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 80 / 120)
- Iconography (line set, 16/18/24/32 sizes)

**Page 2 — Component library** — every component in §8 with all variants.

**Page 3 — Global UI** — side nav (collapsed, expanded, mobile bottom bar), top bar, ToS modal, theme switcher, splash.

**Pages 4–11 — Each page from §7** — design at desktop (1280px) AND mobile (375px) AND in all three themes. Include all relevant states from §7.10 for that page.

**Page 12 — Flows** — connected click-through prototypes for:
- Launching a refinery (4 steps + sign + confirmation)
- Claiming from a refinery (browse → connect → ToS → claim → success)
- Operator managing a refinery (dashboard → manage → top up)

**Page 13 — Solana Mode showcase** — a single hero shot of the home page in Solana Mode for marketing material.

When done: comment the file with a one-paragraph rationale per page (why these choices). The dev team will reference this when implementing.

---

## 15. Out of scope for this design pass

Do **not** design these in this round:
- Per-token barrel theming (deferred to v1.5+)
- Civic Pass / KYC tier UI
- Refinery ratings / reviews UI
- Telegram / Discord integration UIs
- DAO governance UIs
- i18n / translation toggles
- Email notifications
- Embed widgets ("share refinery on your website")
- Admin / moderator panels (internal, not public)

If something comes up that *needs* a design surface and isn't in this brief, write a comment in the Figma file flagging it for a v1.1 design pass — don't invent a screen for it.

---

## 16. Questions before you start

If anything is ambiguous, write the question in a Figma comment on Page 0 and proceed with your best guess. Don't block on me. This brief errs on the side of being prescriptive — when in doubt, default to:
1. Less ornament, more typography.
2. More density, less whitespace.
3. Real data, real copy, real numbers.
4. Operator power-user > newcomer hand-holding.

Make this look like the most professional Solana product anyone has shipped. Then ship.
