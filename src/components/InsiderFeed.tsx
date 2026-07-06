"use client";

import { useState } from "react";
import { InsiderTradeRow } from "@/components/InsiderTradeRow";
import { fmtRelative } from "@/lib/format";
import type { Form4Trade } from "@/lib/types";

const FILTERS = [
  { key: "ALL", label: "전체" },
  { key: "BUY", label: "매수만" },
  { key: "SELL", label: "매도만" },
] as const;

/** Form 4 피드 — 공시일별 그룹 + 매수/매도 필터 */
export function InsiderFeed({ trades }: { trades: Form4Trade[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("ALL");

  const filtered = trades.filter((t) => filter === "ALL" || t.side === filter);
  const byDate = new Map<string, Form4Trade[]>();
  for (const t of filtered) {
    byDate.set(t.filedAt, [...(byDate.get(t.filedAt) ?? []), t]);
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
              filter === key
                ? "bg-ink text-white"
                : "bg-card text-ink-2 hover:bg-fill"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {[...byDate.entries()].map(([date, dayTrades]) => (
        <section key={date} className="mb-4">
          <h3 className="mb-1.5 px-1 text-sm font-bold text-ink-2">
            {fmtRelative(date)} 공시
            <span className="ml-1.5 text-xs font-semibold text-muted">
              {date.replaceAll("-", ".")}
            </span>
          </h3>
          <div className="rounded-[20px] bg-card px-5">
            <ul className="divide-y divide-line">
              {dayTrades.map((t) => (
                <InsiderTradeRow key={t.id} trade={t} />
              ))}
            </ul>
          </div>
        </section>
      ))}
      {filtered.length === 0 && (
        <p className="rounded-[20px] bg-card p-8 text-center text-sm text-muted">
          조건에 맞는 매매 내역이 없어요.
        </p>
      )}
    </div>
  );
}
