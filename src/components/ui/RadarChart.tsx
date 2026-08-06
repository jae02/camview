'use client';

import { useEffect, useState } from 'react';
import { FilterCharacteristics } from '@/types';

interface RadarChartProps {
  data: FilterCharacteristics;
  color?: string;
  size?: number;
}

export default function RadarChart({ data, color = '#f59e0b', size = 250 }: RadarChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const labels = ['따뜻함', '대비', '채도', '입자감', '선명도', '빈티지'];
  
  const values = [
    data.warmth,
    data.contrast,
    data.saturation,
    data.grain,
    data.sharpness,
    data.vintage
  ];

  const center = size / 2;
  const radius = (size / 2) * 0.7; // 70% of half size leaves room for labels

  const getCoordinates = (value: number, index: number, total: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2; // Start from top (-90deg)
    const distance = (value / 100) * radius;
    return {
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance
    };
  };

  const levels = [20, 40, 60, 80, 100];
  
  const dataPoints = values.map((v, i) => getCoordinates(mounted ? v : 0, i, 6));
  const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <svg width={size} height={size} className="overflow-visible font-sans">
      {/* Draw grid lines (hexagons) */}
      {levels.map((level, i) => {
        const points = Array.from({ length: 6 }).map((_, idx) => 
          getCoordinates(level, idx, 6)
        );
        const polygon = points.map(p => `${p.x},${p.y}`).join(' ');
        
        return (
          <polygon
            key={`grid-${i}`}
            points={polygon}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
          />
        );
      })}

      {/* Draw axis lines */}
      {Array.from({ length: 6 }).map((_, idx) => {
        const endPoint = getCoordinates(100, idx, 6);
        return (
          <line
            key={`axis-${idx}`}
            x1={center}
            y1={center}
            x2={endPoint.x}
            y2={endPoint.y}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
          />
        );
      })}

      {/* Draw labels */}
      {labels.map((label, idx) => {
        const labelPos = getCoordinates(125, idx, 6); 
        return (
          <text
            key={`label-${idx}`}
            x={labelPos.x}
            y={labelPos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255, 255, 255, 0.7)"
            fontSize="12"
            fontWeight="500"
          >
            {label}
          </text>
        );
      })}

      {/* Draw data polygon */}
      <polygon
        points={dataPolygon}
        fill={`${color}40`}
        stroke={color}
        strokeWidth="2"
        className="transition-all duration-1000 ease-out"
      />
      
      {/* Draw data points (dots) */}
      {dataPoints.map((p, idx) => (
        <circle
          key={`dot-${idx}`}
          cx={p.x}
          cy={p.y}
          r="4"
          fill={color}
          className="transition-all duration-1000 ease-out"
        />
      ))}
    </svg>
  );
}
