"use client";

import Image from "next/image";
import { Calendar, Weight, Cpu, Aperture, ArrowLeft } from "lucide-react";
import Link from "next/link";
import StarRating from "@/components/ui/StarRating";
import { Tag } from "@/components/ui/Badge";
import {
  formatPrice,
  formatSensorSize,
  formatMount,
  formatBodyType,
} from "@/lib/format";
import type { CameraDetail } from "@/lib/queries";

interface CameraHeroProps {
  camera: CameraDetail;
}

/**
 * Cinematic hero section for the Camera Detail Page:
 * - Full-width product image with gradient overlay
 * - Brand, model, price displayed prominently
 * - Quick-glance spec badges
 * - Parallax-ready layout
 */
export default function CameraHero({ camera }: CameraHeroProps) {
  const releaseYear = new Date(camera.releaseDate).getFullYear();

  const quickStats = [
    {
      icon: Cpu,
      label: "센서",
      value: `${camera.megapixels} MP ${formatSensorSize(camera.sensorSize)}`,
    },
    {
      icon: Aperture,
      label: "마운트",
      value: formatMount(camera.mount),
    },
    {
      icon: Weight,
      label: "무게",
      value: `${camera.weightGrams}g`,
    },
    {
      icon: Calendar,
      label: "출시",
      value: `${releaseYear}년`,
    },
  ];

  return (
    <section
      id="camera-hero"
      className="relative min-h-[70vh] flex items-end"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* ── Background Image ─────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden">
        {camera.imageUrl && (
          <Image
            src={camera.imageUrl}
            alt={`${camera.brand} ${camera.model}`}
            fill
            className="object-contain"
            style={{
              opacity: 0.35,
              objectPosition: "center 40%",
              filter: "blur(1px)",
            }}
            priority
            sizes="100vw"
          />
        )}
        {/* Gradient overlays */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(180deg, var(--bg-primary) 0%, transparent 30%, transparent 50%, var(--bg-primary) 100%),
              linear-gradient(90deg, var(--bg-primary) 0%, transparent 40%)
            `,
          }}
        />
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="relative z-10 container-custom pb-12 pt-28 w-full">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium mb-8"
          style={{
            color: "var(--text-tertiary)",
            transition: "var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color =
              "var(--text-secondary)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color =
              "var(--text-tertiary)";
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          전체 카메라로 돌아가기
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 items-end">
          {/* ── Left: Product Image ────────────────────────────────── */}
          <div className="relative flex items-center justify-center animate-fade-in-up">
            <div
              className="relative w-full max-w-md mx-auto"
              style={{ aspectRatio: "1 / 1" }}
            >
              {/* Plain background circle for product instead of glow */}
              <div
                className="absolute inset-4 rounded-full"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-subtle)",
                  zIndex: 0
                }}
              />
              {camera.imageUrl && (
                <Image
                  src={camera.imageUrl}
                  alt={`${camera.brand} ${camera.model}`}
                  fill
                  className="object-contain relative z-10 drop-shadow-2xl"
                  priority
                  sizes="(max-width: 1024px) 80vw, 40vw"
                />
              )}
            </div>
          </div>

          {/* ── Right: Camera Info ──────────────────────────────────── */}
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <Tag label={camera.brand} variant="accent" />
              <Tag label={formatBodyType(camera.bodyType)} variant="default" />
              <Tag label={formatSensorSize(camera.sensorSize)} variant="brand" />
            </div>

            {/* Model Name */}
            <h1 className="heading-xl" style={{ color: "var(--text-primary)" }}>
              {camera.brand}{" "}
              <span className="gradient-text">{camera.model}</span>
            </h1>

            {/* Description */}
            {camera.description && (
              <p
                className="body-lg max-w-xl"
                style={{ color: "var(--text-secondary)" }}
              >
                {camera.description.slice(0, 200)}
                {camera.description.length > 200 ? "…" : ""}
              </p>
            )}

            {/* Rating & Price Row */}
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <StarRating
                  rating={camera.avgRating}
                  size={20}
                  showValue
                  reviewCount={camera.reviewCount}
                />
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {formatPrice(camera.priceMsrp)}
                <span
                  className="text-xs font-normal ml-1.5"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  정가
                </span>
              </div>
            </div>

            {/* Quick Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickStats.map((stat) => (
                <div
                  key={stat.label}
                  className="px-4 py-3 rounded-xl"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <stat.icon
                      className="w-3.5 h-3.5"
                      style={{ color: "var(--accent-secondary)" }}
                    />
                    <span
                      className="text-[10px] font-medium uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {stat.label}
                    </span>
                  </div>
                  <p
                    className="text-sm font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
