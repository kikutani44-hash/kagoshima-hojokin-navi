"use client";

import { useMemo, useState } from "react";

type CategoryId =
  | "all"
  | "映像制作"
  | "デザイン"
  | "ホームページ制作"
  | "AIコンサル"
  | "広告";

type ScopeTag = "全国利用可" | "鹿児島県" | "鹿児島市";

type Subsidy = {
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

type Category = {
  id: CategoryId;
  label: string;
  icon: string;
};

const CATEGORIES: Category[] = [
  { id: "all", label: "すべて", icon: "" },
  { id: "映像制作", label: "映像制作", icon: "🎬" },
  { id: "デザイン", label: "デザイン", icon: "🎨" },
  { id: "ホームページ制作", label: "ホームページ制作", icon: "🌐" },
  { id: "AIコンサル", label: "AIコンサル", icon: "🤖" },
  { id: "広告", label: "広告", icon: "📢" },
];

const SUBSIDIES: Subsidy[] = [
  {
    id: "1",
    title: "鹿児島県PR映像制作支援事業",
    category: "映像制作",
    scope: "鹿児島県",
    amount: "最大80万円",
    deadline: "2026/3/31",
    target: "県内の中小企業・小規模事業者",
    summary:
      "商品・サービス紹介動画やPR映像の企画・撮影・編集費用を補助します。",
    url: "https://www.pref.kagoshima.jp/",
  },
  {
    id: "2",
    title: "鹿児島市店舗・施設紹介動画制作補助金",
    category: "映像制作",
    scope: "鹿児島市",
    amount: "最大50万円",
    deadline: "2026/4/15",
    target: "鹿児島市内の店舗・施設を運営する事業者",
    summary:
      "ドローン撮影やインタビュー動画など、集客につながる映像制作費を支援します。",
    url: "https://www.city.kagoshima.lg.jp/",
  },
  {
    id: "3",
    title: "ものづくり・商業・サービス革新補助金（映像・動画制作）",
    category: "映像制作",
    scope: "全国利用可",
    amount: "最大750万円",
    deadline: "2026/5/30",
    target: "全国の中小企業・小規模事業者",
    summary:
      "新商品・新サービスのPR動画制作やプロモーション映像の制作費用を補助します。",
    url: "https://portal.monodukuri-hojo.jp/",
  },
  {
    id: "4",
    title: "鹿児島県ロゴ・パンフレットデザイン支援事業",
    category: "デザイン",
    scope: "鹿児島県",
    amount: "最大30万円",
    deadline: "2026/2/28",
    target: "ブランディング強化を目指す県内中小企業",
    summary:
      "ロゴマーク、パンフレット、名刺等のデザイン制作費用を補助します。",
    url: "https://www.pref.kagoshima.jp/",
  },
  {
    id: "5",
    title: "鹿児島市店舗ビジュアルデザイン補助金",
    category: "デザイン",
    scope: "鹿児島市",
    amount: "最大40万円",
    deadline: "2026/5/20",
    target: "鹿児島市内で看板・メニュー等を刷新する事業者",
    summary:
      "看板デザイン、メニュー表、のぼり旗等のビジュアル制作費を支援します。",
    url: "https://www.city.kagoshima.lg.jp/",
  },
  {
    id: "6",
    title: "小規模事業者持続化補助金（販路開拓・広報費）",
    category: "デザイン",
    scope: "全国利用可",
    amount: "最大50万円",
    deadline: "2026/6/30",
    target: "全国の小規模事業者・小規模法人等",
    summary:
      "チラシ・パンフレット・看板等の販促物デザイン・制作費用を補助します。",
    url: "https://www.shokibo.or.jp/",
  },
  {
    id: "7",
    title: "鹿児島県ホームページリニューアル支援事業",
    category: "ホームページ制作",
    scope: "鹿児島県",
    amount: "最大60万円",
    deadline: "2026/3/15",
    target: "Webサイトの新規制作・改修を検討する県内事業者",
    summary:
      "コーポレートサイトやランディングページの制作・リニューアル費用を補助します。",
    url: "https://www.pref.kagoshima.jp/",
  },
  {
    id: "8",
    title: "鹿児島市ECサイト構築補助事業",
    category: "ホームページ制作",
    scope: "鹿児島市",
    amount: "最大100万円",
    deadline: "2026/6/30",
    target: "鹿児島市内でネットショップ開設を目指す事業者",
    summary:
      "ECサイトの構築、決済機能導入、商品ページ制作等のWeb制作費を支援します。",
    url: "https://www.city.kagoshima.lg.jp/",
  },
  {
    id: "9",
    title: "IT導入補助金（Webサイト・EC関連）",
    category: "ホームページ制作",
    scope: "全国利用可",
    amount: "最大450万円",
    deadline: "2026/4/30",
    target: "全国の中小企業・小規模事業者等",
    summary:
      "ホームページ制作、ECサイト構築、予約システム導入等のITツール導入費用を補助します。",
    url: "https://www.it-hojo.jp/",
  },
  {
    id: "10",
    title: "鹿児島県AI導入・活用コンサルティング支援事業",
    category: "AIコンサル",
    scope: "鹿児島県",
    amount: "最大70万円",
    deadline: "2026/4/30",
    target: "AI活用による業務改善を検討する県内中小企業",
    summary:
      "生成AIの業務導入支援、活用計画策定、コンサルティング費用を補助します。",
    url: "https://www.pref.kagoshima.jp/",
  },
  {
    id: "11",
    title: "鹿児島市生成AI業務効率化支援事業",
    category: "AIコンサル",
    scope: "鹿児島市",
    amount: "最大50万円",
    deadline: "2026/5/30",
    target: "鹿児島市内でAIツール導入を目指す事業者",
    summary:
      "ChatGPT等のAIツール導入支援、社内研修、運用設計のコンサル費用を支援します。",
    url: "https://www.city.kagoshima.lg.jp/",
  },
  {
    id: "12",
    title: "サービス等生産性向上IT導入支援事業（AI活用）",
    category: "AIコンサル",
    scope: "全国利用可",
    amount: "最大450万円",
    deadline: "2026/5/20",
    target: "全国のサービス業の中小企業等",
    summary:
      "AI・RPA等のITツール導入に伴うコンサルティング・研修費用を補助します。",
    url: "https://www.meti.go.jp/",
  },
  {
    id: "13",
    title: "鹿児島県中小企業広告宣伝費補助金",
    category: "広告",
    scope: "鹿児島県",
    amount: "最大50万円",
    deadline: "2026/3/15",
    target: "県内の中小企業・小規模事業者",
    summary:
      "新聞・雑誌・ラジオ・テレビ等の広告掲載費の一部を補助し、認知度向上を支援します。",
    url: "https://www.pref.kagoshima.jp/",
  },
  {
    id: "14",
    title: "鹿児島県内メディア広告掲載支援事業",
    category: "広告",
    scope: "鹿児島県",
    amount: "最大30万円",
    deadline: "2026/4/30",
    target: "県内メディアへの広告出稿を検討する事業者",
    summary:
      "県内新聞・地域FM・ケーブルテレビ等への広告掲載費を支援します。",
    url: "https://www.pref.kagoshima.jp/",
  },
  {
    id: "15",
    title: "鹿児島市WEB広告・SNS広告費補助事業",
    category: "広告",
    scope: "鹿児島市",
    amount: "最大40万円",
    deadline: "2026/5/20",
    target: "鹿児島市内でデジタル広告による集客強化を目指す事業者",
    summary:
      "検索連動型広告・SNS広告・動画広告等の運用費用を補助します。",
    url: "https://www.city.kagoshima.lg.jp/",
  },
  {
    id: "16",
    title: "ものづくり・商業・サービス革新補助金（宣伝広告費）",
    category: "広告",
    scope: "全国利用可",
    amount: "最大750万円",
    deadline: "2026/5/30",
    target: "全国の中小企業・小規模事業者",
    summary:
      "Web広告、SNS広告、テレビCM等の宣伝広告費用を補助します。",
    url: "https://portal.monodukuri-hojo.jp/",
  },
];

function getCategoryLabel(category: Exclude<CategoryId, "all">) {
  return CATEGORIES.find((item) => item.id === category)?.label ?? category;
}

function getCategoryIcon(category: Exclude<CategoryId, "all">) {
  return CATEGORIES.find((item) => item.id === category)?.icon ?? "📋";
}

function getScopeTagClassName(scope: ScopeTag) {
  switch (scope) {
    case "全国利用可":
      return "bg-sky-50 text-sky-700";
    case "鹿児島県":
      return "bg-emerald-50 text-emerald-700";
    case "鹿児島市":
      return "bg-violet-50 text-violet-700";
  }
}

function formatLastUpdated(date: Date) {
  return date.toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("all");
  const [keyword, setKeyword] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRefresh = async () => {
    setIsUpdating(true);
    // 将来はここでAPIからデータを取得する
    await new Promise((resolve) => setTimeout(resolve, 600));
    setLastUpdated(new Date());
    setIsUpdating(false);
  };

  const filteredSubsidies = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return SUBSIDIES.filter((subsidy) => {
      const matchesCategory =
        selectedCategory === "all" || subsidy.category === selectedCategory;

      const matchesKeyword =
        normalizedKeyword.length === 0 ||
        subsidy.title.toLowerCase().includes(normalizedKeyword) ||
        subsidy.summary.toLowerCase().includes(normalizedKeyword) ||
        subsidy.target.toLowerCase().includes(normalizedKeyword) ||
        subsidy.scope.includes(normalizedKeyword);

      return matchesCategory && matchesKeyword;
    });
  }, [keyword, selectedCategory]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <p className="mb-2 text-sm font-medium text-emerald-700">
            鹿児島守成みなみクリエイティ部
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            補助金・支援制度ナビ
          </h1>
          <p className="mt-3 text-slate-600">
            鹿児島県の企業が利用できる補助金を検索できます
          </p>

          <div className="mt-5 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isUpdating}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-5 py-2.5 text-sm font-medium text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              🔄 情報を更新する
            </button>
            {lastUpdated && (
              <p className="text-sm text-slate-500">
                最終更新：{formatLastUpdated(lastUpdated)}
              </p>
            )}
          </div>
        </header>

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label
            htmlFor="search"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            キーワード検索
          </label>
          <input
            id="search"
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="例：広告、映像、Web、AI..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none ring-emerald-500 transition focus:border-emerald-500 focus:ring-2"
          />
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">カテゴリ</h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => {
              const isActive = selectedCategory === category.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
                  }`}
                >
                  {category.icon && (
                    <span aria-hidden="true">{category.icon}</span>
                  )}
                  {category.label}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">補助金一覧</h2>
            <span className="text-sm text-slate-500">
              {filteredSubsidies.length}件
            </span>
          </div>

          {filteredSubsidies.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">
              条件に一致する補助金は見つかりませんでした。
            </div>
          ) : (
            <ul className="grid gap-4">
              {filteredSubsidies.map((subsidy) => (
                <li
                  key={subsidy.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getScopeTagClassName(subsidy.scope)}`}
                    >
                      {subsidy.scope}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                      <span aria-hidden="true">
                        {getCategoryIcon(subsidy.category)}
                      </span>
                      {getCategoryLabel(subsidy.category)}
                    </span>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                      {subsidy.amount}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900">
                    {subsidy.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {subsidy.summary}
                  </p>

                  <dl className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                    <div>
                      <dt className="font-medium text-slate-500">対象</dt>
                      <dd>{subsidy.target}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-500">申請期限</dt>
                      <dd>{subsidy.deadline}</dd>
                    </div>
                  </dl>

                  <a
                    href={subsidy.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    詳細を見る →
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
