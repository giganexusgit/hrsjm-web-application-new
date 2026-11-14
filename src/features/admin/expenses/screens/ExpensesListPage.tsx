import type React from 'react';
import { useState, useMemo, useEffect, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertCircle, Receipt, RefreshCw } from 'lucide-react';
import { expensesStore } from '../store/expensesStore';
import { ExpenseStatsCards } from '../components/ExpenseStatsCards';
import { ExpenseStatusTabs } from '../components/ExpenseStatusTabs';
import { ExpenseSearchBar } from '../components/ExpenseSearchBar';
import { ExpenseListHeader, ExpenseCard } from '../components/ExpenseCard';
import { ExpenseCancelModal } from '../components/ExpenseCancelModal';
import type { ExpenseEntryItem } from '../types/expenses.types';

export const ExpensesListPage: React.FC = () => {
  const navigate = useNavigate();
  const snapshot = useSyncExternalStore(expensesStore.subscribe, expensesStore.getSnapshot);
  const vouchers = snapshot.vouchers;

  const [activeStatus, setActiveStatus] = useState<string>('ALL');
  const [activeMethod, setActiveMethod] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Cancel Modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellingVoucher, setCancellingVoucher] = useState<ExpenseEntryItem | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    expensesStore.syncFromBackend();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await expensesStore.syncFromBackend();
    } finally {
      setIsRefreshing(false);
    }
  };

  const stats = useMemo(() => {
    const all = vouchers.length;
    const posted = vouchers.filter((v) => v.status === 'POSTED').length;
    const cancelled = vouchers.filter((v) => v.status === 'CANCELLED').length;
    const totalAmount = vouchers
      .filter((v) => v.status === 'POSTED')
      .reduce((sum, v) => sum + (Number(v.amount) || 0), 0);

    return { all, posted, cancelled, totalAmount };
  }, [vouchers]);

  const filteredVouchers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = vouchers.filter((voucher) => {
      // Status filter
      if (activeStatus !== 'ALL' && voucher.status !== activeStatus) {
        return false;
      }
      // Payment method filter
      if (activeMethod !== 'ALL') {
        const method = voucher.payment_method;
        if (activeMethod === 'BANK_TRANSFER' && method !== 'BANK_TRANSFER') return false;
        if (activeMethod === 'CASH' && method !== 'CASH') return false;
        if (activeMethod === 'UPI' && method !== 'UPI') return false;
        if (activeMethod === 'CHEQUE' && method !== 'CHEQUE') return false;
        if (activeMethod === 'CARD' && method !== 'CARD') return false;
      }
      // Category filter
      if (selectedCategory !== 'ALL') {
        const catCode = voucher.expense_account?.account_code || voucher.expense_account_id;
        if (catCode !== selectedCategory) return false;
      }
      // Search query filter
      if (q) {
        const inNum = voucher.voucher_number.toLowerCase().includes(q);
        const inPayee = voucher.paid_to.toLowerCase().includes(q);
        const inDesc = (voucher.description || '').toLowerCase().includes(q);
        const inRef = (voucher.reference_number || '').toLowerCase().includes(q);
        const inAcc = (voucher.expense_account?.account_name || '').toLowerCase().includes(q);
        if (!inNum && !inPayee && !inDesc && !inRef && !inAcc) {
          return false;
        }
      }
      return true;
    });

    // Always sort latest transactions on top (newest created_at first, then voucher number descending)
    return filtered.sort((a, b) => {
      const timeB = new Date(b.created_at || b.expense_date || 0).getTime();
      const timeA = new Date(a.created_at || a.expense_date || 0).getTime();
      if (timeB !== timeA) return timeB - timeA;
      return (b.voucher_number || '').localeCompare(a.voucher_number || '');
    });
  }, [vouchers, activeStatus, activeMethod, selectedCategory, searchQuery]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    activeStatus !== 'ALL' ||
    activeMethod !== 'ALL' ||
    selectedCategory !== 'ALL';

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveStatus('ALL');
    setActiveMethod('ALL');
    setSelectedCategory('ALL');
  };

  const handleVoucherClick = (voucher: ExpenseEntryItem) => {
    navigate(`/admin/expenses/${voucher.id}`);
  };

  const handleConfirmCancel = async (reason: string) => {
    if (!cancellingVoucher) return;
    setIsCancelling(true);
    try {
      await expensesStore.cancel(cancellingVoucher.id, reason);
      setCancelModalOpen(false);
      setCancellingVoucher(null);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 min-w-0">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-[#DCE4EC] px-6 py-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#718096] uppercase tracking-[0.14em] mb-1">
            <Receipt size={14} className="text-[#06294D]" />
            <span>Financial Audit &amp; Disbursement Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-['Playfair_Display',Georgia,serif] text-[#0B2F52] leading-tight">
            Expenses &amp; <span className="text-[#C9971A]">Payment Vouchers</span>
          </h1>
          <p className="text-xs text-[#34516D] mt-1 max-w-2xl leading-relaxed">
            Record, track, audit and manage organizational expenditures with automatic double-entry ledger posting.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#EDF2F7] hover:bg-[#DBE5EE] text-[#06294D] border border-[#DBE5EE] transition cursor-pointer"
            title="Sync with database"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/accounting')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#EDF2F7] hover:bg-[#DBE5EE] text-[#06294D] border border-[#DBE5EE] transition cursor-pointer"
          >
            <span>General Ledger</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/expenses/create')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#FAD465] hover:bg-[#E9B82E] active:bg-[#C9971A] text-[#011F39] shadow-xs transition cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* 4-column Executive KPI Stats Grid */}
      <ExpenseStatsCards
        stats={stats}
        activeStatus={activeStatus}
        onSelectStatus={(st) => setActiveStatus(st)}
      />

      {/* Unified Data Table & Filter Workspace */}
      <div className="bg-white rounded-xl border border-[#DCE4EC] shadow-xs overflow-hidden w-full min-w-0">
        {/* Primary Status Filter Tabs */}
        <ExpenseStatusTabs
          activeStatus={activeStatus}
          onSelectStatus={setActiveStatus}
          counts={{ all: stats.all, posted: stats.posted, cancelled: stats.cancelled }}
        />

        {/* Integrated Search Input, Payment Method & Category Toolbar */}
        <ExpenseSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          activeMethod={activeMethod}
          onMethodChange={setActiveMethod}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={handleResetFilters}
          totalFilteredCount={filteredVouchers.length}
        />

        {/* Table Content with controlled horizontal scrolling container */}
        <div className="overflow-x-auto w-full">
          <div className="min-w-[960px]">
            <ExpenseListHeader />

            {filteredVouchers.length > 0 ? (
              <div>
                {filteredVouchers.map((v) => (
                  <ExpenseCard
                    key={v.id}
                    voucher={v}
                    onPress={handleVoucherClick}
                  />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-[#EDF2F7] text-[#06294D] flex items-center justify-center mx-auto mb-2">
                  <AlertCircle size={26} />
                </div>
                <h3 className="font-['Playfair_Display',Georgia,serif] font-bold text-lg text-[#0B2F52]">
                  No Expense Vouchers Found
                </h3>
                <p className="text-xs text-[#718096] max-w-sm mx-auto leading-relaxed">
                  No vouchers match the current search or category filters. Try clearing filters or record a new expense.
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#EDF2F7] hover:bg-[#DBE5EE] text-[#06294D] border border-[#DBE5EE] transition-colors cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <ExpenseCancelModal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setCancellingVoucher(null);
        }}
        onConfirm={handleConfirmCancel}
        voucher={cancellingVoucher}
        isCancelling={isCancelling}
      />
    </div>
  );
};
