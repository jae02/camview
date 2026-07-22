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
      className="block py-6 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors"
    >
      <div className="flex flex-col gap-2">
        {/* Category & Date */}
        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <span className="font-medium text-blue-600 dark:text-blue-400">
            {article.category}
          </span>
          <span className="text-gray-300 dark:text-gray-700">|</span>
          <span>{formattedDate}</span>
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
          {article.title}
        </h3>
        
        {/* Excerpt placeholder if needed in the future */}
        <p className="text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 text-sm sm:text-base">
          {article.title}에 관한 자세한 이야기를 확인해보세요.
        </p>
      </div>
    </Link>
  );
}
