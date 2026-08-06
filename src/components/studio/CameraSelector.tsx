'use client';

import { useState } from 'react';
import { CameraProfile, CameraCategory } from '@/types';
import { cameras } from '@/data/cameras';

interface CameraSelectorProps {
  selectedId: string;
  onSelect: (camera: CameraProfile) => void;
}

export default function CameraSelector({ selectedId, onSelect }: CameraSelectorProps) {
  const [filter, setFilter] = useState<'all' | CameraCategory>('all');

  const filteredCameras = cameras.filter(
    cam => filter === 'all' || cam.category === filter
  );

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Tabs */}
      <div className="flex space-x-2 p-1 bg-white/5 rounded-xl self-start">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${filter === 'all' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-gray-200'}`}
        >
          전체
        </button>
        <button
          onClick={() => setFilter('film')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${filter === 'film' ? 'bg-amber-500/20 text-amber-400' : 'text-gray-400 hover:text-gray-200'}`}
        >
          필름
        </button>
        <button
          onClick={() => setFilter('digital')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${filter === 'digital' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
        >
          디지털
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {filteredCameras.map((camera) => {
          const isSelected = camera.id === selectedId;
          return (
            <button
              key={camera.id}
              onClick={() => onSelect(camera)}
              className={`w-full flex items-center p-3 rounded-2xl border transition-all duration-300 ${
                isSelected 
                  ? 'bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]' 
                  : 'bg-black/20 border-white/5 hover:bg-white/5'
              }`}
              style={isSelected ? { borderColor: camera.accentColor, boxShadow: `0 0 15px ${camera.accentColor}40` } : {}}
            >
              <span className="text-3xl mr-3">{camera.icon}</span>
              <div className="flex flex-col items-start text-left flex-1 overflow-hidden">
                <span className="text-sm font-bold text-white mb-1 truncate w-full">{camera.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  camera.category === 'film' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                }`}>
                  {camera.category === 'film' ? '필름' : '디지털'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
