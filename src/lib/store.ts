/**
 * 구독 저장소 (서버 전용) — data/store/subscriptions.json 파일 기반.
 * 로컬/소규모 운영용. 배포 확장 시 DB로 교체 지점.
 */
import fs from "node:fs";
import path from "node:path";

export interface PushSubscriptionJSON {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export interface Subscriber {
  id: string;
  investorSlugs: string[];
  email?: string;
  pushSubscription?: PushSubscriptionJSON;
  updatedAt: string;
}

const STORE_DIR = path.join(process.cwd(), "data", "store");
const FILE = path.join(STORE_DIR, "subscriptions.json");

function readAll(): Subscriber[] {
  try {
    if (!fs.existsSync(FILE)) return [];
    return JSON.parse(fs.readFileSync(FILE, "utf8")) as Subscriber[];
  } catch {
    return [];
  }
}

function writeAll(subs: Subscriber[]) {
  fs.mkdirSync(STORE_DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(subs, null, 1));
}

export function getSubscriber(id: string): Subscriber | undefined {
  return readAll().find((s) => s.id === id);
}

export function upsertSubscriber(sub: Omit<Subscriber, "updatedAt">): Subscriber {
  const subs = readAll();
  const next: Subscriber = { ...sub, updatedAt: new Date().toISOString() };
  const i = subs.findIndex((s) => s.id === sub.id);
  if (i >= 0) subs[i] = next;
  else subs.push(next);
  writeAll(subs);
  return next;
}

export function deleteSubscriber(id: string) {
  writeAll(readAll().filter((s) => s.id !== id));
}
