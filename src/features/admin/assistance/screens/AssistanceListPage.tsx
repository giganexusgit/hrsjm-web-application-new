import type React from 'react';
import { useState, useMemo, useSyncExternalStore, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartHandshake,
  RefreshCw,
  Plus,
  Download,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type {
  AssistanceRequest,
  AssistanceTabKey,
  AssistanceFilterState,
} from '../types/assistance.types';
import { assistanceStore } from '../store/assistanceStore';
import { AssistanceStatsCards } from '../components/AssistanceStatsCards';
import { AssistanceStatusTabs } from '../components/AssistanceStatusTabs';
import { AssistanceSearchBar } from '../components/AssistanceSearchBar';
import { SeekerRowCard } from '../components/SeekerRowCard';
import { SeekerDetailsModal } from '../components/SeekerDetailsModal';
import { AddSeekerModal } from '../components/AddSeekerModal';
import { ApproveAssistanceModal } from '../components/ApproveAssistanceModal';
import { RejectAssistanceModal } from '../components/RejectAssistanceModal';
import { AssistanceFiltersModal } from '../components/AssistanceFiltersModal';

export const AssistanceListPage: React.FC = () => {
  // Reactive store snapshot
  const storeSnapshot = useSyncExternalStore(
    assistanceStore.subscribe,
    assistanceStore.getSnapshot
  );
  const requests = storeSnapshot.requests;

  // Filter & Search states
  const [selectedTab, setSelectedTab] = useState<AssistanceTabKey>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedUrgency, setSelectedUrgency] = useState('ALL');
  const [filterState, setFilterState] = useState<AssistanceFilterState>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals state
  const [detailsModalRequest, setDetailsModalRequest] = useState<AssistanceRequest | null>(null);
  const [detailsInitialTab, setDetailsInitialTab] = useState<'OVERVIEW' | 'REVIEW' | 'DOCUMENTS'>('OVERVIEW');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [filtersModalVisible, setFiltersModalVisible] = useState(false);
  const [approveModalRequest, setApproveModalRequest] = useState<AssistanceRequest | null>(null);
  const [rejectModalRequest, setRejectModalRequest] = useState<AssistanceRequest | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    assistanceStore.fetchRequests();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await assistanceStore.fetchRequests();
    setIsRefreshing(false);
  };

  // Only approved causes appear on this page.
  // Unapproved, under review, and pending donor seeker applications are managed in /admin/membership-applications
  const approvedCauses = useMemo(() => {
    return requests.filter((r) => r.status === 'APPROVED' || r.status === 'CLOSED');
  }, [requests]);

  // Compute live statistics directly from approved causes
  const stats = useMemo(() => {
    let active = 0;
    let urgent = 0;
    let completed = 0;
    let totalAmount = 0;
    let totalTarget = 0;

    for (const r of approvedCauses) {
      const raised = Number(r.raised_amount) || 0;
      const target = Number(r.requested_amount) || 0;
      totalAmount += raised;
      totalTarget += target;

      const isCompleted = r.status === 'CLOSED' || (target > 0 && raised >= target);
      if (isCompleted) {
        completed++;
      } else {
        active++;
      }

      if (r.urgency === 'HIGH' || r.urgency === 'CRITICAL') {
        urgent++;
      }
    }

    return {
      total: approvedCauses.length,
      active,
      urgent,
      completed,
      totalAmount,
      totalTarget,
    };
  }, [approvedCauses]);

  // Filtered requests list (restricted to approved donor seeker causes)
  const filteredRequests = useMemo(() => {
    let result = [...approvedCauses];

    // Status Tab filter
    if (selectedTab === 'ACTIVE') {
      result = result.filter(
        (r) => r.status === 'APPROVED' && (Number(r.raised_amount) || 0) < Number(r.requested_amount || 0)
      );
    } else if (selectedTab === 'URGENT') {
      result = result.filter((r) => r.urgency === 'HIGH' || r.urgency === 'CRITICAL');
    } else if (selectedTab === 'COMPLETED') {
      result = result.filter(
        (r) => r.status === 'CLOSED' || (Number(r.raised_amount) || 0) >= Number(r.requested_amount || 0)
      );
    }

    // Category filter
    if (selectedCategory !== 'ALL') {
      result = result.filter((r) =>
        r.reason.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Urgency filter
    if (selectedUrgency !== 'ALL') {
      result = result.filter((r) => r.urgency === selectedUrgency);
    }

    // Modal filters
    if (filterState.status) {
      result = result.filter((r) => r.status === filterState.status);
    }
    if (filterState.category) {
      result = result.filter((r) =>
        r.reason.toLowerCase().includes((filterState.category || '').toLowerCase())
      );
    }
    if (filterState.urgency) {
      result = result.filter((r) => r.urgency === filterState.urgency);
    }
    if (filterState.minAmount !== undefined) {
      result = result.filter((r) => r.requested_amount >= (filterState.minAmount || 0));
    }
    if (filterState.maxAmount !== undefined) {
      result = result.filter((r) => r.requested_amount <= (filterState.maxAmount || Infinity));
    }

    // Text search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.full_name.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.mobile.includes(q) ||
          (r.email && r.email.toLowerCase().includes(q)) ||
          r.reason.toLowerCase().includes(q) ||
          (r.city && r.city.toLowerCase().includes(q)) ||
          (r.description && r.description.toLowerCase().includes(q))
      );
    }

    return result;
  }, [approvedCauses, selectedTab, selectedCategory, selectedUrgency, filterState, searchQuery]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRequests.slice(start, start + pageSize);
  }, [filteredRequests, currentPage, pageSize]);

  const handleView = (request: AssistanceRequest) => {
    setDetailsInitialTab('OVERVIEW');
    setDetailsModalRequest(request);
  };

  const handleReview = (request: AssistanceRequest) => {
    setDetailsInitialTab('REVIEW');
    setDetailsModalRequest(request);
  };

  const handleExportCsv = () => {
    const headers = ['Case ID', 'Beneficiary Name', 'Phone', 'Email', 'Cause', 'Urgency', 'Requested Amount', 'Raised Amount', 'Status', 'City', 'Date'];
    const rows = filteredRequests.map((r) => [
      `#DS${r.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`,
      `"${r.full_name}"`,
      r.mobile,
      r.email || '',
      `"${r.reason}"`,
      r.urgency || 'NORMAL',
      r.requested_amount,
      r.raised_amount || 0,
      r.status,
      `"${r.city || ''}"`,
      r.created_at,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hrsjm_donation_seekers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasActiveFilters =
    selectedCategory !== 'ALL' ||
    selectedUrgency !== 'ALL' ||
    Boolean(filterState.category) ||
    Boolean(filterState.urgency) ||
    Boolean(filterState.status) ||
    filterState.minAmount !== undefined ||
    filterState.maxAmount !== undefined;

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
              <HeartHandshake size={18} color="#FAD465" />
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
              Donation Causes & Aid Management
            </h1>
          </div>
          <p style={{ margin: '4px 0 0 40px', fontSize: '13px', color: '#6B7280' }}>
            Fundraising, verification and disbursement of medical, education, disaster and social relief grants for approved causes
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
            <span>Create Aid Cause</span>
          </button>
        </div>
      </div>

      {/* Informational routing banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '12px 16px',
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '10px',
          marginBottom: '20px',
          fontSize: '13px',
          color: '#1E40AF',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} color="#2563EB" style={{ flexShrink: 0 }} />
          <span>
            <strong>Approved Causes Only:</strong> This page manages active relief causes and aid disbursement for approved donor seeker applications. New, unreviewed applications are processed under{' '}
            <Link to="/admin/membership-applications" style={{ color: '#1D4ED8', fontWeight: 600, textDecoration: 'underline' }}>
              All Applications
            </Link>.
          </span>
        </div>
        <Link
          to="/admin/membership-applications"
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#1D4ED8',
            backgroundColor: '#DBEAFE',
            padding: '4px 10px',
            borderRadius: '6px',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          Review Applications →
        </Link>
      </div>

      {/* Top 5 KPI Statistics Cards */}
      <AssistanceStatsCards
        stats={stats}
        selectedTab={selectedTab}
        onSelectTab={(tab) => {
          setSelectedTab(tab);
          setCurrentPage(1);
        }}
      />

      {/* Main Table Card Container */}
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
        <AssistanceStatusTabs
          selectedTab={selectedTab}
          onSelectTab={(tab) => {
            setSelectedTab(tab);
            setCurrentPage(1);
          }}
          stats={stats}
        />

        {/* Search & Actions Bar */}
        <AssistanceSearchBar
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
          selectedUrgency={selectedUrgency}
          onUrgencyChange={(urg) => {
            setSelectedUrgency(urg);
            setCurrentPage(1);
          }}
          onOpenFilterModal={() => setFiltersModalVisible(true)}
          onAddSeeker={() => setAddModalVisible(true)}
          hasActiveFilters={hasActiveFilters}
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
                <th style={thStyle}>Beneficiary & Case ID</th>
                <th style={thStyle}>Cause & Urgency</th>
                <th style={thStyle}>Fundraising Target</th>
                <th style={thStyle}>Contact & Date</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRequests.length > 0 ? (
                paginatedRequests.map((request) => (
                  <SeekerRowCard
                    key={request.id}
                    request={request}
                    onView={handleView}
                    onReview={handleReview}
                    onQuickApprove={(r) => setApproveModalRequest(r)}
                    onQuickReject={(r) => setRejectModalRequest(r)}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle size={32} color="#9CA3AF" />
                      <div style={{ fontSize: '15px', fontWeight: 600, color: '#374151' }}>
                        No assistance requests found
                      </div>
                      <div style={{ fontSize: '13px', color: '#6B7280' }}>
                        Try clearing search terms or resetting filters to view all submitted aid cases.
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTab('ALL');
                          setSelectedCategory('ALL');
                          setSelectedUrgency('ALL');
                          setSearchQuery('');
                          setFilterState({});
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
        {filteredRequests.length > 0 && (
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
              <b>{Math.min(currentPage * pageSize, filteredRequests.length)}</b> of{' '}
              <b>{filteredRequests.length}</b> assistance requests
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

      {/* Modals */}
      <SeekerDetailsModal
        visible={Boolean(detailsModalRequest)}
        onClose={() => setDetailsModalRequest(null)}
        request={detailsModalRequest}
        initialTab={detailsInitialTab}
        onStatusUpdated={() => {
          if (detailsModalRequest) {
            const updated = assistanceStore.getById(detailsModalRequest.id);
            if (updated) setDetailsModalRequest(updated);
          }
        }}
      />

      <AddSeekerModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
      />

      <ApproveAssistanceModal
        visible={Boolean(approveModalRequest)}
        onClose={() => setApproveModalRequest(null)}
        request={approveModalRequest}
      />

      <RejectAssistanceModal
        visible={Boolean(rejectModalRequest)}
        onClose={() => setRejectModalRequest(null)}
        request={rejectModalRequest}
      />

      <AssistanceFiltersModal
        visible={filtersModalVisible}
        onClose={() => setFiltersModalVisible(false)}
        filterState={filterState}
        onApply={(f) => {
          setFilterState(f);
          setCurrentPage(1);
        }}
        onReset={() => {
          setFilterState({});
          setSelectedCategory('ALL');
          setSelectedUrgency('ALL');
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
};

