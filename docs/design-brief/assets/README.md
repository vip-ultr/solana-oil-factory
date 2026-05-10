# Sol Oil Factory — Design Brief Assets

These are the assets bundled with `BRIEF.md`. Every file here is owned by the Sol Oil Factory project or sourced from a vendor whose brand is already integrated into the live product (wallets, partner refineries).

## Folder layout

```
assets/
├── brand/        Sol Oil Factory's own brand artifacts
│   ├── logo.png         The hex-stamp logo. Use as favicon, splash, navbar mark. 512×512.
│   ├── barrel.png       The hero barrel illustration. 485×780. Used for fill animation.
│   └── barrel.svg       Vector barrel. Same artwork, scalable.
│
├── wallets/      Wallet provider logos (for the connect modal)
│   ├── phantom.png
│   ├── solflare.png
│   └── backpack.png
│
├── refineries/   Partner / sibling refinery brand marks
│   ├── bags.png
│   ├── bonkfun.png
│   ├── pumpfun.png
│   ├── candle.png
│   ├── believe.png
│   └── helius.png       Infrastructure provider — used in "powered by" footer
│
└── README.md     This file.
```

## What's NOT in here, and why

- **Visual-reference screenshots** (OpenSea, Vercel, Linear, Phantom, Jupiter, Drift). Bundling third-party UI screenshots is a copyright concern. The brief gives URLs — fetch them via WebFetch when you need to study a pattern.
- **Mock token logos** (BONK, JUP, WIF, etc.). Use the public Jupiter / Solana token-list CDN URLs listed in §10.1 of the brief. If you mock a refinery that doesn't have a real token, generate a placeholder shape — never invent a token logo that could be confused with a real one.
- **Solana brand kit** (the official Solana wordmark / logo). Pull on demand from `https://solana.com/branding`.

## Asset usage rules

1. The **logo** is sacred. Don't recolor it. Don't drop-shadow it. Don't put it inside a circle. It's a hex stamp — let it be a hex stamp. It can sit on light or dark backgrounds; if contrast fails, put it inside a 1px border container instead of altering the logo.
2. The **barrel** is the hero motif. It carries the brand. Use it on the home hero and the per-refinery page. Don't repeat it on every screen — overuse drains the metaphor.
3. **Wallet icons** appear together in a single connect modal — keep their treatment uniform (same size, same corner radius, same padding).
4. **Partner refinery icons** are existing brand marks. Render them at their original colors, don't tint them to match a theme.
