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
  <a href="#tech-stack">Tech Stack</a> &middot;
  <a href="#local-development">Run Locally</a>
</p>

---

## How It Works

| Step | What Happens |
|------|-------------|
| **Connect** | Link your Solana wallet via Phantom SDK |
| **Verify** | Sign a message to prove ownership (free, no transaction) |
| **Extract** | Scan your on-chain transactions and convert them into oil |
| **Refine** | Refine oil into **$CRUDE** and unlock your **Prestige Title** |
| **Compete** | Appear on the global leaderboard ranked by $CRUDE |
| **Share** | Post your refinery stats to X |

### Oil Math

```
1 transaction   =  1 oil unit
50 oil units    =  1 barrel
10 oil units    =  1 $CRUDE
```

> A wallet with 2,140 transactions = 42 barrels, 214 $CRUDE, title: **Pipeline Operator**

---

## Features

- **Barrel Visualization** — Up to 10 animated SVG barrels filling in real time
- **Prestige Titles** — 25 ranks from *Dry Well* to *Supreme PetroLord*
- **Global Leaderboard** — Top 100 wallets ranked by $CRUDE (powered by Supabase)
- **Wallet Verification** — Message signing proves ownership before refining
- **Re-Refine** — New transactions since last refine? Come back and level up
- **Whale Detection** — Graceful handling for wallets with 100k+ transactions
- **Mobile Ready** — Responsive design with in-app wallet browser support
- **Search Any Wallet** — Look up any Solana address without connecting

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS 4 + custom CSS variables |
| Wallet | Phantom Connect SDK (`@phantom/react-sdk`) |
| Blockchain | Helius RPC API |
| Database | Supabase (PostgreSQL) |
| Deployment | Vercel |

---

## Project Structure

```
app/
  api/
    wallet/route.ts        GET  — fetch tx count + compute oil data
    refine/route.ts        POST — persist refine + upsert leaderboard
    leaderboard/route.ts   GET  — top 100 wallets by $CRUDE
  leaderboard/page.tsx     Server component — leaderboard page
  page.tsx                 Main app — connect, verify, extract, refine
  providers.tsx            PhantomProvider config
  layout.tsx               Root layout + footer

components/
  Barrel.tsx               Animated SVG barrel
  BarrelGrid.tsx           Responsive 5x2 barrel grid
  OilStats.tsx             Stats panel, refine logic, share
  WalletSearch.tsx         Address search input
  WalletConnectModal.tsx   Multi-wallet connect with install/deeplink fallback
  LeaderboardTable.tsx     Leaderboard table with rank styling
  Footer.tsx               Footer with socials

lib/
  helius.ts                Helius API — paginated tx counting with time budget
  oilCalculator.ts         Oil units, barrels, $CRUDE, prestige titles
  supabase.ts              Supabase client
```

---

## Local Development

**Prerequisites:** Node.js 18+, npm, [Helius API key](https://helius.dev), [Supabase project](https://supabase.com)

```bash
git clone https://github.com/vip-ultr/solana-oil-factory.git
cd solana-oil-factory
npm install
```

Create `.env.local`:

```env
HELIUS_API_KEY=your-helius-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment

1. Push to GitHub
2. Import into [Vercel](https://vercel.com)
3. Add all three env vars in Vercel dashboard
4. Deploy

---

## Powered By

[Helius](https://helius.dev) &middot; [Phantom](https://phantom.app) &middot; [Supabase](https://supabase.com) &middot; [Vercel](https://vercel.com)

---

MIT License
