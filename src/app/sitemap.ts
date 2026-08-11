import { MetadataRoute } from 'next';
import { getArticles } from '@/lib/articles';

const siteUrl = 'https://www.dslreview.co.kr';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { articles } = await getArticles({ limit: 1000 });
  const currentDate = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/search`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = [
    'notice', 'camera', 'photo-tips', 'review', 'free',
  ].map((slug) => ({
    url: `${siteUrl}/category/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteUrl}/post/${article.id}`,
    lastModified: new Date(article.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
