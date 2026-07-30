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

// GET: Fetch a single article for editing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const { slug } = await params;
  const filePath = path.join(articlesDir, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: '글을 찾을 수 없습니다.' }, { status: 404 });
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  return NextResponse.json({
    title: data.title,
    category: data.category,
    excerpt: data.excerpt || '',
    coverImage: data.coverImage || '',
    draft: data.draft === true,
    content: content.trim(),
    createdAt: data.createdAt,
  });
}

// PUT: Update an existing article
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const { slug } = await params;

  try {
    const { title, category, content, excerpt = '', coverImage = '', draft = false } = await request.json();
    const filePath = path.join(articlesDir, `${slug}.mdx`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: '글을 찾을 수 없습니다.' }, { status: 404 });
    }

    // Read existing frontmatter to preserve createdAt
    const existing = fs.readFileSync(filePath, 'utf8');
    const { data: existingData } = matter(existing);

    const now = new Date().toISOString();
    const mdxContent = `---
title: "${title}"
category: "${category || '카메라'}"
excerpt: "${excerpt}"
coverImage: "${coverImage}"
draft: ${draft === true}
createdAt: "${existingData.createdAt || now}"
updatedAt: "${now}"
---

${content}
`;

    fs.writeFileSync(filePath, mdxContent, 'utf8');

    return NextResponse.json({ success: true, slug });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: '글 수정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// DELETE: Delete an article
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const { slug } = await params;
  const filePath = path.join(articlesDir, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: '글을 찾을 수 없습니다.' }, { status: 404 });
  }

  fs.unlinkSync(filePath);
  return NextResponse.json({ success: true });
}
