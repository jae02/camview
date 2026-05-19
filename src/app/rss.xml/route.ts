import { getAllCameras } from "@/lib/queries";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cameras = await getAllCameras();
  
  // 네이버 서치어드바이저 도메인 불일치 에러 방지를 위해 요청된 도메인을 그대로 사용
  const protocol = request.headers.get("x-forwarded-proto") || "https";
  const host = request.headers.get("host") || "dslreview.co.kr";
  const site_url = `${protocol}://${host}`;

  const feedItems = cameras.map((camera) => {
    return `
    <item>
      <title><![CDATA[${camera.brand} ${camera.model} 상세 스펙 및 리뷰]]></title>
      <link>${site_url}/cameras/${camera.slug}</link>
      <description><![CDATA[${
        camera.description ||
        `${camera.brand} ${camera.model}의 상세 사양, 스펙 비교 및 리뷰를 확인하세요.`
      }]]></description>
      <pubDate>${new Date(camera.releaseDate).toUTCString()}</pubDate>
      <guid>${site_url}/cameras/${camera.slug}</guid>
    </item>`;
  });

  // 네이버 가이드라인에 완벽하게 맞춘 순정 RSS 포맷 (불필요한 atom 태그 등 제거)
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>카메라 백과사전 — 디지털 카메라 상세 스펙 도감</title>
    <link>${site_url}</link>
    <description>역대 디지털 카메라의 상세 기술 사양을 검색하고, 모델 간 스펙을 비교하고, 브랜드별 카메라 도감을 탐색해 보세요.</description>
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
