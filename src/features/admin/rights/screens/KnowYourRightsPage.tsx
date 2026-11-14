import type React from 'react';
import { useState, useMemo, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertCircle, BookOpen, ChevronRight } from 'lucide-react';
import { rightsStore } from '../store/rightsStore';
import { RightsStatsCards } from '../components/RightsStatsCards';
import { RightsStatusTabs } from '../components/RightsStatusTabs';
import { RightsSearchBar } from '../components/RightsSearchBar';
import { RightsListHeader, RightsCard } from '../components/RightsCard';
import { RightsFilterModal } from '../components/RightsFilterModal';
import { RightsPreviewModal } from '../components/RightsPreviewModal';
import { RightsDeleteModal } from '../components/RightsDeleteModal';
import { RightsActionMenu } from '../components/RightsActionMenu';
import {
  DEFAULT_RIGHTS_CATEGORIES,
  type RightsArticle,
  type RightsDateFilter,
  type RightsFilterState,
  type RightsFilterTab,
  type RightsListItem,
  type RightsStatus,
  type RightsStatusFilter,
} from '../types/rights.types';

const RIGHTS_MONTH_INDEX: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

const parseRightsDate = (dateStr: string): number => {
  const parts = dateStr ? dateStr.trim().split(' ') : [];
  if (parts.length < 3) return 0;
  const [day, month, year] = parts;
  return Date.UTC(Number(year), RIGHTS_MONTH_INDEX[month] ?? 0, Number(day));
};

