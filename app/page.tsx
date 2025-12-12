"use client";

import * as React from "react";
import { PositionsTable } from "@/components/PositionsTable";

type ApiResponse = {
  user?: string;
  positions?: unknown[];
  raw?: unknown;
  error?: string;
  [key: string]: unknown;
};

export default function Page() {
  const [address, setAddress] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);
  const [res, setRes] = React.useState<ApiResponse | null>(null);

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

      <div className="panel">
        <div className="row">
          <input
            className="input"
            placeholder="0x… wallet address (optional if POLYMARKET_USER_ADDRESS is set)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <button className="button" onClick={load} disabled={loading}>
            {loading ? "Loading…" : "Load positions"}
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
            Click “Load positions” to fetch.
          </div>
        )}

        <div className="small" style={{ marginTop: 12 }}>
          Tip: open <span className="code">/api/positions?user=0x...</span> directly to see the raw JSON.
        </div>
      </div>
    </>
  );
}
