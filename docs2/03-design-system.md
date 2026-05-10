# 03 — Design System

**Audience:** Designers + frontend developers
**Purpose:** Visual identity, typography, colors, layout patterns, locked decisions

---

# Sol Oil Factory — Design Decisions Summary

**Version 1.0 · 2026-05-09**
**Purpose:** Compact reference of every decision locked during Sol Oil Factory frontend planning. Use this as a cross-check when designing or implementing — if a decision conflicts with this document, the design tool should pause and ask.

---

## How This Document Relates to Others

| Document | Purpose |
|---|---|
| `sof-page-writeups.md` | Verbatim copy for every page, every section, every state |
| `sof-tos-privacy.md` | Legal Terms of Service and Privacy Policy (review before mainnet) |
| **`sof-design-decisions.md`** (this file) | Locked decisions across all planning sessions — the source of truth for choices made |

The original `BRIEF.md` was the starting point but has been superseded by the decisions captured here. Where the original brief and this document disagree, this document wins.

---

## 1. Strategic Frame

| Decision | Lock |
|---|---|
| Singular product idea | "Where real holders get rewarded." Reputation layer for Solana. Refineries are the activity-generating surface. |
| Hero headline | "Where real holders get rewarded." |
| Hero CTA priority | Browse Refineries (primary, accent fill) before Launch Refinery (secondary, outline) |
| Audience priority | Holders (primary — they generate reputation signals) and Operators (paying audience — generate revenue) |
| Reputation in design | Visible inline on every refinery card, every wallet reference, every claim row. No dedicated home section. |
| Reputation timing | Designed as if fully live |

## 2. Visual Identity

| Decision | Lock |
|---|---|
| Themes | Light + Dark only. Solana Mode killed. |
| Industrial identity | Path A — barrel-gauge as ONLY literal refinery imagery. Identity carried by typography, vocabulary, information design. |
| Decorative ornament | BANNED. No pipes, valves, gauges as background, SVG patterns, 3D illustrations, refinery-themed wallpaper. |
| Typography | Space Grotesk (display) + Inter (body) + JetBrains Mono (numbers, addresses, code) |
| Color | Oil amber accent on neutral base. Heavy use of borders/rules instead of fills. |
| Reference quality bar | Hyperliquid, Vercel, Linear, OpenSea, Phantom, Jupiter, Drift, Notion, Helius Dashboard |
| Anti-AI rules | Per BRIEF.md §3 (gradient blobs, glassmorphism, identical 4-card rows, emoji, 3D illustrations, oversized whitespace, "Unleash X" copy, fake stats — all banned) |

### Color Tokens

**Light theme:**
- `--bg-base: #f5f5f7`
- `--bg-surface: #ffffff`
- `--bg-elevated: #f0f0f2`
- `--text-primary: #1a1a1a`
- `--text-secondary: #555555`
- `--text-muted: #888888`
- `--border-base: #c8c8ca`
- `--accent: #e09515` (oil amber)
- `--green: #22c55e` (success/verified)
- `--red: #c0392b` (danger/risk)

**Dark theme:**
- `--bg-base: #080808`
- `--bg-surface: #0f0f0f`
- `--bg-elevated: #141414`
- `--text-primary: #f0f0f0`
- `--text-secondary: #aaaaaa`
- `--text-muted: #666666`
- `--border-base: #2a2a2a`
- `--accent: #f5a623` (oil amber, brighter for dark BG)
- `--green: #22c55e`
- `--red: #E84125`

## 3. Layout & Navigation

