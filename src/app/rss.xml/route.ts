import { getAllCameras } from "@/lib/queries";
import { NextResponse } from "next/server";

export async function GET() {
  const cameras = await getAllCameras();
  const site_url = "https://dslreview.co.kr";

  const feedItems = cameras.map((camera) => {
    return `
    <item>
      <title><![CDATA[${camera.brand} ${camera.model} 상세 스펙 및 리뷰]]></title>
      <link>${site_url}/cameras/${camera.slug}</link>
      <guid>${site_url}/cameras/${camera.slug}</guid>
      <pubDate>${new Date(camera.releaseDate).toUTCString()}</pubDate>
      <description><![CDATA[${
        camera.description ||
        `${camera.brand} ${camera.model}의 상세 사양, 스펙 비교 및 리뷰를 확인하세요.`
      }]]></description>
    </item>`;
  });

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>카메라 백과사전 — 디지털 카메라 상세 스펙 도감</title>
    <link>${site_url}</link>
    <description>역대 디지털 카메라의 상세 기술 사양을 검색하고, 모델 간 스펙을 비교하고, 브랜드별 카메라 도감을 탐색해 보세요.</description>
    <language>ko</language>
    <atom:link href="${site_url}/rss.xml" rel="self" type="application/rss+xml" />
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
