"use client";

import {
  Cpu,
  Crosshair,
  Video,
  Eye,
  MonitorSmartphone,
  Gauge,
  Wifi,
  Box,
  type LucideIcon,
} from "lucide-react";
import { BooleanBadge } from "@/components/ui/Badge";
import { formatSensorSize, formatMount } from "@/lib/format";
import type { CameraWithStats } from "@/lib/queries";

interface SpecsTableProps {
  camera: CameraWithStats;
}

/** Represents one spec group (e.g. "센서 및 이미지") with its rows. */
interface SpecSection {
  title: string;
  icon: LucideIcon;
  rows: {
    label: string;
    value: string | number | boolean;
    highlight?: boolean;
  }[];
}

/**
 * Structured specifications table for the Camera Detail Page.
 *
 * Features:
 * - Grouped sections with icons (Sensor, AF, Video, etc.)
 * - Alternating row backgrounds for readability
 * - Boolean specs rendered as colored badges
 * - Hover highlight on rows
 * - Fully responsive grid layout
 */
export default function SpecsTable({ camera }: SpecsTableProps) {
  const sections: SpecSection[] = [
    {
      title: "센서 및 이미지",
      icon: Cpu,
      rows: [
        { label: "센서 포맷", value: formatSensorSize(camera.sensorSize) },
        {
          label: "유효 화소수",
          value: `${camera.megapixels} MP`,
          highlight: true,
        },
        { label: "ISO 범위", value: `${camera.isoMin} – ${camera.isoMax}` },
        {
          label: "손떨림 보정",
          value: camera.imageStabilization,
        },
      ],
    },
    {
      title: "오토포커스",
      icon: Crosshair,
      rows: [
        { label: "AF 방식", value: camera.afType },
        {
          label: "AF 포인트",
          value: camera.afPoints.toLocaleString(),
          highlight: true,
        },
      ],
    },
    {
      title: "동영상",
      icon: Video,
      rows: [
        {
          label: "최대 해상도",
          value: camera.maxVideoResolution,
          highlight: true,
        },
        ...(camera.videoFeatures
          ? [{ label: "동영상 기능", value: camera.videoFeatures }]
          : []),
      ],
    },
    {
      title: "뷰파인더 및 디스플레이",
      icon: Eye,
      rows: [
        { label: "뷰파인더 유형", value: camera.viewfinderType },
        ...(camera.viewfinderMagnification
          ? [
              {
                label: "뷰파인더 배율",
                value: `${camera.viewfinderMagnification}×`,
              },
            ]
          : []),
        { label: "LCD 크기", value: `${camera.lcdSize}인치 터치스크린` },
        { label: "LCD 해상도", value: camera.lcdResolution },
        { label: "터치스크린", value: camera.touchscreen },
      ],
    },
    {
      title: "렌즈 및 성능",
      icon: Gauge,
      rows: [
        { label: "렌즈 마운트", value: formatMount(camera.mount) },
        {
          label: "연속 촬영",
          value: `${camera.continuousShootingSpeed} fps`,
          highlight: true,
        },
        { label: "최저 셔터 속도", value: camera.shutterSpeedMin },
        { label: "최고 셔터 속도", value: camera.shutterSpeedMax },
      ],
    },
    {
      title: "연결",
      icon: Wifi,
      rows: [
        { label: "카드 슬롯", value: camera.cardSlots },
        { label: "카드 타입", value: camera.cardType },
        { label: "Wi-Fi", value: camera.wifi },
        { label: "블루투스", value: camera.bluetooth },
        ...(camera.usb ? [{ label: "USB", value: camera.usb }] : []),
      ],
    },
    {
      title: "본체",
      icon: Box,
      rows: [
        {
          label: "무게 (바디 전용)",
          value: `${camera.weightGrams}g`,
          highlight: true,
        },
        { label: "크기", value: camera.dimensions },
        { label: "방진방적", value: camera.weatherSealed },
      ],
    },
  ];

  return (
    <section id="specs-table" className="py-16">
      <div className="container-custom">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-10">
          <div
            className="w-1 h-8 rounded-full"
            style={{ background: "var(--gradient-brand)" }}
          />
          <h2 className="heading-lg" style={{ color: "var(--text-primary)" }}>
            기술 사양
          </h2>
        </div>

        {/* Specs Grid — 2 columns on desktop */}
        <div className="grid lg:grid-cols-2 gap-6 stagger-children">
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-xl overflow-hidden"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {/* Section Header */}
              <div
                className="flex items-center gap-2.5 px-5 py-4"
                style={{
                  background: "var(--gradient-brand-subtle)",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <section.icon
                  className="w-4.5 h-4.5"
                  style={{ color: "var(--accent-secondary)" }}
                />
                <h3
                  className="text-sm font-semibold tracking-wide uppercase"
                  style={{ color: "var(--text-primary)" }}
                >
                  {section.title}
                </h3>
              </div>

              {/* Spec Rows */}
              <div>
                {section.rows.map((row, rowIdx) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between px-5 py-3"
                    style={{
                      background:
                        rowIdx % 2 === 0
                          ? "transparent"
                          : "var(--bg-tertiary)",
                      borderBottom:
                        rowIdx < section.rows.length - 1
                          ? "1px solid var(--border-subtle)"
                          : "none",
                      transition: "background var(--transition-fast)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "var(--accent-glow)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        rowIdx % 2 === 0
                          ? "transparent"
                          : "var(--bg-tertiary)";
                    }}
                  >
                    {/* Label */}
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {row.label}
                    </span>

                    {/* Value */}
                    {typeof row.value === "boolean" ? (
                      <BooleanBadge value={row.value} />
                    ) : (
                      <span
                        className="text-sm font-semibold text-right"
                        style={{
                          color: row.highlight
                            ? "var(--text-accent)"
                            : "var(--text-primary)",
                        }}
                      >
                        {row.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
