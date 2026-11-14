/**
 * HRSJM Admin Web Application — News & Press Reactive Store
 * Built with cachedSnapshot for React 19 useSyncExternalStore compatibility.
 */
import type {
  NewsListItem,
  NewsStatsSummary,
  NewsStatus,
  CreateNewsFormState,
} from '../types/news.types';
import { newsService, isAdminCreatedNews } from '../services/newsService';

const STORAGE_KEY = 'hrsjm_local_news_v1';

class NewsStore {
  private news: NewsListItem[] = [];
  private listeners: Set<() => void> = new Set();
  private version = 0;
  private cachedSnapshot: { news: NewsListItem[]; version: number };

  constructor() {
    this.news = this.loadPersisted();
    this.sortInternal();
    this.cachedSnapshot = {
      news: this.news,
      version: this.version,
    };
  }

  private sortInternal(): void {
    this.news.sort((a, b) => {
      const timeA = new Date(a.date || 0).getTime() || 0;
      const timeB = new Date(b.date || 0).getTime() || 0;
      return timeB - timeA;
    });
  }

  private loadPersisted(): NewsListItem[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
    return [];
  }

  private persist(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.news));
      }
    } catch {
      // Ignore quota errors
    }
  }

  private notify(): void {
    this.version += 1;
    this.cachedSnapshot = {
      news: [...this.news],
      version: this.version,
    };
    this.persist();
    this.listeners.forEach((listener) => listener());
  }

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  public getSnapshot = (): { news: NewsListItem[]; version: number } => {
    return this.cachedSnapshot;
  };

  public getAllNews(): NewsListItem[] {
    return [...this.news];
  }

  public getNewsById(id: string): NewsListItem | undefined {
    if (!id) return undefined;
    const clean = id.trim().toLowerCase();
    return this.news.find(
      (item) => item.id.toLowerCase() === clean || (item.slug && item.slug.toLowerCase() === clean)
    );
  }

  public getStats(): NewsStatsSummary {
    let published = 0;
    let drafts = 0;
    let archived = 0;

    for (const item of this.news) {
      if (item.status === 'PUBLISHED') published++;
      else if (item.status === 'DRAFT') drafts++;
      else if (item.status === 'ARCHIVED') archived++;
    }

    return {
      total: this.news.length,
      published,
      drafts,
      archived,
    };
  }

  public async fetchNews(): Promise<void> {
    try {
      const { news } = await newsService.list();
      if (Array.isArray(news)) {
        this.news = news.filter(isAdminCreatedNews);
        this.sortInternal();
        this.notify();
      }
    } catch {
      // Keep local state on network error
    }
  }

  public async addNews(form: CreateNewsFormState): Promise<NewsListItem> {
    const tempId = `n-${Date.now().toString(36)}`;
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const localItem: NewsListItem = {
      id: tempId,
      title: form.headline.trim(),
      slug: form.slug?.trim() || form.headline.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      summary: form.summary.trim(),
      summaryDetailed: form.summary.trim(),
      content: form.content.split('\n\n').filter((p) => p.trim().length > 0),
      category: form.category || 'General',
      date: form.publishDate || dateStr,
      time: form.publishTime || timeStr,
      status: form.status,
      views: 0,
      thumbnailUrl:
        form.featuredImageUri ||
        `https://picsum.photos/seed/hrsjm-news-${Date.now()}/400/250`,
      author: form.author || 'HRSJM Team',
      tags: form.tags,
      allowComments: form.allowComments,
      targetAudience: form.targetAudience || 'ALL',
    };

    // Attempt backend first
    try {
      const created = await newsService.create(form);
      this.news.unshift(created);
      this.notify();
      return created;
    } catch {
      // Fallback to local
      this.news.unshift(localItem);
      this.notify();
      return localItem;
    }
  }

  public async updateNews(
    id: string,
    form: Partial<CreateNewsFormState> & { status?: NewsStatus }
  ): Promise<boolean> {
    const idx = this.news.findIndex((item) => item.id === id);
    if (idx === -1) return false;

    const current = this.news[idx];
    const updated: NewsListItem = {
      ...current,
      title: form.headline !== undefined ? form.headline.trim() : current.title,
      slug: form.slug !== undefined ? form.slug.trim() : current.slug,
      summary: form.summary !== undefined ? form.summary.trim() : current.summary,
      summaryDetailed: form.summary !== undefined ? form.summary.trim() : current.summaryDetailed,
      content:
        form.content !== undefined
          ? form.content.split('\n\n').filter((p) => p.trim().length > 0)
          : current.content,
      category: form.category !== undefined ? form.category || 'General' : current.category,
      status: form.status !== undefined ? form.status : current.status,
      thumbnailUrl:
        form.featuredImageUri !== undefined ? form.featuredImageUri : current.thumbnailUrl,
      author: form.author !== undefined ? form.author || 'HRSJM Team' : current.author,
      tags: form.tags !== undefined ? form.tags : current.tags,
      allowComments:
        form.allowComments !== undefined ? form.allowComments : current.allowComments,
      targetAudience:
        form.targetAudience !== undefined ? form.targetAudience : current.targetAudience,
    };

    this.news[idx] = updated;
    this.notify();

    // Backend sync
    try {
      await newsService.update(id, form);
    } catch {
      // Local fallback handled
    }

    return true;
  }

  public async updateStatus(id: string, newStatus: NewsStatus): Promise<boolean> {
    const idx = this.news.findIndex((item) => item.id === id);
    if (idx === -1) return false;

    this.news[idx] = {
      ...this.news[idx],
      status: newStatus,
    };
    this.notify();

    try {
      await newsService.update(id, { status: newStatus });
    } catch {
      // Fallback
    }

    return true;
  }

  public async deleteNews(id: string): Promise<boolean> {
    const idx = this.news.findIndex((item) => item.id === id);
    if (idx === -1) return false;

    this.news.splice(idx, 1);
    this.notify();

    try {
      await newsService.delete(id);
    } catch {
      // Local fallback
    }

    return true;
  }
}

export const newsStore = new NewsStore();
