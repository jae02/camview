"use client";

import { ArrowRight, BarChart3 } from "lucide-react";
import Link from "next/link";

/**
 * Hero Section — Client Component for hover interactivity.
 * Extracted from the homepage Server Component.
 */
export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative flex flex-col items-center justify-center text-center"
      style={{
        minHeight: "85vh",
        paddingTop: "6rem",
        paddingBottom: "4rem",
        overflow: "hidden",
      }}
    >
      {/* Clean background instead of orbs */}
      <div className="absolute inset-0 bg-white" style={{ zIndex: -1 }} />

      <div className="relative z-10 container-custom space-y-8 animate-fade-in-up">
        {/* Badge */}
        <div className="flex justify-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-default)",
              color: "var(--text-secondary)",
              boxShadow: "var(--shadow-sm)"
            }}
          >
            <span className="pulse-dot" />
            6개 브랜드, 30개 이상의 카메라 수록
          </div>
        </div>

        {/* Headline */}
        <h1
          className="heading-xl max-w-3xl mx-auto"
          style={{ color: "var(--text-primary)" }}
        >
          <span className="gradient-text">카메라 마니아</span>를 위한{" "}
          최고의 플랫폼
        </h1>

        {/* Subtitle */}
        <p
          className="body-lg max-w-xl mx-auto"
          style={{ color: "var(--text-secondary)" }}
        >
          상세 사양을 확인하고, 카메라를 나란히 비교하고,
          실제 사진가들의 생생한 리뷰를 만나보세요.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="#cameras"
            id="hero-browse-btn"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold"
            style={{
              background: "var(--gradient-brand)",
              color: "white",
              boxShadow: "0 0 30px var(--accent-glow)",
              transition: "var(--transition-fast)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.boxShadow = "var(--shadow-md)";
              el.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.boxShadow = "0 0 30px var(--accent-glow)";
              el.style.transform = "translateY(0)";
            }}
          >
            카메라 둘러보기
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/compare"
            id="hero-compare-btn"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold"
            style={{
              background: "transparent",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-default)",
              transition: "var(--transition-fast)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "var(--border-accent)";
              el.style.color = "var(--text-primary)";
              el.style.background = "var(--bg-tertiary)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "var(--border-default)";
              el.style.color = "var(--text-secondary)";
              el.style.background = "transparent";
            }}
          >
            <BarChart3 className="w-4 h-4" />
            모델 비교하기
          </Link>
        </div>
      </div>
    </section>
  );
}
