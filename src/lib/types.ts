/** 섹터 분류 (한국어 표기) */
export type Sector =
  | "기술"
  | "커뮤니케이션"
  | "금융"
  | "에너지"
  | "헬스케어"
  | "필수소비재"
  | "임의소비재"
  | "산업재"
  | "원자재"
  | "유틸리티"
  | "부동산"
  | "ETF"
  | "기타";

export interface StockInfo {
  ticker: string;
  nameKo: string;
  nameEn: string;
  sector: Sector;
  /** 현재가 (USD) — 샘플 단계에서는 목 데이터 */
  price: number;
  /** 일간 등락률 (%) */
  changePct: number;
}

export interface Quote {
  ticker: string;
  price: number;
  changePct: number;
  /** 시세 기준 시각 */
  asOf: string;
}

export interface Investor {
  slug: string;
  nameKo: string;
  nameEn: string;
  firmKo: string;
  firmEn: string;
  /** EDGAR 연동 대비 CIK 번호 */
  cik: string;
  /** 카드용 한줄소개 */
  oneLiner: string;
  /** 무엇으로 유명한지 상세 설명 */
  famousFor: string;
  styleTags: string[];
  /** 13F 신고 운용액 ($M) */
  aumM: number;
  /** 이니셜 아바타 (사진 없을 때 폴백) */
  initials: string;
  avatarColor: string;
  /** 위키미디어 커먼즈 CC 사진 — 라이선스 표기 의무 있음 */
  photo?: {
    url: string;
    author: string;
    license: string;
    sourceUrl: string;
  };
}

export interface Holding {
  ticker: string;
  nameKo: string;
  nameEn: string;
  sector: Sector;
  shares: number;
  /** 평가액 ($M, 보고기준일 기준) */
  valueM: number;
  /** 포트폴리오 내 비중 (%) */
  weightPct: number;
  /** 티커 매핑 실패(비상장·채권 등) — 링크/시세 없이 이름만 표시 */
  unlisted?: boolean;
}

export interface Filing13F {
  investorSlug: string;
  quarter: string; // 예: "2026 Q1"
  /** 보고기준일 (분기 마감일) */
  periodEnd: string;
  /** 공시일 (SEC 제출일) */
  filedAt: string;
  totalValueM: number;
  holdings: Holding[];
  /** 상위 보유 외 잔여 종목 수·평가액 (실데이터에서 수백 종목 접기용) */
  othersCount?: number;
  othersValueM?: number;
  /** EDGAR 실데이터가 아닌 샘플 데이터 여부 */
  isSample?: boolean;
  /** 서술형 인사이트 (매수 추천이 아닌 사실 서술) */
  insightKo?: string;
  insightTags?: string[];
}

export type ChangeKind = "NEW" | "EXIT" | "ADD" | "TRIM" | "HOLD";

export interface HoldingChange {
  ticker: string;
  nameKo: string;
  sector: Sector;
  kind: ChangeKind;
  prevWeightPct: number;
  currWeightPct: number;
  prevValueM: number;
  currValueM: number;
}

export type TradeSide = "BUY" | "SELL";

export interface Form4Trade {
  id: string;
  insiderNameKo: string;
  insiderNameEn: string;
  roleKo: string;
  ticker: string;
  /** 종목 표시명 (클라이언트 컴포넌트에서 조회 없이 쓰도록 서버에서 채움) */
  companyNameKo?: string;
  side: TradeSide;
  shares: number;
  valueM: number;
  /** 거래일 */
  tradeDate: string;
  /** 공시일 */
  filedAt: string;
  noteKo?: string;
  /** 추적 투자자가 직접 제출한 공시인 경우 해당 slug */
  sourceInvestorSlug?: string;
}

export interface OtherFiling {
  id: string;
  type: "13D" | "13G" | "8-K";
  investorSlug?: string;
  ticker: string;
  titleKo: string;
  summaryKo: string;
  /** 사건 발생일 */
  eventDate: string;
  /** 공시일 */
  filedAt: string;
  stakePct?: number;
}

export interface Article {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  publishedAt: string;
  heroEmoji: string;
  /** 문단 배열 (샘플 단계 단순 텍스트) */
  paragraphs: string[];
}

/** 통합 공시 타임라인 항목 */
export interface TimelineItem {
  id: string;
  type: "13F" | "13D" | "13G" | "8-K" | "Form 4";
  titleKo: string;
  summaryKo: string;
  investorSlug?: string;
  ticker?: string;
  /** 기준일(보고기준일/거래일/사건일) */
  eventDate: string;
  filedAt: string;
}
