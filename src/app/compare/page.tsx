import { Metadata } from "next";
import ComparePageClient from "./ComparePageClient";
import { getComparisonData, getAllCameras } from "@/lib/queries";

export const metadata: Metadata = {
  title: "카메라 비교 — 카메라스펙 리뷰",
  description:
    "카메라 사양을 나란히 비교해 보세요. 화소수, 오토포커스, 동영상, 무게, 가격 등을 비교하여 최적의 카메라를 찾아보세요.",
};

interface ComparePageProps {
  searchParams: Promise<{ cameras?: string }>;
}

/**
 * Server Component wrapper that:
 * 1. Reads ?cameras=slug1,slug2 from URL query params
 * 2. Pre-fetches comparison data from Prisma
 * 3. Passes all cameras list for the selector
 * 4. Renders the client comparison UI
 */
export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = await searchParams;
  const slugParam = params.cameras || "";
  const slugs = slugParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Pre-fetch comparison data if slugs provided via URL
  const preloadedCameras =
    slugs.length > 0 ? await getComparisonData(slugs) : [];

  // Fetch all cameras for the selector's initial state
  const allCameras = await getAllCameras();

  return (
    <ComparePageClient
      preloadedCameras={preloadedCameras}
      allCameras={allCameras}
    />
  );
}
