'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Camera, Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
      router.back();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'var(--gradient-brand)', boxShadow: '0 0 30px var(--accent-glow)' }}
          >
            <Camera className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            카메라 백과사전
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
            {mode === 'login' ? '로그인하여 리뷰를 작성해 보세요' : '계정을 만들어 커뮤니티에 참여하세요'}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)' }}>
          {/* Tabs */}
          <div className="flex mb-6 rounded-lg overflow-hidden p-1" style={{ background: 'var(--bg-tertiary)' }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className="flex-1 py-2.5 text-sm font-semibold rounded-md"
              style={{
                background: mode === 'login' ? 'var(--bg-card)' : 'transparent',
                color: mode === 'login' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                border: 'none',
                cursor: 'pointer',
                boxShadow: mode === 'login' ? 'var(--shadow-sm)' : 'none',
                transition: 'var(--transition-fast)',
              }}
            >
              로그인
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className="flex-1 py-2.5 text-sm font-semibold rounded-md"
              style={{
                background: mode === 'register' ? 'var(--bg-card)' : 'transparent',
                color: mode === 'register' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                border: 'none',
                cursor: 'pointer',
                boxShadow: mode === 'register' ? 'var(--shadow-sm)' : 'none',
                transition: 'var(--transition-fast)',
              }}
            >
              회원가입
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>사용자명</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="닉네임을 입력하세요"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm"
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', outline: 'none' }}
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>이메일</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일 주소"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm"
                  style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', outline: 'none' }}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? '6자 이상' : '비밀번호'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm"
                  style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', outline: 'none' }}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="px-4 py-2.5 rounded-lg text-sm" style={{ background: 'rgba(220, 38, 38, 0.08)', color: 'var(--error)', border: '1px solid rgba(220, 38, 38, 0.15)' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
              style={{
                background: isLoading ? 'var(--text-muted)' : 'var(--gradient-brand)',
                color: 'white',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 0 20px var(--accent-glow)',
                transition: 'var(--transition-fast)',
              }}
            >
              {isLoading ? '처리 중...' : mode === 'login' ? '로그인' : '계정 만들기'}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
