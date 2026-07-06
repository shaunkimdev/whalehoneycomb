# 🐳 웨일허니콤 (whalehoneycomb)

버핏부터 버리까지 — 미국 주식 고래 12명의 SEC 공시(13F 포트폴리오·내부자 매매·대량보유 보고)를
한국어로 쉽게 보여주는 트래커입니다. 토스증권 스타일의 반응형 UI(PC/모바일)로 만들었습니다.

> 본 프로젝트는 정보 제공 목적이며 투자 자문이 아닙니다. 13F는 분기 마감 후 최대 45일 지연
> 공시되고 공매도·옵션·현금 비중은 포함되지 않습니다. 모든 투자 판단과 책임은 투자자 본인에게 있습니다.

## 기능

- **13F 포트폴리오**: 투자자별 보유 종목·비중·평가액, 직전 분기 대비 변동(신규/청산/확대/축소),
  변동 데이터 기반 한국어 인사이트 자동 생성 — 보고기준일·공시일 병기
- **인사이더 매매(Form 4)**: 추적 투자자 본인 + 주요 기업 임원의 매수/매도 피드
- **13D/G**: 대량보유·경영참여 공시 타임라인
- **실시간 주가**: 야후→Stooq 무료 소스 체인(60초 캐시), `FINNHUB_API_KEY` 설정 시 Finnhub 우선
- **컨센서스**: 여러 고래가 겹쳐 보유한 종목 순위
- **알림**(로컬 실행 시): 새 공시 감지 → Web Push + Gmail 이메일

## 실행

```bash
npm install
npm run ingest          # SEC EDGAR 실데이터 수집 (13F/Form4/13D·G)
npm run dev             # http://localhost:3000
```

### 알림 워처 (선택)

```bash
npm run push:keys       # Web Push VAPID 키 생성 (.env.local)
npm run watch:filings   # 5분 간격 새 공시 감지 → 푸시/이메일 발송
```

이메일 발송은 `.env.example`을 참고해 `.env.local`에 Gmail 앱 비밀번호를 설정하세요.
미설정 시 콘솔 로그로 대체됩니다.

## 배포

`main` 푸시 또는 매일 05:30 UTC에 GitHub Actions가 EDGAR 데이터를 재수집하고
GitHub Pages에 정적 배포합니다(`.github/workflows/pages.yml`).
정적 버전에서는 시세가 배포 시점 기준이며 알림 구독은 비활성화됩니다.

## 데이터 출처

- [SEC EDGAR](https://www.sec.gov/cgi-bin/browse-edgar) — 13F-HR, Form 4, Schedule 13D/G
- [OpenFIGI](https://www.openfigi.com/) — CUSIP→티커 매핑
- 인물 사진: Wikimedia Commons (각 페이지에 라이선스 표기)
