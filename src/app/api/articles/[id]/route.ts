import { NextRequest, NextResponse } from 'next/server';
import { getArticleById, updateArticle, deleteArticle, incrementViews } from '@/lib/articles';
import { verifyAdmin } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  try {
    const article = await getArticleById(id);
    if (!article) {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    }
    
    await incrementViews(id);
    
    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json({ error: '게시글을 불러오는데 실패했습니다.' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  try {
    const body = await request.json();
    const { title, content, category, tags, adminPassword } = body;

    if (!await verifyAdmin(adminPassword)) {
      return NextResponse.json({ error: '관리자 비밀번호가 일치하지 않습니다.' }, { status: 401 });
    }

    const updatedArticle = await updateArticle(id, { title, content, category, tags });
    if (!updatedArticle) {
      return NextResponse.json({ error: '게시글을 찾을 수 없거나 수정에 실패했습니다.' }, { status: 404 });
    }

    return NextResponse.json(updatedArticle);
  } catch (error) {
    return NextResponse.json({ error: '게시글 수정에 실패했습니다.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  try {
    const body = await request.json();
    const { adminPassword } = body;

    if (!await verifyAdmin(adminPassword)) {
      return NextResponse.json({ error: '관리자 비밀번호가 일치하지 않습니다.' }, { status: 401 });
    }

    const success = await deleteArticle(id);
    if (!success) {
      return NextResponse.json({ error: '게시글을 찾을 수 없거나 삭제에 실패했습니다.' }, { status: 404 });
    }

    return NextResponse.json({ message: '게시글이 삭제되었습니다.' });
  } catch (error) {
    return NextResponse.json({ error: '게시글 삭제에 실패했습니다.' }, { status: 500 });
  }
}
