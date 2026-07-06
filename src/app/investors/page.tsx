import type { Metadata } from "next";
import { InvestorCard } from "@/components/InvestorCard";
import { getInvestors, getLatestFiling } from "@/lib/repository";

export const metadata: Metadata = {
  title: "고래 목록 — 웨일허니콤",
};

export default function InvestorsPage() {
  const investors = getInvestors();
  return (
    <div>
      <h1 className="px-1 text-xl font-bold md:text-2xl">미국 주식 고래들</h1>
      <p className="mb-5 mt-1 px-1 text-sm text-ink-2">
        SEC에 분기마다 포트폴리오(13F)를 공시하는 유명 투자자 {investors.length}
        명을 추적하고 있어요.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {investors.map((investor) => (
          <InvestorCard
            key={investor.slug}
            investor={investor}
            latestFiling={getLatestFiling(investor.slug)}
          />
        ))}
      </div>
    </div>
  );
}
