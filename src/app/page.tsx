import Link from "next/link";
import { InsiderTradeRow } from "@/components/InsiderTradeRow";
import { TimelineList } from "@/components/TimelineList";
import { Avatar, Card, PctChip, SectionTitle, TickerLink } from "@/components/ui";
import { fmtDate, fmtPrice } from "@/lib/format";
import { getQuotes } from "@/lib/quotes";
import {
  getConsensus,
  getDataMeta,
  getFilingTimeline,
  getInsiderTrades,
  getInvestors,
  getLatestFiling,
} from "@/lib/repository";

function MoreLink({ href }: { href: string }) {
  return (
    <Link href={href} className="text-sm font-semibold text-primary">
      더보기 →
    </Link>
  );
}

export default async function HomePage() {
  const trades = getInsiderTrades().slice(0, 5);
  const consensus = getConsensus(3).slice(0, 6);
  const timeline = getFilingTimeline().slice(0, 6);
  const investors = getInvestors();
  const meta = getDataMeta();
  const quotes = await getQuotes(consensus.map((c) => c.ticker));

  return (
    <div>
      {/* 히어로 */}
      <div className="mb-2 px-1 pt-2">
        <h1 className="text-2xl font-extrabold leading-snug md:text-3xl">
          고래들이 어디에 투자하는지,
          <br />
          공시로 확인하세요 🐳
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-2 md:text-base">
          버핏부터 버리까지 — 미국 주식 고래 {investors.length}명의 13F
          포트폴리오와 내부자 매매를 매일 쉽게 정리해 드려요.
        </p>
        {meta.fetchedAt && (
          <p className="mt-1.5 text-xs text-muted">
            SEC EDGAR 데이터 갱신: {fmtDate(meta.fetchedAt.slice(0, 10))}{" "}
            {meta.fetchedAt.slice(11, 16)} UTC
          </p>
        )}
      </div>

      {/* 오늘의 인사이더 매매 */}
      <SectionTitle right={<MoreLink href="/insider" />}>
        ⚡ 오늘의 인사이더 매매
      </SectionTitle>
      <Card>
        <ul className="divide-y divide-line">
          {trades.map((t) => (
            <InsiderTradeRow key={t.id} trade={t} />
          ))}
        </ul>
      </Card>

      {/* 컨센서스 */}
      <SectionTitle right={<MoreLink href="/insights" />}>
        🏆 이번 분기 고래 컨센서스
      </SectionTitle>
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
        {consensus.map((c) => {
          const quote = quotes.get(c.ticker);
          return (
            <TickerLink
              key={c.ticker}
              ticker={c.ticker}
              className="w-60 shrink-0 rounded-[20px] bg-card p-4 no-underline transition-transform hover:-translate-y-0.5 md:w-auto"
            >
              <p className="text-xs font-bold text-primary">
                고래 {c.holderCount}명 보유
                {c.buyerCount > 0 && (
                  <span className="ml-1.5 text-up">
                    이번 분기 {c.buyerCount}명 신규·확대
                  </span>
                )}
              </p>
              <p className="mt-1 truncate font-bold">
                {c.nameKo}
                <span className="ml-1.5 text-xs font-medium text-muted">
                  {c.ticker}
                </span>
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                {quote && (
                  <>
                    <span className="tnum text-sm font-semibold">
                      {fmtPrice(quote.price)}
                    </span>
                    <PctChip pct={quote.changePct} />
                  </>
                )}
              </div>
              <div className="mt-2.5 flex -space-x-1.5">
                {c.holders.slice(0, 5).map((h) => (
                  <span key={h.slug} className="rounded-full ring-2 ring-card">
                    <Avatar investor={h} size={24} />
                  </span>
                ))}
              </div>
            </TickerLink>
          );
        })}
      </div>

      {/* 추적 중인 고래 */}
      <SectionTitle right={<MoreLink href="/investors" />}>
        🐳 추적 중인 고래
      </SectionTitle>
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
        {investors.map((inv) => {
          const filing = getLatestFiling(inv.slug);
          return (
            <Link
              key={inv.slug}
              href={`/investors/${inv.slug}`}
              className="w-40 shrink-0 rounded-[20px] bg-card p-4 text-center transition-transform hover:-translate-y-0.5"
            >
              <div className="flex justify-center">
                <Avatar investor={inv} size={52} />
              </div>
              <p className="mt-2 truncate text-sm font-bold">{inv.nameKo}</p>
              <p className="truncate text-xs text-muted">{inv.firmKo}</p>
              {filing && (
                <p className="mt-1.5 text-[11px] text-muted">
                  최근 공시 {filing.filedAt.replaceAll("-", ".")}
                </p>
              )}
            </Link>
          );
        })}
      </div>

      {/* 최신 공시 타임라인 */}
      <SectionTitle>📋 최신 공시</SectionTitle>
      <Card>
        <TimelineList items={timeline} />
      </Card>
    </div>
  );
}
