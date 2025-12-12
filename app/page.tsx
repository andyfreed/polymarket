"use client";

import * as React from "react";
import type { Mover } from "@/components/MoversTable";
import { MoversTable } from "@/components/MoversTable";
import { PositionsTable } from "@/components/PositionsTable";

type ApiResponse = {
  user?: string;
  positions?: unknown[];
  raw?: unknown;
  error?: string;
  [key: string]: unknown;
};

type MoversResponse = {
  movers?: Mover[];
  asOf?: string;
  error?: string;
};

export default function Page() {
  const [address, setAddress] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);
  const [res, setRes] = React.useState<ApiResponse | null>(null);

  const [moversLoading, setMoversLoading] = React.useState(false);
  const [moversRes, setMoversRes] = React.useState<MoversResponse | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function loadMovers() {
      setMoversLoading(true);
      try {
        const r = await fetch("/api/movers");
        const j = (await r.json()) as MoversResponse;
        if (!cancelled) setMoversRes(j);
      } catch (e) {
        if (!cancelled) setMoversRes({ error: e instanceof Error ? e.message : "Unknown error" });
      } finally {
        if (!cancelled) setMoversLoading(false);
      }
    }

    void loadMovers();
    return () => {
      cancelled = true;
    };
  }, []);

  async function load() {
    setLoading(true);
    setRes(null);
    try {
      const url = new URL("/api/positions", window.location.origin);
      if (address.trim()) url.searchParams.set("user", address.trim());

      const r = await fetch(url.toString());
      const j = (await r.json()) as ApiResponse;
      setRes(j);
    } catch (e) {
      setRes({ error: e instanceof Error ? e.message : "Unknown error" });
    } finally {
      setLoading(false);
    }
  }

  const positions = (res?.positions ?? []) as unknown[];
  const movers = moversRes?.movers ?? [];

  return (
    <>
      <div className="header">
        <div>
          <h1 className="h1">Polymarket Dashboard</h1>
          <p className="sub">Enter your wallet address to load current positions (via Polymarket Data API).</p>
        </div>
        {res?.user ? (
          <span className="badge">
            <span>Wallet</span>
            <span className="code">{res.user}</span>
          </span>
        ) : null}
      </div>

      <div className="panel" style={{ marginBottom: 12 }}>
        <div className="row" style={{ gridTemplateColumns: "1fr auto" }}>
          <div>
            <div style={{ fontWeight: 700 }}>Top 10 movers (24h)</div>
            <div className="small">
              {moversRes?.asOf ? (
                <>
                  As of <span className="code">{moversRes.asOf}</span>
                </>
              ) : (
                "Based on Gamma API oneDayPriceChange."
              )}
            </div>
          </div>
          <button
            className="button"
            onClick={async () => {
              setMoversLoading(true);
              try {
                const r = await fetch("/api/movers");
                const j = (await r.json()) as MoversResponse;
                setMoversRes(j);
              } catch (e) {
                setMoversRes({ error: e instanceof Error ? e.message : "Unknown error" });
              } finally {
                setMoversLoading(false);
              }
            }}
            disabled={moversLoading}
          >
            {moversLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {moversRes?.error ? (
          <div style={{ marginTop: 12 }} className="small">
            <strong>Error:</strong> {moversRes.error}
          </div>
        ) : null}

        <MoversTable movers={movers} />
      </div>

      <div className="panel">
        <div className="row">
          <input
            className="input"
            placeholder="0x... wallet address (optional if POLYMARKET_USER_ADDRESS is set)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <button className="button" onClick={load} disabled={loading}>
            {loading ? "Loading..." : "Load positions"}
          </button>
        </div>

        {res?.error ? (
          <div style={{ marginTop: 12 }} className="small">
            <strong>Error:</strong> {res.error}
          </div>
        ) : null}

        {res ? (
          <PositionsTable positions={positions as Record<string, unknown>[]} />
        ) : (
          <div className="small" style={{ marginTop: 12 }}>
            Click "Load positions" to fetch.
          </div>
        )}

        <div className="small" style={{ marginTop: 12 }}>
          Tip: open <span className="code">/api/positions?user=0x...</span> directly to see the raw JSON.
        </div>
      </div>
    </>
  );
}
