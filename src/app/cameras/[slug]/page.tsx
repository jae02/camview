import { notFound } from "next/navigation";
import { Metadata } from "next";
import CameraHero from "@/components/cameras/CameraHero";
import SpecsTable from "@/components/cameras/SpecsTable";
import ReviewSection from "@/components/cameras/ReviewSection";
import ExpertReviewSection from "@/components/cameras/ExpertReviewSection";
import { getCameraBySlug, getAllCameraSlugs } from "@/lib/queries";

// ---------------------------------------------------------------------------
// Static Params — pre-render all known camera slugs at build time.
// ---------------------------------------------------------------------------
export async function generateStaticParams() {
  const slugs = await getAllCameraSlugs();
  return slugs.map((slug) => ({ slug }));
}

// ---------------------------------------------------------------------------
// Dynamic Metadata — SEO-optimized title & description for each camera page.
// ---------------------------------------------------------------------------
type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const camera = await getCameraBySlug(slug);
  if (!camera) return { title: "카메라를 찾을 수 없습니다" };

  return {
    title: `${camera.brand} ${camera.model} — 상세 사양 및 스펙`,
    description: `${camera.brand} ${camera.model}의 전체 기술 사양. ${camera.megapixels}MP ${camera.sensorSize} 센서, ${camera.maxVideoResolution} 동영상, ${camera.afPoints}개 AF 포인트. 카메라 백과사전에서 상세 정보를 확인하세요.`,
  };
}

// ---------------------------------------------------------------------------
// Camera Detail Page
// ---------------------------------------------------------------------------
export default async function CameraDetailPage({
  params,
}: PageProps) {
  const { slug } = await params;
  const camera = await getCameraBySlug(slug);

  if (!camera) {
    notFound();
  }

  return (
    <div id={`camera-page-${camera.slug}`}>
      {/* JSON-LD Rich Snippets for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": `${camera.brand} ${camera.model}`,
            "image": camera.imageUrl ? [camera.imageUrl] : [],
            "description": `${camera.brand} ${camera.model} - ${camera.megapixels}MP 센서 탑재 카메라`,
            "brand": {
              "@type": "Brand",
              "name": camera.brand
            },
            "aggregateRating": camera.reviewCount > 0 ? {
              "@type": "AggregateRating",
              "ratingValue": camera.avgRating,
              "reviewCount": camera.reviewCount
            } : undefined
          })
        }}
      />

      {/* Hero Section — full-width product showcase */}
      <CameraHero camera={camera} />

      {/* Dynamic SEO Overview Text */}
      <div className="container-custom pt-12 pb-6">
        <section className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-4xl mx-auto">
          <h2 className="heading-md mb-4 text-[var(--text-primary)]">개요 및 주요 특징</h2>
          <p className="mb-4">
            <strong>{camera.brand} {camera.model}</strong>은(는) {camera.sensorSize} 포맷 센서를 탑재하여 뛰어난 화질을 자랑하는 모델입니다. 
            유효 화소수 {camera.megapixels}MP를 지원하여 디테일한 표현이 가능하며, 최대 {camera.maxVideoResolution} 해상도의 동영상 촬영 기능을 제공하여 사진과 영상을 아우르는 다목적 환경에 적합합니다.
          </p>
          <p>
            특히 {camera.afType} 및 {camera.afPoints.toLocaleString()}개의 AF 포인트를 통한 빠르고 정확한 포커싱 성능, 그리고 초당 {camera.continuousShootingSpeed}매의 연사 속도는 결정적인 순간을 놓치지 않게 도와줍니다.
            무게는 약 {camera.weightGrams}g으로 촬영 시 안정감을 줍니다.
          </p>
        </section>
      </div>

      {/* Divider with gradient */}
      <div
        className="h-px"
        style={{ background: "var(--gradient-brand)", opacity: 0.15 }}
      />

      {/* Technical Specifications Table */}
      <SpecsTable camera={camera} />

      {/* Expert Review Section */}
      {camera.slrReview && (
        <ExpertReviewSection review={camera.slrReview} cameraName={`${camera.brand} ${camera.model}`} />
      )}

      {/* Community Reviews Section */}
      <ReviewSection
        reviews={camera.reviews}
        cameraName={`${camera.brand} ${camera.model}`}
      />
    </div>
  );
}
