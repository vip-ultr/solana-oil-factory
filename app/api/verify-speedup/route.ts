import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const HELIUS_URL = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;
const SPEEDUP_RECIPIENT = "DfUAhLYZ2n8XNv2rPZHtyQde6wf8A99KMiqsbSjqF3b4";
const SPEEDUP_LAMPORTS = 2_000_000; // 0.002 SOL

/**
 * POST /api/verify-speedup
 * Body: { wallet: string, signature: string }
 *
 * Verifies a SOL payment on-chain, then instantly completes the active refine.
 *
 * Security checks:
 * 1. Transaction exists and is confirmed
 * 2. Sender === user wallet
 * 3. Recipient === SPEEDUP_RECIPIENT
 * 4. Amount === exactly 2,000,000 lamports
 * 5. Signature not already used (replay prevention)
 * 6. Active unclaimed refine exists for this wallet
 */
export async function POST(request: NextRequest) {
  let body: { wallet?: string; signature?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { wallet, signature } = body;

  if (!wallet || !signature) {
    return NextResponse.json(
      { error: "wallet and signature are required" },
      { status: 400 }
    );
  }

  // 1. Check for active unclaimed refine
  const { data: refine, error: fetchErr } = await supabase
    .from("refines")
    .select("id, is_completed, claimed, speedup_used, tx_signature")
    .eq("wallet_address", wallet)
    .eq("claimed", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (fetchErr || !refine) {
    return NextResponse.json(
      { error: "No active refine found for this wallet" },
      { status: 400 }
    );
  }

  // Already completed (timer elapsed or already sped up)
  if (refine.is_completed || refine.speedup_used) {
    return NextResponse.json(
      { error: "Refine is already completed" },
      { status: 400 }
    );
  }

  // 2. Check signature not already used (replay prevention)
  const { data: existingTx } = await supabase
    .from("refines")
    .select("id")
    .eq("tx_signature", signature)
    .limit(1)
    .single();

  if (existingTx) {
    return NextResponse.json(
      { error: "This transaction has already been used" },
      { status: 400 }
    );
  }

  // 3. Fetch transaction from Helius RPC
  let txData: {
    meta: {
      err: unknown;
      preBalances: number[];
      postBalances: number[];
    };
    transaction: {
      message: {
        // Legacy txs: string[].  V0 txs with encoding:"json": {pubkey,signer,writable}[]
        accountKeys: (string | { pubkey: string })[];
      };
    };
  };

  try {
    const rpcRes = await fetch(HELIUS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "verify-speedup",
        method: "getTransaction",
        params: [
          signature,
          {
            encoding: "json",
            maxSupportedTransactionVersion: 0,
            commitment: "confirmed",
          },
        ],
      }),
    });

    const rpcJson = await rpcRes.json();

    if (!rpcJson.result) {
      return NextResponse.json(
        { error: "Transaction not found or not yet confirmed. Please wait and try again." },
        { status: 400 }
      );
    }

    txData = rpcJson.result;
  } catch (err) {
    console.error("[verify-speedup] RPC fetch error:", err);
    return NextResponse.json(
      { error: "Failed to verify transaction on-chain" },
      { status: 500 }
    );
  }

  // 4. Verify transaction is successful
  if (txData.meta.err !== null) {
    return NextResponse.json(
      { error: "Transaction failed on-chain" },
      { status: 400 }
    );
  }

  // 5. Verify sender === user wallet
  // accountKeys can be string[] (legacy tx) or {pubkey:string}[] (v0 tx with encoding:"json")
  const rawKeys = txData.transaction.message.accountKeys as (string | { pubkey: string })[];
  const toKeyStr = (k: string | { pubkey: string }): string =>
    typeof k === "string" ? k : k.pubkey;

  const sender = toKeyStr(rawKeys[0]);

  if (sender !== wallet) {
    return NextResponse.json(
      { error: "Transaction sender does not match wallet" },
      { status: 400 }
    );
  }

  // 6. Verify recipient and amount
  // Find the recipient index in accountKeys
  const recipientIndex = rawKeys.findIndex((k) => toKeyStr(k) === SPEEDUP_RECIPIENT);

  if (recipientIndex === -1) {
    return NextResponse.json(
      { error: "Payment recipient not found in transaction" },
      { status: 400 }
    );
  }

  // Check amount via balance diff on recipient
  const preBalance = txData.meta.preBalances[recipientIndex];
  const postBalance = txData.meta.postBalances[recipientIndex];
  const received = postBalance - preBalance;

  if (received !== SPEEDUP_LAMPORTS) {
    return NextResponse.json(
      { error: `Invalid payment amount. Expected ${SPEEDUP_LAMPORTS} lamports, got ${received}` },
      { status: 400 }
    );
  }

  // 7. All checks passed — complete the refine instantly
  const { error: updateErr } = await supabase
    .from("refines")
    .update({
      is_completed: true,
      ends_at: new Date().toISOString(),
      speedup_used: true,
      tx_signature: signature,
    })
    .eq("id", refine.id);

  if (updateErr) {
    console.error("[verify-speedup] update error:", updateErr.message);
    return NextResponse.json(
      { error: "Failed to update refine status" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