export const KnowYourRightsPage: React.FC = () => {
  const navigate = useNavigate();
  const snapshot = useSyncExternalStore(rightsStore.subscribe, rightsStore.getSnapshot);
  const articles = snapshot.articles;

  const [activeStatus, setActiveStatus] = useState<RightsStatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<RightsDateFilter>('ANY');

  // Modals state
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [previewArticle, setPreviewArticle] = useState<RightsArticle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RightsListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Kebab Menu state
  const [menuArticle, setMenuArticle] = useState<RightsListItem | null>(null);
  const [anchorPosition, setAnchorPosition] = useState<{ top: number; left: number } | null>(null);

  const stats = useMemo(() => {
    const total = articles.length;
    const published = articles.filter((a) => a.status === 'PUBLISHED').length;
    const drafts = articles.filter((a) => a.status === 'DRAFT').length;
    const archived = articles.filter((a) => a.status === 'ARCHIVED').length;
    return { total, published, drafts, archived };
  }, [articles]);

  const statusTabs = useMemo<RightsFilterTab[]>(
    () => [
      { key: 'ALL', label: 'All', count: stats.total },
      { key: 'PUBLISHED', label: 'Published', count: stats.published },
      { key: 'DRAFT', label: 'Drafts', count: stats.drafts },
      { key: 'ARCHIVED', label: 'Archived', count: stats.archived },
    ],
    [stats],
  );

  const allCategories = useMemo(() => {
    const fromArticles = Array.from(new Set(articles.map((a) => a.category))).filter(Boolean);
    const combined = Array.from(new Set([...DEFAULT_RIGHTS_CATEGORIES, ...fromArticles]));
    return combined.sort();
  }, [articles]);

  const filteredArticles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const refTimestamp = 1790800000000; // Reference 2026 baseline

    return articles
      .filter((article) => {
        if (activeStatus !== 'ALL' && article.status !== activeStatus) return false;
        if (selectedCategory && article.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
        if (selectedDateRange !== 'ANY') {
          const itemDate = parseRightsDate(article.lastUpdatedDate);
          const diffDays = Math.abs(refTimestamp - itemDate) / (1000 * 60 * 60 * 24);
          if (selectedDateRange === 'TODAY' && diffDays > 1) return false;
          if (selectedDateRange === 'WEEK' && diffDays > 7) return false;
          if (selectedDateRange === 'MONTH' && diffDays > 31) return false;
        }
        if (!q) return true;

        const haystack = [
          article.title,
          article.description,
          article.category,
          article.author,
          ...(article.tags ?? []),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => parseRightsDate(b.lastUpdatedDate) - parseRightsDate(a.lastUpdatedDate));
  }, [articles, searchQuery, activeStatus, selectedCategory, selectedDateRange]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    activeStatus !== 'ALL' ||
    selectedCategory !== null ||
    selectedDateRange !== 'ANY';

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveStatus('ALL');
    setSelectedCategory(null);
    setSelectedDateRange('ANY');
  };

  const handleCardPress = (article: RightsListItem) => {
    navigate(`/admin/rights/${article.id}`);
  };

  const handleMorePress = (article: RightsListItem, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setAnchorPosition({
      top: rect.bottom + 4,
      left: Math.max(16, rect.right - 180),
    });
    setMenuArticle(article);
  };

  const handleEdit = (article: RightsListItem) => {
    navigate(`/admin/rights/${article.id}/edit`);
  };

  const handleStatusChange = async (article: RightsListItem, newStatus: RightsStatus) => {
    await rightsStore.updateStatus(article.id, newStatus);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await rightsStore.delete(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 min-w-0">
      {/* Top Breadcrumb & Header */}
      <div className="space-y-2">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="hover:text-[#011F39] font-medium transition-colors cursor-pointer"
          >
            Content & Media
          </button>
          <ChevronRight size={13} className="text-slate-400" />
          <span className="text-slate-900 font-semibold">Know Your Rights</span>
        </div>

        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFF9E6] text-[#011F39] border border-[#FDE68A] mb-2 tracking-wide uppercase">
              <BookOpen size={12} className="text-[#B45309]" />
              <span>Legal Empowerment & Citizen Handbook</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#011F39]">
              Know Your Rights Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Statutory legal rights documentation, human rights handbook and citizen legal empowerment guides.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => navigate('/admin/rights/create')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold bg-[#FAD465] hover:bg-[#e9bf36] text-[#011F39] shadow-xs transition-colors cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>New Rights Article</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards (Balanced 4-column grid) */}
      <RightsStatsCards
        stats={stats}
        activeStatus={activeStatus}
        onSelectStatus={(status) => setActiveStatus(status)}
      />

      {/* Status Filter Tabs */}
      <RightsStatusTabs
        tabs={statusTabs}
        activeStatus={activeStatus}
        onSelectTab={(st) => setActiveStatus(st)}
      />

      {/* Search, Filter & Action Bar */}
      <RightsSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={allCategories}
        selectedDateRange={selectedDateRange}
        onDateRangeChange={setSelectedDateRange}
        onOpenFilterModal={() => setFilterModalOpen(true)}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        totalFilteredCount={filteredArticles.length}
      />

      {/* Table Container */}
      <div className="w-full min-w-0 shadow-xs rounded-xl overflow-hidden">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[820px]">
            <RightsListHeader />

            {filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <RightsCard
                  key={article.id}
                  article={article}
                  onPress={handleCardPress}
                  onMorePress={handleMorePress}
                />
              ))
            ) : (
              <div className="bg-white rounded-b-xl border border-slate-200 p-12 text-center shadow-xs">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <AlertCircle size={28} className="text-slate-400" />
                </div>
                <h3 className="font-serif font-bold text-lg text-slate-800 mb-1">
                  No Rights Articles Found
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-4">
                  No articles match the selected filters or search keyword. Try clearing filters or creating a new article.
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      <RightsFilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        categories={allCategories}
        applied={{
          status: activeStatus,
          category: selectedCategory,
          dateRange: selectedDateRange,
        }}
        onApply={(f: RightsFilterState) => {
          setActiveStatus(f.status);
          setSelectedCategory(f.category);
          setSelectedDateRange(f.dateRange);
        }}
        onReset={handleResetFilters}
      />

      {/* Preview Modal */}
      <RightsPreviewModal
        isOpen={Boolean(previewArticle)}
        onClose={() => setPreviewArticle(null)}
        article={previewArticle}
      />

      {/* Delete Confirmation Modal */}
      <RightsDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        article={deleteTarget}
        isDeleting={isDeleting}
      />

      {/* Kebab Action Context Menu */}
      <RightsActionMenu
        isOpen={Boolean(menuArticle)}
        article={menuArticle}
        anchorPosition={anchorPosition}
        onClose={() => {
          setMenuArticle(null);
          setAnchorPosition(null);
        }}
        onEdit={handleEdit}
        onStatusChange={handleStatusChange}
        onDelete={(a) => setDeleteTarget(a)}
      />
    </div>
  );
};
