"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, ChevronDown } from "lucide-react";
import type { ProConItem } from "@/lib/queries";

interface ProsConsProps {
  pros: string[];
  cons: string[];
  prosKo: ProConItem[];
  consKo: ProConItem[];
}

const INITIAL_VISIBLE = 8;

/**
 * Displays camera pros and cons in a beautiful two-column card layout.
 * - Korean translation shown first (bold), English below in smaller text
 * - Collapsible list with '더 보기' button
 * - Green-tinted header for pros, red-tinted for cons
 */
export default function ProsCons({ pros, cons, prosKo, consKo }: ProsConsProps) {
  const [prosExpanded, setProsExpanded] = useState(false);
  const [consExpanded, setConsExpanded] = useState(false);

  // If no data at all, don't render
  if (pros.length === 0 && cons.length === 0) return null;

  return (
    <div
      className="grid md:grid-cols-2 gap-6"
      style={{ maxWidth: "64rem", margin: "0 auto" }}
    >
      {/* ── Pros Card ──────────────────────────────────────────────── */}
      <ProConCard
        type="pros"
        title="장점"
        items={pros}
        itemsKo={prosKo}
        expanded={prosExpanded}
        onToggle={() => setProsExpanded((v) => !v)}
      />

      {/* ── Cons Card ──────────────────────────────────────────────── */}
      <ProConCard
        type="cons"
        title="단점"
        items={cons}
        itemsKo={consKo}
        expanded={consExpanded}
        onToggle={() => setConsExpanded((v) => !v)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component
// ---------------------------------------------------------------------------

function ProConCard({
  type,
  title,
  items,
  itemsKo,
  expanded,
  onToggle,
}: {
  type: "pros" | "cons";
  title: string;
  items: string[];
  itemsKo: ProConItem[];
  expanded: boolean;
  onToggle: () => void;
}) {
  if (items.length === 0) return null;

  const isPros = type === "pros";
  const Icon = isPros ? ThumbsUp : ThumbsDown;

  // Tint colors
  const headerBg = isPros
    ? "rgba(34, 197, 94, 0.08)"
    : "rgba(239, 68, 68, 0.08)";
  const headerBorder = isPros
    ? "rgba(34, 197, 94, 0.18)"
    : "rgba(239, 68, 68, 0.18)";
  const iconColor = isPros ? "#22c55e" : "#ef4444";
  const badgeBg = isPros
    ? "rgba(34, 197, 94, 0.15)"
    : "rgba(239, 68, 68, 0.15)";
  const badgeColor = isPros ? "#4ade80" : "#f87171";
  const dotColor = isPros ? "#22c55e" : "#ef4444";

  const visibleItems = expanded ? items : items.slice(0, INITIAL_VISIBLE);
  const hasMore = items.length > INITIAL_VISIBLE;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{
          background: headerBg,
          borderBottom: `1px solid ${headerBorder}`,
        }}
      >
        <Icon className="w-5 h-5 flex-shrink-0" style={{ color: iconColor }} />
        <h3
          className="text-base font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h3>
        <span
          className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: badgeBg, color: badgeColor }}
        >
          {items.length}
        </span>
      </div>

      {/* Items List */}
      <ul className="px-5 py-3">
        {visibleItems.map((item, idx) => {
          const koItem = itemsKo[idx];
          const hasTranslation = koItem && koItem.ko !== koItem.en;

          return (
            <li
              key={idx}
              className="flex gap-3 py-2.5"
              style={{
                borderBottom:
                  idx < visibleItems.length - 1
                    ? "1px solid var(--border-subtle)"
                    : "none",
              }}
            >
              {/* Dot indicator */}
              <span
                className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: dotColor, opacity: 0.7 }}
              />

              <div className="min-w-0">
                {hasTranslation ? (
                  <>
                    <p
                      className="text-sm font-semibold leading-relaxed"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {koItem.ko}
                    </p>
                    <p
                      className="text-xs mt-0.5 leading-relaxed"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {koItem.en}
                    </p>
                  </>
                ) : (
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {item}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Expand / Collapse Button */}
      {hasMore && (
        <div
          className="px-5 pb-4"
          style={{
            position: "relative",
          }}
        >
          {/* Fade overlay when collapsed */}
          {!expanded && (
            <div
              style={{
                position: "absolute",
                top: "-3rem",
                left: 0,
                right: 0,
                height: "3rem",
                background:
                  "linear-gradient(transparent, var(--bg-card))",
                pointerEvents: "none",
              }}
            />
          )}
          <button
            onClick={onToggle}
            className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg text-sm font-medium"
            style={{
              color: "var(--accent-primary)",
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border-subtle)",
              cursor: "pointer",
              transition: "var(--transition-fast)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "var(--bg-secondary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "var(--bg-tertiary)";
            }}
          >
            {expanded ? "접기" : `더 보기 (${items.length - INITIAL_VISIBLE}개)`}
            <ChevronDown
              className="w-4 h-4"
              style={{
                transition: "transform 0.3s ease",
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>
        </div>
      )}
    </div>
  );
}
