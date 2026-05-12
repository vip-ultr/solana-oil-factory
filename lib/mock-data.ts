/**
 * Solana Oil Factory — mock data master reference.
 *
 * The single source of truth for every screen during the design phase.
 * Every page that displays a refinery, wallet, claim, or leaderboard
 * row should pull from this module so the data stays consistent
 * across surfaces.
 *
 * Source: `docs2/04-page-specifications.md` "Mock Data Master Reference"
 * + `docs2/05-design-prompt.md` mock tables. Verbatim — do not edit
 * values without updating both docs.
 *
 * When the indexer (Phase 2) goes live, swap each `getMockX()` call
 * for the real fetch. Keep the same shapes.
 */

// ── Token & operator types ───────────────────────────────────

export type RefineryStatus = "active" | "closingSoon" | "operatorPaused" | "closed" | "pendingSnapshot";
export type SnapshotStrategy = "atLaunch" | "hourly" | "daily" | "weekly" | "perEpochOnly";
export type PoolEmptyStrategy = "proRata" | "fcfs";
export type VerificationTier = "verifiedDeployer" | "verifiedCto" | "unverified";
export type ReputationTier = "excellent" | "good" | "neutral" | "risky" | "flagged";

export type TokenMarkVariant =
  | "bonk" | "jup" | "wif" | "pop" | "pyth" | "jto"
  | "mother" | "mew" | "ray" | "orca" | "mnde" | "giga"
  | "default";

export interface Refinery {
  id: string;                       // refinery PDA (full base58)
  rank: number;                     // index 1-12
  tokenName: string;
  tokenSymbol: string;
  tokenMint: string;                // truncated for display: "DezX5p…AKKM"
  tokenMintFull?: string;           // full base58 mint (live data only)
  tokenMarkVariant: TokenMarkVariant;
  logoUrl?: string | null;          // resolved Metaplex JSON image URL (live)
  operator: string;                 // truncated wallet: "Hxk2…7gPZ"
  operatorFull?: string;            // full base58 (live data only)
  currentSnapshotIndex?: number;    // 0 when no snapshot yet (live data only)
  operatorReputation: number;       // 0-100
  verification: VerificationTier;
  poolInitial: number;              // base units (display via formatTokens)
  poolRemaining: number;            // base units
  poolUsd: number;
  poolRemainingUsd: number;
  holdersEligible: number;
  holdersClaimed: number;
  claimRatePer1Pct: number;         // tokens per 1% of supply held
  snapshotStrategy: SnapshotStrategy;
  snapshotAgeSeconds: number;
  poolEmptyStrategy: PoolEmptyStrategy;
  perClaimCapBps: number;
  claimWindowDaysLeft: number | null; // null = open-ended
  claimWindowEndIso?: string | null;
  status: RefineryStatus;
  hasTransferFee?: boolean;
  transferFeeBps?: number;
  riskFlags: ("mintable" | "freezeAuthority" | "concentrated" | "lowLiquidity" | "transferFee")[];
  launchedAtIso: string;
}

