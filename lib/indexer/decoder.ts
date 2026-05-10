// Decode anchor `emit!()` log lines into typed events.
//
// Anchor encodes program emits as "Program data: <base64>" log
// messages, where the decoded base64 = 8-byte event discriminator
// + borsh-serialized event struct. anchor's BorshEventCoder reads
// the IDL and routes by discriminator, so we just feed it the log.

import { BN, BorshEventCoder } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import idl from "@/lib/onchain/refinery-idl.json";
import type { Refinery as RefineryIdl } from "@/lib/onchain/refinery-idl-types";
import type { EventName, IndexedEvent } from "./types";

const PROGRAM_DATA_PREFIX = "Program data: ";

// BorshEventCoder is RPC-free — it just reads the IDL's event
// list and routes by 8-byte discriminator. We can use it from
// any context (Node script, server component, edge runtime).
const eventCoder = new BorshEventCoder(idl as unknown as RefineryIdl);

/**
 * Returns null if the line isn't an anchor program-data log or
 * doesn't decode to a known event. Otherwise returns the event
 * name + a JSON-safe field map (pubkeys → base58, BNs → decimal
 * strings, byte arrays → hex strings).
 */
export function decodeEventLog(
  logLine: string,
): { name: EventName; data: Record<string, unknown> } | null {
  if (!logLine.startsWith(PROGRAM_DATA_PREFIX)) return null;
  const b64 = logLine.slice(PROGRAM_DATA_PREFIX.length).trim();
  if (!b64) return null;

  try {
    const decoded = eventCoder.decode(b64);
    if (!decoded) return null;
    return {
      name: decoded.name as EventName,
      data: serialiseFields(decoded.data),
    };
  } catch {
    // Not all "Program data:" logs are events from our program —
    // CPI-emit'd logs from other programs occasionally show up.
    // Silent skip is the right behaviour.
    return null;
  }
}

/**
 * Pull every event from a confirmed transaction's logMessages.
 * Returns ordered events with a logIndex matching their position
 * in the log stream — that's what makes them stable IDs.
 */
export function decodeTransactionEvents(
  signature: string,
  slot: number,
  blockTime: number | null,
  logMessages: string[],
): IndexedEvent[] {
  const out: IndexedEvent[] = [];
  for (let i = 0; i < logMessages.length; i++) {
    const ev = decodeEventLog(logMessages[i]);
    if (!ev) continue;
    const { refinery, wallet } = primaryActorsFor(ev.name, ev.data);
    out.push({
      signature,
      logIndex: i,
      slot,
      blockTime,
      eventName: ev.name,
      data: ev.data,
      refinery,
      wallet,
    });
  }
  return out;
}

/**
 * Recursively normalise anchor's deserialised values into JSON
 * primitives. Anchor returns PublicKey instances, BN instances,
 * and Uint8Array for [u8; N] arrays. We string-ify them so the
 * JSON file is stable across re-runs and trivially comparable.
 */
function serialiseFields(value: unknown): any {
  if (value === null || value === undefined) return value;
  if (value instanceof PublicKey) return value.toBase58();
  if (value instanceof BN) return value.toString();
  if (value instanceof Uint8Array) return Buffer.from(value).toString("hex");
  if (Array.isArray(value)) return value.map(serialiseFields);
  if (typeof value === "object") {
    const obj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      obj[k] = serialiseFields(v);
    }
    return obj;
  }
  return value;
}

/**
 * Decide which fields of an event count as the "refinery" + the
 * "primary actor wallet" — those become the fast-filter columns
 * in the events JSON. Mapping is per-event-name.
 *
 * Conventions:
 *   - refinery  = the Refinery PDA the event mutates, when there is one
 *   - wallet    = the human-relevant actor:
 *                   ClaimMade → holder
 *                   RefineryDeposit/OperatorWithdraw → operator
 *                   RefineryLaunched → operator
 *                   PlatformPauseToggled → by
 *                   ...
 */
function primaryActorsFor(
  name: EventName,
  data: Record<string, unknown>,
): { refinery: string | null; wallet: string | null } {
  const get = (k: string): string | null =>
    typeof data[k] === "string" ? (data[k] as string) : null;

  switch (name) {
    case "RefineryLaunched":
      return { refinery: get("refinery"), wallet: get("operator") };
    case "RefineryDeposit":
    case "OperatorWithdraw":
    case "RefineryClosed":
    case "EpochAdvanced":
      return { refinery: get("refinery"), wallet: get("operator") };
    case "ClaimMade":
      return { refinery: get("refinery"), wallet: get("holder") };
    case "RefineryPauseToggled":
    case "VerifiedCtoAssigned":
    case "SnapshotSubmitted":
      return { refinery: get("refinery"), wallet: get("by") ?? get("operator") };
    case "TreasuryInitialized":
      return { refinery: null, wallet: get("admin") };
    case "PlatformPauseToggled":
    case "AuthorityRotated":
      return { refinery: null, wallet: get("by") ?? get("previous") };
    default:
      return { refinery: null, wallet: null };
  }
}
