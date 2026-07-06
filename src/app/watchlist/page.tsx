import type { Metadata } from "next";
import { WatchlistClient } from "@/components/WatchlistClient";
import { getFilingTimeline, getInvestors } from "@/lib/repository";

export const metadata: Metadata = {
  title: "MY — 웨일허니콤",
};

export default function WatchlistPage() {
  return (
    <div>
      <h1 className="px-1 text-xl font-bold md:text-2xl">MY</h1>
      <p className="mt-1 px-1 text-sm text-ink-2">
        관심 있는 고래의 새 공시를 놓치지 마세요.
      </p>
      <WatchlistClient
        investors={getInvestors()}
        timeline={getFilingTimeline()}
      />
    </div>
  );
}
