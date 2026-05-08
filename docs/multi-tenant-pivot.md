# Multi-tenant pivot — Permissionless refineries

Strategy doc for evolving sol-oilfactory into a permissionless platform: anyone can launch a **refinery** for any existing Solana token, paying a SOL fee. The launcher deposits the token they want distributed; holders earn it by doing on-chain activity. Last reviewed: 2026-05-07.

## What this is — and what it isn't

Sol Oil Factory is a **refinery platform**, not a launchpad. We do not create tokens. We do not facilitate token creation. The tokens already exist in the world — BONK, JUP, $TOKEN, anything live on Solana — and a refinery is the mechanism for distributing some of that token to engaged holders, branded with the oil / refining / prestige metaphor that is the product.

This distinction matters everywhere:
- **Category**: refinery / distribution / engagement layer, not launchpad. Closer to Streamflow than to pump.fun.
- **Competitor set**: Bags.fm's holder-payout feature, Streamflow's permissionless staking, Buddy.link. Pump.fun and Bonk.fun are *not* competitors — they're the layer below ours, where tokens are born.
- **Regulatory posture**: distributing existing tokens to verified-active holders is utility / loyalty, much closer to Streamflow's "infrastructure" framing than pump.fun's "unregistered casino" exposure.
- **Identity**: $CRUDE, barrels, prestige titles, the refining metaphor. We don't drop the brand to chase a pump.fun-ism.

## Verdict (read this first)

**Viable, and the category is open. No one currently owns "permissionless refinery for any existing Solana token." Wins on category creation + cross-refinery reputation + sybil-resistant defaults.**

