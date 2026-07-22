// @ts-ignore
import { getAllArticles } from "@/lib/articles";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // @ts-ignore
  const articles = await getAllArticles();
  
  // 네이버 서치어드바이저 도메인 불일치 에러 방지를 위해 요청된 도메인을 그대로 사용
  const protocol = request.headers.get("x-forwarded-proto") || "https";
  const host = request.headers.get("host") || "dslreview.co.kr";
  const site_url = `${protocol}://${host}`;

  const feedItems = articles.map((article: any) => {
    return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${site_url}/blog/${article.slug}</link>
      <description><![CDATA[${
        article.title
      } - 카메라 프리미엄 매거진 Dlsrivew]]></description>
      <pubDate>${new Date(article.createdAt).toUTCString()}</pubDate>
      <guid>${site_url}/blog/${article.slug}</guid>
    </item>`;
  });

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Dlsrivew — 프리미엄 카메라 매거진</title>
    <link>${site_url}</link>
    <description>카메라와 사진을 사랑하는 사람들을 위한 프리미엄 매거진. 거짓 없는 솔직한 리뷰와 트렌디한 카메라 가이드를 제공합니다.</description>
${feedItems.join("")}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=86400, stale-while-revalidate",
    },
  });
}
