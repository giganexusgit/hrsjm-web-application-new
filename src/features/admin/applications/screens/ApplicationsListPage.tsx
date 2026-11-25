import React, { useState, useEffect, useMemo, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationsStore } from '../store/applicationsStore';
import type { ApplicationFilterOptions } from '../types/applications.types';
import { ApplicationsStatsCards } from '../components/ApplicationsStatsCards';
import { ApplicationsStatusTabs } from '../components/ApplicationsStatusTabs';
import type { StatusTabKey } from '../components/ApplicationsStatusTabs';
import { ApplicationsSearchBar } from '../components/ApplicationsSearchBar';
import { ApplicationRow } from '../components/ApplicationRow';
import { ApplicationsFilterModal } from '../components/ApplicationsFilterModal';
import { ApplicationPrintModal } from '../components/ApplicationPrintModal';
import type { MembershipApplicationItem } from '../types/applications.types';
import { RefreshCw, FileX, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 8;

export const ApplicationsListPage: React.FC = () => {
  const navigate = useNavigate();

  useSyncExternalStore(applicationsStore.subscribe, applicationsStore.getSnapshot);

  const [activeTab, setActiveTab] = useState<StatusTabKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [printApplication, setPrintApplication] = useState<MembershipApplicationItem | null>(null);
  const [extraFilters, setExtraFilters] = useState<ApplicationFilterOptions>({
    status: 'all',
    type: 'all',
    sortBy: 'newest',
  });

  useEffect(() => {
    applicationsStore.fetchApplications().catch(() => {});
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await applicationsStore.fetchApplications();
    } finally {
      setIsRefreshing(false);
    }
  };

  const allApps = applicationsStore.getAllApplications();
  const stats = useMemo(() => {
    const pool =
      extraFilters.type && extraFilters.type !== 'all'
        ? allApps.filter(a => a.accountType === extraFilters.type)
        : allApps;
    return applicationsStore.getStats(pool);
  }, [allApps, extraFilters.type]);

  // Dynamic type counts
  const typeCounts = useMemo(() => {
    return {
      all: allApps.length,
      membership: allApps.filter(a => a.accountType === 'membership').length,
      seeker: allApps.filter(a => a.accountType === 'seeker').length,
    };
  }, [allApps]);

  // Dynamic tab counts based on current search query and selected application type
  const tabCounts = useMemo(() => {
    let pool = allApps;
    if (extraFilters.type && extraFilters.type !== 'all') {
      pool = pool.filter(a => a.accountType === extraFilters.type);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      pool = pool.filter(
        a =>
          a.applicantName.toLowerCase().includes(q) ||
          a.applicationId.toLowerCase().includes(q) ||
          (a.phone && a.phone.includes(q)) ||
          (a.email && a.email.toLowerCase().includes(q)) ||
          a.membershipType.toLowerCase().includes(q)
      );
    }

    return {
      all: pool.length,
      under_review: pool.filter(a => a.status === 'under_review' || a.status === 'submitted').length,
      approved: pool.filter(a => a.status === 'approved').length,
      rejected: pool.filter(a => a.status === 'rejected').length,
    };
  }, [allApps, searchQuery, extraFilters.type]);

  // Combined filtered applications
  const filteredApps = useMemo(() => {
    const combinedFilters: ApplicationFilterOptions = {
      ...extraFilters,
      status: activeTab,
      searchQuery,
    };
    return applicationsStore.getFilteredApplications(combinedFilters);
  }, [activeTab, searchQuery, extraFilters]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredApps.length / ITEMS_PER_PAGE) || 1;
  const paginatedApps = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredApps.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredApps, currentPage]);

  const hasActiveFilters = extraFilters.type !== 'all' || extraFilters.sortBy !== 'newest';

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: '26px',
              fontWeight: 700,
              color: '#011F39',
              margin: '0 0 4px',
            }}
          >
            All Applications
          </h1>
          <p style={{ fontSize: '14px', color: '#718096', margin: 0 }}>
            Review pending membership applications and donation seeker aid requests, inspect KYC identity documents and execute approvals.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={handleRefresh}
            title="Refresh applications list"
            style={{
              padding: '10px 16px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #DBE5EE',
              borderRadius: '10px',
              color: '#011F39',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <ApplicationsStatsCards
        stats={stats}
        selectedStatus={activeTab}
        onSelectStatus={status => {
          setActiveTab(status);
          setCurrentPage(1);
        }}
      />

      {/* Search & Tabs Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #EDF2F7',
          padding: '20px 24px 16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          marginBottom: '20px',
        }}
      >
        {/* Application Category Segment Control */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
            paddingBottom: '14px',
            borderBottom: '1px solid #EDF2F7',
            flexWrap: 'wrap',
          }}
        >
          {[
            { key: 'all' as const, label: 'All Applications', count: typeCounts.all },
            { key: 'membership' as const, label: 'Membership Applications', count: typeCounts.membership },
            { key: 'seeker' as const, label: 'Cause & Aid Applications', count: typeCounts.seeker },
          ].map(t => {
            const isSelected = (extraFilters.type || 'all') === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setExtraFilters(prev => ({ ...prev, type: t.key }));
                  setCurrentPage(1);
                }}
                style={{
                  padding: '7px 16px',
                  borderRadius: '24px',
                  border: isSelected ? '1.5px solid #011F39' : '1px solid #E2E8F0',
                  backgroundColor: isSelected ? '#011F39' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : '#334155',
                  fontSize: '13px',
                  fontWeight: isSelected ? 700 : 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: isSelected ? '0 1px 3px rgba(1,31,57,0.15)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{t.label}</span>
                <span
                  style={{
                    backgroundColor: isSelected ? '#FAD465' : '#F1F5F9',
                    color: isSelected ? '#011F39' : '#475569',
                    borderRadius: '12px',
                    padding: '1px 8px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        <ApplicationsStatusTabs
          activeTab={activeTab}
          onSelectTab={tab => {
            setActiveTab(tab);
            setCurrentPage(1);
          }}
          counts={tabCounts}
        />

        <ApplicationsSearchBar
          query={searchQuery}
          onChangeQuery={q => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          onFilterClick={() => setFilterModalOpen(true)}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      {/* Applications Table Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #EDF2F7',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          overflow: 'hidden',
          marginBottom: '24px',
        }}
      >
        {paginatedApps.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
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
              <FileX size={32} />
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
              No Applications Found
            </h3>
            <p style={{ fontSize: '14px', color: '#718096', margin: '0 0 16px' }}>
              No application records match your current filter criteria or search query.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveTab('all');
                setSearchQuery('');
                setExtraFilters({ status: 'all', type: 'all', sortBy: 'newest' });
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
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #EDF2F7', backgroundColor: '#FAF7F0' }}>
                    <th
                      style={{
                        padding: '12px 16px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#011F39',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Applicant
                    </th>
                    <th
                      style={{
                        padding: '12px 16px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#011F39',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Application NO
                    </th>
                    <th
                      style={{
                        padding: '12px 16px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#011F39',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Type / Category
                    </th>
                    <th
                      style={{
                        padding: '12px 16px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#011F39',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Amount & Fee
                    </th>
                    <th
                      style={{
                        padding: '12px 16px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#011F39',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        padding: '12px 16px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#011F39',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Submitted
                    </th>
                    <th
                      style={{
                        padding: '12px 16px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#011F39',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textAlign: 'right',
                      }}
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedApps.map(app => (
                    <ApplicationRow
                      key={app.id || app.applicationId}
                      application={app}
                      onView={selected => navigate(`/admin/membership-applications/${selected.id || selected.applicationId}`)}
                      onPrint={selected => setPrintApplication(selected)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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
                  {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredApps.length)}
                </strong>{' '}
                to{' '}
                <strong>{Math.min(currentPage * ITEMS_PER_PAGE, filteredApps.length)}</strong> of{' '}
                <strong>{filteredApps.length}</strong> applications
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

      {/* Filter Modal */}
      <ApplicationsFilterModal
        isOpen={filterModalOpen}
        currentFilters={extraFilters}
        onClose={() => setFilterModalOpen(false)}
        onApply={filters => {
          setExtraFilters(filters);
          if (filters.status) setActiveTab(filters.status);
          setCurrentPage(1);
        }}
        onReset={() => {
          setExtraFilters({ status: 'all', type: 'all', sortBy: 'newest' });
          setActiveTab('all');
          setCurrentPage(1);
        }}
      />

      {/* Official Printable Application Form Modal */}
      <ApplicationPrintModal
        isOpen={Boolean(printApplication)}
        application={printApplication}
        onClose={() => setPrintApplication(null)}
      />
    </div>
  );
};
