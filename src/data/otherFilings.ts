import type { OtherFiling } from "@/lib/types";

/**
 * 13D/13G(대량보유 보고)·8-K 샘플 데이터.
 * 13D/G는 매매 후 수 영업일 내 공시되어 13F보다 훨씬 빠르다.
 */
export const OTHER_FILINGS: OtherFiling[] = [
  {
    id: "of-01",
    type: "13D",
    investorSlug: "carl-icahn",
    ticker: "CZR",
    titleKo: "아이칸, 시저스엔터 지분 6.5% 확보 — 경영참여 선언",
    summaryKo:
      "칼 아이칸이 시저스엔터테인먼트 지분 6.5%를 확보하고 경영참여 목적의 13D를 제출했습니다. 이사회 의석과 비용 구조 개선을 요구할 것으로 알려졌습니다.",
    eventDate: "2026-06-22",
    filedAt: "2026-06-30",
    stakePct: 6.5,
  },
  {
    id: "of-02",
    type: "13D",
    investorSlug: "bill-ackman",
    ticker: "HHH",
    titleKo: "애크먼, 하워드휴즈 지분 37.6%로 확대",
    summaryKo:
      "퍼싱스퀘어가 하워드휴즈 홀딩스 지분을 37.6%까지 늘렸습니다. 애크먼은 하워드휴즈를 ‘현대판 버크셔’로 만들겠다는 구상을 공개해 왔습니다.",
    eventDate: "2026-06-15",
    filedAt: "2026-06-24",
    stakePct: 37.6,
  },
  {
    id: "of-03",
    type: "13G",
    investorSlug: "michael-burry",
    ticker: "GEO",
    titleKo: "버리, 지오그룹 지분 5.2% 보고 (단순투자)",
    summaryKo:
      "사이언 자산운용이 교정시설 리츠 지오그룹 지분 5.2%를 단순투자 목적(13G)으로 보고했습니다.",
    eventDate: "2026-06-10",
    filedAt: "2026-06-18",
    stakePct: 5.2,
  },
  {
    id: "of-04",
    type: "8-K",
    ticker: "OXY",
    titleKo: "옥시덴탈, 버크셔 지분 29% 도달 공시",
    summaryKo:
      "옥시덴탈 페트롤리움이 버크셔 해서웨이의 보유 지분이 29%에 도달했다고 8-K로 공시했습니다. 버크셔는 최대 50%까지 취득 승인을 받아 둔 상태입니다.",
    eventDate: "2026-07-01",
    filedAt: "2026-07-02",
  },
  {
    id: "of-05",
    type: "8-K",
    ticker: "INTC",
    titleKo: "인텔, 파운드리 대형 고객 계약 체결 공시",
    summaryKo:
      "인텔이 8-K를 통해 파운드리 사업부의 대형 고객 계약 체결을 공시했습니다. 클라만·아인혼 등 가치투자자들이 최근 지분을 늘린 종목이라 주목됩니다.",
    eventDate: "2026-06-27",
    filedAt: "2026-06-27",
  },
];
