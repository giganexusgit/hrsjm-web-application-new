import type React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  Receipt,
  CreditCard,
  Heart,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  X,
  ShieldCheck,
  ArrowUpRight,
  RefreshCw,
  Printer,
  Scale,
  ExternalLink,
} from 'lucide-react';
import { transactionsService } from '../services/transactionsService';
import { printOfficialDonationReceipt } from '../../admin/donations/utils/donationReceiptGenerator';
import type {
  TransactionCategoryCode,
  TransactionStatusCode,
  UserTransactionItem,
  UserTransactionsSummary,
} from '../types/transactions.types';
import { formatOutgoingAmount } from '../types/transactions.types';
import { useAuth } from '../../auth/store/authStore';

const CATEGORY_TABS: { label: string; value: TransactionCategoryCode }[] = [
  { label: 'All Transactions', value: 'ALL' },
  { label: 'Membership', value: 'MEMBERSHIP' },
  { label: 'Donations', value: 'DONATION' },
  { label: 'Events & Drives', value: 'EVENTS' },
  { label: 'Other', value: 'OTHER' },
];

export const UserTransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategoryCode>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatusCode>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Data State
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<UserTransactionItem[]>([]);
  const [summary, setSummary] = useState<UserTransactionsSummary>({
    total_amount_paid: 0,
    total_transactions: 0,
    successful_count: 0,
    pending_count: 0,
    failed_count: 0,
    refunded_count: 0,
    tax_exemption_total: 0,
  });

  // Modal State
  const [selectedTxn, setSelectedTxn] = useState<UserTransactionItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [receiptModalTxn, setReceiptModalTxn] = useState<UserTransactionItem | null>(null);

  // Asynchronously synchronize transactions when filters or refreshTrigger change
  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      try {
        const res = await transactionsService.getMyTransactions({
          category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
          status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
          search: searchQuery.trim() || undefined,
        });
        if (!controller.signal.aborted) {
          setTransactions(res.items || []);
          setSummary(res.summary);
          setLoading(false);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error('Failed to load transactions:', err);
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      controller.abort();
    };
  }, [selectedCategory, selectedStatus, searchQuery, refreshTrigger]);

  const handleRefresh = () => {
    setLoading(true);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadReceipt = (txn: UserTransactionItem) => {
    const donorName = user?.full_name || 'HRSJM Contributor';
    transactionsService.downloadReceiptPdf(txn, donorName);
  };

  const formatDateTime = (isoDate: string) => {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return 'Recent';
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryBadge = (category: string) => {
    switch (category.toLowerCase()) {
      case 'membership':
        return {
          icon: CreditCard,
          className: 'bg-blue-50 text-blue-800 border-blue-200',
        };
      case 'donation':
        return {
          icon: Heart,
          className: 'bg-[#FAF7F0] text-[#C9971A] border-[#FAD465]/60',
        };
      case 'events':
        return {
          icon: Calendar,
          className: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      default:
        return {
          icon: Receipt,
          className: 'bg-slate-50 text-slate-800 border-slate-200',
        };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return {
          icon: CheckCircle2,
          text: 'Success',
          className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
      case 'pending':
        return {
          icon: Clock,
          text: 'Pending',
          className: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'failed':
        return {
          icon: AlertCircle,
          text: 'Failed',
          className: 'bg-rose-50 text-rose-800 border-rose-200',
        };
      case 'refunded':
        return {
          icon: RefreshCw,
          text: 'Refunded',
          className: 'bg-[#EDF2F7] text-[#06294D] border-[#DBE5EE]',
        };
      default:
        return {
          icon: Clock,
          text: status,
          className: 'bg-slate-50 text-slate-700 border-slate-200',
        };
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#011F39] via-[#06294D] to-[#011F39] text-white p-6 sm:p-8 rounded-2xl shadow-md border border-[#FAD465]/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FAD465]/20 text-[#FAD465] border border-[#FAD465]/30 mb-2">
              <Receipt className="w-3.5 h-3.5" />
              Statutory Ledger & Tax Exemption Vault
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-wide text-white">
              Transaction History & Receipts
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Consolidated official statement of all membership subscriptions, social cause donations,
              and event passes with instant Section 80G tax exemption receipts.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Ledger</span>
            </button>
          </div>
        </div>

        {/* Subtle Decorative Pattern */}
        <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 opacity-10 pointer-events-none">
          <Receipt size={220} className="text-white" />
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Outgoing Paid Card */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
              Total Outgoing Paid
            </span>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 font-mono">
              {formatOutgoingAmount(summary.total_amount_paid)}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Across {summary.total_transactions} total transactions
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-[#011F39] shrink-0">
            <ArrowUpRight size={24} className="text-rose-600" />
          </div>
        </div>

        {/* Cleared / Successful Card */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
              Cleared & Verified
            </span>
            <div className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1 font-mono">
              {summary.successful_count}
            </div>
            <span className="text-[11px] text-emerald-600 mt-0.5 block flex items-center gap-1">
              <CheckCircle2 size={12} />
              <span>With verified receipts</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 size={24} />
          </div>
        </div>

        {/* 80G Tax Deductible Card */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
              80G Eligible Donations
            </span>
            <div className="text-xl sm:text-2xl font-bold text-[#011F39] mt-1 font-mono">
              ₹{(summary.tax_exemption_total || 0).toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-emerald-700 mt-0.5 block font-medium">
              50% IT Deduction: ₹{Math.round((summary.tax_exemption_total || 0) * 0.5).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#FAD465]/20 flex items-center justify-center text-[#011F39] shrink-0 border border-[#FAD465]/40">
            <ShieldCheck size={24} className="text-[#011F39]" />
          </div>
        </div>

        {/* Pending Clearance Card */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
              Pending Clearance
            </span>
            <div className="text-xl sm:text-2xl font-bold text-amber-700 mt-1 font-mono">
              {summary.pending_count}
            </div>
            <span className="text-[11px] text-amber-600 mt-0.5 block">
              Awaiting gateway settlement
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Main Table & Filters Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Category Tabs */}
        <div className="border-b border-slate-200 bg-slate-50/60 px-4 sm:px-6 pt-3 flex flex-wrap gap-2">
          {CATEGORY_TABS.map((tab) => {
            const isActive = selectedCategory === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setSelectedCategory(tab.value);
                  setLoading(true);
                }}
                className={`pb-3 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${isActive
                    ? 'border-[#011F39] text-[#011F39]'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by transaction ID, purpose, amount, or receipt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#011F39]/20 focus:border-[#011F39] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium shrink-0">
              <Filter size={14} />
              <span>Status:</span>
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as TransactionStatusCode);
                setLoading(true);
              }}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#011F39]/20 focus:border-[#011F39] text-slate-800 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Success Only</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-slate-500 space-y-3">
              <div className="w-8 h-8 border-3 border-[#011F39] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs sm:text-sm font-medium">Loading transactions ledger...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-16 text-center px-4 space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Receipt size={28} />
              </div>
              <h3 className="text-base font-bold text-slate-800 font-serif">No Transactions Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No financial records match your selected filter criteria. Try adjusting the category or search keyword.
              </p>
              {(searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('ALL');
                    setSelectedStatus('ALL');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-[#011F39] hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold text-[11px] sm:text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Transaction & Date</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Purpose / Campaign</th>
                  <th className="py-3.5 px-4 text-right">Amount (Outgoing)</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((txn) => {
                  const catBadge = getCategoryBadge(txn.category);
                  const CatIcon = catBadge.icon;
                  const statBadge = getStatusBadge(txn.status);
                  const StatIcon = statBadge.icon;

                  return (
                    <tr
                      key={txn.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedTxn(txn)}
                    >
                      {/* Transaction ID & Date */}
                      <td className="py-4 px-4 sm:px-6 align-top">
                        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-900">
                          <span>{txn.transaction_id}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(txn.transaction_id);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-slate-600 transition"
                            title="Copy Transaction ID"
                          >
                            {copiedId === txn.transaction_id ? (
                              <Check size={12} className="text-emerald-600" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {formatDateTime(txn.payment_date || txn.created_at)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Mode: {txn.payment_method}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 align-top">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${catBadge.className}`}
                        >
                          <CatIcon size={12} />
                          <span>{txn.category}</span>
                        </span>
                      </td>

                      {/* Title & Purpose */}
                      <td className="py-4 px-4 align-top max-w-xs sm:max-w-sm">
                        <div className="font-semibold text-slate-900 leading-snug line-clamp-1">
                          {txn.title}
                        </div>
                        <div className="text-[11.5px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {txn.purpose}
                        </div>
                        {txn.receipt_number && (
                          <div className="inline-flex items-center gap-1 text-[10.5px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded mt-1 border border-emerald-200">
                            <ShieldCheck size={11} className="text-emerald-600" />
                            <span>
                              {txn.category_code === 'DONATION' || txn.related_info?.tax_exemption_eligible
                                ? `80G Receipt: ${txn.receipt_number}`
                                : `Receipt: ${txn.receipt_number}`}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Amount (Outgoing Negative) */}
                      <td className="py-4 px-4 align-top text-right">
                        <div className="font-mono font-bold text-sm sm:text-base text-slate-900">
                          {formatOutgoingAmount(txn.amount)}
                        </div>
                        <span className="inline-block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Debit / Outgoing
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 align-top text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statBadge.className}`}
                        >
                          <StatIcon size={12} />
                          <span>{statBadge.text}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {txn.receipt_available ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setReceiptModalTxn(txn);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#011F39] text-[#FAD465] hover:bg-[#06294D] transition shadow-xs cursor-pointer"
                              title="View and Download 80G Receipt"
                            >
                              <Receipt size={13} />
                              <span className="hidden sm:inline">
                                {txn.category_code === 'DONATION' || txn.related_info?.tax_exemption_eligible
                                  ? '80G Receipt'
                                  : 'Receipt'}
                              </span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTxn(txn);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                            >
                              <span>Details</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Table Footer info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            Showing <strong>{transactions.length}</strong> of <strong>{summary.total_transactions}</strong> recorded ledger entries
          </span>
          <div className="flex items-center gap-1 text-[11px]">
            <ShieldCheck size={14} className="text-[#011F39]" />
            <span>Digital ledger entries backed by Section 12A & 80G compliance</span>
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 bg-[#011F39]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#011F39] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Receipt className="text-[#FAD465] w-5 h-5" />
                <h3 className="font-serif font-bold text-base text-white">
                  Transaction Audit Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTxn(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              {/* Amount Highlight Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block uppercase font-medium">
                    Total Amount Debited
                  </span>
                  <div className="text-2xl font-bold font-mono text-slate-900 mt-0.5">
                    {formatOutgoingAmount(selectedTxn.amount)}
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(selectedTxn.status).className
                      }`}
                  >
                    <span>{selectedTxn.status}</span>
                  </span>
                  <div className="text-[11px] text-slate-500 mt-1 font-mono">
                    {selectedTxn.payment_method}
                  </div>
                </div>
              </div>

              {/* Transaction Key Metrics */}
              <div className="space-y-2.5 border-t border-b border-slate-100 py-3">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium">Transaction ID:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                    <span>{selectedTxn.transaction_id}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedTxn.transaction_id)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700"
                    >
                      {copiedId === selectedTxn.transaction_id ? (
                        <Check size={13} className="text-emerald-600" />
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium">Payment Reference:</span>
                  <span className="font-mono text-slate-800">{selectedTxn.payment_reference}</span>
                </div>

                {selectedTxn.gateway_payment_id && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-medium">Gateway Payment ID:</span>
                    <span className="font-mono text-slate-800">{selectedTxn.gateway_payment_id}</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium">Date & Timestamp:</span>
                  <span className="text-slate-800 font-medium">
                    {formatDateTime(selectedTxn.payment_date || selectedTxn.created_at)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium">Category:</span>
                  <span className="font-semibold text-slate-900">{selectedTxn.category}</span>
                </div>
              </div>

              {/* Purpose & Notes */}
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Purpose / Campaign Particulars
                </span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  <p className="font-semibold text-slate-900">{selectedTxn.title}</p>
                  <p className="mt-1 text-slate-600">{selectedTxn.purpose}</p>
                  {selectedTxn.related_info.notes && (
                    <p className="mt-2 pt-2 border-t border-slate-200/60 text-slate-500 italic">
                      Note: {selectedTxn.related_info.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* 80G Tax Exemption Note */}
              {(selectedTxn.category_code === 'DONATION' || selectedTxn.related_info.tax_exemption_eligible) && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
                  <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">50% Income Tax Deduction Under Section 80G</p>
                    <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                      Donation Amount: <strong>₹{selectedTxn.amount.toLocaleString('en-IN')}</strong> • Allowable 50% IT Deduction: <strong>₹{Math.round(selectedTxn.amount * 0.5).toLocaleString('en-IN')}</strong>. Validated under Section 80G(5)(vi) (URN: AABTH4589KF20214).
                    </p>
                  </div>
                </div>
              )}

              {/* Admin General Ledger Audit Link */}
              {(user?.roles?.includes('SUPER_ADMIN') || user?.roles?.includes('ADMIN') || user?.roles?.includes('STAFF')) && (
                <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <Scale size={14} className="text-[#011F39]" />
                    <span className="text-[11px] font-semibold text-slate-700">General Ledger Audit Entry:</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const id = selectedTxn.transaction_id || selectedTxn.id;
                      setSelectedTxn(null);
                      navigate(`/admin/accounting?search=${id}`);
                    }}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open in Ledger</span>
                    <ExternalLink size={11} />
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedTxn(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
              >
                Close
              </button>

              {selectedTxn.receipt_available ? (
                <button
                  type="button"
                  onClick={() => {
                    const t = selectedTxn;
                    setSelectedTxn(null);
                    setReceiptModalTxn(t);
                  }}
                  className="px-4 py-2 text-xs font-bold bg-[#011F39] text-[#FAD465] hover:bg-[#06294D] rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Receipt size={14} />
                  <span>View Official Receipt</span>
                </button>
              ) : (
                <span className="text-[11px] text-slate-400 italic">
                  Receipt generated upon gateway settlement
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Official 80G Receipt Document Modal */}
      {receiptModalTxn && (
        <div className="fixed inset-0 z-50 bg-[#011F39]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
            {/* Modal Top Bar */}
            <div className="px-6 py-4 bg-[#011F39] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-[#FAD465] w-5 h-5" />
                <div>
                  <h3 className="font-serif font-bold text-base text-white">
                    {receiptModalTxn.category_code === 'DONATION' || receiptModalTxn.related_info?.tax_exemption_eligible
                      ? 'Official 80G Contribution Receipt'
                      : 'Official Payment Receipt'}
                  </h3>
                  <p className="text-[11px] text-slate-300 font-mono">
                    Receipt No: {receiptModalTxn.receipt_number || `REC-${receiptModalTxn.transaction_id}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReceiptModalTxn(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Document Body */}
            <div className="p-6 overflow-y-auto space-y-4 bg-slate-50/60">
              <div className="bg-white border-2 border-[#011F39]/30 rounded-xl p-6 shadow-sm">
                {/* Trust Letterhead */}
                <div className="text-center border-b-2 border-[#011F39] pb-4 mb-4">
                  <h2 className="text-lg sm:text-xl font-bold font-serif text-[#011F39] tracking-wide">
                    Human Rights &  Social Justice Mission
                  </h2>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">
                    मानव अधिकार एवं सामाजिक न्याय संरक्षण ट्रस्ट
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    National HQ: New Delhi, India • Regd. No: HR/0092/2019 • PAN: AABTH4589K
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Section 12A & 80G Certified Non-Profit Organization
                  </p>
                  <div className="inline-block bg-[#011F39] text-[#FAD465] text-xs font-bold uppercase tracking-wider px-4 py-1 rounded mt-2.5 shadow-xs">
                    Official Statutory Receipt
                  </div>
                </div>

                {/* Receipt Metadata */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Receipt No:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {receiptModalTxn.receipt_number || `REC-${receiptModalTxn.transaction_id}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Date:</span>
                    <span className="font-mono text-slate-900">
                      {formatDateTime(receiptModalTxn.payment_date || receiptModalTxn.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Payment Mode:</span>
                    <span className="font-medium text-slate-800">{receiptModalTxn.payment_method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Transaction ID:</span>
                    <span className="font-mono text-slate-800 font-medium">{receiptModalTxn.transaction_id}</span>
                  </div>
                </div>

                {/* Contributor Particulars */}
                <div className="text-xs mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    CONTRIBUTOR DETAILS
                  </span>
                  <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-1">
                    <div className="text-sm font-bold text-slate-900 font-serif">
                      {user?.full_name || 'HRSJM Contributor'}
                    </div>
                    {user?.mobile_number && (
                      <div className="text-slate-600">Mobile: {user.mobile_number}</div>
                    )}
                    {user?.email && <div className="text-slate-600">Email: {user.email}</div>}
                  </div>
                </div>

                {/* Particulars & Amount */}
                <div className="text-xs mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    CONTRIBUTION PARTICULARS
                  </span>
                  <div className="border border-slate-200 rounded-lg p-3 bg-white flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-800">{receiptModalTxn.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{receiptModalTxn.purpose}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-lg font-bold text-emerald-700">
                        ₹{receiptModalTxn.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 80G Statutory Exemption Box */}
                {receiptModalTxn.category_code === 'DONATION' || receiptModalTxn.related_info?.tax_exemption_eligible ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-900 leading-relaxed">
                    <div className="font-bold mb-0.5">80G Income Tax Statutory Exemption Certificate:</div>
                    <div className="text-slate-800 mt-0.5">
                      Donation Amount: <strong>₹{receiptModalTxn.amount.toLocaleString('en-IN')}</strong> • 50% Tax Deduction Claimable: <strong>₹{Math.round(receiptModalTxn.amount * 0.5).toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="text-[10.5px] text-amber-800 mt-1">
                      Donations made to Human Rights &  Social Justice Mission are eligible for deduction under
                      Section 80G(5)(vi) of the Income Tax Act 1961 (URN: AABTH4589KF20214).
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] text-slate-700 leading-relaxed">
                    <div className="font-bold mb-0.5">Statutory Enrollment & Membership Fee:</div>
                    Official computer-generated receipt for statutory membership term fee. Membership dues are not eligible for 80G donation tax deduction under Indian tax law.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setReceiptModalTxn(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (receiptModalTxn.category_code === 'DONATION' || receiptModalTxn.related_info?.tax_exemption_eligible) {
                      printOfficialDonationReceipt({
                        id: receiptModalTxn.id,
                        receiptNumber: receiptModalTxn.receipt_number || `HRSJM/80G/2026-27/${receiptModalTxn.transaction_id.slice(-6).toUpperCase()}`,
                        receiptDate: receiptModalTxn.payment_date || receiptModalTxn.created_at,
                        donorName: user?.full_name || 'HRSJM Contributor',
                        donorMobile: user?.mobile_number,
                        donorEmail: user?.email,
                        donorPan: (user as any)?.pan_number,
                        cause: receiptModalTxn.title || receiptModalTxn.purpose || 'General Relief Fund',
                        amount: receiptModalTxn.amount,
                        paymentMethod: receiptModalTxn.payment_method || 'Cashfree PG (Verified)',
                        transactionId: receiptModalTxn.transaction_id,
                        status: receiptModalTxn.status,
                        source: 'Website Official Portal',
                      });
                    } else {
                      handleDownloadReceipt(receiptModalTxn);
                    }
                  }}
                  className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadReceipt(receiptModalTxn)}
                  className="px-4 py-2 text-xs font-bold bg-[#011F39] text-[#FAD465] hover:bg-[#06294D] rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download PDF Receipt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default UserTransactionsPage;
