"use client";

import { BooleanBadge } from "@/components/ui/Badge";
import {
  formatPrice,
  formatSensorSize,
  formatMount,
  formatBodyType,
} from "@/lib/format";
import type { CameraWithStats } from "@/lib/queries";

interface ComparisonTableProps {
  cameras: CameraWithStats[];
}

interface SpecRow {
  label: string;
  getValue: (c: CameraWithStats) => string | number | boolean;
  /** For numeric values: higher is better. For booleans: true is better. */
  higherIsBetter?: boolean;
  format?: "number" | "boolean" | "text";
}

interface SpecGroup {
  title: string;
  rows: SpecRow[];
}

const SPEC_GROUPS: SpecGroup[] = [
  {
    title: "센서 및 이미지",
    rows: [
      {
        label: "센서 크기",
        getValue: (c) => formatSensorSize(c.sensorSize),
        format: "text",
      },
      {
        label: "화소수",
        getValue: (c) => c.megapixels,
        higherIsBetter: true,
        format: "number",
      },
      {
        label: "최저 ISO",
        getValue: (c) => c.isoMin,
        higherIsBetter: false,
        format: "number",
      },
      {
        label: "최고 ISO",
        getValue: (c) => c.isoMax,
        higherIsBetter: true,
        format: "number",
      },
      {
        label: "손떨림 보정",
        getValue: (c) => c.imageStabilization,
        higherIsBetter: true,
        format: "boolean",
      },
    ],
  },
  {
    title: "오토포커스",
    rows: [
      {
        label: "AF 포인트",
        getValue: (c) => c.afPoints,
        higherIsBetter: true,
        format: "number",
      },
      {
        label: "AF 방식",
        getValue: (c) => c.afType,
        format: "text",
      },
    ],
  },
  {
    title: "동영상",
    rows: [
      {
        label: "최대 해상도",
        getValue: (c) => c.maxVideoResolution,
        format: "text",
      },
    ],
  },
  {
    title: "성능",
    rows: [
      {
        label: "바디 유형",
        getValue: (c) => formatBodyType(c.bodyType),
        format: "text",
      },
      {
        label: "렌즈 마운트",
        getValue: (c) => formatMount(c.mount),
        format: "text",
      },
      {
        label: "연속 촬영",
        getValue: (c) => c.continuousShootingSpeed,
        higherIsBetter: true,
        format: "number",
      },
      {
        label: "카드 슬롯",
        getValue: (c) => c.cardSlots,
        higherIsBetter: true,
        format: "number",
      },
    ],
  },
  {
    title: "연결",
    rows: [
      { label: "Wi-Fi", getValue: (c) => c.wifi, format: "boolean", higherIsBetter: true },
      { label: "블루투스", getValue: (c) => c.bluetooth, format: "boolean", higherIsBetter: true },
      { label: "터치스크린", getValue: (c) => c.touchscreen, format: "boolean", higherIsBetter: true },
    ],
  },
  {
    title: "본체",
    rows: [
      {
        label: "무게",
        getValue: (c) => c.weightGrams,
        higherIsBetter: false,
        format: "number",
      },
      {
        label: "방진방적",
        getValue: (c) => c.weatherSealed,
        format: "boolean",
        higherIsBetter: true,
      },
    ],
  },
  {
    title: "가격 및 평점",
    rows: [
      {
        label: "정가",
        getValue: (c) => c.priceMsrp ?? 0,
        higherIsBetter: false,
        format: "number",
      },
      {
        label: "평균 평점",
        getValue: (c) => c.avgRating,
        higherIsBetter: true,
        format: "number",
      },
      {
        label: "리뷰 수",
        getValue: (c) => c.reviewCount,
        higherIsBetter: true,
        format: "number",
      },
    ],
  },
];

/**
 * Find the "winner" index(es) for a numeric comparison.
 * Returns indices of the cameras that have the best value.
 */
function getWinners(
  cameras: CameraWithStats[],
  getValue: (c: CameraWithStats) => string | number | boolean,
  higherIsBetter: boolean
): Set<number> {
  const values = cameras.map(getValue);
  const numericValues = values.map((v) =>
    typeof v === "number" ? v : typeof v === "boolean" ? (v ? 1 : 0) : 0
  );

  // All zero = no winner
  if (numericValues.every((v) => v === 0)) return new Set();
  // All same = no winner
  if (numericValues.every((v) => v === numericValues[0])) return new Set();

  const best = higherIsBetter
    ? Math.max(...numericValues)
    : Math.min(...numericValues.filter((v) => v > 0));

  const winners = new Set<number>();
  numericValues.forEach((v, i) => {
    if (v === best && v > 0) winners.add(i);
  });
  return winners;
}

export default function ComparisonTable({ cameras }: ComparisonTableProps) {
  if (cameras.length === 0) return null;

  const colCount = cameras.length;

  return (
    <div className="space-y-6 stagger-children">
      {SPEC_GROUPS.map((group) => (
        <div
          key={group.title}
          className="rounded-xl overflow-hidden"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {/* Group Header */}
          <div
            className="px-6 py-4"
            style={{
              background: "var(--gradient-brand-subtle)",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            <h3
              className="text-sm font-semibold tracking-wide uppercase"
              style={{ color: "var(--text-primary)" }}
            >
              {group.title}
            </h3>
          </div>

          {/* Rows */}
          <div>
            {group.rows.map((row, rowIdx) => {
              const winners =
                row.higherIsBetter !== undefined
                  ? getWinners(cameras, row.getValue, row.higherIsBetter)
                  : new Set<number>();

              return (
                <div
                  key={row.label}
                  className="flex items-center"
                  style={{
                    background:
                      rowIdx % 2 === 0
                        ? "transparent"
                        : "var(--bg-tertiary)",
                    borderBottom:
                      rowIdx < group.rows.length - 1
                        ? "1px solid var(--border-subtle)"
                        : "none",
                  }}
                >
                  {/* Label col */}
                  <div
                    className="px-6 py-5 flex-shrink-0"
                    style={{
                      width: "200px",
                      minWidth: "200px",
                      color: "var(--text-secondary)",
                      fontSize: "0.875rem",
                    }}
                  >
                    {row.label}
                  </div>

                  {/* Value cols */}
                  {cameras.map((camera, camIdx) => {
                    const val = row.getValue(camera);
                    const isWinner = winners.has(camIdx);

                    return (
                      <div
                        key={camera.slug}
                        className="px-6 py-5 text-center"
                        style={{
                          flex: `1 1 ${100 / colCount}%`,
                          borderLeft: "1px solid var(--border-subtle)",
                        }}
                      >
                        {typeof val === "boolean" ? (
                          <div className="flex justify-center">
                            <BooleanBadge value={val} />
                          </div>
                        ) : (
                          <span
                            className="text-sm font-semibold"
                            style={{
                              color: isWinner
                                ? "var(--success)"
                                : "var(--text-primary)",
                            }}
                          >
                            {row.label === "정가"
                              ? formatPrice(val as number)
                              : row.label === "무게"
                              ? `${val}g`
                              : row.label === "연속 촬영"
                              ? `${val} fps`
                              : row.label === "평균 평점"
                              ? `${val} ★`
                              : val}
                            {isWinner && (
                              <span
                                className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                style={{
                                  background: "var(--error)",
                                  color: "white",
                                  verticalAlign: "middle",
                                }}
                              >
                                최고
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
