/**
 * HRSJM Admin Web Application — News & Press Types
 * Exact parity with React Native APK (hrsjm-application-ui/src/features/admin/content/news/types/news.types.ts)
 * and NestJS backend (HRSJM-back-api/src/modules/news/)
 */

export type NewsStatus = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';

export type NewsStatusFilter = 'ALL' | NewsStatus;

export interface NewsListItem {
  id: string;
  title: string;
  /** Short summary shown under the headline and on the details summary card. */
  summary: string;
  category: string;
  /** Display date (e.g. "28 Sep 2026"). */
  date: string;
  /** Display time (e.g. "04:30 PM"). */
  time: string;
  status: NewsStatus;
  /** Raw view count; formatted in UI (e.g. 1200 -> "1.2K"). */
  views: number;
  /** Featured image URL / thumbnail URL. */
  thumbnailUrl?: string | null;
  /** Author name (e.g. "HRSJM Team", "Admin"). */
  author?: string;
  /** Longer summary for the details summary card (falls back to `summary`). */
  summaryDetailed?: string;
  /** Article body paragraphs. */
  content?: string[];
  /** Bullet points / key highlights. */
  highlights?: string[];
  /** Gallery image URLs. */
  gallery?: string[];
  /** Discovery tags. */
  tags?: string[];
  /** URL slug */
  slug?: string;
  /** Public comments enabled */
  allowComments?: boolean;
  /** Role visibility target */
  targetAudience?: string;
  /** Admin user ID who created the article */
  createdBy?: string | null;
}

export interface NewsStatsSummary {
  total: number;
  published: number;
  drafts: number;
  archived: number;
}

export interface NewsFilterTab {
  key: NewsStatusFilter;
  label: string;
  count: number;
}

export interface NewsFilterState {
  status: NewsStatusFilter;
  category: string | null;
}

export interface CreateNewsFormState {
  headline: string;
  slug: string;
  summary: string;
  content: string;
  featuredImageUri: string | null;
  author: string | null;
  category: string | null;
  tags: string[];
  publishDate: string | null;
  publishTime: string | null;
  status: NewsStatus;
  allowComments: boolean;
  targetAudience?: string;
}

export type CreateNewsFieldErrors = Partial<Record<keyof CreateNewsFormState, string>>;

export const STATUS_META: Record<
  NewsStatus,
  { label: string; badgeBg: string; badgeColor: string; dotColor: string }
> = {
  PUBLISHED: {
    label: 'Published',
    badgeBg: '#DCFCE7',
    badgeColor: '#166534',
    dotColor: '#22C55E',
  },
  DRAFT: {
    label: 'Draft',
    badgeBg: '#FEF3C7',
    badgeColor: '#92400E',
    dotColor: '#F59E0B',
  },
  ARCHIVED: {
    label: 'Archived',
    badgeBg: '#F1F5F9',
    badgeColor: '#475569',
    dotColor: '#64748B',
  },
};

export const DEFAULT_NEWS_CATEGORIES: string[] = [
  'Legal',
  'Legal Update',
  'Relief Work',
  'Know Your Rights',
  'Awareness',
  'Environment',
  'Health',
  'Advocacy',
  'Human Rights',
  'General',
];

export const DEFAULT_NEWS_AUTHORS: string[] = [
  'HRSJM Team',
  'Admin',
  'National Executive Board',
  'Legal Cell',
  'Media & Communications',
];

export const formatViews = (views: number): string => {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return String(views);
};
