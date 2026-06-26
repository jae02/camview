import { MetadataRoute } from "next";
import { getAllCameras } from "@/lib/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cameras = await getAllCameras();
  const siteUrl = "https://dslreview.co.kr";

  const cameraUrls = cameras.map((camera) => ({
    url: `${siteUrl}/cameras/${camera.slug}`,
    lastModified: new Date(camera.releaseDate),
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
      url: `${siteUrl}/cameras`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...cameraUrls,
  ];
}
