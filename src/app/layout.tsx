import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Dlsrivew — 프리미엄 카메라 매거진",
    template: "%s | Dlsrivew",
  },
  description:
    "카메라와 사진을 사랑하는 사람들을 위한 프리미엄 매거진. 거짓 없는 솔직한 리뷰와 트렌디한 카메라 가이드를 제공합니다.",
  keywords: [
    "카메라 리뷰",
    "사진",
    "미러리스 카메라",
    "빈티지 디카",
    "카메라 추천",
  ],
  openGraph: {
    title: "Dlsrivew — 프리미엄 카메라 매거진",
    description: "카메라와 사진을 사랑하는 사람들을 위한 프리미엄 매거진. 거짓 없는 솔직한 리뷰와 트렌디한 카메라 가이드를 제공합니다.",
    url: "https://dslreview.co.kr",
    siteName: "Dlsrivew",
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
