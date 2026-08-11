import { notFound } from 'next/navigation';
import { getArticleById, getPopularArticles } from '@/lib/articles';
import { getCategoryBySlug } from '@/data/categories';
import ArticleContent from '@/components/article/ArticleContent';
import CommentSection from '@/components/article/CommentSection';
import Sidebar from '@/components/layout/Sidebar';
import Link from 'next/link';
import type { Metadata } from 'next';

export async function generateMetadata(
  props: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await props.params;
  const article = await getArticleById(id);
  if (!article) return { title: '글을 찾을 수 없습니다' };

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.createdAt,
      modifiedTime: article.updatedAt,
    },
  };
}

export default async function PostPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const article = await getArticleById(id);

  if (!article) {
    notFound();
  }

  const category = getCategoryBySlug(article.category);
  const popularArticles = (await getPopularArticles(5)).map((a) => ({
    id: a.id,
    title: a.title,
    views: a.views,
  }));

  const dateStr = new Date(article.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex gap-8">
      <div className="flex-1 min-w-0">
        <article className="glass-card p-6 md:p-10 mb-6">
          <div className="mb-6">
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-amber-400 transition-colors"
            >
              ← 목록으로
            </Link>
          </div>

          <div className="flex items-center gap-3 mb-4">
            {category && (
              <Link href={`/category/${category.slug}`} className="badge">
                {category.icon} {category.name}
              </Link>
            )}
          </div>

          <h1 className="text-2xl md:text-4xl font-bold mb-4 leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-gray-400 mb-8 pb-6 border-b border-white/10">
            <span>{dateStr}</span>
            <span>·</span>
            <span>조회 {article.views.toLocaleString()}</span>
            <span>·</span>
            <span>💬 {article.comments.length}</span>
          </div>

          <ArticleContent content={article.content} />

          {article.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-white/5 text-xs text-gray-400 border border-white/10"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </article>

        <CommentSection articleId={article.id} />
      </div>

      <aside className="hidden lg:block w-72 shrink-0">
        <Sidebar popularArticles={popularArticles} />
      </aside>
    </div>
  );
}
