import {
  BROAD_API_KEYWORDS,
  CATEGORY_KEYWORDS,
  type CategoryId,
  type ScopeTag,
  type Subsidy,
  TARGET_AREAS,
} from "./categories";

const JGRANTS_API_BASE = "https://api.jgrants-portal.go.jp/exp/v1/public";
const LIST_REQUEST_DELAY_MS = 120;
const MAX_CANDIDATES = 40;
const DETAIL_BATCH_SIZE = 6;
const CACHE_TTL_MS = 5 * 60 * 1000;

type JGrantsListItem = {
  id: string;
  title: string;
  name?: string;
  subsidy_max_limit?: number;
  acceptance_end_datetime?: string;
  acceptance_start_datetime?: string;
  target_area_search?: string;
  target_number_of_employees?: string;
  institution_name?: string | null;
};

type JGrantsListResponse = {
  metadata?: {
    resultset?: {
      count?: number;
    };
  };
  result?: JGrantsListItem[];
};

type JGrantsDetailItem = {
  id: string;
  title: string;
  detail?: string;
  subsidy_catch_phrase?: string;
  use_purpose?: string;
  subsidy_max_limit?: number;
  acceptance_end_datetime?: string;
  target_number_of_employees?: string;
  institution_name?: string | null;
  front_subsidy_detail_page_url?: string;
  inquiry_url?: string | null;
};

type JGrantsDetailResponse = {
  result?: JGrantsDetailItem[];
};

type SearchOptions = {
  keyword: string;
  targetAreaSearch?: string;
};

type CacheEntry = {
  key: string;
  expiresAt: number;
  data: Subsidy[];
};

let responseCache: CacheEntry | null = null;
const detailCache = new Map<string, JGrantsDetailItem | undefined>();

