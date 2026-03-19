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

### Barrel Visualization
- Up to **15 animated barrels** on desktop, **10 on mobile**
- Each barrel has a live **oil level gauge** on the right side
- For wallets with more than 9 barrels, the first 5 show seeded random fill levels to demonstrate the gauge — deterministic per wallet so fills never change on reload
- Barrels beyond the display cap show a **last-barrel overlay** with a stacked-lines icon and hidden barrel count
- The entire barrel section is **collapsible** via a smooth CSS grid-row animation with a Hide/Show toggle

### UI & Theming
- **Light and dark mode** — full CSS variable theming via `[data-theme="dark"]`
- **Responsive layout** — desktop, tablet, and mobile breakpoints throughout
- **Mobile bottom navigation bar** with icons for Refinery, Leaderboard, and Profile
- **Desktop navbar** always shows a Profile link — redirects to wallet profile when connected, or to a connect prompt when not

### Leaderboard
- Global top wallets ranked by $CRUDE
- **Prestige badge** stacks below the wallet address on mobile — no horizontal scroll required
- Wallet address hover shows a styled **"View on Solscan"** tooltip
- Subtle box-shadow table styling, compliant with light and dark mode
- Column header shortened to **CRUDE** on mobile for better fit

### Profile
- `/profile` route always accessible — shows a connect prompt if no wallet is linked
- Wallet address in share stats no longer overflows its container
- Production stats, refinery panel, and share section are correctly spaced on all screen sizes

### Bags Refinery Integration
- Detects Bags platform activity and awards **bonus $CRUDE**
- Shows SOL fee output and bonus $CRUDE breakdown in the Bags panel

### Prestige Titles
25 ranks from *Dry Well* to *Supreme PetroLord* based on total $CRUDE balance.

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
    bags/                  Bags platform fee + feed API
  leaderboard/page.tsx     Server component — leaderboard page
  profile/page.tsx         Profile redirect — prompts connect if no wallet
  wallet/[address]/        Wallet profile (server component + client stats)
  page.tsx                 Main app — connect, verify, extract, refine
  providers.tsx            PhantomProvider config
  layout.tsx               Root layout + footer

components/
  Barrel.tsx               Animated barrel with optional gauge (hideGauge prop)
  BarrelGrid.tsx           Responsive barrel grid — 15 desktop / 10 mobile cap
  BarrelHeroSection.tsx    Collapsible barrel section with smooth animation
  BagsPanel.tsx            Bags refinery data panel
  OilStats.tsx             Stats, refine logic, share — CSS grid layout
  Navbar.tsx               Desktop nav + mobile bottom nav bar
  WalletSearch.tsx         Address search input
  WalletConnectModal.tsx   Multi-wallet connect with install/deeplink fallback
  LeaderboardTable.tsx     Leaderboard with prestige badge and wallet tooltip
  Footer.tsx               Footer with socials

lib/
  helius.ts                Helius API — paginated tx counting with time budget
  oilCalculator.ts         Oil units, barrels, $CRUDE, prestige titles, seeded fills
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
