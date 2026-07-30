"use client";

import { useState } from "react";
import Link from "next/link";
import { Compass, Menu, X, PenSquare } from "lucide-react";

interface SidebarProps {
  categories?: string[];
}

export default function Sidebar({ categories = [] }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "홈" },
    ...categories.map(cat => ({ href: `/category/${cat.toLowerCase()}`, label: cat })),
  ];

  return (
    <>
      {/* ── Desktop Sidebar ────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white dark:bg-[#111] border-r border-gray-200 dark:border-gray-800 z-50 overflow-y-auto">
        <div className="p-6">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 mb-10 group"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded bg-gray-900 dark:bg-white">
              <Compass className="w-5 h-5 text-white dark:text-gray-900" strokeWidth={2} />
            </div>
            <div className="flex flex-col -space-y-0.5">
              <span className="text-sm font-bold tracking-tight text-gray-900 dark:text-white">
                Dlsrivew
              </span>
              <span className="text-[10px] font-medium tracking-widest uppercase text-gray-500">
                MAGAZINE
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-3 mt-4">
              Menu
            </span>
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

        {/* Write Button */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800">
          <Link
            href="/admin/write"
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            <PenSquare className="w-4 h-4" />
            글쓰기
          </Link>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-6 pt-4">
          <p className="text-xs text-gray-400">
            &copy; 2026 Dlsrivew
          </p>
        </div>
      </aside>

      {/* ── Mobile Top Bar ───────────────────────────────────────────── */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#111] border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-gray-900 dark:bg-white">
              <Compass className="w-5 h-5 text-white dark:text-gray-900" strokeWidth={2} />
            </div>
            <span className="text-sm font-bold tracking-tight text-gray-900 dark:text-white">
              Dlsrivew
            </span>
          </Link>
          <button
            className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 dark:text-gray-400"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {/* Mobile Menu Dropdown */}
        <div
          className="overflow-hidden bg-white dark:bg-[#111]"
          style={{
            maxHeight: isMobileMenuOpen ? "400px" : "0",
            transition: "max-height 0.3s ease",
          }}
        >
          <div className="py-2 border-t border-gray-100 dark:border-gray-800">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin/write"
              className="flex items-center gap-2 mx-4 mt-2 px-4 py-2.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <PenSquare className="w-4 h-4" />
              글쓰기
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
