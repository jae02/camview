'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const CATEGORIES = [
  { slug: 'notice', name: '공지사항', icon: '📢' },
  { slug: 'camera', name: '카메라', icon: '📷' },
  { slug: 'photo-tips', name: '사진 팁', icon: '💡' },
  { slug: 'review', name: '리뷰', icon: '⭐' },
  { slug: 'free', name: '자유', icon: '💬' },
];

function WriteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('notice');
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('adminAuth');
    if (!stored) {
      router.push('/admin');
      return;
    }
    setAdminPassword(stored);

    // If editing, load existing article
    if (editId) {
      fetch(`/api/articles/${editId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.article) {
            setTitle(data.article.title);
            setContent(data.article.content);
            setCategory(data.article.category);
            setTagsInput(data.article.tags.join(', '));
          }
        })
        .catch(() => setError('글을 불러오는 데 실패했습니다.'));
    }
  }, [editId, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('adminPassword', adminPassword);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.url) {
        const imageMarkdown = `\n![이미지 설명](${data.url})\n`;
        setContent((prev) => prev + imageMarkdown);
      } else {
        alert(data.error || '이미지 업로드에 실패했습니다.');
      }
    } catch {
      alert('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('제목과 본문을 입력해 주세요.');
      return;
    }

    setSaving(true);
    setError('');

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const url = editId ? `/api/articles/${editId}` : '/api/articles';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category,
          tags,
          adminPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/post/${data.article?.id || editId}`);
      } else {
        setError(data.error || '저장에 실패했습니다.');
      }
    } catch {
      setError('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editId) return;
    if (!confirm('정말 이 글을 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/articles/${editId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPassword }),
      });

      if (res.ok) {
        router.push('/');
      } else {
        const data = await res.json();
        setError(data.error || '삭제에 실패했습니다.');
      }
    } catch {
      setError('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {editId ? '✏️ 글 수정' : '📝 새 글 작성'}
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className="btn-secondary px-4 py-2 text-sm"
          >
            {preview ? '에디터' : '미리보기'}
          </button>
          {editId && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 text-sm rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
            >
              삭제
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="input-field w-full text-xl font-bold py-4"
            required
          />
        </div>

        {/* Category & Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">카테고리</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field w-full"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              태그 <span className="text-gray-500">(쉼표로 구분)</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="카메라, 사진, 리뷰"
              className="input-field w-full"
            />
          </div>
        </div>

        {/* Content Editor / Preview */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-300">
              본문 <span className="text-gray-500">(마크다운 지원)</span>
            </label>
            <div className="flex items-center gap-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1 disabled:opacity-50"
              >
                {uploadingImage ? '업로드 중...' : '🖼️ 이미지 첨부'}
              </button>
            </div>
          </div>
          {preview ? (
            <div className="glass-card p-6 min-h-[400px] article-content">
              <div
                dangerouslySetInnerHTML={{
                  __html: simpleMarkdownToHtml(content),
                }}
              />
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="마크다운으로 글을 작성하세요...&#10;&#10;## 제목&#10;본문 내용을 여기에 입력하세요."
              className="input-field w-full min-h-[400px] font-mono text-sm resize-y"
              required
            />
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
            {error}
          </p>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary px-6 py-3"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary px-8 py-3 disabled:opacity-50"
          >
            {saving ? '저장 중...' : editId ? '수정 완료' : '게시하기'}
          </button>
        </div>
      </form>
    </div>
  );
}

function simpleMarkdownToHtml(md: string): string {
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  // Bold & italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr />');
  // Lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  // Paragraphs
  html = html.replace(/^(?!<[huplioba]|$)(.+)$/gm, '<p>$1</p>');

  return html;
}

export default function AdminWritePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        </div>
      }
    >
      <WriteContent />
    </Suspense>
  );
}
