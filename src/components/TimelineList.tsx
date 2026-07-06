import Link from "next/link";
import { DateStamp } from "@/components/ui";
import { fmtRelative } from "@/lib/format";
import { getInvestor } from "@/lib/repository";
import type { TimelineItem } from "@/lib/types";

const TYPE_STYLE: Record<TimelineItem["type"], { label: string; cls: string; dateLabel: string }> = {
  "13F": { label: "13F", cls: "bg-primary-soft text-primary", dateLabel: "보고기준일" },
  "13D": { label: "13D", cls: "bg-up-soft text-up", dateLabel: "취득일" },
  "13G": { label: "13G", cls: "bg-fill text-ink-2", dateLabel: "취득일" },
  "8-K": { label: "8-K", cls: "bg-[#FFF3E0] text-[#D9480F]", dateLabel: "사건일" },
  "Form 4": { label: "Form 4", cls: "bg-[#E6FCF5] text-[#0CA678]", dateLabel: "거래일" },
};

/** 13F·13D/G·8-K 통합 공시 타임라인 */
export function TimelineList({ items }: { items: TimelineItem[] }) {
  return (
    <ul className="divide-y divide-line">
      {items.map((item) => {
        const style = TYPE_STYLE[item.type];
        const investor = item.investorSlug ? getInvestor(item.investorSlug) : undefined;
        const body = (
          <div className="flex items-start gap-3 py-3.5">
            <span
              className={`mt-0.5 inline-flex w-14 shrink-0 justify-center rounded-lg py-1 text-xs font-bold ${style.cls}`}
            >
              {style.label}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-snug">{item.titleKo}</p>
              <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-ink-2">
                {item.summaryKo}
              </p>
              <div className="mt-1.5">
                <DateStamp
                  periodEnd={item.eventDate}
                  filedAt={item.filedAt}
                  periodLabel={style.dateLabel}
                />
              </div>
            </div>
            <span className="shrink-0 text-xs text-muted">
              {fmtRelative(item.filedAt)}
            </span>
          </div>
        );
        return (
          <li key={item.id}>
            {investor ? (
              <Link
                href={`/investors/${investor.slug}`}
                className="block transition-colors hover:bg-fill"
              >
                {body}
              </Link>
            ) : item.ticker ? (
              <Link
                href={`/stocks/${encodeURIComponent(item.ticker)}`}
                className="block transition-colors hover:bg-fill"
              >
                {body}
              </Link>
            ) : (
              body
            )}
          </li>
        );
      })}
    </ul>
  );
}
