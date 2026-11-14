import type React from 'react';
import { useState, useMemo, useSyncExternalStore, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw,
  Plus,
  Download,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Receipt,
  BookOpen,
} from 'lucide-react';
import type {
  ReceiptEntryItem,
  ReceiptStatsSummary,
} from '../types/receipts.types';
import { receiptsStore } from '../store/receiptsStore';
import { classifyReceipt } from '../utils/receiptClassification';
import { ReceiptStatsCards } from '../components/ReceiptStatsCards';
import { ReceiptStatusTabs } from '../components/ReceiptStatusTabs';
import { ReceiptSourceChips } from '../components/ReceiptSourceChips';
import { ReceiptMethodChips } from '../components/ReceiptMethodChips';
import { ReceiptSearchBar } from '../components/ReceiptSearchBar';
import { ReceiptCard } from '../components/ReceiptCard';
import {
  ReceiptFilterModal,
  type ReceiptFiltersState,
} from '../components/ReceiptFilterModal';
import { ReceiptCancelModal } from '../components/ReceiptCancelModal';

export const ReceiptsListPage: React.FC = () => {
  const navigate = useNavigate();

  // Reactive state from receiptsStore
  const storeSnapshot = useSyncExternalStore(
    receiptsStore.subscribe,
    receiptsStore.getSnapshot
  );
  const vouchers = storeSnapshot.vouchers;

  // Filter & Search states
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [activeSource, setActiveSource] = useState<string>('ALL');
  const [activeMethod, setActiveMethod] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [cancelModalVoucher, setCancelModalVoucher] = useState<ReceiptEntryItem | null>(null);
  const [advancedFilters, setAdvancedFilters] = useState<ReceiptFiltersState>({
    category: 'ALL',
    source: 'ALL',
    method: 'ALL',
    status: 'ALL',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load backend vouchers on mount
  useEffect(() => {
    receiptsStore.fetchVouchers();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await receiptsStore.fetchVouchers();
    setIsRefreshing(false);
  };

  // Classified vouchers with rich metadata
  const classifiedItems = useMemo(() => {
    return vouchers.map((v) => ({
      voucher: v,
      classified: classifyReceipt(v),
    }));
  }, [vouchers]);

  // Compute breakdown counts and total amounts across streams
  const stats: ReceiptStatsSummary = useMemo(() => {
    let allAmount = 0;
    let ngoDonations = 0;
    let ngoAmount = 0;
    let causeDonations = 0;
    let causeAmount = 0;
    let membership = 0;
    let membershipAmount = 0;
    let renewals = 0;
    let renewalsAmount = 0;
    let otherIncome = 0;
    let otherAmount = 0;
    let cancelled = 0;
    let cancelledAmount = 0;

    for (const { voucher, classified } of classifiedItems) {
      const amt = Number(voucher.amount) || 0;
      const isNotCancelled = voucher.status !== 'CANCELLED';

      if (isNotCancelled) {
        allAmount += amt;
      } else {
        cancelled++;
        cancelledAmount += amt;
      }

      if (classified.category === 'CAUSE_DONATION') {
        causeDonations++;
        if (isNotCancelled) causeAmount += amt;
      } else if (
        classified.category === 'NGO_DONATION' ||
        classified.category === 'GENERAL_DONATION'
      ) {
        ngoDonations++;
        if (isNotCancelled) ngoAmount += amt;
      } else if (
        classified.category === 'MEMBERSHIP_PAYMENT' ||
        classified.category === 'NEW_MEMBERSHIP'
      ) {
        membership++;
        if (isNotCancelled) membershipAmount += amt;
      } else if (
        classified.category === 'RENEWAL_PAYMENT' ||
        classified.category === 'RENEW_MEMBERSHIP'
      ) {
        renewals++;
        if (isNotCancelled) renewalsAmount += amt;
      } else {
        otherIncome++;
        if (isNotCancelled) otherAmount += amt;
      }
    }

    return {
      all: vouchers.length,
      allAmount,
      ngoDonations,
      ngoAmount,
      causeDonations,
      causeAmount,
      membership,
      membershipAmount,
      renewals,
      renewalsAmount,
      membershipAndRenewals: membership + renewals,
      membershipAndRenewalsAmount: membershipAmount + renewalsAmount,
      otherIncome,
      otherAmount,
      cancelled,
      cancelledAmount,
    };
  }, [vouchers.length, classifiedItems]);

  // Source Counts
  const sourceCounts = useMemo(() => {
    let website = 0;
    let webApp = 0;
    let app = 0;

    for (const { classified } of classifiedItems) {
      if (classified.sourceKey === 'WEBSITE') website++;
      else if (classified.sourceKey === 'WEB_APP') webApp++;
      else if (classified.sourceKey === 'APPLICATION') app++;
    }

    return {
      ALL: vouchers.length,
      WEBSITE: website,
      WEB_APP: webApp,
      APPLICATION: app,
    };
  }, [vouchers.length, classifiedItems]);

  // Method Counts
  const methodCounts = useMemo(() => {
    let upi = 0;
    let bank = 0;
    let cash = 0;
    let cheque = 0;
    let card = 0;

    for (const { voucher } of classifiedItems) {
      const m = String(voucher.payment_method || '').toUpperCase();
      if (m.includes('UPI') || m.includes('ONLINE') || m.includes('CASHFREE')) upi++;
      else if (m.includes('BANK') || m.includes('TRANSFER')) bank++;
      else if (m === 'CASH') cash++;
      else if (m === 'CHEQUE') cheque++;
      else if (m === 'CARD') card++;
    }

    return {
      ALL: vouchers.length,
      UPI: upi,
      BANK: bank,
      CASH: cash,
      CHEQUE: cheque,
      CARD: card,
    };
  }, [vouchers.length, classifiedItems]);

  // Multi-criteria Filtered Vouchers
  const filteredVouchers = useMemo(() => {
    return classifiedItems
      .filter(({ voucher, classified }) => {
        // 1. Stream Category filter (from quick tabs or advanced modal)
        const targetCategory = advancedFilters.category !== 'ALL' ? advancedFilters.category : activeCategory;
        if (targetCategory !== 'ALL') {
          if (targetCategory === 'NGO_DONATION') {
            if (classified.category !== 'NGO_DONATION' && classified.category !== 'GENERAL_DONATION') return false;
          } else if (targetCategory === 'CAUSE_DONATION') {
            if (classified.category !== 'CAUSE_DONATION') return false;
          } else if (targetCategory === 'MEMBERSHIP') {
            if (
              classified.category !== 'MEMBERSHIP_PAYMENT' &&
              classified.category !== 'NEW_MEMBERSHIP' &&
              classified.category !== 'RENEWAL_PAYMENT' &&
              classified.category !== 'RENEW_MEMBERSHIP'
            ) {
              return false;
            }
          } else if (targetCategory === 'MEMBERSHIP_PAYMENT') {
            if (classified.category !== 'MEMBERSHIP_PAYMENT' && classified.category !== 'NEW_MEMBERSHIP') return false;
          } else if (targetCategory === 'RENEWAL_PAYMENT') {
            if (classified.category !== 'RENEWAL_PAYMENT' && classified.category !== 'RENEW_MEMBERSHIP') return false;
          } else if (targetCategory === 'OTHER_INCOME') {
            if (classified.category !== 'OTHER_INCOME') return false;
          }
        }

        // 2. Origin Source Channel filter
        const targetSource = advancedFilters.source !== 'ALL' ? advancedFilters.source : activeSource;
        if (targetSource !== 'ALL') {
          if (classified.sourceKey !== targetSource) return false;
        }

        // 3. Payment Method filter
        const targetMethod = advancedFilters.method !== 'ALL' ? advancedFilters.method : activeMethod;
        if (targetMethod !== 'ALL') {
          const m = String(voucher.payment_method || '').toUpperCase();
          if (targetMethod === 'UPI' && !m.includes('UPI') && !m.includes('CASHFREE') && !m.includes('ONLINE')) return false;
          if (targetMethod === 'BANK' && !m.includes('BANK') && !m.includes('TRANSFER')) return false;
          if (targetMethod === 'CASH' && m !== 'CASH') return false;
          if (targetMethod === 'CHEQUE' && m !== 'CHEQUE') return false;
          if (targetMethod === 'CARD' && m !== 'CARD') return false;
        }

        // 4. Status filter
        if (advancedFilters.status !== 'ALL') {
          if (voucher.status !== advancedFilters.status) return false;
        }

        // 5. Date range
        if (advancedFilters.startDate) {
          if (voucher.receipt_date < advancedFilters.startDate) return false;
        }
        if (advancedFilters.endDate) {
          if (voucher.receipt_date > advancedFilters.endDate) return false;
        }

        // 6. Amount range
        if (advancedFilters.minAmount) {
          const min = parseFloat(advancedFilters.minAmount);
          if (!isNaN(min) && Number(voucher.amount) < min) return false;
        }
        if (advancedFilters.maxAmount) {
          const max = parseFloat(advancedFilters.maxAmount);
          if (!isNaN(max) && Number(voucher.amount) > max) return false;
        }

        // 7. Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const vNum = (voucher.voucher_number || '').toLowerCase();
          const recFrom = (voucher.received_from || '').toLowerCase();
          const payerName = (classified.payerName || '').toLowerCase();
          const contact = (classified.payerContact || '').toLowerCase();
          const highlight = (classified.sourceHighlightValue || '').toLowerCase();
          const refNum = (voucher.reference_number || '').toLowerCase();
          const desc = (voucher.description || '').toLowerCase();
          const acc = (voucher.income_account?.account_name || '').toLowerCase();

          return (
            vNum.includes(q) ||
            recFrom.includes(q) ||
            payerName.includes(q) ||
            contact.includes(q) ||
            highlight.includes(q) ||
            refNum.includes(q) ||
            desc.includes(q) ||
            acc.includes(q)
          );
        }

        return true;
      })
      .map((item) => item.voucher);
  }, [classifiedItems, activeCategory, activeSource, activeMethod, advancedFilters, searchQuery]);

  // Paginated slice
  const totalPages = Math.max(1, Math.ceil(filteredVouchers.length / pageSize));
  const paginatedVouchers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredVouchers.slice(start, start + pageSize);
  }, [filteredVouchers, currentPage, pageSize]);

  const hasActiveFilters =
    activeCategory !== 'ALL' ||
    activeSource !== 'ALL' ||
    activeMethod !== 'ALL' ||
    searchQuery.trim() !== '' ||
    advancedFilters.status !== 'ALL' ||
    advancedFilters.startDate !== '' ||
    advancedFilters.endDate !== '' ||
    advancedFilters.minAmount !== '' ||
    advancedFilters.maxAmount !== '';

  const handleResetFilters = () => {
    setActiveCategory('ALL');
    setActiveSource('ALL');
    setActiveMethod('ALL');
    setSearchQuery('');
    setAdvancedFilters({
      category: 'ALL',
      source: 'ALL',
      method: 'ALL',
      status: 'ALL',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
    });
    setCurrentPage(1);
  };

  const handleExportCsv = () => {
    const headers = [
      'Voucher Number',
      'Receipt Date',
      'Received From',
      'Income Account',
      'Payment Method',
      'Amount',
      'Reference Number',
      'Status',
      'Description',
    ];
    const rows = filteredVouchers.map((v) => [
      v.voucher_number,
      v.receipt_date,
      `"${v.received_from}"`,
      `"${v.income_account?.account_name || 'Income'}"`,
      v.payment_method,
      v.amount,
      `"${v.reference_number || ''}"`,
      v.status,
      `"${(v.description || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hrsjm_receipts_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmCancel = async (reason: string) => {
    if (!cancelModalVoucher) return;
    await receiptsStore.cancelVoucher(cancelModalVoucher.id, reason);
    setCancelModalVoucher(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 min-w-0 overflow-x-hidden">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-[#DCE4EC] px-6 py-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 w-full min-w-0">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#718096] uppercase tracking-[0.14em] mb-1">
            <Receipt size={14} className="text-[#06294D]" />
            <span>Inward Revenue &amp; Disbursement Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-['Playfair_Display',Georgia,serif] text-[#0B2F52] leading-tight">
            Income &amp; <span className="text-[#C9971A]">Receipt Vouchers</span>
          </h1>
          <p className="text-xs text-[#34516D] mt-1 max-w-2xl leading-relaxed">
            Record, audit, and reconcile inward revenue from donations, memberships, and grants with double-entry journal postings.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
          <button
            type="button"
            onClick={() => navigate('/admin/accounting')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#EDF2F7] hover:bg-[#DBE5EE] text-[#06294D] border border-[#DBE5EE] text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <BookOpen size={13} />
            <span>General Ledger</span>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#EDF2F7] hover:bg-[#DBE5EE] text-[#06294D] border border-[#DBE5EE] text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-[#EDF2F7] text-[#06294D] border border-[#DBE5EE] text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/receipts/create')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#FAD465] hover:bg-[#E9B82E] active:bg-[#C9971A] text-[#011F39] shadow-xs transition cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Record Income</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <ReceiptStatsCards
        stats={stats}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setCurrentPage(1);
        }}
      />

      {/* Main Unified Workspace Card */}
      <div className="bg-white rounded-xl border border-[#DCE4EC] shadow-xs overflow-hidden w-full min-w-0">
        {/* Primary Stream Tabs */}
        <ReceiptStatusTabs
          activeTab={activeCategory}
          onSelectTab={(tab) => {
            setActiveCategory(tab);
            setCurrentPage(1);
          }}
          stats={stats}
        />

        {/* Origin Channel Chips */}
        <ReceiptSourceChips
          activeSource={activeSource}
          onSelectSource={(source) => {
            setActiveSource(source);
            setCurrentPage(1);
          }}
          sourceCounts={sourceCounts}
        />

        {/* Payment Method Chips */}
        <ReceiptMethodChips
          activeMethod={activeMethod}
          onSelectMethod={(method) => {
            setActiveMethod(method);
            setCurrentPage(1);
          }}
          methodCounts={methodCounts}
        />

        {/* Search & Action Bar */}
        <ReceiptSearchBar
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          onOpenFilterModal={() => setFilterModalVisible(true)}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
          totalFilteredCount={filteredVouchers.length}
        />

        {/* Vouchers Data Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[920px] text-left text-xs border-collapse table-fixed">
            <thead>
              <tr className="bg-[#FAF7F0] border-b border-[#DCE4EC] text-[#06294D] text-[11px] font-bold uppercase tracking-[0.06em]">
                <th className="py-3 px-3.5 w-[25%]">Voucher No &amp; Stream</th>
                <th className="py-3 px-3.5 w-[21%]">Received From / Payer</th>
                <th className="py-3 px-3.5 w-[17%]">Income Allocation</th>
                <th className="py-3 px-3.5 w-[14%]">Payment Method</th>
                <th className="py-3 px-3.5 w-[14%] text-right">Amount &amp; Status</th>
                <th className="py-3 px-3.5 w-[9%] text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF2F7]">
              {paginatedVouchers.length > 0 ? (
                paginatedVouchers.map((voucher) => (
                  <ReceiptCard
                    key={voucher.id}
                    voucher={voucher}
                    onCancelVoucher={(v) => setCancelModalVoucher(v)}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-16 px-4">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-[#EDF2F7] text-[#07294E] flex items-center justify-center mb-1">
                        <AlertCircle size={24} />
                      </div>
                      <div className="font-['Playfair_Display',Georgia,serif] text-base font-bold text-[#0B2F52]">
                        No receipt vouchers found
                      </div>
                      <div className="text-xs text-[#718096] max-w-sm">
                        Try adjusting your search criteria, income stream tabs, or channel filters.
                      </div>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="mt-3 px-4 py-2 text-xs font-bold rounded-xl border border-[#DBE5EE] bg-[#EDF2F7] hover:bg-[#DBE5EE] text-[#07294E] transition cursor-pointer"
                        >
                          Clear All Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredVouchers.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#EDF2F7] bg-[#FAF7F0]/30 text-xs text-[#718096]">
            <div>
              Showing <strong className="text-[#0B2F52]">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong className="text-[#0B2F52]">{Math.min(currentPage * pageSize, filteredVouchers.length)}</strong> of{' '}
              <strong className="text-[#0B2F52]">{filteredVouchers.length}</strong> vouchers
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#DBE5EE] bg-white hover:bg-[#EDF2F7] text-[#06294D] disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs transition cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>Prev</span>
              </button>

              <span className="px-2 font-bold text-[#0B2F52]">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#DBE5EE] bg-white hover:bg-[#EDF2F7] text-[#06294D] disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs transition cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Filter Modal */}
      <ReceiptFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filters={advancedFilters}
        onApply={(f) => {
          setAdvancedFilters(f);
          setCurrentPage(1);
        }}
        onReset={handleResetFilters}
      />

      {/* Cancel Voucher Modal */}
      <ReceiptCancelModal
        visible={Boolean(cancelModalVoucher)}
        onClose={() => setCancelModalVoucher(null)}
        voucher={cancelModalVoucher}
        onConfirmCancel={handleConfirmCancel}
      />
    </div>
  );
};
