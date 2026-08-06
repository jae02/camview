'use client';

import { useState, useRef, useEffect, MouseEvent, TouchEvent } from 'react';

interface BeforeAfterSliderProps {
  originalSrc: string;
  filteredCanvas: HTMLCanvasElement | null;
  cameraName: string;
}

export default function BeforeAfterSlider({ originalSrc, filteredCanvas, cameraName }: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [filteredSrc, setFilteredSrc] = useState<string>('');

  useEffect(() => {
    if (filteredCanvas) {
      setFilteredSrc(filteredCanvas.toDataURL('image/jpeg', 0.9));
    }
  }, [filteredCanvas]);

  const handleMove = (clientX: number) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: globalThis.MouseEvent) => handleMove(e.clientX);
  const handleTouchMove = (e: globalThis.TouchEvent) => handleMove(e.touches[0].clientX);
  
  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  if (!filteredSrc) return <div className="animate-pulse bg-white/10 w-full h-[50vh] md:h-[70vh] rounded-2xl"></div>;

  return (
    <div 
      ref={containerRef}
      className="compare-slider relative w-full overflow-hidden rounded-2xl select-none group h-[50vh] md:h-[70vh] bg-black/50"
      onMouseDown={(e: MouseEvent) => { setIsDragging(true); handleMove(e.clientX); }}
      onTouchStart={(e: TouchEvent) => { setIsDragging(true); handleMove(e.touches[0].clientX); }}
    >
      {/* Background (Original) */}
      <div 
        className="absolute inset-0 w-full h-full bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${originalSrc})` }}
      />
      <div className="absolute bottom-4 right-4 bg-black/70 px-3 py-1 rounded text-xs text-white/80 backdrop-blur-sm z-10 pointer-events-none">
        원본
      </div>

      {/* Foreground (Filtered) */}
      <div 
        className="absolute inset-0 h-full bg-contain bg-center bg-no-repeat border-r border-white/30"
        style={{ 
          backgroundImage: `url(${filteredSrc})`,
          width: `${sliderPosition}%`
        }}
      />
      <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1 rounded text-xs text-white/80 backdrop-blur-sm z-10 pointer-events-none" style={{ opacity: sliderPosition > 10 ? 1 : 0 }}>
        {cameraName}
      </div>

      {/* Slider */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white/80 cursor-ew-resize hover:bg-amber-400 transition-colors shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800 rotate-180 absolute">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </div>
      </div>
    </div>
  );
}
