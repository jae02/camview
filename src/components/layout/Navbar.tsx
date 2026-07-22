"use client";

import { useState } from "react";
import Link from "next/link";
import { Compass, Menu, X, Search } from "lucide-react";

/**
 * Navigation bar for the blog
 */
interface NavbarProps {
  categories?: string[];
}

export default function Navbar({ categories = [] }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "홈" },
    ...categories.map(cat => ({ href: `/category/${cat.toLowerCase()}`, label: cat })),
    { href: "/about", label: "소개" },
  ];

  return (
    <nav
      id="main-navbar"
      className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#111] border-b border-gray-200 dark:border-gray-800"
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* ── Left Section: Logo & Nav ──────────────────────────────── */}
          <div className="flex items-center gap-6 md:gap-10">
            {/* ── Brand Logo ──────────────────────────────────────────────── */}
            <Link
              href="/"
              id="nav-brand"
              className="flex items-center gap-2.5 group"
              style={{ transition: "var(--transition-normal)" }}
            >
              <div
                className="flex items-center justify-center w-8 h-8 rounded bg-gray-900 dark:bg-white"
              >
                <Compass className="w-5 h-5 text-white dark:text-gray-900" strokeWidth={2} />
              </div>
              <div className="flex flex-col -space-y-0.5">
                <span
                  className="text-sm font-bold tracking-tight"
                  style={{ color: "var(--text-primary)" }}
                >
                  Dlsrivew
                </span>
                <span
                  className="text-[10px] font-medium tracking-widest uppercase"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  MAGAZINE
                </span>
              </div>
            </Link>

            {/* ── Desktop Navigation ──────────────────────────────────────── */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  id={`nav-link-${link.label.toLowerCase()}`}
                  className="px-4 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Right Section: Actions & Mobile Toggle ────────────────── */}
          <div className="flex items-center gap-3">
            {/* ── Desktop Actions ─────────────────────────────────────────── */}
            <div className="hidden md:flex items-center">
              {/* Search button */}
              <button
                id="nav-search-btn"
                className="flex items-center justify-center w-9 h-9 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* ── Mobile Menu Toggle ──────────────────────────────────────── */}
            <button
              id="nav-mobile-toggle"
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg"
              style={{
                color: "var(--text-secondary)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="모바일 메뉴 토글"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu Dropdown ────────────────────────────────────── */}
        <div
          id="mobile-menu-panel"
          className="md:hidden overflow-hidden"
          style={{
            maxHeight: isMobileMenuOpen ? "400px" : "0",
            opacity: isMobileMenuOpen ? 1 : 0,
            transition: "max-height 0.3s ease, opacity 0.2s ease",
          }}
        >
          <div
            className="py-4 space-y-1"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2.5 text-sm font-medium rounded-lg"
                style={{
                  color: "var(--text-secondary)",
                  transition: "var(--transition-fast)",
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
