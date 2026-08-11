import { getArticles, getPopularArticles } from '@/lib/articles';
import ArticleCard from '@/components/article/ArticleCard';
import Sidebar from '@/components/layout/Sidebar';
import type { Metadata } from 'next';

export async function generateMetadata(props: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const q = searchParams.q || '';
  return {
    title: q ? `"${q}" 검색 결과` : '검색',
    description: q ? `"${q}" 검색 결과입니다.` : '글을 검색하세요.',
  };
}

export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const q = searchParams.q || '';
  const page = parseInt(searchParams.page || '1', 10);

  const result = q
    ? await getArticles({ search: q, page, limit: 10 })
    : { articles: [], total: 0, totalPages: 0 };
  const { articles, total } = result;

  const popularArticles = (await getPopularArticles(5)).map((a) => ({
    id: a.id,
    title: a.title,
    views: a.views,
  }));

  return (
    <div className="flex gap-8">
      <div className="flex-1 min-w-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {q ? (
              <>
                &ldquo;<span className="text-amber-400">{q}</span>&rdquo; 검색 결과
              </>
            ) : (
              '검색'
            )}
          </h1>
          {q && (
            <p className="text-sm text-gray-400">
              총 <span className="text-amber-400 font-semibold">{total}</span>개의 결과
            </p>
          )}
        </div>

        {!q ? (
          <div className="glass-card p-12 text-center">
            <p className="text-gray-400 text-lg">검색어를 입력해 주세요.</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-gray-400 text-lg">검색 결과가 없습니다.</p>
            <p className="text-sm text-gray-500 mt-2">다른 키워드로 시도해 보세요.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>

      <aside className="hidden lg:block w-72 shrink-0">
        <Sidebar popularArticles={popularArticles} />
      </aside>
    </div>
  );
}
