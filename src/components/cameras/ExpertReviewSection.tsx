import React from 'react';
import { SlrReview } from '@/lib/queries';

interface ExpertReviewSectionProps {
  review: SlrReview;
  cameraName: string;
}

export default function ExpertReviewSection({ review, cameraName }: ExpertReviewSectionProps) {
  // Prefer summary -> html -> text.
  // Actually, we should show the HTML if available since it contains the table structure, 
  // but if they just wanted the summary we could show that at the top.
  
  const hasHtml = !!review.critique_html;
  const hasText = !!review.critique_text;
  const hasSummary = !!review.critique_summary;
  
  // Skip if we have no content
  if (!hasHtml && !hasText && !hasSummary) return null;

  return (
    <section className="container-custom py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="heading-lg text-[var(--text-primary)]">
            전문가 평가 <span className="text-[var(--brand-primary)]">총평</span>
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {cameraName}에 대한 SLRClub 전문 리뷰어의 종합 평가입니다.
          </p>
        </div>
        {review.url && (
          <a
            href={review.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--brand-primary)] hover:underline"
          >
            원본 리뷰 보기 &rarr;
          </a>
        )}
      </div>

      <div className="bg-[var(--surface-primary)] border border-[var(--border-color)] rounded-xl p-6 md:p-8 shadow-sm">
        
        {/* If we have a summary generated, display it prominently at the top */}
        {hasSummary && (
          <div className="mb-8 p-6 bg-[var(--surface-secondary)] rounded-lg border border-[var(--border-color)]">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-[var(--brand-primary)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              핵심 요약 (AI)
            </h3>
            <p className="text-[var(--text-primary)] leading-relaxed text-sm">
              {review.critique_summary}
            </p>
          </div>
        )}

        {/* Full Critique HTML */}
        {hasHtml ? (
          <div 
            className="expert-review-html prose prose-sm md:prose-base max-w-none text-[var(--text-primary)] prose-headings:text-[var(--text-primary)] prose-strong:text-[var(--text-primary)] prose-a:text-[var(--brand-primary)] prose-img:rounded-lg prose-img:shadow-md"
            dangerouslySetInnerHTML={{ __html: review.critique_html! }}
          />
        ) : hasText ? (
          <div className="whitespace-pre-line text-sm text-[var(--text-primary)] leading-relaxed">
            {review.critique_text}
          </div>
        ) : null}

        {/* OCR Extracted Text (From deleted images) */}
        {review.critique_ocr_text && (
          <div className="mt-8 pt-8 border-t border-[var(--border-color)]">
            <h3 className="text-md font-bold mb-4 text-[var(--text-primary)]">이미지에서 추출된 텍스트 (OCR)</h3>
            <div className="p-4 bg-[var(--surface-secondary)] rounded-md border border-[var(--border-color)] overflow-x-auto">
              <pre className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap font-mono leading-relaxed">
                {review.critique_ocr_text}
              </pre>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
