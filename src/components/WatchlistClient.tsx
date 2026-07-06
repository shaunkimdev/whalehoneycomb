"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar, Card, DateStamp, SectionTitle } from "@/components/ui";
import { fmtRelative } from "@/lib/format";
import { readLocalSlugs, syncSubscription } from "@/lib/subscriptionClient";
import type { Investor, TimelineItem } from "@/lib/types";

/** MY 페이지 본문 — 구독 관리 + 구독 기반 샘플 알림 센터 (localStorage) */
export function WatchlistClient({
  investors,
  timeline,
}: {
  investors: Investor[];
  timeline: TimelineItem[];
}) {
  const [subs, setSubs] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const sync = () => setSubs(readLocalSlugs());
    sync();
    window.addEventListener("wh:subscriptions-changed", sync);
    return () => window.removeEventListener("wh:subscriptions-changed", sync);
  }, []);

  const subscribed = investors.filter((i) => subs.includes(i.slug));
  const notifications = timeline.filter(
    (t) => t.investorSlug && subs.includes(t.investorSlug),
  );

  if (!mounted) return null;

  return (
    <div>
      <SectionTitle>🔔 알림 받는 고래 {subscribed.length}명</SectionTitle>
      {subscribed.length === 0 ? (
        <Card>
          <p className="py-6 text-center text-sm leading-relaxed text-ink-2">
            아직 알림 받는 고래가 없어요.
            <br />
            <Link href="/investors" className="font-bold text-primary">
              고래 목록
            </Link>
            에서 관심 있는 투자자의 알림을 켜 보세요.
          </p>
        </Card>
      ) : (
        <Card>
          <ul className="divide-y divide-line">
            {subscribed.map((inv) => (
              <li key={inv.slug} className="flex items-center gap-3 py-3">
                <Link
                  href={`/investors/${inv.slug}`}
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  <Avatar investor={inv} size={44} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{inv.nameKo}</p>
                    <p className="truncate text-xs text-muted">{inv.firmKo}</p>
                  </div>
                </Link>
                <button
                  onClick={async () => {
                    const next = readLocalSlugs().filter((s) => s !== inv.slug);
                    setSubs(next);
                    await syncSubscription({ slugs: next });
                  }}
                  className="shrink-0 rounded-xl bg-fill px-3 py-1.5 text-xs font-bold text-ink-2 hover:bg-line"
                >
                  알림 끄기
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <SectionTitle>📬 알림함</SectionTitle>
      <Card>
        {notifications.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">
            알림 받는 고래의 새 공시가 여기에 표시돼요.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {notifications.map((n) => (
              <li key={n.id} className="py-3">
                <Link
                  href={n.investorSlug ? `/investors/${n.investorSlug}` : "#"}
                  className="block"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold leading-snug">
                      <span className="mr-1.5 rounded-md bg-primary-soft px-1.5 py-0.5 text-[11px] font-bold text-primary">
                        {n.type}
                      </span>
                      {n.titleKo}
                    </p>
                    <span className="shrink-0 text-xs text-muted">
                      {fmtRelative(n.filedAt)}
                    </span>
                  </div>
                  <div className="mt-1">
                    <DateStamp periodEnd={n.eventDate} filedAt={n.filedAt} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-muted">
          공시 워처(npm run watch:filings)가 실행 중이면 새 공시가 올라올 때
          브라우저 푸시·이메일로도 알려 드려요. 위 목록은 구독한 고래의 공시
          이력입니다.
        </p>
      </Card>
    </div>
  );
}
