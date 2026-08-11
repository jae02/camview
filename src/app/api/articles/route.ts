import { NextRequest, NextResponse } from 'next/server';
import { getArticles, createArticle } from '@/lib/articles';
import { verifyAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category') || undefined;
  const search = searchParams.get('search') || undefined;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  try {
    const result = await getArticles({ category, search, page, limit });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: '게시글 목록을 불러오는데 실패했습니다.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category, tags, adminPassword } = body;

    if (!await verifyAdmin(adminPassword)) {
      return NextResponse.json({ error: '관리자 비밀번호가 일치하지 않습니다.' }, { status: 401 });
    }

    if (!title || !content || !category) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    const article = await createArticle({ title, content, category, tags: tags || [] });
    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: '게시글 작성에 실패했습니다.' }, { status: 500 });
  }
}
