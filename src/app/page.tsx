"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  CATEGORIES,
  type CategoryId,
  type ScopeTag,
  type Subsidy,
} from "@/lib/categories";

type SubsidiesResponse = {
  count: number;
  updatedAt: string;
  subsidies: Subsidy[];
};

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
  const [subsidies, setSubsidies] = useState<Subsidy[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadSubsidies = useCallback(async (options?: { isRefresh?: boolean }) => {
    if (options?.isRefresh) {
      setIsUpdating(true);
    } else {
      setIsLoading(true);
    }

    setErrorMessage(null);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 120000);

    try {
      const params = new URLSearchParams();

      if (keyword.trim().length >= 2) {
        params.set("keyword", keyword.trim());
      }

      if (selectedCategory !== "all") {
        params.set("category", selectedCategory);
      }

      const query = params.toString();
      const response = await fetch(
        query ? `/api/subsidies?${query}` : "/api/subsidies",
        { cache: "no-store", signal: controller.signal },
      );

      const rawText = await response.text();
      let data: SubsidiesResponse & { error?: string };

      try {
        data = JSON.parse(rawText) as SubsidiesResponse & { error?: string };
      } catch {
        throw new Error("サーバーから不正なレスポンスが返されました。");
      }

      if (!response.ok) {
        throw new Error(data.error ?? "補助金データの取得に失敗しました。");
      }

      setSubsidies(Array.isArray(data.subsidies) ? data.subsidies : []);
      setLastUpdated(new Date(data.updatedAt));
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setErrorMessage(
          "データ取得がタイムアウトしました。時間をおいて「情報を更新する」を押してください。",
        );
      } else {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "補助金データの取得に失敗しました。",
        );
      }
    } finally {
      window.clearTimeout(timeoutId);
      setIsLoading(false);
      setIsUpdating(false);
    }
  }, [keyword, selectedCategory]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSubsidies();
    }, 400);

    return () => window.clearTimeout(timer);
  }, [loadSubsidies]);

  const handleRefresh = async () => {
    await loadSubsidies({ isRefresh: true });
  };

  const filteredSubsidies = useMemo(() => {
    return subsidies.filter((subsidy) => {
      return selectedCategory === "all" || subsidy.category === selectedCategory;
    });
  }, [selectedCategory, subsidies]);

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
          <p className="mt-2 text-xs text-slate-400">
            データ提供：Jグランツ（デジタル庁）公式API
          </p>

          <div className="mt-5 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isUpdating || isLoading}
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
          <p className="mt-2 text-xs text-slate-400">
            2文字以上でJグランツAPIから再検索します
          </p>
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
              {isLoading ? "読み込み中..." : `${filteredSubsidies.length}件`}
            </span>
          </div>

          {errorMessage && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {isLoading ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">
              Jグランツから最新の募集中データを取得しています...
              <br />
              <span className="mt-2 inline-block text-xs">
                初回読み込みは30秒ほどかかる場合があります
              </span>
            </div>
          ) : filteredSubsidies.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">
              条件に一致する募集中の補助金は見つかりませんでした。
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