export const MOCK_REFINERIES: Refinery[] = [
  {
    id: "ref-bonk",
    rank: 1,
    tokenName: "Bonk",
    tokenSymbol: "BONK",
    tokenMint: "DezX5p…AKKM",
    tokenMarkVariant: "bonk",
    operator: "Hxk2…7gPZ",
    operatorReputation: 84,
    verification: "verifiedDeployer",
    poolInitial: 1_200_000,
    poolRemaining: 744_000,
    poolUsd: 4_820,
    poolRemainingUsd: 2_990,
    holdersEligible: 1_247,
    holdersClaimed: 240,
    claimRatePer1Pct: 12_000,
    snapshotStrategy: "atLaunch",
    snapshotAgeSeconds: 4 * 3600,
    poolEmptyStrategy: "proRata",
    perClaimCapBps: 500,
    claimWindowDaysLeft: 27,
    status: "active",
    riskFlags: [],
    launchedAtIso: "2026-05-09T14:32:00Z",
  },
  {
    id: "ref-jup",
    rank: 2,
    tokenName: "Jupiter",
    tokenSymbol: "JUP",
    tokenMint: "JUPyiW…dpvS",
    tokenMarkVariant: "jup",
    operator: "4Bsd…91jU",
    operatorReputation: 67,
    verification: "verifiedDeployer",
    poolInitial: 8_400,
    poolRemaining: 7_200,
    poolUsd: 6_720,
    poolRemainingUsd: 5_760,
    holdersEligible: 2_143,
    holdersClaimed: 1_820,
    claimRatePer1Pct: 84,
    snapshotStrategy: "daily",
    snapshotAgeSeconds: 30 * 60,
    poolEmptyStrategy: "proRata",
    perClaimCapBps: 500,
    claimWindowDaysLeft: 12,
    status: "active",
    riskFlags: [],
    launchedAtIso: "2026-04-28T10:00:00Z",
  },
  {
    id: "ref-wif",
    rank: 3,
    tokenName: "dogwifhat",
    tokenSymbol: "WIF",
    tokenMint: "EKpQHm…WFkW",
    tokenMarkVariant: "wif",
    operator: "9wF7…3Lz8",
    operatorReputation: 51,
    verification: "verifiedCto",
    poolInitial: 84_000,
    poolRemaining: 38_400,
    poolUsd: 168_000,
    poolRemainingUsd: 76_800,
    holdersEligible: 8_920,
    holdersClaimed: 4_482,
    claimRatePer1Pct: 840,
    snapshotStrategy: "atLaunch",
    snapshotAgeSeconds: 22 * 3600,
    poolEmptyStrategy: "proRata",
    perClaimCapBps: 300,
    claimWindowDaysLeft: 18,
    status: "active",
    riskFlags: [],
    launchedAtIso: "2026-04-22T08:00:00Z",
  },
  {
    id: "ref-popcat",
    rank: 4,
    tokenName: "Popcat",
    tokenSymbol: "POPCAT",
    tokenMint: "7GCihg…W5cy",
    tokenMarkVariant: "pop",
    operator: "2zKp…hH4M",
    operatorReputation: 42,
    verification: "unverified",
    poolInitial: 142_000,
    poolRemaining: 89_600,
    poolUsd: 85_200,
    poolRemainingUsd: 53_760,
    holdersEligible: 4_506,
    holdersClaimed: 1_640,
    claimRatePer1Pct: 1_420,
    snapshotStrategy: "hourly",
    snapshotAgeSeconds: 12 * 60,
    poolEmptyStrategy: "fcfs",
    perClaimCapBps: 800,
    claimWindowDaysLeft: 8,
    status: "active",
    riskFlags: ["mintable"],
    launchedAtIso: "2026-04-30T16:00:00Z",
  },
  {
    id: "ref-pyth",
    rank: 5,
    tokenName: "Pyth",
    tokenSymbol: "PYTH",
    tokenMint: "HZ1JqV…3pH3",
    tokenMarkVariant: "pyth",
    operator: "Pyth9…D7ax",
    operatorReputation: 68,
    verification: "verifiedDeployer",
    poolInitial: 41_000,
    poolRemaining: 8_200,
    poolUsd: 14_350,
    poolRemainingUsd: 2_870,
    holdersEligible: 6_201,
    holdersClaimed: 5_414,
    claimRatePer1Pct: 410,
    snapshotStrategy: "weekly",
    snapshotAgeSeconds: 4 * 3600,
    poolEmptyStrategy: "proRata",
    perClaimCapBps: 500,
    claimWindowDaysLeft: 1,
    status: "closingSoon",
    riskFlags: [],
    launchedAtIso: "2026-04-10T12:00:00Z",
  },
  {
    id: "ref-jto",
    rank: 6,
    tokenName: "Jito",
    tokenSymbol: "JTO",
    tokenMint: "jtojto…1zb",
    tokenMarkVariant: "jto",
    operator: "5jVq…78dM",
    operatorReputation: 73,
    verification: "verifiedDeployer",
    poolInitial: 12_500,
    poolRemaining: 8_125,
    poolUsd: 28_750,
    poolRemainingUsd: 18_688,
    holdersEligible: 3_847,
    holdersClaimed: 1_340,
    claimRatePer1Pct: 125,
    snapshotStrategy: "atLaunch",
    snapshotAgeSeconds: 6 * 3600,
    poolEmptyStrategy: "proRata",
    perClaimCapBps: 500,
    claimWindowDaysLeft: 22,
    status: "active",
    riskFlags: [],
    launchedAtIso: "2026-05-02T11:00:00Z",
  },
  {
    id: "ref-mother",
    rank: 7,
    tokenName: "Mother Iggy",
    tokenSymbol: "MOTHER",
    tokenMint: "3S8qG…iyDM",
    tokenMarkVariant: "mother",
    operator: "8zZb…3Ksn",
    operatorReputation: 21,
    verification: "unverified",
    poolInitial: 510_000,
    poolRemaining: 412_500,
    poolUsd: 1_840,
    poolRemainingUsd: 1_488,
    holdersEligible: 1_128,
    holdersClaimed: 380,
    claimRatePer1Pct: 5_100,
    snapshotStrategy: "daily",
    snapshotAgeSeconds: 90 * 60,
    poolEmptyStrategy: "proRata",
    perClaimCapBps: 1_000,
    claimWindowDaysLeft: 14,
    status: "active",
    riskFlags: ["concentrated"],
    launchedAtIso: "2026-04-26T20:00:00Z",
  },
  {
    id: "ref-mew",
    rank: 8,
    tokenName: "MEW",
    tokenSymbol: "MEW",
    tokenMint: "MEW1g…tmZA",
    tokenMarkVariant: "mew",
    operator: "6FdN…XnQ2",
    operatorReputation: 55,
    verification: "unverified",
    poolInitial: 48_000_000,
    poolRemaining: 31_200_000,
    poolUsd: 240,
    poolRemainingUsd: 156,
    holdersEligible: 22_144,
    holdersClaimed: 7_320,
    claimRatePer1Pct: 480_000,
    snapshotStrategy: "atLaunch",
    snapshotAgeSeconds: 8 * 3600,
    poolEmptyStrategy: "fcfs",
    perClaimCapBps: 200,
    claimWindowDaysLeft: 30,
    status: "active",
    hasTransferFee: true,
    transferFeeBps: 100,
    riskFlags: ["transferFee"],
    launchedAtIso: "2026-05-01T09:00:00Z",
  },
  {
    id: "ref-ray",
    rank: 9,
    tokenName: "Raydium",
    tokenSymbol: "RAY",
    tokenMint: "4k3Dy…mq56",
    tokenMarkVariant: "ray",
    operator: "RayLi…D9pT",
    operatorReputation: 71,
    verification: "verifiedDeployer",
    poolInitial: 6_200,
    poolRemaining: 4_960,
    poolUsd: 14_200,
    poolRemainingUsd: 11_360,
    holdersEligible: 4_891,
    holdersClaimed: 1_450,
    claimRatePer1Pct: 62,
    snapshotStrategy: "daily",
    snapshotAgeSeconds: 2 * 3600,
    poolEmptyStrategy: "proRata",
    perClaimCapBps: 500,
    claimWindowDaysLeft: 21,
    status: "active",
    riskFlags: [],
    launchedAtIso: "2026-04-29T14:00:00Z",
  },
  {
    id: "ref-orca",
    rank: 10,
    tokenName: "Orca",
    tokenSymbol: "ORCA",
    tokenMint: "orcaE…Fnq3",
    tokenMarkVariant: "orca",
    operator: "OrcaT…D7vM",
    operatorReputation: 64,
    verification: "verifiedDeployer",
    poolInitial: 9_400,
    poolRemaining: 5_640,
    poolUsd: 23_500,
    poolRemainingUsd: 14_100,
    holdersEligible: 3_012,
    holdersClaimed: 1_206,
    claimRatePer1Pct: 94,
    snapshotStrategy: "atLaunch",
    snapshotAgeSeconds: 16 * 3600,
    poolEmptyStrategy: "proRata",
    perClaimCapBps: 500,
    claimWindowDaysLeft: 19,
    status: "active",
    riskFlags: [],
    launchedAtIso: "2026-04-27T18:00:00Z",
  },
  {
    id: "ref-mnde",
    rank: 11,
    tokenName: "Marinade",
    tokenSymbol: "MNDE",
    tokenMint: "MNDEF…YFu8",
    tokenMarkVariant: "mnde",
    operator: "MndS…DwY3",
    operatorReputation: 62,
    verification: "verifiedDeployer",
    poolInitial: 55_000,
    poolRemaining: 38_500,
    poolUsd: 8_250,
    poolRemainingUsd: 5_775,
    holdersEligible: 7_820,
    holdersClaimed: 2_320,
    claimRatePer1Pct: 550,
    snapshotStrategy: "weekly",
    snapshotAgeSeconds: 36 * 3600,
    poolEmptyStrategy: "proRata",
    perClaimCapBps: 500,
    claimWindowDaysLeft: 25,
    status: "active",
    riskFlags: [],
    launchedAtIso: "2026-04-25T15:00:00Z",
  },
  {
    id: "ref-giga",
    rank: 12,
    tokenName: "GIGACHAD",
    tokenSymbol: "GIGA",
    tokenMint: "63LfDmN…3eQy",
    tokenMarkVariant: "giga",
    operator: "7HpZ…44tL",
    operatorReputation: 8,
    verification: "unverified",
    poolInitial: 22_000_000,
    poolRemaining: 0,
    poolUsd: 820,
    poolRemainingUsd: 0,
    holdersEligible: 14_302,
    holdersClaimed: 14_302,
    claimRatePer1Pct: 220_000,
    snapshotStrategy: "atLaunch",
    snapshotAgeSeconds: 14 * 24 * 3600,
    poolEmptyStrategy: "fcfs",
    perClaimCapBps: 100,
    claimWindowDaysLeft: 0,
    status: "closed",
    riskFlags: ["lowLiquidity"],
    launchedAtIso: "2026-04-15T10:00:00Z",
  },
];

