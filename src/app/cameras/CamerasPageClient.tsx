"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X, Camera } from "lucide-react";
import CameraCard from "@/components/cameras/CameraCard";
import type { CameraWithStats } from "@/lib/queries";
import {
  formatSensorSize,
  formatBodyType,
} from "@/lib/format";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SortOption = "newest" | "oldest" | "price-low" | "price-high" | "rating" | "megapixels" | "weight-light";

interface SortDef {
  value: SortOption;
  label: string;
}

const SORT_OPTIONS: SortDef[] = [
  { value: "newest", label: "최신순" },
  { value: "oldest", label: "오래된순" },
  { value: "rating", label: "평점 높은순" },
  { value: "megapixels", label: "고화소순" },
  { value: "price-low", label: "가격 낮은순" },
  { value: "price-high", label: "가격 높은순" },
  { value: "weight-light", label: "가벼운순" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface CamerasPageClientProps {
  cameras: CameraWithStats[];
}

export default function CamerasPageClient({ cameras }: CamerasPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedSensor, setSelectedSensor] = useState<string>("all");
  const [selectedBody, setSelectedBody] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(false);

  // ── Derive filter options from actual data ─────────────────────────────
  const brands = useMemo(() => {
    const set = new Set(cameras.map((c) => c.brand));
    return Array.from(set).sort();
  }, [cameras]);

  const sensorSizes = useMemo(() => {
    const set = new Set(cameras.map((c) => c.sensorSize));
    return Array.from(set).sort();
  }, [cameras]);

  const bodyTypes = useMemo(() => {
    const set = new Set(cameras.map((c) => c.bodyType));
    return Array.from(set).sort();
  }, [cameras]);

  // ── Filter + Sort ──────────────────────────────────────────────────────
  const filteredCameras = useMemo(() => {
    let result = [...cameras];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.brand.toLowerCase().includes(q) ||
          c.model.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q)
      );
    }

    // Brand filter
    if (selectedBrand !== "all") {
      result = result.filter((c) => c.brand === selectedBrand);
    }

    // Sensor filter
    if (selectedSensor !== "all") {
      result = result.filter((c) => c.sensorSize === selectedSensor);
    }

    // Body type filter
    if (selectedBody !== "all") {
      result = result.filter((c) => c.bodyType === selectedBody);
    }

    // Sort
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
        break;
      case "rating":
        result.sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount);
        break;
      case "megapixels":
        result.sort((a, b) => b.megapixels - a.megapixels);
        break;
      case "price-low":
        result.sort((a, b) => (a.priceMsrp || 999999999) - (b.priceMsrp || 999999999));
        break;
      case "price-high":
        result.sort((a, b) => (b.priceMsrp || 0) - (a.priceMsrp || 0));
        break;
      case "weight-light":
        result.sort((a, b) => (a.weightGrams || 999999) - (b.weightGrams || 999999));
        break;
    }

    return result;
  }, [cameras, searchQuery, selectedBrand, selectedSensor, selectedBody, sortBy]);

  // Active filter count (excluding "all")
  const activeFilterCount = [selectedBrand, selectedSensor, selectedBody].filter((v) => v !== "all").length;

  const clearAllFilters = () => {
    setSelectedBrand("all");
    setSelectedSensor("all");
    setSelectedBody("all");
    setSearchQuery("");
  };

  return (
    <section className="py-8 min-h-screen">
      <div className="container-custom">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-1 h-8 rounded-full"
              style={{ background: "var(--gradient-brand)" }}
            />
            <h1 className="heading-lg" style={{ color: "var(--text-primary)" }}>
              전체 카메라
            </h1>
            <span
              className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold"
              style={{
                background: "var(--accent-glow)",
                color: "var(--accent-primary)",
              }}
            >
              {cameras.length}
            </span>
          </div>
          <p
            className="text-sm ml-4"
            style={{ color: "var(--text-tertiary)" }}
          >
            브랜드, 센서, 타입별로 검색하고 비교하세요.
          </p>
        </div>

        {/* ── Search & Filter Bar ─────────────────────────────────────── */}
        <div
          className="sticky top-0 z-20 pb-4 pt-2 -mx-4 px-4"
          style={{
            background: "var(--bg-primary)",
          }}
        >
          <div
            className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            {/* Search input */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="text"
                placeholder="카메라 이름 또는 브랜드 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg outline-none"
                style={{
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  transition: "var(--transition-fast)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-accent)";
                  e.currentTarget.style.boxShadow = "var(--shadow-glow)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2.5 text-sm rounded-lg cursor-pointer outline-none"
              style={{
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
                minWidth: "130px",
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Filter toggle button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg"
              style={{
                background: showFilters || activeFilterCount > 0
                  ? "var(--accent-primary)"
                  : "var(--bg-tertiary)",
                color: showFilters || activeFilterCount > 0
                  ? "#ffffff"
                  : "var(--text-secondary)",
                border: "1px solid " + (showFilters || activeFilterCount > 0
                  ? "var(--accent-primary)"
                  : "var(--border-subtle)"),
                transition: "var(--transition-fast)",
              }}
            >
              <SlidersHorizontal className="w-4 h-4" />
              필터
              {activeFilterCount > 0 && (
                <span
                  className="ml-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: "rgba(255,255,255,0.3)",
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* ── Filter Panel (collapsible) ──────────────────────────── */}
          {showFilters && (
            <div
              className="mt-3 p-4 rounded-xl animate-fade-in-up"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div className="grid sm:grid-cols-3 gap-4">
                {/* Brand filter */}
                <div>
                  <label
                    className="block text-xs font-bold mb-2 uppercase tracking-wider"
                    style={{ color: "var(--text-muted)" }}
                  >
                    브랜드
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    <FilterChip
                      label="전체"
                      active={selectedBrand === "all"}
                      onClick={() => setSelectedBrand("all")}
                    />
                    {brands.map((brand) => (
                      <FilterChip
                        key={brand}
                        label={brand}
                        active={selectedBrand === brand}
                        onClick={() =>
                          setSelectedBrand(selectedBrand === brand ? "all" : brand)
                        }
                        count={cameras.filter((c) => c.brand === brand).length}
                      />
                    ))}
                  </div>
                </div>

                {/* Sensor size filter */}
                <div>
                  <label
                    className="block text-xs font-bold mb-2 uppercase tracking-wider"
                    style={{ color: "var(--text-muted)" }}
                  >
                    센서 크기
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    <FilterChip
                      label="전체"
                      active={selectedSensor === "all"}
                      onClick={() => setSelectedSensor("all")}
                    />
                    {sensorSizes.map((size) => (
                      <FilterChip
                        key={size}
                        label={formatSensorSize(size)}
                        active={selectedSensor === size}
                        onClick={() =>
                          setSelectedSensor(selectedSensor === size ? "all" : size)
                        }
                        count={cameras.filter((c) => c.sensorSize === size).length}
                      />
                    ))}
                  </div>
                </div>

                {/* Body type filter */}
                <div>
                  <label
                    className="block text-xs font-bold mb-2 uppercase tracking-wider"
                    style={{ color: "var(--text-muted)" }}
                  >
                    바디 타입
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    <FilterChip
                      label="전체"
                      active={selectedBody === "all"}
                      onClick={() => setSelectedBody("all")}
                    />
                    {bodyTypes.map((type) => (
                      <FilterChip
                        key={type}
                        label={formatBodyType(type)}
                        active={selectedBody === type}
                        onClick={() =>
                          setSelectedBody(selectedBody === type ? "all" : type)
                        }
                        count={cameras.filter((c) => c.bodyType === type).length}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Clear all filters */}
              {activeFilterCount > 0 && (
                <div className="mt-4 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                  <button
                    onClick={clearAllFilters}
                    className="text-xs font-medium flex items-center gap-1"
                    style={{ color: "var(--accent-primary)" }}
                  >
                    <X className="w-3 h-3" />
                    모든 필터 초기화
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Results Count ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            {filteredCameras.length === cameras.length ? (
              <span>총 <strong style={{ color: "var(--text-primary)" }}>{cameras.length}</strong>개 카메라</span>
            ) : (
              <span>
                <strong style={{ color: "var(--text-primary)" }}>{filteredCameras.length}</strong>개 결과
                {" "}
                <span style={{ color: "var(--text-muted)" }}> / {cameras.length}개 중</span>
              </span>
            )}
          </p>
        </div>

        {/* ── Camera Grid ──────────────────────────────────────────── */}
        {filteredCameras.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredCameras.map((camera, idx) => (
              <CameraCard key={camera.id} camera={camera} index={idx < 12 ? idx : 0} />
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-20 rounded-xl"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <Camera
              className="w-12 h-12 mb-4"
              style={{ color: "var(--text-muted)" }}
            />
            <p
              className="text-lg font-semibold mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              검색 결과가 없습니다
            </p>
            <p className="text-sm mb-4" style={{ color: "var(--text-tertiary)" }}>
              다른 키워드나 필터 조건으로 검색해 보세요.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 text-sm font-medium rounded-lg"
              style={{
                background: "var(--accent-primary)",
                color: "#ffffff",
              }}
            >
              필터 초기화
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// FilterChip — small toggleable pill button
// ---------------------------------------------------------------------------

function FilterChip({
  label,
  active,
  onClick,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap"
      style={{
        background: active ? "var(--accent-primary)" : "var(--bg-tertiary)",
        color: active ? "#ffffff" : "var(--text-secondary)",
        border: `1px solid ${active ? "var(--accent-primary)" : "var(--border-subtle)"}`,
        transition: "var(--transition-fast)",
        cursor: "pointer",
      }}
    >
      {label}
      {count !== undefined && !active && (
        <span style={{ color: "var(--text-muted)", fontSize: "10px" }}>
          {count}
        </span>
      )}
    </button>
  );
}
