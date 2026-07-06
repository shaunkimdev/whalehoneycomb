import type { Metadata } from "next";
import Link from "next/link";
import { Tag } from "@/components/ui";
import { fmtDate } from "@/lib/format";
import { getArticles } from "@/lib/repository";

export const metadata: Metadata = {
  title: "인사이트 — 웨일허니콤",
};

export default function InsightsPage() {
  const articles = getArticles();
  return (
    <div>
      <h1 className="px-1 text-xl font-bold md:text-2xl">인사이트</h1>
      <p className="mb-5 mt-1 px-1 text-sm text-ink-2">
        공시 데이터를 겹쳐 보면 보이는 것들 — 13F 시즌마다 큐레이션해 드려요.
      </p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {articles.map((a) => (
          <Link
            key={a.slug}
            href={`/insights/${a.slug}`}
            className="flex gap-4 rounded-[20px] bg-card p-5 transition-transform hover:-translate-y-0.5"
          >
            <span className="text-4xl" aria-hidden>
              {a.heroEmoji}
            </span>
            <div className="min-w-0">
              <h2 className="line-clamp-2 font-bold leading-snug">{a.title}</h2>
              <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-2">
                {a.summary}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                {a.tags.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
                <span className="ml-auto text-xs text-muted">
                  {fmtDate(a.publishedAt)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
