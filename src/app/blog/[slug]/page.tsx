import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import CompareWidget from '@/components/blog/CompareWidget';
import TableOfContents from '@/components/blog/TableOfContents';
import EditButton from '@/components/blog/EditButton';
import { getArticleBySlug, getAllArticles } from '@/lib/articles';
import { Clock } from 'lucide-react';

// For Next.js Static Export / Pre-rendering
export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

// SEO 메타데이터 자동 생성
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  
  if (!article) return {};
  return {
    title: `${article.title} | Dlsrivew`,
    description: article.excerpt || article.title,
  };
}

// We need to add an ID to h2 and h3 elements so TableOfContents can link to them.
const components = {
  h2: (props: any) => {
    const id = props.children?.toString().toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-').replace(/(^-|-$)/g, '');
    return <h2 id={id} {...props} />;
  },
  h3: (props: any) => {
    const id = props.children?.toString().toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-').replace(/(^-|-$)/g, '');
    return <h3 id={id} {...props} />;
  },
  CompareWidget,
};

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl flex flex-col lg:flex-row gap-12 items-start">
      
      {/* 1. 메인 콘텐츠 영역 */}
      <article className="flex-1 w-full max-w-3xl prose prose-lg dark:prose-invert">
        <header className="mb-10 border-b pb-8 border-gray-200 dark:border-gray-800">
          <span className="text-sm font-bold text-amber-700 dark:text-amber-500 tracking-wider uppercase mb-2 block">
            {article.category || 'Guide'}
          </span>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight mb-4 text-gray-900 dark:text-white">
            {article.title}
          </h1>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center text-gray-500 text-sm gap-3">
              <span>{new Date(article.createdAt).toLocaleDateString('ko-KR')}</span>
              <span>•</span>
              <span>By Dlsrivew Editor</span>
              {article.readingTime && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    약 {article.readingTime}분
                  </span>
                </>
              )}
            </div>
            <EditButton slug={slug} />
          </div>
        </header>

        {/* Cover Image */}
        {article.coverImage && (
          <div className="rounded-xl overflow-hidden mb-8 not-prose">
            <img src={article.coverImage} alt={article.title} className="w-full h-auto" />
          </div>
        )}
        
        {/* MDX 콘텐츠 렌더링 */}
        <section className="text-gray-800 dark:text-gray-200 leading-relaxed">
          <MDXRemote source={article.content} components={components} />
        </section>
      </article>

      {/* 2. 다이내믹 사이드바 */}
      <aside className="w-full lg:w-80 flex-shrink-0 space-y-8 sticky top-8 hidden lg:block">
        <div className="bg-gray-50 dark:bg-[#111] p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">목차</h3>
          <TableOfContents source={article.content} />
        </div>
      </aside>
    </div>
  );
}
