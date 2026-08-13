import { NextRequest, NextResponse } from 'next/server';
import { getAllComments, deleteCommentAdmin } from '@/lib/comments';
import { verifyAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminPassword } = body;

    if (!verifyAdmin(adminPassword)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const comments = await getAllComments();
    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ error: '댓글 목록을 불러오는데 실패했습니다.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, commentId, adminPassword } = body;

    if (!verifyAdmin(adminPassword)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    if (!articleId || !commentId) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    const success = await deleteCommentAdmin(articleId, commentId);
    if (!success) {
      return NextResponse.json({ error: '댓글을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ message: '댓글이 삭제되었습니다.' });
  } catch (error) {
    return NextResponse.json({ error: '댓글 삭제에 실패했습니다.' }, { status: 500 });
  }
}
