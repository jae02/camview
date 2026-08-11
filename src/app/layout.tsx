import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const siteUrl = 'https://www.dslreview.co.kr';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'DSLReview — 정보 게시판',
    template: '%s | DSLReview',
  },
  description: '카메라, 사진, 리뷰 등 다양한 정보를 공유하는 게시판입니다.',
  keywords: ['게시판', '카메라', '사진', '리뷰', '정보'],
  authors: [{ name: 'DSLReview' }],
  creator: 'DSLReview',
  formatDetection: { telephone: false, email: false, address: false },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: siteUrl,
    siteName: 'DSLReview',
    title: 'DSLReview — 정보 게시판',
    description: '카메라, 사진, 리뷰 등 다양한 정보를 공유하는 게시판입니다.',
  },
  twitter: {
    card: 'summary',
    title: 'DSLReview — 정보 게시판',
    description: '카메라, 사진, 리뷰 등 다양한 정보를 공유하는 게시판입니다.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0a0a0f',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: siteUrl,
    name: 'DSLReview',
    description: '카메라, 사진, 리뷰 등 다양한 정보를 공유하는 게시판',
    inLanguage: 'ko-KR',
  };

  return (
    <html lang="ko" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-[#0a0a0f] text-gray-100 antialiased min-h-screen flex flex-col font-sans">
        <Header />
        <div className="flex flex-1 w-full max-w-7xl mx-auto px-4 pt-20 pb-8 gap-8">
          <main className="flex-1 min-w-0">{children}</main>
        </div>
        <Footer />
      </body>
    </html>
  );
}
