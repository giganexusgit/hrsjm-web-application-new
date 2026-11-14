import React, { useEffect, useState, useMemo, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox, RefreshCw } from 'lucide-react';
import { newsStore } from '../store/newsStore';
import { NewsStatsCards } from '../components/NewsStatsCards';
import { NewsStatusTabs } from '../components/NewsStatusTabs';
import { NewsSearchBar } from '../components/NewsSearchBar';
import { NewsCard } from '../components/NewsCard';
import { NewsFilterModal } from '../components/NewsFilterModal';
import { NewsDeleteModal } from '../components/NewsDeleteModal';
import type { NewsListItem, NewsStatusFilter, NewsFilterTab } from '../types/news.types';

export const NewsListPage: React.FC = () => {
  const navigate = useNavigate();
  useSyncExternalStore(newsStore.subscribe, newsStore.getSnapshot);

  const allNews = newsStore.getAllNews();
  const stats = newsStore.getStats();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<NewsStatusFilter>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [deletingNews, setDeletingNews] = useState<NewsListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    newsStore.fetchNews().catch(() => {});
  }, []);

  // Filter tabs with live counts
  const tabs = useMemo<NewsFilterTab[]>(
    () => [
      { key: 'ALL', label: 'All', count: stats.total },
      { key: 'PUBLISHED', label: 'Published', count: stats.published },
      { key: 'DRAFT', label: 'Drafts', count: stats.drafts },
      { key: 'ARCHIVED', label: 'Archived', count: stats.archived },
    ],
    [stats]
  );

  // Filtered dataset
  const filteredNews = useMemo(() => {
    return allNews.filter((item) => {
      // Status filter
      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) {
        return false;
      }
      // Category filter
      if (selectedCategory && item.category !== selectedCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = item.title.toLowerCase().includes(q);
        const inSummary = item.summary.toLowerCase().includes(q);
        const inCategory = item.category.toLowerCase().includes(q);
        const inAuthor = (item.author || '').toLowerCase().includes(q);
        const inTags = (item.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!inTitle && !inSummary && !inCategory && !inAuthor && !inTags) {
          return false;
        }
      }
      return true;
    });
  }, [allNews, selectedStatus, selectedCategory, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredNews.length / pageSize) || 1;
  const paginatedNews = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredNews.slice(start, start + pageSize);
  }, [filteredNews, page, pageSize]);

  const hasActiveFilters =
    searchQuery.trim() !== '' || selectedStatus !== 'ALL' || selectedCategory !== null;

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedCategory(null);
    setPage(1);
  };

  const handleStatusChange = async (news: NewsListItem, newStatus: any) => {
    await newsStore.updateStatus(news.id, newStatus);
  };

  const handleConfirmDelete = async () => {
    if (!deletingNews) return;
    setIsDeleting(true);
    try {
      await newsStore.deleteNews(deletingNews.id);
      setDeletingNews(null);
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
          <h1 style={styles.title}>News & Press</h1>
          <p style={styles.subtitle}>
            National press releases, humanitarian legal updates, organizational bulletins and public statements.
          </p>
        </div>

        <button
          onClick={() => newsStore.fetchNews()}
          style={styles.refreshBtn}
          title="Refresh from server"
        >
          <RefreshCw size={15} />
          <span>Sync</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <NewsStatsCards
        stats={stats}
        selectedStatus={selectedStatus}
        onSelectStatus={(status) => {
          setSelectedStatus(status);
          setPage(1);
        }}
      />

      {/* Search and Action Bar */}
      <NewsSearchBar
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
        onOpenFilterModal={() => setIsFilterModalOpen(true)}
        onAddNew={() => navigate('/admin/news/create')}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Status Filter Tabs */}
      <NewsStatusTabs
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
            Showing {filteredNews.length} of {allNews.length} articles
          </span>
        </div>
      )}

      {/* News Articles Grid */}
      {paginatedNews.length > 0 ? (
        <div style={styles.grid}>
          {paginatedNews.map((news) => (
            <NewsCard
              key={news.id}
              news={news}
              onView={(item) => navigate(`/admin/news/${item.id}`)}
              onEdit={(item) => navigate(`/admin/news/${item.id}/edit`)}
              onStatusChange={handleStatusChange}
              onDelete={(item) => setDeletingNews(item)}
            />
          ))}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <div style={styles.emptyIconCircle}>
            <Inbox size={36} color="#64748B" />
          </div>
          <h3 style={styles.emptyTitle}>No news articles found</h3>
          <p style={styles.emptyText}>
            No articles match your current search and filter settings. Try adjusting your query or resetting filters.
          </p>
          <button onClick={handleClearFilters} style={styles.clearFiltersBtn}>
            Reset All Filters
          </button>
        </div>
      )}

      {/* Pagination Bar */}
      {filteredNews.length > pageSize && (
        <div style={styles.paginationRow}>
          <div style={styles.paginationInfo}>
            Showing <strong>{(page - 1) * pageSize + 1}</strong> –{' '}
            <strong>{Math.min(page * pageSize, filteredNews.length)}</strong> of{' '}
            <strong>{filteredNews.length}</strong> articles
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
      <NewsFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        status={selectedStatus}
        category={selectedCategory}
        onApply={(st, cat) => {
          setSelectedStatus(st);
          setSelectedCategory(cat);
          setPage(1);
        }}
        onReset={handleClearFilters}
      />

      {/* Delete Confirmation Modal */}
      <NewsDeleteModal
        isOpen={Boolean(deletingNews)}
        news={deletingNews}
        onClose={() => setDeletingNews(null)}
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
