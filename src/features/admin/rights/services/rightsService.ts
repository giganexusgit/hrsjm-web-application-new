import { apiClient, ENDPOINTS } from '@/api';
import type {
  RightsArticle,
  RightsArticleFormState,
  RightsHighlight,
  RightsStatsSummary,
  RightsStatus,
} from '../types/rights.types';

export interface BackendRightItem {
  id: string;
  title: string;
  slug?: string | null;
  description: string;
  content?: string | null;
  category: string;
  category_label?: string | null;
  legal_reference?: string | null;
  highlights?: string | null;
  icon?: string | null;
  color?: string | null;
  icon_color?: string | null;
  badge_bg?: string | null;
  status: RightsStatus;
  published_at?: string;
  views: number;
  thumbnail_url?: string | null;
  author?: string;
  author_role?: string | null;
  organization?: string | null;
  tags?: string[] | null;
  featured?: boolean;
  allow_comments?: boolean;
  created_at?: string;
  updated_at?: string;
}

const formatDateDisplay = (dateIso?: string): { date: string; time: string } => {
  try {
    const d = dateIso ? new Date(dateIso) : new Date();
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
};

export const mapBackendRightToUi = (item: BackendRightItem): RightsArticle => {
  const { date, time } = formatDateDisplay(item.published_at || item.created_at);

  const contentArray: string[] =
    typeof item.content === 'string'
      ? item.content.split('\n\n').filter((p) => p.trim().length > 0)
      : [item.description || ''];

  let parsedHighlights: RightsHighlight[] = [];
  if (typeof item.highlights === 'string' && item.highlights.trim()) {
    parsedHighlights = item.highlights
      .split(',')
      .map((h) => h.trim())
      .filter((h) => h.length > 0)
      .map((text) => ({
        title: text,
        description: text,
      }));
  }
  if (parsedHighlights.length === 0) {
    parsedHighlights = [
      { title: item.title, description: item.description || '' },
    ];
  }

  return {
    id: item.id,
    title: item.title,
    description: item.description || '',
    category: item.category || 'Constitutional',
    lastUpdatedDate: date,
    lastUpdatedTime: time,
    status: item.status || 'PUBLISHED',
    views: item.views || 0,
    thumbnailUrl: item.thumbnail_url || undefined,
    author: item.author || 'HRSJM Legal Cell',
    authorRole: item.author_role || 'Constitutional Counsel',
    organization: item.organization || 'HRSJM',
    content: contentArray.length > 0 ? contentArray : [item.description || ''],
    highlights: parsedHighlights,
    tags: item.tags || ['Human Rights', 'Constitution', 'Rights'],
    featured: Boolean(item.featured),
    allowComments: item.allow_comments !== false,
  };
};

export const rightsService = {
  async list(params?: {
    status?: string;
    category?: string;
    dateRange?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: RightsArticle[]; stats?: RightsStatsSummary; total: number }> {
    try {
      const data = await apiClient.get<any>(ENDPOINTS.rights.list, {
        params: {
          status: params?.status && params.status !== 'ALL' ? params.status : undefined,
          category: params?.category,
          dateRange: params?.dateRange && params.dateRange !== 'ANY' ? params.dateRange : undefined,
          search: params?.search?.trim() || undefined,
          page: params?.page,
          limit: params?.limit,
        },
      });

      const rawItems: BackendRightItem[] = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
          ? data
          : [];

      return {
        items: rawItems.map(mapBackendRightToUi),
        stats: data?.stats,
        total: data?.totalCount ?? data?.total ?? rawItems.length,
      };
    } catch {
      return {
        items: [],
        total: 0,
      };
    }
  },

  async getById(id: string): Promise<RightsArticle | null> {
    try {
      const data = await apiClient.get<BackendRightItem>(ENDPOINTS.rights.getById(id));
      return mapBackendRightToUi(data);
    } catch {
      return null;
    }
  },

  async create(form: RightsArticleFormState): Promise<RightsArticle> {
    const payload = {
      title: form.title.trim(),
      slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      description: form.shortDescription.trim(),
      content: form.content.trim(),
      category: form.category || 'Constitutional',
      category_label: form.category || 'Constitutional',
      highlights: form.tags.join(','),
      status: form.status,
      published_at: new Date().toISOString(),
      author: form.author ? form.author.trim() : 'HRSJM Legal Cell',
      thumbnail_url: form.coverImageUri || undefined,
      tags: form.tags,
      featured: form.featured,
      allow_comments: form.allowComments,
    };

    try {
      const data = await apiClient.post<BackendRightItem>(ENDPOINTS.rights.create, payload);
      return {
        ...mapBackendRightToUi(data),
        targetAudience: form.targetAudience || 'ALL',
      };
    } catch {
      const now = new Date();
      return {
        id: `r-${Date.now().toString(36)}`,
        title: form.title.trim(),
        description: form.shortDescription.trim(),
        content: form.content.split('\n\n').filter(Boolean),
        category: form.category || 'Constitutional',
        status: form.status,
        lastUpdatedDate: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        lastUpdatedTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        views: 0,
        author: form.author ? form.author.trim() : 'HRSJM Legal Cell',
        authorRole: 'Legal Advisor',
        organization: 'HRSJM',
        thumbnailUrl: form.coverImageUri || undefined,
        highlights: [{ title: form.title.trim(), description: form.shortDescription.trim() }],
        tags: form.tags,
        featured: form.featured,
        allowComments: form.allowComments,
        targetAudience: form.targetAudience || 'ALL',
      };
    }
  },

  async update(
    id: string,
    form: Partial<Omit<RightsArticleFormState, 'status'>> & { status?: RightsStatus }
  ): Promise<RightsArticle> {
    const payload: Record<string, unknown> = {};
    if (form.title !== undefined) payload.title = form.title.trim();
    if (form.shortDescription !== undefined) payload.description = form.shortDescription.trim();
    if (form.content !== undefined) payload.content = form.content.trim();
    if (form.category !== undefined) {
      payload.category = form.category;
      payload.category_label = form.category;
    }
    if (form.status !== undefined) payload.status = form.status;
    if (form.author !== undefined) payload.author = form.author ? form.author.trim() : 'HRSJM Legal Cell';
    if (form.coverImageUri !== undefined) payload.thumbnail_url = form.coverImageUri;
    if (form.tags !== undefined) {
      payload.tags = form.tags;
      payload.highlights = form.tags.join(',');
    }
    if (form.featured !== undefined) payload.featured = form.featured;
    if (form.allowComments !== undefined) payload.allow_comments = form.allowComments;

    const data = await apiClient.patch<BackendRightItem>(ENDPOINTS.rights.update(id), payload);
    return mapBackendRightToUi(data);
  },

  async delete(id: string): Promise<boolean> {
    await apiClient.delete(ENDPOINTS.rights.delete(id));
    return true;
  },

  async recordView(id: string): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.rights.recordView(id));
    } catch {
      // non-critical
    }
  },

  async incrementViews(id: string): Promise<void> {
    return this.recordView(id);
  },
};
