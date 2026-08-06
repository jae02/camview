'use client';

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { CameraProfile } from '@/types';
import { applyFilter } from '@/lib/filter-engine';

interface FilterCanvasProps {
  sourceImage: HTMLImageElement;
  selectedCamera: CameraProfile;
  intensity: number;
}

export interface FilterCanvasHandle {
  getCanvas: () => HTMLCanvasElement | null;
}

const FilterCanvas = forwardRef<FilterCanvasHandle, FilterCanvasProps>(
  ({ sourceImage, selectedCamera, intensity }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useImperativeHandle(ref, () => ({
      getCanvas: () => canvasRef.current,
    }));

    useEffect(() => {
      const updateDimensions = () => {
        if (!sourceImage) return;
        
        const container = canvasRef.current?.parentElement;
        if (!container) return;

        const maxWidth = container.clientWidth;
        const maxHeight = window.innerHeight * 0.7; // Max height constraint
        
        const aspect = sourceImage.width / sourceImage.height;
        let newWidth = maxWidth;
        let newHeight = maxWidth / aspect;

        if (newHeight > maxHeight) {
          newHeight = maxHeight;
          newWidth = maxHeight * aspect;
        }

        setDimensions({ width: newWidth, height: newHeight });
      };

      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }, [sourceImage]);

    useEffect(() => {
      const renderFilter = () => {
        if (!canvasRef.current || !sourceImage || dimensions.width === 0) return;
        
        const canvas = canvasRef.current;
        canvas.width = sourceImage.width;
        canvas.height = sourceImage.height;
        
        applyFilter(canvas, sourceImage, selectedCamera.filter, intensity);
      };

      const timeoutId = setTimeout(renderFilter, 0);
      return () => clearTimeout(timeoutId);
    }, [sourceImage, selectedCamera, intensity, dimensions]);

    return (
      <div className="w-full flex justify-center items-center overflow-hidden bg-black/40 rounded-xl">
        <canvas
          ref={canvasRef}
          style={{ 
            width: dimensions.width > 0 ? `${dimensions.width}px` : '100%',
            height: dimensions.height > 0 ? `${dimensions.height}px` : 'auto',
            objectFit: 'contain'
          }}
          className="shadow-2xl shadow-black/50 rounded"
        />
      </div>
    );
  }
);

FilterCanvas.displayName = 'FilterCanvas';
export default FilterCanvas;
