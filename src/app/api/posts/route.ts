import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const articlesDir = path.join(process.cwd(), 'data/articles');
const AUTH_COOKIE_NAME = 'admin_auth';
const AUTH_TOKEN = 'authenticated';

function isAuthenticated(request: NextRequest): boolean {
  return request.cookies.get(AUTH_COOKIE_NAME)?.value === AUTH_TOKEN;
}

// GET: List all posts (for admin dashboard) or return categories
export async function GET(request: NextRequest) {
  const categoriesOnly = request.nextUrl.searchParams.get('categories');

  if (!fs.existsSync(articlesDir)) {
    return NextResponse.json(categoriesOnly ? { categories: [] } : { posts: [] });
  }

  const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.mdx'));

  if (categoriesOnly) {
    const categories = new Set<string>();
    files.forEach(file => {
      const filePath = path.join(articlesDir, file);
      const { data } = matter(fs.readFileSync(filePath, 'utf8'));
      if (data.category) categories.add(data.category);
    });
    return NextResponse.json({ categories: Array.from(categories).sort() });
  }

  // For admin dashboard - requires auth
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const posts = files.map(file => {
    const filePath = path.join(articlesDir, file);
    const { data } = matter(fs.readFileSync(filePath, 'utf8'));
    return {
      slug: file.replace(/\.mdx$/, ''),
      title: data.title || 'Untitled',
      category: data.category || '카메라',
      createdAt: data.createdAt || new Date().toISOString(),
      draft: data.draft === true,
    };
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({ posts });
}


function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
    || `post-${Date.now()}`;
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const { title, category, content, excerpt = '', coverImage = '', draft = false } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: '제목과 내용은 필수입니다.' }, { status: 400 });
    }

    const slug = slugify(title);
    const now = new Date().toISOString();

    const mdxContent = `---
title: "${title}"
category: "${category || '카메라'}"
excerpt: "${excerpt}"
coverImage: "${coverImage}"
draft: ${draft === true}
createdAt: "${now}"
updatedAt: "${now}"
---

${content}
`;

    // Ensure directory exists
    if (!fs.existsSync(articlesDir)) {
      fs.mkdirSync(articlesDir, { recursive: true });
    }

    const filePath = path.join(articlesDir, `${slug}.mdx`);

    // Check if slug already exists, append timestamp if so
    let finalSlug = slug;
    let finalPath = filePath;
    if (fs.existsSync(filePath)) {
      finalSlug = `${slug}-${Date.now()}`;
      finalPath = path.join(articlesDir, `${finalSlug}.mdx`);
    }

    fs.writeFileSync(finalPath, mdxContent, 'utf8');

    return NextResponse.json({ success: true, slug: finalSlug });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: '글 저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
