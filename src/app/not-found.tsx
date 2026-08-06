import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '페이지를 찾을 수 없습니다 - CamView',
};

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 animate-fade-in-up">
      <div className="text-7xl mb-6">📷</div>
      <h2 className="text-4xl font-bold mb-4">페이지를 찾을 수 없습니다</h2>
      <p className="text-neutral-400 mb-8 text-center max-w-md">
        요청하신 페이지가 사라졌거나 잘못된 주소입니다.
      </p>
      <Link href="/" className="btn-primary px-8 py-3">
        홈으로 돌아가기
      </Link>
    </div>
  );
}
