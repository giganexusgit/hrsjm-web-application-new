import type React from 'react';
import { useState, useEffect, useMemo, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersStore } from '../store/usersStore';
import type {
  UserItem,
  UserTypeTabKey,
  UserStatus,
  UserFilterOptions,
} from '../types/user.types';
import { UsersStatsCards } from '../components/UsersStatsCards';
import { UsersSearchBar } from '../components/UsersSearchBar';
import { UsersTypeTabs } from '../components/UsersTypeTabs';
import { UserRow } from '../components/UserRow';
import { UserConfirmationModal } from '../components/UserConfirmationModal';
import { UserPasswordResetModal } from '../components/UserPasswordResetModal';
import { UserFilterModal } from '../components/UserFilterModal';
import {
  UserPlus,
  ChevronLeft,
  ChevronRight,
  UserX,
  RefreshCw,
  Download,
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export const AllUsersDirectoryPage: React.FC = () => {
  const navigate = useNavigate();

  // Reactive store subscription
  useSyncExternalStore(usersStore.subscribe, usersStore.getSnapshot);

  // Search & Filter state
  const [activeTab, setActiveTab] = useState<UserTypeTabKey>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | UserStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [extraFilters, setExtraFilters] = useState<UserFilterOptions>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Modals state
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [confirmModalUser, setConfirmModalUser] = useState<UserItem | null>(null);
  const [confirmAction, setConfirmAction] = useState<'block' | 'unblock' | 'delete' | null>(null);
  const [passwordResetUser, setPasswordResetUser] = useState<UserItem | null>(null);

  useEffect(() => {
    usersStore.fetchUsers().catch(() => {});
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await usersStore.fetchUsers();
    } finally {
      setIsRefreshing(false);
    }
  };

  const allUsers = usersStore.getAllUsers();
  const stats = usersStore.getStats();

  // Dynamic tab counts based on current status and search query
  const tabCounts = useMemo(() => {
    let pool = allUsers;
    if (selectedStatus !== 'all') {
      pool = pool.filter((u) => u.status === selectedStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      pool = pool.filter(
        (u) =>
          (u.name || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q) ||
          (u.phone || '').toLowerCase().includes(q) ||
          (u.memberId && u.memberId.toLowerCase().includes(q))
      );
    }

    return {
      all: pool.length,
      admin: pool.filter((u) => u.userType === 'admin').length,
      member: pool.filter((u) => u.userType === 'member').length,
      seeker: pool.filter((u) => u.userType === 'seeker').length,
      donor: pool.filter((u) => u.userType === 'donor').length,
      general: pool.filter((u) => u.userType === 'general').length,
    };
  }, [allUsers, selectedStatus, searchQuery]);

  // Combined filtered users
  const filteredUsers = useMemo(() => {
    const combinedFilters: UserFilterOptions = {
      ...extraFilters,
      typeTab: activeTab,
      status: selectedStatus,
      searchQuery,
    };
    return usersStore.getUsers(combinedFilters);
  }, [activeTab, selectedStatus, searchQuery, extraFilters]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedStatus !== 'all') count++;
    if (extraFilters.sortBy && extraFilters.sortBy !== 'newest') count++;
    if (extraFilters.joinedFrom) count++;
    if (extraFilters.joinedTo) count++;
    return count;
  }, [selectedStatus, extraFilters]);

  const handleExportCsv = () => {
    const headers = [
      'User ID',
      'ID',
      'Full Name',
      'Email',
      'Phone',
      'Role',
      'Status',
      'Joined Date',
      'City/Address',
    ];
    const rows = filteredUsers.map((u) => [
      u.id,
      u.memberId || '—',
      `"${u.name}"`,
      u.email,
      u.phone,
      u.userType.toUpperCase(),
      u.status.toUpperCase(),
      u.joinedDate,
      `"${u.address || '—'}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hrsjm_all_users_directory_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmStatusToggle = async () => {
    if (!confirmModalUser || !confirmAction) return;
    if (confirmAction === 'block') {
      await usersStore.updateStatus(confirmModalUser.id, 'blocked');
      setSuccessBanner(`User ${confirmModalUser.name} has been blocked.`);
    } else if (confirmAction === 'unblock') {
      await usersStore.updateStatus(confirmModalUser.id, 'active');
      setSuccessBanner(`User ${confirmModalUser.name} has been activated.`);
    } else if (confirmAction === 'delete') {
      await usersStore.deleteUser(confirmModalUser.id);
      setSuccessBanner(`User ${confirmModalUser.name} has been deleted.`);
    }
    setTimeout(() => setSuccessBanner(null), 4000);
    setConfirmModalUser(null);
    setConfirmAction(null);
  };

  return (
    <div style={styles.container}>
      {/* Header Area */}
      <div style={styles.header}>
        <div>
          <div style={styles.badgeRow}>
            <span style={styles.topBadge}>CENTRAL USER DIRECTORY</span>
          </div>
          <h1 style={styles.title}>All Users Directory</h1>
          <p style={styles.subtitle}>
            Search, filter and inspect comprehensive profiles of all registered platform users, members, seekers, donors and administrators.
          </p>
        </div>

        <div style={styles.headerActions}>
          <button
            type="button"
            onClick={handleRefresh}
            title="Refresh user list"
            style={styles.refreshBtn}
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
            title="Export all users to CSV"
            style={styles.exportBtn}
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/users/add')}
            style={styles.addBtn}
          >
            <UserPlus size={16} />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successBanner && (
        <div style={styles.successBanner}>
          <span>✓ {successBanner}</span>
        </div>
      )}

      {/* Top 4 KPI Cards */}
      <UsersStatsCards
        stats={stats}
        selectedStatus={selectedStatus}
        onSelectStatus={(status) => {
          setSelectedStatus(status);
          setCurrentPage(1);
        }}
      />

      {/* Main Filter & Search Area */}
      <div style={styles.searchSection}>
        {/* User Type Tabs (All Users, Members, Seekers, Donors, General, Admins) */}
        <UsersTypeTabs
          activeTab={activeTab}
          counts={tabCounts}
          onTabChange={(tab: UserTypeTabKey) => {
            setActiveTab(tab);
            setCurrentPage(1);
          }}
        />

        {/* Search Bar + Filters */}
        <UsersSearchBar
          searchQuery={searchQuery}
          onSearchChange={(q: string) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          onFilterClick={() => setFilterModalOpen(true)}
          activeFilterCount={activeFilterCount}
        />
      </div>

      {/* Users Listing Table */}
      <div style={styles.tableCard}>
        {paginatedUsers.length === 0 ? (
          <div style={styles.emptyCard}>
            <div style={styles.emptyIconCircle}>
              <UserX size={32} color="#718096" />
            </div>
            <h3 style={styles.emptyTitle}>No matching users found</h3>
            <p style={styles.emptySubtitle}>
              {searchQuery || activeFilterCount > 0
                ? 'Try adjusting your search criteria or resetting filters.'
                : 'No users registered in this directory view.'}
            </p>
          </div>
        ) : (
          <>
            <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeadRow}>
                    <th style={styles.th}>User & Contact</th>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Joined Date</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onView={(u) => navigate(`/admin/users/${u.id}`)}
                      onEdit={(u) => navigate(`/admin/users/${u.id}/edit`)}
                      onVerify={(u) => navigate(`/admin/users/${u.id}/verification`)}
                      onResetPassword={(u) => setPasswordResetUser(u)}
                      onToggleStatus={(u, action) => {
                        setConfirmModalUser(u);
                        setConfirmAction(action);
                      }}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div style={styles.paginationRow}>
              <span style={styles.pageInfo}>
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of{' '}
                {filteredUsers.length} users
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
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      <UserConfirmationModal
        isOpen={Boolean(confirmModalUser && confirmAction)}
        user={confirmModalUser}
        action={confirmAction}
        onConfirm={handleConfirmStatusToggle}
        onCancel={() => {
          setConfirmModalUser(null);
          setConfirmAction(null);
        }}
      />

      {/* Password Reset Modal */}
      <UserPasswordResetModal
        isOpen={Boolean(passwordResetUser)}
        user={passwordResetUser}
        onClose={() => setPasswordResetUser(null)}
      />

      {/* Advanced Filter Modal */}
      <UserFilterModal
        isOpen={filterModalOpen}
        currentFilters={{
          typeTab: activeTab,
          status: selectedStatus,
          ...extraFilters,
        }}
        onClose={() => setFilterModalOpen(false)}
        onApply={(filters) => {
          if (filters.typeTab) setActiveTab(filters.typeTab);
          if (filters.status) setSelectedStatus(filters.status);
          setExtraFilters(filters);
          setCurrentPage(1);
        }}
        onReset={() => {
          setActiveTab('all');
          setSelectedStatus('all');
          setExtraFilters({});
          setCurrentPage(1);
        }}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    maxWidth: '1440px',
    margin: '0 auto',
    minWidth: 0,
    boxSizing: 'border-box',
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
  refreshBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid #DCE4EC',
    backgroundColor: '#FFFFFF',
    color: '#011F39',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  exportBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid #DCE4EC',
    backgroundColor: '#FFFFFF',
    color: '#011F39',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  addBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#FAD465',
    color: '#011F39',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(250, 212, 101, 0.4)',
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
  searchSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #DCE4EC',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 6px rgba(1, 31, 57, 0.04)',
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
  },
  emptyCard: {
    padding: '60px 20px',
    textAlign: 'center',
  },
  emptyIconCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#FAF7F0',
    color: '#718096',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  emptyTitle: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: '18px',
    fontWeight: 700,
    color: '#011F39',
    margin: '0 0 6px',
  },
  emptySubtitle: {
    fontSize: '14px',
    color: '#718096',
    margin: 0,
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #DCE4EC',
    boxShadow: '0 2px 6px rgba(1, 31, 57, 0.04)',
    overflow: 'hidden',
    marginBottom: '24px',
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
  },
  table: {
    width: '100%',
    minWidth: '880px',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeadRow: {
    borderBottom: '1px solid #DCE4EC',
    backgroundColor: '#FAF7F0',
  },
  th: {
    padding: '14px 16px',
    fontSize: '12px',
    fontWeight: 700,
    color: '#011F39',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
  },
  paginationRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    padding: '14px 20px',
    borderTop: '1px solid #DCE4EC',
    backgroundColor: '#FFFFFF',
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
