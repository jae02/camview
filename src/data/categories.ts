import { Category } from '../types';

const categories: Category[] = [
  { slug: 'notice', name: '공지사항', description: '블로그 공지사항 및 업데이트', icon: '📢' },
  { slug: 'camera', name: '카메라', description: '카메라 관련 소식 및 정보', icon: '📷' },
  { slug: 'photo-tips', name: '사진 팁', description: '사진 촬영 노하우 및 팁', icon: '💡' },
  { slug: 'review', name: '리뷰', description: '장비 리뷰 및 사용기', icon: '⭐' },
  { slug: 'free', name: '자유', description: '자유로운 이야기', icon: '💬' },
];

export function getCategories(): Category[] {
  return categories;
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