| Decision | Lock |
|---|---|
| Side navbar | Linear/Notion/Vercel pattern — collapsed-to-icons by default (64px), expanded-on-hover (256px). 150ms ease-out. |
| Mobile nav | Bottom-bar tab switcher (4 primary items: Home, Refineries, Launch, Leaderboard) + hamburger drawer |
| Top bar | Minimal, width-constrained to 1280px. Only mobile-only hamburger + wrong-network banner when triggered. |
| Network indicator | Small "Devnet" pill in sidebar footer (below theme switcher, above wallet chip) |
| Wrong-network warning | Persistent red banner across top of every page until user switches |
| Wallet chip placement | Bottom of sidebar (connected state shows truncated address + avatar; disconnected shows "Connect Wallet" button) |
| Theme switcher placement | Bottom of sidebar (above network pill), 2 icons (☀ Light, ☾ Dark) |

## 4. Animation & Motion

| Decision | Lock |
|---|---|
| Animation tier | Minimal — DeFi-correct restraint |
| Page transitions | Instant (no fade) |
| Hover states | Interactive elements only, 150ms ease-out |
| Real-time data updates | Animate (number tweens 600ms, pool drain chart updates) |
| Modal enter/exit | 200ms fade + slight slide |
| Status dot pulse | Live indicators only (1.5s loop) |
| Skeleton shimmer | Loading states (1500ms loop, low contrast) |
| Logo loader / first-visit | Logo loader on home only (first cold session); instant on all product surfaces |
| Logo treatment | Static. No pulse. No fill. The logo doesn't perform. |
| Reduced motion | All animations respect `prefers-reduced-motion: reduce` with static fallbacks |

## 5. Wallet Connection Flow

| Decision | Lock |
|---|---|
| Connect modal layout | Wallet grid (Phantom, Solflare, Backpack as 3 large cards) + "More wallets" expandable + small "New to Solana? Get Phantom →" link |
| Connect → ToS → Sign sequence | Single unified modal: wallet pick → ToS scrollable text + checkbox → "Sign & connect" button (combined with signMessage verify in one click) |
| ToS re-prompt frequency | Every reconnect (per existing brief — friction trade-off acknowledged) |
| ToS acceptance recording | `tos_version_hash` per wallet, stored in localStorage + Supabase `tos_acceptances` table |
| Mobile wallet handling | Auto-detect environment: in-wallet browser → injected connectors, mobile web → deep-link buttons |
| Wallet verification (signMessage) | Combined with ToS in single modal, fires when user clicks "Sign & connect" after checkbox |

## 6. Component Foundation

| Decision | Lock |
|---|---|
| Component library | TanStack Table + shadcn/ui primitives (best for data-heavy DeFi product) |
| Forms | React Hook Form + Zod validation |
| Charts | Recharts (or Visx as alternative) — restrained usage |
| Smooth scroll | None — instant navigation |
| Tooltips | Radix UI primitive |
| Modals / dialogs | shadcn/ui Dialog + Drawer (mobile bottom-sheet) |
| Notifications | Custom four-tier toast system (see below) |

## 7. Data Visualization

| Decision | Lock |
|---|---|
| Charts strategy | Restrained — sparklines + 1 chart per data-heavy page only |
| Sparkline placement | Inline next to numbers (Reputation history, daily activity, trends) |
| Full chart placement | One per page that needs it: pool drain on single refinery, claims over time on dashboard, Reputation 90-day on profile |
| Heavy charting | BANNED on home/marketing pages; restricted to product surfaces |
| Chart styling | `--text-muted` axis lines, `--accent` data line, no fill gradients |

## 8. Notifications & Toasts

Four-tier severity system:

| Tier | Use case | Visual treatment |
|---|---|---|
| Tier 1 — Trivial | Theme switched, address copied, navigation completed | 4s auto-dismiss, small toast bottom-right desktop, top mobile |
| Tier 2 — Action confirmation | Refinery launched, tokens claimed | 8s auto-dismiss, contains tx hash + Solscan link |
| Tier 3 — Errors / failures | Tx rejected, network error | 10s persistent, red border, retry button |
| Tier 4 — Stakes alerts | Pool at 5% remaining, refinery paused by operator | In-app notification panel (not transient) |
| Tier 5 — Live activity | "Wallet just claimed from your refinery" | Inline activity feed, never as transient toast |

## 9. Mobile vs Desktop

