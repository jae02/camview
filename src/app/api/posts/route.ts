import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const articlesDir = path.join(process.cwd(), 'data/articles');
const AUTH_COOKIE_NAME = 'admin_auth';
const AUTH_TOKEN = 'authenticated';

function isAuthenticated(request: NextRequest): boolean {
  return request.cookies.get(AUTH_COOKIE_NAME)?.value === AUTH_TOKEN;
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
    const { title, category, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: '제목과 내용은 필수입니다.' }, { status: 400 });
    }

    const slug = slugify(title);
    const now = new Date().toISOString();

    const mdxContent = `---
title: "${title}"
category: "${category || '카메라'}"
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
