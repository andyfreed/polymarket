"use client";

import * as React from "react";

type Position = Record<string, unknown>;

function pickString(p: Position, keys: string[]): string {
  for (const k of keys) {
    const v = p[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  return "";
}

function pickNumber(p: Position, keys: string[]): number | null {
  for (const k of keys) {
    const v = p[k];
    if (typeof v === "number") return v;
    if (typeof v === "string" && v.trim() && !Number.isNaN(Number(v))) return Number(v);
  }
  return null;
}

export function PositionsTable({ positions }: { positions: Position[] }) {
  if (!positions.length) {
    return <div className="small">No positions returned.</div>;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th className="th">Market</th>
          <th className="th">Outcome</th>
          <th className="th">Shares</th>
          <th className="th">Avg</th>
          <th className="th">Current</th>
          <th className="th">Unrealized</th>
        </tr>
      </thead>
      <tbody>
        {positions.map((p, idx) => {
          const market =
            pickString(p, ["market", "market_title", "title"]) ||
            pickString(p, ["market_id", "marketId"]) ||
            "(unknown)";
          const outcome =
            pickString(p, ["outcome", "outcome_name", "outcomeId", "outcome_id"]) || "";
          const shares = pickNumber(p, ["shares", "size"]);
          const avg = pickNumber(p, ["avg_price", "avgPrice"]);
          const cur = pickNumber(p, ["current_price", "currentPrice"]);
          const uPnl = pickNumber(p, ["unrealized_pnl", "unrealizedPnl"]);

          return (
            <tr key={idx}>
              <td className="td">{market}</td>
              <td className="td">{outcome}</td>
              <td className="td">{shares ?? ""}</td>
              <td className="td">{avg ?? ""}</td>
              <td className="td">{cur ?? ""}</td>
              <td className="td">{uPnl ?? ""}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
