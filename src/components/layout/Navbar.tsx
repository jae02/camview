"use client";

import { useState } from "react";
import Link from "next/link";
import { Camera, Menu, X, Search } from "lucide-react";

/**
 * Premium dark-themed navigation bar with:
 * - Frosted glass background on scroll
 * - Brand logo with gradient accent
 * - Responsive mobile hamburger menu
 * - Subtle hover animations on nav links
 */
export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "홈" },
    { href: "/cameras", label: "카메라" },
    { href: "/compare", label: "비교" },
    { href: "/community", label: "커뮤니티" },
  ];

  return (
    <nav
      id="main-navbar"
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* ── Brand Logo ──────────────────────────────────────────────── */}
          <Link
            href="/"
            id="nav-brand"
            className="flex items-center gap-2.5 group"
            style={{ transition: "var(--transition-normal)" }}
          >
            <div
              className="flex items-center justify-center w-9 h-9 rounded-lg"
              style={{
                background: "var(--gradient-brand)",
                boxShadow: "0 0 20px var(--accent-glow)",
              }}
            >
              <Camera className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col -space-y-0.5">
              <span
                className="text-sm font-bold tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                카메라스펙
              </span>
              <span
                className="text-[10px] font-medium tracking-widest uppercase"
                style={{ color: "var(--text-tertiary)" }}
              >
                리뷰
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
                className="relative px-4 py-2 text-sm font-medium rounded-lg group"
                style={{
                  color: "var(--text-secondary)",
                  transition: "var(--transition-fast)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--text-primary)";
                  e.currentTarget.style.background = "var(--bg-tertiary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* ── Desktop Actions ─────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search button */}
            <button
              id="nav-search-btn"
              className="flex items-center justify-center w-9 h-9 rounded-lg"
              style={{
                color: "var(--text-tertiary)",
                background: "transparent",
                border: "1px solid var(--border-subtle)",
                transition: "var(--transition-fast)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text-primary)";
                e.currentTarget.style.borderColor = "var(--border-strong)";
                e.currentTarget.style.background = "var(--bg-tertiary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-tertiary)";
                e.currentTarget.style.borderColor = "var(--border-subtle)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Sign in button */}
            <button
              id="nav-signin-btn"
              className="px-4 py-2 text-sm font-semibold rounded-lg"
              style={{
                background: "var(--gradient-brand)",
                color: "white",
                border: "none",
                cursor: "pointer",
                transition: "var(--transition-fast)",
                boxShadow: "0 0 20px var(--accent-glow)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 30px var(--accent-glow-strong)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 20px var(--accent-glow)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              로그인
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
            <div className="pt-3 px-4">
              <button
                className="w-full py-2.5 text-sm font-semibold rounded-lg"
                style={{
                  background: "var(--gradient-brand)",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                로그인
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
