import { MetadataRoute } from "next";
// @ts-ignore
import { getAllArticles } from "@/lib/articles";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // @ts-ignore
  const articles = await getAllArticles();
  const siteUrl = "https://dslreview.co.kr";

  const articleUrls = articles.map((article: any) => ({
    url: `${siteUrl}/blog/${article.slug}`,
    lastModified: new Date(article.updatedAt || article.createdAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...articleUrls,
  ];
}
