"use client";

import { useEffect, useState } from "react";
import {
  enablePush,
  readEmail,
  readLocalSlugs,
  syncSubscription,
} from "@/lib/subscriptionClient";

/**
 * 새 공시 알림 구독 버튼.
 * 구독 시: 브라우저 푸시 권한 요청(가능할 때) + 이메일(선택)을 서버에 등록.
 * 워처(scripts/watch-filings.mjs)가 새 공시를 감지하면 푸시/이메일로 발송한다.
 */
const IS_STATIC = process.env.NEXT_PUBLIC_STATIC === "1";

export function SubscribeButton({ slug }: { slug: string }) {
  const [subscribed, setSubscribed] = useState(false);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [pushState, setPushState] = useState<"idle" | "ok" | "denied">("idle");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSubscribed(readLocalSlugs().includes(slug));
    setEmail(readEmail());
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      setPushState("ok");
    }
  }, [slug]);

  async function unsubscribe() {
    const next = readLocalSlugs().filter((s) => s !== slug);
    setSubscribed(false);
    await syncSubscription({ slugs: next });
  }

  async function confirmSubscribe() {
    const slugs = [...new Set([...readLocalSlugs(), slug])];
    setSubscribed(true);
    setOpen(false);
    const push = await enablePush();
    setPushState(push ? "ok" : "denied");
    await syncSubscription({ slugs, email: email.trim(), pushSubscription: push });
  }

  // 정적 배포(GitHub Pages)에서는 구독 서버가 없어 비활성화
  if (IS_STATIC) {
    return (
      <button
        disabled
        title="정적 호스팅 버전에서는 알림을 지원하지 않아요. 로컬 실행 시 사용 가능합니다."
        className="shrink-0 cursor-not-allowed rounded-xl bg-fill px-4 py-2.5 text-sm font-bold text-muted"
      >
        🔔 알림은 로컬 버전에서
      </button>
    );
  }

  if (!mounted) {
    return (
      <button className="shrink-0 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white">
        🔔 새 공시 알림 받기
      </button>
    );
  }

  if (subscribed) {
    return (
      <button
        onClick={unsubscribe}
        className="shrink-0 rounded-xl bg-fill px-4 py-2.5 text-sm font-bold text-ink-2 transition-colors hover:bg-line"
        title="클릭하면 알림을 해제합니다"
      >
        🔔 알림 받는 중{pushState === "ok" ? " · 푸시 켜짐" : ""}
      </button>
    );
  }

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
      >
        🔔 새 공시 알림 받기
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-30 w-72 rounded-2xl border border-line bg-card p-4 shadow-lg">
          <p className="text-sm font-bold">새 공시가 올라오면 알려드려요</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            확인을 누르면 브라우저 푸시 권한을 요청해요. 이메일은 선택 사항입니다.
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일 (선택)"
            className="mt-3 w-full rounded-xl border border-line bg-fill px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <div className="mt-3 flex gap-2">
            <button
              onClick={confirmSubscribe}
              className="flex-1 rounded-xl bg-primary py-2 text-sm font-bold text-white"
            >
              알림 켜기
            </button>
            <button
              onClick={() => setOpen(false)}
              className="rounded-xl bg-fill px-3 py-2 text-sm font-semibold text-ink-2"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
