import Link from 'next/link';
import { getCameras } from '@/data/cameras';
import CameraCard from '@/components/camera/CameraCard';

export default async function Home() {
  const allCameras = getCameras();
  const featuredCameras = allCameras.slice(0, 6);

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full relative overflow-hidden py-24 lg:py-32 flex flex-col items-center justify-center text-center px-4">
        {/* Decorative blobs */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="z-10 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight bg-gradient-to-br from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent whitespace-pre-line">
            {'당신의 사진,\n다른 카메라로 보기'}
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-10">
            필름 카메라의 따뜻한 색감부터 최신 디지털 카메라의 선명함까지,
            당신의 사진에 새로운 감성을 더해보세요.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/studio" className="btn-primary w-full sm:w-auto text-lg px-8 py-3">
              스튜디오 시작
            </Link>
            <Link href="/cameras" className="btn-secondary w-full sm:w-auto text-lg px-8 py-3">
              카메라 둘러보기
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Cameras Section */}
      <section className="w-full max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-3xl font-bold mb-4">인기 카메라</h2>
          <p className="text-neutral-400">가장 많이 사랑받는 카메라 필터를 만나보세요</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          {featuredCameras.map((camera) => (
            <CameraCard key={camera.id} camera={camera} />
          ))}
        </div>
        
        <div className="mt-12 text-center animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <Link href="/cameras" className="btn-secondary px-8 py-3">
            모든 카메라 보기
          </Link>
        </div>
      </section>

      {/* How it works Section */}
      <section className="w-full bg-white/5 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl font-bold mb-4">이렇게 사용하세요</h2>
            <p className="text-neutral-400">단 3단계로 새로운 사진을 완성하세요</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 flex flex-col items-center text-center animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-3xl mb-6">
                📸
              </div>
              <h3 className="text-xl font-semibold mb-3">1. 사진 업로드</h3>
              <p className="text-neutral-400">
                변환하고 싶은 사진을 드래그 앤 드롭으로 간편하게 업로드하세요.
              </p>
            </div>

            <div className="glass-card p-8 flex flex-col items-center text-center animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-3xl mb-6">
                📷
              </div>
              <h3 className="text-xl font-semibold mb-3">2. 카메라 선택</h3>
              <p className="text-neutral-400">
                10종의 다양한 필름 및 디지털 카메라 중 원하는 색감을 선택하세요.
              </p>
            </div>

            <div className="glass-card p-8 flex flex-col items-center text-center animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-3xl mb-6">
                ✨
              </div>
              <h3 className="text-xl font-semibold mb-3">3. 필터 적용</h3>
              <p className="text-neutral-400">
                실시간으로 적용되는 필터를 확인하고 강도를 조절하여 저장하세요.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
