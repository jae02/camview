'use client';

import { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCameras, getCameraById } from '@/data/cameras';
import type { CameraProfile, UploadedImage } from '@/types';
import CameraSelector from '@/components/studio/CameraSelector';
import ImageUploader from '@/components/studio/ImageUploader';
import FilterCanvas, { FilterCanvasHandle } from '@/components/studio/FilterCanvas';
import PhotoScoreModal from '@/components/studio/PhotoScoreModal';
import { downloadFilteredImage } from '@/lib/filter-engine';
import { analyzePhoto, PhotoAnalysisResult } from '@/lib/photo-analyzer';

function StudioContent() {
  const searchParams = useSearchParams();
  const initialCameraId = searchParams.get('camera');
  
  const allCameras = getCameras();
  const [selectedCamera, setSelectedCamera] = useState<CameraProfile>(
    getCameraById(initialCameraId || '') || allCameras[0]
  );
  
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [filterIntensity, setFilterIntensity] = useState<number>(1);
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [showCameraPanel, setShowCameraPanel] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Photo Scoring State
  const [analysisResult, setAnalysisResult] = useState<PhotoAnalysisResult | null>(null);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState<boolean>(false);

  const filterCanvasRef = useRef<FilterCanvasHandle>(null);

  useEffect(() => {
    if (initialCameraId) {
      const camera = getCameraById(initialCameraId);
      if (camera) {
        setSelectedCamera(camera);
      }
    }
  }, [initialCameraId]);

  // Create HTMLImageElement and run Photo Analysis when uploaded image changes
  useEffect(() => {
    if (!uploadedImage) {
      setSourceImage(null);
      setAnalysisResult(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      setSourceImage(img);
      // Run automatic composition & quality score analysis
      try {
        const result = analyzePhoto(img, allCameras);
        setAnalysisResult(result);
      } catch (err) {
        console.error('Photo analysis error:', err);
      }
    };
    img.src = uploadedImage.dataUrl;
  }, [uploadedImage, allCameras]);

  const handleImageUpload = useCallback((image: UploadedImage) => {
    setUploadedImage(image);
  }, []);

  const handleClearImage = () => {
    setUploadedImage(null);
    setSourceImage(null);
    setAnalysisResult(null);
  };

  const handleDownload = async () => {
    const canvas = filterCanvasRef.current?.getCanvas();
    if (canvas) {
      setIsSaving(true);
      try {
        await downloadFilteredImage(canvas, `camview_${selectedCamera.id}.jpg`);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleCameraSelect = (camera: CameraProfile) => {
    setSelectedCamera(camera);
    setShowCameraPanel(false);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] relative">
      {/* Desktop Sidebar: Camera Selector */}
      <aside className="hidden lg:flex w-80 border-r border-white/10 bg-[#0a0a0f]/50 backdrop-blur-md flex-col h-[calc(100vh-4rem)] sticky top-16 z-20">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-xl font-bold mb-1">카메라 선택</h2>
          <p className="text-xs text-neutral-400">적용할 필터를 선택하세요</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <CameraSelector 
            selectedId={selectedCamera.id}
            onSelect={setSelectedCamera}
          />
        </div>
      </aside>

      {/* Mobile: Current Camera Pill + Toggle Button */}
      <div className="lg:hidden sticky top-16 z-30 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/10">
        <button
          onClick={() => setShowCameraPanel(!showCameraPanel)}
          className="w-full flex items-center justify-between p-3 active:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{selectedCamera.icon}</span>
            <div className="text-left">
              <p className="text-sm font-bold">{selectedCamera.name}</p>
              <p className="text-[10px] text-neutral-400">{selectedCamera.category === 'film' ? '필름' : '디지털'}</p>
            </div>
          </div>
          <span className={`text-neutral-400 transition-transform duration-300 ${showCameraPanel ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
      </div>

      {/* Mobile: Camera Selector Dropdown Panel */}
      {showCameraPanel && (
        <div className="lg:hidden fixed inset-0 top-[7.5rem] z-40">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCameraPanel(false)}
          />
          {/* Panel */}
          <div className="relative bg-[#0a0a0f]/95 backdrop-blur-md border-b border-white/10 max-h-[60vh] overflow-y-auto animate-fade-in-up">
            <div className="p-4">
              <CameraSelector 
                selectedId={selectedCamera.id}
                onSelect={handleCameraSelect}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col lg:h-[calc(100vh-4rem)] relative overflow-hidden bg-neutral-950/50">
        {!sourceImage ? (
          <div className="flex-1 p-4 flex items-center justify-center animate-fade-in-up">
            <div className="w-full max-w-2xl">
              <ImageUploader onImageUpload={handleImageUpload} />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col animate-fade-in-up h-full">
            {/* Top Bar for Analysis Score Badge */}
            {analysisResult && (
              <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🎯</span>
                  <span className="text-xs text-neutral-400 hidden sm:inline">사진 구도 & 퀄리티 분석:</span>
                  <span className="text-xs font-bold text-amber-400">
                    {analysisResult.totalScore}점 ({analysisResult.grade})
                  </span>
                  <span className="text-[11px] text-neutral-400 hidden md:inline truncate">
                    • {analysisResult.metrics.centering.desc}
                  </span>
                </div>
                <button
                  onClick={() => setIsScoreModalOpen(true)}
                  className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all flex items-center gap-1.5"
                >
                  <span>📊</span>
                  <span>상세 분석표</span>
                </button>
              </div>
            )}

            {/* Canvas Area */}
            <div className="flex-1 relative p-2 md:p-4 flex items-center justify-center overflow-hidden">
              {showComparison ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-h-full">
                    <div className="relative">
                      <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded z-10">원본</span>
                      <img src={uploadedImage!.dataUrl} alt="원본" className="w-full h-auto rounded-lg object-contain max-h-[40vh] md:max-h-[60vh]" />
                    </div>
                    <div className="relative">
                      <span className="absolute top-2 left-2 bg-black/60 text-amber-400 text-xs px-2 py-1 rounded z-10">{selectedCamera.name}</span>
                      <FilterCanvas
                        sourceImage={sourceImage}
                        selectedCamera={selectedCamera}
                        intensity={filterIntensity}
                        ref={filterCanvasRef}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <FilterCanvas
                  sourceImage={sourceImage}
                  selectedCamera={selectedCamera}
                  intensity={filterIntensity}
                  ref={filterCanvasRef}
                />
              )}
            </div>
            
            {/* Bottom Controls */}
            <div className="p-4 md:p-6 border-t border-white/10 bg-[#0a0a0f]/80 backdrop-blur-md z-10 flex flex-col gap-3 md:gap-4 pb-[env(safe-area-inset-bottom,0.5rem)]">
              {/* Intensity Slider */}
              <div className="flex items-center gap-3 md:gap-4 max-w-3xl mx-auto w-full">
                <span className="text-xs md:text-sm font-medium whitespace-nowrap">강도</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={filterIntensity}
                  onChange={(e) => setFilterIntensity(parseFloat(e.target.value))}
                  className="w-full h-2 touch-none"
                  style={{ touchAction: 'none' }}
                />
                <span className="text-xs md:text-sm font-medium w-10 md:w-12 text-right text-amber-400">
                  {Math.round(filterIntensity * 100)}%
                </span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-2 md:gap-4">
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className="btn-secondary px-3 md:px-6 py-3 flex items-center gap-1.5 md:gap-2 text-sm min-h-[44px]"
                >
                  <span className="text-base md:text-lg">🌓</span>
                  <span className="hidden sm:inline">{showComparison ? '필터 보기' : '원본 비교'}</span>
                  <span className="sm:hidden">비교</span>
                </button>
                <button
                  onClick={handleDownload}
                  disabled={isSaving}
                  className="btn-primary px-4 md:px-6 py-3 flex items-center gap-1.5 md:gap-2 text-sm min-h-[44px] disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span className="text-base md:text-lg">💾</span>
                  )}
                  <span className="hidden sm:inline">이미지 저장</span>
                  <span className="sm:hidden">저장</span>
                </button>
                <button
                  onClick={handleClearImage}
                  className="btn-secondary px-3 md:px-6 py-3 flex items-center gap-1.5 md:gap-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/20 min-h-[44px]"
                >
                  <span className="text-base md:text-lg">🗑️</span>
                  <span className="hidden sm:inline">사진 변경</span>
                  <span className="sm:hidden">변경</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Photo Score & Quality Analysis Modal */}
      <PhotoScoreModal
        isOpen={isScoreModalOpen}
        onClose={() => setIsScoreModalOpen(false)}
        result={analysisResult}
        cameras={allCameras}
        onSelectCamera={handleCameraSelect}
      />
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
      </div>
    }>
      <StudioContent />
    </Suspense>
  );
}
