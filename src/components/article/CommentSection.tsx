'use client';

import { useState, useEffect } from 'react';

interface Comment {
  id: string;
  nickname: string;
  content: string;
  createdAt: string;
}

export default function CommentSection({ articleId }: { articleId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState('');

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/articles/${articleId}/comments`);
        if (res.ok) {
          const data = await res.json();
          setComments(data.comments || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [articleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname || !password || !content) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, password, content }),
      });
      
      if (res.ok) {
        const newComment = await res.json();
        setComments([...comments, newComment]);
        setNickname('');
        setPassword('');
        setContent('');
      } else {
        alert('댓글 등록에 실패했습니다.');
      }
    } catch (e) {
      alert('에러가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!deletePassword) {
      alert('비밀번호를 입력해주세요.');
      return;
    }
    
    try {
      const res = await fetch(`/api/articles/${articleId}/comments/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      });
      
      if (res.ok) {
        setComments(comments.filter(c => c.id !== id));
        setDeletingId(null);
        setDeletePassword('');
      } else {
        alert('비밀번호가 일치하지 않습니다.');
      }
    } catch (e) {
      alert('에러가 발생했습니다.');
    }
  };

  return (
    <div className="mt-12">
      <h3 className="text-xl font-bold mb-6 text-white">댓글 {comments.length}</h3>
      
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="glass-card p-4 mb-8">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-1/3"
            maxLength={20}
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-1/3"
          />
        </div>
        <textarea
          placeholder="댓글을 남겨보세요..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="mb-4"
        />
        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? '등록 중...' : '등록'}
          </button>
        </div>
      </form>

      {/* Comment List */}
      {loading ? (
        <div className="text-center text-gray-500 py-8">로딩 중...</div>
      ) : comments.length === 0 ? (
        <div className="text-center text-gray-500 py-8">첫 번째 댓글을 남겨보세요!</div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b border-[rgba(255,255,255,0.1)] pb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-200">{comment.nickname}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                {deletingId === comment.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      placeholder="비밀번호"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className="w-24 text-xs py-1"
                    />
                    <button 
                      onClick={() => handleDelete(comment.id)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      확인
                    </button>
                    <button 
                      onClick={() => {
                        setDeletingId(null);
                        setDeletePassword('');
                      }}
                      className="text-xs text-gray-400 hover:text-gray-300"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setDeletingId(comment.id)}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                  >
                    삭제
                  </button>
                )}
              </div>
              <p className="text-gray-300 whitespace-pre-wrap text-sm">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
