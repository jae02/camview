import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.dslreview.co.kr';

export const metadata: Metadata = {
  title: '필터 스튜디오 - 카메라 색감 적용 & 다운로드',
  description:
    '내 사진을 업로드하고 10종의 클래식 필름과 디지털 카메라 필터를 실시간으로 적용해 보세요.',
  keywords: [
    '사진 필터 적용',
    '온라인 사진 편집',
    '필름 효과',
    '카메라 필터 시뮬레이터',
  ],
  alternates: {
    canonical: '/studio',
  },
  openGraph: {
    title: '필터 스튜디오 - 카메라 색감 적용 & 다운로드',
    description:
      '내 사진을 업로드하고 10종의 클래식 필름과 디지털 카메라 필터를 실시간으로 적용해 보세요.',
    url: `${siteUrl}/studio`,
    type: 'website',
  },
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
