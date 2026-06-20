import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import CompareWidget from '@/components/blog/CompareWidget';
import TableOfContents from '@/components/blog/TableOfContents';
import { getArticleBySlug, getAllArticles } from '@/lib/articles';

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
  return { title: `${article.title} | Dlsrivew` };
}

// We need to add an ID to h2 and h3 elements so TableOfContents can link to them.
// A simple way is to pass a custom component for MDX.
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
  // 로컬 MDX 파일 및 JSON 데이터 패칭
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl flex flex-col lg:flex-row gap-12 items-start">
      
      {/* 1. 메인 콘텐츠 영역 (가독성 최적화를 위해 max-w-3xl 제한) */}
      <article className="flex-1 w-full max-w-3xl prose prose-lg dark:prose-invert">
        <header className="mb-10 border-b pb-8 border-gray-200 dark:border-gray-800">
          <span className="text-sm font-bold text-blue-600 tracking-wider uppercase mb-2 block">
            {article.category || 'Guide'}
          </span>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight mb-4 text-gray-900 dark:text-white">
            {article.title}
          </h1>
          <div className="flex items-center text-gray-500 text-sm">
            <span>{new Date(article.createdAt).toLocaleDateString('ko-KR')}</span>
            <span className="mx-2">•</span>
            <span>By Dlsrivew Editor</span>
          </div>
        </header>
        
        {/* MDX 콘텐츠 렌더링 (이 부분의 텍스트가 애드센스 심사의 핵심) */}
        <section className="text-gray-800 dark:text-gray-200 leading-relaxed">
          <MDXRemote source={article.content} components={components} />
        </section>
      </article>

      {/* 2. 다이내믹 사이드바 (화면 스크롤 시 따라다니는 Sticky 영역) */}
      <aside className="w-full lg:w-80 flex-shrink-0 space-y-8 sticky top-24 hidden lg:block">
        
        {/* 목차 (Table of Contents) 위젯 */}
        <div className="bg-gray-50 dark:bg-[#111] p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">목차</h3>
          <TableOfContents source={article.content} />
        </div>

        {/* 연관 카메라 퀵 비교 위젯 (Dlsrivew 핵심 기능 유도) */}
        {article.targetCameras && article.targetCameras.length >= 2 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/50">
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">본문 속 카메라 비교</h3>
            <CompareWidget cameras={article.targetCameras.slice(0, 2)} />
          </div>
        )}
      </aside>
    </div>
  );
}
