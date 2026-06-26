import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createReview, getReviewsByCameraSlug, findUserById, generateId } from '@/lib/db';

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');
  if (!slug) {
    return NextResponse.json({ error: 'slug parameter required' }, { status: 400 });
  }

  const reviews = getReviewsByCameraSlug(slug);
  const reviewsWithAuthor = reviews.map(r => {
    const user = findUserById(r.user_id);
    return {
      id: r.id,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      pros: r.pros,
      cons: r.cons,
      helpful: r.helpful,
      verified: true,
      createdAt: r.created_at,
      cameraId: r.camera_slug,
      author: {
        id: user?.id || '',
        username: user?.username || '탈퇴한 사용자',
        name: user?.name || null,
        avatarUrl: user?.avatar_url || null,
      },
    };
  });

  return NextResponse.json({ reviews: reviewsWithAuthor });
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { camera_slug, rating, title, comment, pros, cons } = await request.json();

    if (!camera_slug || !rating || !title || !comment) {
      return NextResponse.json({ error: '필수 항목을 모두 입력해 주세요.' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: '평점은 1~5 사이여야 합니다.' }, { status: 400 });
    }

    const review = {
      id: generateId(),
      camera_slug,
      user_id: user.id,
      rating: Number(rating),
      title,
      comment,
      pros: pros || null,
      cons: cons || null,
      helpful: 0,
      created_at: new Date().toISOString(),
    };

    createReview(review);

    return NextResponse.json({ success: true, review });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '리뷰 작성에 실패했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
