/**
 * HRSJM Admin Web Application — Articles & Blogs Service
 * Connects to NestJS backend (/api/v1/blogs) with offline fallback.
 */
import { apiClient, ENDPOINTS } from '@/api';
import type {
  BlogListItem,
  BlogStatsSummary,
  CreateBlogFormState,
  BlogStatus,
} from '../types/blog.types';

export interface BackendBlogItem {
  id: string;
  title: string;
  slug?: string | null;
  excerpt: string;
  content?: string | null;
  category: string;
  status: BlogStatus;
  published_at: string;
  views: number;
  thumbnail_url?: string | null;
  author: string;
  tags?: string[] | null;
  featured: boolean;
  allow_comments: boolean;
  created_at: string;
  updated_at: string;
}

export interface BackendBlogsListResponse {
  items: BackendBlogItem[];
  stats: BlogStatsSummary;
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

export function mapBackendBlogToUi(item: BackendBlogItem): BlogListItem {
  const { date, time } = formatDateTimeDisplay(item.published_at);
  const contentArray =
    typeof item.content === 'string'
      ? item.content.split('\n\n').filter((p) => p.trim().length > 0)
      : undefined;

  return {
    id: item.id,
    title: item.title,
    slug: item.slug || undefined,
    excerpt: item.excerpt,
    category: item.category,
    date,
    time,
    status: item.status,
    views: item.views || 0,
    thumbnailUrl: item.thumbnail_url,
    author: item.author,
    content: contentArray,
    tags: item.tags || undefined,
    featured: item.featured ?? false,
    allowComments: item.allow_comments ?? true,
  };
}

export const blogsService = {
  async list(params?: {
    status?: string;
    category?: string;
    search?: string;
  }): Promise<{ blogs: BlogListItem[]; stats: BlogStatsSummary }> {
    try {
      const data = await apiClient.get<BackendBlogsListResponse>(ENDPOINTS.blogs.list, {
        params: {
          status: params?.status && params.status !== 'ALL' ? params.status : undefined,
          category: params?.category && params.category !== 'ALL' ? params.category : undefined,
          search: params?.search?.trim() || undefined,
        },
      });

      const rawData = data as any;
      const items: BackendBlogItem[] = Array.isArray(data)
        ? data
        : (rawData?.items || rawData?.blogs || rawData?.data || []);
      return {
        blogs: items.map(mapBackendBlogToUi),
        stats: data?.stats || {
          total: items.length,
          published: items.filter((i) => i.status === 'PUBLISHED').length,
          drafts: items.filter((i) => i.status === 'DRAFT').length,
          archived: items.filter((i) => i.status === 'ARCHIVED').length,
        },
      };
    } catch (err) {
      console.warn('Backend blogs fetch failed, falling back:', err);
      throw err;
    }
  },

  async getById(id: string): Promise<BlogListItem> {
    const data = await apiClient.get<BackendBlogItem>(ENDPOINTS.blogs.getById(id));
    return mapBackendBlogToUi(data);
  },

  async create(form: CreateBlogFormState): Promise<BlogListItem> {
    const parsedTags = form.tagsText
      ? form.tagsText.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const payload = {
      title: form.title.trim(),
      slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      excerpt: form.shortDescription.trim(),
      content: form.content.trim(),
      category: form.category || 'General',
      status: form.status,
      published_at: new Date().toISOString(),
      author: form.author.trim() || 'HRSJM Admin',
      thumbnail_url: form.coverImageUri || undefined,
      tags: parsedTags,
      featured: form.featured,
      allow_comments: form.allowComments,
    };

    const data = await apiClient.post<BackendBlogItem>(ENDPOINTS.blogs.create, payload);
    return mapBackendBlogToUi(data);
  },

  async update(id: string, form: Partial<CreateBlogFormState> & { status?: BlogStatus }): Promise<BlogListItem> {
    const payload: Record<string, unknown> = {};
    if (form.title !== undefined) {
      payload.title = form.title.trim();
      payload.slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    if (form.shortDescription !== undefined) payload.excerpt = form.shortDescription.trim();
    if (form.content !== undefined) payload.content = form.content.trim();
    if (form.category !== undefined) payload.category = form.category;
    if (form.status !== undefined) payload.status = form.status;
    if (form.author !== undefined) payload.author = form.author.trim();
    if (form.coverImageUri !== undefined) payload.thumbnail_url = form.coverImageUri;
    if (form.tagsText !== undefined) {
      payload.tags = form.tagsText.split(',').map((t) => t.trim()).filter(Boolean);
    }
    if (form.featured !== undefined) payload.featured = form.featured;
    if (form.allowComments !== undefined) payload.allow_comments = form.allowComments;

    const data = await apiClient.patch<BackendBlogItem>(ENDPOINTS.blogs.update(id), payload);
    return mapBackendBlogToUi(data);
  },

  async delete(id: string): Promise<{ success: boolean }> {
    await apiClient.delete(ENDPOINTS.blogs.delete(id));
    return { success: true };
  },

  async recordView(id: string): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.blogs.recordView(id));
    } catch {
      // Non-critical metric
    }
  },
};
