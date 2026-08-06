import { MetadataRoute } from 'next';
import { getCameras } from '@/data/cameras';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://camview.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const cameras = getCameras();
  const currentDate = new Date();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/studio`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/cameras`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Dynamic camera detail routes
  const cameraRoutes: MetadataRoute.Sitemap = cameras.map((camera) => ({
    url: `${siteUrl}/cameras/${camera.id}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...cameraRoutes];
}