// ── Wallets w/ reputation ───────────────────────────────────

export interface MockWallet {
  address: string;                  // truncated display
  fullAddress: string;              // mock 32-byte (display only — not real)
  reputation: number;               // 0-100
  reputationTier: ReputationTier;
  refineriesClaimed: number;
  avgHoldingDays: number;
  refineriesLaunched: number;
  refineriesLaunchedVerified: boolean;
  clusterFlag: "clean" | { kind: "flagged"; clusterSize: number };
  walletAgeDays: number;
  crudeBalance: number;
  prestige: string;
}

export const MOCK_WALLETS: MockWallet[] = [
  {
    address: "Hxk2…7gPZ",
    fullAddress: "Hxk2pYz8sN9wF73Lz8AKKM7gPZxxxxxxxxxxxxxxxxx",
    reputation: 84,
    reputationTier: "excellent",
    refineriesClaimed: 14,
    avgHoldingDays: 47,
    refineriesLaunched: 2,
    refineriesLaunchedVerified: true,
    clusterFlag: "clean",
    walletAgeDays: 380,
    crudeBalance: 28_400,
    prestige: "Refiner",
  },
  {
    address: "4Bsd…91jU",
    fullAddress: "4BsdYZqV5J3rT8K9mN2pL7vC1bX4hF6sD8gE91jUxxxxx",
    reputation: 67,
    reputationTier: "good",
    refineriesClaimed: 9,
    avgHoldingDays: 23,
    refineriesLaunched: 1,
    refineriesLaunchedVerified: true,
    clusterFlag: "clean",
    walletAgeDays: 220,
    crudeBalance: 24_820,
    prestige: "Refiner",
  },
  {
    address: "9wF7…3Lz8",
    fullAddress: "9wF7K2Y8Z6vR1qN5mB4pL3tD9fH7gC2sE8a3Lz8xxxxx",
    reputation: 51,
    reputationTier: "neutral",
    refineriesClaimed: 22,
    avgHoldingDays: 12,
    refineriesLaunched: 0,
    refineriesLaunchedVerified: false,
    clusterFlag: "clean",
    walletAgeDays: 510,
    crudeBalance: 22_140,
    prestige: "Junior Refiner",
  },
  {
    address: "2zKp…hH4M",
    fullAddress: "2zKpYqV5J3rT8K9mN2pL7vC1bX4hF6sD8gE9hH4Mxxxxx",
    reputation: 42,
    reputationTier: "neutral",
    refineriesClaimed: 6,
    avgHoldingDays: 38,
    refineriesLaunched: 0,
    refineriesLaunchedVerified: false,
    clusterFlag: "clean",
    walletAgeDays: 95,
    crudeBalance: 18_400,
    prestige: "Junior Refiner",
  },
  {
    address: "8zZb…3Ksn",
    fullAddress: "8zZbpYqV5J3rT8K9mN2pL7vC1bX4hF6sD8gE93Ksnxxxx",
    reputation: 21,
    reputationTier: "risky",
    refineriesClaimed: 31,
    avgHoldingDays: 4,
    refineriesLaunched: 0,
    refineriesLaunchedVerified: false,
    clusterFlag: { kind: "flagged", clusterSize: 12 },
    walletAgeDays: 60,
    crudeBalance: 8_200,
    prestige: "Apprentice",
  },
  {
    address: "7HpZ…44tL",
    fullAddress: "7HpZpYqV5J3rT8K9mN2pL7vC1bX4hF6sD8gE944tLxxxx",
    reputation: 8,
    reputationTier: "flagged",
    refineriesClaimed: 47,
    avgHoldingDays: 1,
    refineriesLaunched: 0,
    refineriesLaunchedVerified: false,
    clusterFlag: { kind: "flagged", clusterSize: 38 },
    walletAgeDays: 18,
    crudeBalance: 1_400,
    prestige: "Dry Well",
  },
];

