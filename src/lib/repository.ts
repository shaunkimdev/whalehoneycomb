/**
 * 데이터 접근 계층 (서버 전용 — fs 사용).
 * `npm run ingest`가 만든 src/data/generated/*.json(EDGAR 실데이터)이 있으면 우선 사용하고,
 * 없거나 수집 실패한 투자자는 src/data/* 샘플로 폴백한다.
 * 클라이언트 컴포넌트에서는 이 모듈을 import하지 말 것 (props로 전달).
 */
import fs from "node:fs";
import path from "node:path";
import { ARTICLES } from "@/data/articles";
import { FILINGS_13F, type RawFiling13F } from "@/data/filings13f";
import { FORM4_TRADES } from "@/data/form4";
import { INVESTORS } from "@/data/investors";
import { OTHER_FILINGS } from "@/data/otherFilings";
import { STOCKS } from "@/data/stocks";
import { buildInsight } from "@/lib/insight";
import type {
  Article,
  Filing13F,
  Form4Trade,
  Holding,
  HoldingChange,
  Investor,
  OtherFiling,
  Sector,
  StockInfo,
  TimelineItem,
} from "@/lib/types";

// ---------- generated JSON 로드 ----------

interface GenHolding {
  cusip: string;
  nameEn: string;
  valueM: number;
  shares: number;
  ticker: string | null;
}
interface GenFiling {
  quarter: string;
  periodEnd: string;
  filedAt: string;
  totalValueM: number;
  holdings: GenHolding[];
  othersCount: number;
  othersValueM: number;
}
interface GenForm4 {
  id: string;
  insiderNameEn: string;
  insiderNameKo: string;
  roleKo: string;
  ticker: string;
  issuerName: string;
  side: "BUY" | "SELL";
  shares: number;
  valueM: number;
  tradeDate: string;
  filedAt: string;
  sourceInvestorSlug?: string;
}
interface GenOther {
  id: string;
  type: "13D" | "13G" | "8-K";
  investorSlug?: string;
  ticker: string;
  titleKo: string;
  summaryKo: string;
  eventDate: string;
  filedAt: string;
}
export interface DataMeta {
  fetchedAt?: string;
  investorStatus?: Record<string, "ok" | "fallback">;
}

const GEN_DIR = path.join(process.cwd(), "src", "data", "generated");

function loadJson<T>(file: string): T | null {
  try {
    const p = path.join(GEN_DIR, file);
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, "utf8")) as T;
  } catch {
    return null;
  }
}

// 모듈 로드 시 1회 읽고 캐시 (dev에서는 서버 재시작/ingest 후 반영)
const genFilings = loadJson<Record<string, GenFiling[]>>("filings13f.json");
const genForm4 = loadJson<GenForm4[]>("form4.json");
const genOther = loadJson<GenOther[]>("otherFilings.json");
const genMeta = loadJson<DataMeta>("meta.json");

export function getDataMeta(): DataMeta {
  return genMeta ?? {};
}

/** 이 투자자의 데이터가 실데이터인지 */
export function isRealData(slug: string): boolean {
  return Boolean(genFilings?.[slug]?.length);
}

// ---------- 종목 메타 ----------

export function getStock(ticker: string): StockInfo | undefined {
  return STOCKS[ticker];
}

export interface StockDisplay {
  ticker: string;
  nameKo: string;
  nameEn: string;
  sector: Sector;
}

/** 카탈로그에 없는 실데이터 티커도 표시 가능한 종목 메타 */
export function getStockDisplay(ticker: string): StockDisplay | undefined {
  const s = STOCKS[ticker];
  if (s) return s;
  // 실데이터 보유/매매에서 이름을 찾아본다
  if (genFilings) {
    for (const filings of Object.values(genFilings)) {
      for (const f of filings) {
        const h = f.holdings.find((x) => x.ticker === ticker);
        if (h) return { ticker, nameKo: h.nameEn, nameEn: h.nameEn, sector: "기타" };
      }
    }
  }
  const t = genForm4?.find((x) => x.ticker === ticker);
  if (t) return { ticker, nameKo: t.issuerName, nameEn: t.issuerName, sector: "기타" };
  return undefined;
}

