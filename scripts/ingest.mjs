/**
 * SEC EDGAR 수집 파이프라인 (npm run ingest)
 * - 12명 투자자의 최근 2개 13F-HR (info table XML 파싱)
 * - 투자자 본인 Form 4 + 주요 기업 인사이더 Form 4
 * - SC 13D/G 메타
 * - CUSIP→티커: OpenFIGI (결과는 cusipMap.json에 캐시)
 * 산출물: src/data/generated/{filings13f,form4,otherFilings,cusipMap,meta}.json
 *
 * 주의: SEC WAF가 커스텀 UA를 차단하므로 브라우저형 UA + From 헤더 사용.
 * 요청 간 딜레이로 SEC 속도 제한(10req/s) 준수.
 */
import { XMLParser } from "fast-xml-parser";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "src", "data", "generated");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const SEC_HEADERS = { "User-Agent": UA, From: "hikim942@naver.com" };
const DELAY_MS = 160;

/** 추적 투자자 slug → CIK (EDGAR 검증 완료) */
const INVESTOR_CIKS = {
  "warren-buffett": "0001067983", // Berkshire Hathaway
  "bill-ackman": "0001336528", // Pershing Square
  "michael-burry": "0001649339", // Scion Asset Management
  "ray-dalio": "0001350694", // Bridgewater
  "stanley-druckenmiller": "0001536411", // Duquesne Family Office
  "david-tepper": "0001656456", // Appaloosa LP
  "carl-icahn": "0000921669", // Icahn Carl C
  "dan-loeb": "0001040273", // Third Point
  "david-einhorn": "0001489933", // DME Capital Management (구 Greenlight)
  "seth-klarman": "0001061768", // Baupost Group
  "li-lu": "0001709323", // Himalaya Capital
  "duan-yongping": "0001759760", // H&H International Investment
};

/** 인사이더 피드용 주요 기업 (미국 상장·Form 4 의무 기업만) */
const COMPANY_CIKS = {
  AAPL: "0000320193",
  MSFT: "0000789019",
  NVDA: "0001045810",
  AMZN: "0001018724",
  GOOG: "0001652044",
  META: "0001326801",
  TSLA: "0001318605",
  JPM: "0000019617",
  BAC: "0000070858",
  OXY: "0000797468",
  CVX: "0000093410",
  UNH: "0000731766",
  INTC: "0000050863",
  LLY: "0000059478",
  NFLX: "0001065280",
  AMD: "0000002488",
  PFE: "0000078003",
};

