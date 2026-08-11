'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur-md bg-[#0a0a0f]/80" style={{ borderColor: 'var(--border-color)' }}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-tighter" style={{ color: 'var(--accent)' }}>
          DSLReview
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            홈
          </Link>
          <div className="relative group">
            <button className="text-sm font-medium text-gray-300 hover:text-white transition-colors flex items-center gap-1">
              카테고리
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div className="absolute top-full left-0 mt-2 w-48 rounded-md border glass-card opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1">
              <Link href="/category/notice" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white">📢 공지사항</Link>
              <Link href="/category/camera" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white">📷 카메라</Link>
              <Link href="/category/tips" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white">💡 사진 팁</Link>
              <Link href="/category/review" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white">⭐ 리뷰</Link>
              <Link href="/category/free" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white">💬 자유</Link>
            </div>
          </div>
          
          <form onSubmit={handleSearch} className="relative">
            <input
              type="search"
              placeholder="검색어를 입력하세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 lg:w-64 pl-9 pr-3 py-1.5 rounded-full text-sm border bg-black/20 focus:outline-none focus:border-amber-400 transition-colors"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-gray-300 hover:text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isMenuOpen ? <path d="M18 6 6 18M6 6l12 12"/> : <path d="M4 12h16M4 6h16M4 18h16"/>}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-[#0a0a0f] p-4 animate-fade-in-up" style={{ borderColor: 'var(--border-color)' }}>
          <form onSubmit={handleSearch} className="relative mb-4">
            <input
              type="search"
              placeholder="검색어를 입력하세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-md text-sm"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>
          <div className="flex flex-col gap-2">
            <Link href="/" className="px-2 py-2 text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>홈</Link>
            <div className="px-2 py-1 text-sm font-semibold text-gray-500 uppercase tracking-wider mt-2">카테고리</div>
            <Link href="/category/notice" className="px-4 py-2 text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>📢 공지사항</Link>
            <Link href="/category/camera" className="px-4 py-2 text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>📷 카메라</Link>
            <Link href="/category/tips" className="px-4 py-2 text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>💡 사진 팁</Link>
            <Link href="/category/review" className="px-4 py-2 text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>⭐ 리뷰</Link>
            <Link href="/category/free" className="px-4 py-2 text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>💬 자유</Link>
          </div>
        </div>
      )}
    </header>
  );
}
