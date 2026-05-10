# 09 — Terms of Service & Privacy Policy

**Audience:** Legal review, ops
**Purpose:** Drafts for ToS + Privacy Policy. **REQUIRES LAWYER REVIEW BEFORE MAINNET.**

---

# Sol Oil Factory — Terms of Service & Privacy Policy

**Version 1.0 · 2026-05-09**

---

> **IMPORTANT NOTICE — DRAFT FOR REVIEW**
>
> This document is a comprehensive draft prepared for Sol Oil Factory's devnet launch. **It must be reviewed by a qualified attorney with crypto/securities experience before mainnet deployment with real-money TVL.** Estimated review cost: $1k–$3k per the project's existing legal hygiene budget. The draft is modeled on production DeFi platforms (Streamflow, Pump.fun, Aave, Drift) and adjusted for Sol Oil Factory's specific fact pattern (permissionless distribution platform, non-custodial via Anchor program, reputation system, sanctioned-country exclusions).
>
> Key drafting principles applied:
> - **Non-custodial framing** — repeatedly emphasized to align with regulatory posture
> - **Utility/distribution framing** — explicitly NOT financial advice, NOT investment, NOT yield product
> - **Permissionless disclaimer** — Sol Oil Factory does not vouch for tokens or operators
> - **Sanctioned-country exclusions** — OFAC compliance baked in
> - **Operator vs. holder roles** — distinct obligations for each
> - **Reputation transparency** — methodology referenced but not contractually binding
> - **Arbitration clause** — Cayman/Delaware to be finalized at incorporation

---

# Terms of Service

**Last updated: May 9, 2026**

## 1. Introduction

These Terms of Service (the "Terms") govern your access to and use of the Sol Oil Factory platform (the "Platform"), including the website at solanaoilfactory.xyz, any subdomains, mobile interfaces, application programming interfaces ("APIs"), and on-chain programs and infrastructure operated by or on behalf of Sol Oil Factory (collectively, the "Services").

By connecting a wallet to the Platform, accepting these Terms via the on-screen acceptance flow, or otherwise using any portion of the Services, you ("you," "your," or "User") acknowledge that you have read, understood, and agreed to be bound by these Terms and our Privacy Policy. **If you do not agree to these Terms, do not use the Services.**

These Terms form a legally binding agreement between you and the legal entity operating Sol Oil Factory ("Sol Oil Factory," "we," "us," or "our"). The operating entity is currently in formation — at the time of these Terms' last update, the Platform operates under a sole-proprietor model headquartered in Nigeria, with offshore incorporation (Cayman Islands or British Virgin Islands) planned before mainnet launch. The current operating entity will be named explicitly at the top of these Terms upon incorporation.

## 2. The Platform

### 2.1 What we are

Sol Oil Factory is a permissionless, non-custodial software platform that provides infrastructure for Solana-based token distribution. Specifically:

- **Token Refineries** — anyone can launch a refinery for any existing Solana SPL token. The launcher (Operator) deposits a quantity of the token, configures distribution rules, and the platform's audited Anchor program handles all custody and distribution mechanics.
- **The Solana Refinery and Launchpad Refineries** — flagship refineries that distribute the platform's in-app score ($CRUDE) based on wallets' on-chain Solana activity or activity on specific launchpads.
- **Cross-refinery wallet Reputation** — a 0–100 score tracking each wallet's participation patterns across all refineries. The score is publicly viewable and may be consumed by Operators as a sybil filter.
- **Public APIs and embed widgets** — programmatic access to refinery data and reputation scores for third-party developers.

### 2.2 What we are not

We are not, and the Services do not constitute or provide:

- A bank, broker-dealer, money services business, money transmitter, exchange, or other financial institution
- An investment vehicle, security, derivative, or financial product
- Investment, financial, legal, or tax advice
- A custodial service of any kind — we hold no custody over user funds, tokens, or wallets
- A guarantor of any token's legitimacy, value, future performance, or operator's good faith
- A recovery or insurance service for lost funds, drained refineries, or rugged tokens

Sol Oil Factory provides software. Software is not regulated as a financial service in the jurisdictions we operate from. We do not facilitate, endorse, custody, or transmit value — we provide programs and interfaces that allow users to interact with public on-chain protocols.

## 3. Eligibility

### 3.1 Age and capacity

To use the Services, you must:

- Be at least 18 years of age, or the age of majority in your jurisdiction, whichever is greater
- Have the legal capacity to enter into binding agreements
- Use the Services in compliance with all applicable laws

### 3.2 Geographic restrictions

The following individuals and entities are prohibited from using the Services. By accepting these Terms, you represent and warrant that you are NOT:

- A resident, national, citizen, or located in any country subject to United States sanctions, including but not limited to: Cuba, Iran, North Korea, Syria, Russia, Belarus, the Crimea, Donetsk, Luhansk, and Zaporizhzhia regions of Ukraine, and any other comprehensively sanctioned jurisdiction
- A "Specially Designated National" or otherwise on any sanctions list maintained by the U.S. Office of Foreign Assets Control ("OFAC"), the European Union, the United Kingdom, the United Nations, or any other applicable regulatory body
- An individual or entity prohibited from using software platforms by your local law

