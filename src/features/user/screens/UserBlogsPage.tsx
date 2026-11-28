import React, { useState, useMemo, useEffect, useSyncExternalStore } from 'react';
import {
  BookOpen,
  Search,
  Eye,
  Calendar,
  User,
  X,
  ArrowRight,
  Share2,
} from 'lucide-react';
import { blogsStore } from '../../admin/blogs/store/blogsStore';
import type { BlogListItem } from '../../admin/blogs/types/blog.types';
import { filterBlogsForRole } from '@/features/content';
import { ShareModal } from '@/components/common/ShareModal';

const BLOG_CATEGORIES = [
  'All Articles',
  'Social Justice',
  'Relief Work',
  'Environment',
  'Women Rights',
  'Events',
];

const matchesBlogCategory = (selected: string, item: BlogListItem): boolean => {
  if (!selected || selected === 'All Articles' || selected === 'ALL') return true;

  const sel = selected.toLowerCase().trim();
  const cat = (item.category || '').toLowerCase().trim();
  const title = (item.title || '').toLowerCase();
  const tags = (item.tags || []).map((t: string) => t.toLowerCase());

  if (sel === 'social justice') {
    return (
      cat.includes('social justice') ||
      cat.includes('justice') ||
      cat.includes('rights') ||
      tags.some((t: string) => t.includes('social justice') || t.includes('justice')) ||
      title.includes('social justice')
    );
  }

  if (sel === 'relief work') {
    return (
      cat.includes('relief') ||
      tags.some((t: string) => t.includes('relief')) ||
      title.includes('relief')
    );
  }

  if (sel === 'environment') {
    return (
      cat.includes('environment') ||
      tags.some((t: string) => t.includes('environment')) ||
      title.includes('environment')
    );
  }

  if (sel === 'women rights' || sel.includes('women')) {
    return (
      cat.includes('women') ||
      tags.some((t: string) => t.includes('women')) ||
      title.includes('women')
    );
  }

  if (sel === 'events') {
    return (
      cat.includes('event') ||
      cat.includes('outreach') ||
      tags.some((t: string) => t.includes('event') || t.includes('outreach')) ||
      title.includes('event') ||
      title.includes('outreach')
    );
  }

  return cat === sel || cat.includes(sel) || tags.some((t: string) => t === sel || t.includes(sel));
};

export const UserBlogsPage: React.FC = () => {
  const snapshot = useSyncExternalStore(blogsStore.subscribe, blogsStore.getSnapshot);
  const blogs = useMemo(() => {
    return filterBlogsForRole(snapshot.blogs, 'USER');
  }, [snapshot.blogs]);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Articles');
  const [activeBlog, setActiveBlog] = useState<BlogListItem | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    blogsStore
      .fetchBlogs()
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredBlogs = useMemo(() => {
    return blogs.filter(item => {
      const matchesCat = matchesBlogCategory(selectedCategory, item);
      const matchesSearch =
        !search.trim() ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(search.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [blogs, selectedCategory, search]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-[#06294D] text-white p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9B82E]/20 text-[#FAD465] text-xs font-bold uppercase tracking-wider mb-2">
            <BookOpen size={14} />
            <span>Articles, Opinions & Analysis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Articles & Editorial Blogs</h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-1">
            Perspectives, field research, constitutional analyses, and citizen rights guides authored by legal scholars and human rights defenders.
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-72 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search articles..."
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

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {BLOG_CATEGORIES.map(cat => (
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

      {/* Blogs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-72 rounded-2xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
          <BookOpen size={36} className="mx-auto mb-2 text-slate-400" />
          <p className="text-sm font-bold text-slate-700">No articles found</p>
          <p className="text-xs text-slate-400 mt-1">Try another category or clear your search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBlogs.map(item => (
            <div
              key={item.id}
              onClick={() => setActiveBlog(item)}
              className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="relative h-44 bg-slate-900 overflow-hidden">
                  <img
                    src={item.thumbnailUrl || '/assets/images/article-rights-book.jpg'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#06294D]/90 text-white uppercase tracking-wider backdrop-blur-xs">
                    {item.category}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="text-base font-bold text-[#06294D] group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    <span>{item.date}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <User size={11} />
                    <span>{item.author || 'HRSJM Editorial'}</span>
                  </span>
                </div>

                <div className="w-6 h-6 rounded-full bg-slate-50 group-hover:bg-[#06294D] flex items-center justify-center transition-colors">
                  <ArrowRight size={12} className="text-slate-600 group-hover:text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Blog Article Reader Modal */}
      {activeBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-3xl rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="relative h-48 sm:h-64 bg-slate-900">
              <img
                src={activeBlog.thumbnailUrl || '/assets/images/article-rights-book.jpg'}
                alt={activeBlog.title}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setActiveBlog(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10.5px] font-bold uppercase bg-amber-100 text-amber-800">
                  {activeBlog.category}
                </span>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Eye size={13} />
                  <span>{activeBlog.views} views</span>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-[#06294D] leading-tight">
                {activeBlog.title}
              </h2>

              <div className="flex items-center gap-2 text-xs text-slate-400 pb-2 border-b border-slate-100">
                <span>By {activeBlog.author || 'HRSJM Editorial Team'}</span>
                <span>•</span>
                <span>{activeBlog.date}</span>
              </div>

              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3">
                <p className="font-semibold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {activeBlog.excerpt}
                </p>
                <p>
                  Democratic societies thrive when citizens are well-informed of statutory protections and actively participate in civic governance. The Human Rights and Social Justice Mission continues to produce evidence-backed research to illuminate ground-level enforcement challenges.
                </p>
                <p>
                  Under Articles 14, 19, and 21 of the Constitution of India, every citizen possesses intrinsic entitlements that public authorities are duty-bound to honor. Legal literacy is not merely academic—it is an actionable shield against exploitation.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">HRSJM Knowledge & Research Portal</span>
              <button
                type="button"
                onClick={() => setIsShareOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#06294D] bg-white border border-slate-200 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 size={13} />
                <span>Share Article</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeBlog && (
        <ShareModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          title={activeBlog.title}
          summary={activeBlog.excerpt}
          thumbnailUrl={activeBlog.thumbnailUrl || undefined}
          category={activeBlog.category}
        />
      )}
    </div>
  );
};
