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
 * Supports both old seed data (structured fields) and new cameradecision data (allSpecs).
 */
export default function SpecsTable({ camera }: SpecsTableProps) {
  const hasRichSpecs = camera.megapixels > 0 && camera.afPoints > 0;

  // Build sections from structured seed data if available
  const structuredSections: SpecSection[] = hasRichSpecs
    ? [
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
            ...(camera.afType ? [{ label: "AF 방식", value: camera.afType }] : []),
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
            ...(camera.maxVideoResolution
              ? [{
                  label: "최대 해상도",
                  value: camera.maxVideoResolution,
                  highlight: true,
                }]
              : []),
            ...(camera.videoFeatures
              ? [{ label: "동영상 기능", value: camera.videoFeatures }]
              : []),
          ],
        },
        {
          title: "뷰파인더 및 디스플레이",
          icon: Eye,
          rows: [
            ...(camera.viewfinderType
              ? [{ label: "뷰파인더 유형", value: camera.viewfinderType }]
              : []),
            ...(camera.viewfinderMagnification
              ? [{
                  label: "뷰파인더 배율",
                  value: `${camera.viewfinderMagnification}×`,
                }]
              : []),
            { label: "LCD 크기", value: `${camera.lcdSize}인치` },
            ...(camera.lcdResolution
              ? [{ label: "LCD 해상도", value: camera.lcdResolution }]
              : []),
            { label: "터치스크린", value: camera.touchscreen },
          ],
        },
        {
          title: "렌즈 및 성능",
          icon: Gauge,
          rows: [
            { label: "렌즈 마운트", value: formatMount(camera.mount) },
            ...(camera.continuousShootingSpeed > 0
              ? [{
                  label: "연속 촬영",
                  value: `${camera.continuousShootingSpeed} fps`,
                  highlight: true,
                }]
              : []),
            ...(camera.shutterSpeedMin
              ? [{ label: "최저 셔터 속도", value: camera.shutterSpeedMin }]
              : []),
            ...(camera.shutterSpeedMax
              ? [{ label: "최고 셔터 속도", value: camera.shutterSpeedMax }]
              : []),
          ],
        },
        {
          title: "연결",
          icon: Wifi,
          rows: [
            { label: "카드 슬롯", value: camera.cardSlots },
            ...(camera.cardType
              ? [{ label: "카드 타입", value: camera.cardType }]
              : []),
            { label: "Wi-Fi", value: camera.wifi },
            { label: "블루투스", value: camera.bluetooth },
            ...(camera.usb ? [{ label: "USB", value: camera.usb }] : []),
          ],
        },
        {
          title: "본체",
          icon: Box,
          rows: [
            ...(camera.weightGrams > 0
              ? [{
                  label: "무게 (바디 전용)",
                  value: `${camera.weightGrams}g`,
                  highlight: true,
                }]
              : []),
            ...(camera.dimensions
              ? [{ label: "크기", value: camera.dimensions }]
              : []),
            { label: "방진방적", value: camera.weatherSealed },
          ],
        },
      ]
    : [];

  // Build sections from allSpecs (cameradecision raw data) for cameras without rich seed data
  const allSpecsSections: SpecSection[] = [];
  if (camera.allSpecs && !hasRichSpecs) {
    const specs = camera.allSpecs as Record<string, unknown>;
    const koLabels = (camera.keySpecsKo || {}) as Record<string, string>;

    // Group specs by category
    const sensorKeys = ["Brand", "Model", "Sensor Resolution", "Sensor Size", "Sensor Type", "Sensor Dimensions", "Sensor Area", "Max Native ISO", "Min Native ISO", "Max Boosted ISO", "Image Stabilization"];
    const displayKeys = ["Screen Type", "Screen Size", "Screen Resolution", "Touch Screen", "Viewfinder", "Viewfinder Resolution"];
    const performanceKeys = ["Number of Focus Points", "Max Continuous Shooting (Mechanical Shutter)", "Max Continuous Shooting (Electronic Shutter)", "Max Mechanical Shutter Speed"];
    const videoKeys = ["Max Video Resolution", "Video Resolutions", "Video Formats"];
    const connectKeys = ["Storage Type", "Storage Slots", "Wireless Connectivity", "Bluetooth", "USB", "HDMI", "Microphone Port", "Headphone Port"];
    const bodyKeys = ["Body Type", "Lens Mount", "Number of Lenses", "Focal Length Multiplier", "Weight", "Physical Dimensions", "Environmental Sealing", "Battery Life"];
    const infoKeys = ["Announced", "MSRP"];

    const makeRows = (keys: string[]) =>
      keys
        .filter((k) => specs[k] !== undefined && specs[k] !== null && specs[k] !== "" && specs[k] !== "N/A")
        .map((k) => ({
          label: koLabels[k] || SPEC_LABELS_KO[k] || k,
          value: typeof specs[k] === "boolean" ? specs[k] as boolean : String(specs[k]),
          highlight: ["Sensor Resolution", "Max Native ISO", "Number of Focus Points", "Max Video Resolution", "Weight"].includes(k),
        }));

    const groups: { title: string; icon: LucideIcon; keys: string[] }[] = [
      { title: "센서 및 이미지", icon: Cpu, keys: sensorKeys },
      { title: "디스플레이", icon: Eye, keys: displayKeys },
      { title: "오토포커스 및 촬영", icon: Crosshair, keys: performanceKeys },
      { title: "동영상", icon: Video, keys: videoKeys },
      { title: "연결 및 스토리지", icon: Wifi, keys: connectKeys },
      { title: "본체 및 기타", icon: Box, keys: bodyKeys },
      { title: "제품 정보", icon: MonitorSmartphone, keys: infoKeys },
    ];

    for (const g of groups) {
      const rows = makeRows(g.keys);
      if (rows.length > 0) {
        allSpecsSections.push({ title: g.title, icon: g.icon, rows });
      }
    }
  }

  const sections = hasRichSpecs ? structuredSections : allSpecsSections;

  if (sections.length === 0) return null;

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

