import { TickerLink } from "@/components/ui";
import { fmtUsdM } from "@/lib/format";
import type { HoldingChange } from "@/lib/types";

const GROUPS = [
  { kind: "NEW", title: "🆕 신규 편입", accent: "text-primary" },
  { kind: "ADD", title: "➕ 비중 확대", accent: "text-up" },
  { kind: "TRIM", title: "➖ 비중 축소", accent: "text-down" },
  { kind: "EXIT", title: "❌ 전량 청산", accent: "text-muted" },
] as const;

/** 직전 분기 대비 변동을 4개 그룹 카드로 표시 */
export function QoQChangeSection({ changes }: { changes: HoldingChange[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {GROUPS.map(({ kind, title, accent }) => {
        const items = changes.filter((c) => c.kind === kind);
        return (
          <div key={kind} className="rounded-2xl bg-fill p-4">
            <p className={`mb-2 text-sm font-bold ${accent}`}>
              {title}
              <span className="ml-1.5 text-xs font-semibold text-muted">
                {items.length}종목
              </span>
            </p>
            {items.length === 0 ? (
              <p className="text-sm text-muted">해당 없음</p>
            ) : (
              <ul className="space-y-1.5">
                {items.map((c) => (
                  <li key={c.ticker} className="flex items-baseline gap-2 text-sm">
                    <TickerLink ticker={c.ticker} className="font-semibold">
                      {c.nameKo}
                    </TickerLink>
                    <span className="text-xs text-muted">{c.ticker}</span>
                    <span className="tnum ml-auto text-xs text-ink-2">
                      {kind === "NEW" &&
                        `→ 비중 ${c.currWeightPct.toFixed(1)}% (${fmtUsdM(c.currValueM)})`}
                      {kind === "EXIT" &&
                        `비중 ${c.prevWeightPct.toFixed(1)}% → 0%`}
                      {(kind === "ADD" || kind === "TRIM") &&
                        `${fmtUsdM(c.prevValueM)} → ${fmtUsdM(c.currValueM)}`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
