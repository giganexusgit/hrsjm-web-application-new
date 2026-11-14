import type React from 'react';
import { useState, useMemo, useSyncExternalStore, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Scale,
  RefreshCw,
  Download,
  Search,
  Plus,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ExternalLink,
  Calendar,
  Smartphone,
  Banknote,
  Building2,
  CreditCard,
  FileText,
  X,
  Filter,
} from 'lucide-react';
import { accountingStore } from '../store/accountingStore';
import type { AccountingActiveTab } from '../components/AccountingTabs';
import { LedgerSummaryCards } from '../components/LedgerSummaryCards';
import { LedgerModeChips } from '../components/LedgerModeChips';
import { ChartOfAccountsTree } from '../components/ChartOfAccountsTree';
import { CreateAccountModal } from '../components/CreateAccountModal';
import { AccountDetailModal } from '../components/AccountDetailModal';
import { JournalEntriesTable } from '../components/JournalEntriesTable';
import { JournalEntryLinesModal } from '../components/JournalEntryLinesModal';
import { CreateJournalEntryModal } from '../components/CreateJournalEntryModal';
import { ReverseJournalModal } from '../components/ReverseJournalModal';
import { PassbookExportModal } from '../components/PassbookExportModal';
import type {
  AccountItem,
  JournalEntryItem,
  LedgerTransaction,
  MainAccountingMode,
} from '../types/accounting.types';
import { formatINR } from '../types/accounting.types';

const formatLedgerDate = (dateStr?: string): string => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const renderPaymentModeBadge = (mode?: string | null) => {
  if (!mode) {
    return <span className="text-[11px] text-slate-400">via Bank Account</span>;
  }
  const m = mode.toUpperCase();
  if (m.includes('UPI')) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md whitespace-nowrap">
        <Smartphone size={11} className="text-indigo-600" />
        <span>UPI</span>
      </span>
    );
  }
  if (m.includes('CASHFREE') || m.includes('GATEWAY') || m.includes('ONLINE')) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-700 bg-purple-50 border border-purple-200/80 px-2 py-0.5 rounded-md whitespace-nowrap">
        <CreditCard size={11} className="text-purple-600" />
        <span>Online</span>
      </span>
    );
  }
  if (m.includes('CASH')) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md whitespace-nowrap">
        <Banknote size={11} className="text-emerald-600" />
        <span>Cash</span>
      </span>
    );
  }
  if (m.includes('BANK') || m.includes('TRANSFER') || m.includes('NEFT') || m.includes('RTGS') || m.includes('IMPS')) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md whitespace-nowrap">
        <Building2 size={11} className="text-blue-600" />
        <span>Bank Transfer</span>
      </span>
    );
  }
  if (m.includes('CHEQUE')) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md whitespace-nowrap">
        <FileText size={11} className="text-amber-600" />
        <span>Cheque</span>
      </span>
    );
  }
  return <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">via {mode}</span>;
};

