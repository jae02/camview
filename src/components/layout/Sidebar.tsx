import Link from 'next/link';

interface PopularArticle {
  id: string;
  title: string;
  views: number;
}

export default function Sidebar({ popularArticles = [] }: { popularArticles?: PopularArticle[] }) {
  const categories = [
    { name: '공지사항', icon: '📢', slug: 'notice' },
    { name: '카메라', icon: '📷', slug: 'camera' },
    { name: '사진 팁', icon: '💡', slug: 'photo-tips' },
    { name: '리뷰', icon: '⭐', slug: 'review' },
    { name: '자유', icon: '💬', slug: 'free' },
  ];

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
      {/* Categories */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-bold mb-4 text-white border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>카테고리</h3>
        <ul className="space-y-1">
          {categories.map((cat) => (
            <li key={cat.slug}>
              <Link 
                href={`/category/${cat.slug}`}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <span>{cat.icon}</span>
                <span className="font-medium">{cat.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Popular Articles */}
      {popularArticles.length > 0 && (
        <div className="glass-card p-4 sticky top-24">
          <h3 className="text-lg font-bold mb-4 text-white border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>인기 글</h3>
          <ul className="space-y-3">
            {popularArticles.map((article, i) => (
              <li key={article.id} className="group">
                <Link href={`/post/${article.id}`} className="block">
                  <div className="flex gap-2">
                    <span className="text-amber-500 font-bold opacity-70 group-hover:opacity-100">{i + 1}</span>
                    <div>
                      <p className="text-sm text-gray-300 group-hover:text-amber-400 transition-colors line-clamp-2 leading-tight">
                        {article.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">조회수 {article.views.toLocaleString()}</p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
