import Link from 'next/link';
import { Article } from '@/types';

interface ArticleCardProps {
  article: Article;
}

const categoryNames: Record<string, string> = {
  notice: '공지사항',
  camera: '카메라',
  'photo-tips': '사진 팁',
  review: '리뷰',
  free: '자유',
};

export default function ArticleCard({ article }: ArticleCardProps) {
  const date = new Date(article.createdAt);
  const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  
  const catName = categoryNames[article.category] || article.category;

  return (
    <article className="glass-card p-5 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-2">
        <span className="badge">{catName}</span>
        <span className="text-xs text-gray-500">{formattedDate}</span>
      </div>
      
      <Link href={`/post/${article.id}`} className="block group mb-2">
        <h2 className="text-xl font-bold text-gray-100 group-hover:text-amber-400 transition-colors mb-2">
          {article.title}
        </h2>
        <p className="text-sm text-gray-400 line-clamp-2">
          {article.excerpt}
        </p>
      </Link>
      
      <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          {article.views.toLocaleString()}
        </div>
        <div className="flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          {article.comments.length.toLocaleString()}
        </div>
      </div>
    </article>
  );
}