// ── Activity feed ───────────────────────────────────────────

export type ActivityKind =
  | "claim"
  | "claimFiltered"
  | "topUp"
  | "pause"
  | "windowExtended"
  | "launched"
  | "snapshotTaken"
  | "epochAdvanced"
  | "closed";

export interface ActivityEvent {
  id: string;
  wallet: string;
  walletReputationTier?: ReputationTier;
  kind: ActivityKind;
  amount?: number;
  tokenSymbol?: string;
  refinerySymbol?: string;          // for context if action is on a refinery
  detail?: string;
  agoSeconds: number;
}

export const MOCK_ACTIVITY: ActivityEvent[] = [
  { id: "act-1", wallet: "Hxk2…7gPZ", walletReputationTier: "excellent", kind: "claim", amount: 148.8, tokenSymbol: "BONK", agoSeconds: 120 },
  { id: "act-2", wallet: "4Bsd…91jU", walletReputationTier: "good", kind: "claim", amount: 12_000, tokenSymbol: "BONK", agoSeconds: 300 },
  { id: "act-3", wallet: "9wF7…3Lz8", walletReputationTier: "neutral", kind: "claim", amount: 84, tokenSymbol: "JUP", agoSeconds: 480 },
  { id: "act-4", wallet: "2zKp…hH4M", walletReputationTier: "neutral", kind: "claim", amount: 1_420, tokenSymbol: "POPCAT", agoSeconds: 720 },
  { id: "act-5", wallet: "8zZb…3Ksn", walletReputationTier: "risky", kind: "claim", amount: 220_000, tokenSymbol: "GIGA", agoSeconds: 840 },
  { id: "act-6", wallet: "7HpZ…44tL", walletReputationTier: "flagged", kind: "claim", amount: 5_100, tokenSymbol: "MOTHER", agoSeconds: 1140 },
  { id: "act-7", wallet: "6FdN…XnQ2", walletReputationTier: "neutral", kind: "claim", amount: 480_000, tokenSymbol: "MEW", agoSeconds: 1320 },
  { id: "act-8", wallet: "RayLi…D9pT", walletReputationTier: "good", kind: "topUp", amount: 6_200, tokenSymbol: "RAY", refinerySymbol: "RAY", agoSeconds: 2100 },
  { id: "act-9", wallet: "OrcaT…D7vM", walletReputationTier: "good", kind: "pause", refinerySymbol: "ORCA", detail: "operator", agoSeconds: 3600 },
  { id: "act-10", wallet: "MndS…DwY3", walletReputationTier: "good", kind: "windowExtended", refinerySymbol: "MNDE", detail: "+7 days", agoSeconds: 7200 },
  { id: "act-11", wallet: "Hxk2…7gPZ", walletReputationTier: "excellent", kind: "launched", refinerySymbol: "BONK", agoSeconds: 14_400 },
  { id: "act-12", wallet: "Pyth9…D7ax", walletReputationTier: "good", kind: "snapshotTaken", refinerySymbol: "PYTH", detail: "6,201 holders", agoSeconds: 14_400 },
];

