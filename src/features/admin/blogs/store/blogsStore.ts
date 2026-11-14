/**
 * HRSJM Admin Web Application — Articles & Blogs Reactive Store
 * Built with cachedSnapshot for React 19 useSyncExternalStore compatibility.
 */
import type {
  BlogListItem,
  BlogStatsSummary,
  BlogStatus,
  CreateBlogFormState,
} from '../types/blog.types';
import { blogsService } from '../services/blogsService';

const STORAGE_KEY = 'hrsjm_local_blogs_v1';

class BlogsStore {
  private blogs: BlogListItem[] = [];
  private listeners: Set<() => void> = new Set();
  private version = 0;
  private cachedSnapshot: { blogs: BlogListItem[]; version: number };

  constructor() {
    this.blogs = this.loadPersisted();
    this.sortInternal();
    this.cachedSnapshot = {
      blogs: this.blogs,
      version: this.version,
    };
  }

  private sortInternal(): void {
    this.blogs.sort((a, b) => {
      const timeA = new Date(a.date || 0).getTime() || 0;
      const timeB = new Date(b.date || 0).getTime() || 0;
      return timeB - timeA;
    });
  }

  private loadPersisted(): BlogListItem[] {
    return [];
  }

  private persist(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.blogs));
      }
    } catch {
      // Ignore quota errors
    }
  }

  private notify(): void {
    this.version += 1;
    this.cachedSnapshot = {
      blogs: [...this.blogs],
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

  public getSnapshot = (): { blogs: BlogListItem[]; version: number } => {
    return this.cachedSnapshot;
  };

  public getAllBlogs(): BlogListItem[] {
    return [...this.blogs];
  }

  public getBlogById(id: string): BlogListItem | undefined {
    if (!id) return undefined;
    const clean = id.trim().toLowerCase();
    return this.blogs.find(
      (item) => item.id.toLowerCase() === clean || (item.slug && item.slug.toLowerCase() === clean)
    );
  }

  public getStats(): BlogStatsSummary {
    let published = 0;
    let drafts = 0;
    let archived = 0;

    for (const item of this.blogs) {
      if (item.status === 'PUBLISHED') published++;
      else if (item.status === 'DRAFT') drafts++;
      else if (item.status === 'ARCHIVED') archived++;
    }

    return {
      total: this.blogs.length,
      published,
      drafts,
      archived,
    };
  }

  public async fetchBlogs(): Promise<void> {
    try {
      const { blogs } = await blogsService.list();
      this.blogs = blogs || [];
      this.sortInternal();
      this.notify();
    } catch {
      // Keep local state on network error
    }
  }

  public async addBlog(form: CreateBlogFormState): Promise<BlogListItem> {
    const tempId = `b-${Date.now().toString(36)}`;
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

    const parsedTags = form.tagsText
      ? form.tagsText.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const localItem: BlogListItem = {
      id: tempId,
      title: form.title.trim(),
      slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      excerpt: form.shortDescription.trim(),
      content: form.content.split('\n\n').filter((p) => p.trim().length > 0),
      category: form.category || 'General',
      date: dateStr,
      time: timeStr,
      status: form.status,
      views: 0,
      thumbnailUrl:
        form.coverImageUri ||
        `https://picsum.photos/seed/hrsjm-blog-${Date.now()}/400/250`,
      author: form.author.trim() || 'HRSJM Admin',
      tags: parsedTags,
      featured: form.featured,
      allowComments: form.allowComments,
      targetAudience: form.targetAudience || 'ALL',
    };

    // Attempt backend first
    try {
      const created = await blogsService.create(form);
      this.blogs.unshift(created);
      this.notify();
      return created;
    } catch {
      // Fallback to local
      this.blogs.unshift(localItem);
      this.notify();
      return localItem;
    }
  }

  public async updateBlog(
    id: string,
    form: Partial<CreateBlogFormState> & { status?: BlogStatus }
  ): Promise<boolean> {
    const idx = this.blogs.findIndex((item) => item.id === id);
    if (idx === -1) return false;

    const current = this.blogs[idx];
    const parsedTags =
      form.tagsText !== undefined
        ? form.tagsText.split(',').map((t) => t.trim()).filter(Boolean)
        : current.tags;

    const updated: BlogListItem = {
      ...current,
      title: form.title !== undefined ? form.title.trim() : current.title,
      excerpt: form.shortDescription !== undefined ? form.shortDescription.trim() : current.excerpt,
      content:
        form.content !== undefined
          ? form.content.split('\n\n').filter((p) => p.trim().length > 0)
          : current.content,
      category: form.category !== undefined ? form.category || 'General' : current.category,
      status: form.status !== undefined ? form.status : current.status,
      thumbnailUrl:
        form.coverImageUri !== undefined ? form.coverImageUri : current.thumbnailUrl,
      author: form.author !== undefined ? form.author.trim() || 'HRSJM Admin' : current.author,
      tags: parsedTags,
      featured: form.featured !== undefined ? form.featured : current.featured,
      allowComments:
        form.allowComments !== undefined ? form.allowComments : current.allowComments,
      targetAudience:
        form.targetAudience !== undefined ? form.targetAudience : current.targetAudience,
    };

    this.blogs[idx] = updated;
    this.notify();

    // Backend sync
    try {
      await blogsService.update(id, form);
    } catch {
      // Local fallback handled
    }

    return true;
  }

  public async updateStatus(id: string, newStatus: BlogStatus): Promise<boolean> {
    const idx = this.blogs.findIndex((item) => item.id === id);
    if (idx === -1) return false;

    this.blogs[idx] = {
      ...this.blogs[idx],
      status: newStatus,
    };
    this.notify();

    try {
      await blogsService.update(id, { status: newStatus });
    } catch {
      // Fallback
    }

    return true;
  }

  public async deleteBlog(id: string): Promise<boolean> {
    const idx = this.blogs.findIndex((item) => item.id === id);
    if (idx === -1) return false;

    this.blogs.splice(idx, 1);
    this.notify();

    try {
      await blogsService.delete(id);
    } catch {
      // Local fallback
    }

    return true;
  }
}

export const blogsStore = new BlogsStore();

