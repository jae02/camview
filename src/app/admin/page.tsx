"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PenSquare, Trash2, Plus, ArrowLeft, FileText, FileLock } from "lucide-react";

interface Post {
  slug: string;
  title: string;
  category: string;
  createdAt: string;
  draft: boolean;
}

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/posts?all=true')
      .then(res => {
        if (res.status === 401) { router.push('/admin/login'); return null; }
        return res.json();
      })
      .then(data => {
        if (data) setPosts(data.posts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`"${title}"을(를) 정말 삭제하시겠습니까?`)) return;
    
    const res = await fetch(`/api/posts/${slug}`, { method: 'DELETE' });
    if (res.ok) {
      setPosts(posts.filter(p => p.slug !== slug));
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">로딩 중...</p></div>;

  return (
    <div className="py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">글 관리</h1>
            <span className="text-sm text-gray-500">{posts.length}개의 글</span>
          </div>
          <Link
            href="/admin/write"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            새 글
          </Link>
        </div>

        <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          {posts.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <p>작성된 글이 없습니다.</p>
            </div>
          ) : (
            posts.map((post, idx) => (
              <div
                key={post.slug}
                className={`flex items-center justify-between px-5 py-4 ${idx !== posts.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''} hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {post.draft ? (
                    <FileLock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <Link href={`/blog/${post.slug}`} className="text-sm font-medium text-gray-900 dark:text-white hover:underline truncate block">
                      {post.title}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <span>{post.category}</span>
                      <span>·</span>
                      <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
                      {post.draft && <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold">임시저장</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <Link href={`/admin/edit/${post.slug}`} className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-800 transition-colors">
                    <PenSquare className="w-4 h-4" />
                  </Link>
                  <button onClick={() => handleDelete(post.slug, post.title)} className="p-2 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
