#  Solana Oil Factory

A Web3 dashboard that transforms your Solana wallet's on-chain activity into a visual oil production system. Every transaction you've made becomes oil — filling industrial barrels, earning you $CRUDE tokens, and unlocking a prestige title you can flex on X.

---

## What It Does

Solana Oil Factory pulls your wallet's transaction history from the Helius API and converts it into an industrial oil production metaphor:

- **Transactions → Oil Units** — every transaction you've made equals one oil unit
- **Oil Units → Barrels** — every 50 oil units fills one barrel
- **Barrels → $CRUDE** — refine your oil to mint $CRUDE tokens (10 oil units = 1 $CRUDE)
- **$CRUDE → Prestige Title** — earn a title based on how much $CRUDE you've refined
- **Share on X** — post your refinery stats directly to X (Twitter)

---

## How It Works

### 1. Connect or Search
Users can either:
- **Connect their Solana wallet** via the Phantom Connect SDK (supports Phantom, Solflare, Backpack)
- **Search any wallet address** manually using the search bar

### 2. Helius Fetches Blockchain Data
The app sends the wallet address to the Helius API, which returns the wallet's full transaction history. No wallet signature is required — it's read-only.

### 3. Oil Calculation
```
Transactions        →  Oil Units       (1 tx = 1 oil unit)
Oil Units ÷ 50      →  Full Barrels    (floor division)
Oil Units % 50      →  Remaining Oil   (partial barrel fill)
Oil Units ÷ 10      →  $CRUDE          (floor division)
```

### 4. Barrel Visualization
Up to **10 barrels** are displayed in a responsive 5×2 grid. Each barrel fills from the bottom based on its oil percentage. Barrels beyond 10 are shown as a `+N more barrels` overflow indicator.

### 5. Refine Oil
Clicking **Refine Oil** converts oil units into $CRUDE and reveals the user's prestige title.

### 6. Share on X
After refining, users can share their stats via a pre-filled X (Twitter) post.

---

## Prestige Titles

| $CRUDE Range | Title            |
|-------------|------------------|
| 0 – 5       | Dry Well         |
| 5 – 50      | Backyard Driller |
| 50 – 200    | Oil Producer     |
| 200 – 1,000 | Refinery Boss    |
| 1,000+      | Oil Tycoon       |

---

## Tech Stack

| Layer            | Technology                  |
|------------------|-----------------------------|
| Framework        | Next.js 15 (App Router, TypeScript) |
| Styling          | Tailwind CSS + custom CSS   |
| Wallet Connection| Phantom Connect SDK (`@phantom/react-sdk`) |
| Blockchain Data  | Helius API                  |
| HTTP Client      | Axios                       |
| Deployment       | Vercel                      |

---

## Project Structure

```
/app
  /api/wallet/route.ts     — API route: fetches Helius data + runs oil calculation
  layout.tsx               — Root layout with Phantom wallet provider + Footer
  page.tsx                 — Main page: header, search, barrel grid, stats
  providers.tsx            — PhantomProvider config

/components
  Barrel.tsx               — Single industrial barrel SVG with animated oil fill
  BarrelGrid.tsx           — Responsive grid of up to 10 barrels
  WalletSearch.tsx         — Wallet address search input
  OilStats.tsx             — Stats dashboard, refine action, share on X
  Footer.tsx               — Footer with copyright, socials, and Helius branding

/lib
  helius.ts                — Helius API integration
  oilCalculator.ts         — All business logic (oil units, barrels, $CRUDE, titles)

/public
  helius-logo.png          — Helius logo (drop your PNG here)

/styles
  globals.css              — Full design system: dark theme, layout, components
```

---

## Local Development

### Prerequisites
- Node.js 18+
- npm or pnpm
- A Helius API key

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/vip-ultr/solana-oil-factory.git
cd solana-oil-factory

# 2. Install dependencies
npm install

# 3. Create environment file
# Add your Helius API key to .env.local:
# HELIUS_API_KEY=your-key-here

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable         | Description                        |
|------------------|------------------------------------|
| `HELIUS_API_KEY` | Your Helius API key from helius.dev |

---

## Deployment (Vercel)

1. Push the repository to GitHub
2. Import the project into [Vercel](https://vercel.com)
3. Add the environment variable `HELIUS_API_KEY` in the Vercel dashboard
4. Deploy — Vercel will build and serve automatically

---

## Key Business Logic

### Oil Calculation (`lib/oilCalculator.ts`)
```ts
oilUnits  = transactionCount
barrels   = Math.floor(oilUnits / 50)
remainder = oilUnits % 50
crude     = Math.floor(oilUnits / 10)

// Fill percentages array (max 10 barrels shown)
// Full barrels → 100%
// Last partial barrel → Math.round((remainder / 50) * 100)%
```

### Example
```
Wallet transactions: 214

Oil Units:  214
Barrels:    4 full + 1 partial
Fill:       [100%, 100%, 100%, 100%, 28%]
$CRUDE:     21
Title:      Backyard Driller
```

---

## API Route

```
GET /api/wallet?address=<solana-wallet-address>
```

**Response:**
```json
{
  "address": "7Ab3...9XQp",
  "oilUnits": 214,
  "barrels": 4,
  "fillPercentages": [100, 100, 100, 100, 28],
  "crude": 21,
  "title": "Backyard Driller"
}
```

---

## Powered by

- [Helius](https://helius.dev) — Solana's leading RPC and API infrastructure
- [Phantom](https://phantom.app) — Multi-chain Solana wallet

---

## License

MIT