| Decision | Lock |
|---|---|
| Priority | Equal parity — both audiences matter |
| Frame sizes for design | 1280px (desktop) AND 375px (mobile small) |
| In-between breakpoints | 768px (tablet), 1024px (laptop) — intentional choices, not "we'll figure it out" |
| Mobile sidebar | Bottom-bar tab switcher (4 items) + hamburger drawer |
| Mobile tables | Collapse to stacked card rows |
| Mobile forms | Single-column stepped flow |

## 10. Tone & Copy

| Decision | Lock |
|---|---|
| Voice | Calm, technically precise, operator-grade. Never hype. Never marketing-speak. |
| Pronouns | "We" for Sol Oil Factory, "you" for the reader |
| Empty/error/loading state tone | Operator/technical — concise and factual |
| Banned words | Unleash, reimagine, revolutionary, next-generation, game-changing, seamless, leverage, unlock, supercharge, harness, empower, robust, cutting-edge, world-class, ecosystem (for self-reference), passive income, yield (when not technically accurate) |
| Vocabulary lock | Refinery, Operator, Holder, Pool, Snapshot, Drain, Top up, Closed refinery, Reputation, Verified deployer, Verified CTO |

## 11. Mock Data

| Decision | Lock |
|---|---|
| Strategy | Mix — brief's anchor data + synthetic fill |
| Anchor data source | BRIEF.md §10 (12 tokens, 6 wallets, claim feed, leaderboard) |
| Synthetic fill | Generated for surfaces needing volume (full leaderboard 100 wallets, activity feed 50+ events) |
| Consistency | Same wallets/tokens/numbers everywhere they appear |
| Master reference | sof-page-writeups.md "Mock Data Master Reference" section |

## 12. SEO & Social

| Decision | Lock |
|---|---|
| Per-page meta | Every page has `<title>`, `<description>`, OG image, Twitter card |
| Static OG images | Marketing pages (home, /refineries, /trust, /developers, etc.) |
| Dynamic OG images | Refinery pages + wallet profiles only |
| Dynamic OG implementation | Next.js 15 `app/[route]/opengraph-image.tsx` (edge runtime) |
| Sitemap | Auto-generated from routes |
| Robots.txt | Standard — index marketing pages, no-index API endpoints |

## 13. Accessibility

| Decision | Lock |
|---|---|
| Contrast | WCAG AA minimum throughout both themes |
| Focus states | 2px ring in `--accent`, 2px offset, visible on every interactive element |
| Icon aria-labels | All non-decorative icons labeled |
| Form labels | Visible labels (not just placeholders) on every input |
| Toasts | aria-live="polite" (errors via aria-live="assertive") |
| Modals | Focus trap, return focus on close |
| Keyboard nav | Tab through interactive elements in logical order; Esc closes modals/dropdowns |
| Color signaling | Never the only signal — risk badges and status chips include text + icon, not just color |

## 14. Power User Features

| Decision | Lock |
|---|---|
| Cmd+K command palette | Yes — full implementation with search, navigation, actions, recents |
| Keyboard shortcuts | Standard set (Cmd+K open palette, Esc close modal, etc.) |
| Power-operator features | Launch Similar, My Templates, Bulk Operations, Close Flow |

## 15. Page Set (20 Routes)

