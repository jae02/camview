"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ThumbsUp } from "lucide-react";
import StarRating from "@/components/ui/StarRating";
import { Tag } from "@/components/ui/Badge";
import {
  formatPrice,
  formatSensorSize,
} from "@/lib/format";
import type { CameraWithStats } from "@/lib/queries";

interface CameraCardProps {
  camera: CameraWithStats;
  /** Animation delay index for stagger effect */
  index?: number;
}

/**
 * Camera card with product image, brand, model, key specs, rating, and pros count.
 */
export default function CameraCard({ camera, index = 0 }: CameraCardProps) {
  const prosCount = camera.pros?.length || 0;

  return (
    <Link
      href={`/cameras/${camera.slug}`}
      id={`camera-card-${camera.slug}`}
      className="glass-card group block overflow-hidden"
      style={{
        animationDelay: `${index * 0.1}s`,
      }}
    >
      {/* ── Image Section ──────────────────────────────────────────── */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: "4 / 3",
          background: "var(--bg-tertiary)",
        }}
      >
        {camera.imageUrl ? (
          <Image
            src={camera.imageUrl}
            alt={`${camera.brand} ${camera.model}`}
            fill
            className="object-cover"
            style={{
              transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            }}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span style={{ color: "var(--text-muted)" }}>이미지 없음</span>
          </div>
        )}

        {/* Price badge */}
        {camera.priceMsrp && (
          <div
            className="absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm"
            style={{
              background: "var(--error)",
              color: "#ffffff",
            }}
          >
            {formatPrice(camera.priceMsrp)}
          </div>
        )}

        {/* Pros count badge */}
        {prosCount > 0 && (
          <div
            className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1"
            style={{
              background: "rgba(16, 185, 129, 0.9)",
              color: "#ffffff",
            }}
          >
            <ThumbsUp className="w-3 h-3" />
            {prosCount}
          </div>
        )}
      </div>

      {/* ── Content Section ────────────────────────────────────────── */}
      <div className="p-5 space-y-3">
        {/* Brand tag */}
        <div className="flex items-center gap-2">
          <Tag label={camera.brand} variant="accent" />
          {camera.sensorSize && camera.sensorSize !== "OTHER" && (
            <Tag label={formatSensorSize(camera.sensorSize)} variant="default" />
          )}
        </div>

        {/* Model name */}
        <h3
          className="text-lg font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {camera.brand} {camera.model}
        </h3>

        {/* Rating */}
        {camera.reviewCount > 0 && (
          <StarRating
            rating={camera.avgRating}
            showValue
            reviewCount={camera.reviewCount}
          />
        )}

        {/* Quick specs */}
        <div
          className="grid grid-cols-2 gap-2 pt-2"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          {[
            ...(camera.megapixels > 0 ? [{ label: "화소수", value: `${camera.megapixels} MP` }] : []),
            ...(camera.maxVideoResolution ? [{ label: "동영상", value: camera.maxVideoResolution }] : []),
            ...(camera.mount && camera.mount !== "OTHER" ? [{ label: "마운트", value: camera.mount.replace("_", " ") }] : []),
            ...(camera.weightGrams > 0 ? [{ label: "무게", value: `${camera.weightGrams}g` }] : []),
          ].slice(0, 4).map((spec) => (
            <div key={spec.label}>
              <p
                className="text-[10px] font-medium uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                {spec.label}
              </p>
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--text-secondary)" }}
              >
                {spec.value}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="flex items-center gap-1 pt-2 text-sm font-medium"
          style={{
            color: "var(--accent-secondary)",
            transition: "var(--transition-fast)",
          }}
        >
          상세 정보 보기
          <ArrowRight
            className="w-4 h-4"
            style={{
              transition: "transform var(--transition-fast)",
            }}
          />
        </div>
      </div>
    </Link>
  );
}
