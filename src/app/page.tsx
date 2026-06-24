import {
  Camera,
  ArrowRight,
  Sparkles,
  BarChart3,
  Users,
} from "lucide-react";
import Link from "next/link";
import CameraCard from "@/components/cameras/CameraCard";
import { getFeaturedCameras } from "@/lib/queries";
// @ts-ignore
import { getAllArticles } from "@/lib/articles";
import HeroSection from "@/components/layout/HeroSection";

/**
 * Home page — the main landing experience for 카메라 백과사전.
 *
 * Sections:
 * 1. Hero with headline, tagline, and CTA (Client Component for interactivity)
 * 2. Feature highlights strip
 * 3. Camera grid showcasing all listed models
 * 4. Community stats bar
 */
export default async function HomePage() {
  const cameras = await getFeaturedCameras(6);
  // @ts-ignore
  const articles = await getAllArticles();

  const features = [
    {
      icon: "Sparkles" as const,
      title: "상세 스펙",
      description: "모든 모델의 종합적인 기술 데이터 제공",
    },
    {
      icon: "BarChart3" as const,
      title: "사양 비교",
      description: "스펙을 나란히 비교하여 최적의 카메라를 찾아보세요",
    },
    {
      icon: "Users" as const,
      title: "브랜드별 도감",
      description: "Sony, Canon, Nikon, Fujifilm, Panasonic, Leica 등 25개 이상 브랜드 카메라 총망라",
    },
  ];

  const stats = [
    { value: "1,300+", label: "수록 카메라" },
    { value: "25+", label: "브랜드" },
    { value: "50+", label: "상세 스펙 항목" },
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
              const IconMap = { Sparkles, BarChart3, Users };
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
           SECTION 3 — CAMERA GRID
           ══════════════════════════════════════════════════════════════ */}
      <section id="cameras" className="py-20">
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
                  카메라 도감
                </h2>
              </div>
              <p
                className="text-sm ml-4"
                style={{ color: "var(--text-tertiary)" }}
              >
                다양한 카메라 모델의 상세 사양을 확인해 보세요.
              </p>
            </div>

            <Link
              href="/cameras"
              className="inline-flex items-center gap-1.5 text-sm font-medium ml-4 sm:ml-0 view-all-link"
              style={{
                color: "var(--accent-secondary)",
                transition: "var(--transition-fast)",
              }}
            >
              전체 카메라 보기
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Camera Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {cameras.map((camera, idx) => (
              <CameraCard key={camera.id} camera={camera} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
           SECTION 4 — LATEST BLOG POSTS
           ══════════════════════════════════════════════════════════════ */}
      <section id="blog" className="py-20" style={{ background: "var(--bg-card)" }}>
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
                  최신 블로그 기사
                </h2>
              </div>
              <p
                className="text-sm ml-4"
                style={{ color: "var(--text-tertiary)" }}
              >
                카메라 전문 에디터들의 최신 소식과 리뷰를 확인하세요.
              </p>
            </div>

            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-medium ml-4 sm:ml-0 view-all-link"
              style={{
                color: "var(--accent-secondary)",
                transition: "var(--transition-fast)",
              }}
            >
              블로그 전체 보기
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Articles Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.slice(0, 3).map((article: any) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group flex flex-col rounded-xl overflow-hidden"
                style={{
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border-subtle)",
                  transition: "var(--transition-normal)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div className="p-6 flex flex-col h-full">
                  <h3 className="font-bold text-lg mb-2" style={{ color: "var(--text-primary)" }}>
                    {article.title}
                  </h3>
                  {article.description && (
                    <p className="text-sm mb-4 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                      {article.description}
                    </p>
                  )}
                  {article.date && (
                    <div className="mt-auto text-xs" style={{ color: "var(--text-tertiary)" }}>
                      {new Date(article.date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
           SECTION 5 — COMMUNITY STATS
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