| Route | Purpose | Auth |
|---|---|---|
| `/` | Home — hero, reputation explainer, featured refineries, refinery types, top operators, final CTA | Public |
| `/refineries` | Directory — full table of all refineries with filters | Public |
| `/refinery/launch` | 4-step launch flow (Token → Identity → Distribution → Confirm) | Connected |
| `/refinery/[mint]` | Token page — multiple refineries for a mint + Trust Report | Public |
| `/refinery/[mint]?r=[id]` | Single refinery — claim surface, stats, activity feed, pool drain chart | Public (claim requires connect) |
| `/refinery/solana` | Solana Refinery — flagship, $CRUDE for activity | Public |
| `/refinery/launchpad/pump` | Pump.fun launchpad refinery | Public |
| `/refinery/launchpad/bonk` | Bonk.fun launchpad refinery | Public |
| `/refinery/launchpad/bags` | Bags.fm launchpad refinery | Public |
| `/refinery/launchpad/candle` | Candle launchpad refinery | Public |
| `/dashboard` | 3 tabs (My Refineries, Claims received, Reputation) + power-operator features | Connected |
| `/wallet/[addr]` | Public wallet profile — activity, refineries, reputation breakdown | Public |
| `/leaderboard` | Cross-refinery — 4 tabs ($CRUDE, Top operators, Top claimers, Top reputation) | Public |
| `/reputation` | Reputation methodology — full transparency on scoring | Public |
| `/trust` | System status + audits + lifetime metrics + program addresses + incident log | Public |
| `/developers` | Developer/API landing — endpoints, embed widget, pricing, status | Public |
| `/help` | Help Center index — categories + search | Public |
| `/help/[slug]` | Help Center article — markdown rendered | Public |
| `/legal/terms` | Terms of Service | Public |
| `/legal/privacy` | Privacy Policy | Public |
| `/404` | Not found | Public |

**Pages explicitly NOT included (and why):**
- `/about` — Skipped. Trust signals consolidated into `/trust` instead.
- `/settings` — Skipped. Theme + wallet management in sidebar; nothing else to put there.
- Per-token barrel theming — Out of scope for v1.

## 16. Strategic Surface Additions Beyond BRIEF.md

These were added during planning sessions and are NOT in the original brief:

| Addition | Rationale |
|---|---|
| `/trust` page | Real-time infrastructure surface — signals "infrastructure provider" not "DeFi product" |
| `/reputation` methodology page | Public scoring transparency — no other reputation system has this |
| `/developers` API surface | Reputation API is the long-term moat per multi-tenant-pivot.md |
| Token Trust Report (inline on /refinery/[mint]) | Keeps users on-site at the moment of conversion (vs. sending to RugCheck) |
| Power-operator features (Launch Similar, templates, bulk ops, close flow) | Repeat operators are highest-value users |
| Cmd+K command palette | "Linear/Vercel quality" demands it |
| Help Center | Complex product (custody, snapshot strategies, sybil rules) deserves docs |
| Verification badge popovers | Trust info on demand without needing a dedicated verification flow page |

## 17. Strategic Decisions Made and Recorded

These are the major decisions made during planning, with their rationale:

