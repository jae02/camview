import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.dslreview.co.kr';

export const metadata: Metadata = {
  title: '필터 스튜디오 - 실시간 카메라 색감 적용 & 다운로드',
  description:
    '내 사진을 업로드하고 10종의 필름 및 디지털 카메라 필터를 실시간으로 적용해 보세요. 필터 강도 조절, 원본 비교, 무료 고화질 저장 가능.',
  keywords: [
    '필터 스튜디오',
    '사진 필터 적용',
    '실시간 사진 보정',
    '온라인 필름 효과',
    '무료 사진 필터',
    'CamView Studio',
  ],
  alternates: {
    canonical: '/studio',
  },
  openGraph: {
    title: '필터 스튜디오 - 실시간 카메라 색감 적용 | CamView',
    description:
      '내 사진을 업로드하고 10종의 필름 및 디지털 카메라 필터를 실시간으로 적용해 보세요.',
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
