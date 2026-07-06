import Image from "next/image";
import Link from "next/link";
import { fmtDate, fmtSignedPct, pctColor } from "@/lib/format";
import type { ChangeKind, Investor } from "@/lib/types";

/** 토스풍 흰색 라운드 카드 */
export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-[20px] bg-card p-5 ${className}`}>{children}</div>
  );
}

export function SectionTitle({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-3 mt-8 flex items-end justify-between px-1 first:mt-0">
      <h2 className="text-lg font-bold md:text-xl">{children}</h2>
      {right}
    </div>
  );
}

/** 인물 아바타 — 위키미디어 CC 사진이 있으면 사진, 없으면 이니셜 */
export function Avatar({
  investor,
  size = 48,
}: {
  investor: Pick<Investor, "initials" | "avatarColor" | "nameKo" | "photo">;
  size?: number;
}) {
  if (investor.photo) {
    return (
      <Image
        src={investor.photo.url}
        alt={investor.nameKo}
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      aria-label={investor.nameKo}
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{
        width: size,
        height: size,
        backgroundColor: investor.avatarColor,
        fontSize: size * 0.36,
      }}
    >
      {investor.initials}
    </div>
  );
}

/**
 * 공시 날짜 병기 — 모든 공시 카드에 공통 사용.
 * 보고기준일(어느 시점의 데이터인지)과 공시일(언제 공개됐는지)을 항상 함께 보여준다.
 */
export function DateStamp({
  periodEnd,
  filedAt,
  periodLabel = "보고기준일",
}: {
  periodEnd: string;
  filedAt: string;
  periodLabel?: string;
}) {
  return (
    <p className="text-xs text-muted">
      <span title="이 데이터가 기준으로 삼는 시점입니다">
        {periodLabel} {fmtDate(periodEnd)}
      </span>
      <span className="mx-1.5">·</span>
      <span title="SEC에 실제로 제출·공개된 날짜입니다">
        공시일 {fmtDate(filedAt)}
      </span>
    </p>
  );
}

const CHANGE_STYLE: Record<ChangeKind, { label: string; cls: string }> = {
  NEW: { label: "🆕 신규", cls: "bg-primary-soft text-primary" },
  ADD: { label: "➕ 확대", cls: "bg-up-soft text-up" },
  TRIM: { label: "➖ 축소", cls: "bg-down-soft text-down" },
  EXIT: { label: "❌ 청산", cls: "bg-fill text-muted" },
  HOLD: { label: "유지", cls: "bg-fill text-ink-2" },
};

export function ChangeBadge({ kind }: { kind: ChangeKind }) {
  const { label, cls } = CHANGE_STYLE[kind];
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-lg px-2 py-0.5 text-xs font-semibold ${cls}`}
    >
      {label}
    </span>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-lg bg-fill px-2.5 py-1 text-xs font-semibold text-ink-2">
      {children}
    </span>
  );
}

/** 등락률 칩 (상승 빨강 / 하락 파랑) */
export function PctChip({ pct, digits = 1 }: { pct: number; digits?: number }) {
  return (
    <span className={`tnum font-semibold ${pctColor(pct)}`}>
      {fmtSignedPct(pct, digits)}
    </span>
  );
}

/** 매수/매도 뱃지 (Form 4) */
export function SideBadge({ side }: { side: "BUY" | "SELL" }) {
  return side === "BUY" ? (
    <span className="inline-flex w-12 justify-center rounded-lg bg-up-soft py-1 text-xs font-bold text-up">
      매수
    </span>
  ) : (
    <span className="inline-flex w-12 justify-center rounded-lg bg-down-soft py-1 text-xs font-bold text-down">
      매도
    </span>
  );
}

export function TickerLink({
  ticker,
  children,
  className = "",
}: {
  ticker: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={`/stocks/${encodeURIComponent(ticker)}`}
      className={`hover:underline ${className}`}
    >
      {children}
    </Link>
  );
}
