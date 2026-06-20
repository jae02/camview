import { getAllArticles } from "@/lib/articles";
import ArticleCard from "@/components/blog/ArticleCard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "블로그 | Dlsrivew",
  description: "전문가가 분석한 깊이 있는 카메라 리뷰와 가이드를 만나보세요.",
};

export default async function BlogIndexPage() {
  const articles = await getAllArticles();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] pt-24 pb-20">
      <div className="container-custom">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-1 h-8 rounded-full"
              style={{ background: "var(--gradient-brand)" }}
            />
            <h1 className="heading-xl" style={{ color: "var(--text-primary)" }}>
              블로그 & 리뷰
            </h1>
          </div>
          <p className="text-lg ml-4" style={{ color: "var(--text-secondary)" }}>
            모든 아티클과 전문가 가이드를 모아보세요.
          </p>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {articles.map((article, idx) => (
            <ArticleCard key={article.id} article={article} index={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}
