"use client";

import {
  ThumbsUp,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  User as UserIcon,
} from "lucide-react";
import { useState } from "react";
import StarRating from "@/components/ui/StarRating";
import type { ReviewWithAuthor } from "@/lib/queries";

interface ReviewCardProps {
  review: ReviewWithAuthor;
}

/**
 * Individual review card with:
 * - Author avatar/initials, name, date
 * - Star rating + verified badge
 * - Expandable pros/cons section
 * - "Helpful" vote button with count
 * - Smooth expand/collapse animation
 */
export default function ReviewCard({ review }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful);
  const [hasVoted, setHasVoted] = useState(false);

  const handleHelpful = async () => {
    if (hasVoted) return;
    setHasVoted(true);
    setHelpfulCount(prev => prev + 1);
    try {
      await fetch(`/api/reviews/${review.id}/helpful`, { method: 'POST' });
    } catch {
      setHelpfulCount(prev => prev - 1);
      setHasVoted(false);
    }
  };
  const formattedDate = new Date(review.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Generate initials from author name
  const initials = review.author.name
    ? review.author.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const hasProsOrCons = review.pros || review.cons;

  return (
    <article
      id={`review-${review.id}`}
      className="rounded-xl overflow-hidden"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        transition: "border-color var(--transition-fast)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor =
          "var(--border-default)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor =
          "var(--border-subtle)";
      }}
    >
      <div className="p-6 space-y-4">
        {/* ── Header: Author, Date, Rating ─────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className="flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0"
              style={{
                background: "var(--gradient-brand)",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "white",
              }}
            >
              {initials}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {review.author.name || review.author.username}
                </span>
                {review.verified && (
                  <span
                    className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                    style={{
                      background: "rgba(34, 197, 94, 0.12)",
                      color: "var(--success)",
                      border: "1px solid rgba(34, 197, 94, 0.2)",
                    }}
                  >
                    <BadgeCheck className="w-3 h-3" />
                    인증됨
                  </span>
                )}
              </div>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {formattedDate}
              </span>
            </div>
          </div>

          <StarRating rating={review.rating} size={14} />
        </div>

        {/* ── Title ────────────────────────────────────────────────── */}
        <h4
          className="text-base font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          {review.title}
        </h4>

        {/* ── Comment ──────────────────────────────────────────────── */}
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {review.comment}
        </p>

        {/* ── Pros & Cons (expandable) ─────────────────────────────── */}
        {hasProsOrCons && (
          <div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 text-xs font-medium"
              style={{
                color: "var(--accent-secondary)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              장단점 {isExpanded ? "숨기기" : "보기"}
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            <div
              className="overflow-hidden"
              style={{
                maxHeight: isExpanded ? "500px" : "0",
                opacity: isExpanded ? 1 : 0,
                transition: "max-height 0.4s ease, opacity 0.3s ease",
                marginTop: isExpanded ? "0.75rem" : "0",
              }}
            >
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Pros */}
                {review.pros && (
                  <div
                    className="p-4 rounded-lg"
                    style={{
                      background: "rgba(34, 197, 94, 0.05)",
                      border: "1px solid rgba(34, 197, 94, 0.1)",
                    }}
                  >
                    <h5
                      className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-2.5"
                      style={{ color: "var(--success)" }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      장점
                    </h5>
                    <ul className="space-y-1.5">
                      {review.pros.split("\n").map((pro, i) => (
                        <li
                          key={i}
                          className="text-xs leading-relaxed"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          • {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Cons */}
                {review.cons && (
                  <div
                    className="p-4 rounded-lg"
                    style={{
                      background: "rgba(239, 68, 68, 0.05)",
                      border: "1px solid rgba(239, 68, 68, 0.1)",
                    }}
                  >
                    <h5
                      className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-2.5"
                      style={{ color: "var(--error)" }}
                    >
                      <Minus className="w-3.5 h-3.5" />
                      단점
                    </h5>
                    <ul className="space-y-1.5">
                      {review.cons.split("\n").map((con, i) => (
                        <li
                          key={i}
                          className="text-xs leading-relaxed"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          • {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Footer: Helpful ─────────────────────────────────────── */}
        <div
          className="flex items-center justify-between pt-3"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <button
            onClick={handleHelpful}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
            style={{
              color: hasVoted ? 'var(--accent-primary)' : 'var(--text-tertiary)',
              background: hasVoted ? 'var(--accent-glow)' : 'transparent',
              border: `1px solid ${hasVoted ? 'var(--accent-secondary)' : 'var(--border-subtle)'}`,
              cursor: hasVoted ? 'default' : 'pointer',
              transition: 'var(--transition-fast)',
            }}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            도움이 됐어요 ({helpfulCount})
          </button>

          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            @{review.author.username}
          </span>
        </div>
      </div>
    </article>
  );
}
