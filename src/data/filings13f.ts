/**
 * 13F 샘플 데이터 (투자자별 2개 분기).
 * holdings: [티커, 평가액($M)] — 주식 수·비중은 repository에서 계산.
 * EDGAR 연동 시 이 파일이 실제 파싱 결과로 교체된다.
 */
export interface RawFiling13F {
  quarter: string;
  periodEnd: string; // 보고기준일
  filedAt: string; // 공시일
  holdings: [ticker: string, valueM: number][];
  insightKo?: string;
  insightTags?: string[];
}

/** slug → [직전 분기, 최신 분기] 순서 */
export const FILINGS_13F: Record<string, RawFiling13F[]> = {
  "warren-buffett": [
    {
      quarter: "2025 Q4",
      periodEnd: "2025-12-31",
      filedAt: "2026-02-17",
      holdings: [
        ["AAPL", 65000], ["AXP", 32000], ["BAC", 28000], ["KO", 25000],
        ["CVX", 18000], ["OXY", 14000], ["KHC", 11000], ["MCO", 10000],
        ["DVA", 4000], ["C", 3500],
      ],
    },
    {
      quarter: "2026 Q1",
      periodEnd: "2026-03-31",
      filedAt: "2026-05-15",
      holdings: [
        ["AAPL", 55000], ["AXP", 33000], ["BAC", 25000], ["KO", 25500],
        ["CVX", 22000], ["OXY", 17000], ["KHC", 11000], ["MCO", 10200],
        ["UNH", 5000], ["DVA", 4100],
      ],
      insightKo:
        "버크셔는 이번 분기 애플 비중을 3분기 연속 줄이는 한편, 셰브런·옥시덴탈 등 에너지 비중을 15.2%→18.9%로 늘렸습니다. 급락했던 유나이티드헬스를 신규 편입했고 씨티그룹은 전량 매도했습니다. 현금성 자산이 사상 최대 수준이라는 점도 함께 봐야 할 대목입니다.",
      insightTags: ["➕ 에너지 비중 확대", "➖ 애플 축소 지속", "🆕 유나이티드헬스", "❌ 씨티그룹 청산"],
    },
  ],
  "bill-ackman": [
    {
      quarter: "2025 Q4",
      periodEnd: "2025-12-31",
      filedAt: "2026-02-13",
      holdings: [
        ["CMG", 2200], ["GOOG", 2100], ["HLT", 1900], ["QSR", 1800],
        ["CP", 1600], ["HHH", 1500], ["NKE", 1400],
      ],
    },
    {
      quarter: "2026 Q1",
      periodEnd: "2026-03-31",
      filedAt: "2026-05-14",
      holdings: [
        ["GOOG", 2600], ["CMG", 2300], ["HLT", 1950], ["UBER", 1800],
        ["QSR", 1750], ["CP", 1650], ["HHH", 1500],
      ],
      insightKo:
        "퍼싱스퀘어는 부진하던 나이키를 전량 정리하고 우버를 단숨에 4위 비중(13.3%)으로 신규 편입했습니다. 알파벳도 24% 늘려 최대 보유 종목이 됐습니다. 8개 안팎 종목에 집중하는 애크먼 특유의 스타일이 그대로 드러난 분기입니다.",
      insightTags: ["🆕 우버 대량 편입", "➕ 알파벳 확대", "❌ 나이키 청산"],
    },
  ],
  "michael-burry": [
    {
      quarter: "2025 Q4",
      periodEnd: "2025-12-31",
      filedAt: "2026-02-12",
      holdings: [
        ["BABA", 45], ["JD", 38], ["PDD", 30], ["GEO", 25], ["C", 20],
      ],
    },
    {
      quarter: "2026 Q1",
      periodEnd: "2026-03-31",
      filedAt: "2026-05-13",
      holdings: [
        ["BABA", 60], ["JD", 40], ["GEO", 30], ["GLD", 25], ["EL", 22],
      ],
      insightKo:
        "버리는 알리바바 비중을 25.4%→33.9%로 늘리며 중국 빅테크 집중을 이어갔지만, 핀둬둬는 전량 매도했습니다. 금 ETF(GLD)와 에스티로더를 신규 편입한 점이 눈에 띕니다 — 인플레이션 헤지와 낙폭 과대주 역발상이라는 해석이 나옵니다. 단, 버리의 포트폴리오는 분기마다 절반 이상 바뀔 만큼 회전이 빠릅니다.",
      insightTags: ["➕ 알리바바 확대", "🆕 금 ETF", "🆕 에스티로더", "❌ 핀둬둬 청산"],
    },
  ],
  "ray-dalio": [
    {
      quarter: "2025 Q4",
      periodEnd: "2025-12-31",
      filedAt: "2026-02-13",
      holdings: [
        ["IVV", 2500], ["IEMG", 1800], ["GLD", 900], ["PG", 700],
        ["JNJ", 650], ["KO", 600], ["WMT", 550],
      ],
    },
    {
      quarter: "2026 Q1",
      periodEnd: "2026-03-31",
      filedAt: "2026-05-14",
      holdings: [
        ["IVV", 2300], ["IEMG", 2100], ["GLD", 1200], ["PG", 720],
        ["JNJ", 630], ["KO", 610], ["WMT", 560], ["BABA", 400],
      ],
      insightKo:
        "브리지워터는 미국 대형주 ETF를 줄이고 신흥국 ETF와 금 비중을 늘렸습니다. 금은 11.6%→14.0%로 확대됐고 알리바바를 신규 편입했습니다. ‘어떤 환경에서도 견딘다’는 올웨더 철학답게 지역·자산 분산을 넓히는 흐름입니다.",
      insightTags: ["➕ 금 비중 확대", "➕ 신흥국 확대", "🆕 알리바바", "➖ 미국 대형주 축소"],
    },
  ],
  "stanley-druckenmiller": [
    {
      quarter: "2025 Q4",
      periodEnd: "2025-12-31",
      filedAt: "2026-02-17",
      holdings: [
        ["NVDA", 450], ["MSFT", 400], ["CPNG", 380], ["LLY", 300],
        ["MU", 250], ["FCX", 200],
      ],
    },
    {
      quarter: "2026 Q1",
      periodEnd: "2026-03-31",
      filedAt: "2026-05-15",
      holdings: [
        ["MSFT", 420], ["CPNG", 420], ["TSM", 350], ["LLY", 310],
        ["MU", 280], ["NVDA", 200], ["PLTR", 180],
      ],
      insightKo:
        "드러켄밀러는 엔비디아를 절반 이상 덜어내는 대신 TSMC와 팔란티어를 신규 편입했습니다 — AI 밸류체인 안에서 종목을 갈아타는 모습입니다. 한국 투자자에게 친숙한 쿠팡은 오히려 늘려 공동 1위 비중이 됐습니다.",
      insightTags: ["➖ 엔비디아 대폭 축소", "🆕 TSMC", "🆕 팔란티어", "➕ 쿠팡 확대"],
    },
  ],
  "david-tepper": [
    {
      quarter: "2025 Q4",
      periodEnd: "2025-12-31",
      filedAt: "2026-02-14",
      holdings: [
        ["BABA", 900], ["META", 550], ["AMZN", 520], ["PDD", 500],
        ["NVDA", 480], ["JD", 400], ["UBER", 300],
      ],
    },
    {
      quarter: "2026 Q1",
      periodEnd: "2026-03-31",
      filedAt: "2026-05-14",
      holdings: [
        ["BABA", 1100], ["PDD", 550], ["AMZN", 540], ["META", 500],
        ["JD", 420], ["NVDA", 400], ["BIDU", 250],
      ],
      insightKo:
        "테퍼는 최대 보유 종목인 알리바바를 22% 더 늘리고 바이두까지 신규 편입하며 중국 테크 베팅을 한층 키웠습니다. 중국 관련 보유가 포트폴리오의 절반에 육박합니다. 반면 엔비디아·메타 등 미국 빅테크는 소폭 줄였고 우버는 전량 정리했습니다.",
      insightTags: ["➕ 알리바바 확대", "🆕 바이두", "➖ 미국 빅테크 축소", "❌ 우버 청산"],
    },
  ],
  "carl-icahn": [
    {
      quarter: "2025 Q4",
      periodEnd: "2025-12-31",
      filedAt: "2026-02-14",
      holdings: [
        ["IEP", 6000], ["CVI", 1200], ["SWX", 800], ["UAN", 300], ["BHC", 250],
      ],
    },
    {
      quarter: "2026 Q1",
      periodEnd: "2026-03-31",
      filedAt: "2026-05-15",
      holdings: [
        ["IEP", 6100], ["CVI", 1250], ["SWX", 850], ["CZR", 400], ["UAN", 280],
      ],
      insightKo:
        "아이칸은 자신의 지주사(IEP)와 CVR에너지 중심의 포트폴리오를 유지한 가운데, 시저스엔터테인먼트를 신규 편입했습니다. 바슈헬스는 전량 정리했습니다. 카지노 업종에 대한 행동주의 개입 가능성이 거론됩니다.",
      insightTags: ["🆕 시저스엔터", "❌ 바슈헬스 청산", "지주사 중심 유지"],
    },
  ],
  "dan-loeb": [
    {
      quarter: "2025 Q4",
      periodEnd: "2025-12-31",
      filedAt: "2026-02-13",
      holdings: [
        ["PCG", 800], ["AMZN", 700], ["MSFT", 650], ["META", 600],
        ["TSM", 400], ["DHR", 350],
      ],
    },
    {
      quarter: "2026 Q1",
      periodEnd: "2026-03-31",
      filedAt: "2026-05-14",
      holdings: [
        ["PCG", 820], ["AMZN", 750], ["META", 650], ["MSFT", 600],
        ["TSM", 500], ["NFLX", 450],
      ],
      insightKo:
        "서드포인트는 넷플릭스를 신규 편입하고 TSMC를 25% 늘렸습니다. 다나허는 전량 매도했습니다. 유틸리티(PG&E)를 최대 비중으로 유지하면서도 빅테크·반도체를 두텁게 가져가는 바벨 구성이 이어지고 있습니다.",
      insightTags: ["🆕 넷플릭스", "➕ TSMC 확대", "❌ 다나허 청산"],
    },
  ],
  "david-einhorn": [
    {
      quarter: "2025 Q4",
      periodEnd: "2025-12-31",
      filedAt: "2026-02-12",
      holdings: [
        ["GRBK", 500], ["CEIX", 200], ["GLD", 180], ["LNC", 140], ["VTRS", 120],
      ],
    },
    {
      quarter: "2026 Q1",
      periodEnd: "2026-03-31",
      filedAt: "2026-05-13",
      holdings: [
        ["GRBK", 520], ["GLD", 250], ["CEIX", 230], ["LNC", 150], ["INTC", 130],
      ],
      insightKo:
        "아인혼은 금 ETF를 39% 늘리며 인플레이션 헤지를 강화했고, 턴어라운드 기대가 있는 인텔을 신규 편입했습니다. 최대 보유 종목인 주택건설사 그린브릭은 그대로 유지 중입니다.",
      insightTags: ["➕ 금 비중 확대", "🆕 인텔", "주택건설 유지"],
    },
  ],
  "seth-klarman": [
    {
      quarter: "2025 Q4",
      periodEnd: "2025-12-31",
      filedAt: "2026-02-17",
      holdings: [
        ["GOOG", 500], ["WBD", 350], ["INTC", 300], ["FIS", 280], ["VSAT", 150],
      ],
    },
    {
      quarter: "2026 Q1",
      periodEnd: "2026-03-31",
      filedAt: "2026-05-15",
      holdings: [
        ["GOOG", 550], ["INTC", 380], ["WBD", 320], ["FIS", 300], ["HUM", 260],
      ],
      insightKo:
        "클라만은 시장에서 외면받는 인텔을 27% 더 사들였고, 급락한 휴매나를 신규 편입했습니다. ‘남들이 팔 때 사는’ 안전마진 스타일이 뚜렷합니다. 비아샛은 전량 정리했습니다.",
      insightTags: ["➕ 인텔 확대", "🆕 휴매나", "❌ 비아샛 청산", "낙폭과대 매수"],
    },
  ],
  "li-lu": [
    {
      quarter: "2025 Q4",
      periodEnd: "2025-12-31",
      filedAt: "2026-02-13",
      holdings: [
        ["BAC", 800], ["GOOG", 600], ["BRK.B", 500], ["EWBC", 400], ["AAPL", 200],
      ],
    },
    {
      quarter: "2026 Q1",
      periodEnd: "2026-03-31",
      filedAt: "2026-05-14",
      holdings: [
        ["BAC", 780], ["GOOG", 650], ["BRK.B", 520], ["EWBC", 420], ["PDD", 150],
      ],
      insightKo:
        "리 루는 5개 종목 집중 구조를 그대로 유지한 채 애플을 핀둬둬로 교체했습니다. 뱅크오브아메리카·알파벳·버크셔라는 코어는 수년째 변함이 없습니다 — 극단적 저회전 집중투자의 전형입니다.",
      insightTags: ["🆕 핀둬둬", "❌ 애플 청산", "5종목 집중 유지"],
    },
  ],
  "duan-yongping": [
    {
      quarter: "2025 Q4",
      periodEnd: "2025-12-31",
      filedAt: "2026-02-14",
      holdings: [
        ["AAPL", 11000], ["BRK.B", 900], ["GOOG", 700], ["BABA", 500], ["DIS", 300],
      ],
    },
    {
      quarter: "2026 Q1",
      periodEnd: "2026-03-31",
      filedAt: "2026-05-15",
      holdings: [
        ["AAPL", 11500], ["BRK.B", 920], ["GOOG", 750], ["BABA", 600], ["NKE", 280],
      ],
      insightKo:
        "돤융핑은 포트폴리오의 80%를 차지하는 애플을 오히려 더 늘렸습니다. 버핏이 애플을 줄이는 것과 정반대 방향이라 흥미롭습니다. 애크먼이 던진 나이키를 신규로 받아간 점도 눈에 띕니다.",
      insightTags: ["➕ 애플 확대", "🆕 나이키", "➕ 알리바바 확대"],
    },
  ],
};
