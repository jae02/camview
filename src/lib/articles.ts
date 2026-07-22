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
}

export interface Article extends ArticleMetadata {
  content: string;
}

const articlesDirectory = path.join(process.cwd(), 'data/articles');

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
      content,
    };
  } catch (error) {
    console.error(`Error loading article ${slug}:`, error);
    return null;
  }
}

export async function getAllArticles(): Promise<ArticleMetadata[]> {
  if (!fs.existsSync(articlesDirectory)) return [];
  
  const fileNames = fs.readdirSync(articlesDirectory);
  const allArticlesData = fileNames
    .filter(fileName => fileName.endsWith('.mdx'))
    .map(fileName => {
      const slug = fileName.replace(/\.mdx$/, '');
      const fullPath = path.join(articlesDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      return {
        id: data.id || slug,
        slug,
        title: data.title,
        category: data.category || 'Guide',
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      };
    });

  return allArticlesData.sort((a, b) => {
    if (a.createdAt < b.createdAt) {
      return 1;
    } else {
      return -1;
    }
  });
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
