import { notFound } from 'next/navigation';
import { getCameraById, getCameras } from '@/data/cameras';
import CameraInfo from '@/components/camera/CameraInfo';
import RadarChart from '@/components/ui/RadarChart';
import Link from 'next/link';
import type { Metadata } from 'next';

export async function generateMetadata(
  props: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await props.params;
  const camera = getCameraById(id);
  
  if (!camera) {
    return {
      title: '카메라를 찾을 수 없습니다 - CamView',
    };
  }

  return {
    title: `${camera.name} - CamView`,
    description: camera.description,
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


  return (
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
  );
}
