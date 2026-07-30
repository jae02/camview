"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, ArrowLeft } from "lucide-react";
import { Suspense } from "react";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    if (query.length >= 2) {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
          setResults(data.results || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim().length >= 2) {
      window.location.href = `/search?q=${encodeURIComponent(searchInput.trim())}`;
    }
  };

  return (
    <div className="py-12 md:py-20">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">검색</h1>
        </div>

        <form onSubmit={handleSearch} className="mb-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="검색어를 입력하세요 (2글자 이상)"
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700 text-base"
              autoFocus
            />
          </div>
        </form>

        {query && (
          <p className="text-sm text-gray-500 mb-6">
            &ldquo;{query}&rdquo; 검색 결과 {results.length}건
          </p>
        )}

        {loading ? (
          <p className="text-gray-500 text-center py-12">검색 중...</p>
        ) : results.length > 0 ? (
          <div className="flex flex-col">
            {results.map((article: any) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="block py-6 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="font-medium text-amber-700 dark:text-amber-500">{article.category}</span>
                    <span className="text-gray-300 dark:text-gray-700">|</span>
                    <span>{new Date(article.createdAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{article.title}</h3>
                  {article.excerpt && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{article.excerpt}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : query ? (
          <p className="text-gray-500 text-center py-12">검색 결과가 없습니다.</p>
        ) : null}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-gray-500">로딩 중...</div>}>
      <SearchResults />
    </Suspense>
  );
}
