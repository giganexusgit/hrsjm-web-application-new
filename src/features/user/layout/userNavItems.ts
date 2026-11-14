import type { LucideIcon } from 'lucide-react';
import {
  Home,
  FileText,
  Shield,
  Scale,
  Calendar,
  MessageSquare,
  BookOpen,
  LifeBuoy,
  Heart,
  CreditCard,
  PhoneCall,
  User,
  Bell,
  Receipt,
  Target,
} from 'lucide-react';

export interface UserNavItem {
  id: string;
  title: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
  exact?: boolean;
}

export interface UserNavGroup {
  groupTitle: string;
  items: UserNavItem[];
}

export const USER_NAV_GROUPS: UserNavGroup[] = [
  {
    groupTitle: 'MAIN',
    items: [
      {
        id: 'user-home',
        title: 'Home Dashboard',
        path: '/',
        icon: Home,
        exact: true,
      },
      {
        id: 'user-about',
        title: 'About HRSJM',
        path: '/about',
        icon: FileText,
      },
      {
        id: 'user-what-we-do',
        title: 'What HRSJM Does',
        path: '/what-we-do',
        icon: Shield,
      },
      {
        id: 'user-rights',
        title: 'Know Your Rights',
        path: '/rights',
        icon: Scale,
      },
    ],
  },
  {
    groupTitle: 'COMMUNITY & MEDIA',
    items: [
      {
        id: 'user-events',
        title: 'Events & Activities',
        path: '/events',
        icon: Calendar,
      },
      {
        id: 'user-news',
        title: 'News & Media',
        path: '/news',
        icon: MessageSquare,
      },
      {
        id: 'user-blogs',
        title: 'Articles & Blogs',
        path: '/blogs',
        icon: BookOpen,
      },
    ],
  },
  {
    groupTitle: 'ENGAGEMENT & AID',
    items: [
      {
        id: 'user-support',
        title: 'File a Complaint',
        path: '/support',
        icon: LifeBuoy,
      },
      {
        id: 'user-causes',
        title: 'Mission Causes',
        path: '/causes',
        icon: Target,
      },
      {
        id: 'user-donations',
        title: 'Donations & Aid',
        path: '/donations',
        icon: Heart,
      },
      {
        id: 'user-transactions',
        title: 'Transactions & Receipts',
        path: '/user/transactions',
        icon: Receipt,
      },
      {
        id: 'user-membership',
        title: 'Membership & Status',
        path: '/user/membership',
        icon: CreditCard,
      },
      {
        id: 'user-contact',
        title: 'Contact Us',
        path: '/contact',
        icon: PhoneCall,
      },
    ],
  },
  {
    groupTitle: 'ACCOUNT',
    items: [
      {
        id: 'user-profile',
        title: 'My Profile',
        path: '/user/profile',
        icon: User,
      },
      {
        id: 'user-notifications',
        title: 'Notifications',
        path: '/user/notifications',
        icon: Bell,
      },
    ],
  },
];
