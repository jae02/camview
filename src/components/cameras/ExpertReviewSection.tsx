import React from 'react';
import { SlrReview } from '@/lib/queries';

interface ExpertReviewSectionProps {
  review: SlrReview;
  cameraName: string;
}

export default function ExpertReviewSection({ review, cameraName }: ExpertReviewSectionProps) {
  const hasText = !!review.critique_text;
  const hasSummary = !!review.critique_summary;
  
  if (!hasText && !hasSummary) return null;

  return (
    <section className="container-custom py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="heading-lg" style={{ color: 'var(--text-primary)' }}>
            에디터 <span style={{ color: 'var(--accent-primary)' }}>총평</span>
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
            {cameraName}에 대한 전문 리뷰어의 종합 평가입니다.
          </p>
        </div>
        {review.url && (
          <a
            href={review.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:underline"
            style={{ color: 'var(--accent-primary)' }}
          >
            원문 보기 &rarr;
          </a>
        )}
      </div>

      <div
        className="rounded-xl p-6 md:p-8"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        
        {/* AI Summary */}
        {hasSummary && (
          <div
            className="mb-8 p-6 rounded-lg"
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <h3
              className="text-lg font-bold mb-3 flex items-center gap-2"
              style={{ color: 'var(--accent-primary)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              핵심 요약
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {review.critique_summary}
            </p>
          </div>
        )}

        {/* Full Critique Text */}
        {hasText && (
          <div
            className="whitespace-pre-wrap text-[0.95rem] leading-[1.8] tracking-wide"
            style={{
              color: 'var(--text-secondary)',
              ...(hasSummary ? { marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' } : {}),
            }}
          >
            {review.critique_text}
          </div>
        )}
      </div>
    </section>
  );
}
