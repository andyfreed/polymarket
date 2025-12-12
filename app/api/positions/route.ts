import { NextResponse } from "next/server";
import { fetchPolymarketPositions, getDefaultUserAddress } from "@/lib/polymarket";

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
    return NextResponse.json({ user, ...data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
