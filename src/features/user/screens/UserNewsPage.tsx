import React, { useState, useMemo, useEffect, useSyncExternalStore } from 'react';
import {
  MessageSquare,
  Search,
  Eye,
  Calendar,
  X,
  ArrowRight,
  Share2,
} from 'lucide-react';
import { newsStore } from '../../admin/news/store/newsStore';
import type { NewsListItem } from '../../admin/news/types/news.types';
import { filterNewsForRole } from '@/features/content';
import { ShareModal } from '@/components/common/ShareModal';

const NEWS_CATEGORIES = [
  'All',
  'Legal Awareness',
  'Community',
  'Human Rights',
  'Women and Child',
];

const matchesNewsCategory = (selected: string, item: NewsListItem): boolean => {
  if (!selected || selected === 'All') return true;

  const sel = selected.toLowerCase().trim();
  const cat = (item.category || '').toLowerCase();
  const title = (item.title || '').toLowerCase();
  const summary = (item.summary || '').toLowerCase();
  const tags = (item.tags || []).map((t: string) => t.toLowerCase());

  if (sel === 'legal awareness') {
    return (
      cat.includes('legal') ||
      cat.includes('awareness') ||
      cat.includes('rights') ||
      tags.some((t: string) => t.includes('legal') || t.includes('rights')) ||
      title.includes('legal') ||
      title.includes('rights')
    );
  }

  if (sel === 'community') {
    return (
      cat.includes('community') ||
      cat.includes('relief') ||
      tags.some((t: string) => t.includes('community') || t.includes('relief')) ||
      title.includes('community') ||
      title.includes('relief')
    );
  }

  if (sel === 'human rights') {
    return (
      cat.includes('human rights') ||
      cat.includes('constitutional') ||
      tags.some((t: string) => t.includes('human rights') || t.includes('supreme court')) ||
      title.includes('human rights') ||
      summary.includes('human rights')
    );
  }

  if (sel === 'women and child' || sel.includes('women') || sel.includes('child')) {
    return (
      cat.includes('women') ||
      cat.includes('child') ||
      tags.some((t: string) => t.includes('women') || t.includes('child') || t.includes('school') || t.includes('safety')) ||
      title.includes('women') ||
      title.includes('child') ||
      summary.includes('child') ||
      summary.includes('women')
    );
  }

  return cat.includes(sel) || tags.some((t: string) => t.includes(sel));
};

export const UserNewsPage: React.FC = () => {
  const snapshot = useSyncExternalStore(newsStore.subscribe, newsStore.getSnapshot);
  const newsList = useMemo(() => {
    return filterNewsForRole(snapshot.news, 'USER');
  }, [snapshot.news]);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeArticle, setActiveArticle] = useState<NewsListItem | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    newsStore
      .fetchNews()
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredNews = useMemo(() => {
    return newsList.filter(item => {
      const matchesCat = matchesNewsCategory(selectedCategory, item);
      const matchesSearch =
        !search.trim() ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.summary.toLowerCase().includes(search.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(search.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [newsList, selectedCategory, search]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-[#06294D] text-white p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9B82E]/20 text-[#FAD465] text-xs font-bold uppercase tracking-wider mb-2">
            <MessageSquare size={14} />
            <span>Media Desk & Public Statements</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">News & Media</h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-1">
            Stay updated with official press briefings, nationwide rights campaigns, field reports, and media releases from HRSJM.
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-72 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search news & press..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#FAD465]"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {NEWS_CATEGORIES.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#06294D] text-[#FAD465] shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* News List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
          <MessageSquare size={36} className="mx-auto mb-2 text-slate-400" />
          <p className="text-sm font-bold text-slate-700">No press coverage found</p>
          <p className="text-xs text-slate-400 mt-1">Try selecting another filter or search term.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNews.map(item => (
            <div
              key={item.id}
              onClick={() => setActiveArticle(item)}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center gap-4 cursor-pointer group"
            >
              {/* Thumbnail */}
              <div className="w-full sm:w-36 h-28 sm:h-24 rounded-xl overflow-hidden bg-slate-900 shrink-0">
                <img
                  src={item.thumbnailUrl || '/assets/images/contact-hero-building.jpg'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-600">
                    {item.category}
                  </span>
                  <span className="text-[10px] text-slate-400">•</span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar size={11} />
                    <span>{item.date}</span>
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-[#06294D] group-hover:text-sky-700 transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-1">
                  {item.summary}
                </p>
              </div>

              <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-[#06294D] flex items-center justify-center shrink-0 transition-colors hidden sm:flex">
                <ArrowRight size={14} className="text-slate-600 group-hover:text-white" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* News Article Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-3xl rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="relative h-48 sm:h-64 bg-slate-900">
              <img
                src={activeArticle.thumbnailUrl || '/assets/images/contact-hero-building.jpg'}
                alt={activeArticle.title}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10.5px] font-bold uppercase bg-sky-100 text-sky-800">
                    {activeArticle.category}
                  </span>
                  <span className="text-xs text-slate-500">
                    Published on {activeArticle.date}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Eye size={13} />
                  <span>{activeArticle.views} views</span>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-[#06294D] leading-tight">
                {activeArticle.title}
              </h2>

              <p className="text-xs sm:text-sm font-semibold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                {activeArticle.summary}
              </p>

              {activeArticle.content && activeArticle.content.length > 0 ? (
                <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {activeArticle.content.map((p: string, idx: number) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  The Human Rights and Social Justice Mission continues to expand grassroots civil support centers across India, coordinating with district magistrates and legal aid authorities to guarantee immediate relief for vulnerable citizens.
                </p>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">Official Press Release • HRSJM Communications Cell</span>
              <button
                type="button"
                onClick={() => setIsShareOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#06294D] bg-white border border-slate-200 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 size={13} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeArticle && (
        <ShareModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          title={activeArticle.title}
          summary={activeArticle.summary}
          thumbnailUrl={activeArticle.thumbnailUrl || undefined}
          category={activeArticle.category}
        />
      )}
    </div>
  );
};