// ── Top operators leaderboard (top 5) ───────────────────────

export interface OperatorRow {
  rank: number;
  operator: string;                 // truncated wallet
  reputation: number;
  refineriesOperated: number;
  lifetimeDistributedUsd: number;
  avgClaimerReputation: number;
}

export const MOCK_TOP_OPERATORS: OperatorRow[] = [
  { rank: 1, operator: "RayLi…D9pT", reputation: 71, refineriesOperated: 8, lifetimeDistributedUsd: 284_200, avgClaimerReputation: 71 },
  { rank: 2, operator: "Pyth9…D7ax", reputation: 68, refineriesOperated: 5, lifetimeDistributedUsd: 189_400, avgClaimerReputation: 68 },
  { rank: 3, operator: "OrcaT…D7vM", reputation: 64, refineriesOperated: 12, lifetimeDistributedUsd: 156_800, avgClaimerReputation: 64 },
  { rank: 4, operator: "Hxk2…7gPZ", reputation: 84, refineriesOperated: 2, lifetimeDistributedUsd: 14_820, avgClaimerReputation: 78 },
  { rank: 5, operator: "MndS…DwY3", reputation: 62, refineriesOperated: 4, lifetimeDistributedUsd: 11_200, avgClaimerReputation: 62 },
];

// ── System-wide stats ───────────────────────────────────────

