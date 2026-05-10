// Live treasury_config — fetched from devnet on-demand.

import { getProgram, treasuryConfigPda } from "./client";

export interface TreasuryConfig {
  admin: string;
  snapshotAuthority: string;
  pauseAuthority: string;
  feeReceiverSol: string;
  treasurySwapPda: string;
  launchFeeLamports: number;
  claimFeeLamports: number;
  depositFeeBps: number;
  paused: boolean;
  refineriesLaunchedCount: number;
  createdAtUnix: number;
}

/**
 * Fetch the platform treasury config. Returns null when the
 * program is deployed but treasury_config hasn't been initialised
 * (the one-shot init_treasury hasn't run on this cluster yet).
 */
export async function fetchTreasuryConfig(): Promise<TreasuryConfig | null> {
  const program = getProgram();
  const pda = treasuryConfigPda();
  try {
    const cfg = await program.account.treasuryConfig.fetch(pda);
    return {
      admin: cfg.admin.toBase58(),
      snapshotAuthority: cfg.snapshotAuthority.toBase58(),
      pauseAuthority: cfg.pauseAuthority.toBase58(),
      feeReceiverSol: cfg.feeReceiverSol.toBase58(),
      treasurySwapPda: cfg.treasurySwapPda.toBase58(),
      launchFeeLamports: cfg.launchFeeLamports.toNumber(),
      claimFeeLamports: cfg.claimFeeLamports.toNumber(),
      depositFeeBps: cfg.depositFeeBps,
      paused: cfg.paused,
      refineriesLaunchedCount: cfg.refineriesLaunchedCount.toNumber(),
      createdAtUnix: cfg.createdAt.toNumber(),
    };
  } catch {
    return null;
  }
}
