import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "카메라스펙 리뷰 — 전문 카메라 사양 및 커뮤니티 리뷰",
    template: "%s | 카메라스펙 리뷰",
  },
  description:
    "최신 카메라의 상세 기술 사양을 확인하고, 모델 간 비교를 하며, 사진 커뮤니티의 실제 리뷰를 읽어보세요.",
  keywords: [
    "카메라 리뷰",
    "카메라 스펙",
    "미러리스 카메라",
    "카메라 비교",
    "소니",
    "캐논",
    "니콘",
  ],
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
