import type React from 'react';
import { useState, useMemo, useSyncExternalStore, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  RefreshCw,
  Download,
  Plus,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type {
  SupportTicket,
  TicketTabKey,
  TicketStatus,
  SupportFilterState,
  CreateTicketBody,
} from '../types/support.types';
import { supportStore } from '../store/supportStore';
import { SupportStatsCards } from '../components/SupportStatsCards';
import { SupportStatusTabs } from '../components/SupportStatusTabs';
import { SupportSearchBar } from '../components/SupportSearchBar';
import { SupportTicketRow } from '../components/SupportTicketRow';
import { CreateTicketModal } from '../components/CreateTicketModal';
import { SupportFilterModal } from '../components/SupportFilterModal';
import { UpdateStatusModal } from '../components/UpdateStatusModal';

export const SupportTicketsListPage: React.FC = () => {
  const navigate = useNavigate();

  // Reactive store snapshot (cached, safe for React 19 useSyncExternalStore)
  const storeSnapshot = useSyncExternalStore(
    supportStore.subscribe,
    supportStore.getSnapshot
  );
  const tickets = storeSnapshot.tickets;
  const messagesByTicket = storeSnapshot.messagesByTicket;

  // Search & Filter state
  const [activeTab, setActiveTab] = useState<TicketTabKey>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSource, setSelectedSource] = useState('ALL');
  const [filters, setFilters] = useState<SupportFilterState>({
    status: 'ALL',
    category: 'ALL',
    priority: 'ALL',
    dateRange: 'ALL',
    source: 'ALL',
  });

  // Modals state
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [statusModalTicket, setStatusModalTicket] = useState<{
    ticket: SupportTicket;
    targetStatus: TicketStatus;
  } | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  useEffect(() => {
    supportStore.fetchTickets();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await supportStore.fetchTickets();
    setIsRefreshing(false);
  };

  // Stats calculation
  const stats = useMemo(() => {
    let open = 0;
    let inProgress = 0;
    let resolved = 0;
    let closed = 0;

    for (const t of tickets) {
      if (t.status === 'SUBMITTED') open++;
      else if (t.status === 'UNDER_REVIEW') inProgress++;
      else if (t.status === 'RESOLVED') resolved++;
      else if (t.status === 'CLOSED') closed++;
    }

    return {
      total: tickets.length,
      open,
      inProgress,
      resolved,
      closed,
    };
  }, [tickets]);

  // Tab counts
  const tabCounts: Record<TicketTabKey, number> = useMemo(() => {
    let open = 0;
    let inProgress = 0;
    let resolved = 0;
    let closed = 0;

    for (const t of tickets) {
      if (t.status === 'SUBMITTED') open++;
      else if (t.status === 'UNDER_REVIEW') inProgress++;
      else if (t.status === 'RESOLVED') resolved++;
      else if (t.status === 'CLOSED') closed++;
    }

    return {
      ALL: tickets.length,
      SUBMITTED: open,
      UNDER_REVIEW: inProgress,
      RESOLVED: resolved,
      CLOSED: closed,
    };
  }, [tickets]);

  // Active filter count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.status !== 'ALL') count++;
    if (filters.category !== 'ALL') count++;
    if (filters.priority !== 'ALL') count++;
    if (filters.source !== 'ALL') count++;
    if (filters.dateRange !== 'ALL') count++;
    return count;
  }, [filters]);

  // Filtered & Sorted Tickets
  const filteredTickets = useMemo(() => {
    let result = [...tickets];

    // Status Tab filter
    if (activeTab !== 'ALL') {
      result = result.filter((t) => t.status === activeTab);
    }

    // Modal Status filter override
    if (filters.status !== 'ALL' && activeTab === 'ALL') {
      result = result.filter((t) => t.status === filters.status);
    }

    // Category filter (SearchBar or Modal)
    const effectiveCategory =
      selectedCategory !== 'ALL' ? selectedCategory : filters.category;
    if (effectiveCategory !== 'ALL') {
      result = result.filter(
        (t) =>
          (t.category || '').toLowerCase().includes(effectiveCategory.toLowerCase()) ||
          (t.subject || '').toLowerCase().includes(effectiveCategory.toLowerCase())
      );
    }

    // Priority filter
    if (filters.priority !== 'ALL') {
      result = result.filter((t) => t.priority === filters.priority);
    }

    // Channel/Source filter
    const effectiveSource =
      selectedSource !== 'ALL' ? selectedSource : filters.source;
    if (effectiveSource !== 'ALL') {
      result = result.filter((t) => {
        const src = (t.source || '').toLowerCase();
        const desc = (t.description || '').toLowerCase();
        if (effectiveSource === 'website') {
          return src.includes('site') || desc.includes('source: website');
        }
        if (effectiveSource === 'app') {
          return src === 'app' || desc.includes('source: app');
        }
        if (effectiveSource === 'web') {
          return src === 'web' || desc.includes('source: web');
        }
        return true;
      });
    }

    // Search query filter (Subject, Ticket ID, citizen name, email, phone)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          (t.id || '').toLowerCase().includes(q) ||
          (t.subject || '').toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q) ||
          (t.user?.full_name || '').toLowerCase().includes(q) ||
          (t.user?.email || '').toLowerCase().includes(q) ||
          (t.user?.mobile_number || '').toLowerCase().includes(q)
      );
    }

    // Sort: newest first
    result.sort(
      (a, b) =>
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );

    return result;
  }, [
    tickets,
    activeTab,
    selectedCategory,
    selectedSource,
    filters,
    searchQuery,
  ]);

  // Paginated slice
  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / pageSize));
  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTickets.slice(start, start + pageSize);
  }, [filteredTickets, currentPage, pageSize]);

  // Handlers
  const handleView = (ticket: SupportTicket) => {
    navigate(`/admin/support/${ticket.id}`);
  };

  const handleOpenChat = (ticket: SupportTicket) => {
    navigate(`/admin/support/${ticket.id}/chat`);
  };

  const handleUpdateStatusTrigger = (ticket: SupportTicket, targetStatus: TicketStatus) => {
    setStatusModalTicket({ ticket, targetStatus });
  };

  const handleConfirmStatus = async (note?: string): Promise<boolean> => {
    if (!statusModalTicket) return false;
    const { ticket, targetStatus } = statusModalTicket;
    await supportStore.updateStatus(ticket.id, targetStatus, note);
    setSuccessBanner(
      `Ticket #${ticket.id} marked as ${targetStatus}. Resolution audit updated.`
    );
    setTimeout(() => setSuccessBanner(null), 4000);
    return true;
  };

  const handleCreateTicket = async (body: CreateTicketBody): Promise<boolean> => {
    const created = await supportStore.createTicket(body);
    setSuccessBanner(`Support Ticket #${created.id} created successfully.`);
    setTimeout(() => setSuccessBanner(null), 4000);
    return true;
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedSource('ALL');
    setFilters({
      status: 'ALL',
      category: 'ALL',
      priority: 'ALL',
      dateRange: 'ALL',
      source: 'ALL',
    });
    setCurrentPage(1);
  };

  const handleExportCsv = () => {
    const headers = [
      'Ticket ID',
      'Subject',
      'Complainant Name',
      'Email',
      'Phone',
      'Category',
      'Priority',
      'Channel',
      'Status',
      'Created Date',
    ];
    const rows = filteredTickets.map((t) => [
      t.id,
      `"${(t.subject || '').replace(/"/g, '""')}"`,
      `"${t.user?.full_name || 'Citizen'}"`,
      t.user?.email || '—',
      t.user?.mobile_number || '—',
      t.category || 'General',
      t.priority || 'NORMAL',
      t.source || 'web',
      t.status,
      new Date(t.created_at).toLocaleDateString('en-IN'),
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hrsjm_support_tickets_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={styles.container}>
      {/* Top Title & Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.badgeRow}>
            <span style={styles.topBadge}>CITIZEN HELPDESK & GRIEVANCES</span>
          </div>
          <h1 style={styles.title}>Support & Complaints</h1>
          <p style={styles.subtitle}>
            Manage citizen grievances, membership issues, donation queries and legal consultations
          </p>
        </div>

        <div style={styles.headerActions}>
          <button
            type="button"
            onClick={() => setCreateModalVisible(true)}
            style={styles.newTicketBtn}
            className="support-header-primary-btn"
            title="Create a new support ticket or citizen complaint"
          >
            <Plus size={16} />
            <span>New Ticket</span>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            style={styles.refreshBtn}
            className="support-header-secondary-btn"
            title="Refresh tickets list"
          >
            <RefreshCw
              size={15}
              style={{
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
              }}
            />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            style={styles.exportBtn}
            className="support-header-secondary-btn"
            title="Export filtered tickets to CSV"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div style={styles.successBanner}>
          <span>✓ {successBanner}</span>
        </div>
      )}

      {/* Summary Metrics Cards */}
      <SupportStatsCards
        stats={stats}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setCurrentPage(1);
        }}
      />

      {/* Status Lifecycle Tabs */}
      <SupportStatusTabs
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setCurrentPage(1);
        }}
        counts={tabCounts}
      />

      {/* Search Bar & Primary Actions */}
      <SupportSearchBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        selectedCategory={selectedCategory}
        onCategoryChange={(c) => {
          setSelectedCategory(c);
          setCurrentPage(1);
        }}
        selectedSource={selectedSource}
        onSourceChange={(s) => {
          setSelectedSource(s);
          setCurrentPage(1);
        }}
        activeFilterCount={activeFiltersCount}
        onOpenFilterModal={() => setFilterModalVisible(true)}
        onResetFilters={handleResetFilters}
      />

      {/* Tickets List Area */}
      {paginatedTickets.length === 0 ? (
        <div style={styles.emptyCard}>
          <div style={styles.emptyIconCircle}>
            <MessageSquare size={32} color="#718096" />
          </div>
          <h3 style={styles.emptyTitle}>No support tickets found</h3>
          <p style={styles.emptySubtitle}>
            {searchQuery || activeFiltersCount > 0
              ? 'Try adjusting your search criteria or resetting filters.'
              : 'No tickets currently registered under this status category.'}
          </p>
          <div style={{ marginTop: '16px' }}>
            {searchQuery || activeFiltersCount > 0 ? (
              <button
                type="button"
                onClick={handleResetFilters}
                style={styles.emptyResetBtn}
              >
                <RotateCcw size={14} />
                <span>Reset All Filters</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCreateModalVisible(true)}
                style={styles.emptyCreateBtn}
              >
                <Plus size={15} />
                <span>Create New Ticket</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          {paginatedTickets.map((t) => (
            <SupportTicketRow
              key={t.id}
              ticket={t}
              messageCount={(messagesByTicket[t.id] || []).length}
              onView={handleView}
              onOpenChat={handleOpenChat}
              onUpdateStatus={handleUpdateStatusTrigger}
            />
          ))}

          {/* Pagination Controls */}
          <div style={styles.paginationRow}>
            <span style={styles.pageInfo}>
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredTickets.length)} of{' '}
              {filteredTickets.length} tickets
            </span>

            <div style={styles.pageControls}>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  ...styles.pageBtn,
                  opacity: currentPage === 1 ? 0.5 : 1,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>

              <span style={styles.pageNumber}>
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                style={{
                  ...styles.pageBtn,
                  opacity: currentPage >= totalPages ? 0.5 : 1,
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateTicketModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSubmit={handleCreateTicket}
      />

      <SupportFilterModal
        visible={filterModalVisible}
        filters={filters}
        onClose={() => setFilterModalVisible(false)}
        onApply={(newFilters) => {
          setFilters(newFilters);
          setCurrentPage(1);
        }}
        onReset={() => {
          setFilters({
            status: 'ALL',
            category: 'ALL',
            priority: 'ALL',
            dateRange: 'ALL',
            source: 'ALL',
          });
          setSelectedCategory('ALL');
          setSelectedSource('ALL');
          setSearchQuery('');
          setCurrentPage(1);
        }}
      />

      <UpdateStatusModal
        visible={!!statusModalTicket}
        ticket={statusModalTicket?.ticket || null}
        targetStatus={statusModalTicket?.targetStatus || 'UNDER_REVIEW'}
        onClose={() => setStatusModalTicket(null)}
        onConfirm={handleConfirmStatus}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1440px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '24px',
  },
  badgeRow: {
    marginBottom: '6px',
  },
  topBadge: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#011F39',
    backgroundColor: '#FFF9E6',
    border: '1px solid #FDE68A',
    padding: '3px 10px',
    borderRadius: '12px',
    letterSpacing: '0.05em',
  },
  title: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: '28px',
    fontWeight: 700,
    color: '#011F39',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#34516D',
    marginTop: '4px',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  newTicketBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    padding: '9px 18px',
    borderRadius: '8px',
    border: '1px solid #E9B82E',
    backgroundColor: '#FAD465',
    color: '#011F39',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(250, 212, 101, 0.4)',
    transition: 'all 0.15s ease',
  },
  refreshBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 15px',
    borderRadius: '8px',
    border: '1px solid #DCE4EC',
    backgroundColor: '#FFFFFF',
    color: '#011F39',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
  },
  exportBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 15px',
    borderRadius: '8px',
    border: '1px solid #DCE4EC',
    backgroundColor: '#FFFFFF',
    color: '#011F39',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
  },
  successBanner: {
    backgroundColor: '#F0FDF4',
    border: '1px solid #BBF7D0',
    color: '#15803D',
    padding: '12px 18px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '20px',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #DCE4EC',
    padding: '48px 24px',
    textAlign: 'center',
  },
  emptyResetBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 18px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    backgroundColor: '#F1F5F9',
    color: '#34516D',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  emptyCreateBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 18px',
    borderRadius: '8px',
    border: '1px solid #E9B82E',
    backgroundColor: '#FAD465',
    color: '#011F39',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  emptyIconCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#EDF2F7',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: '20px',
    fontWeight: 700,
    color: '#011F39',
    margin: '0 0 6px 0',
  },
  emptySubtitle: {
    fontSize: '13px',
    color: '#718096',
    margin: 0,
  },
  paginationRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: '16px',
    padding: '12px 16px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #DCE4EC',
  },
  pageInfo: {
    fontSize: '13px',
    color: '#718096',
  },
  pageControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  pageBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #DCE4EC',
    backgroundColor: '#FFFFFF',
    fontSize: '12px',
    fontWeight: 600,
    color: '#011F39',
  },
  pageNumber: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#34516D',
  },
};
