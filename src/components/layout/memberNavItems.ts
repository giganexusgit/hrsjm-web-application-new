import type { LucideIcon } from 'lucide-react';
import {
  House,
  Heart,
  Calendar,
  Download,
  MessageSquare,
  BookOpen,
  Scale,
  Newspaper,
  BookOpenCheck,
  IdCard,
  Bell,
  Settings,
} from 'lucide-react';

export interface MemberNavItem {
  id: string;
  title: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
  description?: string;
}

export interface MemberNavGroup {
  groupTitle: string;
  items: MemberNavItem[];
}

/**
 * Navigation hierarchy exactly matching HRSJM Member Portal specifications:
 * Group 1: MEMBER SERVICES
 * Group 2: COMMUNITY & IMPACT
 * Group 3: MEMBERSHIP & ACCOUNT
 */
export const MEMBER_NAV_GROUPS: MemberNavGroup[] = [
  {
    groupTitle: 'MEMBER SERVICES',
    items: [
      {
        id: 'dashboard',
        title: 'Member Dashboard',
        path: '/member/dashboard',
        icon: House,
        description: 'Overview, welcome kit & impact metrics',
      },
      {
        id: 'causes',
        title: 'Social Causes & Aid',
        path: '/member/causes',
        icon: Heart,
        description: 'Mission campaigns & donation aid',
      },
      {
        id: 'events',
        title: 'Upcoming Events & Drives',
        path: '/member/events',
        icon: Calendar,
        description: 'Legal awareness camps, rallies & conventions',
      },
      {
        id: 'passbook',
        title: 'My Donations & 80G Receipts',
        path: '/member/passbook',
        icon: Download,
        description: 'Tax exemption receipts & donation history',
      },
      {
        id: 'support',
        title: 'Help & Support Desk',
        path: '/member/support',
        icon: MessageSquare,
        description: 'Grievance filing & resolution tracking',
      },
    ],
  },
  {
    groupTitle: 'COMMUNITY & IMPACT',
    items: [
      {
        id: 'about',
        title: 'About HRSJM Mission',
        path: '/member/about',
        icon: BookOpen,
        description: 'Constitution, vision, values & leadership',
      },
      {
        id: 'rights',
        title: 'Know Your Rights',
        path: '/member/rights',
        icon: Scale,
        description: 'Constitutional, civil & legal rights guides',
      },
      {
        id: 'news',
        title: 'News & Press Releases',
        path: '/member/news',
        icon: Newspaper,
        description: 'Press briefings & official press notes',
      },
      {
        id: 'blogs',
        title: 'Articles & Blogs',
        path: '/member/blogs',
        icon: BookOpenCheck,
        description: 'Human rights essays, case studies & analysis',
      },
    ],
  },
  {
    groupTitle: 'MEMBERSHIP & ACCOUNT',
    items: [
      {
        id: 'id_card',
        title: 'Digital ID Card & Profile',
        path: '/member/id-card',
        icon: IdCard,
        description: 'Front/back verified 3D card & member details',
      },
      {
        id: 'notifications',
        title: 'Notifications',
        path: '/member/notifications',
        icon: Bell,
        description: 'Alerts, bulletins & system announcements',
      },
      {
        id: 'settings',
        title: 'Settings & Security',
        path: '/member/settings',
        icon: Settings,
        description: 'Preferences, security & communication settings',
      },
    ],
  },
];

// Flat list for quick lookups
export const MEMBER_NAV_ITEMS: MemberNavItem[] = MEMBER_NAV_GROUPS.flatMap((g) => g.items);
