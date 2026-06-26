import { NextRequest, NextResponse } from 'next/server';
import { register } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();
    if (!username || !email || !password) {
      return NextResponse.json({ error: '모든 필드를 입력해 주세요.' }, { status: 400 });
    }
    const user = await register(username, email, password);
    return NextResponse.json({ user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '회원가입에 실패했습니다.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
