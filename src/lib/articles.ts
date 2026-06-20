import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getCameraBySlug, CameraWithStats } from './queries';

export interface ArticleMetadata {
  id: string;
  title: string;
  slug: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  targetCameraSlugs: string[];
}

export interface Article extends ArticleMetadata {
  content: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  targetCameras?: any[];
}

const articlesDirectory = path.join(process.cwd(), 'data/articles');

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const fullPath = path.join(articlesDirectory, `${slug}.mdx`);
    if (!fs.existsSync(fullPath)) return null;

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    const targetCameras = [];
    if (data.targetCameraSlugs && Array.isArray(data.targetCameraSlugs)) {
      for (const camSlug of data.targetCameraSlugs) {
        const camera = await getCameraBySlug(camSlug);
        if (camera) {
          targetCameras.push({
            id: camera.slug, // Compare page uses slug as id in UI
            name: camera.model,
            imageUrl: camera.imageUrl,
            weight: camera.weightGrams,
            releasePrice: camera.priceMsrp,
          });
        }
      }
    }

    return {
      id: data.id || slug,
      title: data.title,
      slug: slug,
      category: data.category || 'Guide',
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
      targetCameraSlugs: data.targetCameraSlugs || [],
      content,
      targetCameras,
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
        targetCameraSlugs: data.targetCameraSlugs || [],
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
