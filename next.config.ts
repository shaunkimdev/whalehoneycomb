import path from "path";
import type { NextConfig } from "next";

// GitHub Pages 정적 배포 빌드 (Actions 워크플로에서 PAGES_BUILD=1 설정)
const isPagesBuild = process.env.PAGES_BUILD === "1";

const nextConfig: NextConfig = {
  // 홈 디렉터리에 다른 package-lock.json이 있어 워크스페이스 루트 오인 방지
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
    // 정적 export에는 이미지 최적화 서버가 없음
    unoptimized: isPagesBuild,
  },
  ...(isPagesBuild
    ? {
        output: "export" as const,
      }
    : {}),
};

export default nextConfig;
