import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getAllCategories } from "@/lib/articles";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Dlsrivew — 취향과 일상을 담은 블로그",
    template: "%s | Dlsrivew",
  },
  description:
    "패션, 카페, 여행, 미식, 그리고 배움의 기록까지. 다채로운 취향과 일상을 공유하는 프리미엄 블로그입니다.",
  keywords: [
    "블로그",
    "패션",
    "카페",
    "여행",
    "미식",
    "공부",
    "일상",
  ],
  openGraph: {
    title: "Dlsrivew — 취향과 일상을 담은 블로그",
    description: "패션, 카페, 여행, 미식, 그리고 배움의 기록까지. 다채로운 취향과 일상을 공유하는 프리미엄 블로그입니다.",
    url: "https://dslreview.co.kr",
    siteName: "Dlsrivew",
    locale: "ko_KR",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getAllCategories();

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
        <Navbar categories={categories} />

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
