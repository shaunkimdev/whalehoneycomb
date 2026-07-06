"use client";

/** 브라우저 쪽 구독 헬퍼 — 구독자 id/슬러그 캐시(localStorage) + 서버 API 동기화 */

const ID_KEY = "wh:subscriberId";
const SLUGS_KEY = "wh:subscriptions";
const EMAIL_KEY = "wh:email";

export function getSubscriberId(): string {
  let id = localStorage.getItem(ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(ID_KEY, id);
  }
  return id;
}

export function readLocalSlugs(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SLUGS_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function readEmail(): string {
  return localStorage.getItem(EMAIL_KEY) ?? "";
}

function writeLocal(slugs: string[], email?: string) {
  localStorage.setItem(SLUGS_KEY, JSON.stringify(slugs));
  if (email !== undefined) localStorage.setItem(EMAIL_KEY, email);
  window.dispatchEvent(new Event("wh:subscriptions-changed"));
}

/** 서비스워커 등록 + 푸시 구독 (권한 요청 포함). 거부/미지원/실패면 null. */
export async function enablePush(): Promise<PushSubscription | null> {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null;
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) return null;
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;
    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    if (existing) return existing;
    return await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  } catch {
    return null;
  }
}

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

/** 로컬 캐시 갱신 + 서버 저장 */
export async function syncSubscription(opts: {
  slugs: string[];
  email?: string;
  pushSubscription?: PushSubscription | null;
}): Promise<void> {
  writeLocal(opts.slugs, opts.email);
  const body: Record<string, unknown> = {
    id: getSubscriberId(),
    investorSlugs: opts.slugs,
    email: opts.email || readEmail() || undefined,
  };
  if (opts.pushSubscription) body.pushSubscription = opts.pushSubscription.toJSON();
  try {
    await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    // 오프라인이어도 로컬 상태는 유지
  }
}