// Korean spec label translations
const SPEC_LABELS_KO: Record<string, string> = {
  "Brand": "브랜드",
  "Model": "모델",
  "Sensor Resolution": "센서 해상도",
  "Sensor Size": "센서 규격",
  "Sensor Type": "센서 방식",
  "Sensor Dimensions": "센서 크기",
  "Sensor Area": "센서 면적",
  "Max Native ISO": "최대 네이티브 ISO",
  "Min Native ISO": "최소 네이티브 ISO",
  "Max Boosted ISO": "최대 확장 ISO",
  "Image Stabilization": "손떨림 보정 (IBIS)",
  "Screen Type": "LCD 방식",
  "Screen Size": "LCD 크기",
  "Screen Resolution": "LCD 해상도",
  "Touch Screen": "터치스크린",
  "Viewfinder": "뷰파인더",
  "Viewfinder Resolution": "뷰파인더 해상도",
  "Number of Focus Points": "측거점 수",
  "Max Continuous Shooting (Mechanical Shutter)": "최대 연사 (기계셔터)",
  "Max Continuous Shooting (Electronic Shutter)": "최대 연사 (전자셔터)",
  "Max Mechanical Shutter Speed": "최대 셔터 속도",
  "Max Video Resolution": "최대 동영상 해상도",
  "Video Resolutions": "지원 동영상 해상도",
  "Video Formats": "동영상 포맷",
  "Storage Type": "저장 매체",
  "Storage Slots": "카드 슬롯 수",
  "Wireless Connectivity": "무선 연결",
  "Bluetooth": "블루투스",
  "USB": "USB 규격",
  "HDMI": "HDMI 출력",
  "Microphone Port": "외장 마이크 단자",
  "Headphone Port": "헤드폰 잭",
  "Body Type": "바디 형태",
  "Lens Mount": "렌즈 마운트",
  "Number of Lenses": "호환 렌즈 수",
  "Focal Length Multiplier": "크롭 팩터",
  "Weight": "무게",
  "Physical Dimensions": "크기",
  "Environmental Sealing": "방진방적",
  "Battery Life": "배터리 수명",
  "Announced": "발표일",
  "MSRP": "출시 가격",
};
