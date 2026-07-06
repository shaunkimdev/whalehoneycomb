import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InsiderTradeRow } from "@/components/InsiderTradeRow";
import { Avatar, Card, ChangeBadge, DateStamp, PctChip, SectionTitle } from "@/components/ui";
import { fmtPrice, fmtUsdM } from "@/lib/format";
import { getQuoteOne } from "@/lib/quotes";
import {
  getAllTickersInUse,
  getHoldersOfTicker,
  getInsiderTradesByTicker,
  getStockDisplay,
} from "@/lib/repository";

export function generateStaticParams() {
  return getAllTickersInUse().map((ticker) => ({ ticker }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ticker: string }>;
}): Promise<Metadata> {
  const { ticker } = await params;
  const stock = getStockDisplay(decodeURIComponent(ticker));
  return { title: stock ? `${stock.nameKo}(${stock.ticker}) — 웨일허니콤` : "웨일허니콤" };
}

export default async function StockPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker: rawTicker } = await params;
  const ticker = decodeURIComponent(rawTicker);
  const stock = getStockDisplay(ticker);
  if (!stock) notFound();

  const quote = await getQuoteOne(ticker);
  const holders = getHoldersOfTicker(ticker);
  const trades = getInsiderTradesByTicker(ticker);

  return (
    <div>
      {/* 시세 헤더 */}
      <Card>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-xl font-bold md:text-2xl">
              {stock.nameKo}
              <span className="ml-2 text-base font-medium text-muted">
                {stock.ticker}
              </span>
            </h1>
            <p className="mt-0.5 text-sm text-ink-2">
              {stock.nameEn} · {stock.sector}
            </p>
          </div>
          {quote && (
            <div className="text-right">
              <p className="tnum text-2xl font-bold">{fmtPrice(quote.price)}</p>
              <p className="tnum text-sm">
                <PctChip pct={quote.changePct} /> 오늘
              </p>
              <p className="mt-0.5 text-[11px] text-muted">{quote.asOf}</p>
            </div>
          )}
        </div>
      </Card>

      {/* 보유 고래 */}
      <SectionTitle>이 종목을 담은 고래 {holders.length}명</SectionTitle>
      {holders.length === 0 ? (
        <Card>
          <p className="py-4 text-center text-sm text-muted">
            추적 중인 고래의 최신 13F에는 이 종목이 없어요.
          </p>
        </Card>
      ) : (
        <Card>
          <ul className="divide-y divide-line">
            {holders.map(({ investor, holding, filing, change }) => (
              <li key={investor.slug}>
                <Link
                  href={`/investors/${investor.slug}`}
                  className="flex items-center gap-3 py-3.5 transition-colors hover:bg-fill"
                >
                  <Avatar investor={investor} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">
                      {investor.nameKo}
                      <span className="ml-1.5 text-xs font-medium text-muted">
                        {investor.firmKo}
                      </span>
                      {change && change.kind !== "HOLD" && (
                        <span className="ml-2">
                          <ChangeBadge kind={change.kind} />
                        </span>
                      )}
                    </p>
                    <DateStamp
                      periodEnd={filing.periodEnd}
                      filedAt={filing.filedAt}
                    />
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="tnum text-sm font-bold">
                      {holding.weightPct.toFixed(1)}%
                    </p>
                    <p className="tnum text-xs text-muted">
                      {fmtUsdM(holding.valueM)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* 인사이더 매매 */}
      {trades.length > 0 && (
        <>
          <SectionTitle>이 종목의 인사이더 매매</SectionTitle>
          <Card>
            <ul className="divide-y divide-line">
              {trades.map((t) => (
                <InsiderTradeRow key={t.id} trade={t} />
              ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
