import { Metadata } from "next";
import { getAllCameras } from "@/lib/queries";
import CamerasPageClient from "./CamerasPageClient";

export const metadata: Metadata = {
  title: "전체 카메라 — 카메라스펙 리뷰",
  description:
    "133개 이상의 카메라 모델을 브랜드, 센서, 타입별로 검색하고 비교하세요. Sony, Canon, Nikon, Fujifilm 등 주요 브랜드의 전체 카메라 리스트.",
};

/**
 * /cameras — Full camera listing page with search and filters.
 * Server Component fetches all cameras, passes to client for interactivity.
 */
export default async function CamerasPage() {
  const cameras = await getAllCameras();

  return <CamerasPageClient cameras={cameras} />;
}
