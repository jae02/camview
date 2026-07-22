import { getArticlesByCategory, getAllCategories } from "@/lib/articles";
import ArticleCard from "@/components/blog/ArticleCard";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((category) => ({
    slug: category.toLowerCase(),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return {
    title: `${slug.toUpperCase()} 카테고리 글 모음`,
    description: `${slug.toUpperCase()} 주제에 관한 다양한 이야기들을 만나보세요.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categories = await getAllCategories();
  
  // Find original category name with correct casing if possible
  const originalCategory = categories.find(c => c.toLowerCase() === slug.toLowerCase()) || slug;
  const articles = await getArticlesByCategory(slug);

  if (!articles || articles.length === 0) {
    notFound();
  }

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="container-custom">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {originalCategory}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {originalCategory} 카테고리의 모든 글을 확인해보세요.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </div>
  );
}
