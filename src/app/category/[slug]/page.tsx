import { notFound } from 'next/navigation';
import { getArticles, getPopularArticles } from '@/lib/articles';
import { getCategoryBySlug } from '@/data/categories';
import ArticleCard from '@/components/article/ArticleCard';
import Sidebar from '@/components/layout/Sidebar';
import Pagination from '@/components/article/Pagination';
import type { Metadata } from 'next';

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const category = getCategoryBySlug(slug);
  if (!category) return { title: '카테고리를 찾을 수 없습니다' };

  return {
    title: `${category.name} — DSLReview`,
    description: category.description,
  };
}

export default async function CategoryPage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const page = parseInt(searchParams.page || '1', 10);
  const { articles, total, totalPages } = await getArticles({
    category: slug,
    page,
    limit: 10,
  });
  const popularArticles = (await getPopularArticles(5)).map((a) => ({
    id: a.id,
    title: a.title,
    views: a.views,
  }));

  return (
    <div className="flex gap-8">
      <div className="flex-1 min-w-0">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{category.icon}</span>
            <h1 className="text-3xl font-bold">{category.name}</h1>
          </div>
          <p className="text-sm text-gray-400">
            {category.description} ·{' '}
            <span className="text-amber-400 font-semibold">{total}</span>개의 글
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-gray-400 text-lg">이 카테고리에 작성된 글이 없습니다.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath={`/category/${slug}`}
          />
        )}
      </div>

      <aside className="hidden lg:block w-72 shrink-0">
        <Sidebar popularArticles={popularArticles} />
      </aside>
    </div>
  );
}
