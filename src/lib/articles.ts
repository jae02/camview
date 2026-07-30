import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface ArticleMetadata {
  id: string;
  title: string;
  slug: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  excerpt: string;
  coverImage: string;
  readingTime: number;
  draft: boolean;
}

export interface Article extends ArticleMetadata {
  excerpt: string;
  coverImage: string;
  content: string;
}

const articlesDirectory = path.join(process.cwd(), 'data/articles');

export function calculateReadingTime(content: string): number {
  if (!content) return 0;
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.ceil(words / 200);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const fullPath = path.join(articlesDirectory, `${slug}.mdx`);
    if (!fs.existsSync(fullPath)) return null;

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      id: data.id || slug,
      title: data.title,
      slug: slug,
      category: data.category || 'Guide',
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
      excerpt: data.excerpt || '',
      coverImage: data.coverImage || '',
      readingTime: calculateReadingTime(content),
      draft: data.draft === true,
      content,
    };
  } catch (error) {
    console.error(`Error loading article ${slug}:`, error);
    return null;
  }
}

export async function getAllArticles(includeDrafts: boolean = false): Promise<ArticleMetadata[]> {
  if (!fs.existsSync(articlesDirectory)) return [];
  
  const fileNames = fs.readdirSync(articlesDirectory);
  const allArticlesData = fileNames
    .filter(fileName => fileName.endsWith('.mdx'))
    .map(fileName => {
      const slug = fileName.replace(/\.mdx$/, '');
      const fullPath = path.join(articlesDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        id: data.id || slug,
        slug,
        title: data.title,
        category: data.category || 'Guide',
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        excerpt: data.excerpt || '',
        coverImage: data.coverImage || '',
        readingTime: calculateReadingTime(content),
        draft: data.draft === true,
      };
    })
    .filter(article => includeDrafts || !article.draft);

  return allArticlesData.sort((a, b) => {
    if (a.createdAt < b.createdAt) {
      return 1;
    } else {
      return -1;
    }
  });
}

export async function getAllArticlesIncludingDrafts(): Promise<ArticleMetadata[]> {
  return getAllArticles(true);
}

export async function getAllCategories(): Promise<string[]> {
  const articles = await getAllArticles();
  const categories = new Set(articles.map(article => article.category));
  return Array.from(categories).sort();
}

export async function getArticlesByCategory(category: string): Promise<ArticleMetadata[]> {
  const articles = await getAllArticles();
  return articles.filter(
    (article) => article.category.toLowerCase() === category.toLowerCase()
  );
}