We use IP-based geolocation to enforce these restrictions. Circumventing the geo-block via VPN, proxy, or other means is a material breach of these Terms.

### 3.3 No accounts; wallet-based identity

The Services do not require email registration. Your "identity" on the Platform is the Solana wallet address you connect. You are solely responsible for:

- Securing the private keys to any wallet you connect
- The security and integrity of the wallet provider you use (Phantom, Solflare, Backpack, or others)
- Any actions taken from a wallet you have connected, regardless of who actually holds the keys

**If your wallet is compromised, the Services cannot recover your tokens, reverse transactions, or restore your reputation. There is no password reset.**

## 4. Wallet Connection and Non-Custody

### 4.1 We do not custody anything

When you connect a wallet to the Services, we receive your public wallet address. We do not receive, store, or have any access to your private keys, seed phrases, or other authentication credentials. You retain full custody of all assets in your wallet at all times.

When you launch a refinery and deposit tokens, those tokens are transferred from your wallet to a program-derived address ("PDA") owned by Sol Oil Factory's Anchor program (the "Refinery Program"). **Sol Oil Factory team members hold no keys to this PDA.** Tokens move out of the PDA only when:

- A holder claims under the rules configured at launch
- The Operator initiates a withdrawal (subject to the claim-window-lock + 7-day cooldown enforced by the program)
- The Operator initiates a clean close of the refinery (refunds remaining tokens)

These mechanics are enforced on-chain by the Refinery Program. We cannot override them, freeze them, or make exceptions.

### 4.2 Squads-PDA pause governance

The Refinery Program includes a platform-level emergency-pause mechanism, controlled by a Squads multisig PDA. At launch, this multisig is configured 1-of-1 (signed by the Sol Oil Factory founder alone); post-audit, it will be expanded to 3-of-5. The pause mechanism can:

- Halt new refinery launches in a critical security incident
- Halt all claims if a vulnerability is discovered

The pause mechanism CANNOT:

- Withdraw tokens from any escrow PDA
- Modify any operator's configuration
- Reassign refinery ownership
- Mint, freeze, or transfer any token

Pause events will be disclosed publicly on the `/trust` page within 4 hours of activation.

### 4.3 Network risks

The Services depend on the Solana blockchain. We do not control Solana and are not responsible for:

- Solana network outages, halts, forks, or chain reorgs
- Validator misbehavior or stake changes
- RPC provider (Helius) outages affecting our indexer
- Increased network congestion causing transaction failures

If a transaction fails due to network issues, you may need to retry, increase priority fees, or wait. **Failed transactions can result in lost network fees with no recovery.**

## 5. Refineries

### 5.1 Operator obligations

If you launch a refinery (becoming an "Operator"), you represent, warrant, and covenant that:

- You have the legal right to distribute the deposited tokens — you own them, they are not stolen, and your distribution does not violate any contractual or fiduciary obligation you owe to a third party
- The token you are distributing is not on a known scam list, blocklist, or under enforcement action
- You are not impersonating a token's actual project team unless you are the actual project team or a verified community takeover ("CTO") group
- The deposited tokens are not subject to a freeze or seizure order by any government or law enforcement body
- You are not using the platform to defraud, mislead, or harm holders
- You will not pause, withdraw, or close a refinery in bad faith to avoid distributing tokens that holders are entitled to under the configured rules

Sol Oil Factory reserves the right to delist, deindex, or refuse to display any refinery that we determine, in our sole discretion, violates these Operator obligations. **However, we cannot remove the on-chain refinery itself** — once launched, the refinery exists on-chain and continues operating per its rules until the Operator closes it or the claim window expires. This is a feature of permissionless infrastructure, not a bug.

### 5.2 Holder rights

If you claim from a refinery (becoming a "Holder"), you understand and accept that:

- Eligibility is determined by the refinery's snapshot rules and sybil filters, both set by the Operator at launch
- You may be filtered from a refinery by the Operator's sybil rules without notice
- You may be flagged into a sybil cluster algorithmically — see Section 6 (Reputation) for appeal rights
- Tokens you claim may have transfer fees, freeze authorities, mint authorities, or other Token-2022 extensions that affect their behavior
- The token you claim may lose all value at any time
- Sol Oil Factory does not vouch for, recommend, or take any position on any token offered through any refinery

### 5.3 Permissionless launches

Anyone, anywhere (subject to the geographic restrictions in Section 3.2), can launch a refinery for any token. Sol Oil Factory does not pre-approve, curate, vet, or moderate refinery launches at the on-chain layer.

This means:
- Refineries may be launched by parties unaffiliated with the underlying token's actual project team
- Refineries may be launched for tokens that subsequently rug, fail, or lose value
- Refineries may be launched by malicious actors attempting to harvest holder data or manipulate prices

We mitigate these risks via:
- Verification badges (Verified Deployer, Verified CTO) for trusted operators
- Token risk badges (Mintable, Concentrated, Low liquidity, etc.) on every refinery
- Auto-block list for known scam tokens, RugCheck-flagged tokens, and tokens with transfer fees >5%
- Reputation system that highlights operator track record and claimer authenticity

