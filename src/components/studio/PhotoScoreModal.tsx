'use client';

import { PhotoAnalysisResult } from '@/lib/photo-analyzer';
import { CameraProfile } from '@/types';

interface PhotoScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: PhotoAnalysisResult | null;
  cameras: CameraProfile[];
  onSelectCamera: (camera: CameraProfile) => void;
}

export default function PhotoScoreModal({
  isOpen,
  onClose,
  result,
  cameras,
  onSelectCamera,
}: PhotoScoreModalProps) {
  if (!isOpen || !result) return null;

  const recommendedCam = cameras.find((c) => c.id === result.recommendedCameraId) || cameras[0];

  const getGradeBadgeColor = (grade: string) => {
    switch (grade) {
      case 'S+':
        return 'from-amber-400 via-rose-500 to-purple-600 text-white shadow-amber-500/30';
      case 'S':
        return 'from-amber-400 to-amber-600 text-black shadow-amber-500/20';
      case 'A':
        return 'from-emerald-400 to-teal-600 text-white shadow-emerald-500/20';
      case 'B':
        return 'from-blue-400 to-indigo-600 text-white shadow-blue-500/20';
      default:
        return 'from-neutral-400 to-neutral-600 text-white';
    }
  };

  const metricList = [
    { key: 'centering', ...result.metrics.centering, icon: '🎯' },
    { key: 'exposure', ...result.metrics.exposure, icon: '💡' },
    { key: 'sharpness', ...result.metrics.sharpness, icon: '✨' },
    { key: 'colorHarmony', ...result.metrics.colorHarmony, icon: '🎨' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-[#0e0e14] border border-white/15 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto">
        {/* Glow ambient background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/15 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          ✕
        </button>

        {/* Header & Overall Score */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-neutral-400 text-xs mb-3 border border-white/10">
            <span>🤖</span> AI 사진 구도 & 퀄리티 분석
          </div>

          <div className="flex items-center justify-center gap-5 mt-2">
            <div
              className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getGradeBadgeColor(
                result.grade
              )} flex flex-col items-center justify-center shadow-lg transform rotate-[-3deg]`}
            >
              <span className="text-xs font-semibold opacity-80 uppercase tracking-wider">GRADE</span>
              <span className="text-3xl font-black">{result.grade}</span>
            </div>

            <div className="text-left">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white via-neutral-100 to-amber-300 bg-clip-text text-transparent">
                  {result.totalScore}
                </span>
                <span className="text-neutral-500 text-sm font-medium">/ 100점</span>
              </div>
              <p className="text-sm text-neutral-300 font-medium mt-1">
                {result.gradeText}
              </p>
            </div>
          </div>
        </div>

        {/* 4 Detail Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {metricList.map((m) => (
            <div key={m.key} className="bg-white/5 border border-white/5 rounded-2xl p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </div>
                <span className="text-sm font-bold text-white">{m.score}점</span>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
                  style={{ width: `${m.score}%` }}
                />
              </div>
              <p className="text-[11px] text-neutral-400 truncate">{m.desc}</p>
            </div>
          ))}
        </div>

        {/* AI Camera Recommendation */}
        <div className="bg-gradient-to-br from-amber-500/10 via-white/5 to-transparent border border-amber-500/20 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">💡</span>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide">
              이 사진에 가장 어울리는 추천 카메라
            </h4>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed mb-3">
            {result.recommendedReason}
          </p>
          <button
            onClick={() => {
              onSelectCamera(recommendedCam);
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <span>{recommendedCam.icon}</span>
            <span>{recommendedCam.name} 필터 바로 적용하기</span>
          </button>
        </div>

        {/* Analysis Tips */}
        {result.tips.length > 0 && (
          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/5">
            <h4 className="text-xs font-semibold text-neutral-400 mb-2">구도 피드백</h4>
            <div className="space-y-1.5">
              {result.tips.map((tip, idx) => (
                <p key={idx} className="text-xs text-neutral-300 flex items-center gap-2">
                  <span>{tip}</span>
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
