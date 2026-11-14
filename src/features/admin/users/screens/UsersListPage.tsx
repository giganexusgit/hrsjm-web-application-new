import React, { useState, useEffect, useMemo, useSyncExternalStore } from 'react';
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
import { UserPlus, ChevronLeft, ChevronRight, UserX, RefreshCw } from 'lucide-react';

const ITEMS_PER_PAGE = 8;

export const UsersListPage: React.FC = () => {
  const navigate = useNavigate();

  // Sync external store
  useSyncExternalStore(usersStore.subscribe, usersStore.getSnapshot);

  // Filter and search states
  const [activeTab, setActiveTab] = useState<UserTypeTabKey>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | UserStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [extraFilters, setExtraFilters] = useState<UserFilterOptions>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      pool = pool.filter(u => u.status === selectedStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      pool = pool.filter(
        u =>
          (u.name || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q) ||
          (u.phone || '').toLowerCase().includes(q) ||
          (u.memberId && u.memberId.toLowerCase().includes(q))
      );
    }

    return {
      all: pool.length,
      admin: pool.filter(u => u.userType === 'admin').length,
      member: pool.filter(u => u.userType === 'member').length,
      seeker: pool.filter(u => u.userType === 'seeker').length,
      donor: pool.filter(u => u.userType === 'donor').length,
      general: pool.filter(u => u.userType === 'general').length,
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
    // Note: activeTab is NOT counted here — tab switching is a primary nav action,
    // not a "filter modal" action, so it must not widen the Filters button.
    if (selectedStatus !== 'all') count++;
    if (extraFilters.joinedFrom) count++;
    if (extraFilters.joinedTo) count++;
    if (extraFilters.sortBy && extraFilters.sortBy !== 'newest') count++;
    return count;
  }, [selectedStatus, extraFilters]);

  // Handlers for modal actions
  const handleConfirmStatusToggle = async () => {
    if (!confirmModalUser || !confirmAction) return;
    const targetUserId = confirmModalUser.id;
    const action = confirmAction;

    setConfirmModalUser(null);
    setConfirmAction(null);

    if (action === 'delete') {
      usersStore.deleteUser(targetUserId);
    } else if (action === 'block') {
      await usersStore.updateStatus(targetUserId, 'blocked');
    } else if (action === 'unblock') {
      await usersStore.updateStatus(targetUserId, 'active');
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1440px', margin: '0 auto', minWidth: 0, boxSizing: 'border-box' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
          width: '100%',
          minWidth: 0,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: '26px',
              fontWeight: 800,
              color: '#06294D',
              margin: '0 0 4px',
            }}
          >
            User Management
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0, fontWeight: 500 }}>
            Central directory to view and manage members, citizens, donation seekers, roles, and KYC credentials.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={handleRefresh}
            title="Refresh user list"
            style={{
              padding: '10px 16px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              color: '#06294D',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease',
            }}
            className="hover:bg-slate-50 active:scale-95"
          >
            <RefreshCw size={15} className={isRefreshing ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/users/add')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#FAD465',
              border: 'none',
              borderRadius: '12px',
              color: '#06294D',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(250, 212, 101, 0.45)',
              transition: 'all 0.15s ease',
            }}
            className="hover:bg-[#f5c742] active:scale-95"
          >
            <UserPlus size={18} />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <UsersStatsCards
        stats={stats}
        selectedStatus={selectedStatus}
        onSelectStatus={status => {
          setSelectedStatus(status);
          setCurrentPage(1);
        }}
      />

      {/* Filter / Search Area Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #EDF2F7',
          padding: '20px 24px 16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          marginBottom: '20px',
          width: '100%',
          minWidth: 0,
          boxSizing: 'border-box',
        }}
      >
        {/* Role Tabs */}
        <UsersTypeTabs
          activeTab={activeTab}
          onTabChange={tab => {
            setActiveTab(tab);
            setCurrentPage(1);
          }}
          counts={tabCounts}
        />

        {/* Search & Filter Trigger */}
        <UsersSearchBar
          searchQuery={searchQuery}
          onSearchChange={q => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          onFilterClick={() => setFilterModalOpen(true)}
          activeFilterCount={activeFilterCount}
        />
      </div>

      {/* Users Table / List Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #EDF2F7',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          overflow: 'hidden',
          marginBottom: '24px',
          width: '100%',
          minWidth: 0,
          boxSizing: 'border-box',
        }}
      >
        {paginatedUsers.length === 0 ? (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#FAF7F0',
                color: '#718096',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <UserX size={32} />
            </div>
            <h3
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: '18px',
                fontWeight: 700,
                color: '#011F39',
                margin: '0 0 6px',
              }}
            >
              No Users Found
            </h3>
            <p style={{ fontSize: '14px', color: '#718096', margin: '0 0 16px' }}>
              No user accounts match your current filter criteria or search query.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveTab('all');
                setSelectedStatus('all');
                setSearchQuery('');
                setExtraFilters({});
              }}
              style={{
                padding: '8px 18px',
                backgroundColor: '#011F39',
                color: '#FFFFFF',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table
                style={{
                  width: '100%',
                  minWidth: '880px',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid #EDF2F7',
                      backgroundColor: '#FAF7F0',
                    }}
                  >
                    <th
                      style={{
                        padding: '14px 18px',
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#06294D',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      User & Contact
                    </th>
                    <th
                      style={{
                        padding: '14px 18px',
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#06294D',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Membership / ID
                    </th>
                    <th
                      style={{
                        padding: '14px 18px',
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#06294D',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Role
                    </th>
                    <th
                      style={{
                        padding: '14px 18px',
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#06294D',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        padding: '14px 18px',
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#06294D',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Joined Date
                    </th>
                    <th
                      style={{
                        padding: '14px 18px',
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#06294D',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        textAlign: 'right',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map(user => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onView={u => navigate(`/admin/users/${u.id}`)}
                      onEdit={u => navigate(`/admin/users/${u.id}/edit`)}
                      onVerify={u => navigate(`/admin/users/${u.id}/verification`)}
                      onResetPassword={u => setPasswordResetUser(u)}
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
            <div
              style={{
                padding: '14px 20px',
                borderTop: '1px solid #EDF2F7',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                backgroundColor: '#FAF7F0',
              }}
            >
              <div style={{ fontSize: '13px', color: '#718096' }}>
                Showing{' '}
                <strong>
                  {Math.min(
                    (currentPage - 1) * ITEMS_PER_PAGE + 1,
                    filteredUsers.length
                  )}
                </strong>{' '}
                to{' '}
                <strong>
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)}
                </strong>{' '}
                of <strong>{filteredUsers.length}</strong> users
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #DBE5EE',
                    backgroundColor: currentPage <= 1 ? '#EDF2F7' : '#FFFFFF',
                    color: currentPage <= 1 ? '#718096' : '#011F39',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <ChevronLeft size={16} /> Prev
                </button>

                <span style={{ fontSize: '13px', fontWeight: 600, color: '#011F39', padding: '0 6px' }}>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #DBE5EE',
                    backgroundColor: currentPage >= totalPages ? '#EDF2F7' : '#FFFFFF',
                    color: currentPage >= totalPages ? '#718096' : '#011F39',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  Next <ChevronRight size={16} />
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
        onApply={filters => {
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
