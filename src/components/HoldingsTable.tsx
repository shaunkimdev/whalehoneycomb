import { ChangeBadge, PctChip, TickerLink } from "@/components/ui";
import { fmtPrice, fmtUsdM } from "@/lib/format";
import type { Holding, HoldingChange, Quote } from "@/lib/types";

/**
 * 보유 종목 테이블 — 종목·비중바·평가액·현재가 등락·변동 뱃지.
 * 시세는 서버(페이지)에서 배치 조회한 Map을 props로 받는다.
 * limit 지정 시 상위 N개만 표시하고 나머지는 접힌 요약 행으로.
 */
export function HoldingsTable({
  holdings,
  changes,
  quotes,
  limit,
  othersCount = 0,
  othersValueM = 0,
}: {
  holdings: Holding[];
  changes?: HoldingChange[];
  quotes?: Map<string, Quote>;
  limit?: number;
  othersCount?: number;
  othersValueM?: number;
}) {
  const changeMap = new Map(changes?.map((c) => [c.ticker, c]));
  const visible = limit ? holdings.slice(0, limit) : holdings;
  const foldedRows = holdings.length - visible.length;
  const foldedValueM =
    holdings.slice(visible.length).reduce((s, h) => s + h.valueM, 0) + othersValueM;
  const foldedCount = foldedRows + othersCount;
  const maxWeight = Math.max(...holdings.map((h) => h.weightPct), 0.01);

  return (
    <ul className="divide-y divide-line">
      {visible.map((h) => {
        const quote = quotes?.get(h.ticker);
        const change = changeMap.get(h.ticker);
        return (
          <li key={h.ticker} className="flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {h.unlisted ? (
                  <span className="truncate font-semibold">{h.nameKo}</span>
                ) : (
                  <TickerLink ticker={h.ticker} className="truncate font-semibold">
                    {h.nameKo}
                  </TickerLink>
                )}
                {!h.unlisted && (
                  <span className="shrink-0 text-xs text-muted">{h.ticker}</span>
                )}
                {change && change.kind !== "HOLD" && (
                  <ChangeBadge kind={change.kind} />
                )}
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-fill md:w-36">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(h.weightPct / maxWeight) * 100}%` }}
                  />
                </div>
                <span className="tnum text-xs font-semibold text-ink-2">
                  {h.weightPct.toFixed(1)}%
                </span>
                <span className="text-xs text-muted">{h.sector}</span>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="tnum text-sm font-bold">{fmtUsdM(h.valueM)}</p>
              {quote && (
                <p className="tnum text-xs">
                  <span className="mr-1 text-muted">{fmtPrice(quote.price)}</span>
                  <PctChip pct={quote.changePct} />
                </p>
              )}
            </div>
          </li>
        );
      })}
      {foldedCount > 0 && (
        <li className="flex items-center justify-between py-3 text-sm text-muted">
          <span>외 {foldedCount}개 종목</span>
          <span className="tnum font-semibold">{fmtUsdM(foldedValueM)}</span>
        </li>
      )}
    </ul>
  );
}