### Decision: Solana Mode killed
- Original brief: 3 themes (Light, Dark, Solana Mode with #14F195 / #9945FF)
- Decision: 2 themes only
- Rationale: Solana brand colors are inherently retail/consumer-facing. Industrial-refinery identity would fight with them. Cleaner identity without it.

### Decision: Industrial ornament banned
- Original direction: Refinery aesthetic with pipes, valves, gauges
- Decision: Path A — barrel-gauge as ONLY refinery imagery, identity carried by typography/vocabulary/info-design
- Rationale: Decorative ornament conflicts with own brief's anti-AI rules. The reference set (Hyperliquid, Vercel, Linear) is restrained. Refinery decoration would push toward "consumer crypto theme park" not "infrastructure layer."

### Decision: Reputation-first frame (Frame C)
- Original brief frame: "Permissionless Solana token distribution"
- Decision: "Where real holders get rewarded." — reputation layer expressed as distribution platform
- Rationale: Per multi-tenant-pivot.md, cross-refinery reputation is the long-term moat. Frame should communicate the moat, not just the feature.

### Decision: About page skipped
- Original implication: Standard DeFi About page
- Decision: Skipped, trust signals consolidated into /trust
- Rationale: Small team. About page would either oversell the team (bad signal) or be sparse (also bad signal). Trust page does the same job better.

### Decision: Single domain, no marketing/app split
- Considered: Marketing at root, app at subdomain
- Decision: Single domain, single app
- Rationale: Vercel doesn't split. Linear doesn't split. Adds complexity for marginal benefit.

### Decision: Skip dynamic OG, then reversed to refineries + profiles only
- Original answer: Skip dynamic OG entirely
- Reversed: Dynamic OG for refineries + wallet profiles only
- Rationale: Skipping while shipping Cmd+K was inconsistent quality. Refineries and profiles are the most-shared surfaces — those need it most.

### Decision: ToS re-prompt on every reconnect (with friction trade-off acknowledged)
- Industry standard: Re-prompt only on version change
- Decision: Re-prompt on every reconnect (more conservative)
- Rationale: User chose the more legally-conservative option. Mitigation: keep the modal fast and dignified to minimize habituation.

### Decision: All pages full quality, no tier system
- Original proposal: Solana Refinery + Launchpads as "lower priority"
- Decision: All 20 pages designed at full quality
- Rationale: Solana Refinery and Launchpads are core product surfaces, not afterthoughts.

## 18. Pending Decisions (To Be Locked Before Build)

These items were flagged during planning but deferred to implementation phase:

| Item | Status |
|---|---|
| Brand assets (logo, barrel SVG, partner icons) | User will upload before design tool runs |
| Barrel SVG conversion | Needed before production build (PNG works for design phase) |
| Final ToS arbitration provider | Lawyer review will lock JAMS / AAA / LCIA |
| Final governing law | Lawyer review will lock Cayman / Delaware / other |
| Specific URL: `/trust` vs `/status` | Lock during design phase |
| Specific email domains: `support@` vs `team@` etc. | Lock at incorporation |
| Final operating entity name | After Cayman/BVI incorporation |

## 19. Build Order (Recommended)

When building the actual production app, this order minimizes refactoring:

1. **Foundations** — color tokens, type scale, spacing, base components (buttons, inputs, badges, status pills)
2. **Global UI** — sidebar, top bar, footer, modals (connect, ToS), theme switcher
3. **Mock data layer** — `lib/mockData.ts` exporting all brief §10 anchor data + synthetic fill
4. **Charts & sparklines** — Recharts wrapper components
5. **Cmd+K command palette** — global shortcut with search/nav/actions/recents
6. **Toast system** — four-tier severity classes
7. **Pages in order of dependency:**
   a. Home (depends on all other pages existing as routes)
   b. Refineries directory
   c. Single refinery + token page
   d. Launch flow
   e. Solana Refinery + Launchpads
   f. Wallet profile + Dashboard
   g. Leaderboard
   h. Reputation methodology + Trust + Developers
   i. Help Center index + article template
   j. Legal pages (long-form text)
   k. 404
8. **OG image generation** — `opengraph-image.tsx` for refineries + wallet profiles
9. **SEO metadata** — per-page `metadata` exports
10. **Accessibility audit** — pre-launch pass

---

## 20. Document Status

**Final lock count:** 100+ decisions across 4 batches of planning
**Last updated:** 2026-05-09
**Status:** Complete v1 — ready for design tool consumption
**Next step:** Frontend design prompt (HTML mockups in Claude artifacts), then production build (Claude Code with full spec)

Where this document, `sof-page-writeups.md`, and `sof-tos-privacy.md` are consistent, build to spec. Where they conflict, pause and ask before proceeding.

---

## Backend-Surfaced State Additions (v1.1)

Cross-checked against `sol-oilfactory-program` commit `12d0543`. Eight additional surfaces added to design scope. None reverse prior decisions.

### State System Updates

**Single Refinery page now has 6 claim-block states (was 4):**
- A: Not connected
- B: Eligible
- C: Already claimed
- D: Not eligible
- E: Eligible but proof unavailable (NEW — indexer-down fallback)
- F: Account frozen (NEW — token freeze authority blocked transfer)

**Refinery-level states (3, orthogonal to claim block):**
- Active
- Operator-paused
- Pending snapshot (NEW — gap between launch and first snapshot)

**Platform-level banner states (3):**
- Platform paused (full-width red)
- Service degraded (full-width amber, NEW)
- Wrong network (full-width red, persistent)

### Notification Tier System Update

Added Tier 6 — rate limited:

| Tier | Use case | Auto-dismiss | Visual |
|---|---|---|---|
| 1 — Trivial | Theme switched, copy actions | 4s | Small toast |
| 2 — Action confirmation | Tx success | 8s | Toast + tx link |
| 3 — Errors | Tx rejected, network error | 10s persistent | Red border |
| 4 — Stakes alerts | Pool low, refinery paused | In-app panel | Persistent |
| 5 — Live activity | Real-time activity | Inline feed | Activity row |
| 6 — Rate limited (NEW) | API throttling, retry pending | Auto-resolve | Amber border + countdown |

### Implementation Notes for Design Phase

**Cluster-aware URL construction (Gap 7):**
- All Solscan links must include `?cluster=devnet` for devnet
- Birdeye links must include `?chain=solana-devnet` for devnet
- Trust page program addresses auto-update from `NEXT_PUBLIC_SOLANA_CLUSTER`
- Treat as implementation note, not a visible design decision

**Token-2022 transfer fee disclosure (Gap 5):**
- Show pre-fee + post-fee amounts on claim
- Add `(transfer fee: X%)` annotation in directory rows for affected tokens
- Affects every screen showing claimable amounts

**Pre-claim ATA creation (Gap 3):**
- Adds ~0.002 SOL to claim cost
- Show full cost breakdown when first-time claim
- Note: rent is recoverable when account closed (mention in helper text)

**Frozen ATA error (Gap 6):**
- Distinct from generic "claim failed"
- Tier 3 error severity
- Help center article required: "What is freeze authority?"

**Epoch advancement (Gap 8):**
- Banner shown once per epoch (dismissible)
- Activity feed entries for epoch advances
- Wallet profile shows epoch events from interacted refineries

**Snapshot pending (Gap 4):**
- Common state right after refinery launch
- ~1-5 minute window before first snapshot computed
- Auto-refresh every 30s
- Shows in operator dashboard as `[Pending snapshot]` chip

**Service degraded (Gap 1):**
- Persistent banner when indexer >5min behind or RPC p99 >2s
- Detail panel showing component status
- Does not block claims — just informs about staleness

**Indexer-down eligibility (Gap 2):**
- New State E on single refinery
- "You appear eligible" with refresh-on-interval
- Maintains user awareness of eligibility even when proof can't be computed

### Brand Asset Decisions Update

**Launchpad icons (locked: as-is for design, fix for production):**
- Pump.fun pill icon → use as-is, replace with custom in production
- Bonk.fun mascot → use as-is, replace with custom in production
- Bags moneybag → use as-is, replace with custom in production
- Candle stick → use as-is, replace with custom in production
- Believe → REMOVED (uploaded by mistake)

**Final launchpad count: 4** (Pump, Bonk, Bags, Candle)

**Main logo (locked: pixelated PNG for design, SVG before production):**
- Design phase uses provided PNG
- Designer/Claude design tool will note pixelation at large scale — this is expected
- SVG conversion is a v1 production gate, not a design phase task

**Wallet icons (locked: official brands as-is):**
- Phantom (purple ghost) — official brand
- Solflare (yellow S) — official brand
- Backpack (red bag) — official brand
- Industry standard, no change needed

### Production Checklist Additions

These items added to the v1 launch checklist:

1. SVG conversion of main Sol Oil Factory logo
2. Custom launchpad refinery icons (replace 4 launchpad-branded assets)
3. Help Center articles for:
   - "What is freeze authority?"
   - "What happens during epoch advancement?"
   - "Why might my account be frozen?"
4. Service status component on /trust page (separate from existing audits/metrics block)
5. Cluster-aware URL utility tested across all external link contexts
6. Snapshot-pending state copy reviewed by legal (sets expectations on launch timing)

