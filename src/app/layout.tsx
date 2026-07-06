import type { Metadata } from "next";
import "./globals.css";
import { BottomTabBar, TopNav } from "@/components/Nav";
import { getDataMeta } from "@/lib/repository";

export const metadata: Metadata = {
  title: "웨일허니콤 — 미국 주식 고래 공시 트래커",
  description:
    "버핏·애크먼·버리 등 미국 주식 고래들의 13F 포트폴리오와 내부자 매매를 한눈에",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="flex min-h-full flex-col">
        <TopNav />
        <main className="mx-auto w-full max-w-[1080px] flex-1 px-4 pb-24 pt-4 md:px-6 md:pb-12 md:pt-8">
          {children}
        </main>
        <footer className="mb-16 border-t border-line bg-card px-6 py-8 text-center text-xs leading-relaxed text-muted md:mb-0">
          <p>
            본 서비스는 SEC 공시 자료를 정리해 보여주는 정보 제공 목적의
            사이트이며, 투자 자문이 아닙니다.
          </p>
          <p>
            13F는 분기 마감 후 최대 45일 지연 공시되며, 공매도·옵션·현금 비중은
            포함되지 않습니다. 모든 투자 판단과 책임은 투자자 본인에게 있습니다.
          </p>
          <p className="mt-2">
            © 2026 whalehoneycomb · 데이터 출처: SEC EDGAR
            {getDataMeta().fetchedAt
              ? ` (갱신 ${getDataMeta().fetchedAt!.slice(0, 10).replaceAll("-", ".")})`
              : " (샘플 데이터)"}
          </p>
        </footer>
        <BottomTabBar />
      </body>
    </html>
  );
}
