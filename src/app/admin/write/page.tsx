"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Send, ArrowLeft, Save, Image as ImageIcon, X } from "lucide-react";
import Link from "next/link";

export default function AdminWritePage() {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("카메라");
  const [customCategory, setCustomCategory] = useState("");
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const defaultCategories = ["카메라", "패션", "카페", "여행", "미식", "공부"];
  const [allCategories, setAllCategories] = useState(defaultCategories);

  // Load existing categories from server
  useEffect(() => {
    fetch("/api/posts?categories=true")
      .then(res => res.json())
      .then(data => {
        if (data.categories) {
          const merged = [...new Set([...defaultCategories, ...data.categories])];
          setAllCategories(merged);
        }
      })
      .catch(() => {});
  }, []);

  const handleAddCategory = () => {
    if (customCategory.trim()) {
      const newCat = customCategory.trim();
      if (!allCategories.includes(newCat)) {
        setAllCategories([...allCategories, newCat]);
      }
      setCategory(newCat);
      setCustomCategory("");
      setShowCustomCategory(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.status === 401) { router.push("/admin/login"); return; }
      const data = await res.json();
      if (data.success) {
        const textarea = textareaRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const imageMarkdown = `\n![이미지](${data.url})\n`;
          setContent(content.substring(0, start) + imageMarkdown + content.substring(end));
        } else {
          setContent(content + `\n![이미지](${data.url})\n`);
        }
      } else {
        setError(data.error || "이미지 업로드에 실패했습니다.");
      }
    } catch { setError("이미지 업로드 중 오류가 발생했습니다."); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.status === 401) { router.push("/admin/login"); return; }
      const data = await res.json();
      if (data.success) {
        setCoverImage(data.url);
      } else {
        setError(data.error || "커버 이미지 업로드에 실패했습니다.");
      }
    } catch { setError("커버 이미지 업로드 중 오류가 발생했습니다."); }
    finally { setCoverUploading(false); if (coverInputRef.current) coverInputRef.current.value = ""; }
  };

  const handleSubmit = async (draft: boolean = false) => {
    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 모두 입력해주세요.");
      return;
    }

    draft ? setDraftLoading(true) : setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, excerpt, category, coverImage, content, draft }),
      });
      if (res.status === 401) { router.push("/admin/login"); return; }
      const data = await res.json();
      if (data.success) {
        router.push(draft ? "/admin" : `/blog/${data.slug}`);
      } else {
        setError(data.error || "글 저장에 실패했습니다.");
      }
    } catch { setError("글 저장 중 오류가 발생했습니다."); }
    finally { setLoading(false); setDraftLoading(false); }
  };

  return (
    <div className="py-8 md:py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">새 글 작성</h1>
        </div>

        <div className="space-y-6">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="w-full px-0 py-3 text-3xl font-bold text-gray-900 dark:text-white bg-transparent border-none outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600"
            autoFocus
          />

          {/* Excerpt */}
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="글 요약을 입력하세요 (목록에 표시됩니다)"
            rows={2}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700 resize-none placeholder:text-gray-400"
          />

          {/* Cover Image */}
          <div>
            {coverImage ? (
              <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                <img src={coverImage} alt="커버 이미지" className="w-full h-48 object-cover" />
                <button
                  onClick={() => setCoverImage("")}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => coverInputRef.current?.click()}
                disabled={coverUploading}
                className="w-full py-6 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-800 text-gray-400 hover:border-gray-400 hover:text-gray-600 dark:hover:border-gray-600 dark:hover:text-gray-300 transition-colors flex flex-col items-center gap-2 text-sm"
              >
                <ImageIcon className="w-6 h-6" />
                {coverUploading ? "업로드 중..." : "커버 이미지 추가 (선택)"}
              </button>
            )}
            <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
          </div>

          {/* Category */}
          <div>
            <div className="flex flex-wrap gap-2">
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    category === cat
                      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
              {!showCustomCategory ? (
                <button
                  type="button"
                  onClick={() => setShowCustomCategory(true)}
                  className="px-4 py-2 rounded-full text-sm font-medium border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-700 dark:hover:border-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                  + 새 카테고리
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                    placeholder="카테고리 입력"
                    className="px-3 py-2 rounded-full text-sm border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white outline-none w-32"
                    autoFocus
                  />
                  <button onClick={handleAddCategory} className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">추가</button>
                  <button onClick={() => { setShowCustomCategory(false); setCustomCategory(""); }} className="text-sm text-gray-400 hover:text-gray-600">취소</button>
                </div>
              )}
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <ImagePlus className="w-4 h-4" />
              {uploading ? "업로드 중..." : "사진 추가"}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </div>

          {/* Content */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={"내용을 마크다운으로 작성하세요...\n\n## 소제목\n본문 내용을 여기에 작성합니다.\n\n사진은 위의 '사진 추가' 버튼으로 업로드할 수 있습니다."}
            className="w-full min-h-[500px] px-0 py-3 text-base text-gray-800 dark:text-gray-200 bg-transparent border-none outline-none resize-none placeholder:text-gray-300 dark:placeholder:text-gray-600 leading-relaxed"
          />

          {/* Error */}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => handleSubmit(true)}
              disabled={draftLoading || !title.trim() || !content.trim()}
              className="flex items-center gap-2 px-5 py-3 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {draftLoading ? "저장 중..." : "임시저장"}
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={loading || !title.trim() || !content.trim()}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {loading ? "발행 중..." : "발행하기"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