export const AccountingDashboardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Reactive state from accountingStore
  const storeSnapshot = useSyncExternalStore(
    accountingStore.subscribe,
    accountingStore.getSnapshot
  );
  const { accounts, journals, transactions, summary } = storeSnapshot;

  // Active Main Tab: 'passbook' | 'accounts' | 'journals'
  const initialTab = (searchParams.get('tab') as AccountingActiveTab) || 'passbook';
  const [activeTab, setActiveTab] = useState<AccountingActiveTab>(initialTab);

  // Passbook / Ledger Sub-States
  const [ledgerMode, setLedgerMode] = useState<MainAccountingMode>('PASSBOOK');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('ALL');
  const [selectedStream, setSelectedStream] = useState<string>('ALL');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // React to search param updates
  useEffect(() => {
    const q = searchParams.get('search');
    if (q) {
      setSearchQuery(q);
    }
    const t = searchParams.get('tab') as AccountingActiveTab;
    if (t && (t === 'passbook' || t === 'accounts' || t === 'journals')) {
      setActiveTab(t);
    }
  }, [searchParams]);

  // Modals state
  const [createAccountModalVisible, setCreateAccountModalVisible] = useState(false);
  const [detailAccount, setDetailAccount] = useState<AccountItem | null>(null);
  const [createJournalModalVisible, setCreateJournalModalVisible] = useState(false);
  const [viewLinesJournal, setViewLinesJournal] = useState<JournalEntryItem | null>(null);
  const [reverseJournal, setReverseJournal] = useState<JournalEntryItem | null>(null);
  const [exportModalVisible, setExportModalVisible] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load accounting data on mount
  useEffect(() => {
    accountingStore.fetchAll();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await accountingStore.fetchAll();
    setIsRefreshing(false);
  };

  // Transaction classification helpers
  const getInflowAmount = (t: LedgerTransaction): number => {
    if (t.category_tag === 'EXPENSE' || t.account_type === 'EXPENSE') return 0;
    return Number(t.credit) || (t.account_type === 'INCOME' ? Number(t.debit) : 0) || 0;
  };

  const getOutflowAmount = (t: LedgerTransaction): number => {
    if (t.category_tag === 'EXPENSE' || t.account_type === 'EXPENSE') {
      return Number(t.debit) || Number(t.credit) || 0;
    }
    return 0;
  };

  // Dynamic counts for Stream categories and Source channels across entire ledger
  const filterCounts = useMemo(() => {
    let donation = 0;
    let causeDonation = 0;
    let membership = 0;
    let renewal = 0;
    let expense = 0;

    let website = 0;
    let webApp = 0;
    let application = 0;

    for (const t of transactions) {
      const stream = (t.stream_category || 'DONATION').toUpperCase();
      if (stream.includes('CAUSE')) causeDonation++;
      else if (stream.includes('RENEW')) renewal++;
      else if (stream.includes('MEMBERSHIP')) membership++;
      else if (stream.includes('EXPENSE')) expense++;
      else donation++;

      const source = (t.source_channel || (t.is_web_app ? 'WEB_APP' : 'WEBSITE')).toUpperCase();
      if (source === 'WEB_APP' || t.is_web_app) webApp++;
      else if (source === 'APPLICATION') application++;
      else website++;
    }

    return {
      donation,
      causeDonation,
      membership,
      renewal,
      expense,
      website,
      webApp,
      application,
    };
  }, [transactions]);

  // Filter Ledger Transactions
  const filteredTransactions = useMemo(() => {
    let list = [...transactions];

    // Filter by specific Account Head if selected
    if (selectedAccountId !== 'ALL') {
      list = list.filter((t) => t.account_id === selectedAccountId);
    }

    // Filter by Stream Category: Donation, Cause Donation, Membership, Renew, Expenses
    if (selectedStream !== 'ALL') {
      list = list.filter((t) => {
        const s = (t.stream_category || 'DONATION').toUpperCase();
        if (selectedStream === 'CAUSE_DONATION') return s.includes('CAUSE');
        if (selectedStream === 'RENEWAL') return s.includes('RENEW');
        if (selectedStream === 'MEMBERSHIP') return s.includes('MEMBERSHIP');
        if (selectedStream === 'EXPENSE') return s.includes('EXPENSE');
        if (selectedStream === 'DONATION') return s === 'DONATION' || (!s.includes('CAUSE') && !s.includes('MEMBERSHIP') && !s.includes('EXPENSE') && !s.includes('RENEW'));
        return true;
      });
    }

    // Filter by Source Channel: Website, Web App, Application
    if (selectedSource !== 'ALL') {
      list = list.filter((t) => {
        const src = (t.source_channel || (t.is_web_app ? 'WEB_APP' : 'WEBSITE')).toUpperCase();
        if (selectedSource === 'WEB_APP') return t.is_web_app || src === 'WEB_APP';
        if (selectedSource === 'APPLICATION') return src === 'APPLICATION';
        if (selectedSource === 'WEBSITE') return src === 'WEBSITE' && !t.is_web_app;
        return true;
      });
    }

    // Mode filter: CREDIT (inflow) vs EXPENSE (outflow)
    if (ledgerMode === 'CREDIT') {
      list = list.filter((t) => getInflowAmount(t) > 0);
    } else if (ledgerMode === 'EXPENSE') {
      list = list.filter((t) => getOutflowAmount(t) > 0);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          String(t.entry_number || '').toLowerCase().includes(q) ||
          String(t.voucher_number || '').toLowerCase().includes(q) ||
          String(t.narration || '').toLowerCase().includes(q) ||
          String(t.account_name || '').toLowerCase().includes(q) ||
          String(t.received_from || '').toLowerCase().includes(q) ||
          String(t.paid_to || '').toLowerCase().includes(q) ||
          String(t.payment_method || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [transactions, selectedAccountId, selectedStream, selectedSource, ledgerMode, searchQuery]);

  // Aggregated totals for the active filtered set
  const filteredTotals = useMemo(() => {
    let inflow = 0;
    let outflow = 0;
    for (const t of filteredTransactions) {
      inflow += getInflowAmount(t);
      outflow += getOutflowAmount(t);
    }
    return {
      inflow,
      outflow,
      net: inflow - outflow,
    };
  }, [filteredTransactions]);

  // Mode counts
  const modeCounts = useMemo(() => {
    let credit = 0;
    let expense = 0;
    for (const t of transactions) {
      if (getInflowAmount(t) > 0) credit++;
      if (getOutflowAmount(t) > 0) expense++;
    }
    return {
      PASSBOOK: transactions.length,
      CREDIT: credit,
      EXPENSE: expense,
    };
  }, [transactions]);

  // Dynamic live Stream Breakdown computed from REAL transaction data (No mock or fake data)
  const streamBreakdown = useMemo(() => {
    const inflowMap: Record<string, { name: string; code?: string; amount: number; count: number }> = {};
    const outflowMap: Record<string, { name: string; code?: string; amount: number; count: number }> = {};

    let totalInflow = 0;
    let totalOutflow = 0;

    transactions.forEach((t) => {
      const inflow = getInflowAmount(t);
      const outflow = getOutflowAmount(t);

      if (inflow > 0) {
        totalInflow += inflow;
        const key = t.account_name || 'General Inflows';
        if (!inflowMap[key]) {
          inflowMap[key] = { name: key, code: t.account_code || undefined, amount: 0, count: 0 };
        }
        inflowMap[key].amount += inflow;
        inflowMap[key].count += 1;
      }

      if (outflow > 0) {
        totalOutflow += outflow;
        const key = t.account_name || 'General Outflows';
        if (!outflowMap[key]) {
          outflowMap[key] = { name: key, code: t.account_code || undefined, amount: 0, count: 0 };
        }
        outflowMap[key].amount += outflow;
        outflowMap[key].count += 1;
      }
    });

    return {
      inflows: Object.values(inflowMap).sort((a, b) => b.amount - a.amount),
      outflows: Object.values(outflowMap).sort((a, b) => b.amount - a.amount),
      totalInflow,
      totalOutflow,
      netResult: totalInflow - totalOutflow,
    };
  }, [transactions]);

  // Paginated Ledger slice
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  const getCategoryBadgeStyle = (streamCategory?: string, tag?: string) => {
    const s = (streamCategory || tag || '').toUpperCase();
    if (s.includes('CAUSE')) {
      return { label: 'CAUSE DONATION', bg: '#EDE9FE', color: '#6D28D9', border: '#DDD6FE' };
    }
    if (s.includes('RENEW')) {
      return { label: 'RENEWAL', bg: '#CCFBF1', color: '#0F766E', border: '#99F6E4' };
    }
    if (s.includes('MEMBERSHIP')) {
      return { label: 'MEMBERSHIP', bg: '#DBEAFE', color: '#1D4ED8', border: '#BFDBFE' };
    }
    if (s.includes('EXPENSE')) {
      return { label: 'EXPENSE', bg: '#FEE2E2', color: '#DC2626', border: '#FECACA' };
    }
    if (s.includes('DONATION')) {
      return { label: 'DONATION', bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' };
    }
    return { label: 'RECEIPT', bg: '#DCFCE7', color: '#15803D', border: '#BBF7D0' };
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 min-w-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFF9E6] text-[#011F39] border border-[#FDE68A] mb-2 tracking-wide uppercase">
            <Scale size={12} className="text-[#B45309]" />
            <span>Financial Audit & General Ledger</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#011F39]">
            Accounting & General Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official double-entry chart of accounts, balanced journal entries, and running passbook general ledger
          </p>
        </div>

        {/* Global Page Actions */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-[#011F39]' : 'text-slate-500'} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setExportModalVisible(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs transition-colors cursor-pointer"
          >
            <Download size={14} className="text-slate-500" />
            <span>Export Passbook</span>
          </button>

          {activeTab === 'accounts' ? (
            <button
              type="button"
              onClick={() => setCreateAccountModalVisible(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold bg-[#FAD465] hover:bg-[#e9bf36] text-[#011F39] shadow-xs transition-colors cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Add Account</span>
            </button>
          ) : activeTab === 'journals' ? (
            <button
              type="button"
              onClick={() => setCreateJournalModalVisible(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold bg-[#FAD465] hover:bg-[#e9bf36] text-[#011F39] shadow-xs transition-colors cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>New Journal Entry</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/admin/receipts/create')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors cursor-pointer whitespace-nowrap"
              >
                <Plus size={15} strokeWidth={2.5} />
                <span>Record Income</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/expenses/create')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold bg-[#FAD465] hover:bg-[#e9bf36] text-[#011F39] shadow-xs transition-colors cursor-pointer whitespace-nowrap"
              >
                <Plus size={15} strokeWidth={2.5} />
                <span>Record Expense</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Top 4 Summary Cards (Executive Balanced Grid, No Dark Block) */}
      <LedgerSummaryCards summary={summary} />

      {/* Main Content Box */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 sm:p-6 w-full max-w-full min-w-0">
        {/* TAB 1: General Ledger / Passbook */}
        {activeTab === 'passbook' && (
          <div>
            {/* Mode selection chips */}
            <LedgerModeChips
              activeMode={ledgerMode}
              onSelectMode={(m) => {
                setLedgerMode(m);
                setCurrentPage(1);
              }}
              counts={modeCounts}
            />

            {/* If Analytics Mode is selected, display REAL dynamic breakdown */}
            {ledgerMode === 'ANALYTICS' ? (
              <div className="p-5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={18} className="text-[#011F39]" />
                    <h3 className="font-serif text-base font-bold text-[#011F39]">
                      Revenue & Expenditure Stream Allocation
                    </h3>
                  </div>
                  <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 text-slate-700">
                    Net Balance: <strong className={streamBreakdown.netResult >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                      {formatINR(streamBreakdown.netResult)}
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Real Inflow Breakdown */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                        Inflow Breakdown (Income & Receipts)
                      </span>
                      <span className="font-serif font-bold text-xs text-emerald-700">
                        {formatINR(streamBreakdown.totalInflow)}
                      </span>
                    </div>

                    {streamBreakdown.inflows.length > 0 ? (
                      <div className="space-y-2">
                        {streamBreakdown.inflows.map((item) => (
                          <div key={item.name} className="flex justify-between items-center text-xs text-slate-600">
                            <div>
                              <span>{item.name}</span>
                              <span className="text-[10px] text-slate-400 ml-1.5 font-normal">
                                ({item.count} {item.count === 1 ? 'voucher' : 'vouchers'})
                              </span>
                            </div>
                            <strong className="text-slate-900 font-mono">
                              {formatINR(item.amount)}
                            </strong>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic py-2">No posted income records found in this cycle.</p>
                    )}
                  </div>

                  {/* Real Outflow Breakdown */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                        Outflow Breakdown (Expenses & Disbursements)
                      </span>
                      <span className="font-serif font-bold text-xs text-rose-700">
                        {formatINR(streamBreakdown.totalOutflow)}
                      </span>
                    </div>

                    {streamBreakdown.outflows.length > 0 ? (
                      <div className="space-y-2">
                        {streamBreakdown.outflows.map((item) => (
                          <div key={item.name} className="flex justify-between items-center text-xs text-slate-600">
                            <div>
                              <span>{item.name}</span>
                              <span className="text-[10px] text-slate-400 ml-1.5 font-normal">
                                ({item.count} {item.count === 1 ? 'voucher' : 'vouchers'})
                              </span>
                            </div>
                            <strong className="text-slate-900 font-mono">
                              {formatINR(item.amount)}
                            </strong>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic py-2">No posted expenditure records found in this cycle.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Search & Multi-Filter Bar */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4 w-full min-w-0">
                  <div className="flex items-center gap-2 flex-1 flex-wrap min-w-0">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-[200px] sm:min-w-[220px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        placeholder="Search voucher #, narration, party..."
                        className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-slate-50/60 hover:bg-white focus:bg-white focus:border-[#011F39] focus:outline-none focus:ring-1 focus:ring-[#011F39] transition-colors"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setCurrentPage(1);
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                          title="Clear search"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400 pl-1">
                      <Filter size={13} className="shrink-0 text-slate-400" />
                    </div>

                    {/* Stream Category Filter */}
                    <select
                      value={selectedStream}
                      onChange={(e) => {
                        setSelectedStream(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-700 bg-white hover:border-slate-300 focus:border-[#011F39] focus:outline-none transition-colors cursor-pointer shrink-0"
                    >
                      <option value="ALL">All Categories ({transactions.length})</option>
                      <option value="DONATION">Donation ({filterCounts.donation})</option>
                      <option value="CAUSE_DONATION">Cause Donation ({filterCounts.causeDonation})</option>
                      <option value="MEMBERSHIP">Membership ({filterCounts.membership})</option>
                      <option value="RENEWAL">Renew ({filterCounts.renewal})</option>
                      <option value="EXPENSE">Expenses ({filterCounts.expense})</option>
                    </select>

                    {/* Source Channel Filter */}
                    <select
                      value={selectedSource}
                      onChange={(e) => {
                        setSelectedSource(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-700 bg-white hover:border-slate-300 focus:border-[#011F39] focus:outline-none transition-colors cursor-pointer shrink-0"
                    >
                      <option value="ALL">All Sources ({transactions.length})</option>
                      <option value="WEBSITE">Website ({filterCounts.website})</option>
                      <option value="WEB_APP">Web App ({filterCounts.webApp})</option>
                      <option value="APPLICATION">Application ({filterCounts.application})</option>
                    </select>

                    {/* Account Head Filter */}
                    <select
                      value={selectedAccountId}
                      onChange={(e) => {
                        setSelectedAccountId(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-700 bg-white hover:border-slate-300 focus:border-[#011F39] focus:outline-none transition-colors cursor-pointer max-w-[210px] truncate"
                    >
                      <option value="ALL">All Account Heads</option>
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.account_code ? `${acc.account_code} — ` : ''}{acc.account_name}
                        </option>
                      ))}
                    </select>

                    {/* Reset Filters button if any filter active */}
                    {(selectedStream !== 'ALL' || selectedSource !== 'ALL' || selectedAccountId !== 'ALL' || searchQuery) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStream('ALL');
                          setSelectedSource('ALL');
                          setSelectedAccountId('ALL');
                          setSearchQuery('');
                          setCurrentPage(1);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                        title="Reset all filters"
                      >
                        <X size={13} />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 self-start lg:self-auto shrink-0 whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>
                      Showing <strong className="text-slate-800 font-bold">{filteredTransactions.length}</strong> ledger records
                    </span>
                  </div>
                </div>

                {/* Ledger Transactions Table */}
                <div className="w-full max-w-full min-w-0 overflow-x-auto border border-slate-200/90 rounded-xl shadow-xs bg-white">
                  <table className="w-full border-collapse text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-50/90 border-b border-slate-200/90 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="px-4 py-3.5 whitespace-nowrap min-w-[210px]">Date & Voucher No</th>
                        <th className="px-4 py-3.5 whitespace-nowrap min-w-[120px]">Stream Tag</th>
                        <th className="px-4 py-3.5 min-w-[220px]">Particulars & Beneficiary</th>
                        <th className="px-4 py-3.5 min-w-[220px]">Account Head & Mode</th>
                        <th className="px-4 py-3.5 text-right whitespace-nowrap min-w-[145px]">Income (Inflow / Cr)</th>
                        <th className="px-4 py-3.5 text-right whitespace-nowrap min-w-[145px]">Expense (Outflow / Dr)</th>
                        <th className="px-4 py-3.5 text-right whitespace-nowrap min-w-[155px]">Running Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {/* Chronological Transactions (Newest First) */}
                      {paginatedTransactions.length > 0 ? (
                        paginatedTransactions.map((tx) => {
                          const badge = getCategoryBadgeStyle(tx.stream_category, tx.category_tag);
                          const inflow = getInflowAmount(tx);
                          const outflow = getOutflowAmount(tx);
                          const displayVoucherNo = tx.voucher_number || tx.entry_number;
                          const cleanNarration = (tx.narration || '').replace(/\[Source:\s*Web App\]/gi, '').trim();
                          const mainParty = tx.paid_to || tx.received_from;

                          return (
                            <tr
                              key={tx.id}
                              className="hover:bg-slate-50/80 transition-colors group"
                            >
                              {/* Date & Voucher No */}
                              <td className="px-4 py-3.5 align-middle whitespace-nowrap min-w-[210px]">
                                <div className="flex items-center gap-1.5 flex-nowrap">
                                  <span className="font-mono text-xs font-bold text-[#011F39] tracking-tight whitespace-nowrap">
                                    {displayVoucherNo}
                                  </span>
                                  {/* Show Web App tag ONLY when entered from web app */}
                                  {tx.is_web_app ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs whitespace-nowrap">
                                      Web App
                                    </span>
                                  ) : tx.source_channel === 'APPLICATION' ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs whitespace-nowrap">
                                      Application
                                    </span>
                                  ) : null}
                                  {tx.category_tag === 'EXPENSE' || tx.reference_type === 'MANUAL_EXPENSE' ? (
                                    <button
                                      type="button"
                                      onClick={() => navigate(`/admin/expenses/${tx.reference_id || tx.entry_number}`)}
                                      title="Open Expense Voucher"
                                      className="text-slate-400 hover:text-blue-600 transition cursor-pointer p-0.5 rounded hover:bg-blue-50"
                                    >
                                      <ExternalLink size={12} />
                                    </button>
                                  ) : tx.category_tag === 'DONATION' || tx.reference_type === 'DONATION_PAYMENT' ? (
                                    <button
                                      type="button"
                                      onClick={() => navigate(`/admin/donations/${tx.reference_id || tx.entry_number}`)}
                                      title="Open Donation Record"
                                      className="text-slate-400 hover:text-amber-600 transition cursor-pointer p-0.5 rounded hover:bg-amber-50"
                                    >
                                      <ExternalLink size={12} />
                                    </button>
                                  ) : tx.category_tag === 'MEMBERSHIP_FEE' || tx.reference_type === 'MEMBERSHIP_PAYMENT' ? (
                                    <button
                                      type="button"
                                      onClick={() => navigate('/admin/members')}
                                      title="Open Members Directory"
                                      className="text-slate-400 hover:text-blue-600 transition cursor-pointer p-0.5 rounded hover:bg-blue-50"
                                    >
                                      <ExternalLink size={12} />
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => navigate(`/admin/receipts/${tx.reference_id || tx.entry_number}`)}
                                      title="Open Receipt Voucher"
                                      className="text-slate-400 hover:text-emerald-600 transition cursor-pointer p-0.5 rounded hover:bg-emerald-50"
                                    >
                                      <ExternalLink size={12} />
                                    </button>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                                  <Calendar size={11} className="text-slate-400 shrink-0" />
                                  <span>{formatLedgerDate(tx.entry_date)}</span>
                                </div>
                              </td>

                              {/* Stream Tag */}
                              <td className="px-4 py-3.5 align-middle whitespace-nowrap min-w-[120px]">
                                <span
                                  className="inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs tracking-wide uppercase whitespace-nowrap"
                                  style={{
                                    backgroundColor: badge.bg,
                                    color: badge.color,
                                    borderColor: badge.border,
                                  }}
                                >
                                  {badge.label}
                                </span>
                              </td>

                              {/* Particulars & Beneficiary */}
                              <td className="px-4 py-3.5 align-middle max-w-xs min-w-[220px]">
                                {mainParty ? (
                                  <>
                                    <div className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
                                      {mainParty}
                                    </div>
                                    {cleanNarration && cleanNarration !== mainParty && (
                                      <div className="text-[11.5px] text-slate-500 truncate mt-0.5">
                                        {cleanNarration}
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="font-semibold text-slate-800 text-xs sm:text-sm truncate">
                                    {cleanNarration || 'General transaction'}
                                  </div>
                                )}
                              </td>

                              {/* Account Head & Payment Mode */}
                              <td className="px-4 py-3.5 align-middle min-w-[220px]">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-semibold text-slate-800 text-xs sm:text-sm truncate max-w-[180px]">
                                    {tx.account_name}
                                  </span>
                                  {tx.account_code && (
                                    <span className="text-[10px] px-1.5 py-0.2 font-mono text-slate-500 bg-slate-100 rounded border border-slate-200">
                                      #{tx.account_code}
                                    </span>
                                  )}
                                </div>
                                <div className="mt-1">
                                  {renderPaymentModeBadge(tx.payment_method || tx.disbursing_account_name)}
                                </div>
                              </td>

                              {/* Inflow Credit */}
                              <td className="px-4 py-3.5 align-middle text-right whitespace-nowrap min-w-[145px]">
                                {inflow > 0 ? (
                                  <span className="font-mono font-bold text-xs sm:text-sm text-emerald-700 bg-emerald-50/70 px-2.5 py-0.5 rounded-md border border-emerald-200/60 inline-block whitespace-nowrap">
                                    + {formatINR(inflow)}
                                  </span>
                                ) : (
                                  <span className="text-slate-300 font-mono">—</span>
                                )}
                              </td>

                              {/* Outflow Debit */}
                              <td className="px-4 py-3.5 align-middle text-right whitespace-nowrap min-w-[145px]">
                                {outflow > 0 ? (
                                  <span className="font-mono font-bold text-xs sm:text-sm text-rose-700 bg-rose-50/70 px-2.5 py-0.5 rounded-md border border-rose-200/60 inline-block whitespace-nowrap">
                                    - {formatINR(outflow)}
                                  </span>
                                ) : (
                                  <span className="text-slate-300 font-mono">—</span>
                                )}
                              </td>

                              {/* Running Balance */}
                              <td className="px-4 py-3.5 align-middle text-right whitespace-nowrap min-w-[155px]">
                                <span className="font-mono font-bold text-xs sm:text-sm text-[#011F39] whitespace-nowrap">
                                  {formatINR(tx.running_balance)}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-slate-500">
                            <div className="flex flex-col items-center gap-2">
                              <AlertCircle size={28} className="text-slate-400" />
                              <div className="font-semibold text-slate-700">No ledger transactions found</div>
                              <div className="text-xs text-slate-400">Try switching modes or clearing search terms.</div>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* 3. Official Closing Balance Row at bottom of table */}
                      {filteredTransactions.length > 0 && (
                        <tr className="bg-slate-50/90 border-t-2 border-slate-300/90 font-semibold text-slate-800">
                          <td colSpan={2} className="px-4 py-3.5 text-xs uppercase tracking-wider text-slate-600 font-bold whitespace-nowrap">
                            Closing Balance Carried Forward (c/f)
                          </td>
                          <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                            {filteredTransactions.length} Transactions
                          </td>
                          <td className="px-4 py-3.5 text-xs text-slate-500">
                            Net Liquid Reserves
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono font-bold text-xs sm:text-sm text-emerald-700 whitespace-nowrap">
                            {filteredTotals.inflow > 0 ? `+ ${formatINR(filteredTotals.inflow)}` : '₹0.00'}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono font-bold text-xs sm:text-sm text-rose-700 whitespace-nowrap">
                            {filteredTotals.outflow > 0 ? `- ${formatINR(filteredTotals.outflow)}` : '₹0.00'}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono font-bold text-sm sm:text-base text-[#011F39] whitespace-nowrap">
                            {formatINR(filteredTotals.net)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {filteredTransactions.length > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-slate-100 text-xs text-slate-500 mt-3">
                    <div>
                      Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to{' '}
                      <strong>{Math.min(currentPage * pageSize, filteredTransactions.length)}</strong> of{' '}
                      <strong>{filteredTransactions.length}</strong> transactions
                    </div>

                    <div className="flex items-center gap-2 self-center sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                          currentPage === 1
                            ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs'
                        }`}
                      >
                        <ChevronLeft size={14} />
                        <span>Prev</span>
                      </button>

                      <span className="font-bold text-slate-700 px-2">
                        Page {currentPage} of {totalPages}
                      </span>

                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                          currentPage === totalPages
                            ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs'
                        }`}
                      >
                        <span>Next</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 2: Chart of Accounts */}
        {activeTab === 'accounts' && (
          <ChartOfAccountsTree
            accounts={accounts}
            onAddAccount={() => setCreateAccountModalVisible(true)}
            onSelectAccount={(acc) => setDetailAccount(acc)}
            onViewLedger={(acc) => navigate(`/admin/accounting/accounts/${acc.id}/ledger`)}
            onToggleStatus={async (acc) => {
              await accountingStore.toggleAccountStatus(acc.id, !acc.is_active);
            }}
          />
        )}

        {/* TAB 3: Journal Vouchers */}
        {activeTab === 'journals' && (
          <JournalEntriesTable
            entries={journals}
            onAddEntry={() => setCreateJournalModalVisible(true)}
            onViewLines={(entry) => setViewLinesJournal(entry)}
            onReverseEntry={(entry) => setReverseJournal(entry)}
          />
        )}
      </div>

      {/* Modals */}
      <CreateAccountModal
        visible={createAccountModalVisible}
        onClose={() => setCreateAccountModalVisible(false)}
        accounts={accounts}
        onCreate={async (payload) => {
          await accountingStore.createAccount(payload);
        }}
      />

      <AccountDetailModal
        visible={Boolean(detailAccount)}
        onClose={() => setDetailAccount(null)}
        account={detailAccount}
        onViewLedger={(acc) => navigate(`/admin/accounting/accounts/${acc.id}/ledger`)}
      />

      <CreateJournalEntryModal
        visible={createJournalModalVisible}
        onClose={() => setCreateJournalModalVisible(false)}
        accounts={accounts}
        onCreate={async (payload) => {
          await accountingStore.createJournalEntry(payload);
        }}
      />

      <JournalEntryLinesModal
        visible={Boolean(viewLinesJournal)}
        onClose={() => setViewLinesJournal(null)}
        entry={viewLinesJournal}
      />

      <ReverseJournalModal
        visible={Boolean(reverseJournal)}
        onClose={() => setReverseJournal(null)}
        entry={reverseJournal}
        onConfirmReverse={async (reason) => {
          if (!reverseJournal) return;
          await accountingStore.reverseJournalEntry(reverseJournal.id, reason);
        }}
      />

      <PassbookExportModal
        visible={exportModalVisible}
        onClose={() => setExportModalVisible(false)}
        transactions={transactions}
      />
    </div>
  );
};
