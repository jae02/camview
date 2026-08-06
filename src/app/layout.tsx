import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://camview.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'CamView - 카메라 필터 시뮬레이터 | 필름 & 디지털 감성 사진 변환',
    template: '%s | CamView',
  },
  description:
    '내 사진을 코닥, 후지필름, 라이카, 핫셀블라드 등 10종의 클래식 필름 및 프리미엄 디지털 카메라 색감으로 실시간 변환하세요. 무료 온라인 사진 필터 스튜디오.',
  keywords: [
    '카메라 필터',
    '필름 필터',
    '코닥 포트라 400',
    '후지필름 클래식 크롬',
    '라이카 룩',
    '시네스틸 800T',
    '핫셀블라드',
    '사진 색감 보정',
    '온라인 사진 필터',
    '필름 사진 시뮬레이션',
    '감성 사진 필터',
    'CamView',
  ],
  authors: [{ name: 'CamView Team', url: siteUrl }],
  creator: 'CamView',
  publisher: 'CamView',
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: siteUrl,
    siteName: 'CamView (캠뷰)',
    title: 'CamView - 카메라 필터 시뮬레이터 | 필름 & 디지털 감성 사진 변환',
    description:
      '내 사진을 코닥, 후지필름, 라이카, 핫셀블라드 등 10종의 클래식 필름 및 프리미엄 디지털 카메라 색감으로 실시간 변환하세요.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CamView - 카메라 필터 시뮬레이터',
    description:
      '내 사진을 10종의 클래식 필름 및 프리미엄 디지털 카메라 색감으로 실시간 변환하세요.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
    other: {
      'naver-site-verification':
        process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION || '',
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CamView',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0a0a0f',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Schema.org JSON-LD Structured Data for Google & Naver Search
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'CamView',
        description: '카메라 색감 필터 시뮬레이터 웹 애플리케이션',
        inLanguage: 'ko-KR',
      },
      {
        '@type': 'WebApplication',
        '@id': `${siteUrl}/#webapp`,
        name: 'CamView - 카메라 필터 시뮬레이터',
        url: siteUrl,
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'All',
        browserRequirements: 'Requires HTML5 Canvas support',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'KRW',
        },
        featureList: [
          '실시간 10종 필름/디지털 카메라 필터 시뮬레이션',
          'Canvas 기반 고성능 클라이언트 사이드 이미지 렌더링',
          '원본 대비 비교 슬라이더',
          '모바일 및 PC 고화질 사진 저장 지원',
        ],
      },
    ],
  };

  return (
    <html lang="ko" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-[#0a0a0f] text-white antialiased min-h-screen flex flex-col font-sans overscroll-none">
        <Header />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
