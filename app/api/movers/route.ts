import { NextResponse } from "next/server";
import type { GammaMarket } from "@/lib/polymarket";
import { fetchGammaMarkets } from "@/lib/polymarket";

type Mover = {
  id?: string;
  title: string;
  slug?: string;
  icon?: string;
  price: number | null;
  change24h: number | null;
  percentChange24h: number | null;
  volume24hr: number | null;
};

function toNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() && Number.isFinite(Number(v))) return Number(v);
  return null;
}

function marketTitle(m: GammaMarket): string {
  return (typeof m.question === "string" && m.question.trim())
    ? m.question
    : (typeof m.title === "string" && m.title.trim())
      ? m.title
      : "(unknown)";
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? "10"), 1), 50);
  const minVolume = Number(url.searchParams.get("minVolume") ?? "1000");

  try {
    // Pull a reasonable slice and compute movers locally.
    const markets = await fetchGammaMarkets({ limit: 250, active: true, closed: false });

    const movers = markets
      .map((m): Mover => {
        const price = toNumber(m.lastTradePrice);
        const change = toNumber(m.oneDayPriceChange);
        const vol = toNumber(m.volume24hr);

        // percent = change / (price - change)
        const prev = price != null && change != null ? price - change : null;
        const pct = prev != null && prev !== 0 && change != null ? change / prev : null;

        return {
          id: m.id,
          title: marketTitle(m),
          slug: typeof m.slug === "string" ? m.slug : undefined,
          icon: (typeof m.icon === "string" && m.icon) ? m.icon : (typeof m.image === "string" ? m.image : undefined),
          price,
          change24h: change,
          percentChange24h: pct,
          volume24hr: vol,
        };
      })
      .filter((m) => m.change24h != null)
      .filter((m) => (Number.isFinite(minVolume) && minVolume > 0 ? (m.volume24hr ?? 0) >= minVolume : true))
      .sort((a, b) => Math.abs(b.change24h ?? 0) - Math.abs(a.change24h ?? 0))
      .slice(0, limit);

    return NextResponse.json({ movers, asOf: new Date().toISOString() });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
