"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Camera as CameraIcon } from "lucide-react";
import type { CameraWithStats } from "@/lib/queries";

interface CameraSelectorProps {
  /** Currently selected cameras */
  selected: CameraWithStats[];
  /** Called when selection changes */
  onChange: (cameras: CameraWithStats[]) => void;
  /** Maximum number of cameras to allow */
  maxSelections?: number;
}

/**
 * Camera search/autocomplete selector for the comparison page.
 *
 * Features:
 * - Debounced text search against /api/cameras/search
 * - Dropdown results with camera thumbnail + brand
 * - Selected camera chips with remove button
 * - Max 3 selections enforced
 */
export default function CameraSelector({
  selected,
  onChange,
  maxSelections = 3,
}: CameraSelectorProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CameraWithStats[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/cameras/search?q=${encodeURIComponent(query)}`
        );
        if (res.ok) {
          const data: CameraWithStats[] = await res.json();
          // Filter out already-selected cameras
          const filtered = data.filter(
            (c) => !selected.some((s) => s.slug === c.slug)
          );
          setResults(filtered);
        }
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selected]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (camera: CameraWithStats) => {
    if (selected.length < maxSelections) {
      onChange([...selected, camera]);
      setQuery("");
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleRemove = (slug: string) => {
    onChange(selected.filter((c) => c.slug !== slug));
  };

  return (
    <div className="space-y-4">
      {/* Selected Camera Chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((camera) => (
            <div
              key={camera.slug}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
              }}
            >
              <CameraIcon
                className="w-3.5 h-3.5"
                style={{ color: "var(--accent-secondary)" }}
              />
              <span>
                {camera.brand} {camera.model}
              </span>
              <button
                onClick={() => handleRemove(camera.slug)}
                className="flex items-center justify-center w-4 h-4 rounded-full"
                style={{
                  background: "var(--bg-tertiary)",
                  color: "var(--text-muted)",
                  border: "none",
                  cursor: "pointer",
                  transition: "var(--transition-fast)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color =
                    "var(--error)";
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(239, 68, 68, 0.1)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color =
                    "var(--text-muted)";
                  (e.currentTarget as HTMLElement).style.background =
                    "var(--bg-tertiary)";
                }}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search Input */}
      {selected.length < maxSelections && (
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-default)",
              transition: "border-color var(--transition-fast)",
            }}
          >
            <Search
              className="w-4 h-4 flex-shrink-0"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => query.length >= 2 && setIsOpen(true)}
              placeholder={
                selected.length === 0
                  ? "비교할 카메라를 검색하세요..."
                  : `카메라 추가 (${maxSelections - selected.length}대 추가 가능)...`
              }
              className="flex-1 bg-transparent border-none outline-none text-sm"
              style={{
                color: "var(--text-primary)",
              }}
              id="camera-search-input"
            />
            {isLoading && (
              <div
                className="w-4 h-4 rounded-full border-2 animate-spin"
                style={{
                  borderColor: "var(--border-subtle)",
                  borderTopColor: "var(--accent-secondary)",
                }}
              />
            )}
          </div>

          {/* Dropdown Results */}
          {isOpen && results.length > 0 && (
            <div
              className="absolute z-50 w-full mt-2 rounded-xl overflow-hidden"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-default)",
                boxShadow: "var(--shadow-lg)",
                maxHeight: "300px",
                overflowY: "auto",
              }}
            >
              {results.map((camera) => (
                <button
                  key={camera.slug}
                  onClick={() => handleSelect(camera)}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left"
                  style={{
                    background: "transparent",
                    border: "none",
                    borderBottom: "1px solid var(--border-subtle)",
                    cursor: "pointer",
                    transition: "background var(--transition-fast)",
                    color: "var(--text-primary)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(99, 102, 241, 0.05)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "transparent";
                  }}
                >
                  <CameraIcon
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: "var(--accent-secondary)" }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {camera.brand} {camera.model}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {camera.megapixels} MP • {camera.sensorSize}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
            <div
              className="absolute z-50 w-full mt-2 px-4 py-6 rounded-xl text-center"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-default)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <p
                className="text-sm"
                style={{ color: "var(--text-tertiary)" }}
              >
                &ldquo;{query}&rdquo;에 대한 검색 결과가 없습니다
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
