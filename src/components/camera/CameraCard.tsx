'use client';

import Link from 'next/link';
import { CameraProfile } from '@/types';

interface CameraCardProps {
  camera: CameraProfile;
}

export default function CameraCard({ camera }: CameraCardProps) {
  return (
    <Link href={`/cameras/${camera.id}`} className="block group h-full">
      <div 
        className="relative h-full flex flex-col overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-6 transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1"
        style={{ '--hover-color': camera.accentColor } as React.CSSProperties}
      >
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
          style={{ background: `radial-gradient(circle at center, ${camera.accentColor}, transparent 70%)` }}
        />
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 border-2 rounded-2xl"
          style={{ borderColor: camera.accentColor }}
        />
        
        <div className="relative z-10 flex flex-col items-center text-center flex-grow space-y-4 justify-center">
          <div className="text-6xl mb-2">{camera.icon}</div>
          <div className="space-y-1">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${
              camera.category === 'film' ? 'badge-film bg-amber-500/20 text-amber-300' : 'badge-digital bg-blue-500/20 text-blue-300'
            }`}>
              {camera.category === 'film' ? '필름 카메라' : '디지털 카메라'}
            </span>
            <h3 className="text-xl font-bold text-white">{camera.name}</h3>
            <p className="text-sm text-gray-400">{camera.brand}</p>
          </div>
          <p className="text-sm text-gray-300 italic mt-auto pt-4">"{camera.tagline}"</p>
        </div>
      </div>
    </Link>
  );
}
