import React, { useState, useEffect, useMemo, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox, RefreshCw } from 'lucide-react';
import { blogsStore } from '../store/blogsStore';
import { BlogStatsCards } from '../components/BlogStatsCards';
import { BlogStatusTabs } from '../components/BlogStatusTabs';
import { BlogSearchBar } from '../components/BlogSearchBar';
import { BlogCard } from '../components/BlogCard';
import { BlogFilterModal } from '../components/BlogFilterModal';
import { BlogDeleteModal } from '../components/BlogDeleteModal';
import type {
  BlogListItem,
  BlogStatusFilter,
  BlogDateFilter,
  BlogFilterTab,
} from '../types/blog.types';

export const BlogsListPage: React.FC = () => {
  const navigate = useNavigate();
  useSyncExternalStore(blogsStore.subscribe, blogsStore.getSnapshot);

  const allBlogs = blogsStore.getAllBlogs();
  const stats = blogsStore.getStats();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<BlogStatusFilter>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<BlogDateFilter>('ANY');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [deletingBlog, setDeletingBlog] = useState<BlogListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    blogsStore.fetchBlogs().catch(() => {});
  }, []);

  // Filter tabs with live counts
  const tabs = useMemo<BlogFilterTab[]>(
    () => [
      { key: 'ALL', label: 'All', count: stats.total },
      { key: 'PUBLISHED', label: 'Published', count: stats.published },
      { key: 'DRAFT', label: 'Drafts', count: stats.drafts },
      { key: 'ARCHIVED', label: 'Archived', count: stats.archived },
    ],
    [stats]
  );

  // Filtered dataset
  const filteredBlogs = useMemo(() => {
    return allBlogs.filter((item) => {
      // Status filter
      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) {
        return false;
      }
      // Category filter
      if (selectedCategory && item.category !== selectedCategory) {
        return false;
      }
      // Date filter (approximate calculation for Today/Week/Month)
      if (selectedDateRange !== 'ANY') {
        const itemDate = new Date(item.date).getTime() || 0;
        const refTimestamp = 1790800000000; // Reference 2026 baseline
        const diffDays = Math.abs(refTimestamp - itemDate) / (1000 * 60 * 60 * 24);
        if (selectedDateRange === 'TODAY' && diffDays > 1) return false;
        if (selectedDateRange === 'WEEK' && diffDays > 7) return false;
        if (selectedDateRange === 'MONTH' && diffDays > 31) return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = item.title.toLowerCase().includes(q);
        const inExcerpt = item.excerpt.toLowerCase().includes(q);
        const inCategory = item.category.toLowerCase().includes(q);
        const inAuthor = (item.author || '').toLowerCase().includes(q);
        const inTags = (item.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!inTitle && !inExcerpt && !inCategory && !inAuthor && !inTags) {
          return false;
        }
      }
      return true;
    });
  }, [allBlogs, selectedStatus, selectedCategory, selectedDateRange, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredBlogs.length / pageSize) || 1;
  const paginatedBlogs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredBlogs.slice(start, start + pageSize);
  }, [filteredBlogs, page, pageSize]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedStatus !== 'ALL' ||
    selectedCategory !== null ||
    selectedDateRange !== 'ANY';

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedCategory(null);
    setSelectedDateRange('ANY');
    setPage(1);
  };

  const handleStatusChange = async (blog: BlogListItem, newStatus: any) => {
    await blogsStore.updateStatus(blog.id, newStatus);
  };

  const handleConfirmDelete = async () => {
    if (!deletingBlog) return;
    setIsDeleting(true);
    try {
      await blogsStore.deleteBlog(deletingBlog.id);
      setDeletingBlog(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.badgeRow}>
            <span style={styles.moduleBadge}>CONTENT & MEDIA</span>
            <span style={styles.liveIndicator}>• Live Module</span>
          </div>
          <h1 style={styles.title}>Articles & Blogs</h1>
          <p style={styles.subtitle}>
            Editorial articles, humanitarian legal insights, thought leadership blogs and guides.
          </p>
        </div>

        <button
          onClick={() => blogsStore.fetchBlogs()}
          style={styles.refreshBtn}
          title="Refresh from server"
        >
          <RefreshCw size={15} />
          <span>Sync</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <BlogStatsCards
        stats={stats}
        selectedStatus={selectedStatus}
        onSelectStatus={(status) => {
          setSelectedStatus(status);
          setPage(1);
        }}
      />

      {/* Search and Action Bar */}
      <BlogSearchBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setPage(1);
        }}
        selectedCategory={selectedCategory}
        onCategoryChange={(cat) => {
          setSelectedCategory(cat);
          setPage(1);
        }}
        selectedDateRange={selectedDateRange}
        onDateRangeChange={(dr) => {
          setSelectedDateRange(dr);
          setPage(1);
        }}
        onOpenFilterModal={() => setIsFilterModalOpen(true)}
        onAddNew={() => navigate('/admin/blogs/create')}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Status Filter Tabs */}
      <BlogStatusTabs
        tabs={tabs}
        activeTab={selectedStatus}
        onTabChange={(tab) => {
          setSelectedStatus(tab);
          setPage(1);
        }}
      />

      {/* Active Filter Chips Bar */}
      {hasActiveFilters && (
        <div style={styles.activeFiltersBar}>
          <span style={styles.filterBarLabel}>Filtered by:</span>
          {selectedStatus !== 'ALL' && (
            <span style={styles.activeFilterPill}>
              Status: <strong>{selectedStatus}</strong>
              <button
                onClick={() => setSelectedStatus('ALL')}
                style={styles.removePillBtn}
              >
                ×
              </button>
            </span>
          )}
          {selectedCategory && (
            <span style={styles.activeFilterPill}>
              Category: <strong>{selectedCategory}</strong>
              <button
                onClick={() => setSelectedCategory(null)}
                style={styles.removePillBtn}
              >
                ×
              </button>
            </span>
          )}
          {selectedDateRange !== 'ANY' && (
            <span style={styles.activeFilterPill}>
              Window: <strong>{selectedDateRange}</strong>
              <button
                onClick={() => setSelectedDateRange('ANY')}
                style={styles.removePillBtn}
              >
                ×
              </button>
            </span>
          )}
          {searchQuery && (
            <span style={styles.activeFilterPill}>
              Search: <strong>&ldquo;{searchQuery}&rdquo;</strong>
              <button
                onClick={() => setSearchQuery('')}
                style={styles.removePillBtn}
              >
                ×
              </button>
            </span>
          )}
          <span style={styles.resultsCount}>
            Showing {filteredBlogs.length} of {allBlogs.length} articles
          </span>
        </div>
      )}

      {/* Blog Cards Grid */}
      {paginatedBlogs.length > 0 ? (
        <div style={styles.grid}>
          {paginatedBlogs.map((blog) => (
            <BlogCard
              key={blog.id}
              blog={blog}
              onView={(item) => navigate(`/admin/blogs/${item.id}`)}
              onEdit={(item) => navigate(`/admin/blogs/${item.id}/edit`)}
              onStatusChange={handleStatusChange}
              onDelete={(item) => setDeletingBlog(item)}
            />
          ))}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <div style={styles.emptyIconCircle}>
            <Inbox size={36} color="#64748B" />
          </div>
          <h3 style={styles.emptyTitle}>No blog articles found</h3>
          <p style={styles.emptyText}>
            No articles match your current search and filter settings. Try adjusting your query or resetting filters.
          </p>
          <button onClick={handleClearFilters} style={styles.clearFiltersBtn}>
            Reset All Filters
          </button>
        </div>
      )}

      {/* Pagination Bar */}
      {filteredBlogs.length > pageSize && (
        <div style={styles.paginationRow}>
          <div style={styles.paginationInfo}>
            Showing <strong>{(page - 1) * pageSize + 1}</strong> –{' '}
            <strong>{Math.min(page * pageSize, filteredBlogs.length)}</strong> of{' '}
            <strong>{filteredBlogs.length}</strong> articles
          </div>

          <div style={styles.paginationControls}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                ...styles.pageBtn,
                opacity: page === 1 ? 0.4 : 1,
                cursor: page === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  ...styles.pageNumberBtn,
                  backgroundColor: page === p ? '#011F39' : '#FFFFFF',
                  color: page === p ? '#FFFFFF' : '#34516D',
                  borderColor: page === p ? '#011F39' : '#DCE4EC',
                }}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                ...styles.pageBtn,
                opacity: page === totalPages ? 0.4 : 1,
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      <BlogFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        status={selectedStatus}
        category={selectedCategory}
        dateRange={selectedDateRange}
        onApply={(st, cat, dr) => {
          setSelectedStatus(st);
          setSelectedCategory(cat);
          setSelectedDateRange(dr);
          setPage(1);
        }}
        onReset={handleClearFilters}
      />

      {/* Delete Confirmation Modal */}
      <BlogDeleteModal
        isOpen={Boolean(deletingBlog)}
        blog={deletingBlog}
        onClose={() => setDeletingBlog(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  moduleBadge: {
    fontSize: '11px',
    fontWeight: 800,
    color: '#011F39',
    letterSpacing: '0.06em',
    backgroundColor: '#FAF7F0',
    padding: '3px 8px',
    borderRadius: '4px',
    border: '1px solid #FAD465',
  },
  liveIndicator: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#166534',
  },
  title: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: '28px',
    fontWeight: 700,
    color: '#011F39',
    margin: '0 0 6px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#34516D',
    margin: 0,
    maxWidth: '700px',
    lineHeight: 1.5,
  },
  refreshBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid #DCE4EC',
    backgroundColor: '#FFFFFF',
    color: '#34516D',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  activeFiltersBar: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '10px 14px',
    marginBottom: '20px',
    fontSize: '13px',
  },
  filterBarLabel: {
    fontWeight: 700,
    color: '#64748B',
  },
  activeFilterPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DCE4EC',
    borderRadius: '16px',
    padding: '3px 10px',
    color: '#011F39',
    fontSize: '12px',
  },
  removePillBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94A3B8',
    fontSize: '14px',
    fontWeight: 700,
    padding: 0,
    lineHeight: 1,
  },
  resultsCount: {
    marginLeft: 'auto',
    color: '#64748B',
    fontSize: '12px',
    fontWeight: 500,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '20px',
    marginBottom: '28px',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px dashed #CBD5E1',
    padding: '48px 24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '24px',
  },
  emptyIconCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#F1F5F9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: '20px',
    color: '#011F39',
    margin: '0 0 8px 0',
  },
  emptyText: {
    fontSize: '14px',
    color: '#64748B',
    maxWidth: '440px',
    margin: '0 0 20px 0',
    lineHeight: 1.5,
  },
  clearFiltersBtn: {
    padding: '9px 18px',
    borderRadius: '8px',
    backgroundColor: '#011F39',
    color: '#FFFFFF',
    border: 'none',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  paginationRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    padding: '16px 20px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #DCE4EC',
  },
  paginationInfo: {
    fontSize: '13px',
    color: '#64748B',
  },
  paginationControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  pageBtn: {
    padding: '7px 12px',
    borderRadius: '6px',
    border: '1px solid #DCE4EC',
    backgroundColor: '#FFFFFF',
    color: '#34516D',
    fontSize: '12px',
    fontWeight: 600,
  },
  pageNumberBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
