import type React from 'react';
import { useState, useMemo, useSyncExternalStore, useEffect } from 'react';
import {
  UserCheck,
  RefreshCw,
  Plus,
  Download,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type {
  Member,
  MemberFilterTab,
  MemberSortOption,
  MembershipCategoryItem,
} from '../types/members.types';
import { membersStore, isExpiringSoon } from '../store/membersStore';
import { STANDARD_MEMBERSHIP_CATEGORIES } from '../data/membersFixtures';
import { membersService } from '../services/membersService';
import { MembersStatsCards } from '../components/MembersStatsCards';
import { MemberStatusTabs } from '../components/MemberStatusTabs';
import { MemberSearchBar } from '../components/MemberSearchBar';
import { MemberRow } from '../components/MemberRow';
import { MemberProfileModal } from '../components/MemberProfileModal';
import { MemberIdCardModal } from '../components/MemberIdCardModal';
import { AddMemberModal } from '../components/AddMemberModal';
import { EditMemberModal } from '../components/EditMemberModal';
import {
  MemberConfirmationModal,
  type ConfirmationType,
} from '../components/MemberConfirmationModal';
import { MemberFilterModal } from '../components/MemberFilterModal';

export const MembersListPage: React.FC = () => {
  // Reactive state from membersStore
  const storeSnapshot = useSyncExternalStore(
    membersStore.subscribe,
    membersStore.getSnapshot
  );
  const members = storeSnapshot.members;

  // Filter & Search states
  const [selectedTab, setSelectedTab] = useState<MemberFilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortOption, setSortOption] = useState<MemberSortOption>('default');
  const [categories, setCategories] = useState<MembershipCategoryItem[]>(STANDARD_MEMBERSHIP_CATEGORIES);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals state
  const [profileModalMember, setProfileModalMember] = useState<Member | null>(null);
  const [idCardModalMember, setIdCardModalMember] = useState<Member | null>(null);
  const [editModalMember, setEditModalMember] = useState<Member | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState<{
    visible: boolean;
    type: ConfirmationType;
    member: Member | null;
  }>({
    visible: false,
    type: 'TOGGLE_STATUS',
    member: null,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load backend categories & members on mount
  useEffect(() => {
    membersService.getCategories().then((cats) => {
      if (Array.isArray(cats) && cats.length > 0) {
        setCategories(cats);
      }
    });
    membersStore.fetchMembers();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await membersStore.fetchMembers();
    setIsRefreshing(false);
  };

  // Compute live statistics
  const stats = useMemo(() => {
    let active = 0;
    let expiringSoon = 0;
    let inactive = 0;
    let pending = 0;

    for (const m of members) {
      if (m.status === 'ACTIVE' || m.status === 'EXPIRING_SOON') {
        active++;
        if (isExpiringSoon(m.validTill)) expiringSoon++;
      } else if (m.status === 'INACTIVE') {
        inactive++;
      } else if (m.status === 'PENDING') {
        pending++;
      }
    }

    return {
      total: members.length,
      active,
      expiringSoon,
      inactive,
      pending,
    };
  }, [members]);

  // Filtered & Sorted Members List
  const filteredMembers = useMemo(() => {
    let result = [...members];

    // Status Tab filter
    if (selectedTab === 'ACTIVE') {
      result = result.filter((m) => m.status === 'ACTIVE' || m.status === 'EXPIRING_SOON');
    } else if (selectedTab === 'EXPIRING_SOON') {
      result = result.filter(
        (m) => (m.status === 'ACTIVE' || m.status === 'EXPIRING_SOON') && isExpiringSoon(m.validTill)
      );
    } else if (selectedTab === 'INACTIVE') {
      result = result.filter((m) => m.status === 'INACTIVE');
    } else if (selectedTab === 'PENDING') {
      result = result.filter((m) => m.status === 'PENDING');
    }

    // Category filter
    if (selectedCategory !== 'ALL') {
      result = result.filter(
        (m) =>
          m.categoryId === selectedCategory ||
          m.categoryName?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Search query filter (name, phone, email, membershipId, address, city)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          (m.name || '').toLowerCase().includes(q) ||
          (m.phone || '').toLowerCase().includes(q) ||
          (m.email || '').toLowerCase().includes(q) ||
          (m.membershipId || '').toLowerCase().includes(q) ||
          (m.categoryName || '').toLowerCase().includes(q) ||
          (m.city || '').toLowerCase().includes(q)
      );
    }

    // Sort order
    if (sortOption === 'name_asc') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortOption === 'joined_desc') {
      result.sort((a, b) => new Date(b.joinedDate || 0).getTime() - new Date(a.joinedDate || 0).getTime());
    } else if (sortOption === 'expiry_asc') {
      result.sort((a, b) => {
        const timeA = a.validTill && !a.validTill.includes('Lifetime') ? new Date(a.validTill).getTime() : Infinity;
        const timeB = b.validTill && !b.validTill.includes('Lifetime') ? new Date(b.validTill).getTime() : Infinity;
        return timeA - timeB;
      });
    }

    return result;
  }, [members, selectedTab, selectedCategory, searchQuery, sortOption]);

  // Paginated slice
  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize));
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, currentPage, pageSize]);

  // Modal Triggers
  const handleView = (member: Member) => {
    setProfileModalMember(member);
  };

  const handleViewIdCard = (member: Member) => {
    setIdCardModalMember(member);
  };

  const handleEdit = (member: Member) => {
    setEditModalMember(member);
  };

  const handleResetPassword = (member: Member) => {
    setConfirmationModal({
      visible: true,
      type: 'RESET_PASSWORD',
      member,
    });
  };

  const handleToggleStatus = (member: Member) => {
    setConfirmationModal({
      visible: true,
      type: 'TOGGLE_STATUS',
      member,
    });
  };

  const handleConfirmAction = async (notes?: string) => {
    if (!confirmationModal.member) return;
    const member = confirmationModal.member;

    if (confirmationModal.type === 'TOGGLE_STATUS') {
      const newStatus =
        member.status === 'ACTIVE' || member.status === 'EXPIRING_SOON'
          ? 'INACTIVE'
          : 'ACTIVE';
      await membersStore.updateStatus(member.id, newStatus, notes);
      // update profile modal if currently open
      if (profileModalMember?.id === member.id) {
        setProfileModalMember({
          ...profileModalMember,
          status: newStatus,
        });
      }
      return true;
    } else if (confirmationModal.type === 'RESET_PASSWORD') {
      return await membersStore.resetPassword(member.id);
    }
  };

  const handleExportCsv = () => {
    const headers = ['Membership ID', 'Full Name', 'Phone', 'Email', 'Category', 'Status', 'Joined Date', 'Valid Till', 'Address'];
    const rows = filteredMembers.map((m) => [
      m.membershipId,
      `"${m.name}"`,
      m.phone,
      m.email,
      `"${m.categoryName || ''}"`,
      m.status,
      m.joinedDate,
      m.validTill,
      `"${[m.address, m.city, m.state, m.pincode].filter(Boolean).join(', ')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hrsjm_members_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ width: '100%', maxWidth: '1440px', minWidth: 0, margin: '0 auto' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#011F39',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserCheck size={18} color="#FAD465" />
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: '22px',
                fontWeight: 700,
                color: '#011F39',
                letterSpacing: '-0.02em',
              }}
            >
              Members Directory
            </h1>
          </div>
          <p style={{ margin: '4px 0 0 40px', fontSize: '13px', color: '#6B7280' }}>
            Official register of active, verified and honorary organization members across state and national councils
          </p>
        </div>

        {/* Global Page Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              fontSize: '13px',
              fontWeight: 500,
              borderRadius: '8px',
              border: '1px solid #D1D5DB',
              backgroundColor: '#FFFFFF',
              color: '#374151',
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
            }}
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              fontSize: '13px',
              fontWeight: 500,
              borderRadius: '8px',
              border: '1px solid #D1D5DB',
              backgroundColor: '#FFFFFF',
              color: '#374151',
              cursor: 'pointer',
            }}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setAddModalVisible(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              fontSize: '13.5px',
              fontWeight: 600,
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#011F39',
              color: '#FAD465',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(1, 31, 57, 0.15)',
            }}
          >
            <Plus size={16} color="#FAD465" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Statistics Cards */}
      <MembersStatsCards
        stats={stats}
        selectedTab={selectedTab}
        onSelectTab={(tab) => {
          setSelectedTab(tab);
          setCurrentPage(1);
        }}
      />

      {/* Main Content Card Container */}
      <div
        style={{
          width: '100%',
          minWidth: 0,
          boxSizing: 'border-box',
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          padding: '20px',
        }}
      >
        {/* Status Filter Tabs */}
        <MemberStatusTabs
          selectedTab={selectedTab}
          onSelectTab={(tab) => {
            setSelectedTab(tab);
            setCurrentPage(1);
          }}
          stats={stats}
        />

        {/* Search & Actions Bar */}
        <MemberSearchBar
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          selectedCategory={selectedCategory}
          onCategoryChange={(cat) => {
            setSelectedCategory(cat);
            setCurrentPage(1);
          }}
          categories={categories}
          sortOption={sortOption}
          onSortChange={setSortOption}
          onOpenFilterModal={() => setFilterModalVisible(true)}
          onAddMember={() => setAddModalVisible(true)}
          hasActiveFilters={selectedCategory !== 'ALL' || sortOption !== 'default'}
        />

        {/* Data Table */}
        <div
          style={{
            width: 'calc(100% + 40px)',
            margin: '0 -20px',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <table
            style={{
              width: '100%',
              minWidth: '960px',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '13.5px',
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: '#F9FAFB',
                  borderBottom: '1px solid #E5E7EB',
                  borderTop: '1px solid #E5E7EB',
                }}
              >
                <th style={thStyle}>Member Name & ID</th>
                <th style={thStyle}>Contact</th>
                <th style={thStyle}>Category / Post</th>
                <th style={thStyle}>Validity & Dates</th>
                <th style={thStyle}>Days Left</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMembers.length > 0 ? (
                paginatedMembers.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    onView={handleView}
                    onViewIdCard={handleViewIdCard}
                    onEdit={handleEdit}
                    onResetPassword={handleResetPassword}
                    onToggleStatus={handleToggleStatus}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle size={32} color="#9CA3AF" />
                      <div style={{ fontSize: '15px', fontWeight: 600, color: '#374151' }}>
                        No members found
                      </div>
                      <div style={{ fontSize: '13px', color: '#6B7280' }}>
                        Try adjusting your search criteria, category filters or lifecycle tabs.
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTab('ALL');
                          setSelectedCategory('ALL');
                          setSearchQuery('');
                          setSortOption('default');
                        }}
                        style={{
                          marginTop: '8px',
                          padding: '6px 14px',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          borderRadius: '6px',
                          border: '1px solid #011F39',
                          backgroundColor: '#FFFFFF',
                          color: '#011F39',
                          cursor: 'pointer',
                        }}
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredMembers.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '16px',
              borderTop: '1px solid #E5E7EB',
              marginTop: '12px',
              fontSize: '13px',
              color: '#4B5563',
            }}
          >
            <div>
              Showing{' '}
              <b>{(currentPage - 1) * pageSize + 1}</b> to{' '}
              <b>{Math.min(currentPage * pageSize, filteredMembers.length)}</b> of{' '}
              <b>{filteredMembers.length}</b> members
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1,
                }}
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>

              <span style={{ padding: '0 8px', fontWeight: 600 }}>
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.5 : 1,
                }}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Comprehensive Modals */}
      <MemberProfileModal
        visible={Boolean(profileModalMember)}
        onClose={() => setProfileModalMember(null)}
        member={profileModalMember}
        onEdit={(m) => {
          setProfileModalMember(null);
          setEditModalMember(m);
        }}
        onResetPassword={handleResetPassword}
        onToggleStatus={handleToggleStatus}
      />

      <MemberIdCardModal
        visible={Boolean(idCardModalMember)}
        onClose={() => setIdCardModalMember(null)}
        member={idCardModalMember}
      />

      <AddMemberModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        categories={categories}
      />

      <EditMemberModal
        visible={Boolean(editModalMember)}
        onClose={() => setEditModalMember(null)}
        member={editModalMember}
        categories={categories}
      />

      <MemberConfirmationModal
        visible={confirmationModal.visible}
        onClose={() => setConfirmationModal({ visible: false, type: 'TOGGLE_STATUS', member: null })}
        type={confirmationModal.type}
        member={confirmationModal.member}
        onConfirm={handleConfirmAction}
      />

      <MemberFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        selectedStatus={selectedTab}
        selectedSort={sortOption}
        onApply={({ category, status, sort }) => {
          setSelectedCategory(category);
          setSelectedTab(status as MemberFilterTab);
          setSortOption(sort);
          setCurrentPage(1);
        }}
        onReset={() => {
          setSelectedCategory('ALL');
          setSelectedTab('ALL');
          setSortOption('default');
          setCurrentPage(1);
        }}
      />
    </div>
  );
};

const thStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: '12px',
  fontWeight: 600,
  color: '#4B5563',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  whiteSpace: 'nowrap',
};