- No direct competitor in our category. Streamflow is the closest infrastructure analog (permissionless staking pools, JS SDK) but they're rails — no engagement loop, no brand, no activity recipes beyond "lock tokens, earn." Buddy.link is the closest loyalty SDK and has not found PMF (~$150K total rewards processed).
- Launchpads (pump.fun, bonk.fun, Bags.fm) are a **different layer** — they birth tokens. We engage existing ones. They are potential token sources, not competitors.
- The fee model is proven on Solana (pump.fun economics are the benchmark for what per-launch fees plus small % can earn — even though we're not pump.fun).
- Audit / engineering cost collapses by building on Streamflow's distributor SDK instead of forking from scratch.
- Regulatory exposure is real but materially lower than the pump.fun fact pattern, because we are not creating tokens — we are providing a distribution + engagement primitive over existing ones. Still needs counsel review and offshore structure, but not catastrophic.

The wedge: (a) category ownership of "the refinery layer" via brand, (b) activity richness beyond holding/staking, (c) cross-refinery wallet reputation, (d) sybil-resistant defaults.

## The model

- Anyone can launch a refinery for any existing Solana SPL token
- Launcher deposits a quantity of the token they want distributed
- Launcher picks an activity recipe (hold, trade, LP, custom) and sybil rules
- Holders interact with the on-chain token, generate "oil" via our indexer, refine into the deposited token
- Sol Oil Factory takes a flat SOL fee per launch + small % on tokens deposited
- Flagship "Solana Refinery" remains as the canonical instance + reputation aggregator + on-ramp

The deposited token *is* the reward, branded inside the refinery metaphor: "Refine your $BONK activity into more $BONK." The $CRUDE / barrels / prestige titles are our category-defining surface — that's the product, not a placeholder.

## Market reality (May 2026)

Where we sit relative to other platforms. Most named platforms are in different layers, not in our category.

### Direct competitors (same category — permissionless distribution to engaged holders of existing tokens)

**There are no direct competitors of meaningful scale.** This is the headline finding. Verified May 2026.

### Closest analogs (similar mechanic, different shape)

**Streamflow — distribution rails.** Permissionless staking pools (anyone can create), permissionless airdrops up to 1M recipients. **Fee: 0.19% on tokens deposited.** Flat for pool lifetime. Full JS SDK (`@streamflow/distributor`, `@streamflow/staking`). Third parties can programmatically create vesting/airdrop streams in code. Claim fees: 0.0065–0.0143 SOL paid by claimer. **Not our category — they're general-purpose infrastructure, no engagement loop, no brand, no activity recipes beyond "lock tokens, earn."** We build on top of them, not against them.

**Buddy.link — Solana loyalty SDK.** Only ~$150K total rewards processed. Permission-light loyalty platform that has not found product-market fit at meaningful scale. Cautionary data point: SDK-framing without a category brand fails.

### Adjacent — different layer (launchpads, not refineries)

These create new tokens. We engage existing ones. They are potential **token sources** for our refineries, not competitors.

**Bags.fm — launchpad.** Solana creator-first launch + trading platform. $1B+ lifetime trading volume. Creators earn 1% trading fees forever; can share up to 90% with other parties via @DividendsBot. **Top-100 holders auto-paid every 24h** — but only for tokens launched on Bags, distributing trading fees from those tokens. A token launched on pump.fun or bonk.fun cannot use Bags's dividend feature. Already integrated in the existing Sol Oil Factory app as a refinery source — that integration is the right relationship: complementary, not competitive.

**Pump.fun — launchpad.** Token *creation* + trading. Useful only as fee-model benchmark: launch fee ~0.02 SOL (~$3), trading fee 1%, graduation fee 1.5 SOL at ~$90K mcap. ~$25M/month revenue. ~10,400 launches/day, ~9,900 die same day, ~1.15% graduate. **In active US class-action ($5.5B base / $16.5B RICO trebled, individual founders named, SDNY Dec 2025) — relevant context for our regulatory posture but not a fact pattern that maps cleanly onto us.**

**Bonk.fun — launchpad.** Raced creator fees to zero. Took 55% of launchpad share by July 2025. **Lesson for us: any flat-fee distribution model gets undercut. Don't model >0.5–1 SOL launch fee.**

**Jupiter LFG — curated launchpad.** DAO votes on each launch. 78 projects lifetime, $1.2B TVL. Curation works because they're Jupiter.

**DRiP Haus — cNFT distribution.** Creator distribution via cNFTs + droplets→USDC. 1.5% royalty. Engagement is cNFT collection, not SPL holder rewards.

### Distribution rails (build on or partner with)

**Streamflow distributor SDK** (covered above). **Jito Merkle Distributor / Saber merkle-distributor** — open-source reference programs for the merkle-claim pattern.

## Architecture implications

### Build on Streamflow's distributor SDK, do not fork

The critical insight from research. A merkle-distributor pattern (depositor → escrow PDA → merkle root → claimer submits proof) is well-trodden. Streamflow's open-source distributor + Jito's `jito-foundation/distributor` are the reference implementations. Audit costs:

| Scope | Cost (single firm) | Cost (dual: OtterSec + Neodyme/Halborn) |
|---|---|---|
| Single-purpose escrow / distributor (500–2k nSLOC) | $15k–$30k | $40k–$60k |
| **Launcher-shell on top of Streamflow SDK** | **~$15k** | **~$30k** |

Building on Streamflow:
- Engineering ships in weeks, not quarters
- Inherit battle-tested claim mechanics
- Streamflow takes 0.19% — bake into our pricing
- We become a UX + indexer + branding layer over their distribution rail
- We own the activity-scoring logic (the "oil" math), the discovery surface, and the cross-factory reputation layer — that's the actual product

### What we still own
- The on-chain "launch a refinery" entrypoint (calls into Streamflow under the hood)
- The activity indexer (Helius webhooks → "oil" calculations per refinery rules)
- The merkle-root publishing service (computed off-chain, posted on-chain on a cadence)
- Discovery, sybil defaults, branding, leaderboards, reputation
- The flagship "all-Solana" factory

### Backend split is now mandatory, not optional
This kills the "Phase 0" framing in `backend-strategy.md`. Permissionless launches at any volume require the worker service from day one — it's the indexer + merkle-publisher. Re-read that doc with this in mind.

## The wedge — where we win

The category is open — no one owns "permissionless refinery for any existing Solana token." But "open category" doesn't mean "easy to win." A clone could appear once we prove the model. Four wedges that compound to keep one out.

### 1. Category ownership — "the refinery layer for Solana"
Sol Oil Factory creates and owns the category. The brand (oil, $CRUDE, barrels, prestige titles, refining), the metaphor, the visual identity, the social motion. When a Solana project thinks "how do I reward my holders," the answer becomes "spin up a refinery." This is a brand wedge — it compounds with every successful refinery launch and is hard to clone without dropping the existing positioning.

### 2. Cross-refinery wallet reputation (highest long-term moat)
A user's $CRUDE earned across every refinery they've ever participated in becomes a portable Solana wallet score. No one else aggregates across distribution events. Token projects use us *because* we sybil-pre-filter via reputation. Users come back *because* their score follows them.

This is the "biggest app on Solana" framing — the wallet reputation layer for Solana, with refineries as the activity-generating surface.

### 3. Activity richness
Streamflow's staking pays for "tokens locked × time." Bags's dividend is "% of holdings of tokens launched on Bags." We can pay by holding × time + trading volume + LP positions + arbitrary on-chain events. Refineries pick recipes. The oil abstraction is genuinely better UX than raw "% of holdings" — it lets a project reward the *behavior* they care about, not just static balance.

### 4. Sybil-resistant defaults
Most distribution mechanisms shrug at sybil — operator's problem, holders' loss. We bake wallet age + balance-duration weighting + cluster heuristics + optional Civic / Solana Attestation Service into the default refinery template. The first time a refinery survives a sybil farming attack that would have drained the alternatives, we win those operators.

### What does *not* work as a wedge
- "Better UI" — not enough.
- "Lower fees" — Bonk.fun proved fees race to zero.
- "Permissionless" alone — Streamflow is also permissionless.

## Regulatory posture

Real but materially lower than pump.fun's exposure. Read once, do the work.

### Why our fact pattern differs from pump.fun's
- We do **not** create tokens. We do **not** facilitate token creation, listing, or initial distribution. The token already exists in the world before any refinery touches it.
- We provide a distribution + engagement primitive for *already-existing* tokens to *already-existing* holders. The closest analog is Streamflow (permissionless staking + airdrops), which has not been sued. Not pump.fun (token creation + trading), which is mid-litigation.
- The Howey analysis is meaningfully different. A loyalty / engagement reward distributed to active holders by a project is closer to a utility / promotional payment than to a security offering. Still needs counsel review, but not the "unregistered casino on rails" theory.

### Pump.fun lawsuit — context, not fact pattern
SDNY Dec 2025: $5.5B base / $16.5B RICO trebled. Individual founders, Solana Foundation, Solana Labs, Jito Labs all named. Worth being aware of because (a) it shows offshore status doesn't insulate Solana operators from US courts, and (b) it raises the regulatory baseline for *any* permissionless Solana platform. But the theory ("casino on rails creating speculative assets") doesn't map cleanly onto us — we don't create assets.

### Mitigations (do them, but proportionate)
- **Offshore entity** — Cayman / BVI from launch. ~$5–15k setup. Standard for any Solana dapp at scale.
- **Outside counsel opinion** before writing program code. ~$5–15k. Specifically: confirm the "utility distribution to existing holders" framing holds, get a US-securities-law sign-off on the structure.
- **US geo-block.** Cloudflare IP-level. Standard hygiene.
- **Position as infrastructure, not financial service.** Streamflow's posture. We charge for *software* (a refinery launch + indexing + UI), not for a financial outcome. We do not custody tokens we don't have to (use Streamflow's escrow PDAs).
- **Conservative ToS.** Prohibited countries enumerated. No marketing copy that says "earn yield" or "passive income." No fiat on-ramp.
- **Take fees on the depositor side, not the claimer side.** Flat SOL launch fee + small % on deposit is cleaner than a percentage on user claims.

### Honest jurisdictional read
Operator is in Nigeria, which is helpful but not absolute insulation. Hosting (Vercel = US), some users (US holders), payment rails (US wallets sending SOL fees) all create US contacts. The pump.fun complaint did not require US-resident defendants to name them. Treat $20–30k of legal hygiene as a Phase 0 line item, not optional. Cheaper if reusing existing Solana dapp templates.

## Pricing model

Hit the gap, but assume Bonk.fun-style compression will follow.

| Component | Rate | Rationale |
|---|---|---|
| Launch fee | 0.1–0.5 SOL | Pump.fun is 0.02 SOL but our launches are higher-effort. Don't go above 1 SOL — fork-and-undercut risk. |
| Streamflow pass-through | 0.19% on deposit | Their fee. Bake in. |
| Our fee on deposit | 0.5–1% | Take on the depositor side, not the claimer side. Cleaner regulatorily. |
| Claim fee | Streamflow's 0.0065–0.0143 SOL | Their existing claim flow. |
| Speed-up (existing) | 0.002 SOL | Keep for the flagship factory. |

No SaaS tier. No subscription. One-shot per launch + small % on deposit, modeled to converge toward zero over 12–24 months as competition compresses fees. The long-term value is in the wallet-reputation layer + discovery surface, not the launch fee itself.

## Phased rollout

Don't write program code yet.

### Phase 0 — Legal + validation (4–6 weeks)
- Outside counsel consultation. Get the offshore-structure recommendation in writing.
- Cayman / BVI entity setup if green-lit.
- Geo-block ToS drafted.
- Talk to 5–10 token founders. Show the flagship, describe the permissionless launch + activity-recipe model, ask: would you launch a refinery for $X SOL? What would make you trust the platform with your tokens?
- Talk to Streamflow team. Confirm SDK supports the integration we need. Negotiate any partnership terms.

### Phase 1 — Manual MVP on Streamflow rails (1–2 months)
- Hardcode 1–2 design-partner refineries in addition to the flagship.
- Use Streamflow's distributor SDK directly — no custom program yet.
- Manual merkle root publishing on a cron.
- Same Next.js + Supabase codebase, plus a worker service for ingestion.
- Validates: do holders engage when the reward is a real token? What sybil patterns appear?

### Phase 2 — Permissionless launcher (2–4 months)
- Self-serve launch flow. Mint-authority verification optional but encouraged for "verified" badge.
- Activity recipe modules (hold / trade / LP / custom).
- Sybil defaults baked in.
- Launch fee + Streamflow pass-through + our deposit fee.
- Discovery v1 — sorted by deposit size, age, activity, verification status.

### Phase 3 — Reputation layer + discovery v2 (4–8 months)
- Cross-refinery $CRUDE aggregation per wallet.
- Wallet reputation score exposed via API to refinery operators (use as a sybil filter).
- Discovery sorted by reputation-weighted activity, not raw counts.
- Decide on a real on-chain $CRUDE meta-token at this point — by now we have data on what allocation makes sense and the reputation layer gives us a non-arbitrary distribution basis.

### Phase 4 — Defensible moat (8+ months)
- Reputation API becomes the primitive every Solana loyalty / airdrop / launchpad consumes.
- Sol Oil Factory becomes "the Solana wallet reputation layer" first, "permissionless refinery launcher" second.

## Risks (honest list)

- **Regulatory** — already covered. The largest single risk by an order of magnitude.
- **Category is open but not closed off.** No one's there now, but the moment we prove demand, Streamflow could ship "engagement pools" or a launchpad could bolt on a holder-rewards layer. Wedge #1 (brand / category ownership) is the only real defense in the first 6–12 months. Speed matters.
- **Sybil farming will eat reward pools** — 98% of pump.fun tokens are scam/rug, 12 wallet clusters orchestrated 82% of liquidity drains in one analyzed period. Our sybil defaults must be real, not theater.
- **Fee compression** — Bonk.fun → 0% creator fee. Plan for revenue per launch to drop 50% in 12 months.
- **Streamflow dependency** — building on their rails is fast but ties our P0 product to their availability and pricing. Negotiate terms; have a fork-and-replace plan if needed.
- **Operational support** — refinery operators will blame us when their pool gets drained. Sybil disputes, refund requests, theme bugs. Invest in self-serve from day one.
- **Brand dilution** — once anyone can launch a refinery, ours stops being special. The flagship has to remain the best, most-trusted instance.

## Open questions

Pin these down before Phase 1.

1. **Mint-authority gate or pure permissionless?** Pure permissionless = anyone launches a refinery for $BONK without owning $BONK (impersonation risk, but more viral). Mint-authority gate = real $BONK team has to launch (less impersonation, less viral). Probably: pure permissionless + "verified" badge for mint-authority-signed launches, surfaced in discovery.
2. **Does the launcher retain control of the deposited tokens?** Trustless escrow (safer for holders, no top-up) or operator-controlled vault (more flexible, more rug surface)?
3. **Activity proof — pure on-chain or off-chain merkle?** Off-chain merkle (computed by our indexer, posted as root) is the standard pattern and what Jito / Saber / Streamflow use. We trust ourselves to be honest; users trust the merkle root once posted. This is the right call.
4. **Streamflow integration — partner or pure technical dependency?** Partnership has commercial implications (rev share?) but gives us co-marketing and roadmap input. Pure technical dependency is faster but we're a customer.
5. **Do we charge in SOL only, or accept the launched token as fee?** SOL is cleaner regulatorily and operationally. Accepting the launched token aligns incentives but adds custody / pricing complexity.
6. **What's the policy on launching refineries for tokens already labeled scam?** Auto-block? Manual review? Operator discretion? This is a real moderation decision.
7. **Flagship factory — rebrand as "Solana Refinery" (the canonical one)? Make it the discovery hub?**
8. **Founder location & legal posture.** Operator is in Nigeria. Cayman/BVI entity setup needed. Who handles legal — local counsel or US firm with offshore practice? Budget?

## Considered alternative: B2B SaaS framing

Earlier draft of this doc proposed a flat-SaaS pricing model ($99 / $299 / $999 per refinery per month) targeting memecoin / mid-cap teams. Rejected because:
- Adds platform-as-gatekeeper friction that kills the viral motion.
- Requires sales motion the team isn't set up to run.
- Doesn't match Solana's permissionless ethos.
- A per-launch SOL fee + small % on deposit captures the same revenue without the friction.

The permissionless refinery model wins on revenue ceiling, viral motion, and category-creation potential. The regulatory cost is real but proportionate — we accept it and pay for clean legal hygiene.

## Recommended next step

Don't build. Spend the next 4 weeks on:
1. Outside counsel consultation. Confirm the "utility distribution to existing holders" framing holds. Get the offshore-structure recommendation in writing.
2. Talk to 5+ token founders. Show the flagship Solana Refinery, describe the permissionless launch + activity-recipe model, ask: would you launch a refinery for $X SOL? What activity rules would you choose? What sybil settings would you want?
3. Talk to Streamflow team. Confirm SDK supports the integration we need. Get their read on whether to partner or stay arms-length.
4. Decide: are we willing to spend $20–30k on legal + entity setup? If no, kill the permissionless pivot and stay single-tenant.

If the answer is yes, Phase 1 is a 1–2 month build on Streamflow's SDK with 1–2 design-partner refineries. The platform-grade build comes after that proves engagement.

## Sources

- [Pump.fun Fees Explained 2026](https://www.soltokencreator.io/blog/pump-fun-fees-explained)
- [Pump.fun lifetime revenue >$800M](https://www.theblock.co/post/367585/pump-fun-surpasses-800-million-in-lifetime-revenue-as-solana-memecoin-launchpad-competition-heats-up)
- [Pump.fun graduation rate 1.15% Feb 2026](https://www.bitget.com/news/detail/12560605208670)
- [Pump.fun ChainPlay daily lifespan analysis](https://chainplay.gg/blog/lifespan-pump-fun-memecoins-analysis/)
- [Pump.fun 36% PUMP burn April 2026](https://www.coindesk.com/markets/2026/04/29/pump-fun-burns-36-of-pump-supply-in-usd370-million-wipe-locks-50-revenue-into-ongoing-buybacks)
- [Pump.fun RICO $5.5B lawsuit](https://hodder.law/pumpfun-solana-jito-lawsuit-2025/)
- [DLNews: Solana execs sued, 5K messages](https://www.dlnews.com/articles/defi/solana-execs-sued-over-memecoin-trades/)
- [Streamflow Permissionless Staking](https://streamflow.finance/blog/introducing-permissionless-staking-on-streamflow)
- [Streamflow JS SDK](https://github.com/streamflow-finance/js-sdk)
- [Streamflow costs (claim fees)](https://docs.streamflow.finance/en/articles/9675153-costs-of-using-streamflow)
- [Jito Merkle Distributor](https://github.com/jito-foundation/distributor)
- [Jupiter LFG (78 projects, $1.2B TVL)](https://www.gate.com/learn/articles/jupiter-lfg-launchpad-a-game-changer-for-solana-projects/2047)
- [DRiP Haus model + 1.5% royalty](https://solanacompass.com/projects/drip-haus)
- [Bags.fm (top-100 holder 24h auto-payout)](https://dev.to/sivarampg/bagsfm-the-solana-launchpad-thats-changing-creator-monetization-4g7n)
- [Bonk.fun 55% share, $1.84M daily fees](https://www.ainvest.com/news/solana-news-today-bonkfun-solana-launchpad-surges-33-7-deflationary-strategy-generates-1-84m-daily-fees-2507/)
- [Sanctum Infinity FAQ](https://learn.sanctum.so/guides/user-guides/infinity/infinity-faq)
- [Meteora DLMM Dynamic Fees](https://docs.meteora.ag/product-overview/dlmm-overview/dynamic-fees)
- [Accretion: Solana audit cost 2026](https://accretion.xyz/blog/solana-audit-cost)
- [Flintr: anatomy of pump.fun rug pulls](https://www.flintr.io/articles/anatomy-of-a-rug-pull-identify-scams-on-pumpfun)
- [98% pump.fun tokens fraudulent report](https://www.coindesk.com/business/2025/05/07/98-of-tokens-on-pump-fun-have-been-rug-pulls-or-an-act-of-fraud-new-report-says)
- [Pump.fun prohibited countries (Datawallet)](https://www.datawallet.com/crypto/pump-fun-restricted-countries)