// ---------- 투자자 ----------

export function getInvestors(): Investor[] {
  return [...INVESTORS]
    .map((inv) => {
      const gen = genFilings?.[inv.slug];
      const latest = gen?.[gen.length - 1];
      return latest ? { ...inv, aumM: latest.totalValueM } : inv;
    })
    .sort((a, b) => b.aumM - a.aumM);
}

export function getInvestor(slug: string): Investor | undefined {
  return getInvestors().find((i) => i.slug === slug);
}

// ---------- 13F ----------

function holdingFrom(ticker: string | null, nameEn: string, valueM: number, shares: number, totalValueM: number, cusip?: string): Holding {
  const known = ticker ? STOCKS[ticker] : undefined;
  return {
    ticker: ticker ?? cusip ?? nameEn,
    nameKo: known?.nameKo ?? nameEn,
    nameEn: known?.nameEn ?? nameEn,
    sector: known?.sector ?? "기타",
    shares,
    valueM,
    weightPct: totalValueM > 0 ? (valueM / totalValueM) * 100 : 0,
    unlisted: !ticker,
  };
}

function expandGenerated(slug: string, f: GenFiling): Filing13F {
  return {
    investorSlug: slug,
    quarter: f.quarter,
    periodEnd: f.periodEnd,
    filedAt: f.filedAt,
    totalValueM: f.totalValueM,
    holdings: f.holdings.map((h) =>
      holdingFrom(h.ticker, h.nameEn, h.valueM, h.shares, f.totalValueM, h.cusip),
    ),
    othersCount: f.othersCount,
    othersValueM: f.othersValueM,
    isSample: false,
  };
}

function expandSample(slug: string, raw: RawFiling13F): Filing13F {
  const totalValueM = raw.holdings.reduce((sum, [, v]) => sum + v, 0);
  const holdings = raw.holdings
    .map(([ticker, valueM]) => {
      const stock = STOCKS[ticker];
      const shares = stock ? Math.round((valueM * 1_000_000) / stock.price) : 0;
      return holdingFrom(ticker, stock?.nameEn ?? ticker, valueM, shares, totalValueM);
    })
    .sort((a, b) => b.valueM - a.valueM);
  return {
    investorSlug: slug,
    quarter: raw.quarter,
    periodEnd: raw.periodEnd,
    filedAt: raw.filedAt,
    totalValueM,
    holdings,
    isSample: true,
    insightKo: raw.insightKo,
    insightTags: raw.insightTags,
  };
}

/** 해당 투자자의 13F 목록 (과거 → 최신 순). 실데이터 우선, 없으면 샘플. */
export function getFilings13F(slug: string): Filing13F[] {
  const gen = genFilings?.[slug];
  if (gen && gen.length > 0) return gen.map((f) => expandGenerated(slug, f));
  return (FILINGS_13F[slug] ?? []).map((raw) => expandSample(slug, raw));
}

export function getLatestFiling(slug: string): Filing13F | undefined {
  const filings = getFilings13F(slug);
  return filings[filings.length - 1];
}

export function getPreviousFiling(slug: string): Filing13F | undefined {
  const filings = getFilings13F(slug);
  return filings.length >= 2 ? filings[filings.length - 2] : undefined;
}

