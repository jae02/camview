'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Article } from '@/types';
import { ExtendedComment } from '@/lib/comments';

export default function AdminDashboard() {
  const router = useRouter();
  const [adminAuth, setAdminAuth] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'articles' | 'comments'>('articles');
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [comments, setComments] = useState<ExtendedComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth');
    if (!auth) {
      router.push('/admin');
    } else {
      setAdminAuth(auth);
    }
  }, [router]);

  useEffect(() => {
    if (adminAuth) {
      fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminAuth, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'articles') {
        const res = await fetch('/api/articles?limit=1000');
        const data = await res.json();
        setArticles(data.articles || []);
      } else {
        const res = await fetch('/api/admin/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminPassword: adminAuth })
        });
        const data = await res.json();
        if (res.ok) setComments(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteArticle = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPassword: adminAuth }),
      });
      if (res.ok) {
        setArticles(articles.filter(a => a.id !== id));
      } else {
        alert('삭제 실패');
      }
    } catch (e) {
      alert('오류 발생');
    }
  };

  const deleteComment = async (articleId: string, commentId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      const res = await fetch(`/api/admin/comments`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, commentId, adminPassword: adminAuth }),
      });
      if (res.ok) {
        setComments(comments.filter(c => c.id !== commentId));
      } else {
        alert('삭제 실패');
      }
    } catch (e) {
      alert('오류 발생');
    }
  };

  if (!adminAuth) return null;

  return (
    <div className="max-w-6xl mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">관리자 대시보드</h1>
        <Link href="/admin/write" className="btn-primary">
          새 글 작성
        </Link>
      </div>

      <div className="flex gap-4 mb-6 border-b border-white/10 pb-2">
        <button
          className={`px-4 py-2 font-medium transition-colors ${activeTab === 'articles' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('articles')}
        >
          게시글 관리
        </button>
        <button
          className={`px-4 py-2 font-medium transition-colors ${activeTab === 'comments' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('comments')}
        >
          댓글 관리
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">로딩 중...</div>
      ) : activeTab === 'articles' ? (
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-white/5 text-gray-400 border-b border-white/10">
              <tr>
                <th className="px-4 py-3">카테고리</th>
                <th className="px-4 py-3">제목</th>
                <th className="px-4 py-3">조회수</th>
                <th className="px-4 py-3">댓글</th>
                <th className="px-4 py-3">작성일</th>
                <th className="px-4 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <span className="badge">{article.category}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-white max-w-md truncate">
                    <Link href={`/post/${article.id}`} className="hover:text-amber-400" target="_blank">
                      {article.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{article.views}</td>
                  <td className="px-4 py-3">{article.comments?.length || 0}</td>
                  <td className="px-4 py-3">{new Date(article.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Link href={`/admin/write?edit=${article.id}`} className="text-blue-400 hover:underline">
                      수정
                    </Link>
                    <button onClick={() => deleteArticle(article.id)} className="text-red-400 hover:underline">
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
              {articles.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    작성된 글이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-white/5 text-gray-400 border-b border-white/10">
              <tr>
                <th className="px-4 py-3">작성자</th>
                <th className="px-4 py-3">내용</th>
                <th className="px-4 py-3">원본 글</th>
                <th className="px-4 py-3">작성일</th>
                <th className="px-4 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((comment) => (
                <tr key={comment.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-medium text-white">{comment.nickname}</td>
                  <td className="px-4 py-3 max-w-sm truncate">{comment.content}</td>
                  <td className="px-4 py-3 max-w-xs truncate">
                    <Link href={`/post/${comment.articleId}`} className="text-gray-400 hover:text-amber-400 underline" target="_blank">
                      {comment.articleTitle}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{new Date(comment.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => deleteComment(comment.articleId, comment.id)} className="text-red-400 hover:underline">
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
              {comments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    작성된 댓글이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
