import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0f] border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <span className="text-xl">📸</span>
            <span className="text-lg font-bold text-gray-200">CamView</span>
          </div>
          <div className="flex space-x-6">
            <Link href="/" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">홈</Link>
            <Link href="/cameras" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">카메라</Link>
            <Link href="/studio" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">스튜디오</Link>
          </div>
        </div>
        <div className="mt-8 text-center md:text-left text-xs text-gray-500">
          &copy; {new Date().getFullYear()} CamView. All rights reserved. 카메라 필터 시뮬레이션 앱.
        </div>
      </div>
    </footer>
  );
}
