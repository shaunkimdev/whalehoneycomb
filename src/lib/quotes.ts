/**
 * 실시간 시세 QuoteProvider (서버 전용).
 * 체인: Finnhub(FINNHUB_API_KEY 있을 때) → Yahoo 비공식 chart API → Stooq CSV
 * → 전부 실패 시 STOCKS 목값("지연 데이터" 표기).
 * Next fetch 캐시(revalidate 60초)로 과도한 호출 방지.
 */
import { STOCKS } from "@/data/stocks";
import type { Quote } from "@/lib/types";

const REVALIDATE = 60;

function nowLabel(): string {
  return new Date().toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** BRK.B → BRK-B (야후), brk-b.us (스투크) */
function yahooSymbol(ticker: string): string {
  return ticker.replace(".", "-");
}

async function fromFinnhub(ticker: string): Promise<Quote | null> {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) return null;
  const res = await fetch(
    `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(ticker)}&token=${key}`,
    { next: { revalidate: REVALIDATE } },
  );
  if (!res.ok) return null;
  const d = await res.json();
  if (!d.c) return null;
  return { ticker, price: d.c, changePct: d.dp ?? 0, asOf: `${nowLabel()} 기준 (Finnhub)` };
}

async function fromYahoo(ticker: string): Promise<Quote | null> {
  const res = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      yahooSymbol(ticker),
    )}?range=1d&interval=1d`,
    {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: REVALIDATE },
    },
  );
  if (!res.ok) return null;
  const d = await res.json();
  const meta = d?.chart?.result?.[0]?.meta;
  const price = meta?.regularMarketPrice;
  const prev = meta?.chartPreviousClose ?? meta?.previousClose;
  if (typeof price !== "number") return null;
  const changePct = prev ? ((price - prev) / prev) * 100 : 0;
  return { ticker, price, changePct, asOf: `${nowLabel()} 기준` };
}

async function fromStooq(ticker: string): Promise<Quote | null> {
  const sym = ticker.replace(".", "-").toLowerCase() + ".us";
  const res = await fetch(`https://stooq.com/q/l/?s=${sym}&f=sd2t2ohlcv&h&e=csv`, {
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) return null;
  const lines = (await res.text()).trim().split("\n");
  if (lines.length < 2) return null;
  const cols = lines[1].split(",");
  const open = Number(cols[3]);
  const close = Number(cols[6]);
  if (!close || Number.isNaN(close)) return null;
  const changePct = open ? ((close - open) / open) * 100 : 0;
  return { ticker, price: close, changePct, asOf: `${nowLabel()} 기준 (Stooq)` };
}

function fallbackMock(ticker: string): Quote | null {
  const s = STOCKS[ticker];
  if (!s) return null;
  return { ticker, price: s.price, changePct: s.changePct, asOf: "지연 데이터 (오프라인)" };
}

async function getQuoteChain(ticker: string): Promise<Quote | null> {
  try {
    return (
      (await fromFinnhub(ticker).catch(() => null)) ??
      (await fromYahoo(ticker).catch(() => null)) ??
      (await fromStooq(ticker).catch(() => null)) ??
      fallbackMock(ticker)
    );
  } catch {
    return fallbackMock(ticker);
  }
}

/** 여러 티커 시세를 동시성 제한(6)으로 배치 조회 */
export async function getQuotes(tickers: string[]): Promise<Map<string, Quote>> {
  const unique = [...new Set(tickers.filter(Boolean))];
  const map = new Map<string, Quote>();
  const CONCURRENCY = 6;
  for (let i = 0; i < unique.length; i += CONCURRENCY) {
    const batch = unique.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map((t) => getQuoteChain(t)));
    results.forEach((q, j) => {
      if (q) map.set(batch[j], q);
    });
  }
  return map;
}

export async function getQuoteOne(ticker: string): Promise<Quote | null> {
  return getQuoteChain(ticker);
}