/** 직전 분기 대비 보유 변동 (신규/청산/확대/축소) */
export function getQoQChanges(slug: string): HoldingChange[] {
  const prev = getPreviousFiling(slug);
  const curr = getLatestFiling(slug);
  if (!prev || !curr) return [];

  const prevMap = new Map(prev.holdings.map((h) => [h.ticker, h]));
  const currMap = new Map(curr.holdings.map((h) => [h.ticker, h]));
  const tickers = new Set([...prevMap.keys(), ...currMap.keys()]);

  const changes: HoldingChange[] = [];
  for (const ticker of tickers) {
    const p = prevMap.get(ticker);
    const c = currMap.get(ticker);
    const any = (c ?? p)!;
    const base = {
      ticker,
      nameKo: any.nameKo,
      sector: any.sector,
      prevWeightPct: p?.weightPct ?? 0,
      currWeightPct: c?.weightPct ?? 0,
      prevValueM: p?.valueM ?? 0,
      currValueM: c?.valueM ?? 0,
    };
    if (!p && c) changes.push({ ...base, kind: "NEW" });
    else if (p && !c) changes.push({ ...base, kind: "EXIT" });
    else if (p && c) {
      const ratio = c.valueM / p.valueM;
      if (ratio >= 1.05) changes.push({ ...base, kind: "ADD" });
      else if (ratio <= 0.95) changes.push({ ...base, kind: "TRIM" });
      else changes.push({ ...base, kind: "HOLD" });
    }
  }
  const order = { NEW: 0, ADD: 1, TRIM: 2, EXIT: 3, HOLD: 4 } as const;
  return changes.sort(
    (a, b) =>
      order[a.kind] - order[b.kind] ||
      Math.abs(b.currValueM - b.prevValueM) - Math.abs(a.currValueM - a.prevValueM),
  );
}

/** 인사이트: 샘플은 수기 텍스트, 실데이터는 변동 기반 자동 생성 */
export function getInsightFor(
  slug: string,
): { insightKo: string; insightTags: string[] } | undefined {
  const curr = getLatestFiling(slug);
  if (!curr) return undefined;
  if (curr.insightKo) {
    return { insightKo: curr.insightKo, insightTags: curr.insightTags ?? [] };
  }
  const prev = getPreviousFiling(slug);
  if (!prev) return undefined;
  const investor = getInvestor(slug);
  return buildInsight(investor?.nameKo ?? slug, prev, curr, getQoQChanges(slug));
}

// ---------- Form 4 ----------

function enrichTrade(t: Form4Trade & { issuerName?: string }): Form4Trade {
  return {
    ...t,
    companyNameKo: STOCKS[t.ticker]?.nameKo ?? t.issuerName ?? t.ticker,
  };
}

/** 공시일 최신순 인사이더 매매 (실데이터 있으면 실데이터만) */
export function getInsiderTrades(): Form4Trade[] {
  const source: (Form4Trade & { issuerName?: string })[] =
    genForm4 && genForm4.length > 0 ? genForm4 : FORM4_TRADES;
  return source
    .map(enrichTrade)
    .sort((a, b) => b.filedAt.localeCompare(a.filedAt) || b.valueM - a.valueM);
}

export function getInsiderTradesByTicker(ticker: string): Form4Trade[] {
  return getInsiderTrades().filter((t) => t.ticker === ticker);
}

export function getOtherFilings(): OtherFiling[] {
  const source: OtherFiling[] = genOther && genOther.length > 0 ? genOther : OTHER_FILINGS;
  return [...source].sort((a, b) => b.filedAt.localeCompare(a.filedAt));
}

// ---------- 통합 타임라인 ----------

function fmtB(valueM: number): string {
  return valueM >= 1000 ? `$${(valueM / 1000).toFixed(1)}B` : `$${Math.round(valueM)}M`;
}