export const MOCK_SYSTEM_STATS = {
  refineriesLaunchedLifetime: 1_840,
  refineriesActive: 247,
  refineriesClosedLast30d: 89,
  walletsVerified: 12_400,
  lifetimeDistributedUsd: 284_200,
  lifetimeClaims: 46_800,
  heliusLatencyP50Ms: 84,
  heliusLatencyP99Ms: 412,
  indexerLagSeconds: 2,
  lastBlockSecondsAgo: 4,
  reputationLastRecomputeHoursAgo: 18,
  reputationWalletsIndexed: 12_400,
  programLastUpgradeDaysAgo: 14,
  currentSlot: 298_442_019,
} as const;

// ── Reputation signal weights ───────────────────────────────

export interface ReputationSignal {
  name: string;
  weightPercent: number;
  description: string;
}

export const REPUTATION_SIGNALS: ReputationSignal[] = [
  { name: "Refineries claimed (recent)", weightPercent: 25, description: "Total successful claims, weighted by recency." },
  { name: "Holding duration before claim", weightPercent: 20, description: "How long the wallet typically holds before claiming." },
  { name: "Post-claim retention", weightPercent: 20, description: "Tokens still held >7 days after you claim them." },
  { name: "Cluster status", weightPercent: 15, description: "Wallets funded by same source share a flagged cluster." },
  { name: "Wallet age", weightPercent: 10, description: "Days of any chain activity. Older = more weight." },
  { name: "Refineries launched (verified)", weightPercent: 10, description: "Refineries operated as Verified deployer or CTO." },
];

// ── Helpers ─────────────────────────────────────────────────

export function reputationTierOf(score: number): ReputationTier {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "neutral";
  if (score >= 20) return "risky";
  return "flagged";
}

const COMPACT_FORMATTER = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const FULL_FORMATTER = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

export function formatTokens(amount: number, opts: { compact?: boolean } = {}): string {
  if (amount === 0) return "0";
  if (opts.compact || Math.abs(amount) >= 100_000) {
    return COMPACT_FORMATTER.format(amount);
  }
  return FULL_FORMATTER.format(amount);
}

export function formatUsd(amount: number): string {
  if (amount === 0) return "$0";
  if (Math.abs(amount) < 1) return `$${amount.toFixed(3)}`;
  if (Math.abs(amount) < 100) return `$${amount.toFixed(2)}`;
  if (Math.abs(amount) >= 1_000_000)
    return `$${COMPACT_FORMATTER.format(amount)}`;
  return `$${FULL_FORMATTER.format(amount)}`;
}

export function formatRelativeTime(secondsAgo: number): string {
  if (secondsAgo < 60) return `${Math.round(secondsAgo)}s ago`;
  if (secondsAgo < 3_600) return `${Math.round(secondsAgo / 60)}m ago`;
  if (secondsAgo < 86_400) return `${Math.round(secondsAgo / 3_600)}h ago`;
  if (secondsAgo < 30 * 86_400)
    return `${Math.round(secondsAgo / 86_400)}d ago`;
  return `${Math.round(secondsAgo / (30 * 86_400))}mo ago`;
}

export function snapshotStrategyLabel(s: SnapshotStrategy): string {
  switch (s) {
    case "atLaunch":
      return "At launch";
    case "hourly":
      return "Hourly";
    case "daily":
      return "Daily";
    case "weekly":
      return "Weekly";
    case "perEpochOnly":
      return "Per epoch";
  }
}

export function statusLabel(s: RefineryStatus): string {
  switch (s) {
    case "active":
      return "Active";
    case "closingSoon":
      return "Closing soon";
    case "operatorPaused":
      return "Paused";
    case "closed":
      return "Closed";
    case "pendingSnapshot":
      return "Pending snapshot";
  }
}
