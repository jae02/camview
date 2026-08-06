import fs from 'fs';
import path from 'path';

const siteUrl = 'https://www.dslreview.co.kr';
const currentDate = new Date().toISOString();
const buildDate = new Date().toUTCString();

const cameras = [
  { id: 'kodak-portra-400', name: 'Kodak Portra 400', brand: 'Kodak', year: 1998, category: 'film', desc: '따뜻한 골든 아워와 부드러운 피부 톤을 연출하는 대표적인 인물용 컬러 네거티브 필름.' },
  { id: 'fujifilm-velvia-50', name: 'Fujifilm Velvia 50', brand: 'Fujifilm', year: 1990, category: 'film', desc: '압도적인 채도와 선명한 콘트라스트를 자랑하는 풍경 사진의 전설적인 슬라이드 필름.' },
  { id: 'kodak-ektar-100', name: 'Kodak Ektar 100', brand: 'Kodak', year: 2008, category: 'film', desc: '현존하는 세계에서 가장 미세한 입자감과 선명한 발색을 가진 고해상도 필름.' },
  { id: 'cinestill-800t', name: 'CineStill 800T', brand: 'CineStill', year: 2012, category: 'film', desc: '영화용 텅스텐 필름의 독특한 할레이션 붉은 광륜 효과를 재현한 야경 특화 필름.' },
  { id: 'ilford-hp5', name: 'Ilford HP5 Plus 400', brand: 'Ilford', year: 1989, category: 'film', desc: '풍부한 계조와 클래식한 입자감으로 깊이 있는 흑백 감성을 표현하는 흑백 필름의 정석.' },
  { id: 'fujifilm-x100v', name: 'Fujifilm X100V (Classic Chrome)', brand: 'Fujifilm', year: 2020, category: 'digital', desc: '차분한 톤과 깊은 섀도우, 묵직한 다큐멘터리 색감을 선사하는 클래식 크롬 룩.' },
  { id: 'leica-q3', name: 'Leica Q3 (Monochrome & Vivid)', brand: 'Leica', year: 2023, category: 'digital', desc: '깊고 중후한 라이카 특유의 명암 대비와 선명한 입체감을 연출하는 프리미엄 룩.' },
  { id: 'sony-a7c-ii', name: 'Sony A7C II (Creative Look FL)', brand: 'Sony', year: 2023, category: 'digital', desc: '푸른 하늘과 초록을 차분하고 세련되게 정돈하는 트렌디한 필름 라이크 룩.' },
  { id: 'canon-eos-r5', name: 'Canon EOS R5 (Portrait Natural)', brand: 'Canon', year: 2020, category: 'digital', desc: '생기 있고 화사한 피부 톤과 부드러운 하이라이트 롤오프를 선사하는 캐논의 인물 색감.' },
  { id: 'hasselblad-x2d', name: 'Hasselblad X2D 100C (HNCS)', brand: 'Hasselblad', year: 2022, category: 'digital', desc: '인간의 눈이 보는 그대로의 완벽한 계조와 왜곡 없는 정밀한 색채를 재현하는 중형 센서 색감.' },
];

// 1. Generate Sitemap XML
const sitemapUrls = [
  { loc: `${siteUrl}`, priority: '1.0', changefreq: 'daily' },
  { loc: `${siteUrl}/studio`, priority: '0.9', changefreq: 'daily' },
  { loc: `${siteUrl}/cameras`, priority: '0.8', changefreq: 'weekly' },
  ...cameras.map((c) => ({
    loc: `${siteUrl}/cameras/${c.id}`,
    priority: '0.8',
    changefreq: 'weekly',
  })),
];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

// 2. Generate RSS XML
const escapeXml = (unsafe) => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

const rssItems = [
  `    <item>
      <title>${escapeXml('CamView 온라인 필터 스튜디오 — 10종 필름 & 디지털 카메라 필터 실시간 적용')}</title>
      <link>${siteUrl}/studio</link>
      <guid isPermaLink="true">${siteUrl}/studio</guid>
      <description><![CDATA[내 사진을 업로드하고 코닥 포트라 400, 후지필름 벨비아 50, 시네스틸 800T, 라이카 Q3 등 10종의 클래식 필름과 하이엔드 디지털 카메라 색감으로 실시간 변환하세요. AI 구도/노출 점수 분석 및 무료 고화질 저장 지원.]]></description>
      <category>온라인 스튜디오</category>
      <category>사진 필터</category>
      <pubDate>${buildDate}</pubDate>
    </item>`,
  `    <item>
      <title>${escapeXml('카메라 컬렉션 둘러보기 — 10대 명기 카메라 & 필름 색감 가이드')}</title>
      <link>${siteUrl}/cameras</link>
      <guid isPermaLink="true">${siteUrl}/cameras</guid>
      <description><![CDATA[필름부터 디지털까지, 코닥, 후지필름, 일포드, 라이카, 소니, 캐논, 핫셀블라드의 고유한 컬러 사이언스와 계조 특성을 탐색하세요.]]></description>
      <category>카메라 도감</category>
      <pubDate>${buildDate}</pubDate>
    </item>`,
  ...cameras.map((cam) => {
    const categoryLabel = cam.category === 'film' ? '필름' : '디지털';
    return `    <item>
      <title>${escapeXml(`[${categoryLabel}] ${cam.name} (${cam.brand}) — 색감 특성 및 필터 시뮬레이션`)}</title>
      <link>${siteUrl}/cameras/${cam.id}</link>
      <guid isPermaLink="true">${siteUrl}/cameras/${cam.id}</guid>
      <description><![CDATA[${cam.name} (${cam.year}년 출시, ${cam.brand})의 고유한 컬러 사이언스, 대비, 하이라이트/섀도우 밸런스 및 필터 특성을 확인하고 내 사진에 직접 적용해 보세요. ${cam.desc}]]></description>
      <category>${categoryLabel}</category>
      <category>${cam.brand}</category>
      <pubDate>${buildDate}</pubDate>
    </item>`;
  }),
].join('\n');

const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
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
${rssItems}
  </channel>
</rss>`;

// Write to public directory
const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf-8');
fs.writeFileSync(path.join(publicDir, 'rss.xml'), rssXml, 'utf-8');

console.log('✅ Generated public/sitemap.xml and public/rss.xml successfully for', siteUrl);