/** 13F + 13D/G + 8-K 통합 공시 타임라인 (공시일 최신순) */
export function getFilingTimeline(investorSlug?: string): TimelineItem[] {
  const items: TimelineItem[] = [];

  for (const investor of INVESTORS) {
    if (investorSlug && investor.slug !== investorSlug) continue;
    for (const filing of getFilings13F(investor.slug)) {
      items.push({
        id: `13f-${investor.slug}-${filing.quarter}`,
        type: "13F",
        titleKo: `${investor.nameKo} ${filing.quarter} 포트폴리오 공시`,
        summaryKo: `${filing.holdings.length + (filing.othersCount ?? 0)}개 종목 · 총 ${fmtB(filing.totalValueM)} 규모`,
        investorSlug: investor.slug,
        eventDate: filing.periodEnd,
        filedAt: filing.filedAt,
      });
    }
  }

  for (const f of getOtherFilings()) {
    if (investorSlug && f.investorSlug !== investorSlug) continue;
    items.push({
      id: f.id,
      type: f.type,
      titleKo: f.investorSlug
        ? `${getInvestor(f.investorSlug)?.nameKo ?? ""} ${f.titleKo}`
        : f.titleKo,
      summaryKo: f.summaryKo,
      investorSlug: f.investorSlug,
      ticker: f.ticker || undefined,
      eventDate: f.eventDate,
      filedAt: f.filedAt,
    });
  }

  return items.sort((a, b) => b.filedAt.localeCompare(a.filedAt));
}

// ---------- 종목 → 보유 고래 ----------

export interface WhaleHolder {
  investor: Investor;
  holding: Holding;
  filing: Filing13F;
  change?: HoldingChange;
}

/** 이 종목을 최신 13F에 보유 중인 고래 목록 (비중 순) */
export function getHoldersOfTicker(ticker: string): WhaleHolder[] {
  const holders: WhaleHolder[] = [];
  for (const investor of INVESTORS) {
    const filing = getLatestFiling(investor.slug);
    const holding = filing?.holdings.find((h) => h.ticker === ticker);
    if (!filing || !holding) continue;
    const change = getQoQChanges(investor.slug).find((c) => c.ticker === ticker);
    holders.push({ investor: getInvestor(investor.slug)!, holding, filing, change });
  }
  return holders.sort((a, b) => b.holding.weightPct - a.holding.weightPct);
}

// ---------- 컨센서스 ----------

export interface ConsensusItem {
  ticker: string;
  nameKo: string;
  sector: Sector;
  holderCount: number;
  holders: Investor[];
  /** 이번 분기 신규/확대한 고래 수 */
  buyerCount: number;
}

/** 최신 13F 기준, 여러 고래가 겹쳐 보유한 종목 순위 */
export function getConsensus(minHolders = 2): ConsensusItem[] {
  const map = new Map<string, { holders: Investor[]; buyers: number; nameKo: string; sector: Sector }>();
  for (const investor of getInvestors()) {
    const filing = getLatestFiling(investor.slug);
    if (!filing) continue;
    const changes = getQoQChanges(investor.slug);
    for (const h of filing.holdings) {
      if (h.unlisted) continue;
      const entry =
        map.get(h.ticker) ?? { holders: [], buyers: 0, nameKo: h.nameKo, sector: h.sector };
      entry.holders.push(investor);
      const c = changes.find((x) => x.ticker === h.ticker);
      if (c && (c.kind === "NEW" || c.kind === "ADD")) entry.buyers += 1;
      map.set(h.ticker, entry);
    }
  }
  return [...map.entries()]
    .filter(([, v]) => v.holders.length >= minHolders)
    .map(([ticker, v]) => ({
      ticker,
      nameKo: v.nameKo,
      sector: v.sector,
      holderCount: v.holders.length,
      holders: v.holders,
      buyerCount: v.buyers,
    }))
    .sort((a, b) => b.holderCount - a.holderCount || b.buyerCount - a.buyerCount);
}

// ---------- 아티클 ----------

export function getArticles(): Article[] {
  return [...ARTICLES].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

/** 상세 페이지 정적 생성용 — 데이터에 등장하는 모든 (상장) 티커 */
export function getAllTickersInUse(): string[] {
  const tickers = new Set<string>();
  for (const investor of INVESTORS) {
    for (const f of getFilings13F(investor.slug)) {
      for (const h of f.holdings) if (!h.unlisted) tickers.add(h.ticker);
    }
  }
  for (const t of getInsiderTrades()) if (t.ticker) tickers.add(t.ticker);
  return [...tickers];
}
