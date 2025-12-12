"use client";

import * as React from "react";

export type Mover = {
  id?: string;
  title: string;
  slug?: string;
  icon?: string;
  price: number | null;
  change24h: number | null;
  percentChange24h: number | null;
  volume24hr: number | null;
};

function fmt(n: number | null, digits = 3): string {
  if (n == null || !Number.isFinite(n)) return "";
  return n.toFixed(digits);
}

function fmtPct(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "";
  return `${(n * 100).toFixed(1)}%`;
}

export function MoversTable({ movers }: { movers: Mover[] }) {
  if (!movers.length) return <div className="small">No movers returned.</div>;

  return (
    <table className="table">
      <thead>
        <tr>
          <th className="th">Market</th>
          <th className="th">Price</th>
          <th className="th">24h Δ</th>
          <th className="th">24h %</th>
          <th className="th">Vol (24h)</th>
        </tr>
      </thead>
      <tbody>
        {movers.map((m, idx) => {
          const href = m.slug ? `https://polymarket.com/market/${m.slug}` : undefined;
          const delta = m.change24h;
          const sign = delta != null && delta > 0 ? "+" : "";

          return (
            <tr key={m.id ?? idx}>
              <td className="td">
                {href ? (
                  <a href={href} target="_blank" rel="noreferrer">
                    {m.title}
                  </a>
                ) : (
                  m.title
                )}
              </td>
              <td className="td">{fmt(m.price, 4)}</td>
              <td className="td">{delta == null ? "" : `${sign}${fmt(delta, 4)}`}</td>
              <td className="td">{fmtPct(m.percentChange24h)}</td>
              <td className="td">{m.volume24hr == null ? "" : Math.round(m.volume24hr).toLocaleString()}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
