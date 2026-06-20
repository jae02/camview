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
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-default)",
              color: "var(--text-secondary)",
              boxShadow: "var(--shadow-sm)"
            }}
          >
            <span className="pulse-dot" />
            가장 빠르고 정확한 카메라 리뷰 & 가이드
          </div>
        </div>

        {/* Headline */}
        <h1
          className="heading-xl max-w-3xl mx-auto"
          style={{ color: "var(--text-primary)" }}
        >
          당신에게 꼭 맞는 카메라,{" "}
          <span className="gradient-text">리뷰로 찾아보세요</span>
        </h1>

        {/* Subtitle */}
        <p
          className="body-lg max-w-xl mx-auto"
          style={{ color: "var(--text-secondary)" }}
        >
          현업 전문가가 분석한 생생한 리뷰부터 상세 스펙 비교까지. 
          나에게 최적화된 카메라를 발견하는 가장 현명한 방법.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="#articles"
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
            최신 리뷰 보기
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/cameras"
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
            카메라 도감 검색
          </Link>
        </div>
      </div>
    </section>
  );
}
