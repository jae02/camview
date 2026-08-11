import { NextRequest, NextResponse } from 'next/server';
import { addComment, deleteComment } from '@/lib/comments';
import { getArticleById } from '@/lib/articles';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  try {
    const article = await getArticleById(id);
    if (!article) {
      return NextResponse.json({ error: '글을 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json(article.comments);
  } catch {
    return NextResponse.json({ error: '댓글 목록을 불러오는데 실패했습니다.' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  try {
    const body = await request.json();
    const { nickname, password, content } = body;

    if (!nickname || !password || !content) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    const comment = await addComment(id, nickname, password, content);
    if (!comment) {
      return NextResponse.json({ error: '글을 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json(comment, { status: 201 });
  } catch {
    return NextResponse.json({ error: '댓글 작성에 실패했습니다.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  try {
    const body = await request.json();
    const { commentId, password } = body;

    if (!commentId || !password) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    const success = await deleteComment(id, commentId, password);
    if (!success) {
      return NextResponse.json({ error: '댓글을 찾을 수 없거나 비밀번호가 일치하지 않습니다.' }, { status: 403 });
    }

    return NextResponse.json({ message: '댓글이 삭제되었습니다.' });
  } catch {
    return NextResponse.json({ error: '댓글 삭제에 실패했습니다.' }, { status: 500 });
  }
}