function buildSearchUrl({ keyword, targetAreaSearch }: SearchOptions) {
  const params = new URLSearchParams({
    keyword,
    sort: "acceptance_end_datetime",
    order: "ASC",
    acceptance: "1",
  });

  if (targetAreaSearch) {
    params.set("target_area_search", targetAreaSearch);
  }

  return `${JGRANTS_API_BASE}/subsidies?${params.toString()}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isEligibleForKagoshimaCompany(area?: string) {
  if (!area) {
    return false;
  }

  const normalized = area.replace(/\s/g, "");

  if (normalized === "全国") {
    return true;
  }

  if (normalized.includes("鹿児島")) {
    return true;
  }

  const parts = area
    .split(/[\/／]/)
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.includes("全国") || parts.some((part) => part.includes("鹿児島"));
}

export function mapScopeTag(area: string, title: string): ScopeTag {
  const parts = area
    .split(/[\/／]/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (title.includes("鹿児島市") || parts.some((part) => part === "鹿児島市")) {
    return "鹿児島市";
  }

  if (parts.length === 1 && parts[0] === "鹿児島県") {
    return "鹿児島県";
  }

  if (
    parts.length <= 2 &&
    parts.every((part) => part.includes("鹿児島")) &&
    !parts.includes("全国")
  ) {
    return parts.some((part) => part.includes("市")) ? "鹿児島市" : "鹿児島県";
  }

  return "全国利用可";
}

export function detectCategory(
  purposeDetailText: string,
): Exclude<CategoryId, "all"> | null {
  const normalizedText = purposeDetailText.toLowerCase();

  const scores = Object.entries(CATEGORY_KEYWORDS).map(([category, keywords]) => {
    const score = keywords.reduce((total, keyword) => {
      return normalizedText.includes(keyword.toLowerCase()) ? total + 1 : total;
    }, 0);

    return { category: category as Exclude<CategoryId, "all">, score };
  });

  scores.sort((a, b) => b.score - a.score);

  return scores[0]?.score > 0 ? scores[0].category : null;
}

function stripHtml(html?: string) {
  if (!html) {
    return "";
  }

  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildPurposeDetailText(
  item: JGrantsListItem,
  detail?: JGrantsDetailItem,
) {
  return [
    detail?.use_purpose,
    detail?.subsidy_catch_phrase,
    stripHtml(detail?.detail),
    item.title,
    item.institution_name,
  ]
    .filter(Boolean)
    .join(" ");
}

function formatAmount(amount?: number) {
  if (amount == null) {
    return "上限額未設定";
  }

  if (amount >= 100000000) {
    return `最大${Math.round(amount / 100000000)}億円`;
  }

  if (amount >= 10000) {
    return `最大${Math.round(amount / 10000).toLocaleString("ja-JP")}万円`;
  }

  return `最大${amount.toLocaleString("ja-JP")}円`;
}

function formatDeadline(datetime?: string) {
  if (!datetime) {
    return "要確認";
  }

  return new Date(datetime).toLocaleString("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  });
}

async function fetchJson<T>(url: string, attempt = 0): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (response.status === 429 && attempt < 3) {
    await sleep(1000 * (attempt + 1));
    return fetchJson<T>(url, attempt + 1);
  }

  if (!response.ok) {
    throw new Error(`JGrants API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function searchSubsidies(options: SearchOptions) {
  const data = await fetchJson<JGrantsListResponse>(buildSearchUrl(options));
  return data.result ?? [];
}

async function fetchSubsidyDetail(id: string) {
  if (detailCache.has(id)) {
    return detailCache.get(id);
  }

  const data = await fetchJson<JGrantsDetailResponse>(
    `${JGRANTS_API_BASE}/subsidies/id/${encodeURIComponent(id)}`,
  );
  const detail = data.result?.[0];
  detailCache.set(id, detail);
  return detail;
}

function buildApiSearchKeywords(keyword?: string, category?: CategoryId) {
  const normalizedKeyword = keyword?.trim() ?? "";

  if (normalizedKeyword.length >= 2) {
    return [normalizedKeyword];
  }

  if (category && category !== "all") {
    return Array.from(
      new Set([
        ...BROAD_API_KEYWORDS.slice(0, 4),
        ...CATEGORY_KEYWORDS[category].slice(0, 3),
      ]),
    );
  }

  return [...BROAD_API_KEYWORDS];
}

function matchesKeyword(text: string, keyword: string) {
  return text.toLowerCase().includes(keyword.toLowerCase());
}

function matchesCategoryInPurposeDetail(
  purposeDetailText: string,
  category: Exclude<CategoryId, "all">,
) {
  return CATEGORY_KEYWORDS[category].some((keyword) =>
    matchesKeyword(purposeDetailText, keyword),
  );
}

function matchesSelectedCategory(
  purposeDetailText: string,
  category?: CategoryId,
) {
  if (!category || category === "all") {
    return detectCategory(purposeDetailText) !== null;
  }

  return matchesCategoryInPurposeDetail(purposeDetailText, category);
}

function transformWithDetail(
  item: JGrantsListItem,
  detail: JGrantsDetailItem | undefined,
  options: {
    userKeyword?: string;
    selectedCategory?: CategoryId;
  },
): Subsidy | null {
  const area = item.target_area_search ?? "";

  if (!isEligibleForKagoshimaCompany(area)) {
    return null;
  }

  const purposeDetailText = buildPurposeDetailText(item, detail);

  if (options.userKeyword) {
    if (!matchesKeyword(purposeDetailText, options.userKeyword)) {
      return null;
    }
  } else if (!matchesSelectedCategory(purposeDetailText, options.selectedCategory)) {
    return null;
  }

  const category =
    options.selectedCategory && options.selectedCategory !== "all"
      ? options.selectedCategory
      : detectCategory(purposeDetailText);

  if (!category) {
    return null;
  }

  const summary =
    detail?.subsidy_catch_phrase ||
    detail?.use_purpose ||
    stripHtml(detail?.detail).slice(0, 160) ||
    item.institution_name ||
    item.title;

  return {
    id: item.id,
    title: item.title,
    category,
    scope: mapScopeTag(area, item.title),
    amount: formatAmount(detail?.subsidy_max_limit ?? item.subsidy_max_limit),
    deadline: formatDeadline(
      detail?.acceptance_end_datetime ?? item.acceptance_end_datetime,
    ),
    target:
      detail?.target_number_of_employees ||
      item.target_number_of_employees ||
      "要確認",
    summary,
    url:
      detail?.front_subsidy_detail_page_url ||
      detail?.inquiry_url ||
      `https://www.jgrants-portal.go.jp/subsidy/${item.id}`,
  };
}

async function collectCandidates(apiKeywords: string[]) {
  const collected = new Map<string, JGrantsListItem>();

  for (const keyword of apiKeywords) {
    const searchTargets: Array<string | undefined> =
      keyword === "鹿児島" ? [undefined] : [...TARGET_AREAS];

    for (const targetAreaSearch of searchTargets) {
      const results = await searchSubsidies({ keyword, targetAreaSearch });

      for (const item of results) {
        if (!collected.has(item.id)) {
          collected.set(item.id, item);
        }
      }

      await sleep(LIST_REQUEST_DELAY_MS);
    }
  }

  return Array.from(collected.values()).slice(0, MAX_CANDIDATES);
}

async function processInBatches<T, R>(
  items: T[],
  batchSize: number,
  handler: (item: T) => Promise<R>,
) {
  const results: R[] = [];

  for (let index = 0; index < items.length; index += batchSize) {
    const batch = items.slice(index, index + batchSize);
    const batchResults = await Promise.all(batch.map(handler));
    results.push(...batchResults);
  }

  return results;
}

export async function fetchEligibleSubsidies(options?: {
  keyword?: string;
  category?: CategoryId;
}) {
  const cacheKey = JSON.stringify({
    keyword: options?.keyword?.trim() ?? "",
    category: options?.category ?? "all",
  });

  if (responseCache && responseCache.key === cacheKey && responseCache.expiresAt > Date.now()) {
    return responseCache.data;
  }

  detailCache.clear();

  const userKeyword =
    options?.keyword && options.keyword.trim().length >= 2
      ? options.keyword.trim()
      : undefined;
  const apiKeywords = buildApiSearchKeywords(options?.keyword, options?.category);
  const candidates = await collectCandidates(apiKeywords);

  const transformed = await processInBatches(
    candidates,
    DETAIL_BATCH_SIZE,
    async (item) => {
      const detail = await fetchSubsidyDetail(item.id);
      return transformWithDetail(item, detail, {
        userKeyword,
        selectedCategory: options?.category,
      });
    },
  );

  const subsidies = transformed
    .filter((item): item is Subsidy => item !== null)
    .sort((a, b) => a.deadline.localeCompare(b.deadline, "ja"));

  responseCache = {
    key: cacheKey,
    expiresAt: Date.now() + CACHE_TTL_MS,
    data: subsidies,
  };

  return subsidies;
}
