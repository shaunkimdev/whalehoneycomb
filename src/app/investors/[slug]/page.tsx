import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HoldingsTable } from "@/components/HoldingsTable";
import { PortfolioDonut } from "@/components/PortfolioDonut";
import { QoQChangeSection } from "@/components/QoQChangeSection";
import { SubscribeButton } from "@/components/SubscribeButton";
import { TimelineList } from "@/components/TimelineList";
import { Avatar, Card, DateStamp, SectionTitle, Tag } from "@/components/ui";
import { fmtUsdM } from "@/lib/format";
import { getQuotes } from "@/lib/quotes";
import {
  getFilingTimeline,
  getInsightFor,
  getInvestor,
  getInvestors,
  getLatestFiling,
  getPreviousFiling,
  getQoQChanges,
  isRealData,
} from "@/lib/repository";

const HOLDINGS_LIMIT = 20;

export function generateStaticParams() {
  return getInvestors().map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const investor = getInvestor(slug);
  return { title: investor ? `${investor.nameKo} 포트폴리오 — 웨일허니콤` : "웨일허니콤" };
}

export default async function InvestorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const investor = getInvestor(slug);
  if (!investor) notFound();

  const latest = getLatestFiling(slug);
  const previous = getPreviousFiling(slug);
  const changes = getQoQChanges(slug);
  const timeline = getFilingTimeline(slug);
  const insight = getInsightFor(slug);
  const real = isRealData(slug);

  const quoteTickers =
    latest?.holdings
      .slice(0, HOLDINGS_LIMIT)
      .filter((h) => !h.unlisted)
      .map((h) => h.ticker) ?? [];
  const quotes = await getQuotes(quoteTickers);

  return (
    <div>
      {/* 프로필 헤더 */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Avatar investor={investor} size={72} />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold md:text-2xl">
              {investor.nameKo}
              <span className="ml-2 text-base font-medium text-muted">
                {investor.nameEn}
              </span>
              {!real && (
                <span className="ml-2 align-middle rounded-lg bg-fill px-2 py-0.5 text-xs font-semibold text-muted">
                  샘플 데이터
                </span>
              )}
            </h1>
            <p className="mt-0.5 text-sm text-ink-2">
              {investor.firmKo} ({investor.firmEn}) · 13F 신고 운용액{" "}
              <span className="tnum font-semibold">{fmtUsdM(investor.aumM)}</span>
            </p>
            <p className="mt-2 font-semibold text-primary">{investor.oneLiner}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              {investor.famousFor}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {investor.styleTags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
            {investor.photo && (
              <p className="mt-3 text-[11px] text-muted">
                사진: {investor.photo.author} /{" "}
                <a
                  href={investor.photo.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  {investor.photo.license}
                </a>{" "}
                (Wikimedia Commons)
              </p>
            )}
          </div>
          <SubscribeButton slug={investor.slug} />
        </div>
      </Card>

      {latest && (
        <>
          {/* 고래의 시선 — 서술형 인사이트 카드 */}
          {insight && (
            <>
              <SectionTitle>🔎 이번 분기, 무엇이 달라졌나</SectionTitle>
              <Card className="border border-primary-soft bg-gradient-to-br from-card to-primary-soft/40">
                <p className="text-[15px] leading-relaxed">{insight.insightKo}</p>
                {insight.insightTags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {insight.insightTags.map((t) => (
                      <Tag key={t}>{t}</Tag>
                    ))}
                  </div>
                )}
                <p className="mt-3 border-t border-line pt-2.5 text-xs text-muted">
                  공시 내용을 정리한 해설이며 매수·매도 추천이 아닙니다. 판단과
                  책임은 투자자 본인에게 있습니다.
                </p>
              </Card>
            </>
          )}

          {/* 직전 분기 대비 변동 */}
          {previous && (
            <>
              <SectionTitle
                right={
                  <span className="text-xs text-muted">
                    {previous.quarter} → {latest.quarter}
                  </span>
                }
              >
                직전 분기 대비 변동
              </SectionTitle>
              <QoQChangeSection changes={changes} />
            </>
          )}

          {/* 포트폴리오 */}
          <SectionTitle>{latest.quarter} 포트폴리오</SectionTitle>
          <Card>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="tnum text-lg font-bold">
                총 {fmtUsdM(latest.totalValueM)}
                <span className="ml-2 text-sm font-medium text-muted">
                  {latest.holdings.length + (latest.othersCount ?? 0)}개 종목
                </span>
              </p>
              <DateStamp periodEnd={latest.periodEnd} filedAt={latest.filedAt} />
            </div>
            <PortfolioDonut holdings={latest.holdings} />
            <div className="mt-4 border-t border-line pt-2">
              <HoldingsTable
                holdings={latest.holdings}
                changes={changes}
                quotes={quotes}
                limit={HOLDINGS_LIMIT}
                othersCount={latest.othersCount}
                othersValueM={latest.othersValueM}
              />
            </div>
            <p className="mt-2 rounded-xl bg-fill px-3 py-2.5 text-xs leading-relaxed text-muted">
              ⏱️ 13F는 분기 마감 후 최대 45일 뒤에 공시됩니다. 위 내용은{" "}
              {latest.periodEnd.replaceAll("-", ".")} 기준이며, 현재는 이미
              달라졌을 수 있어요. 공매도·옵션·현금·해외 상장 주식은 포함되지
              않습니다.
            </p>
          </Card>
        </>
      )}

      {/* 공시 이력 */}
      <SectionTitle>공시 이력</SectionTitle>
      <Card>
        <TimelineList items={timeline} />
      </Card>
    </div>
  );
}
