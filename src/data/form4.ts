import type { Form4Trade } from "@/lib/types";

/**
 * Form 4 (내부자 매매) 샘플 데이터 — 최근 2주 분포.
 * EDGAR 연동 시 실시간 수집으로 교체된다.
 */
export const FORM4_TRADES: Form4Trade[] = [
  { id: "f4-01", insiderNameKo: "워런 버핏", insiderNameEn: "Warren Buffett", roleKo: "10% 이상 주주 (버크셔)", ticker: "OXY", side: "BUY", shares: 2500000, valueM: 118, tradeDate: "2026-07-01", filedAt: "2026-07-02", noteKo: "버크셔는 옥시덴탈 지분 10% 이상 보유자로 Form 4 의무가 있어, 13F보다 훨씬 빠르게 매수가 드러납니다." },
  { id: "f4-02", insiderNameKo: "젠슨 황", insiderNameEn: "Jensen Huang", roleKo: "CEO", ticker: "NVDA", side: "SELL", shares: 120000, valueM: 21.5, tradeDate: "2026-07-01", filedAt: "2026-07-02", noteKo: "사전 매도 계획(10b5-1)에 따른 정기 매도로, 통상 부정적 신호로 보지 않습니다." },
  { id: "f4-03", insiderNameKo: "팀 쿡", insiderNameEn: "Tim Cook", roleKo: "CEO", ticker: "AAPL", side: "SELL", shares: 220000, valueM: 51.1, tradeDate: "2026-06-30", filedAt: "2026-07-01", noteKo: "보상 주식 베스팅에 따른 매도입니다." },
  { id: "f4-04", insiderNameKo: "제이미 다이먼", insiderNameEn: "Jamie Dimon", roleKo: "CEO", ticker: "JPM", side: "SELL", shares: 80000, valueM: 21.5, tradeDate: "2026-06-30", filedAt: "2026-07-01" },
  { id: "f4-05", insiderNameKo: "리사 수", insiderNameEn: "Lisa Su", roleKo: "CEO", ticker: "AMD", side: "SELL", shares: 45000, valueM: 7.8, tradeDate: "2026-06-29", filedAt: "2026-06-30" },
  { id: "f4-06", insiderNameKo: "브라이언 니콜", insiderNameEn: "Brian Niccol", roleKo: "이사", ticker: "CMG", side: "BUY", shares: 90000, valueM: 4.9, tradeDate: "2026-06-29", filedAt: "2026-06-30", noteKo: "임원의 자발적 장내 매수는 회사 전망에 대한 자신감으로 해석되는 경우가 많습니다." },
  { id: "f4-07", insiderNameKo: "립부 탄", insiderNameEn: "Lip-Bu Tan", roleKo: "CEO", ticker: "INTC", side: "BUY", shares: 350000, valueM: 10.1, tradeDate: "2026-06-26", filedAt: "2026-06-29", noteKo: "취임 후 세 번째 자사주 매수입니다." },
  { id: "f4-08", insiderNameKo: "사티아 나델라", insiderNameEn: "Satya Nadella", roleKo: "CEO", ticker: "MSFT", side: "SELL", shares: 38000, valueM: 19.5, tradeDate: "2026-06-26", filedAt: "2026-06-29" },
  { id: "f4-09", insiderNameKo: "마크 저커버그", insiderNameEn: "Mark Zuckerberg", roleKo: "CEO", ticker: "META", side: "SELL", shares: 28000, valueM: 20.3, tradeDate: "2026-06-25", filedAt: "2026-06-26", noteKo: "10b5-1 계획에 따른 정기 매도입니다." },
  { id: "f4-10", insiderNameKo: "앤디 재시", insiderNameEn: "Andy Jassy", roleKo: "CEO", ticker: "AMZN", side: "SELL", shares: 42000, valueM: 9.4, tradeDate: "2026-06-25", filedAt: "2026-06-26" },
  { id: "f4-11", insiderNameKo: "브라이언 모이니핸", insiderNameEn: "Brian Moynihan", roleKo: "CEO", ticker: "BAC", side: "BUY", shares: 100000, valueM: 4.6, tradeDate: "2026-06-24", filedAt: "2026-06-25", noteKo: "은행주 약세 구간에서의 CEO 매수라 주목받았습니다." },
  { id: "f4-12", insiderNameKo: "일론 머스크", insiderNameEn: "Elon Musk", roleKo: "CEO", ticker: "TSLA", side: "BUY", shares: 320000, valueM: 101, tradeDate: "2026-06-24", filedAt: "2026-06-25", noteKo: "머스크의 장내 매수는 드물어 공시 직후 주가가 급등했습니다." },
  { id: "f4-13", insiderNameKo: "칼 아이칸", insiderNameEn: "Carl Icahn", roleKo: "10% 이상 주주", ticker: "CVI", side: "BUY", shares: 500000, valueM: 14.2, tradeDate: "2026-06-23", filedAt: "2026-06-24" },
  { id: "f4-14", insiderNameKo: "마이클 델", insiderNameEn: "Michael Dell", roleKo: "회장", ticker: "DELL", side: "SELL", shares: 150000, valueM: 20.7, tradeDate: "2026-06-23", filedAt: "2026-06-24" },
  { id: "f4-15", insiderNameKo: "앨버트 불라", insiderNameEn: "Albert Bourla", roleKo: "CEO", ticker: "PFE", side: "BUY", shares: 120000, valueM: 3.9, tradeDate: "2026-06-22", filedAt: "2026-06-23", noteKo: "화이자 CEO의 2년 만의 장내 매수입니다." },
  { id: "f4-16", insiderNameKo: "워런 버핏", insiderNameEn: "Warren Buffett", roleKo: "10% 이상 주주 (버크셔)", ticker: "OXY", side: "BUY", shares: 1800000, valueM: 84, tradeDate: "2026-06-19", filedAt: "2026-06-22" },
  { id: "f4-17", insiderNameKo: "데이비드 자슬라브", insiderNameEn: "David Zaslav", roleKo: "CEO", ticker: "WBD", side: "BUY", shares: 400000, valueM: 5.0, tradeDate: "2026-06-19", filedAt: "2026-06-22" },
  { id: "f4-18", insiderNameKo: "스티븐 헴슬리", insiderNameEn: "Stephen Hemsley", roleKo: "CEO", ticker: "UNH", side: "BUY", shares: 12000, valueM: 3.6, tradeDate: "2026-06-18", filedAt: "2026-06-19", noteKo: "급락 이후 경영진의 첫 장내 매수입니다." },
];
