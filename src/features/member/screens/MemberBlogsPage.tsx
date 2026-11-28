import React, { useState, useEffect, useMemo, useSyncExternalStore } from 'react';
import {
  FileText,
  Clock,
  Check,
  X,
  Search,
  Plus,
  Eye,
  MoreVertical,
  Calendar,
  Share2,
  BookOpen,
} from 'lucide-react';
import { blogsStore } from '@/features/admin/blogs/store/blogsStore';
import type {
  BlogListItem,
  BlogStatusFilter,
  BlogDateFilter,
  CreateBlogFormState,
} from '@/features/admin/blogs/types/blog.types';
import {
  DEFAULT_BLOG_CATEGORIES,
  formatViews,
} from '@/features/admin/blogs/types/blog.types';
import { BlogFilterModal } from '@/features/admin/blogs/components/BlogFilterModal';
import { ShareModal } from '@/components/common/ShareModal';

export const MemberBlogsPage: React.FC = () => {
  const snapshot = useSyncExternalStore<{ blogs: BlogListItem[]; version: number }>(
    blogsStore.subscribe,
    blogsStore.getSnapshot
  );
  const blogs = snapshot.blogs;
  const stats = blogsStore.getStats();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<BlogStatusFilter>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<BlogDateFilter>('ANY');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeBlog, setActiveBlog] = useState<BlogListItem | null>(null);
  const [shareTargetBlog, setShareTargetBlog] = useState<BlogListItem | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // New Blog form state
  const [addForm, setAddForm] = useState<CreateBlogFormState>({
    title: '',
    shortDescription: '',
    content: '',
    category: 'Know Your Rights',
    author: 'HRSJM Member',
    status: 'PUBLISHED',
    allowComments: true,
    featured: false,
    tagsText: 'Rights, Justice',
    coverImageUri: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    blogsStore.fetchBlogs().catch(() => {});
  }, []);

  // Filter tabs with live counts
  const tabs = useMemo(
    () => [
      { key: 'ALL' as BlogStatusFilter, label: 'All', count: stats.total },
      { key: 'PUBLISHED' as BlogStatusFilter, label: 'Published', count: stats.published },
      { key: 'DRAFT' as BlogStatusFilter, label: 'Drafts', count: stats.drafts },
      { key: 'ARCHIVED' as BlogStatusFilter, label: 'Archived', count: stats.archived },
    ],
    [stats]
  );

  // Filtered dataset
  const filteredBlogs = useMemo(() => {
    return blogs.filter((item) => {
      // Status tab
      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) {
        return false;
      }
      // Category filter
      if (selectedCategory && item.category !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = item.title?.toLowerCase().includes(q);
        const inExcerpt = item.excerpt?.toLowerCase().includes(q);
        const inCategory = item.category?.toLowerCase().includes(q);
        if (!inTitle && !inExcerpt && !inCategory) {
          return false;
        }
      }
      return true;
    });
  }, [blogs, selectedStatus, selectedCategory, searchQuery]);

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.title.trim() || !addForm.shortDescription.trim()) {
      alert('Please provide a title and short description.');
      return;
    }
    setIsSubmitting(true);
    try {
      await blogsStore.addBlog(addForm);
      setIsAddModalOpen(false);
      setAddForm({
        title: '',
        shortDescription: '',
        content: '',
        category: 'Know Your Rights',
        author: 'HRSJM Member',
        status: 'PUBLISHED',
        allowComments: true,
        featured: false,
        tagsText: 'Rights, Justice',
        coverImageUri: null,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-4 pb-12">
      {/* 1. Header: Blogs + Add Blog Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0C2340]">
            Blogs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create, manage and publish blog articles.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-[#F6B819] hover:bg-[#e5aa14] text-[#0C2340] font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Add Blog</span>
        </button>
      </div>

      {/* 2. KPI Stats Grid (1 line full width) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Blogs */}
        <div
          onClick={() => setSelectedStatus('ALL')}
          className={`p-3.5 sm:p-5 rounded-2xl bg-[#EDF4FB] border transition-all cursor-pointer ${
            selectedStatus === 'ALL'
              ? 'border-[#0C2340] shadow-sm'
              : 'border-blue-100/70 hover:border-blue-300'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-[#0C2340] flex items-center justify-center text-white mb-2.5 shadow-xs">
            <FileText size={16} />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0C2340] leading-none">
            {stats.total}
          </div>
          <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-1.5">
            Total Blogs
          </div>
        </div>

        {/* Drafts */}
        <div
          onClick={() => setSelectedStatus('DRAFT')}
          className={`p-3.5 sm:p-5 rounded-2xl bg-[#FEF7ED] border transition-all cursor-pointer ${
            selectedStatus === 'DRAFT'
              ? 'border-[#D97706] shadow-sm'
              : 'border-amber-100/70 hover:border-amber-300'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-[#D97706] flex items-center justify-center text-white mb-2.5 shadow-xs">
            <Clock size={16} />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#D97706] leading-none">
            {stats.drafts}
          </div>
          <div className="text-xs sm:text-sm font-semibold text-[#D97706] mt-1.5">
            Drafts
          </div>
        </div>

        {/* Published */}
        <div
          onClick={() => setSelectedStatus('PUBLISHED')}
          className={`p-3.5 sm:p-5 rounded-2xl bg-[#EDF9F0] border transition-all cursor-pointer ${
            selectedStatus === 'PUBLISHED'
              ? 'border-[#16A34A] shadow-sm'
              : 'border-green-100/70 hover:border-green-300'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-[#16A34A] flex items-center justify-center text-white mb-2.5 shadow-xs">
            <Check size={16} />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#16A34A] leading-none">
            {stats.published}
          </div>
          <div className="text-xs sm:text-sm font-semibold text-[#16A34A] mt-1.5">
            Published
          </div>
        </div>

        {/* Archived */}
        <div
          onClick={() => setSelectedStatus('ARCHIVED')}
          className={`p-3.5 sm:p-5 rounded-2xl bg-[#FEF2F2] border transition-all cursor-pointer ${
            selectedStatus === 'ARCHIVED'
              ? 'border-[#DC2626] shadow-sm'
              : 'border-rose-100/70 hover:border-rose-300'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-[#DC2626] flex items-center justify-center text-white mb-2.5 shadow-xs">
            <X size={16} />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#DC2626] leading-none">
            {stats.archived}
          </div>
          <div className="text-xs sm:text-sm font-semibold text-[#DC2626] mt-1.5">
            Archived
          </div>
        </div>
      </div>

      {/* 3. Search Bar and Filters Button */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search by title, category or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 sm:py-3 rounded-2xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#0C2340] shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsFilterModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 sm:py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs transition-colors shrink-0 cursor-pointer"
        >
          <span className="text-slate-400">▾</span>
          <span>Filters</span>
          {selectedCategory && (
            <span className="w-2 h-2 rounded-full bg-[#F6B819]" />
          )}
        </button>
      </div>

      {/* 4. Filter Tabs Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = selectedStatus === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedStatus(tab.key)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#0C2340] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          );
        })}
      </div>

      {/* Active Category Indicator */}
      {selectedCategory && (
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
          <span>
            Filtered by category: <strong>{selectedCategory}</strong>
          </span>
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className="text-amber-800 hover:text-amber-950 font-bold ml-auto cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      {/* 5. Blogs List Items */}
      {filteredBlogs.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <BookOpen size={24} />
          </div>
          <h3 className="text-base font-bold text-[#0C2340]">No Blog Articles Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, filter tabs, or clear active category filters.
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-3.5">
          {filteredBlogs.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveBlog(item)}
              className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-3.5 sm:gap-4">
                {/* Thumbnail / Icon Box */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shrink-0 flex items-center justify-center">
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://picsum.photos/seed/hrsjm-blog/400/250';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-[#FAF7F0] flex items-center justify-center text-2xl">
                      📝
                    </div>
                  )}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-[#0C2340] text-sm sm:text-base leading-snug truncate group-hover:text-amber-600 transition-colors">
                      {item.title}
                    </h3>

                    {/* Three Dots More Menu */}
                    <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuId(openMenuId === item.id ? null : item.id)
                        }
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
                        title="Options"
                      >
                        <MoreVertical size={15} />
                      </button>

                      {openMenuId === item.id && (
                        <div className="absolute right-0 top-9 w-40 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-20 text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              setActiveBlog(item);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                          >
                            <Eye size={13} />
                            <span>Read Article</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              setShareTargetBlog(item);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                          >
                            <Share2 size={13} />
                            <span>Share Blog</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-500 line-clamp-1 mt-0.5">
                    {item.excerpt}
                  </p>

                  {/* Bottom Metadata Row */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2.5 pt-2 border-t border-slate-100 text-xs text-slate-500">
                    {/* Category pill */}
                    <span className="px-2.5 py-0.5 rounded-md bg-[#EFF6FF] text-[#0C2340] font-bold text-[11px] sm:text-xs">
                      {item.category}
                    </span>

                    <span className="text-slate-300">|</span>

                    {/* Date & Time */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="font-bold text-slate-800">{item.date}</span>
                      {item.time && (
                        <span className="text-slate-400 text-[11px]">{item.time}</span>
                      )}
                    </div>

                    {/* Status badge */}
                    {item.status === 'PUBLISHED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EDF9F0] text-[#16A34A] font-semibold text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                        Published
                      </span>
                    )}
                    {item.status === 'DRAFT' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF7ED] text-[#D97706] font-semibold text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                        Draft
                      </span>
                    )}
                    {item.status === 'ARCHIVED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF2F2] text-[#DC2626] font-semibold text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                        Archived
                      </span>
                    )}

                    {/* Views Count */}
                    <div className="inline-flex items-center gap-1 text-slate-500 font-bold ml-auto text-[11px]">
                      <Eye size={12} className="text-slate-400" />
                      <span>{formatViews(item.views)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. Filter Modal */}
      <BlogFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        status={selectedStatus}
        category={selectedCategory}
        dateRange={selectedDateRange}
        onApply={(status, category, dateRange) => {
          setSelectedStatus(status);
          setSelectedCategory(category);
          setSelectedDateRange(dateRange);
        }}
        onReset={() => {
          setSelectedStatus('ALL');
          setSelectedCategory(null);
          setSelectedDateRange('ANY');
        }}
      />

      {/* 7. Add Blog Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-[#0C2340]">Add Blog Article</h3>
                <p className="text-xs text-slate-500">Draft or publish a knowledge piece</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateBlog} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Blog Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Understanding Fundamental Constitutional Rights"
                  value={addForm.title}
                  onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:border-[#0C2340]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={addForm.category || 'Know Your Rights'}
                    onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:border-[#0C2340]"
                  >
                    {DEFAULT_BLOG_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={addForm.status}
                    onChange={(e) =>
                      setAddForm({ ...addForm, status: e.target.value as any })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:border-[#0C2340]"
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Short Description (Excerpt) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="One sentence summary shown on blog card"
                  value={addForm.shortDescription}
                  onChange={(e) =>
                    setAddForm({ ...addForm, shortDescription: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:border-[#0C2340]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Article Content
                </label>
                <textarea
                  rows={4}
                  placeholder="Write the full blog article content here..."
                  value={addForm.content}
                  onChange={(e) => setAddForm({ ...addForm, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:border-[#0C2340]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#F6B819] hover:bg-[#e5aa14] text-[#0C2340] cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Publish Blog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Detailed Blog Reader Modal */}
      {activeBlog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setActiveBlog(null)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="px-3 py-1 rounded-md bg-[#EFF6FF] text-[#0C2340] font-bold text-xs">
                {activeBlog.category}
              </span>
              <button
                type="button"
                onClick={() => setActiveBlog(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Thumbnail */}
            {activeBlog.thumbnailUrl && (
              <div className="w-full h-48 sm:h-64 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={activeBlog.thumbnailUrl}
                  alt={activeBlog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Headline */}
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0C2340] leading-snug">
              {activeBlog.title}
            </h2>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 py-1 border-y border-slate-100">
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-slate-400" />
                <span>Published {activeBlog.date}</span>
                {activeBlog.time && <span>at {activeBlog.time}</span>}
              </div>
              <span>•</span>
              <div>By {activeBlog.author || 'HRSJM Editorial Board'}</div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Eye size={13} className="text-slate-400" />
                <span>{formatViews(activeBlog.views)} views</span>
              </div>
            </div>

            {/* Excerpt Box */}
            <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-amber-200/70 text-xs sm:text-sm text-[#0C2340] font-medium leading-relaxed">
              {activeBlog.excerpt}
            </div>

            {/* Content Paragraphs */}
            {activeBlog.content && activeBlog.content.length > 0 && (
              <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
                {activeBlog.content.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
            )}

            {/* Tags */}
            {activeBlog.tags && activeBlog.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {activeBlog.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveBlog(null)}
                className="px-5 py-2 rounded-xl bg-[#0C2340] text-white text-xs font-bold cursor-pointer hover:bg-[#163863]"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
      {shareTargetBlog && (
        <ShareModal
          isOpen={!!shareTargetBlog}
          onClose={() => setShareTargetBlog(null)}
          title={shareTargetBlog.title}
          summary={shareTargetBlog.excerpt}
          thumbnailUrl={shareTargetBlog.thumbnailUrl || undefined}
          category={shareTargetBlog.category}
        />
      )}
    </div>
  );
};
