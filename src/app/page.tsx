import Link from "next/link";
import { getAllArticles, getAllCategories } from "@/lib/articles";
import ArticleCard from "@/components/blog/ArticleCard";

export default async function HomePage() {
  const articles = await getAllArticles();
  const categories = await getAllCategories();

  return (
    <>
      <section id="articles" className="py-12 md:py-20" style={{ background: "var(--bg-primary)" }}>
        <div className="container-custom max-w-4xl mx-auto">
          {/* Section Header & Category Filters */}
          <div className="flex flex-col mb-10 pb-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              전체 글
            </h2>
            
            <div className="flex flex-wrap gap-2">
              <Link 
                href="/"
                className="px-4 py-2 rounded-full text-sm font-medium transition-colors bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                전체
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/category/${cat.toLowerCase()}`}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-colors border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] hover:text-gray-900 dark:hover:text-white"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          {/* Article List (1 Column) */}
          <div className="flex flex-col">
            {articles.map((article, idx) => (
              <ArticleCard key={article.id} article={article} index={idx} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
