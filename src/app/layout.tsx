import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "카메라 백과사전 — 디지털 카메라 상세 스펙 도감",
    template: "%s | 카메라 백과사전",
  },
  description:
    "역대 디지털 카메라의 상세 기술 사양을 검색하고, 모델 간 스펙을 비교하고, 브랜드별 카메라 도감을 탐색해 보세요.",
  keywords: [
    "카메라 백과사전",
    "카메라 스펙",
    "미러리스 카메라",
    "카메라 비교",
    "소니",
    "캐논",
    "니콘",
  ],
  openGraph: {
    title: "카메라 백과사전 — 디지털 카메라 상세 스펙 도감",
    description: "역대 디지털 카메라의 상세 기술 사양을 검색하고, 모델 간 스펙을 비교하고, 브랜드별 카메라 도감을 탐색해 보세요.",
    url: "https://dslreview.co.kr",
    siteName: "카메라 백과사전",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* Google Fonts — Inter (primary UI) + JetBrains Mono (specs) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        {/* Pretendard — 한글 최적화 웹폰트 */}
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2600243388009689"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body>
        {/* ── Fixed Navbar ──────────────────────────────────────────── */}
        <Navbar />

        {/* ── Main Content (offset for fixed navbar) ───────────────── */}
        <main style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>
          {children}
        </main>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <Footer />
      </body>
    </html>
  );
}
