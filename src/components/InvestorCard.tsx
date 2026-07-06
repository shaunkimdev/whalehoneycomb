import Link from "next/link";
import { Avatar, DateStamp } from "@/components/ui";
import { fmtUsdM } from "@/lib/format";
import type { Filing13F, Investor } from "@/lib/types";

/** 고래 목록용 인물 카드: 아바타 + 이름 + 한줄소개 + 운용사 + 최근 공시일 */
export function InvestorCard({
  investor,
  latestFiling,
}: {
  investor: Investor;
  latestFiling?: Filing13F;
}) {
  return (
    <Link
      href={`/investors/${investor.slug}`}
      className="block rounded-[20px] bg-card p-5 transition-transform hover:-translate-y-0.5 hover:shadow-sm"
    >
      <div className="flex items-center gap-4">
        <Avatar investor={investor} size={56} />
        <div className="min-w-0">
          <p className="truncate text-base font-bold">
            {investor.nameKo}
            <span className="ml-1.5 text-sm font-medium text-muted">
              {investor.nameEn}
            </span>
          </p>
          <p className="truncate text-sm text-ink-2">
            {investor.firmKo} · 운용 {fmtUsdM(investor.aumM)}
          </p>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-2">
        {investor.oneLiner}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {investor.styleTags.map((tag) => (
          <span
            key={tag}
            className="rounded-lg bg-fill px-2 py-0.5 text-xs font-semibold text-ink-2"
          >
            {tag}
          </span>
        ))}
      </div>
      {latestFiling && (
        <div className="mt-4 border-t border-line pt-3">
          <p className="mb-1 text-xs font-semibold text-primary">
            최신 13F · {latestFiling.quarter}
          </p>
          <DateStamp
            periodEnd={latestFiling.periodEnd}
            filedAt={latestFiling.filedAt}
          />
        </div>
      )}
    </Link>
  );
}
