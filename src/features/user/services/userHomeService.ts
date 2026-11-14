import { apiClient } from '../../../services/apiClient';
import type {
  AboutVideoData,
  HeroSlide,
  HomeBlogItem,
  HomeEvent,
  HomeNewsItem,
  ImpactStats,
} from '../types/userHome.types';
import {
  DEFAULT_ABOUT_VIDEO,
  DEFAULT_HERO_SLIDES,
  DEFAULT_HOME_BLOGS,
  DEFAULT_IMPACT_STATS,
  LATEST_NEWS,
  UPCOMING_EVENTS,
} from '../data/userDashboardData';
import { eventsStore } from '../../admin/events/store/eventsStore';
import { newsStore } from '../../admin/news/store/newsStore';
import { blogsStore } from '../../admin/blogs/store/blogsStore';
import { filterEventsForRole, filterNewsForRole, filterBlogsForRole } from '@/features/content';

export const userHomeService = {
  fetchUpcomingEvents: async (): Promise<HomeEvent[]> => {
    try {
      const response = await apiClient.get<any>('/events?status=UPCOMING&limit=10');
      const eventsList =
        (Array.isArray(response) ? response : null) ||
        response?.items ||
        response?.events ||
        response?.data?.items ||
        response?.data ||
        (Array.isArray(response) ? response : []);
      if (Array.isArray(eventsList) && eventsList.length > 0) {
        return eventsList.map((item: any, idx: number) => {
          let day = '25';
          let month = 'OCT';
          const dateField = item.start_at || item.startAt || item.date || item.start_date;
          if (dateField) {
            try {
              const d = new Date(dateField);
              if (!isNaN(d.getTime())) {
                day = String(d.getDate()).padStart(2, '0');
                month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
              }
            } catch {
              // fallback
            }
          }
          return {
            id: item.id || `event-${idx}`,
            title: item.title,
            day,
            month,
            location: item.location || 'Mumbai, Maharashtra',
            imageAssetName: 'home/events/rights-workshop.png',
            imageUrl: item.cover_image_url || item.coverImageUrl || item.imageUrl || '/assets/images/event-legal-awareness.jpg',
          };
        });
      }
    } catch {
      // Graceful fallback to rich defaults
    }

    try {
      const local = filterEventsForRole(eventsStore.getAllEvents(), 'USER');
      if (local && local.length > 0) {
        return local.slice(0, 4).map((item, idx) => {
          const d = item.startAt ? new Date(item.startAt) : new Date();
          return {
            id: item.id || `event-${idx}`,
            title: item.title,
            day: String(d.getDate()).padStart(2, '0'),
            month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
            location: item.location || 'HRSJM Community Center',
            imageAssetName: 'home/events/rights-workshop.png',
            imageUrl: item.coverImageUrl || '/assets/images/event-legal-awareness.jpg',
          };
        });
      }
    } catch {
      // ignore
    }

    return UPCOMING_EVENTS;
  },

  fetchLatestNews: async (): Promise<HomeNewsItem[]> => {
    try {
      const response = await apiClient.get<any>('/news?status=PUBLISHED&limit=5');
      const newsList = response?.news || response?.items || response?.data || response;
      if (Array.isArray(newsList) && newsList.length > 0) {
        return newsList.slice(0, 4).map((item: any, idx: number) => {
          let formattedDate = 'Recent';
          if (item.publishedAt || item.createdAt) {
            try {
              const d = new Date(item.publishedAt || item.createdAt);
              if (!isNaN(d.getTime())) {
                formattedDate = d.toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                });
              }
            } catch {
              // fallback
            }
          }
          return {
            id: item.id || `news-${idx}`,
            category: (item.category || 'LEGAL RIGHTS').toUpperCase(),
            title: item.title,
            date: formattedDate,
            imageAssetName: 'home/news/legal-awareness.png',
            imageUrl: item.thumbnailUrl || item.imageUrl || '/assets/images/contact-hero-building.jpg',
            article: item,
          };
        });
      }
    } catch {
      // Graceful fallback
    }

    try {
      const local = filterNewsForRole(newsStore.getAllNews(), 'USER');
      if (local && local.length > 0) {
        return local.slice(0, 4).map((item, idx) => ({
          id: item.id || `news-${idx}`,
          category: (item.category || 'LEGAL RIGHTS').toUpperCase(),
          title: item.title,
          date: item.date || 'Recent',
          imageAssetName: 'home/news/legal-awareness.png',
          imageUrl: item.thumbnailUrl || '/assets/images/contact-hero-building.jpg',
          article: item,
        }));
      }
    } catch {
      // ignore
    }

    return LATEST_NEWS;
  },

  fetchPublishedBlogs: async (): Promise<HomeBlogItem[]> => {
    try {
      const response = await apiClient.get<any>('/blogs?status=PUBLISHED&limit=6');
      const blogList = response?.blogs || response?.items || response?.data || response;
      if (Array.isArray(blogList) && blogList.length > 0) {
        return blogList.map((item: any, idx: number) => {
          let formattedDate = 'Recent';
          if (item.published_at || item.createdAt) {
            try {
              const d = new Date(item.published_at || item.createdAt);
              if (!isNaN(d.getTime())) {
                formattedDate = d.toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                });
              }
            } catch {
              // fallback
            }
          }
          return {
            id: item.id || `blog-${idx}`,
            title: item.title,
            excerpt: item.excerpt || 'Empowering citizens with legal literacy and constitutional rights awareness.',
            category: (item.category || 'ARTICLE').toUpperCase(),
            date: formattedDate,
            author: item.author || 'HRSJM Editorial',
            thumbnailUrl: item.thumbnail_url || item.thumbnailUrl || '/assets/images/article-rights-book.jpg',
            article: item,
          };
        });
      }
    } catch {
      // Graceful fallback
    }

    try {
      const local = filterBlogsForRole(blogsStore.getAllBlogs(), 'USER');
      if (local && local.length > 0) {
        return local.slice(0, 4).map((item, idx) => ({
          id: item.id || `blog-${idx}`,
          title: item.title,
          excerpt: item.excerpt || 'Empowering citizens with legal literacy and constitutional rights awareness.',
          category: (item.category || 'ARTICLE').toUpperCase(),
          date: item.date || 'Recent',
          author: item.author || 'HRSJM Editorial',
          thumbnailUrl: item.thumbnailUrl || '/assets/images/article-rights-book.jpg',
          article: item,
        }));
      }
    } catch {
      // ignore
    }

    return DEFAULT_HOME_BLOGS;
  },

  fetchHeroSlides: async (): Promise<HeroSlide[]> => {
    try {
      const response = await apiClient.get<any>('/content/hero-banners');
      const slides = response?.data || response;
      if (Array.isArray(slides) && slides.length > 0) {
        return slides;
      }
    } catch {
      // Graceful fallback
    }
    return DEFAULT_HERO_SLIDES;
  },

  fetchAboutVideo: async (): Promise<AboutVideoData> => {
    try {
      const response = await apiClient.get<any>('/content/about-video');
      const data = response?.data || response;
      if (data && data.videoUrl) {
        return {
          ...DEFAULT_ABOUT_VIDEO,
          ...data,
        };
      }
    } catch {
      // Graceful fallback
    }
    return DEFAULT_ABOUT_VIDEO;
  },

  getImpactStats: (): ImpactStats => {
    return DEFAULT_IMPACT_STATS;
  },
};

