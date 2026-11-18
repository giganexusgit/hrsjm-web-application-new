import React, { useEffect, useMemo, useState, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Plus, Download, RotateCw, BookOpen } from 'lucide-react';
import { useDonationsStore, donationsStore } from '../store/donationsStore';
import { DonationStatsCards } from '../components/DonationStatsCards';
import { DonationCategoryTabs } from '../components/DonationCategoryTabs';
import { DonationFilterBar } from '../components/DonationFilterBar';
import { DonationsTable } from '../components/DonationsTable';
import { DonationDetailsModal } from '../components/DonationDetailsModal';
import { DonationReceiptModal } from '../components/DonationReceiptModal';
import { AddDonationModal } from '../components/AddDonationModal';
import { RefundConfirmModal } from '../components/RefundConfirmModal';
import { donationsService } from '../services/donationsService';
import type {
  CreateDonationInput,
  DonationCategory,
  DonationReceiptModel,
  DonationRowModel,
  DonationStatus,
  DateRange,
} from '../types/donations.types';

export const DonationsListPage: React.FC = () => {
  const navigate = useNavigate();
  const store = useDonationsStore();
  const [, startTransition] = useTransition();

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedDetailsRow, setSelectedDetailsRow] = useState<DonationRowModel | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<DonationReceiptModel | null>(null);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedRefundRow, setSelectedRefundRow] = useState<DonationRowModel | null>(null);
  const [isSubmittingDonation, setIsSubmittingDonation] = useState(false);
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    donationsStore.fetchDonations();
  }, []);

  // Filtered donations list based on active tab, search, status, source, date range
  const filteredDonations = useMemo(() => {
    let list = store.donations;

    // 1. Tab category filter
    if (store.activeTab !== 'ALL') {
      list = list.filter(d => d.donation_type === store.activeTab);
    }

    // 2. Status filter
    if (store.status) {
      list = list.filter(d => d.status?.toUpperCase() === store.status?.toUpperCase());
    }

    // 3. Source filter
    if (store.source && store.source !== 'ALL') {
      list = list.filter(d => (d.source ?? '').toLowerCase() === store.source?.toLowerCase());
    }

    // 4. Date range filter
    if (store.dateRange.from || store.dateRange.to) {
      list = list.filter(d => {
        const dTime = new Date(d.created_at).getTime();
        if (isNaN(dTime)) return true;
        if (store.dateRange.from) {
          const fromTime = new Date(`${store.dateRange.from}T00:00:00`).getTime();
          if (dTime < fromTime) return false;
        }
        if (store.dateRange.to) {
          const toTime = new Date(`${store.dateRange.to}T23:59:59.999`).getTime();
          if (dTime > toTime) return false;
        }
        return true;
      });
    }

    // 5. Search query
    if (store.search.trim()) {
      const q = store.search.trim().toLowerCase();
      list = list.filter(d => {
        const name = d.donor_name.toLowerCase();
        const mobile = (d.donor_mobile || '').toLowerCase();
        const code = (d.member_code || '').toLowerCase();
        const cause = d.cause.toLowerCase();
        const remark = (d.remark || '').toLowerCase();
        const src = (d.source || '').toLowerCase();
        const amt = String(d.amount);
        return (
          name.includes(q) ||
          mobile.includes(q) ||
          code.includes(q) ||
          cause.includes(q) ||
          remark.includes(q) ||
          src.includes(q) ||
          amt.includes(q)
        );
      });
    }

    return list;
  }, [
    store.donations,
    store.activeTab,
    store.status,
    store.source,
    store.dateRange,
    store.search,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredDonations.length / pageSize));
  const paginatedDonations = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredDonations.slice(startIndex, startIndex + pageSize);
  }, [filteredDonations, page, pageSize]);

  const handleTabChange = (tab: DonationCategory) => {
    setPage(1);
    startTransition(() => {
      donationsStore.setTab(tab);
    });
  };

  const handleSearchChange = (q: string) => {
    setPage(1);
    startTransition(() => {
      donationsStore.setSearch(q);
    });
  };

  const handleStatusChange = (status: DonationStatus | null) => {
    setPage(1);
    startTransition(() => {
      donationsStore.setStatus(status);
    });
  };

  const handleSourceChange = (source: string | null) => {
    setPage(1);
    startTransition(() => {
      donationsStore.setSource(source);
    });
  };

  const handleDateRangeChange = (range: DateRange) => {
    setPage(1);
    startTransition(() => {
      donationsStore.setDateRange(range);
    });
  };

  const handleResetFilters = () => {
    setPage(1);
    startTransition(() => {
      donationsStore.resetFilters();
    });
  };

  const handleRefresh = () => {
    startTransition(() => {
      donationsStore.refresh();
    });
  };

  const handleExportCsv = () => {
    donationsService.exportDonationsCsv(filteredDonations);
  };

  const handleViewDetails = (row: DonationRowModel) => {
    setSelectedDetailsRow(row);
    setDetailsModalOpen(true);
  };

  const handleViewReceipt = async (row: DonationRowModel) => {
    try {
      const receipt = await donationsService.getReceiptByDonationId(row.id);
      setSelectedReceipt(receipt);
      setReceiptModalOpen(true);
    } catch (e) {
      console.error('Failed to load receipt:', e);
    }
  };

  const handleOpenRefund = (row: DonationRowModel) => {
    setSelectedRefundRow(row);
    setRefundModalOpen(true);
  };

  const handleConfirmRefund = async (id: string, reason: string) => {
    setIsProcessingRefund(true);
    try {
      await donationsStore.refundDonation(id, reason);
    } finally {
      setIsProcessingRefund(false);
    }
  };

  const handleCreateDonation = async (input: CreateDonationInput) => {
    setIsSubmittingDonation(true);
    try {
      await donationsStore.addDonation(input);
    } finally {
      setIsSubmittingDonation(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#011F39] text-[#FAD465] rounded-xl shadow-sm">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-serif">Donations Management</h1>
              <p className="text-sm text-slate-500">
                Track public contributions, recurring mandates, 80G tax receipts and donor records.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => navigate('/admin/accounting')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors cursor-pointer"
          >
            <BookOpen className="h-4 w-4 text-[#011F39]" />
            <span>General Ledger</span>
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={store.isRefreshing}
            title="Refresh donations"
            className="p-2 rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 shadow-sm transition-colors disabled:opacity-50"
          >
            <RotateCw className={`h-4 w-4 ${store.isRefreshing ? 'animate-spin text-[#011F39]' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors"
          >
            <Download className="h-4 w-4 text-slate-500" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#011F39] text-[#FAD465] text-xs font-semibold hover:bg-[#022c50] shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4 text-[#FAD465]" />
            <span>+ Add Donation</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <DonationStatsCards stats={store.stats} />

      {/* Main Container */}
      <div className="space-y-4">
        {/* Category Tabs */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <DonationCategoryTabs
            activeTab={store.activeTab}
            onTabChange={handleTabChange}
            counts={store.tabCounts}
          />
        </div>

        {/* Filter Bar */}
        <DonationFilterBar
          search={store.search}
          onSearchChange={handleSearchChange}
          status={store.status}
          onStatusChange={handleStatusChange}
          source={store.source}
          onSourceChange={handleSourceChange}
          dateRange={store.dateRange}
          onDateRangeChange={handleDateRangeChange}
          onResetFilters={handleResetFilters}
        />

        {/* Donations Table */}
        <DonationsTable
          donations={paginatedDonations}
          onViewDetails={handleViewDetails}
          onViewReceipt={handleViewReceipt}
          onRefund={handleOpenRefund}
        />

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white px-4 py-3 border border-slate-200 rounded-xl shadow-sm text-xs">
            <span className="text-slate-500">
              Showing <strong className="text-slate-800">{(page - 1) * pageSize + 1}</strong> to{' '}
              <strong className="text-slate-800">
                {Math.min(page * pageSize, filteredDonations.length)}
              </strong>{' '}
              of <strong className="text-slate-800">{filteredDonations.length}</strong> donations
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Previous
              </button>
              <div className="flex items-center px-2 font-semibold text-slate-700">
                {page} / {totalPages}
              </div>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddDonationModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleCreateDonation}
        isSubmitting={isSubmittingDonation}
      />

      <DonationDetailsModal
        row={detailsModalOpen ? selectedDetailsRow : null}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedDetailsRow(null);
        }}
        onViewReceipt={handleViewReceipt}
        onRefund={handleOpenRefund}
      />

      <DonationReceiptModal
        receipt={receiptModalOpen ? selectedReceipt : null}
        onClose={() => {
          setReceiptModalOpen(false);
          setSelectedReceipt(null);
        }}
      />

      <RefundConfirmModal
        row={selectedRefundRow}
        isOpen={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
        onConfirm={handleConfirmRefund}
        isProcessing={isProcessingRefund}
      />
    </div>
  );
};
