// Indexer event shape — what gets persisted in lib/indexer/events.json.
//
// We don't try to keep typed-per-event variants in TS — the
// decoder produces a discriminated-union-like (event_name + data)
// and consumers narrow by event_name. Keeps the JSON schema
// stable when new events are added on-chain.

export type EventName =
  | "AuthorityRotated"
  | "ClaimMade"
  | "EpochAdvanced"
  | "OperatorWithdraw"
  | "PlatformPauseToggled"
  | "RefineryClosed"
  | "RefineryDeposit"
  | "RefineryLaunched"
  | "RefineryPauseToggled"
  | "SnapshotSubmitted"
  | "TreasuryInitialized"
  | "VerifiedCtoAssigned";

export interface IndexedEvent {
  signature: string;
  /** Position of this event log within the transaction. */
  logIndex: number;
  slot: number;
  /** Unix seconds — null if the RPC didn't include block time. */
  blockTime: number | null;
  eventName: EventName;
  /** Decoded fields. Pubkeys are base58 strings, BNs are decimal strings. */
  data: Record<string, unknown>;
  /** The refinery PDA most relevant to this event (null when not refinery-scoped). */
  refinery: string | null;
  /** Primary actor — holder for ClaimMade, operator for refinery ops, etc. */
  wallet: string | null;
}

export interface IndexerCursor {
  programId: string;
  /** Last successfully indexed signature; resume point for the next run. */
  lastSignature: string | null;
  /** Slot of `lastSignature`, for diagnostics + loop progress display. */
  lastSlot: number | null;
  /** ISO timestamp of the last indexer run. */
  updatedAt: string;
}

export interface IndexerSnapshot {
  cursor: IndexerCursor;
  events: IndexedEvent[];
}
