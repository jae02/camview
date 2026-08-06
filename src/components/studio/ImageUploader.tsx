'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { UploadedImage } from '@/types';

interface ImageUploaderProps {
  onImageUpload: (image: UploadedImage) => void;
}

export default function ImageUploader({ onImageUpload }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('파일 크기는 20MB를 초과할 수 없습니다.');
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onImageUpload({
          dataUrl: e.target.result as string,
          file: file,
          width: 0,
          height: 0
        });
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError('파일을 읽는 중 오류가 발생했습니다.');
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Main Upload Zone */}
      <div
        className={`drop-zone border-2 border-dashed rounded-3xl p-8 md:p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragging 
            ? 'border-amber-500 bg-amber-500/10' 
            : 'border-gray-600 bg-white/5 hover:bg-white/10 hover:border-gray-500'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
            <p className="text-gray-400 text-sm">이미지를 불러오는 중...</p>
          </div>
        ) : (
          <>
            <div className="text-5xl mb-4">📤</div>
            <h3 className="text-lg md:text-xl font-semibold text-white mb-2">갤러리에서 사진 선택</h3>
            <p className="text-gray-400 text-sm mb-4 hidden md:block">클릭하거나 이미지를 이곳으로 드래그 앤 드롭</p>
            <p className="text-gray-400 text-sm mb-4 md:hidden">탭하여 사진을 선택하세요</p>
            <p className="text-gray-500 text-xs">PNG, JPG, JPEG, HEIC (최대 20MB)</p>
          </>
        )}
        
        {/* Gallery / file picker input */}
        <input 
          type="file" 
          className="hidden" 
          ref={fileInputRef} 
          accept="image/*" 
          onChange={handleChange} 
        />
      </div>

      {/* Camera Capture Button (mobile only) */}
      <button
        onClick={() => cameraInputRef.current?.click()}
        className="mt-4 w-full py-4 rounded-2xl border-2 border-dashed border-gray-700 bg-white/5 text-center cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-gray-500 md:hidden active:scale-[0.98]"
      >
        <div className="text-4xl mb-2">📷</div>
        <p className="text-sm font-medium text-white">카메라로 직접 촬영</p>
      </button>

      {/* Camera capture input (mobile) */}
      <input
        type="file"
        className="hidden"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleChange}
      />

      {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}
    </div>
  );
}
