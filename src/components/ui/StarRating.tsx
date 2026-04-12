import { Star } from "lucide-react";

interface StarRatingProps {
  /** Rating value from 0–5 (supports half values like 4.5) */
  rating: number;
  /** Total number of stars to display */
  maxStars?: number;
  /** Size of each star icon in pixels */
  size?: number;
  /** Whether to show the numeric rating next to the stars */
  showValue?: boolean;
  /** Number of reviews (shown as "(N개 리뷰)") */
  reviewCount?: number;
}

/**
 * Renders an interactive star rating display with:
 * - Filled, half-filled, and empty states
 * - Warm golden color for filled stars
 * - Optional numeric rating and review count label
 */
export default function StarRating({
  rating,
  maxStars = 5,
  size = 16,
  showValue = false,
  reviewCount,
}: StarRatingProps) {
  // Clamp rating to [0, maxStars]
  const clampedRating = Math.min(Math.max(rating, 0), maxStars);

  return (
    <div className="flex items-center gap-1.5" role="img" aria-label={`${maxStars}점 만점에 ${clampedRating}점`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxStars }, (_, i) => {
          const fillPercentage = Math.min(Math.max(clampedRating - i, 0), 1);

          return (
            <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
              {/* Empty star (background layer) */}
              <Star
                className="absolute inset-0"
                size={size}
                fill="var(--star-empty)"
                stroke="none"
              />
              {/* Filled star (clipped to fill percentage) */}
              {fillPercentage > 0 && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fillPercentage * 100}%` }}
                >
                  <Star
                    size={size}
                    fill="var(--star-filled)"
                    stroke="none"
                    style={{ filter: "drop-shadow(0 0 3px rgba(251, 191, 36, 0.4))" }}
                  />
                </span>
              )}
            </span>
          );
        })}
      </div>

      {showValue && (
        <span
          className="text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {clampedRating.toFixed(1)}
        </span>
      )}

      {reviewCount !== undefined && (
        <span
          className="text-xs"
          style={{ color: "var(--text-tertiary)" }}
        >
          ({reviewCount}개 리뷰)
        </span>
      )}
    </div>
  );
}
