"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BarChart3, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import CameraSelector from "@/components/cameras/CameraSelector";
import ComparisonTable from "@/components/cameras/ComparisonTable";
import StarRating from "@/components/ui/StarRating";
import { formatPrice, formatSensorSize } from "@/lib/format";
import type { CameraWithStats } from "@/lib/queries";

interface ComparePageClientProps {
  preloadedCameras: CameraWithStats[];
  allCameras: CameraWithStats[];
}

export default function ComparePageClient({
  preloadedCameras,
  allCameras,
}: ComparePageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCameras, setSelectedCameras] =
    useState<CameraWithStats[]>(preloadedCameras);
  const [copied, setCopied] = useState(false);

  // Update URL when selection changes
  useEffect(() => {
    if (selectedCameras.length > 0) {
      const slugs = selectedCameras.map((c) => c.slug).join(",");
      const currentSlugs = searchParams.get("cameras") || "";
      if (slugs !== currentSlugs) {
        router.replace(`/compare?cameras=${slugs}`, { scroll: false });
      }
    }
  }, [selectedCameras, router, searchParams]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <section className="pt-28 pb-10">
        <div className="container-custom">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium mb-6"
            style={{
              color: "var(--text-tertiary)",
              transition: "var(--transition-fast)",
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            홈으로 돌아가기
          </Link>

          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-lg"
                  style={{
                    background: "rgba(99, 102, 241, 0.1)",
                    border: "1px solid rgba(99, 102, 241, 0.15)",
                  }}
                >
                  <BarChart3
                    className="w-5 h-5"
                    style={{ color: "var(--accent-secondary)" }}
                  />
                </div>
                <h1
                  className="heading-lg"
                  style={{ color: "var(--text-primary)" }}
                >
                  카메라 비교
                </h1>
              </div>
              <p
                className="text-sm max-w-lg"
                style={{ color: "var(--text-tertiary)" }}
              >
                최대 3대의 카메라를 선택하여 사양을 나란히 비교해 보세요.
                나에게 맞는 최적의 카메라를 찾아보세요.
              </p>
            </div>

            {selectedCameras.length >= 2 && (
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  transition: "var(--transition-fast)",
                }}
              >
                <Share2 className="w-4 h-4" />
                {copied ? "복사됨!" : "비교 공유"}
              </button>
            )}
          </div>

          {/* Camera Selector */}
          <CameraSelector
            selected={selectedCameras}
            onChange={setSelectedCameras}
            maxSelections={3}
          />
        </div>
      </section>

      {/* ── Camera Summary Cards ──────────────────────────────── */}
      {selectedCameras.length > 0 && (
        <section
          className="py-8"
          style={{
            background: "var(--bg-secondary)",
            borderTop: "1px solid var(--border-subtle)",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div className="container-custom">
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${selectedCameras.length}, 1fr)`,
              }}
            >
              {selectedCameras.map((camera) => (
                <div
                  key={camera.slug}
                  className="rounded-xl p-5 text-center"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  {/* Camera Image */}
                  <div
                    className="relative w-full mb-4 mx-auto"
                    style={{ aspectRatio: "4/3", maxWidth: "200px" }}
                  >
                    {camera.imageUrl ? (
                      <Image
                        src={camera.imageUrl}
                        alt={`${camera.brand} ${camera.model}`}
                        fill
                        className="object-contain"
                        sizes="200px"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center rounded-lg"
                        style={{ background: "var(--bg-tertiary)" }}
                      >
                        <BarChart3
                          className="w-8 h-8"
                          style={{ color: "var(--text-muted)" }}
                        />
                      </div>
                    )}
                  </div>

                  <h3
                    className="text-sm font-bold mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {camera.brand} {camera.model}
                  </h3>

                  <div className="flex justify-center mb-2">
                    <StarRating
                      rating={camera.avgRating}
                      size={14}
                      showValue
                      reviewCount={camera.reviewCount}
                    />
                  </div>

                  <div className="flex justify-center gap-3 text-xs">
                    <span style={{ color: "var(--text-tertiary)" }}>
                      {camera.megapixels} MP
                    </span>
                    <span style={{ color: "var(--text-tertiary)" }}>
                      {formatSensorSize(camera.sensorSize)}
                    </span>
                  </div>

                  <div
                    className="text-lg font-bold mt-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {formatPrice(camera.priceMsrp)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Comparison Table ──────────────────────────────────── */}
      {selectedCameras.length >= 2 ? (
        <section className="py-12">
          <div className="container-custom">
            <div className="flex items-center gap-3 mb-8">
              <div
                className="w-1 h-8 rounded-full"
                style={{ background: "var(--gradient-brand)" }}
              />
              <h2
                className="heading-lg"
                style={{ color: "var(--text-primary)" }}
              >
                상세 비교
              </h2>
            </div>

            <ComparisonTable cameras={selectedCameras} />
          </div>
        </section>
      ) : selectedCameras.length === 1 ? (
        <section className="py-20">
          <div className="container-custom text-center">
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              비교를 보려면 카메라를 1대 이상 추가해 주세요.
            </p>
          </div>
        </section>
      ) : (
        /* ── Empty State ────────────────────────────────────────── */
        <section className="py-20">
          <div className="container-custom text-center">
            <BarChart3
              className="w-16 h-16 mx-auto mb-6"
              style={{ color: "var(--text-muted)", opacity: 0.4 }}
            />
            <h2
              className="text-xl font-bold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              비교할 카메라를 선택하세요
            </h2>
            <p
              className="text-sm max-w-md mx-auto mb-8"
              style={{ color: "var(--text-tertiary)" }}
            >
              위의 검색창에서 카메라를 찾아 추가해 보세요.
              최대 3대까지 나란히 비교할 수 있습니다.
            </p>

            {/* Quick Picks */}
            <div className="flex flex-wrap justify-center gap-2">
              {allCameras
                .filter((c) => c.megapixels > 0)
                .slice(0, 6)
                .map((camera) => (
                  <button
                    key={camera.slug}
                    onClick={() =>
                      setSelectedCameras((prev) =>
                        prev.length < 3 ? [...prev, camera] : prev
                      )
                    }
                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                      transition: "var(--transition-fast)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "var(--border-accent)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "var(--border-subtle)";
                    }}
                  >
                    {camera.brand} {camera.model}
                  </button>
                ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
