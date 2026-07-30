"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, Menu, X, PenSquare, Search, Settings } from "lucide-react";

interface SidebarProps {
  categories?: string[];
}

export default function Sidebar({ categories = [] }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const navLinks = [
    { href: "/", label: "홈" },
    ...categories.map(cat => ({ href: `/category/${cat.toLowerCase()}`, label: cat })),
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <>
      {/* ── Desktop Sidebar ────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white dark:bg-[#111] border-r border-gray-200 dark:border-gray-800 z-50 overflow-y-auto">
        <div className="p-6">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-8 group">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-gray-900 dark:bg-white">
              <Compass className="w-5 h-5 text-white dark:text-gray-900" strokeWidth={2} />
            </div>
            <div className="flex flex-col -space-y-0.5">
              <span className="text-sm font-bold tracking-tight text-gray-900 dark:text-white">Dlsrivew</span>
              <span className="text-[10px] font-medium tracking-widest uppercase text-gray-500">BLOG</span>
            </div>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="검색..."
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0a0a0a] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-700 placeholder:text-gray-400"
              />
            </div>
          </form>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">Menu</span>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2.5 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Admin & Write Buttons */}
        <div className="mt-auto p-6 border-t border-gray-200 dark:border-gray-800 space-y-2">
          <Link
            href="/admin/write"
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            <PenSquare className="w-4 h-4" />
            글쓰기
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Settings className="w-4 h-4" />
            글 관리
          </Link>
        </div>

        {/* Footer */}
        <div className="p-6 pt-2">
          <p className="text-xs text-gray-400">&copy; 2026 Dlsrivew</p>
        </div>
      </aside>

      {/* ── Mobile Top Bar ───────────────────────────────────────────── */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#111] border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-gray-900 dark:bg-white">
              <Compass className="w-5 h-5 text-white dark:text-gray-900" strokeWidth={2} />
            </div>
            <span className="text-sm font-bold tracking-tight text-gray-900 dark:text-white">Dlsrivew</span>
          </Link>
          <button
            className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 dark:text-gray-400"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {/* Mobile Menu Dropdown */}
        <div className="overflow-hidden bg-white dark:bg-[#111]" style={{ maxHeight: isMobileMenuOpen ? "500px" : "0", transition: "max-height 0.3s ease" }}>
          <div className="py-2 border-t border-gray-100 dark:border-gray-800">
            {/* Mobile Search */}
            <form onSubmit={(e) => { handleSearch(e); setIsMobileMenuOpen(false); }} className="px-4 py-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="검색..."
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0a0a0a] text-sm text-gray-900 dark:text-white focus:outline-none placeholder:text-gray-400" />
              </div>
            </form>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300" onClick={() => setIsMobileMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            <div className="px-4 pt-2 pb-3 space-y-2">
              <Link href="/admin/write" className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                <PenSquare className="w-4 h-4" />글쓰기
              </Link>
              <Link href="/admin" className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                <Settings className="w-4 h-4" />글 관리
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
