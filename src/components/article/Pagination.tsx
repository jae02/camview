'use client';

import { useRouter } from 'next/navigation';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string; // e.g., '/category/camera' or '/search?q=test'
}

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  const router = useRouter();

  if (totalPages <= 1) return null;

  const navigateToPage = (page: number) => {
    const url = basePath.includes('?') 
      ? `${basePath}&page=${page}`
      : `${basePath}?page=${page}`;
    router.push(url);
  };

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button
        onClick={() => navigateToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md bg-transparent border border-[rgba(255,255,255,0.1)] text-gray-400 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        이전
      </button>
      
      {pages.map(page => (
        <button
          key={page}
          onClick={() => navigateToPage(page)}
          className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
            currentPage === page 
              ? 'bg-amber-400 text-black font-bold' 
              : 'text-gray-400 hover:bg-white/10'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => navigateToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md bg-transparent border border-[rgba(255,255,255,0.1)] text-gray-400 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        다음
      </button>
    </div>
  );
}
