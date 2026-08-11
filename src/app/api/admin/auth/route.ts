import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: '비밀번호를 입력해주세요.' }, { status: 400 });
    }

    const success = await verifyAdmin(password);
    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json({ error: '인증 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
