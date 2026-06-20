import Link from 'next/link';
import { ArrowRight, Calendar, BookOpen } from 'lucide-react';

interface ArticleCardProps {
  article: {
    id: string;
    slug: string;
    title: string;
    category: string;
    createdAt: string;
  };
  index?: number;
}

export default function ArticleCard({ article, index = 0 }: ArticleCardProps) {
  const formattedDate = new Date(article.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 hover:border-blue-500 transition-all duration-300 hover:shadow-lg relative overflow-hidden"
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      <div className="space-y-4">
        {/* Category Badge */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400">
            <BookOpen className="w-3 h-3" />
            {article.category}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
            <Calendar className="w-3 h-3" />
            {formattedDate}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight group-hover:text-blue-600 transition-colors line-clamp-3">
          {article.title}
        </h3>
      </div>

      {/* Footer / CTA */}
      <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
          Dlsrivew Editor
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
          읽어보기 <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}
