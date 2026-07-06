"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { Holding } from "@/lib/types";

const SECTOR_COLORS = [
  "#3182F6",
  "#00A661",
  "#F5B800",
  "#F04452",
  "#7048E8",
  "#1098AD",
  "#E8590C",
  "#5C7CFA",
  "#0CA678",
  "#9C36B5",
  "#868E96",
];

/** 섹터별 비중 도넛 차트 */
export function PortfolioDonut({ holdings }: { holdings: Holding[] }) {
  const bySector = new Map<string, number>();
  for (const h of holdings) {
    bySector.set(h.sector, (bySector.get(h.sector) ?? 0) + h.weightPct);
  }
  const data = [...bySector.entries()]
    .map(([sector, weight]) => ({ sector, weight }))
    .sort((a, b) => b.weight - a.weight);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="h-44 w-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="weight"
              nameKey="sector"
              innerRadius={52}
              outerRadius={80}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell
                  key={entry.sector}
                  fill={SECTOR_COLORS[i % SECTOR_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${Number(value).toFixed(1)}%`, "비중"]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #E5E8EB",
                fontSize: 13,
                fontFamily: "inherit",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
        {data.map((d, i) => (
          <li key={d.sector} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: SECTOR_COLORS[i % SECTOR_COLORS.length] }}
            />
            <span className="truncate text-ink-2">{d.sector}</span>
            <span className="tnum ml-auto font-semibold">
              {d.weight.toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
