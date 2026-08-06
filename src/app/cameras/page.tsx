import { getCameras } from '@/data/cameras';
import CameraCard from '@/components/camera/CameraCard';
import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.dslreview.co.kr';

export const metadata: Metadata = {
  title: '카메라 컬렉션 - 10종 필름 & 디지털 색감 목록',
  description:
    '코닥 포트라 400, 후지필름 벨비아 50, 시네스틸 800T, 라이카 Q3, 핫셀블라드 등 10종의 대표 카메라 및 필름 색감 컬렉션을 둘러보세요.',
  keywords: [
    '카메라 목록',
    '필름 종류',
    '코닥 필름',
    '후지필름 색감',
    '라이카 카메라',
    '핫셀블라드',
    'CamView',
  ],
  alternates: {
    canonical: '/cameras',
  },
  openGraph: {
    title: '카메라 컬렉션 - 10종 필름 & 디지털 색감 목록 | CamView',
    description:
      '코닥, 후지필름, 라이카, 핫셀블라드 등 10종의 대표 카메라 및 필름 색감 컬렉션을 둘러보세요.',
    url: `${siteUrl}/cameras`,
    type: 'website',
  },
};

export default async function CamerasPage() {
  const filmCameras = getCameras('film');
  const digitalCameras = getCameras('digital');

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-16 animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">카메라 컬렉션</h1>
        <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
          필름부터 디지털까지, 각 카메라만의 독특한 색감을 탐색하세요.
        </p>
      </div>

      <section className="mb-20 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
          <span className="text-3xl">🎞️</span>
          <h2 className="text-2xl font-bold">필름 카메라</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filmCameras.map((camera) => (
            <CameraCard key={camera.id} camera={camera} />
          ))}
        </div>
      </section>

      <section className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
          <span className="text-3xl">📷</span>
          <h2 className="text-2xl font-bold">디지털 카메라</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {digitalCameras.map((camera) => (
            <CameraCard key={camera.id} camera={camera} />
          ))}
        </div>
      </section>
    </div>
  );
}
