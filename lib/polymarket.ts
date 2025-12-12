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

export type GammaMarket = {
  id?: string;
  question?: string;
  title?: string;
  slug?: string;
  url?: string;
  icon?: string;
  image?: string;
  active?: boolean;
  closed?: boolean;
  volume24hr?: number;
  volume24hrClob?: number;
  lastTradePrice?: number;
  oneDayPriceChange?: number;
  // Some fields arrive as strings in JSON, but we treat them as unknown and normalize later.
  outcomes?: string | unknown;
  outcomePrices?: string | unknown;
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
      "user-agent": "polymarket-dashboard/0.1"
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Polymarket Data API error ${res.status}: ${text || res.statusText}`);
  }

  return (await res.json()) as PolymarketPositionsResponse;
}

export async function fetchGammaMarkets(params?: {
  limit?: number;
  active?: boolean;
  closed?: boolean;
}): Promise<GammaMarket[]> {
  const base = (process.env.POLYMARKET_GAMMA_API_BASE_URL ?? "https://gamma-api.polymarket.com").replace(/\/$/, "");
  const url = new URL(`${base}/markets`);

  if (params?.limit != null) url.searchParams.set("limit", String(params.limit));
  if (params?.active != null) url.searchParams.set("active", String(params.active));
  if (params?.closed != null) url.searchParams.set("closed", String(params.closed));

  const res = await fetch(url.toString(), {
    next: { revalidate: 60 },
    headers: {
      accept: "application/json",
      "user-agent": "polymarket-dashboard/0.1",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Polymarket Gamma API error ${res.status}: ${text || res.statusText}`);
  }

  const data = (await res.json()) as unknown;
  return (Array.isArray(data) ? data : []) as GammaMarket[];
}

export function getDefaultUserAddress(): string {
  return mustGetEnv("POLYMARKET_USER_ADDRESS", "");
}
