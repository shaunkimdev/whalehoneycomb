import type { Metadata } from "next";
import { InsiderFeed } from "@/components/InsiderFeed";
import { getInsiderTrades } from "@/lib/repository";

export const metadata: Metadata = {
  title: "인사이더 매매 — 웨일허니콤",
};

export default function InsiderPage() {
  const trades = getInsiderTrades();
  return (
    <div>
      <h1 className="px-1 text-xl font-bold md:text-2xl">오늘의 인사이더 매매</h1>
      <p className="mb-5 mt-1 px-1 text-sm leading-relaxed text-ink-2">
        CEO·임원·10% 이상 주주는 자사 주식을 사고팔면 2영업일 안에 공시(Form
        4)해야 해요. 분기에 한 번뿐인 13F보다 훨씬 빠른, 거의 실시간 신호입니다.
      </p>
      <InsiderFeed trades={trades} />
    </div>
  );
}
