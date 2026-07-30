import Link from 'next/link';
import { Clock } from 'lucide-react';

interface ArticleCardProps {
  article: {
    id: string;
    slug: string;
    title: string;
    category: string;
    createdAt: string;
    excerpt?: string;
    coverImage?: string;
    readingTime?: number;
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
      <div className="flex gap-5">
        {/* Text Content */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          {/* Category & Date & Reading Time */}
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium text-amber-700 dark:text-amber-500">
              {article.category}
            </span>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <span>{formattedDate}</span>
            {article.readingTime && (
              <>
                <span className="text-gray-300 dark:text-gray-700">|</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {article.readingTime}분
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
            {article.title}
          </h3>
          
          {/* Excerpt */}
          <p className="text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 text-sm sm:text-base">
            {article.excerpt || `${article.title}에 관한 자세한 이야기를 확인해보세요.`}
          </p>
        </div>

        {/* Cover Image Thumbnail */}
        {article.coverImage && (
          <div className="hidden sm:block w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </Link>
  );
}
