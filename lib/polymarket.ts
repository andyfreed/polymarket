export type PolymarketPosition = {
  // Data API shape may evolve; we keep this permissive.
  // These are common fields observed in position payloads.
  market?: string;
  market_id?: string;
  marketId?: string;
  outcome?: string;
  outcome_id?: string;
  outcomeId?: string;
  shares?: number | string;
  size?: number | string;
  avg_price?: number | string;
  avgPrice?: number | string;
  current_price?: number | string;
  currentPrice?: number | string;
  realized_pnl?: number | string;
  realizedPnl?: number | string;
  unrealized_pnl?: number | string;
  unrealizedPnl?: number | string;
  [key: string]: unknown;
};

export type PolymarketPositionsResponse = {
  positions?: PolymarketPosition[];
  data?: PolymarketPosition[];
  [key: string]: unknown;
};

function mustGetEnv(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export async function fetchPolymarketPositions(user: string): Promise<PolymarketPositionsResponse> {
  const base = (process.env.POLYMARKET_DATA_API_BASE_URL ?? "https://data-api.polymarket.com").replace(/\/$/, "");

  const url = new URL(`${base}/positions`);
  url.searchParams.set("user", user);

  const res = await fetch(url.toString(), {
    // Cache briefly to keep the dashboard snappy; Vercel will respect this on server.
    next: { revalidate: 10 },
    headers: {
      "accept": "application/json",
      "user-agent": "polymarket-dashboard/0.1",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Polymarket Data API error ${res.status}: ${text || res.statusText}`);
  }

  return (await res.json()) as PolymarketPositionsResponse;
}

export function getDefaultUserAddress(): string {
  return mustGetEnv("POLYMARKET_USER_ADDRESS", "");
}
