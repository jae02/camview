import { NextResponse } from "next/server";
import { searchCameras } from "@/lib/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  if (query.length < 2) {
    return NextResponse.json([]);
  }

  const cameras = await searchCameras(query);
  return NextResponse.json(cameras);
}
