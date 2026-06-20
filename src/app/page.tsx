import {
  Camera,
  ArrowRight,
  Sparkles,
  BarChart3,
  Users,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import ArticleCard from "@/components/blog/ArticleCard";
import { getAllArticles } from "@/lib/articles";
import HeroSection from "@/components/layout/HeroSection";

/**
 * Home page — the main landing experience for Dlsrivew.
 *
 * Sections:
 * 1. Hero with headline, tagline, and CTA (Client Component for interactivity)
 * 2. Feature highlights strip
 * 3. Articles grid showcasing all latest reviews/guides
 * 4. Community stats bar
 */
export default async function HomePage() {
  const articles = await getAllArticles();

  const features = [
    {
      icon: "BookOpen" as const,
      title: "심층 리뷰",
      description: "현업 전문가가 작성한 상세한 카메라 분석 및 가이드",
    },
    {
      icon: "BarChart3" as const,
      title: "사양 비교",
      description: "스펙을 나란히 비교하여 최적의 카메라를 찾아보세요",
    },
    {
      icon: "Sparkles" as const,
      title: "상세 스펙",
      description: "130개 이상의 카메라 모델에 대한 기술 데이터 제공",
    },
  ];

  const stats = [
    { value: "133+", label: "수록 카메라" },
    { value: "6", label: "브랜드" },
    { value: "100%", label: "전문가 리뷰" },
    { value: "98%", label: "데이터 정확도" },
  ];

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════
           SECTION 1 — HERO (Client Component for hover interactivity)
           ══════════════════════════════════════════════════════════════ */}
      <HeroSection />

      {/* ══════════════════════════════════════════════════════════════
           SECTION 2 — FEATURE HIGHLIGHTS
           ══════════════════════════════════════════════════════════════ */}
      <section
        id="features"
        className="py-16"
        style={{
          background: "var(--bg-secondary)",
          borderTop: "1px solid var(--border-subtle)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => {
              const IconMap = { Sparkles, BarChart3, Users, BookOpen };
              const Icon = IconMap[feature.icon];
              return (
                <div
                  key={feature.title}
                  className="flex items-start gap-4 p-6 rounded-xl feature-card"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                    transition: "var(--transition-normal)",
                  }}
                >
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0"
                    style={{
                      background: "rgba(99, 102, 241, 0.1)",
                      border: "1px solid rgba(99, 102, 241, 0.15)",
                    }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: "var(--accent-secondary)" }}
                    />
                  </div>
                  <div>
                    <h3
                      className="text-sm font-bold mb-1"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
           SECTION 3 — ARTICLES GRID
           ══════════════════════════════════════════════════════════════ */}
      <section id="articles" className="py-20 bg-gray-50 dark:bg-[#0a0a0a]">
        <div className="container-custom">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-1 h-8 rounded-full"
                  style={{ background: "var(--gradient-brand)" }}
                />
                <h2
                  className="heading-lg"
                  style={{ color: "var(--text-primary)" }}
                >
                  최신 리뷰 & 가이드
                </h2>
              </div>
              <p
                className="text-sm ml-4"
                style={{ color: "var(--text-tertiary)" }}
              >
                전문가가 분석한 깊이 있는 아티클을 만나보세요.
              </p>
            </div>
          </div>

          {/* Article Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {articles.map((article, idx) => (
              <ArticleCard key={article.id} article={article} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
           SECTION 4 — COMMUNITY STATS
           ══════════════════════════════════════════════════════════════ */}
      <section
        id="community-stats"
        className="py-10"
        style={{
          background: "var(--bg-primary)",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-1.5 flex flex-col items-center justify-center">
                <div 
                  className="text-2xl font-bold"
                  style={{ color: "var(--accent-primary)" }}
                >
                  {stat.value}
                </div>
                <p
                  className="text-xs font-semibold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
