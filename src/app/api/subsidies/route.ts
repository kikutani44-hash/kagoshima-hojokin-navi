import { NextRequest, NextResponse } from "next/server";

import { type CategoryId } from "@/lib/categories";
import { fetchEligibleSubsidies } from "@/lib/jgrants";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const VALID_CATEGORIES = new Set<CategoryId>([
  "all",
  "映像制作",
  "デザイン",
  "ホームページ制作",
  "AIコンサル",
  "広告",
]);

export async function GET(request: NextRequest) {
  const keyword = request.nextUrl.searchParams.get("keyword") ?? undefined;
  const categoryParam = request.nextUrl.searchParams.get("category") ?? "all";
  const category = VALID_CATEGORIES.has(categoryParam as CategoryId)
    ? (categoryParam as CategoryId)
    : "all";

  if (keyword && keyword.trim().length > 0 && keyword.trim().length < 2) {
    return NextResponse.json(
      {
        error: "キーワードは2文字以上で入力してください。",
      },
      { status: 400 },
    );
  }

  try {
    const subsidies = await fetchEligibleSubsidies({ keyword, category });

    return NextResponse.json({
      count: subsidies.length,
      updatedAt: new Date().toISOString(),
      subsidies,
    });
  } catch (error) {
    console.error("Failed to fetch subsidies from JGrants:", error);

    return NextResponse.json(
      {
        error: "補助金データの取得に失敗しました。時間をおいて再度お試しください。",
      },
      { status: 502 },
    );
  }
}
