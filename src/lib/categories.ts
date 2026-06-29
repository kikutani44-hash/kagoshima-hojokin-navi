export type CategoryId =
  | "all"
  | "映像制作"
  | "デザイン"
  | "ホームページ制作"
  | "AIコンサル"
  | "広告";

export type ScopeTag = "全国利用可" | "鹿児島県" | "鹿児島市";

export type Subsidy = {
  id: string;
  title: string;
  category: Exclude<CategoryId, "all">;
  scope: ScopeTag;
  amount: string;
  deadline: string;
  target: string;
  summary: string;
  url: string;
};

export type Category = {
  id: CategoryId;
  label: string;
  icon: string;
};

export const CATEGORIES: Category[] = [
  { id: "all", label: "すべて", icon: "" },
  { id: "映像制作", label: "映像制作", icon: "🎬" },
  { id: "デザイン", label: "デザイン", icon: "🎨" },
  { id: "ホームページ制作", label: "ホームページ制作", icon: "🌐" },
  { id: "AIコンサル", label: "AIコンサル", icon: "🤖" },
  { id: "広告", label: "広告", icon: "📢" },
];

/** カテゴリボタン選択時に、対象用途・詳細説明へ横断検索するキーワード */
export const CATEGORY_KEYWORDS: Record<
  Exclude<CategoryId, "all">,
  string[]
> = {
  映像制作: ["映像", "動画", "撮影", "編集", "PR", "プロモーション"],
  デザイン: ["デザイン", "グラフィック", "ロゴ", "ブランディング", "パンフレット"],
  ホームページ制作: ["ホームページ", "Web", "サイト", "ECサイト", "LP"],
  AIコンサル: ["AI", "人工知能", "DX", "デジタル化", "自動化"],
  広告: ["広告", "PR", "宣伝", "チラシ", "SNS", "マーケティング", "販路"],
};

/** JGrants一覧APIで候補を広く集めるためのキーワード */
export const BROAD_API_KEYWORDS = [
  "鹿児島",
  "小規模",
  "持続化",
  "IT",
  "ものづくり",
  "販路",
] as const;

/** 全国向け補助金を絞り込む際の対象地域（一覧API用） */
export const TARGET_AREAS = ["全国"] as const;
