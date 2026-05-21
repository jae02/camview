import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface DbUser {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface DbSession {
  id: string;
  user_id: string;
  expires_at: string;
  created_at: string;
}

export interface DbReview {
  id: string;
  camera_slug: string;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
  pros: string | null;
  cons: string | null;
  helpful: number;
  created_at: string;
}

interface DbData {
  users: DbUser[];
  sessions: DbSession[];
  reviews: DbReview[];
}

// ---------------------------------------------------------------------------
// File paths
// ---------------------------------------------------------------------------
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'app_data.json');

// ---------------------------------------------------------------------------
// In-memory cache with file persistence
// ---------------------------------------------------------------------------
const globalForDb = globalThis as unknown as { __dbData?: DbData };

function loadData(): DbData {
  if (globalForDb.__dbData) return globalForDb.__dbData;

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      globalForDb.__dbData = JSON.parse(raw);
      return globalForDb.__dbData!;
    } catch {
      // Corrupted file — start fresh
    }
  }

  const fresh: DbData = { users: [], sessions: [], reviews: [] };
  globalForDb.__dbData = fresh;
  saveData(fresh);
  return fresh;
}

function saveData(data: DbData): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  // Atomic write: write to temp, then rename
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmp, DB_FILE);
}

// ---------------------------------------------------------------------------
// Generate random ID
// ---------------------------------------------------------------------------
export function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  for (const byte of bytes) {
    id += chars[byte % chars.length];
  }
  return id;
}

// ---------------------------------------------------------------------------
// User operations
// ---------------------------------------------------------------------------
export function createUser(user: DbUser): void {
  const data = loadData();
  data.users.push(user);
  saveData(data);
}

export function findUserByEmail(email: string): DbUser | undefined {
  const data = loadData();
  return data.users.find(u => u.email === email);
}

export function findUserByUsername(username: string): DbUser | undefined {
  const data = loadData();
  return data.users.find(u => u.username === username);
}

export function findUserById(id: string): DbUser | undefined {
  const data = loadData();
  return data.users.find(u => u.id === id);
}

// ---------------------------------------------------------------------------
// Session operations
// ---------------------------------------------------------------------------
export function createSession(session: DbSession): void {
  const data = loadData();
  data.sessions.push(session);
  saveData(data);
}

export function findSessionById(id: string): DbSession | undefined {
  const data = loadData();
  return data.sessions.find(s => s.id === id);
}

export function deleteSession(id: string): void {
  const data = loadData();
  data.sessions = data.sessions.filter(s => s.id !== id);
  saveData(data);
}

export function deleteExpiredSessions(): void {
  const data = loadData();
  const now = new Date().toISOString();
  data.sessions = data.sessions.filter(s => s.expires_at > now);
  saveData(data);
}

// ---------------------------------------------------------------------------
// Review operations
// ---------------------------------------------------------------------------
export function createReview(review: DbReview): void {
  const data = loadData();
  data.reviews.push(review);
  saveData(data);
}

export function getReviewsByCameraSlug(slug: string): DbReview[] {
  const data = loadData();
  return data.reviews
    .filter(r => r.camera_slug === slug)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getReviewById(id: string): DbReview | undefined {
  const data = loadData();
  return data.reviews.find(r => r.id === id);
}

export function incrementHelpful(id: string): void {
  const data = loadData();
  const review = data.reviews.find(r => r.id === id);
  if (review) {
    review.helpful += 1;
    saveData(data);
  }
}

export function getReviewCountAndAvg(slug: string): { count: number; avg: number } {
  const reviews = getReviewsByCameraSlug(slug);
  if (reviews.length === 0) return { count: 0, avg: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return { count: reviews.length, avg: sum / reviews.length };
}
