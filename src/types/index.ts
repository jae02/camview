export interface Article {
  id: string;
  title: string;
  content: string; // markdown content
  excerpt: string; // first 150 chars plain text
  category: string; // category slug
  tags: string[];
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  views: number;
  comments: Comment[];
}

export interface Comment {
  id: string;
  nickname: string;
  passwordHash: string; // simple hash for deletion
  content: string;
  createdAt: string;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  icon: string; // emoji
}
