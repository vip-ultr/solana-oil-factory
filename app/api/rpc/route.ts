import { NextRequest, NextResponse } from "next/server";

const HELIUS_URL = process.env.HELIUS_API_KEY
  ? `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
  : "https://api.mainnet-beta.solana.com";

// Methods the browser legitimately needs (wallet flow, useSolTransfer).
// Anything else 403s — this is a proxy, not a free RPC.
const ALLOWED_METHODS = new Set([
  "getLatestBlockhash",
  "getLatestBlockhashAndContext",
  "sendTransaction",
  "simulateTransaction",
  "getTransaction",
  "getSignatureStatuses",
  "getSignatureStatus",
  "getBalance",
  "getAccountInfo",
  "getMultipleAccounts",
  "getRecentPrioritizationFees",
  "getMinimumBalanceForRentExemption",
  "getFeeForMessage",
  "getSlot",
  "getBlockHeight",
  "getEpochInfo",
  "getVersion",
]);

function checkMethod(body: unknown): string | null {
  const reqs = Array.isArray(body) ? body : [body];
  for (const req of reqs) {
    const method = (req as { method?: unknown })?.method;
    if (typeof method !== "string" || !ALLOWED_METHODS.has(method)) {
      return typeof method === "string" ? method : "<missing>";
    }
  }
  return null;
}

function isAllowedOrigin(request: NextRequest): boolean {
  if (process.env.NODE_ENV !== "production") return true;

  const origin = request.headers.get("origin");
  // Same-origin POSTs may omit Origin; allow when not set.
  if (!origin) return true;

  if (origin === request.nextUrl.origin) return true;

  const allowed = (process.env.RPC_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return allowed.includes(origin);
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const blockedMethod = checkMethod(body);
  if (blockedMethod !== null) {
    return NextResponse.json(
      { error: `Method not allowed via proxy: ${blockedMethod}` },
      { status: 403 }
    );
  }

  try {
    const upstream = await fetch(HELIUS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[/api/rpc] proxy error:", err);
    return NextResponse.json({ error: "RPC proxy failed" }, { status: 502 });
  }
}
