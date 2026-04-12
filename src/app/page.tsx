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
import HeroSection from "@/components/layout/HeroSection";

/**
 * Home page — the main landing experience for CameraSpec Reviews.
 *
 * Sections:
 * 1. Hero with headline, tagline, and CTA (Client Component for interactivity)
 * 2. Feature highlights strip
 * 3. Camera grid showcasing all listed models
 * 4. Community stats bar
 */
export default async function HomePage() {
  const cameras = await getFeaturedCameras(6);

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
      title: "커뮤니티 리뷰",
      description: "매일 촬영하는 사진가들의 생생한 후기",
    },
  ];

  const stats = [
    { value: `${cameras.length}+`, label: "등록 카메라" },
    {
      value: `${cameras.reduce((sum, c) => sum + c.reviewCount, 0)}+`,
      label: "커뮤니티 리뷰",
    },
    { value: "98%", label: "데이터 정확도" },
    { value: "15k+", label: "활성 회원" },
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
                  추천 카메라
                </h2>
              </div>
              <p
                className="text-sm ml-4"
                style={{ color: "var(--text-tertiary)" }}
              >
                세계 최고 카메라 제조사의 플래그십 모델을 만나보세요.
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
           SECTION 4 — COMMUNITY STATS
           ══════════════════════════════════════════════════════════════ */}
      <section
        id="community-stats"
        className="py-16"
        style={{
          background: "var(--bg-secondary)",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-1">
                <div className="text-3xl font-extrabold gradient-text">
                  {stat.value}
                </div>
                <p
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: "var(--text-tertiary)" }}
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
