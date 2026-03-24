<p align="center">
  <img src="public/logo.png" alt="Solana Oil Factory" width="80" />
</p>

<h1 align="center">Solana Oil Factory</h1>

<p align="center">
  Turn your Solana wallet activity into oil. Refine it. Climb the leaderboard.
</p>

<p align="center">
  <a href="https://solanaoilfactory.xyz">Live App</a> &middot;
  <a href="#how-it-works">How It Works</a> &middot;
  <a href="#refineries">Refineries</a> &middot;
  <a href="#tech-stack">Tech Stack</a> &middot;
  <a href="#local-development">Run Locally</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/Solana-Mainnet-9945FF?style=flat-square&logo=solana" />
</p>

---

## How It Works

| Step | What Happens |
|------|-------------|
| **Connect** | Link your Solana wallet |
| **Verify** | Sign a message to prove ownership (free, no transaction) |
| **Extract** | Scan your on-chain transactions and convert them into oil units |
| **Refine** | Start a timed refine session to convert oil into **$CRUDE** |
| **Compete** | Appear on the global leaderboard ranked by total $CRUDE |
| **Share** | Post your prestige title and refinery stats to X |

### Oil Math

```
1 transaction   =  1 oil unit
50 oil units    =  1 barrel
10 oil units    =  1 $CRUDE  (cap: 15,000 per session)
```

> A wallet with 2,140 transactions = 42 barrels + 214 $CRUDE = title: **Pipeline Operator**

---

## Refineries

The app is built around a **multi-source refinery system** — each integration produces $CRUDE from a different type of on-chain activity.

| Refinery | Status | Source |
|---|---|---|
| Solana Refinery | ✅ Active | All Solana wallet transactions |
| Bags Refinery | ✅ Active | Bags platform fee earnings |
| Pump.fun Refinery | 🔜 Soon | Pump.fun trading activity |
| Bonk.fun Refinery | 🔜 Soon | Bonk.fun activity |
| Candle Refinery | 🔜 Soon | Candle protocol integration |
| Believe Refinery | 🔜 Soon | Believe protocol activity |

### Timed Refinement

Refining isn't instant. A session locks your $CRUDE for a duration proportional to your transaction count — up to 6 hours. You can pay **0.002 SOL** to skip the timer instantly.

### Bags Refinery

Bags claimable fee positions are converted at `1 SOL = 1,000 $CRUDE`. This output is tracked separately and combined with your Solana Refinery $CRUDE to form your total.

---

## Prestige Titles

25 ranks based on your total $CRUDE balance.

| $CRUDE | Title |
|---|---|
| 0 | Dry Well |
| 1 – 9 | Mud Digger |
| 10 – 24 | Roughneck |
| 25 – 49 | Backyard Driller |
| 50 – 99 | Pump Jockey |
| 100 – 249 | Pipeline Walker |
| 250 – 499 | Tool Pusher |
| 500 – 999 | Lease Operator |
| 1,000 – 2,499 | District Foreman |
| 2,500 – 4,999 | Production Superintendent |
| 5,000 – 9,999 | Oil Magnate |
| 10,000 – 24,999 | Petroleum Baron |
| 25,000 – 49,999 | Industry Tycoon |
| 50,000+ | Refinery Lord → Supreme PetroLord |

---

## Features

### Barrel Visualization
- Up to **15 animated barrels** on desktop, **10 on mobile**
- Each barrel shows a live **oil level gauge**
- Barrel fills are **deterministic per wallet** using a seeded RNG — consistent on every reload
- Barrels beyond the display cap show a **stacked overflow indicator**
- The barrel section is **collapsible** with a smooth CSS grid-row animation

### Production Stats
- Per-refinery $CRUDE breakdown — see exactly how much each source contributes
- Total $CRUDE highlighted with accent styling once revealed
- Prestige Title badge displayed after claiming

### Leaderboard
- Global top wallets ranked by $CRUDE
- Shows rank, wallet, $CRUDE, oil units, barrels, and prestige title
- Prestige badge stacks below address on mobile — no horizontal scroll
- Wallet address tooltip links to Solscan

### Wallet Search & Public Profiles
- Look up any Solana address without connecting a wallet
- Full profile page at `/wallet/[address]` — production stats, rank, and share button

### UI & Theming
- **Light and dark mode** with full CSS variable theming
- **Responsive layout** — desktop, tablet, and mobile breakpoints throughout
- **Mobile bottom navigation bar** for Refinery, Leaderboard, and Profile
- **Desktop navbar** with profile link

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Language | TypeScript 5.9 |
| Styling | Tailwind CSS 4 + custom CSS variables |
| Blockchain | Helius RPC API (`@solana/web3.js`) |
| Wallet | `@solana/react-hooks` |
| Database | Supabase (PostgreSQL) |
| External APIs | Helius (transactions), Bags API v2 (fee positions) |
| Deployment | Vercel |

---

## Project Structure

```
app/
  api/
    wallet/route.ts           GET  — fetch tx count + compute oil data
    wallet/stored/route.ts    GET  — load cached data from Supabase
    refine/route.ts           POST — create timed refine session
    refine/claim/route.ts     POST — claim completed refine, update leaderboard
    refine-status/route.ts    GET  — check active refine timer
    leaderboard/route.ts      GET  — top wallets by $CRUDE
    verify-speedup/route.ts   POST — verify 0.002 SOL speed-up payment
    bags/feed/route.ts        GET  — recent Bags token launches
  leaderboard/page.tsx        Server component (ISR, 60s revalidation)
  profile/page.tsx            Redirects to connected wallet profile
  refinery/page.tsx           Main refinery dashboard
  wallet/[address]/           Public wallet profile (SSR)
  page.tsx                    Home — hero, refineries grid, leaderboard preview
  layout.tsx                  Root layout + nav + footer

components/
  BarrelHeroSection.tsx       Collapsible barrel visualization section
  BagsPanel.tsx               Bags refinery data panel
  OilStats.tsx                Refine/claim/timer action panel
  WalletSearch.tsx            Address search input
  WalletConnectModal.tsx      Multi-wallet connect modal

lib/
  helius.ts                   Paginated tx counting with time budget + partial flag
  oilCalculator.ts            Oil units, barrels, $CRUDE, prestige titles, seeded fills
  bags.ts                     Bags API integration (fee positions → bonus $CRUDE)
  supabase.ts                 Supabase client
```

---

## Local Development

**Prerequisites:** Node.js 20+, [Helius API key](https://helius.dev), [Supabase project](https://supabase.com), [Bags API key](https://bags.fm)

```bash
git clone https://github.com/vip-ultr/solana-oil-factory.git
cd solana-oil-factory
npm install
```

Create `.env.local`:

```env
HELIUS_API_KEY=your-helius-key

NEXT_PUBLIC_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=your-helius-key

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

BAGS_API_KEY=your-bags-api-key
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment

1. Push to GitHub
2. Import into [Vercel](https://vercel.com)
3. Add all env vars in the Vercel dashboard
4. Deploy

> **Note:** The `/api/wallet` route requires a 60-second function timeout. This needs Vercel Pro or a custom runtime config.

---

## Powered By

[Helius](https://helius.dev) &middot; [Supabase](https://supabase.com) &middot; [Bags](https://bags.fm) &middot; [Vercel](https://vercel.com)

---

MIT License
