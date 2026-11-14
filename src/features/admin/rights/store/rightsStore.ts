import type {
  RightsArticle,
  RightsArticleFormState,
  RightsStatsSummary,
  RightsStatus,
} from '../types/rights.types';
import { rightsService } from '../services/rightsService';

const STORAGE_KEY = 'hrsjm_local_rights_v1';

class RightsStore {
  private articles: RightsArticle[] = [];
  private listeners: Set<() => void> = new Set();
  private version = 0;
  private cachedSnapshot: { articles: RightsArticle[]; version: number };

  constructor() {
    this.articles = this.loadPersisted();
    this.cachedSnapshot = {
      articles: this.articles,
      version: this.version,
    };
    this.syncFromBackend();
  }

  private loadPersisted(): RightsArticle[] {
    return [];
  }

  private persist(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.articles));
      }
    } catch {
      // Ignore quota errors
    }
  }

  private notify(): void {
    this.version += 1;
    this.cachedSnapshot = {
      articles: [...this.articles],
      version: this.version,
    };
    this.persist();
    this.listeners.forEach((l) => l());
  }

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  public getSnapshot = (): { articles: RightsArticle[]; version: number } => {
    return this.cachedSnapshot;
  };

  public getAll(): RightsArticle[] {
    return [...this.articles];
  }

  public getById(id: string): RightsArticle | undefined {
    return this.articles.find((a) => a.id === id);
  }

  public getStats(): RightsStatsSummary {
    const total = this.articles.length;
    const published = this.articles.filter((a) => a.status === 'PUBLISHED').length;
    const drafts = this.articles.filter((a) => a.status === 'DRAFT').length;
    const archived = this.articles.filter((a) => a.status === 'ARCHIVED').length;
    return { total, published, drafts, archived };
  }

  public async fetchRights(): Promise<void> {
    return this.syncFromBackend();
  }

  public async syncFromBackend(): Promise<void> {
    try {
      const { items } = await rightsService.list();
      this.articles = items || [];
      this.notify();
    } catch {
      // Keep state
    }
  }

  public async create(form: RightsArticleFormState): Promise<RightsArticle> {
    const created = await rightsService.create(form);
    this.articles = [created, ...this.articles];
    this.notify();
    return created;
  }

  public async update(
    id: string,
    form: Partial<Omit<RightsArticleFormState, 'status'>> & { status?: RightsStatus },
  ): Promise<RightsArticle | null> {
    const idx = this.articles.findIndex((a) => a.id === id);
    if (idx === -1) return null;

    const existing = this.articles[idx];
    const now = new Date();
    const updated: RightsArticle = {
      ...existing,
      title: form.title ?? existing.title,
      description: form.shortDescription ?? existing.description,
      content: form.content
        ? form.content.split('\n\n').filter(Boolean)
        : existing.content,
      category: form.category ?? existing.category,
      status: form.status ?? existing.status,
      thumbnailUrl: form.coverImageUri !== undefined ? form.coverImageUri : existing.thumbnailUrl,
      author: form.author ?? existing.author,
      tags: form.tags ?? existing.tags,
      featured: form.featured !== undefined ? form.featured : existing.featured,
      allowComments: form.allowComments !== undefined ? form.allowComments : existing.allowComments,
      targetAudience: form.targetAudience !== undefined ? form.targetAudience : existing.targetAudience,
      lastUpdatedDate: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      lastUpdatedTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };

    this.articles[idx] = updated;
    this.notify();

    rightsService.update(id, form).catch(() => {});
    return updated;
  }

  public async delete(id: string): Promise<boolean> {
    this.articles = this.articles.filter((a) => a.id !== id);
    this.notify();
    rightsService.delete(id).catch(() => {});
    return true;
  }

  public async updateStatus(id: string, status: RightsStatus): Promise<void> {
    const target = this.getById(id);
    if (!target) return;
    await this.update(id, { status });
  }

  public async incrementViews(id: string): Promise<void> {
    const target = this.getById(id);
    if (!target) return;
    target.views += 1;
    this.notify();
    rightsService.incrementViews(id).catch(() => {});
  }
}

export const rightsStore = new RightsStore();

