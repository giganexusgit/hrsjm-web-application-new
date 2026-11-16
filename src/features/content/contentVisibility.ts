/**
 * HRSJM Centralised Content Management & Role-Based Visibility Engine
 *
 * Implements strict role-based visibility rules for centrally managed modules:
 * - Events
 * - News and Media
 * - Articles and Blogs
 * - Know Your Rights
 * - Broadcast Notifications
 *
 * Enforces:
 * 1. Admin is the single source of truth for creating, editing, and publishing content.
 * 2. Non-admin roles (Member, Donation Seeker, General User) NEVER see DRAFT or ARCHIVED content.
 * 3. Role-targeted content is visible strictly to authorized roles and Admin.
 */

import type { EventListItem } from '@/features/admin/events/types/events.types';
import type { NewsListItem } from '@/features/admin/news/types/news.types';
import type { BlogListItem } from '@/features/admin/blogs/types/blog.types';
import type { RightsArticle } from '@/features/admin/rights/types/rights.types';
import type { AdminBroadcastItem, NotificationItem } from '@/features/admin/notifications/types/notifications.types';

export type PortalRole = 'ADMIN' | 'MEMBER' | 'SEEKER' | 'USER';

export type ContentTargetRole = 'ALL' | 'MEMBERS' | 'SEEKERS' | 'USERS';

export interface VisibilityOption {
  id: ContentTargetRole;
  label: string;
  badgeLabel: string;
  description: string;
}

export const VISIBILITY_OPTIONS: VisibilityOption[] = [
  {
    id: 'ALL',
    label: 'All Portals (Public & All Roles)',
    badgeLabel: 'All Roles',
    description: 'Visible across Admin, Member, Donation Seeker, and General User portals.',
  },
  {
    id: 'MEMBERS',
    label: 'Members Only',
    badgeLabel: 'Members Only',
    description: 'Visible exclusively to verified active members and Admin.',
  },
  {
    id: 'SEEKERS',
    label: 'Donation Seekers Only',
    badgeLabel: 'Seekers Only',
    description: 'Visible exclusively to verified aid seekers and Admin.',
  },
  {
    id: 'USERS',
    label: 'General Users / Public Only',
    badgeLabel: 'General Users',
    description: 'Visible to public website visitors and general user portal.',
  },
];

/**
 * Normalizes an arbitrary audience or visibility string to a standard target role.
 */
export function normalizeTargetRole(val?: string | null): ContentTargetRole {
  if (!val) return 'ALL';
  const v = val.toUpperCase().trim();

  if (v.includes('MEMBER')) return 'MEMBERS';
  if (v.includes('SEEKER')) return 'SEEKERS';
  if (v.includes('USER') && !v.includes('ALL')) return 'USERS';
  if (v === 'PUBLIC') return 'USERS';

  return 'ALL';
}

/**
 * Checks if target role matches the current user portal role.
 */
function roleMatchesTarget(target: ContentTargetRole, role: PortalRole): boolean {
  if (role === 'ADMIN') return true;
  if (target === 'ALL') return true;
  if (target === 'MEMBERS' && role === 'MEMBER') return true;
  if (target === 'SEEKERS' && role === 'SEEKER') return true;
  if (target === 'USERS' && role === 'USER') return true;
  return false;
}

// ==========================================
// 1. EVENTS VISIBILITY
// ==========================================

export function isEventVisibleToRole(event: EventListItem, role: PortalRole): boolean {
  // Admin sees all events (including drafts, cancelled, and disabled events)
  if (role === 'ADMIN') return true;

  // Non-admin roles (General User, Member, Donation Seeker) NEVER see DISABLED events
  if (event.isEnabled === false || (event as any).is_enabled === false) {
    return false;
  }

  // Non-admins NEVER see DRAFT or CANCELLED events
  if (event.status === 'DRAFT' || event.status === 'CANCELLED') {
    return false;
  }

  // Check target audience / visibility
  const target = normalizeTargetRole(
    (event as any).visibility || event.targetAudience
  );

  return roleMatchesTarget(target, role);
}