**These mitigations are best-effort and not guarantees.** A token can rug after passing all our checks. An operator can launch dozens of legitimate refineries before launching a malicious one. **Use your own judgment.**

### 5.4 Refinery state and lifecycle

Refineries progress through states: `pending` → `active` → `closed`. State transitions are enforced on-chain. Once a refinery enters `closed`, it cannot be reopened. To re-distribute the same token, the Operator must launch a new refinery (and pay the launch fee again).

Closed refineries are searchable on the Platform for 6 months from the close date. After 6 months, per-claim receipt rows are hard-deleted from our databases; a one-row summary remains permanently. The on-chain data persists indefinitely — closed refineries are visible on Solscan forever.

## 6. Reputation

### 6.1 What Reputation is

Reputation is a 0–100 score we compute for each wallet that has interacted with the Services. It reflects participation patterns: how many refineries you've claimed from, how long you held tokens before/after claiming, your wallet's age, and whether your wallet appears in any flagged behavioral cluster.

Reputation is:
- Public — visible on every wallet profile and to any caller of our API
- Algorithmic — computed by our backend from on-chain and platform data
- Decaying — scores erode with extended inactivity
- Appealable — see Section 6.4

Reputation is NOT:
- A credit score
- A character endorsement
- A guarantee of any kind
- A property right of any wallet (we may modify weights or methodology with notice)

### 6.2 Methodology disclosure

The full methodology for Reputation scoring is published at solanaoilfactory.xyz/reputation. We commit to:
- Disclosing every signal that contributes to score (full table)
- Disclosing the relative weight of each signal
- Disclosing decay rates and conditions
- Providing 30 days advance notice of methodology changes that could materially affect scores

Cluster-detection heuristics are NOT fully published, because exposing them would help bad actors evade detection. We commit publicly to the high-level principles (what triggers cluster review, appeal procedures, decay rules) without exposing the specific algorithm.

### 6.3 Operator use of Reputation

Operators may set a minimum Reputation threshold for their refineries (the "min-reputation filter"). Holders below the threshold are filtered from claiming. We do not control these thresholds — Operators set them.

Sol Oil Factory may also use Reputation internally to:
- Surface high-reputation wallets in leaderboards
- Display "Verified Deployer" badges
- Throttle API rate limits

### 6.4 Cluster flag appeals

If your wallet has been flagged into a sybil cluster and you believe the flag is in error, you can file an appeal:

1. Visit your Wallet Profile (`/wallet/<your-address>`)
2. Click the "Reputation breakdown" tab
3. Click "Appeal cluster flag"
4. Provide context (where the wallet was funded from, transaction history, etc.)
5. We respond within 7 business days

Successful appeals remove the flag and restore your full Reputation score within 24 hours of approval. Unsuccessful appeals can be re-filed with new evidence after 30 days.

### 6.5 Limitations

We make no representation that Reputation is accurate, free from bias, immune to gaming, or reflective of any wallet's true intentions. **Operators using Reputation as a filter do so at their own risk and discretion.**

We may modify Reputation methodology, weights, or signal definitions at any time. Changes are disclosed publicly with at least 30 days notice for material changes.

## 7. Fees

### 7.1 Platform fees

The Platform charges the following fees:

| Fee | Amount | Currency | Collected at |
|---|---|---|---|
| Refinery launch fee | 0.1 SOL | SOL | At refinery initialization |
| Refinery deposit fee | 1% of deposit | Deposited token (auto-swapped to SOL) | At each deposit and top-up |
| Holder claim fee | 0.001 SOL | SOL | At each holder claim |

These fees are collected by the on-chain Refinery Program and held in a treasury PDA. The treasury PDA performs daily token-to-SOL swaps via Jupiter aggregator with a 1% slippage limit.

### 7.2 Network fees (gas)

In addition to platform fees, every transaction on Solana incurs a network fee paid to validators. These fees are typically 0.0001–0.001 SOL per transaction. Sol Oil Factory does not collect these fees — they go directly to Solana validators.

### 7.3 No refunds

All fees are non-refundable. If a refinery launch transaction succeeds but the operator immediately closes the refinery (refunding the pool to themselves), the launch fee is still owed. If a holder claims but the token is then frozen or transfer-fee'd to zero, the claim fee is still owed.

### 7.4 Fee changes

We may change platform fees at any time. Changes apply prospectively only — refineries already launched continue under their original fee structure. Fee increases are disclosed publicly with at least 30 days notice.

### 7.5 API fees (developers)

Developers consuming the Reputation API pay subscription fees per the published pricing on `/developers`. Free tier (10,000 requests/month) does not require payment. Paid tiers are billed monthly.

## 8. Risks and Disclaimers

### 8.1 Cryptocurrency risks

Cryptocurrencies and tokens are highly volatile, speculative, and risky. By using the Services, you acknowledge:

- Token values can drop to zero at any time
- Markets can be manipulated, illiquid, or non-existent
- "Stablecoins" can lose their peg
- Smart contracts can have bugs that result in total loss
- Network attacks (51% attacks, MEV extraction, etc.) can affect transaction outcomes
- Regulatory action can render tokens unusable or illegal

