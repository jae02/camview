import { NextRequest, NextResponse } from 'next/server';
import { incrementHelpful, getReviewById } from '@/lib/db';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const review = getReviewById(id);
  if (!review) {
    return NextResponse.json({ error: '리뷰를 찾을 수 없습니다.' }, { status: 404 });
  }

  incrementHelpful(id);
  return NextResponse.json({ success: true, helpful: review.helpful + 1 });
}
