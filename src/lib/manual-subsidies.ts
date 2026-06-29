import {
  getSubsidyCategories,
  type CategoryId,
  type Subsidy,
} from "./categories";

export const MANUAL_SUBSIDIES: Subsidy[] = [
  {
    id: "manual-kagoshima-export-support",
    title: "鹿児島県産品輸出支援補助金（ECサイト・PR動画・Web多言語化）",
    category: "映像制作",
    categories: ["映像制作", "ホームページ制作", "広告"],
    scope: "鹿児島県",
    tags: ["随時受付"],
    amount: "最大50万円（補助率1/2以内）",
    deadline: "随時受付（予算終了次第締切）",
    target: "鹿児島県内で県産品の輸出に取り組む事業者",
    summary:
      "ECサイト出店、自社ホームページ多言語化、PR動画制作、WEBカタログ作成",
    url: "https://www.pref.kagoshima.jp",
  },
];

function matchesKeyword(subsidy: Subsidy, keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase();
  const text = [
    subsidy.title,
    subsidy.summary,
    subsidy.target,
    subsidy.amount,
    subsidy.deadline,
    ...getSubsidyCategories(subsidy),
    ...(subsidy.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();

  return text.includes(normalizedKeyword);
}

export function filterManualSubsidies(options?: {
  keyword?: string;
  category?: CategoryId;
}): Subsidy[] {
  const userKeyword =
    options?.keyword && options.keyword.trim().length >= 2
      ? options.keyword.trim()
      : undefined;

  return MANUAL_SUBSIDIES.filter((subsidy) => {
    const categories = getSubsidyCategories(subsidy);

    if (options?.category && options.category !== "all") {
      if (!categories.includes(options.category)) {
        return false;
      }
    }

    if (userKeyword && !matchesKeyword(subsidy, userKeyword)) {
      return false;
    }

    return true;
  });
}