/** 유명 인사이더 한글 표기 (성 포함 매칭, 대문자) */
const INSIDER_KO = [
  [/BUFFETT WARREN/, "워런 버핏"],
  [/COOK TIMOTHY/, "팀 쿡"],
  [/HUANG JEN.?HSUN/, "젠슨 황"],
  [/NADELLA SATYA/, "사티아 나델라"],
  [/ZUCKERBERG MARK/, "마크 저커버그"],
  [/MUSK ELON/, "일론 머스크"],
  [/DIMON JAMES/, "제이미 다이먼"],
  [/SU LISA/, "리사 수"],
  [/JASSY ANDREW/, "앤디 재시"],
  [/PICHAI SUNDAR/, "순다르 피차이"],
  [/ICAHN CARL/, "칼 아이칸"],
  [/MOYNIHAN BRIAN/, "브라이언 모이니핸"],
  [/TAN LIP.?BU/, "립부 탄"],
  [/BOURLA ALBERT/, "앨버트 불라"],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let lastReq = 0;
async function secFetch(url) {
  const wait = lastReq + DELAY_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastReq = Date.now();
  const res = await fetch(url, { headers: SEC_HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res;
}

const xml = new XMLParser({
  ignoreAttributes: true,
  removeNSPrefix: true,
  parseTagValue: false,
});

function quarterLabel(periodEnd) {
  const [y, m] = periodEnd.split("-").map(Number);
  return `${y} Q${Math.ceil(m / 3)}`;
}

function accToPath(cik, accession) {
  return `https://www.sec.gov/Archives/edgar/data/${Number(cik)}/${accession.replaceAll("-", "")}`;
}

function prettyName(raw) {
  return String(raw)
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\s+/g, " ")
    .trim();
}

function insiderKo(rawUpper) {
  for (const [re, ko] of INSIDER_KO) if (re.test(rawUpper)) return ko;
  return prettyName(rawUpper);
}

// ---------- 13F ----------

async function fetchSubmissions(cik) {
  const res = await secFetch(`https://data.sec.gov/submissions/CIK${cik}.json`);
  return res.json();
}

/** recent 배열에서 form 조건에 맞는 항목들 추출 */
function recentFilings(sub, predicate, limit = 50) {
  const f = sub.filings.recent;
  const out = [];
  for (let i = 0; i < f.form.length && out.length < limit; i++) {
    if (!predicate(f.form[i], f.filingDate[i])) continue;
    out.push({
      form: f.form[i],
      filedAt: f.filingDate[i],
      reportDate: f.reportDate[i],
      accession: f.accessionNumber[i],
      primaryDocument: f.primaryDocument[i],
    });
  }
  return out;
}

async function fetchInfoTable(cik, accession) {
  const base = accToPath(cik, accession);
  const idx = await secFetch(`${base}/index.json`).then((r) => r.json());
  const xmls = idx.directory.item.filter(
    (it) => it.name.endsWith(".xml") && it.name !== "primary_doc.xml",
  );
  if (xmls.length === 0) throw new Error("info table xml not found");
  // 여러 개면 가장 큰 파일이 info table
  xmls.sort((a, b) => Number(b.size ?? 0) - Number(a.size ?? 0));
  const raw = await secFetch(`${base}/${xmls[0].name}`).then((r) => r.text());
  const doc = xml.parse(raw);
  let rows = doc?.informationTable?.infoTable ?? [];
  if (!Array.isArray(rows)) rows = [rows];
  // putCall(옵션) 제외, CUSIP 단위 합산
  const byCusip = new Map();
  for (const r of rows) {
    if (r.putCall) continue;
    const cusip = String(r.cusip).toUpperCase();
    const value = Number(r.value); // 2023년 이후 신고분은 달러 단위
    const shares = Number(r?.shrsOrPrnAmt?.sshPrnamt ?? 0);
    const cur = byCusip.get(cusip) ?? { cusip, nameEn: prettyName(r.nameOfIssuer), valueUsd: 0, shares: 0 };
    cur.valueUsd += value;
    cur.shares += shares;
    byCusip.set(cusip, cur);
  }
  return [...byCusip.values()].sort((a, b) => b.valueUsd - a.valueUsd);
}

/** 최근 2개 분기 13F (같은 분기의 /A 정정본이 있으면 그것을 채택) */
async function fetch13Fs(slug, cik, sub) {
  const filings = recentFilings(sub, (form) => form === "13F-HR" || form === "13F-HR/A", 8);
  const byPeriod = new Map();
  for (const f of filings) {
    const existing = byPeriod.get(f.reportDate);
    // /A(정정)가 나중에 나오므로 공시일이 더 최신인 것을 채택
    if (!existing || f.filedAt > existing.filedAt) byPeriod.set(f.reportDate, f);
  }
  const periods = [...byPeriod.keys()].sort().slice(-2); // 과거 → 최신
  const out = [];
  for (const period of periods) {
    const f = byPeriod.get(period);
    console.log(`  13F ${slug} ${period} (filed ${f.filedAt}) 파싱 중…`);
    const holdings = await fetchInfoTable(cik, f.accession);
    const totalValueM = holdings.reduce((s, h) => s + h.valueUsd, 0) / 1e6;
    // 전 종목 저장 (QoQ 변동 오탐 방지) — 티커 매핑은 상위 60개만 (OpenFIGI 쿼터)
    out.push({
      quarter: quarterLabel(period),
      periodEnd: period,
      filedAt: f.filedAt,
      totalValueM,
      holdings: holdings.map((h) => ({
        cusip: h.cusip,
        nameEn: h.nameEn,
        valueM: h.valueUsd / 1e6,
        shares: h.shares,
      })),
      othersCount: 0,
      othersValueM: 0,
    });
  }
  return out;
}

// ---------- Form 4 ----------

async function parseForm4(cik, accession, primaryDocument) {
  const base = accToPath(cik, accession);
  const docName = primaryDocument.replace(/^.*\//, ""); // "xslF345X05/foo.xml" → "foo.xml"
  const raw = await secFetch(`${base}/${docName}`).then((r) => r.text());
  const doc = xml.parse(raw)?.ownershipDocument;
  if (!doc) return null;
  const owner = Array.isArray(doc.reportingOwner) ? doc.reportingOwner[0] : doc.reportingOwner;
  const rel = owner?.reportingOwnerRelationship ?? {};
  const rawName = String(owner?.reportingOwnerId?.rptOwnerName ?? "").toUpperCase();
  let roleKo = "임원";
  if (String(rel.isDirector) === "1" || rel.isDirector === true) roleKo = "이사";
  if (String(rel.isTenPercentOwner) === "1" || rel.isTenPercentOwner === true) roleKo = "10% 이상 주주";
  if (rel.officerTitle && rel.officerTitle !== "See Remarks") roleKo = String(rel.officerTitle);

  let txs = doc?.nonDerivativeTable?.nonDerivativeTransaction ?? [];
  if (!Array.isArray(txs)) txs = [txs];
  const sums = { P: { shares: 0, valueUsd: 0, date: "" }, S: { shares: 0, valueUsd: 0, date: "" } };
  for (const t of txs) {
    const code = t?.transactionCoding?.transactionCode;
    if (code !== "P" && code !== "S") continue;
    const shares = Number(t?.transactionAmounts?.transactionShares?.value ?? 0);
    const price = Number(t?.transactionAmounts?.transactionPricePerShare?.value ?? 0);
    sums[code].shares += shares;
    sums[code].valueUsd += shares * price;
    sums[code].date = String(t?.transactionDate?.value ?? "").slice(0, 10);
  }
  const trades = [];
  for (const [code, s] of Object.entries(sums)) {
    if (s.shares <= 0) continue;
    trades.push({
      insiderNameEn: prettyName(rawName),
      insiderNameKo: insiderKo(rawName),
      roleKo,
      ticker: String(doc?.issuer?.issuerTradingSymbol ?? "").toUpperCase().replace("/", "."),
      issuerName: prettyName(doc?.issuer?.issuerName ?? ""),
      side: code === "P" ? "BUY" : "SELL",
      shares: Math.round(s.shares),
      valueM: s.valueUsd / 1e6,
      tradeDate: s.date,
    });
  }
  return trades;
}

async function fetchForm4s({ cik, sinceDays, maxFilings, minValueM, sourceInvestorSlug }) {
  const sub = await fetchSubmissions(cik);
  const since = new Date(Date.now() - sinceDays * 86400000).toISOString().slice(0, 10);
  const filings = recentFilings(sub, (form, date) => form === "4" && date >= since, maxFilings);
  const out = [];
  for (const f of filings) {
    try {
      const trades = await parseForm4(cik, f.accession, f.primaryDocument);
      for (const t of trades ?? []) {
        if (t.valueM < minValueM) continue;
        out.push({
          id: `f4-${f.accession}-${t.side}`,
          ...t,
          filedAt: f.filedAt,
          sourceInvestorSlug,
        });
      }
    } catch (e) {
      console.log(`  Form4 파싱 실패 ${f.accession}: ${e.message}`);
    }
  }
  return out;
}

// ---------- 13D/G ----------

function collect13DG(slug, sub, sinceDays = 240) {
  const since = new Date(Date.now() - sinceDays * 86400000).toISOString().slice(0, 10);
  // EDGAR 폼 명칭: 과거 "SC 13D/A", 현재 "SCHEDULE 13D/A" 혼용
  const filings = recentFilings(
    sub,
    (form, date) => /^(SC |SCHEDULE )13[DG]/.test(form) && date >= since,
    6,
  );
  // 같은 날 여러 건(연례 13G 일괄 정정 등)은 하나로 묶는다
  const byDay = new Map();
  for (const f of filings) {
    const type = f.form.includes("13D") ? "13D" : "13G";
    const key = `${type}-${f.filedAt}`;
    const cur = byDay.get(key);
    if (cur) cur.count += 1;
    else byDay.set(key, { f, type, count: 1 });
  }
  return [...byDay.values()].map(({ f, type, count }) => ({
    id: `dg-${f.accession}`,
    type,
    investorSlug: slug,
    ticker: "",
    titleKo:
      `${f.form.replace("SCHEDULE", "").replace("SC", "").trim()} 공시 제출` +
      (count > 1 ? ` 외 ${count - 1}건` : ""),
    summaryKo:
      type === "13D"
        ? "특정 기업 지분 5% 초과 보유·경영참여 목적 공시(13D)입니다. 원문에서 대상 기업을 확인하세요."
        : "특정 기업 지분 5% 초과 보유(단순투자 목적, 13G) 공시입니다.",
    eventDate: f.reportDate || f.filedAt,
    filedAt: f.filedAt,
  }));
}

// ---------- CUSIP → 티커 (OpenFIGI) ----------

async function mapCusips(cusips, cache) {
  const unknown = cusips.filter((c) => !(c in cache));
  console.log(`CUSIP 매핑: 총 ${cusips.length}개 중 신규 ${unknown.length}개 OpenFIGI 조회`);
  for (let i = 0; i < unknown.length; i += 10) {
    const batch = unknown.slice(i, i + 10);
    const res = await fetch("https://api.openfigi.com/v3/mapping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // exchCode US: 미국 종합거래소 티커로 고정 (해외 상장 티커 오매핑 방지)
      body: JSON.stringify(
        batch.map((c) => ({ idType: "ID_CUSIP", idValue: c, exchCode: "US" })),
      ),
    });
    if (res.status === 429) {
      console.log("  OpenFIGI 속도 제한 — 30초 대기");
      await sleep(30000);
      i -= 10;
      continue;
    }
    if (!res.ok) throw new Error(`OpenFIGI HTTP ${res.status}`);
    const data = await res.json();
    batch.forEach((cusip, j) => {
      const hit = data[j]?.data?.[0];
      cache[cusip] = hit ? String(hit.ticker).replace("/", ".") : null;
    });
    console.log(`  ${Math.min(i + 10, unknown.length)}/${unknown.length}`);
    await sleep(2600); // 키 없는 티어: 분당 25요청
  }
  return cache;
}

// ---------- main ----------

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const cachePath = path.join(OUT_DIR, "cusipMap.json");
  const cusipCache = fs.existsSync(cachePath)
    ? JSON.parse(fs.readFileSync(cachePath, "utf8"))
    : {};

  const filings13f = {};
  const otherFilings = [];
  const form4 = [];
  const investorStatus = {};

  for (const [slug, cik] of Object.entries(INVESTOR_CIKS)) {
    try {
      console.log(`\n=== ${slug} (CIK ${cik}) ===`);
      const sub = await fetchSubmissions(cik);
      filings13f[slug] = await fetch13Fs(slug, cik, sub);
      otherFilings.push(...collect13DG(slug, sub));
      const ownTrades = await fetchForm4s({
        cik,
        sinceDays: 120,
        maxFilings: 10,
        minValueM: 0,
        sourceInvestorSlug: slug,
      });
      form4.push(...ownTrades);
      investorStatus[slug] = "ok";
    } catch (e) {
      console.log(`!! ${slug} 수집 실패 → 샘플 폴백: ${e.message}`);
      investorStatus[slug] = "fallback";
    }
  }

  console.log("\n=== 주요 기업 인사이더 Form 4 ===");
  for (const [ticker, cik] of Object.entries(COMPANY_CIKS)) {
    try {
      const trades = await fetchForm4s({ cik, sinceDays: 30, maxFilings: 10, minValueM: 0.5 });
      console.log(`  ${ticker}: ${trades.length}건`);
      form4.push(...trades);
    } catch (e) {
      console.log(`  ${ticker} 실패: ${e.message}`);
    }
  }
  // 같은 공시가 투자자/기업 양쪽에서 잡히면 중복 제거
  const seen = new Set();
  const form4Dedup = form4.filter((t) => (seen.has(t.id) ? false : (seen.add(t.id), true)));
  form4Dedup.sort((a, b) => b.filedAt.localeCompare(a.filedAt));

  // CUSIP → 티커 (필링당 상위 60개만 — 나머지는 이름만 표시)
  const allCusips = [
    ...new Set(
      Object.values(filings13f).flatMap((fs2) =>
        fs2.flatMap((f) => f.holdings.slice(0, 60).map((h) => h.cusip)),
      ),
    ),
  ];
  await mapCusips(allCusips, cusipCache);
  for (const fsArr of Object.values(filings13f))
    for (const f of fsArr)
      for (const h of f.holdings) h.ticker = cusipCache[h.cusip] ?? null;
  // 캐시에 없는(매핑 안 한) 하위 종목은 ticker=null → 화면에서 unlisted 처리

  fs.writeFileSync(cachePath, JSON.stringify(cusipCache, null, 1));
  fs.writeFileSync(path.join(OUT_DIR, "filings13f.json"), JSON.stringify(filings13f, null, 1));
  fs.writeFileSync(path.join(OUT_DIR, "form4.json"), JSON.stringify(form4Dedup, null, 1));
  fs.writeFileSync(path.join(OUT_DIR, "otherFilings.json"), JSON.stringify(otherFilings, null, 1));
  fs.writeFileSync(
    path.join(OUT_DIR, "meta.json"),
    JSON.stringify({ fetchedAt: new Date().toISOString(), investorStatus }, null, 1),
  );
  console.log(`\n완료: ${OUT_DIR}`);
  console.log(
    `13F ${Object.keys(filings13f).length}명 / Form4 ${form4Dedup.length}건 / 13D·G ${otherFilings.length}건`,
  );
}

main().catch((e) => {
  console.error("ingest 실패:", e);
  process.exit(1);
});
