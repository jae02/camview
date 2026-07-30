"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Save, ArrowLeft, Trash2, Send, Image as ImageIcon, X } from "lucide-react";
import Link from "next/link";

export default function AdminEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("카메라");
  const [customCategory, setCustomCategory] = useState("");
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState("");
  const [draft, setDraft] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const defaultCategories = ["카메라", "패션", "카페", "여행", "미식", "공부"];
  const [allCategories, setAllCategories] = useState(defaultCategories);

  useEffect(() => {
    fetch("/api/posts?categories=true")
      .then(res => res.json())
      .then(data => {
        if (data.categories) {
          setAllCategories([...new Set([...defaultCategories, ...data.categories])]);
        }
      }).catch(() => {});
  }, []);

  useEffect(() => {
    params.then(async (p) => {
      setSlug(p.slug);
      try {
        const res = await fetch(`/api/posts/${p.slug}`);
        if (res.status === 401) { router.push("/admin/login"); return; }
        if (!res.ok) { setError("글을 불러올 수 없습니다."); return; }
        const data = await res.json();
        setTitle(data.title);
        setExcerpt(data.excerpt || "");
        setCategory(data.category);
        setCoverImage(data.coverImage || "");
        setContent(data.content);
        setDraft(data.draft || false);
      } catch { setError("글을 불러오는 중 오류가 발생했습니다."); }
      finally { setFetching(false); }
    });
  }, [params, router]);

  const handleAddCategory = () => {
    if (customCategory.trim()) {
      const newCat = customCategory.trim();
      if (!allCategories.includes(newCat)) setAllCategories([...allCategories, newCat]);
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
          setContent(content.substring(0, start) + `\n![이미지](${data.url})\n` + content.substring(end));
        } else {
          setContent(content + `\n![이미지](${data.url})\n`);
        }
      } else { setError(data.error || "이미지 업로드에 실패했습니다."); }
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
      if (data.success) setCoverImage(data.url);
      else setError(data.error || "커버 이미지 업로드에 실패했습니다.");
    } catch { setError("커버 이미지 업로드 중 오류가 발생했습니다."); }
    finally { setCoverUploading(false); if (coverInputRef.current) coverInputRef.current.value = ""; }
  };

  const handleSave = async (asDraft: boolean) => {
    if (!title.trim() || !content.trim()) { setError("제목과 내용을 모두 입력해주세요."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/posts/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, excerpt, category, coverImage, content, draft: asDraft }),
      });
      if (res.status === 401) { router.push("/admin/login"); return; }
      const data = await res.json();
      if (data.success) router.push(asDraft ? "/admin" : `/blog/${slug}`);
      else setError(data.error || "수정에 실패했습니다.");
    } catch { setError("수정 중 오류가 발생했습니다."); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!confirm("정말로 이 글을 삭제하시겠습니까?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${slug}`, { method: "DELETE" });
      if (res.status === 401) { router.push("/admin/login"); return; }
      const data = await res.json();
      if (data.success) router.push("/admin");
      else setError(data.error || "삭제에 실패했습니다.");
    } catch { setError("삭제 중 오류가 발생했습니다."); }
    finally { setDeleting(false); }
  };

  if (fetching) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">글을 불러오는 중...</p></div>;

  return (
    <div className="py-8 md:py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href={draft ? "/admin" : `/blog/${slug}`} className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">글 수정</h1>
            {draft && <span className="px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold">임시저장</span>}
          </div>
          <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50">
            <Trash2 className="w-4 h-4" />{deleting ? "삭제 중..." : "삭제"}
          </button>
        </div>

        <div className="space-y-6">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력하세요"
            className="w-full px-0 py-3 text-3xl font-bold text-gray-900 dark:text-white bg-transparent border-none outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600" />

          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="글 요약을 입력하세요 (목록에 표시됩니다)" rows={2}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700 resize-none placeholder:text-gray-400" />

          {/* Cover Image */}
          <div>
            {coverImage ? (
              <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                <img src={coverImage} alt="커버 이미지" className="w-full h-48 object-cover" />
                <button onClick={() => setCoverImage("")} className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => coverInputRef.current?.click()} disabled={coverUploading}
                className="w-full py-6 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-800 text-gray-400 hover:border-gray-400 hover:text-gray-600 dark:hover:border-gray-600 dark:hover:text-gray-300 transition-colors flex flex-col items-center gap-2 text-sm">
                <ImageIcon className="w-6 h-6" />{coverUploading ? "업로드 중..." : "커버 이미지 추가 (선택)"}
              </button>
            )}
            <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
          </div>

          {/* Category */}
          <div className="flex flex-wrap gap-2">
            {allCategories.map((cat) => (
              <button key={cat} type="button" onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${category === cat ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
                {cat}
              </button>
            ))}
            {!showCustomCategory ? (
              <button type="button" onClick={() => setShowCustomCategory(true)}
                className="px-4 py-2 rounded-full text-sm font-medium border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-700 dark:hover:border-gray-500 dark:hover:text-gray-300 transition-colors">
                + 새 카테고리
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input type="text" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddCategory()} placeholder="카테고리 입력"
                  className="px-3 py-2 rounded-full text-sm border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white outline-none w-32" autoFocus />
                <button onClick={handleAddCategory} className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">추가</button>
                <button onClick={() => { setShowCustomCategory(false); setCustomCategory(""); }} className="text-sm text-gray-400 hover:text-gray-600">취소</button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
              <ImagePlus className="w-4 h-4" />{uploading ? "업로드 중..." : "사진 추가"}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </div>

          <textarea ref={textareaRef} value={content} onChange={(e) => setContent(e.target.value)} placeholder="내용을 작성하세요..."
            className="w-full min-h-[500px] px-0 py-3 text-base text-gray-800 dark:text-gray-200 bg-transparent border-none outline-none resize-none placeholder:text-gray-300 dark:placeholder:text-gray-600 leading-relaxed" />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
            <button onClick={() => handleSave(true)} disabled={loading || !title.trim() || !content.trim()}
              className="flex items-center gap-2 px-5 py-3 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <Save className="w-4 h-4" />임시저장
            </button>
            <button onClick={() => handleSave(false)} disabled={loading || !title.trim() || !content.trim()}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <Send className="w-4 h-4" />{loading ? "저장 중..." : "발행하기"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
