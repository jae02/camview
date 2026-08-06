import { getCameras } from '@/data/cameras';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.dslreview.co.kr';

export async function GET() {
  const cameras = getCameras();
  const buildDate = new Date().toUTCString();

  // Escape XML entities
  const escapeXml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const itemsXml = [
    `
    <item>
      <title>${escapeXml('CamView 온라인 필터 스튜디오 — 10종 필름 & 디지털 카메라 필터 실시간 적용')}</title>
      <link>${siteUrl}/studio</link>
      <guid isPermaLink="true">${siteUrl}/studio</guid>
      <description><![CDATA[내 사진을 업로드하고 코닥 포트라 400, 후지필름 벨비아 50, 시네스틸 800T, 라이카 Q3 등 10종의 클래식 필름과 하이엔드 디지털 카메라 색감으로 실시간 변환하세요. AI 구도/노출 점수 분석 및 무료 고화질 저장 지원.]]></description>
      <category>온라인 스튜디오</category>
      <category>사진 필터</category>
      <pubDate>${buildDate}</pubDate>
    </item>`,
    `
    <item>
      <title>${escapeXml('카메라 컬렉션 둘러보기 — 10대 명기 카메라 & 필름 색감 가이드')}</title>
      <link>${siteUrl}/cameras</link>
      <guid isPermaLink="true">${siteUrl}/cameras</guid>
      <description><![CDATA[필름부터 디지털까지, 코닥, 후지필름, 일포드, 라이카, 소니, 캐논, 핫셀블라드의 고유한 컬러 사이언스와 계조 특성을 탐색하세요.]]></description>
      <category>카메라 도감</category>
      <pubDate>${buildDate}</pubDate>
    </item>`,
    ...cameras.map((cam) => {
      const categoryLabel = cam.category === 'film' ? '필름' : '디지털';
      return `
    <item>
      <title>${escapeXml(`[${categoryLabel}] ${cam.name} (${cam.brand}) — 색감 특성 및 필터 시뮬레이션`)}</title>
      <link>${siteUrl}/cameras/${cam.id}</link>
      <guid isPermaLink="true">${siteUrl}/cameras/${cam.id}</guid>
      <description><![CDATA[${cam.name} (${cam.year}년 출시, ${cam.brand})의 고유한 컬러 사이언스, 대비, 하이라이트/섀도우 밸런스 및 필터 특성을 확인하고 내 사진에 직접 적용해 보세요. ${cam.description}]]></description>
      <category>${categoryLabel}</category>
      <category>${cam.brand}</category>
      <pubDate>${buildDate}</pubDate>
    </item>`;
    }),
  ].join('');

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>CamView — 카메라 필터 시뮬레이터</title>
    <link>${siteUrl}</link>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <description>내 사진을 코닥, 후지필름, 라이카, 핫셀블라드 등 10종의 클래식 필름 및 프리미엄 디지털 카메라 색감으로 실시간 변환하는 온라인 포토 스튜디오</description>
    <language>ko-KR</language>
    <copyright>© 2026 CamView. All rights reserved.</copyright>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <docs>https://www.rssboard.org/rss-specification</docs>
    ${itemsXml}
  </channel>
</rss>`;

  return new Response(rssFeed.trim(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=43200',
    },
  });
}
