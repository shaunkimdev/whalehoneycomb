/** VAPID 키 생성 → .env.local에 기록 (npm run push:keys) */
import webpush from "web-push";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env.local");

const existing = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
if (existing.includes("VAPID_PRIVATE_KEY")) {
  console.log(".env.local에 VAPID 키가 이미 있습니다. 건너뜁니다.");
  process.exit(0);
}

const keys = webpush.generateVAPIDKeys();
const lines = [
  existing.trimEnd(),
  `NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`,
  `VAPID_PRIVATE_KEY=${keys.privateKey}`,
  `VAPID_SUBJECT=mailto:hikim942@naver.com`,
  "",
]
  .filter((l, i) => l !== "" || i > 0)
  .join("\n");
fs.writeFileSync(envPath, lines);
console.log("VAPID 키를 생성해 .env.local에 저장했습니다.");
console.log("PUBLIC:", keys.publicKey);
