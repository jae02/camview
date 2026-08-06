import { notFound } from 'next/navigation';
import { getCameraById, getCameras } from '@/data/cameras';
import CameraInfo from '@/components/camera/CameraInfo';
import RadarChart from '@/components/ui/RadarChart';
import Link from 'next/link';
import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://camview.app';

export async function generateMetadata(
  props: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await props.params;
  const camera = getCameraById(id);

  if (!camera) {
    return {
      title: '카메라를 찾을 수 없습니다',
    };
  }

  const title = `${camera.name} 필터 색감 시뮬레이션 (${camera.category === 'film' ? '필름' : '디지털'})`;
  const description = `${camera.name} (${camera.brand}, ${camera.year})의 고유한 색감과 필터 특성을 확인하고 내 사진에 직접 적용해 보세요. ${camera.tagline}`;

  return {
    title,
    description,
    keywords: [
      camera.name,
      camera.brand,
      `${camera.name} 필터`,
      `${camera.name} 색감`,
      camera.category === 'film' ? '필름 카메라' : '디지털 카메라',
      '사진 필터',
      'CamView',
    ],
    alternates: {
      canonical: `/cameras/${camera.id}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/cameras/${camera.id}`,
      type: 'article',
      siteName: 'CamView',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export async function generateStaticParams() {
  const cameras = getCameras();
  return cameras.map((camera) => ({
    id: camera.id,
  }));
}

export default async function CameraDetailPage(
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  const camera = getCameraById(id);

  if (!camera) {
    notFound();
  }

  // Schema.org Breadcrumbs & Product JSON-LD for rich snippets on Google & Naver
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '홈',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '카메라 컬렉션',
        item: `${siteUrl}/cameras`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: camera.name,
        item: `${siteUrl}/cameras/${camera.id}`,
      },
    ],
  };

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: camera.name,
    description: camera.description,
    brand: {
      '@type': 'Brand',
      name: camera.brand,
    },
    category: camera.category === 'film' ? 'Film Stock / Camera' : 'Digital Camera',
    releaseDate: `${camera.year}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 animate-fade-in-up">
        <div className="mb-8">
          <Link href="/cameras" className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2 w-fit">
            ← <span>목록으로 돌아가기</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Info */}
          <div className="flex flex-col gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{camera.icon}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                  camera.category === 'film' ? 'badge-film' : 'badge-digital'
                }`}>
                  {camera.category === 'film' ? '필름' : '디지털'}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{camera.name}</h1>
              <p className="text-lg text-neutral-400">
                {camera.brand} • {camera.year}년
              </p>
            </div>

            <p className="text-lg leading-relaxed text-neutral-300">
              {camera.description}
            </p>

            <div className="mt-4">
              <Link href={`/studio?camera=${camera.id}`} className="btn-primary w-full text-center py-4 text-lg inline-block">
                이 카메라로 내 사진 보기
              </Link>
            </div>
          </div>

          {/* Right Column: Characteristics */}
          <div className="glass-card p-6 md:p-8 flex flex-col gap-8">
            <div>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span>📊</span> 카메라 특성
              </h2>
              <div className="w-full max-w-sm mx-auto aspect-square flex items-center justify-center">
                <RadarChart data={camera.characteristics} color={camera.accentColor} />
              </div>
            </div>
            
            <CameraInfo camera={camera} />
          </div>
        </div>
      </div>
    </>
  );
}
