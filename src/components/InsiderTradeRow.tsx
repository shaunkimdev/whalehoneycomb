import { SideBadge, TickerLink } from "@/components/ui";
import { fmtDate, fmtRelative, fmtShares, fmtUsdM } from "@/lib/format";
import type { Form4Trade } from "@/lib/types";

/**
 * Form 4 내부자 매매 한 건.
 * 클라이언트 컴포넌트(InsiderFeed) 안에서도 렌더되므로 서버 전용 repository를
 * import하지 않는다 — 종목명은 서버에서 채워준 trade.companyNameKo 사용.
 */
export function InsiderTradeRow({ trade }: { trade: Form4Trade }) {
  return (
    <li className="py-3.5">
      <div className="flex items-center gap-3">
        <SideBadge side={trade.side} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm">
            <span className="font-bold">{trade.insiderNameKo}</span>
            <span className="ml-1.5 text-xs text-muted">{trade.roleKo}</span>
          </p>
          <p className="truncate text-sm text-ink-2">
            <TickerLink ticker={trade.ticker} className="font-semibold text-ink">
              {trade.companyNameKo ?? trade.ticker}
            </TickerLink>
            <span className="ml-1 text-xs text-muted">{trade.ticker}</span>
            <span className="mx-1.5 text-line">|</span>
            {fmtShares(trade.shares)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="tnum text-sm font-bold">{fmtUsdM(trade.valueM)}</p>
          <p className="text-xs text-muted" title={`거래일 ${fmtDate(trade.tradeDate)} · 공시일 ${fmtDate(trade.filedAt)}`}>
            거래 {fmtDate(trade.tradeDate)} · 공시 {fmtRelative(trade.filedAt)}
          </p>
        </div>
      </div>
      {trade.noteKo && (
        <p className="mt-2 rounded-xl bg-fill px-3 py-2 text-xs leading-relaxed text-ink-2">
          💡 {trade.noteKo}
        </p>
      )}
    </li>
  );
}
