'use client';

import Image from 'next/image';
import Link from 'next/link';

interface Camera {
  id: string; // This is the slug used for routing
  name: string;
  imageUrl: string | null;
  weight: number | null;
}

export default function CompareWidget({ cameras }: { cameras: Camera[] }) {
  if (!cameras || cameras.length < 2) return null;
  const [modelA, modelB] = cameras;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        {/* Model A */}
        <div className="flex-1 text-center min-w-0">
          <div className="w-full aspect-square relative bg-white rounded-lg border border-gray-200 mb-2 overflow-hidden flex items-center justify-center">
            {modelA.imageUrl ? (
              <Image src={modelA.imageUrl} alt={modelA.name} fill className="object-contain p-2" sizes="(max-width: 768px) 100vw, 50vw" />
            ) : (
              <span className="text-gray-400 text-xs">No Img</span>
            )}
          </div>
          <p className="text-sm font-semibold truncate text-gray-800 dark:text-gray-200" title={modelA.name}>
            {modelA.name}
          </p>
        </div>

        <div className="text-xs font-bold text-blue-500 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-full shrink-0">
          VS
        </div>

        {/* Model B */}
        <div className="flex-1 text-center min-w-0">
          <div className="w-full aspect-square relative bg-white rounded-lg border border-gray-200 mb-2 overflow-hidden flex items-center justify-center">
            {modelB.imageUrl ? (
              <Image src={modelB.imageUrl} alt={modelB.name} fill className="object-contain p-2" sizes="(max-width: 768px) 100vw, 50vw" />
            ) : (
              <span className="text-gray-400 text-xs">No Img</span>
            )}
          </div>
          <p className="text-sm font-semibold truncate text-gray-800 dark:text-gray-200" title={modelB.name}>
            {modelB.name}
          </p>
        </div>
      </div>

      {/* 
        기존에는 /compare 로 연결되는 버튼이 있었으나,
        순수 블로그 형태로 변경되면서 스펙 DB 기능이 삭제되어 제거함 
      */}
    </div>
  );
}
