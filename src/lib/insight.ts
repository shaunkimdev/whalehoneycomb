/**
 * 13F 변동 데이터로 서술형 인사이트(한국어)를 자동 생성.
 * 매수 추천이 아닌 사실 서술 원칙 — "무엇이 달라졌는지"만 말한다.
 */
import type { Filing13F, HoldingChange, Sector } from "@/lib/types";

function sectorWeights(filing: Filing13F): Map<Sector, number> {
  const m = new Map<Sector, number>();
  for (const h of filing.holdings) m.set(h.sector, (m.get(h.sector) ?? 0) + h.weightPct);
  return m;
}

function listNames(items: { nameKo: string }[], max = 3): string {
  const names = items.slice(0, max).map((i) => i.nameKo);
  const rest = items.length - names.length;
  return names.join("·") + (rest > 0 ? ` 등 ${items.length}종목` : "");
}

export function buildInsight(
  investorNameKo: string,
  prev: Filing13F,
  curr: Filing13F,
  changes: HoldingChange[],
): { insightKo: string; insightTags: string[] } {
  const sentences: string[] = [];
  const tags: string[] = [];

  const news = changes.filter((c) => c.kind === "NEW");
  const exits = changes.filter((c) => c.kind === "EXIT");
  const adds = changes.filter((c) => c.kind === "ADD");
  const trims = changes.filter((c) => c.kind === "TRIM");

  if (news.length > 0) {
    sentences.push(`${investorNameKo}는 이번 분기 ${listNames(news)}을(를) 신규 편입했습니다.`);
    for (const n of news.slice(0, 2)) tags.push(`🆕 ${n.nameKo}`);
  }
  if (exits.length > 0) {
    sentences.push(`${listNames(exits)}은(는) 전량 매도했습니다.`);
    if (exits[0]) tags.push(`❌ ${exits[0].nameKo} 청산`);
  }

  // 가장 크게 움직인 섹터
  const prevW = sectorWeights(prev);
  const currW = sectorWeights(curr);
  let topSector: Sector | null = null;
  let topDelta = 0;
  for (const s of new Set([...prevW.keys(), ...currW.keys()])) {
    const d = (currW.get(s) ?? 0) - (prevW.get(s) ?? 0);
    if (Math.abs(d) > Math.abs(topDelta)) {
      topDelta = d;
      topSector = s;
    }
  }
  if (topSector && Math.abs(topDelta) >= 1.5) {
    const from = (prevW.get(topSector) ?? 0).toFixed(1);
    const to = (currW.get(topSector) ?? 0).toFixed(1);
    sentences.push(
      `${topSector} 섹터 비중은 ${from}%→${to}%로 ${topDelta > 0 ? "늘었" : "줄었"}습니다.`,
    );
    tags.push(`${topDelta > 0 ? "➕" : "➖"} ${topSector} ${topDelta > 0 ? "확대" : "축소"}`);
  }

  const topAdd = adds[0];
  if (topAdd && topAdd.prevValueM > 0) {
    const pct = Math.round(((topAdd.currValueM - topAdd.prevValueM) / topAdd.prevValueM) * 100);
    if (pct >= 15) {
      sentences.push(`기존 보유 중에서는 ${topAdd.nameKo} 평가액을 약 ${pct}% 늘렸습니다.`);
      tags.push(`➕ ${topAdd.nameKo} 확대`);
    }
  }
  const topTrim = trims[0];
  if (topTrim && topTrim.prevValueM > 0) {
    const pct = Math.round(((topTrim.prevValueM - topTrim.currValueM) / topTrim.prevValueM) * 100);
    if (pct >= 15) {
      sentences.push(`${topTrim.nameKo}은(는) 약 ${pct}% 덜어냈습니다.`);
      tags.push(`➖ ${topTrim.nameKo} 축소`);
    }
  }

  if (sentences.length === 0) {
    sentences.push(
      `${investorNameKo}의 포트폴리오는 직전 분기와 큰 변화가 없었습니다. 기존 보유를 그대로 유지하는 흐름입니다.`,
    );
    tags.push("변화 적음 · 유지");
  }

  sentences.push(
    `위 내용은 보고기준일(${curr.periodEnd.replaceAll("-", ".")}) 기준으로, 공시까지 최대 45일의 시차가 있어 현재 포지션과 다를 수 있습니다.`,
  );

  return { insightKo: sentences.join(" "), insightTags: tags.slice(0, 4) };
}
