import { ArrowRight, BookOpen, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";
import { getAllArticles, getAllCategories } from "@/lib/articles";
import ArticleCard from "@/components/blog/ArticleCard";

export default async function HomePage() {
  const articles = await getAllArticles();
  const categories = await getAllCategories();

  const features = [
    {
      icon: BookOpen,
      title: "심층 리뷰",
      description: "에디터가 직접 사용해보고 작성한 가감 없는 솔직한 리뷰",
    },
    {
      icon: TrendingUp,
      title: "최신 트렌드",
      description: "빠르게 변하는 디지털 시장의 최신 소식과 유행 분석",
    },
    {
      icon: Sparkles,
      title: "초보자 가이드",
      description: "어려운 IT 지식을 일상어로 쉽게 풀어낸 맞춤형 가이드",
    },
  ];

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════
           SECTION 1 — HERO
           ══════════════════════════════════════════════════════════════ */}
      <section
        id="hero"
        className="relative flex flex-col items-center justify-center text-center"
        style={{
          minHeight: "70vh",
          paddingTop: "6rem",
          paddingBottom: "4rem",
          overflow: "hidden",
        }}
      >
        <div className="absolute inset-0" style={{ zIndex: -1, background: "var(--bg-primary)" }} />
        <div
          className="absolute inset-0"
          style={{
            zIndex: 0,
            background: "radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.05) 0%, transparent 70%)"
          }}
        />

        <div className="relative z-10 container-custom space-y-8 animate-fade-in-up">
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
              다양한 주제를 다루는 오리지널 콘텐츠
            </div>
          </div>

          <h1
            className="heading-xl max-w-3xl mx-auto"
            style={{ color: "var(--text-primary)" }}
          >
            당신의 일상이 새로워지는 시간,{" "}
            <span className="gradient-text">Dlsrivew</span>
          </h1>

          <p
            className="body-lg max-w-xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            어려운 기술과 스펙 나열은 이제 그만! IT, 리뷰, 일상 등 다채로운 주제의 
            생생한 이야기와 인사이트를 만나보세요.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
           SECTION 2 — FEATURES
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
            {features.map((feature) => (
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
                  <feature.icon
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
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
           SECTION 3 — ALL ARTICLES GRID
           ══════════════════════════════════════════════════════════════ */}
      <section id="articles" className="py-20" style={{ background: "var(--bg-primary)" }}>
        <div className="container-custom">
          {/* Section Header */}
          <div className="flex flex-col mb-12">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-1 h-8 rounded-full"
                style={{ background: "var(--gradient-brand)" }}
              />
              <h2
                className="heading-lg"
                style={{ color: "var(--text-primary)" }}
              >
                최신 아티클
              </h2>
            </div>
            <p
              className="text-sm ml-4 mb-6"
              style={{ color: "var(--text-tertiary)" }}
            >
              새롭게 올라온 다채로운 이야기들을 만나보세요.
            </p>
            
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 ml-4">
              <Link 
                href="/"
                className="px-4 py-2 rounded-full text-sm font-medium transition-colors border border-transparent"
                style={{ background: "var(--bg-tertiary)", color: "var(--text-primary)" }}
              >
                전체
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/category/${cat.toLowerCase()}`}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-colors border hover:border-gray-900 hover:text-gray-900 dark:hover:border-white dark:hover:text-white"
                  style={{ 
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {cat}
                </Link>
              ))}
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
    </>
  );
}
