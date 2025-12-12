import { NextResponse } from "next/server";
import { fetchPolymarketPositions, getDefaultUserAddress } from "@/lib/polymarket";

function normalizePositions(payload: unknown): unknown[] {
  if (!payload || typeof payload !== "object") return [];

  // Common shapes: { positions: [] } or { data: [] }
  const anyPayload = payload as Record<string, unknown>;
  if (Array.isArray(anyPayload.positions)) return anyPayload.positions;
  if (Array.isArray(anyPayload.data)) return anyPayload.data;

  // Observed Polymarket shape: { "0": {...}, "1": {...}, ..., user: "0x..." }
  const numericKeys = Object.keys(anyPayload).filter((k) => /^\d+$/.test(k));
  if (!numericKeys.length) return [];

  numericKeys.sort((a, b) => Number(a) - Number(b));
  return numericKeys.map((k) => anyPayload[k]).filter((v) => v && typeof v === "object");
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const user = url.searchParams.get("user") || url.searchParams.get("address") || getDefaultUserAddress();

  if (!user) {
    return NextResponse.json(
      {
        error: "Missing wallet address. Provide ?user=0x... or set POLYMARKET_USER_ADDRESS.",
      },
      { status: 400 }
    );
  }

  try {
    const data = await fetchPolymarketPositions(user);
    const positions = normalizePositions(data);
    return NextResponse.json({ user, positions, raw: data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
