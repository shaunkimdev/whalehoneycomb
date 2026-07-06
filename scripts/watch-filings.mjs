/**
 * 공시 워처 (npm run watch:filings)
 * - 5분(WATCH_INTERVAL_MIN) 간격으로 추적 투자자 12명의 EDGAR submissions를 폴링
 * - 새 13F/13D·G/Form 4 발견 시 구독자에게 Web Push + Gmail SMTP 이메일 발송
 *   (VAPID/GMAIL 환경변수 미설정 시 콘솔 로그로 대체)
 * - 발송 이력: data/store/lastSeen.json (중복 발송 방지)
 * - `--once` 옵션: 1회만 검사하고 종료 (테스트용)
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";
import webpush from "web-push";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const STORE = path.join(root, "data", "store");
const LAST_SEEN = path.join(STORE, "lastSeen.json");
const SUBS = path.join(STORE, "subscriptions.json");

// .env.local 로드 (의존성 없이 수동 파싱)
const envPath = path.join(root, ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim();
  }
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const SEC_HEADERS = { "User-Agent": UA, From: "hikim942@naver.com" };

const INVESTORS = {
  "warren-buffett": { cik: "0001067983", nameKo: "워런 버핏" },
  "bill-ackman": { cik: "0001336528", nameKo: "빌 애크먼" },
  "michael-burry": { cik: "0001649339", nameKo: "마이클 버리" },
  "ray-dalio": { cik: "0001350694", nameKo: "레이 달리오" },
  "stanley-druckenmiller": { cik: "0001536411", nameKo: "스탠리 드러켄밀러" },
  "david-tepper": { cik: "0001656456", nameKo: "데이비드 테퍼" },
  "carl-icahn": { cik: "0000921669", nameKo: "칼 아이칸" },
  "dan-loeb": { cik: "0001040273", nameKo: "댄 러브" },
  "david-einhorn": { cik: "0001489933", nameKo: "데이비드 아인혼" },
  "seth-klarman": { cik: "0001061768", nameKo: "세스 클라만" },
  "li-lu": { cik: "0001709323", nameKo: "리 루" },
  "duan-yongping": { cik: "0001759760", nameKo: "돤융핑" },
};

const WATCH_FORMS = /^(13F-HR|4|(SC |SCHEDULE )13[DG])/;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function loadJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

// ---------- 발송 채널 ----------

const vapidReady = Boolean(
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY,
);
if (vapidReady) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:hikim942@naver.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );
}

const mailReady = Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
const mailer = mailReady
  ? nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    })
  : null;

async function notifySubscribers(slug, title, body, url) {
  const subs = loadJson(SUBS, []).filter((s) => s.investorSlugs?.includes(slug));
  if (subs.length === 0) {
    console.log(`  구독자 없음 (${slug})`);
    return;
  }
  for (const sub of subs) {
    if (vapidReady && sub.pushSubscription) {
      try {
        await webpush.sendNotification(
          sub.pushSubscription,
          JSON.stringify({ title, body, url }),
        );
        console.log(`  ✅ 푸시 발송 → ${sub.id.slice(0, 8)}…`);
      } catch (e) {
        console.log(`  ⚠️ 푸시 실패 (${e.statusCode ?? e.message})`);
      }
    } else if (sub.pushSubscription) {
      console.log(`  [푸시 대체 로그] ${title} — VAPID 키 미설정 (npm run push:keys)`);
    }
    if (sub.email) {
      if (mailer) {
        try {
          await mailer.sendMail({
            from: `"웨일허니콤" <${process.env.GMAIL_USER}>`,
            to: sub.email,
            subject: title,
            text: `${body}\n\n확인하기: http://localhost:3000${url}`,
          });
          console.log(`  ✅ 이메일 발송 → ${sub.email}`);
        } catch (e) {
          console.log(`  ⚠️ 이메일 실패: ${e.message}`);
        }
      } else {
        console.log(
          `  [이메일 대체 로그] to=${sub.email} | ${title} — GMAIL_USER/GMAIL_APP_PASSWORD 미설정`,
        );
      }
    }
  }
}

// ---------- 폴링 ----------

async function checkOnce() {
  const lastSeen = loadJson(LAST_SEEN, {});
  let foundNew = false;

  for (const [slug, { cik, nameKo }] of Object.entries(INVESTORS)) {
    try {
      const d = await fetch(`https://data.sec.gov/submissions/CIK${cik}.json`, {
        headers: SEC_HEADERS,
      }).then((r) => (r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status))));
      const f = d.filings.recent;
      const newOnes = [];
      for (let i = 0; i < f.form.length; i++) {
        if (!WATCH_FORMS.test(f.form[i])) continue;
        if (lastSeen[slug] && f.accessionNumber[i] === lastSeen[slug]) break;
        newOnes.push({ form: f.form[i], filedAt: f.filingDate[i], acc: f.accessionNumber[i] });
        if (newOnes.length >= 5) break; // 초기 실행 폭주 방지
      }
      // 최신 accession 기록
      for (let i = 0; i < f.form.length; i++) {
        if (WATCH_FORMS.test(f.form[i])) {
          lastSeen[slug] = f.accessionNumber[i];
          break;
        }
      }
      if (newOnes.length > 0 && lastSeen[`${slug}:init`]) {
        foundNew = true;
        for (const n of newOnes.reverse()) {
          const formLabel = n.form.startsWith("13F")
            ? "13F 포트폴리오"
            : n.form === "4"
              ? "내부자 매매(Form 4)"
              : "대량보유 보고(13D/G)";
          const title = `🐳 ${nameKo} 새 공시: ${formLabel}`;
          const body = `${n.form} · 공시일 ${n.filedAt}`;
          console.log(`\n${title} | ${body}`);
          await notifySubscribers(slug, title, body, `/investors/${slug}`);
        }
      } else if (newOnes.length > 0) {
        console.log(`  ${slug}: 초기 기준점 설정 (${newOnes.length}건 스킵)`);
      }
      lastSeen[`${slug}:init`] = true;
    } catch (e) {
      console.log(`  ${slug} 확인 실패: ${e.message}`);
    }
    await sleep(200);
  }

  fs.mkdirSync(STORE, { recursive: true });
  fs.writeFileSync(LAST_SEEN, JSON.stringify(lastSeen, null, 1));

  if (foundNew) {
    console.log("\n새 공시 감지 → 데이터 재수집 (npm run ingest)…");
    spawnSync("node", [path.join(root, "scripts", "ingest.mjs")], { stdio: "inherit" });
  }
}

const once = process.argv.includes("--once");
const intervalMin = Number(process.env.WATCH_INTERVAL_MIN || 5);

console.log(
  `공시 워처 시작 — 푸시:${vapidReady ? "ON" : "OFF(콘솔 대체)"} / 이메일:${mailReady ? "ON" : "OFF(콘솔 대체)"} / 간격:${intervalMin}분${once ? " / 1회 실행" : ""}`,
);

await checkOnce();
if (!once) {
  setInterval(checkOnce, intervalMin * 60 * 1000);
}
