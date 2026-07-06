/** $M 단위 금액 → "$65.0B" / "$450M" / "$2.5M" */
export function fmtUsdM(valueM: number): string {
  if (valueM >= 1000) return `$${(valueM / 1000).toFixed(1)}B`;
  if (valueM >= 1) return `$${Math.round(valueM)}M`;
  return `$${(valueM * 1000).toFixed(0)}K`;
}

/** 주식 수 → "1,234,567주" */
export function fmtShares(shares: number): string {
  return `${shares.toLocaleString("ko-KR")}주`;
}

/** 등락률 → "+2.4%" / "-1.1%" */
export function fmtSignedPct(pct: number, digits = 1): string {
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(digits)}%`;
}

/** 등락률 색상 클래스 (상승 빨강 / 하락 파랑, 국내 관례) */
export function pctColor(pct: number): string {
  if (pct > 0) return "text-up";
  if (pct < 0) return "text-down";
  return "text-muted";
}

/** "2026-05-15" → "2026.05.15" */
export function fmtDate(iso: string): string {
  return iso.replaceAll("-", ".");
}

/** 기준 날짜 대비 상대 표기: "오늘" / "어제" / "3일 전" / "2026.05.15" */
export function fmtRelative(iso: string, today = new Date().toISOString().slice(0, 10)): string {
  const d = new Date(iso + "T00:00:00");
  const t = new Date(today + "T00:00:00");
  const diff = Math.round((t.getTime() - d.getTime()) / 86400000);
  if (diff <= 0) return "오늘";
  if (diff === 1) return "어제";
  if (diff < 14) return `${diff}일 전`;
  return fmtDate(iso);
}

/** USD 가격 → "$232.00" */
export function fmtPrice(price: number): string {
  return `$${price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
