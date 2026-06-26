import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import {
  generateId,
  createUser,
  createSession,
  findSessionById,
  findUserById,
  findUserByEmail,
  findUserByUsername,
  deleteSession,
  type DbUser,
} from '@/lib/db';

const SESSION_COOKIE = 'session_id';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface SafeUser {
  id: string;
  username: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
}

function toSafeUser(user: DbUser): SafeUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    avatar_url: user.avatar_url,
    created_at: user.created_at,
  };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function register(username: string, email: string, password: string): Promise<SafeUser> {
  if (findUserByEmail(email.toLowerCase())) throw new Error('이미 사용 중인 이메일입니다.');
  if (findUserByUsername(username)) throw new Error('이미 사용 중인 사용자명입니다.');
  if (password.length < 6) throw new Error('비밀번호는 6자 이상이어야 합니다.');
  if (username.length < 2) throw new Error('사용자명은 2자 이상이어야 합니다.');

  const id = generateId();
  const password_hash = await hashPassword(password);
  const now = new Date().toISOString();

  const user: DbUser = {
    id,
    username,
    email: email.toLowerCase(),
    password_hash,
    name: username,
    avatar_url: null,
    created_at: now,
  };

  createUser(user);
  await setSessionCookie(id);
  return toSafeUser(user);
}

export async function login(email: string, password: string): Promise<SafeUser> {
  const user = findUserByEmail(email.toLowerCase());
  if (!user) throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');

  await setSessionCookie(user.id);
  return toSafeUser(user);
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    deleteSession(sessionId);
    cookieStore.delete(SESSION_COOKIE);
  }
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
    if (!sessionId) return null;

    const session = findSessionById(sessionId);
    if (!session) return null;
    if (new Date(session.expires_at) < new Date()) {
      deleteSession(sessionId);
      return null;
    }

    const user = findUserById(session.user_id);
    if (!user) return null;
    return toSafeUser(user);
  } catch {
    return null;
  }
}

async function setSessionCookie(userId: string): Promise<void> {
  const sessionId = generateId();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  createSession({
    id: sessionId,
    user_id: userId,
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString(),
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}