export function filterEventsForRole(events: EventListItem[], role: PortalRole): EventListItem[] {
  return events.filter((e) => isEventVisibleToRole(e, role));
}

// ==========================================
// 2. NEWS VISIBILITY
// ==========================================

export function isNewsVisibleToRole(news: NewsListItem, role: PortalRole): boolean {
  // Admin sees all news (published, drafts, archived)
  if (role === 'ADMIN') return true;

  // Non-admins NEVER see DRAFT or ARCHIVED news
  if (news.status !== 'PUBLISHED') {
    return false;
  }

  // Check target audience / visibility
  const target = normalizeTargetRole(
    (news as any).visibility || (news as any).targetAudience || (news.tags && news.tags.find((t) => t.startsWith('role:'))?.replace('role:', ''))
  );

  return roleMatchesTarget(target, role);
}

export function filterNewsForRole(news: NewsListItem[], role: PortalRole): NewsListItem[] {
  return news.filter((n) => isNewsVisibleToRole(n, role));
}

// ==========================================
// 3. BLOGS VISIBILITY
// ==========================================

export function isBlogVisibleToRole(blog: BlogListItem, role: PortalRole): boolean {
  // Admin sees all blogs (published, drafts, archived)
  if (role === 'ADMIN') return true;

  // Non-admins NEVER see DRAFT or ARCHIVED blogs
  if (blog.status !== 'PUBLISHED') {
    return false;
  }

  // Check target audience / visibility
  const target = normalizeTargetRole(
    (blog as any).visibility || (blog as any).targetAudience || (blog.tags && blog.tags.find((t) => t.startsWith('role:'))?.replace('role:', ''))
  );

  return roleMatchesTarget(target, role);
}

export function filterBlogsForRole(blogs: BlogListItem[], role: PortalRole): BlogListItem[] {
  return blogs.filter((b) => isBlogVisibleToRole(b, role));
}

// ==========================================
// 4. RIGHTS VISIBILITY
// ==========================================

export function isRightVisibleToRole(article: RightsArticle, role: PortalRole): boolean {
  // Admin sees all rights articles (published, drafts, archived)
  if (role === 'ADMIN') return true;

  // Non-admins NEVER see DRAFT or ARCHIVED articles
  if (article.status !== 'PUBLISHED') {
    return false;
  }

  // Check target audience / visibility
  const target = normalizeTargetRole(
    (article as any).visibility || (article as any).targetAudience || (article.tags && article.tags.find((t) => t.startsWith('role:'))?.replace('role:', ''))
  );

  return roleMatchesTarget(target, role);
}

export function filterRightsForRole(articles: RightsArticle[], role: PortalRole): RightsArticle[] {
  return articles.filter((a) => isRightVisibleToRole(a, role));
}

// ==========================================
// 5. NOTIFICATIONS VISIBILITY
// ==========================================

export function isNotificationVisibleToRole(
  item: AdminBroadcastItem | NotificationItem,
  role: PortalRole
): boolean {
  if (role === 'ADMIN') return true;

  const target = 'target_audience' in item
    ? item.target_audience
    : (item as NotificationItem).notification?.target_audience;

  if (!target || target === 'ALL_USERS') return true;
  if (target === 'MEMBERS' && role === 'MEMBER') return true;
  if (target === 'DONATION_SEEKERS' && role === 'SEEKER') return true;
  if (target === 'DONORS' && (role === 'MEMBER' || role === 'USER')) return true;

  return false;
}

export function filterBroadcastsForRole(
  broadcasts: AdminBroadcastItem[],
  role: PortalRole
): AdminBroadcastItem[] {
  return broadcasts.filter((b) => {
    if (role !== 'ADMIN' && b.status === 'SCHEDULED') return false;
    return isNotificationVisibleToRole(b, role);
  });
}

