import { notFound } from "next/navigation";
import { Metadata } from "next";
import CameraHero from "@/components/cameras/CameraHero";
import SpecsTable from "@/components/cameras/SpecsTable";
import ReviewSection from "@/components/cameras/ReviewSection";
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
    title: `${camera.brand} ${camera.model} — 사양 및 리뷰`,
    description: `${camera.brand} ${camera.model}의 전체 기술 사양과 ${camera.reviewCount}개의 커뮤니티 리뷰. ${camera.megapixels}MP ${camera.sensorSize} 센서, ${camera.maxVideoResolution} 동영상. 평점 ${camera.avgRating}/5.`,
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
      {/* Hero Section — full-width product showcase */}
      <CameraHero camera={camera} />

      {/* Divider with gradient */}
      <div
        className="h-px"
        style={{ background: "var(--gradient-brand)", opacity: 0.15 }}
      />

      {/* Technical Specifications Table */}
      <SpecsTable camera={camera} />

      {/* Community Reviews Section */}
      <ReviewSection
        reviews={camera.reviews}
        cameraName={`${camera.brand} ${camera.model}`}
      />
    </div>
  );
}
