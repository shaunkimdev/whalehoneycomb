import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, Tag } from "@/components/ui";
import { fmtDate } from "@/lib/format";
import { getArticle, getArticles } from "@/lib/repository";

export function generateStaticParams() {
  return getArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  return { title: article ? `${article.title} — 웨일허니콤` : "웨일허니콤" };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/insights" className="text-sm font-semibold text-primary">
        ← 인사이트 목록
      </Link>
      <Card className="mt-3">
        <p className="text-4xl" aria-hidden>
          {article.heroEmoji}
        </p>
        <h1 className="mt-3 text-xl font-bold leading-snug md:text-2xl">
          {article.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {article.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
          <span className="ml-auto text-xs text-muted">
            {fmtDate(article.publishedAt)} 발행
          </span>
        </div>
        <div className="mt-5 space-y-4 border-t border-line pt-5">
          {article.paragraphs.map((p, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-ink">
              {p}
            </p>
          ))}
        </div>
      </Card>
    </div>
  );
}