### 8.2 Refinery-specific risks

Refineries amplify cryptocurrency risks because they involve:

- Trust in the Operator (who may close the refinery, modify rules, pause claims)
- Trust in the underlying token (which may rug, freeze, or lose value)
- Trust in the snapshot mechanism (which may not capture your balance correctly)
- Trust in the sybil filter (which may flag your wallet incorrectly)

**You can lose your entire token deposit (as an Operator) or your entire claim opportunity (as a Holder) at any time. There is no insurance, no recovery process, and no liability on our part for these losses.**

### 8.3 Reputation risks

Reputation is computed algorithmically from public data. Algorithms have flaws. Your wallet may:
- Be flagged into a cluster with which it has no actual relationship
- Lose Reputation due to a bug in our system
- Have Reputation recomputed after a methodology change, resulting in a lower score

The appeal process (Section 6.4) provides correction for known errors. We make no guarantee of correctness or stability of Reputation scores beyond the disclosed methodology.

### 8.4 Software risks

The Platform is software. Software has bugs. Despite our best efforts, our smart contracts, indexers, frontends, and APIs may:
- Fail to process transactions
- Display incorrect information
- Be temporarily or permanently unavailable
- Be exploited by attackers

We aim to deploy only audited code to mainnet. Until audit completion, the Platform operates on Solana devnet only — no real-money TVL is exposed. Devnet bugs may result in lost test tokens (which have no real value).

### 8.5 No warranty

THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR ACCURACY OF DATA. WE DISCLAIM ALL SUCH WARRANTIES TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW.

## 9. Prohibited Activities

You may not:

- Use the Services if you are a sanctioned person or in a sanctioned jurisdiction (Section 3.2)
- Circumvent geo-blocks via VPN, proxy, or other means
- Submit false or impersonating information for Verified CTO badge applications
- Launch refineries for tokens you do not have the legal right to distribute
- Use the Services to launder money, evade taxes, or finance terrorism
- Attempt to game Reputation through cluster manipulation, wash-trading, or coordinated wallet farming
- Reverse-engineer, decompile, or otherwise attempt to derive source code from our binaries (other than open-source code we have published)
- Scrape or programmatically harvest data from the Platform beyond what our published APIs allow
- Use the Platform to harass, threaten, defame, or stalk other users
- Distribute malware, phishing links, or other malicious content via Platform features (refinery URLs, profile pages, etc.)
- Interfere with or disrupt the Services (DDoS, attempted exploits, etc.)

Violations may result in (a) deindexing of your refineries, (b) revocation of Verified Deployer or Verified CTO badges, (c) cluster-flag application to your wallet, (d) termination of API access, and (e) referral to law enforcement where appropriate.

## 10. Operator Indemnification

