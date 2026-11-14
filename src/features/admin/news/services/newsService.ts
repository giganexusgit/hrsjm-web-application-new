/**
 * HRSJM Admin Web Application — News & Press Service
 * Communicates with backend endpoints (/api/v1/news)
 * and provides offline fallback capabilities.
 */
import { apiClient, ENDPOINTS } from '@/api';
import type {
  NewsListItem,
  NewsStatsSummary,
  CreateNewsFormState,
  NewsStatus,
} from '../types/news.types';

export interface BackendNewsItem {
  id: string;
  title: string;
  slug?: string | null;
  summary: string;
  summary_detailed?: string | null;
  content?: string | null;
  category: string;
  status: NewsStatus;
  published_at: string;
  views: number;
  thumbnail_url?: string | null;
  author: string;
  tags?: string[] | null;
  highlights?: string[] | null;
  gallery?: string[] | null;
  allow_comments: boolean;
  created_at: string;
  updated_at: string;
}

export interface BackendNewsListResponse {
  items: BackendNewsItem[];
  stats: NewsStatsSummary;
  totalCount: number;
  page: number;
  limit: number;
}

export function formatDateTimeDisplay(dateIso: string): { date: string; time: string } {
  try {
    const d = new Date(dateIso);
    if (isNaN(d.getTime())) return { date: '28 Sep 2026', time: '12:00 PM' };
    const dateStr = d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timeStr = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return { date: dateStr, time: timeStr };
  } catch {
    return { date: '28 Sep 2026', time: '12:00 PM' };
  }
}

export function mapBackendNewsToUi(item: BackendNewsItem): NewsListItem {
  const { date, time } = formatDateTimeDisplay(item.published_at);
  const contentArray =
    typeof item.content === 'string'
      ? item.content.split('\n\n').filter((p) => p.trim().length > 0)
      : undefined;

  return {
    id: item.id,
    title: item.title,
    slug: item.slug || undefined,
    summary: item.summary,
    summaryDetailed: item.summary_detailed || item.summary,
    category: item.category,
    date,
    time,
    status: item.status,
    views: item.views || 0,
    thumbnailUrl: item.thumbnail_url,
    author: item.author,
    content: contentArray,
    highlights: item.highlights || undefined,
    gallery: item.gallery || undefined,
    tags: item.tags || undefined,
    allowComments: item.allow_comments ?? true,
    createdBy: (item as any).created_by ?? (item as any).createdBy ?? null,
  };
}

/**
 * Returns true only for news articles created via the Admin module (excludes DB-seeded fixtures).
 */
export function isAdminCreatedNews(item: NewsListItem): boolean {
  const idStr = String(item.id || '');
  if (idStr.startsWith('20000000-') || idStr.startsWith('news-')) return false;
  return Boolean(item.createdBy);
}

export const newsService = {
  async list(params?: {
    status?: string;
    category?: string;
    search?: string;
  }): Promise<{ news: NewsListItem[]; stats: NewsStatsSummary }> {
    try {
      const data = await apiClient.get<BackendNewsListResponse>(ENDPOINTS.news.list, {
        params: {
          status: params?.status && params.status !== 'ALL' ? params.status : undefined,
          category: params?.category && params.category !== 'ALL' ? params.category : undefined,
          search: params?.search?.trim() || undefined,
        },
      });

      const items = data?.items || [];
      return {
        news: items.map(mapBackendNewsToUi),
        stats: data?.stats || {
          total: items.length,
          published: items.filter((i) => i.status === 'PUBLISHED').length,
          drafts: items.filter((i) => i.status === 'DRAFT').length,
          archived: items.filter((i) => i.status === 'ARCHIVED').length,
        },
      };
    } catch (err) {
      console.warn('Backend news fetch failed, falling back:', err);
      throw err;
    }
  },

  async getById(id: string): Promise<NewsListItem> {
    const data = await apiClient.get<BackendNewsItem>(ENDPOINTS.news.getById(id));
    return mapBackendNewsToUi(data);
  },

  async create(form: CreateNewsFormState): Promise<NewsListItem> {
    let publishedAt: string;
    try {
      if (form.publishDate) {
        const timePart = form.publishTime || '09:00';
        const parsed = new Date(`${form.publishDate}T${timePart}:00`);
        publishedAt = isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
      } else {
        publishedAt = new Date().toISOString();
      }
    } catch {
      publishedAt = new Date().toISOString();
    }

    const payload = {
      title: form.headline.trim(),
      slug: form.slug?.trim() || form.headline.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      summary: form.summary.trim(),
      summary_detailed: form.summary.trim(),
      content: form.content.trim(),
      category: form.category || 'General',
      status: form.status,
      published_at: publishedAt,
      author: form.author ? form.author.trim() : 'HRSJM Admin',
      thumbnail_url: form.featuredImageUri || undefined,
      tags: form.tags,
      allow_comments: form.allowComments,
    };

    const data = await apiClient.post<BackendNewsItem>(ENDPOINTS.news.create, payload);
    return mapBackendNewsToUi(data);
  },

  async update(id: string, form: Partial<CreateNewsFormState> & { status?: NewsStatus }): Promise<NewsListItem> {
    const payload: Record<string, unknown> = {};
    if (form.headline !== undefined) payload.title = form.headline.trim();
    if (form.slug !== undefined) payload.slug = form.slug.trim() || undefined;
    if (form.summary !== undefined) {
      payload.summary = form.summary.trim();
      payload.summary_detailed = form.summary.trim();
    }
    if (form.content !== undefined) payload.content = form.content.trim();
    if (form.category !== undefined) payload.category = form.category;
    if (form.status !== undefined) payload.status = form.status;
    if (form.author !== undefined) payload.author = form.author ? form.author.trim() : 'HRSJM Admin';
    if (form.featuredImageUri !== undefined) payload.thumbnail_url = form.featuredImageUri;
    if (form.tags !== undefined) payload.tags = form.tags;
    if (form.allowComments !== undefined) payload.allow_comments = form.allowComments;

    const data = await apiClient.patch<BackendNewsItem>(ENDPOINTS.news.update(id), payload);
    return mapBackendNewsToUi(data);
  },

  async delete(id: string): Promise<{ success: boolean }> {
    await apiClient.delete(ENDPOINTS.news.delete(id));
    return { success: true };
  },

  async recordView(id: string): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.news.recordView(id));
    } catch {
      // Non-critical metric
    }
  },
};
