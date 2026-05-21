'use client';

import { useState } from 'react';
import { Star, Send, X } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

interface ReviewFormProps {
  cameraSlug: string;
  cameraName: string;
  onSubmitted: () => void;
  onClose: () => void;
}

export default function ReviewForm({ cameraSlug, cameraName, onSubmitted, onClose }: ReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) { setError('별점을 선택해 주세요.'); return; }
    if (!title.trim()) { setError('제목을 입력해 주세요.'); return; }
    if (!comment.trim()) { setError('본문을 입력해 주세요.'); return; }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ camera_slug: cameraSlug, rating, title, comment, pros, cons }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSubmitted();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '리뷰 작성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div
      className="rounded-xl p-6 mb-6 animate-fade-in-up"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          {cameraName} 리뷰 작성
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg"
          style={{ color: 'var(--text-tertiary)', background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>별점</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
              >
                <Star
                  className="w-8 h-8 transition-colors"
                  fill={(hoverRating || rating) >= star ? 'var(--star-filled)' : 'none'}
                  stroke={(hoverRating || rating) >= star ? 'var(--star-filled)' : 'var(--text-muted)'}
                  strokeWidth={1.5}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm font-medium self-center" style={{ color: 'var(--text-secondary)' }}>
                {rating}점
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="한 줄로 요약해 주세요"
            className="w-full px-4 py-2.5 rounded-lg text-sm"
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>본문</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="카메라 사용 경험을 자세히 공유해 주세요"
            rows={4}
            className="w-full px-4 py-2.5 rounded-lg text-sm resize-y"
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              outline: 'none',
              minHeight: '100px',
            }}
          />
        </div>

        {/* Pros & Cons */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--success)' }}>장점 (선택)</label>
            <textarea
              value={pros}
              onChange={(e) => setPros(e.target.value)}
              placeholder="줄바꿈으로 구분"
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg text-sm resize-y"
              style={{
                background: 'rgba(34, 197, 94, 0.04)',
                border: '1px solid rgba(34, 197, 94, 0.15)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--error)' }}>단점 (선택)</label>
            <textarea
              value={cons}
              onChange={(e) => setCons(e.target.value)}
              placeholder="줄바꿈으로 구분"
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg text-sm resize-y"
              style={{
                background: 'rgba(239, 68, 68, 0.04)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm font-medium" style={{ color: 'var(--error)' }}>{error}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold"
          style={{
            background: isSubmitting ? 'var(--text-muted)' : 'var(--gradient-brand)',
            color: 'white',
            border: 'none',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            boxShadow: isSubmitting ? 'none' : '0 0 20px var(--accent-glow)',
            transition: 'var(--transition-fast)',
          }}
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? '작성 중...' : '리뷰 제출'}
        </button>
      </form>
    </div>
  );
}