If you are an Operator, you agree to indemnify, defend, and hold harmless Sol Oil Factory, its affiliates, officers, directors, employees, and agents from any claim, demand, loss, liability, damage, or expense (including reasonable attorneys' fees) arising from or related to:

- Your launched refineries
- The tokens you distribute through them
- Your actions as an Operator (pausing, closing, top-up, etc.)
- Any false statement made during refinery setup or verification
- Any breach of these Terms by you

This indemnification survives termination of these Terms.

## 11. Intellectual Property

### 11.1 Sol Oil Factory IP

The Platform's name, logo, design, copy, frontend code, indexer code, and overall product design are owned by Sol Oil Factory. You receive a limited, revocable, non-transferable license to use the Services for the purposes described in these Terms. You receive no other rights.

The smart contracts deployed by Sol Oil Factory are open-source and licensed permissively (typically Apache 2.0 or MIT — final license confirmed at deployment). You may inspect, fork, and reuse the smart contract code under those open-source terms.

### 11.2 User content

Any content you submit to the Platform (refinery names, profile data, comments in appeals, etc.) you grant Sol Oil Factory a non-exclusive, worldwide, royalty-free license to display, distribute, and use solely in connection with operating the Services.

You retain ownership of your wallet addresses, tokens, and on-chain transaction history. We have no ownership claim over any of these.

### 11.3 Reputation data

Reputation scores are derivative works produced by Sol Oil Factory's algorithms from public on-chain data. We claim no ownership over the underlying public data. We do claim ownership over the methodology, weighting, and computational processes that produce the Reputation score itself.

You may export your own wallet's full Reputation breakdown as JSON for any purpose.

## 12. Limitation of Liability

TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:

- IN NO EVENT WILL SOL OIL FACTORY, ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF OR INABILITY TO USE THE SERVICES, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

- OUR TOTAL CUMULATIVE LIABILITY TO YOU FOR ANY AND ALL CLAIMS ARISING FROM OR RELATED TO THESE TERMS OR THE SERVICES SHALL NOT EXCEED THE GREATER OF: (A) THE AMOUNT OF FEES YOU HAVE PAID TO SOL OIL FACTORY IN THE 12 MONTHS PRECEDING THE CLAIM, OR (B) US$100.

- THE LIMITATIONS IN THIS SECTION 12 APPLY EVEN IF A REMEDY FAILS OF ITS ESSENTIAL PURPOSE. SOME JURISDICTIONS DO NOT ALLOW LIMITATIONS ON IMPLIED WARRANTIES OR EXCLUSION OF CERTAIN DAMAGES — IN SUCH JURISDICTIONS, OUR LIABILITY IS LIMITED TO THE MAXIMUM EXTENT PERMITTED BY LAW.

## 13. Dispute Resolution

### 13.1 Informal resolution

Before filing any formal claim, you agree to first contact us at `legal@solanaoilfactory.xyz` and attempt to resolve the dispute informally. Most disputes can be resolved this way.

### 13.2 Arbitration

If informal resolution fails, any dispute, claim, or controversy arising out of or relating to these Terms or the Services shall be resolved by binding arbitration administered by [JAMS, AAA, or LCIA — to be finalized at incorporation] under its applicable rules. The seat of arbitration shall be [Cayman Islands or Delaware — finalized at incorporation]. The language of arbitration shall be English. The arbitrator's decision shall be final and binding.

### 13.3 Class action waiver

YOU AGREE THAT ALL DISPUTES BETWEEN YOU AND SOL OIL FACTORY MUST BE RESOLVED ON AN INDIVIDUAL BASIS. CLASS ARBITRATIONS, CLASS ACTIONS, AND REPRESENTATIVE ACTIONS ARE NOT PERMITTED.

### 13.4 Exceptions

Notwithstanding Section 13.2, either party may seek injunctive or other equitable relief in court for matters relating to (a) intellectual property infringement, (b) violations of Section 9 (Prohibited Activities), or (c) emergency security incidents.

### 13.5 Governing law

These Terms are governed by the laws of [Cayman Islands or Delaware — finalized at incorporation] without regard to conflict of law principles.

## 14. Termination

### 14.1 By you

You may stop using the Services at any time by disconnecting your wallet. There is no formal account termination because there are no formal accounts.

Disconnecting does not:
- Withdraw your tokens from refineries (use the operator withdraw or refinery close flow)
- Remove your wallet's history from on-chain or our databases
- Reset your Reputation score (which persists for the wallet address)

### 14.2 By us

We may terminate or restrict your access to the Services at any time, with or without cause, including but not limited to:

- Violation of these Terms (Section 9)
- Sanctions or geographic ineligibility
- Suspected fraud or abuse
- Court order or law enforcement request
- Discontinuation of all or part of the Services

Termination does not:
- Refund any fees paid
- Reverse any on-chain transaction
- Erase any cluster flag (those decay per Section 6.2)

### 14.3 Survival

Sections that by their nature should survive termination (Liability, Indemnification, Intellectual Property, Dispute Resolution, etc.) shall survive.

## 15. Modifications

We may modify these Terms at any time. Modifications take effect when posted at solanaoilfactory.xyz/legal/terms with an updated "Last updated" date. Continued use of the Services after the update constitutes acceptance.

For material changes, we will (a) post a notice on the Platform homepage for 30 days, (b) re-prompt the Terms acceptance modal on next wallet connect, and (c) record the new ToS version hash against your wallet upon acceptance.

## 16. General

### 16.1 Entire agreement

These Terms, together with our Privacy Policy and any other policies referenced herein, constitute the entire agreement between you and Sol Oil Factory regarding the Services.

### 16.2 Severability

If any provision of these Terms is held invalid or unenforceable, the remaining provisions remain in full force.

### 16.3 No waiver

Our failure to enforce any provision is not a waiver of our right to enforce it later.

### 16.4 Assignment

You may not assign your rights or obligations under these Terms. We may assign without notice as part of a corporate transaction, restructuring, or acquisition.

### 16.5 Force majeure

Neither party is liable for failure to perform due to causes beyond their reasonable control, including network outages, regulatory action, war, pandemic, or natural disaster.

### 16.6 Notices

Notices to us: `legal@solanaoilfactory.xyz`
Notices to you: posted on the Platform or sent to a contact method associated with your wallet (where available).

## 17. Contact

For questions about these Terms:

- Email: `legal@solanaoilfactory.xyz`
- Discord: [discord.gg/solanaoilfactory]
- X / Twitter: @solanaoilfactory

For security issues:

- Email: `security@solanaoilfactory.xyz` (PGP key available)

---

# Privacy Policy

**Last updated: May 9, 2026**

## 1. Introduction

This Privacy Policy explains what information Sol Oil Factory collects, how we use it, who we share it with, how long we keep it, and your rights regarding your data. By using the Services, you agree to the practices described below. **If you do not agree, do not use the Services.**

This policy is written in plain English first, with the legal-grade detail necessary for compliance with GDPR, CCPA, and other applicable privacy laws. Where we say "we," "us," or "our," we mean the entity operating Sol Oil Factory (defined in the Terms of Service).

## 2. What We Collect

We deliberately collect very little. Most of what the Services know about you is public information that exists on the Solana blockchain regardless of whether you use Sol Oil Factory.

### 2.1 Information you provide directly

We collect information that you actively give us:

- **Wallet address** — the public Solana address you connect
- **ToS acceptance record** — a hash of which version of the Terms you accepted, plus the timestamp
- **Cluster appeal submissions** — the text you provide if you appeal a Reputation cluster flag
- **API key sign-ups (developers)** — wallet address, optional email for billing if on a paid tier
- **Support / security correspondence** — content of emails or Discord messages you send us

### 2.2 Information we collect automatically

We collect technical information when you use the Services:

- **IP address** — to enforce geo-restrictions (Section 3.2 of Terms) and detect abuse
- **User agent / browser info** — for compatibility checks and abuse detection
- **Wallet provider used** — to debug connection issues
- **Pages visited and timing** — through Vercel Analytics (privacy-respecting, no cookies)
- **API request logs (developers)** — endpoint, timestamp, status code, response time

### 2.3 Information we derive from public on-chain data

The Reputation system reads public Solana data and computes scores from it. This includes:

- All transactions associated with your wallet on Solana
- All token balances (current and historical) of your wallet
- All claims your wallet has made on the Platform
- All refineries your wallet has launched (as Operator)
- Any cluster heuristics matched against your wallet

**This information is public.** We compute on it; we do not have any access we could not give to anyone with a Solana RPC connection.

### 2.4 Information we do NOT collect

We do not collect:

- Email addresses (except for paid-tier API customers and support correspondence)
- Phone numbers
- Real names or government IDs
- Private keys or seed phrases (technically impossible — they never leave your wallet)
- Browsing history outside of our domain
- Cross-site tracking identifiers
- Biometric data
- Children's data (we do not knowingly serve users under 18)

## 3. How We Use What We Collect

### 3.1 Operating the Services

We use collected data to:
- Enable wallet connection and on-chain interactions
- Display refineries, eligibility, claims, and Reputation
- Compute and update Reputation scores
- Process developer API requests
- Send transactional notifications (e.g., your refinery launched, your appeal was reviewed)

### 3.2 Security and abuse prevention

We use collected data to:
- Detect cluster behavior (sybil farming)
- Block sanctioned-country IPs
- Detect API abuse (rate-limit violations, etc.)
- Investigate reported security issues

### 3.3 Improving the Services

We use aggregate, non-identifying data to:
- Understand product usage patterns
- Identify performance bottlenecks
- Plan new features

We do not use individual wallet activity for advertising, profiling, or sale to third parties.

### 3.4 Legal compliance

We use collected data to:
- Comply with applicable laws and regulations
- Respond to lawful requests from courts or law enforcement
- Enforce our Terms of Service

## 4. Sharing & Disclosure

We share information in these limited cases:

### 4.1 Service providers

We work with third parties who process data on our behalf:

| Service | What they do | What they receive |
|---|---|---|
| Helius | Solana RPC + indexing | Wallet addresses, transaction queries |
| Supabase | Database hosting | Anonymized application data, ToS acceptances, cluster flags |
| Vercel | Frontend hosting + analytics | IP addresses, page views, latency metrics |
| Cloudflare | DDoS protection + edge caching | IP addresses, request metadata |
| Stripe (future, paid API tiers) | Subscription billing | Email + payment info from API customers only |

These providers are contractually required to use data only for the services they provide to us.

### 4.2 Public on-chain data

Some "shared" data is shared inherently because Solana is a public blockchain:

- Wallet addresses and their transaction histories are visible to anyone running a Solana node
- Refinery launches, claims, and pool balances are public on-chain events
- Reputation scores are publicly viewable on the Platform and via our public API

We have no control over and do not collect data about who reads this public information.

### 4.3 Legal requests

We may disclose data when required by:
- Court order or subpoena from a competent jurisdiction
- Government investigation following due process
- Law enforcement request with proper legal authority

We commit to:
- Pushing back against overbroad requests where legally permissible
- Notifying affected users where not legally prohibited
- Disclosing only what is specifically required, not bulk data

### 4.4 Business transfers

If Sol Oil Factory is acquired, merged, or undergoes other corporate restructuring, user data may transfer to the successor entity, subject to this Privacy Policy.

### 4.5 Aggregated/anonymized data

We may share aggregated, de-identified statistics (e.g., "1,247 wallets verified," "$284,200 distributed lifetime") publicly. This data cannot be reverse-engineered to identify any individual wallet.

## 5. Data Retention

We keep different categories of data for different periods:

| Category | Retention |
|---|---|
| Wallet activity (linked to active user) | While the wallet is active or for 5 years, whichever is shorter |
| ToS acceptances | 7 years (compliance requirement) |
| Reputation scores | Perpetually, with decay per methodology |
| Cluster appeal records | 3 years |
| Closed refinery details | 6 months full detail, then summary forever |
| Cloud server access logs | 90 days |
| Support correspondence | 3 years |
| API key sign-ups (paid) | While account is active + 7 years for billing records |
| Geographic IP block records | 30 days |

Public on-chain data persists indefinitely on Solana itself. We do not control that.

## 6. Your Rights

### 6.1 Access

You can access:
- Your wallet's full Reputation breakdown via your Wallet Profile or API export
- Your cluster appeal history (if any) by emailing `support@solanaoilfactory.xyz`
- Your support correspondence by emailing `support@solanaoilfactory.xyz`

### 6.2 Correction

You can request correction of:
- A wrong Reputation score (via the appeal flow)
- A wrong cluster flag (via the appeal flow)
- Inaccurate refinery metadata (only the Operator can do this)

### 6.3 Deletion

You can request deletion of:
- Cluster appeal records (we will delete after the appeal is resolved + 12 months)
- Support correspondence (we will delete after 12 months from request)
- API key records (we will delete after subscription cancellation + retention period)

You CANNOT request deletion of:
- Public on-chain data (we don't control Solana)
- Reputation scores (those follow the wallet, not the human; they may decay but won't be erased)
- ToS acceptance records (compliance requirement)
- Records that would prevent us from complying with applicable laws

### 6.4 Portability

You can export your full Reputation breakdown as JSON via the Platform UI or our API. This is intentional — the data is yours.

### 6.5 GDPR rights (if you're in the EU)

If you're in the European Union, you also have rights to:
- Object to certain processing
- Withdraw consent (where consent is the basis)
- Lodge a complaint with your Data Protection Authority

Contact `privacy@solanaoilfactory.xyz` for any GDPR-specific request.

### 6.6 CCPA rights (if you're a California resident)

If you're a California resident, you have rights under the California Consumer Privacy Act, including:
- Right to know what personal information we have about you
- Right to delete personal information (subject to exceptions)
- Right to opt out of sale (we don't sell personal information)
- Right to non-discrimination for exercising your rights

Contact `privacy@solanaoilfactory.xyz` for any CCPA-specific request.

## 7. Cookies & Analytics

We use cookies sparingly:

- **Theme preference** — stored locally as `sof.theme` (light, dark)
- **Wallet verification cache** — stored in `sessionStorage` as `sof_verified_<addr>`
- **ToS acceptance hash** — stored locally per wallet

We do NOT use:
- Advertising cookies
- Cross-site tracking
- Third-party analytics that profile users (we use Vercel Analytics, which is privacy-respecting and does not use cookies)

You can clear all cookies by clearing your browser data. The Services will continue to function — you'll just need to re-set your theme and re-accept the ToS on next connect.

## 8. Children

The Services are not directed at children under 18. We do not knowingly collect personal information from anyone under 18. If we discover we have collected information from a child, we delete it immediately. Parents who believe their child has provided information to us can contact `privacy@solanaoilfactory.xyz`.

## 9. International Users

Sol Oil Factory operates from Nigeria, with data processed across servers in multiple regions (US, EU, Asia depending on the service provider). By using the Services, you consent to the transfer of your data to and processing in any of these regions, subject to the safeguards in this Privacy Policy.

If you're in a jurisdiction with stricter data protection laws (EU under GDPR, UK under UK-GDPR, California under CCPA, etc.), you have additional rights as listed above. We honor those rights regardless of where Sol Oil Factory is technically incorporated.

## 10. Changes

We may update this Privacy Policy at any time. Updates take effect when posted at solanaoilfactory.xyz/legal/privacy with an updated "Last updated" date.

For material changes, we will (a) post a notice on the homepage for 30 days, and (b) re-prompt the ToS modal on next wallet connect (the modal also covers Privacy Policy acceptance).

## 11. Contact

For privacy-related questions, requests, or complaints:

- Email: `privacy@solanaoilfactory.xyz`
- For GDPR-specific requests: `privacy@solanaoilfactory.xyz` with subject line "GDPR Request"
- For CCPA-specific requests: `privacy@solanaoilfactory.xyz` with subject line "CCPA Request"

If you don't receive a satisfactory response, you may contact your local data protection authority.

---

## Document end

**Total length:** ~1,800 lines combined ToS + Privacy Policy
**Status:** Draft for legal review before mainnet
**Recommended attorney type:** Crypto-savvy commercial attorney with experience in Cayman/BVI structures and US securities regulation

This document should be reviewed by counsel for:
- Specific arbitration provider selection (JAMS / AAA / LCIA)
- Final governing-law selection (Cayman / Delaware / other)
- Refinement of geographic restrictions (specific OFAC list inclusions)
- State-specific privacy law compliance beyond CCPA (CO, VA, etc.)
- Tax disclosure language if any (currently not addressed)
- Final verification of indemnification scope

---

## Addendum — Backend-Surfaced Coverage (v1.1)

Cross-checked against backend program contract. Adds language to clarify several user-facing edge cases that the frontend must surface.

## Section to be added to Terms of Service

### Section 8.5 — Service Availability and Indexer Reliance

Sol Oil Factory uses an off-chain indexer service to:
- Compute merkle proofs for token holders to claim rewards
- Aggregate refinery data for browsing and search
- Track wallet reputation and history
- Provide real-time activity feeds

This indexer service is provided on a best-effort basis and may experience:
- **Service degradation** — slower-than-normal response times, indexer lag exceeding 5 minutes
- **Temporary unavailability** — indexer down, claim proofs unavailable
- **Rate limiting** — temporary throttling during high-traffic periods

You acknowledge that:
1. During service degradation or unavailability, you may be unable to claim rewards even though you are eligible on-chain.
2. The on-chain Anchor program operates independently of our indexer; on-chain state remains accurate even when our service is unavailable.
3. We do not guarantee uptime, response time, or data freshness for the indexer or any frontend service.
4. We are not liable for missed claims, missed claim windows, or other losses resulting from service issues.

If you are unable to claim during a service issue, your eligibility persists until the claim window closes (or indefinitely for open-ended refineries). You can attempt to claim again once service is restored.

For real-time chain data independent of our service, you can verify all on-chain state directly via:
- Solscan: `https://solscan.io/account/<refinery>?cluster=devnet`
- Solana Explorer: `https://explorer.solana.com/?cluster=devnet`
- Direct RPC calls to any Solana node

### Section 8.6 — Token Account Creation Costs

Some claim operations require creating an Associated Token Account (ATA) for the token you are claiming. This creation:
- Costs approximately 0.002 SOL in rent (paid by you, the holder)
- Is bundled into the same transaction as your claim
- Is refundable when you close the account (after transferring out all tokens)

You acknowledge:
1. The ATA rent is paid by you, not Sol Oil Factory.
2. The rent is held by the Solana network, not by Sol Oil Factory.
3. You may recover this rent by closing the token account when you no longer hold the token.
4. If a claim transaction fails after partial setup, you may have created an empty ATA and incurred the rent cost without receiving tokens.

### Section 8.7 — Token-2022 Transfer Fees

Some tokens distributed through Sol Oil Factory implement the Token-2022 TransferFee extension. For these tokens:
- A percentage of each transfer is automatically deducted by the token program
- This fee goes to the token's designated fee receiver, not to Sol Oil Factory
- The amount displayed before claim shows the pre-fee distribution amount
- The amount you actually receive will be lower by the transfer fee percentage

You acknowledge:
1. Transfer fees are set by the token's project team, not by Sol Oil Factory.
2. You receive less than the displayed amount when claiming a token with active transfer fees.
3. Sol Oil Factory accurately discloses transfer fees in claim flows when present.
4. We are not responsible for transfer fees or how they are distributed.

### Section 8.8 — Frozen Token Accounts

Some tokens have an active "freeze authority" that allows the token's project team to freeze any holder's token account. If your token account is frozen:
- You cannot receive transfers (including Sol Oil Factory claims)
- The freeze can only be lifted by the token's freeze authority
- Sol Oil Factory cannot unfreeze accounts

You acknowledge:
1. Freeze authority is a token-level feature controlled by the token's project team, not Sol Oil Factory.
2. If your account is frozen, you must contact the token project to thaw it.
3. Sol Oil Factory will display warnings about active freeze authorities at refinery launch and in token risk badges.
4. We are not liable for losses resulting from frozen accounts.

### Section 8.9 — Refinery Rule Changes (Epoch Advancement)

Refinery operators can advance their refinery to a new "epoch" with updated parameters:
- Per-claim cap (the maximum percentage of pool one wallet can claim per snapshot)
- Pool-empty strategy (pro-rata or first-come-first-served)
- Snapshot strategy (frequency of new merkle root submissions)
- Claim window extension

When an operator advances the epoch:
- Existing claim receipts from prior epochs remain valid
- Future claims must reference a snapshot of the new epoch
- The new rules apply to all future claims

You acknowledge:
1. Operators can change refinery rules unilaterally at any time before the refinery is closed.
2. Sol Oil Factory will display banners and activity entries when epoch changes occur.
3. Reviewing rule changes is your responsibility before claiming.

### Section 8.10 — Network and Cluster

Sol Oil Factory currently operates on Solana **devnet** for testing. Mainnet launch is gated on:
- Smart contract audit completion
- Bug bounty program activation at $50K+ tier
- Solana Foundation audit grant submission
- Multisig configuration for upgrade authority

You acknowledge:
1. **Devnet tokens have no real-world value.** All transactions on devnet are for testing purposes only.
2. The mainnet program will be a separate deployment with a different program ID.
3. Refineries created on devnet will not transfer to mainnet.
4. We will provide clear notice before any mainnet launch.

External links to Solscan, Birdeye, etc. include cluster parameters to ensure you view the correct network's data.

## Section to be added to Privacy Policy

### Section 4.5 — Service Performance and Telemetry

To maintain service quality, we collect aggregate metrics:
- Indexer lag (how far behind chain we are)
- API response times
- Error rates and types (without identifying individual users)
- Page load performance

This data:
- Is aggregated, not personally identifiable
- Is used only to monitor and improve service performance
- May be shared with our infrastructure providers (Helius, Supabase, Vercel) under their respective terms

We may display service status (degraded/operational) on `/trust` and via in-app banners using this aggregate data.

### Section 4.6 — Wallet Account State

We do not control or have visibility into:
- Whether your token account is frozen
- Whether your wallet has been blocklisted by token programs
- Whether you've been added to or removed from a token's freeze authority's list
- Any other state controlled by external token programs

If your account is frozen, the freeze is a property of your wallet on the Solana network, not data we hold.

