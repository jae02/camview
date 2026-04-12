"use client";

import { MessageSquare, TrendingUp, Star } from "lucide-react";
import ReviewCard from "@/components/cameras/ReviewCard";
import StarRating from "@/components/ui/StarRating";
import type { ReviewWithAuthor } from "@/lib/queries";
import { computeAverageRating } from "@/lib/format";

interface ReviewSectionProps {
  reviews: ReviewWithAuthor[];
  cameraName: string;
}

/**
 * Full review section for the Camera Detail Page:
 * - Rating summary bar (average, distribution, total)
 * - List of individual ReviewCards
 * - "Write a Review" CTA button
 */
export default function ReviewSection({
  reviews,
  cameraName,
}: ReviewSectionProps) {
  const avgRating = computeAverageRating(reviews.map((r) => r.rating));

  // Calculate rating distribution (how many 5-star, 4-star, etc.)
  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { star, count, percentage };
  });

  return (
    <section
      id="reviews-section"
      className="py-16"
      style={{
        background: "var(--bg-secondary)",
      }}
    >
      <div className="container-custom">
        {/* ── Section Header ───────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-10">
          <div
            className="w-1 h-8 rounded-full"
            style={{ background: "var(--gradient-brand)" }}
          />
          <h2 className="heading-lg" style={{ color: "var(--text-primary)" }}>
            커뮤니티 리뷰
          </h2>
          <span
            className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            {reviews.length}
          </span>
        </div>

        {/* ── Rating Summary ───────────────────────────────────────── */}
        <div
          className="rounded-xl p-6 mb-8"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div className="grid md:grid-cols-[200px_1fr_auto] gap-8 items-center">
            {/* Average Score */}
            <div className="text-center md:text-left">
              <div
                className="text-5xl font-extrabold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                {avgRating.toFixed(1)}
              </div>
              <StarRating rating={avgRating} size={18} />
              <p className="text-xs mt-1.5" style={{ color: "var(--text-tertiary)" }}>
                {reviews.length}개 리뷰 기준
              </p>
            </div>

            {/* Distribution Bars */}
            <div className="space-y-2">
              {distribution.map((d) => (
                <div key={d.star} className="flex items-center gap-3">
                  <span
                    className="text-xs font-medium w-12 text-right"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {d.star}점
                  </span>
                  <div
                    className="flex-1 h-2 rounded-full overflow-hidden"
                    style={{ background: "var(--bg-tertiary)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${d.percentage}%`,
                        background:
                          d.star >= 4
                            ? "var(--star-filled)"
                            : d.star === 3
                            ? "var(--warning)"
                            : "var(--error)",
                        transition: "width 0.8s ease-out",
                        boxShadow:
                          d.percentage > 0
                            ? `0 0 8px ${
                                d.star >= 4
                                  ? "rgba(251, 191, 36, 0.3)"
                                  : "transparent"
                              }`
                            : "none",
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-medium w-6"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {d.count}
                  </span>
                </div>
              ))}
            </div>

            {/* Write a Review CTA */}
            <div className="flex flex-col items-center gap-3">
              <button
                id="write-review-btn"
                className="px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2"
                style={{
                  background: "var(--gradient-brand)",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 0 20px var(--accent-glow)",
                  transition: "var(--transition-fast)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = "0 0 30px var(--accent-glow-strong)";
                  el.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = "0 0 20px var(--accent-glow)";
                  el.style.transform = "translateY(0)";
                }}
              >
                <MessageSquare className="w-4 h-4" />
                리뷰 작성
              </button>
              <p
                className="text-[10px] text-center"
                style={{ color: "var(--text-muted)" }}
              >
                {cameraName}에 대한
                <br />
                경험을 공유해 주세요
              </p>
            </div>
          </div>
        </div>

        {/* ── Review List ──────────────────────────────────────────── */}
        <div className="space-y-4 stagger-children">
          {reviews
            .sort((a, b) => b.helpful - a.helpful)
            .map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
        </div>

        {/* ── Empty State ──────────────────────────────────────────── */}
        {reviews.length === 0 && (
          <div
            className="text-center py-16 rounded-xl"
            style={{
              background: "var(--bg-card)",
              border: "1px dashed var(--border-default)",
            }}
          >
            <Star
              className="w-12 h-12 mx-auto mb-4"
              style={{ color: "var(--text-muted)" }}
            />
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              아직 리뷰가 없습니다
            </h3>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              {cameraName}에 대한 첫 번째 리뷰를 작성해 보세요.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
