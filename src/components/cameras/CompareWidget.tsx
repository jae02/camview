'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Scale, Tag } from 'lucide-react';

interface CameraSummary {
  id: string;
  name: string;
  imageUrl: string;
  weight: number;
  releasePrice: number;
}

interface CompareWidgetProps {
  cameras: CameraSummary[];
}

export default function CompareWidget({ cameras }: CompareWidgetProps) {
  if (!cameras || cameras.length !== 2) return null;

  const [cam1, cam2] = cameras;

  return (
    <div className="my-10 rounded-xl overflow-hidden shadow-sm" style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
      <div className="p-4 sm:p-6 text-center border-b" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
        <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>어떤 카메라가 나에게 맞을까?</h3>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>주요 스펙과 가격을 한눈에 비교해 보세요.</p>
      </div>
      
      <div className="grid grid-cols-2 relative">
        {/* VS Badge */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md z-10" 
             style={{ background: 'var(--accent-primary)', color: 'white', border: '2px solid var(--bg-card)' }}>
          VS
        </div>

        {/* Camera 1 */}
        <div className="p-4 sm:p-6 flex flex-col items-center border-r" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="relative w-full aspect-square max-w-[150px] mb-4">
            <Image 
              src={cam1.imageUrl} 
              alt={cam1.name} 
              fill 
              className="object-contain" 
              sizes="(max-width: 768px) 150px, 150px"
            />
          </div>
          <h4 className="font-bold text-center mb-4 min-h-[2.5rem] flex items-center" style={{ color: 'var(--text-primary)' }}>{cam1.name}</h4>
          
          <div className="w-full space-y-3 text-sm">
            <div className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'var(--bg-body)' }}>
              <span className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}><Scale size={14} /> 무게</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{cam1.weight}g</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'var(--bg-body)' }}>
              <span className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}><Tag size={14} /> 출시가</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{cam1.releasePrice.toLocaleString()}원</span>
            </div>
          </div>
        </div>

        {/* Camera 2 */}
        <div className="p-4 sm:p-6 flex flex-col items-center">
          <div className="relative w-full aspect-square max-w-[150px] mb-4">
            <Image 
              src={cam2.imageUrl} 
              alt={cam2.name} 
              fill 
              className="object-contain"
              sizes="(max-width: 768px) 150px, 150px" 
            />
          </div>
          <h4 className="font-bold text-center mb-4 min-h-[2.5rem] flex items-center" style={{ color: 'var(--text-primary)' }}>{cam2.name}</h4>
          
          <div className="w-full space-y-3 text-sm">
            <div className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'var(--bg-body)' }}>
              <span className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}><Scale size={14} /> 무게</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{cam2.weight}g</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'var(--bg-body)' }}>
              <span className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}><Tag size={14} /> 출시가</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{cam2.releasePrice.toLocaleString()}원</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <Link 
          href={`/compare?cameras=${cam1.id},${cam2.id}`}
          className="flex w-full items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold transition-colors hover:opacity-90"
          style={{ background: 'var(--accent-primary)', color: 'white' }}
        >
          상세 스펙 비교하기 <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
