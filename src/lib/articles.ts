import fs from 'fs/promises';
import path from 'path';
import { Article } from '../types';

const dataDir = path.join(process.cwd(), 'data', 'articles');

// Ensure directory exists
const ensureDataDir = async () => {
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
};

export async function getArticles(options?: {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ articles: Article[]; total: number; totalPages: number }> {
  await ensureDataDir();
  const files = await fs.readdir(dataDir);
  
  let articles: Article[] = [];
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      const filePath = path.join(dataDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      try {
        const article = JSON.parse(content) as Article;
        articles.push(article);
      } catch (e) {
        // Skip invalid JSON
      }
    }
  }

  // Filter
  if (options?.category) {
    articles = articles.filter(a => a.category === options.category);
  }
  
  if (options?.search) {
    const s = options.search.toLowerCase();
    articles = articles.filter(a => 
      a.title.toLowerCase().includes(s) || 
      a.content.toLowerCase().includes(s)
    );
  }

  // Sort by createdAt desc
  articles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Pagination
  const total = articles.length;
  const page = options?.page || 1;
  const limit = options?.limit || 10;
  const totalPages = Math.ceil(total / limit);
  
  const start = (page - 1) * limit;
  const paginatedArticles = articles.slice(start, start + limit);

  return {
    articles: paginatedArticles,
    total,
    totalPages
  };
}

export async function getArticleById(id: string): Promise<Article | null> {
  await ensureDataDir();
  const filePath = path.join(dataDir, `${id}.json`);
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as Article;
  } catch {
    return null;
  }
}

function stripMarkdown(md: string): string {
  return md
    .replace(/[#_*~`>]/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function createArticle(data: {
  title: string;
  content: string;
  category: string;
  tags?: string[];
}): Promise<Article> {
  await ensureDataDir();
  
  const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();
  
  const plainText = stripMarkdown(data.content);
  const excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');

  const article: Article = {
    id,
    title: data.title,
    content: data.content,
    excerpt,
    category: data.category,
    tags: data.tags || [],
    createdAt: now,
    updatedAt: now,
    views: 0,
    comments: []
  };

  const filePath = path.join(dataDir, `${id}.json`);
  await fs.writeFile(filePath, JSON.stringify(article, null, 2), 'utf-8');
  
  return article;
}

export async function updateArticle(id: string, data: Partial<Article>): Promise<Article | null> {
  const article = await getArticleById(id);
  if (!article) return null;

  if (data.content) {
    const plainText = stripMarkdown(data.content);
    article.excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
  }

  const updatedArticle = {
    ...article,
    ...data,
    id: article.id, // Ensure ID doesn't change
    createdAt: article.createdAt, // Ensure creation date doesn't change
    updatedAt: new Date().toISOString()
  };

  const filePath = path.join(dataDir, `${id}.json`);
  await fs.writeFile(filePath, JSON.stringify(updatedArticle, null, 2), 'utf-8');
  
  return updatedArticle;
}

export async function deleteArticle(id: string): Promise<boolean> {
  await ensureDataDir();
  const filePath = path.join(dataDir, `${id}.json`);
  
  try {
    await fs.unlink(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function incrementViews(id: string): Promise<void> {
  const article = await getArticleById(id);
  if (article) {
    article.views += 1;
    const filePath = path.join(dataDir, `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(article, null, 2), 'utf-8');
  }
}

export async function getPopularArticles(limit: number = 5): Promise<Article[]> {
  const { articles } = await getArticles({ limit: 1000 }); // Get all loosely
  return articles
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}
