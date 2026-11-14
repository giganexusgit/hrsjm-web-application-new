import type { LucideIcon } from 'lucide-react';
import {
  House,
  Users,
  FileText,
  UserCheck,
  HeartHandshake,
  MessageSquare,
  Calendar,
  Newspaper,
  BookOpen,
  Scale,
  Receipt,
  ArrowDownToLine,
  Briefcase,
  BarChart3,
  Gift,
  IdCard,
  Bell,
  Settings,
} from 'lucide-react';

export interface AdminNavItem {
  id: string;
  title: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
}

export interface AdminNavGroup {
  groupTitle: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    groupTitle: 'MAIN NAVIGATION',
    items: [
      { id: 'dashboard', title: 'Dashboard', path: '/admin/dashboard', icon: House },
      { id: 'users', title: 'User Management', path: '/admin/users', icon: Users },
      { id: 'membership_applications', title: 'All Applications', path: '/admin/membership-applications', icon: FileText },
      { id: 'members', title: 'Members Directory', path: '/admin/members', icon: UserCheck },
      { id: 'assistance', title: 'Donation Causes & Aid', path: '/admin/assistance', icon: HeartHandshake },
      { id: 'complaints', title: 'Support & Complaints', path: '/admin/support', icon: MessageSquare },
    ],
  },
  {
    groupTitle: 'USER MODULE',
    items: [
      { id: 'all_users', title: 'All Users Directory', path: '/admin/all-users', icon: Users },
    ],
  },
  {
    groupTitle: 'CONTENT & MEDIA',
    items: [
      { id: 'events', title: 'Events Management', path: '/admin/events', icon: Calendar },
      { id: 'news', title: 'News & Press', path: '/admin/news', icon: Newspaper },
      { id: 'blogs', title: 'Articles & Blogs', path: '/admin/blogs', icon: BookOpen },
      { id: 'rights', title: 'Know Your Rights', path: '/admin/rights', icon: Scale },
    ],
  },
  {
    groupTitle: 'FINANCE & ACCOUNTS',
    items: [
      { id: 'expenses', title: 'Expenses', path: '/admin/expenses', icon: Receipt },
      { id: 'receipts', title: 'Income (Receipts)', path: '/admin/receipts', icon: ArrowDownToLine },
      { id: 'accounting', title: 'Accounting & Ledger', path: '/admin/accounting', icon: Briefcase },
      { id: 'reports', title: 'Financial Reports', path: '/admin/reports', icon: BarChart3 },
      { id: 'donations', title: 'Donations Management', path: '/admin/donations', icon: Gift },
    ],
  },
  {
    groupTitle: 'PLATFORM & SYSTEM',
    items: [
      { id: 'profile', title: 'My Profile & ID Card', path: '/admin/profile', icon: IdCard },
      { id: 'notifications', title: 'Notifications', path: '/admin/notifications', icon: Bell, badge: '3' },
      { id: 'settings', title: 'Settings & Preferences', path: '/admin/settings', icon: Settings },
    ],
  },
];
