import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = "https://dslreview.co.kr";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/login/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
