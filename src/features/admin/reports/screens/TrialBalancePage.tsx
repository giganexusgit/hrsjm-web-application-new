import React, { useEffect, useMemo, useState, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scale,
  ArrowLeft,
  Download,
  Printer,
  Search,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { useReportsStore, reportsStore } from '../store/reportsStore';
import { ReportDateSelector } from '../components/ReportDateSelector';
import { TrialBalanceDrilldownModal } from '../components/TrialBalanceDrilldownModal';
import { reportsService, formatCurrency } from '../services/reportsService';
import type { DatePresetKey, TrialBalanceAccountItem } from '../types/reports.types';
import type { AccountType } from '../../accounting/types/accounting.types';

type AccountTypeFilter = 'ALL' | AccountType;

const ACCOUNT_TYPE_LABELS: Record<AccountTypeFilter, string> = {
  ALL: 'All Accounts',
  ASSET: 'Assets',
  LIABILITY: 'Liabilities',
  FUND_EQUITY: 'Fund & Equity',
  INCOME: 'Income',
  EXPENSE: 'Expenses',
};

export const TrialBalancePage: React.FC = () => {
  const navigate = useNavigate();
  const store = useReportsStore();
  const [, startTransition] = useTransition();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<AccountTypeFilter>('ALL');
  const [includeZero, setIncludeZero] = useState(false);
  const [drilldownAccount, setDrilldownAccount] = useState<TrialBalanceAccountItem | null>(null);

  useEffect(() => {
    reportsStore.fetchTrialBalance(includeZero, selectedType);
  }, []);

  const handleSelectPreset = (key: DatePresetKey) => {
    startTransition(() => {
      reportsStore.setPreset(key);
    });
  };

  const handleApplyCustom = (startDate: string, endDate: string) => {
    startTransition(() => {
      reportsStore.setCustomDateRange(startDate, endDate);
    });
  };

  const handleRefresh = () => {
    startTransition(() => {
      reportsStore.fetchTrialBalance(includeZero, selectedType);
    });
  };

  const handleExportCsv = () => {
    reportsService.exportTrialBalanceCsv(store.trialBalance);
  };

  const handlePrintStatement = () => {
    reportsService.printTrialBalance(store.trialBalance);
  };

  // Filtered accounts list
  const filteredAccounts = useMemo(() => {
    let list = store.trialBalance.accounts || [];

    // Filter by classification
    if (selectedType !== 'ALL') {
      list = list.filter(item => item.account.account_type === selectedType);
    }

    // Filter by zero balances
    if (!includeZero) {
      list = list.filter(item => item.debit_balance > 0 || item.credit_balance > 0);
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        item =>
          item.account.account_name.toLowerCase().includes(q) ||
          (item.account.account_code && item.account.account_code.toLowerCase().includes(q)) ||
          item.account.account_type.toLowerCase().includes(q)
      );
    }

    return list;
  }, [store.trialBalance.accounts, selectedType, includeZero, search]);

  const computedDebitTotal = useMemo(() => {
    return filteredAccounts.reduce((acc, curr) => acc + curr.debit_balance, 0);
  }, [filteredAccounts]);

  const computedCreditTotal = useMemo(() => {
    return filteredAccounts.reduce((acc, curr) => acc + curr.credit_balance, 0);
  }, [filteredAccounts]);

  const isBalanced = computedDebitTotal === computedCreditTotal;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate('/admin/reports')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#011F39] transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Reports & Platform Analytics
          </button>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-sm">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-serif">Trial Balance Statement</h1>
              <p className="text-sm text-slate-500">
                Summary of debit and credit balances for all chart of accounts as of {store.asOfDate}.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
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
            onClick={handlePrintStatement}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#011F39] text-[#FAD465] text-xs font-semibold hover:bg-[#022c50] shadow-sm transition-colors"
          >
            <Printer className="h-4 w-4 text-[#FAD465]" />
            Print Statement
          </button>
        </div>
      </div>

      {/* Date Selector Bar */}
      <ReportDateSelector
        selectedPreset={store.selectedPreset}
        startDate={store.startDate}
        endDate={store.endDate}
        onSelectPreset={handleSelectPreset}
        onApplyCustom={handleApplyCustom}
        onRefresh={handleRefresh}
        isRefreshing={store.isRefreshing}
        subText={`Position As of: ${store.asOfDate}`}
      />

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Debits */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Debits
          </span>
          <span className="text-2xl font-bold font-mono text-slate-900 mt-2 block">
            {formatCurrency(computedDebitTotal)}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">Cumulative Debit Balances</span>
        </div>

        {/* Total Credits */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Credits
          </span>
          <span className="text-2xl font-bold font-mono text-slate-900 mt-2 block">
            {formatCurrency(computedCreditTotal)}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">Cumulative Credit Balances</span>
        </div>

        {/* Balanced Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Balance Status
          </span>
          <div className="flex items-center gap-2 mt-2">
            {isBalanced ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="h-4 w-4" />
                BALANCED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                <AlertTriangle className="h-4 w-4" />
                OUT OF BALANCE
              </span>
            )}
          </div>
          <span className="text-xs text-slate-500 mt-1 block font-mono">
            Diff: {formatCurrency(Math.abs(computedDebitTotal - computedCreditTotal))}
          </span>
        </div>

        {/* Total Accounts */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Active Accounts
          </span>
          <span className="text-2xl font-bold text-slate-900 mt-2 block">
            {filteredAccounts.length}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">
            Matching current filters
          </span>
        </div>
      </div>

      {/* Filters Bar: Search, Type Chips, Zero Balances Toggle */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by code, account name or classification..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:border-[#011F39] focus:outline-none focus:ring-1 focus:ring-[#011F39]"
            />
          </div>

          {/* Toggle: Include Zero Balances */}
          <label className="flex items-center gap-2 cursor-pointer select-none self-start sm:self-auto">
            <input
              type="checkbox"
              checked={includeZero}
              onChange={e => setIncludeZero(e.target.checked)}
              className="rounded border-slate-300 text-[#011F39] focus:ring-[#011F39] h-4 w-4"
            />
            <span className="text-xs font-medium text-slate-600">
              Include Zero Balances
            </span>
          </label>
        </div>

        {/* Classification Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Filter Type:
          </span>
          {(['ALL', 'ASSET', 'LIABILITY', 'FUND_EQUITY', 'INCOME', 'EXPENSE'] as AccountTypeFilter[]).map(
            typeKey => (
              <button
                key={typeKey}
                type="button"
                onClick={() => setSelectedType(typeKey)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  selectedType === typeKey
                    ? 'bg-[#011F39] text-[#FAD465] font-semibold shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {ACCOUNT_TYPE_LABELS[typeKey]}
              </button>
            )
          )}
        </div>
      </div>

      {/* Trial Balance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#011F39] text-white uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4 w-28">Code</th>
                <th className="py-3 px-4">Account Name</th>
                <th className="py-3 px-4 w-32">Classification</th>
                <th className="py-3 px-4 text-right w-36">Gross Debit</th>
                <th className="py-3 px-4 text-right w-36">Gross Credit</th>
                <th className="py-3 px-4 text-right w-40">Debit Balance</th>
                <th className="py-3 px-4 text-right w-40">Credit Balance</th>
                <th className="py-3 px-4 text-center w-20">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredAccounts.map((item, idx) => (
                <tr
                  key={item.account.id}
                  onClick={() => setDrilldownAccount(item)}
                  className={`cursor-pointer transition-colors hover:bg-blue-50/60 ${
                    idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                  }`}
                >
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">
                    {item.account.account_code || '—'}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {item.account.account_name}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.account.account_type === 'ASSET'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : item.account.account_type === 'LIABILITY'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : item.account.account_type === 'FUND_EQUITY'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : item.account.account_type === 'INCOME'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {item.account.account_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-500">
                    {item.gross_debit > 0 ? formatCurrency(item.gross_debit) : '—'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-500">
                    {item.gross_credit > 0 ? formatCurrency(item.gross_credit) : '—'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {item.debit_balance > 0 ? formatCurrency(item.debit_balance) : '—'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {item.credit_balance > 0 ? formatCurrency(item.credit_balance) : '—'}
                  </td>
                  <td className="py-3 px-4 text-center" onClick={e => e.stopPropagation()}>
                    <button
                      type="button"
                      title="Drilldown into account details"
                      onClick={() => setDrilldownAccount(item)}
                      className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredAccounts.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No accounts found matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
            {/* Grand Total Footer */}
            <tfoot className="bg-slate-100 border-t-2 border-[#011F39] font-bold text-slate-900">
              <tr>
                <td colSpan={3} className="py-3.5 px-4 font-serif text-sm uppercase tracking-wider text-[#011F39]">
                  Grand Total
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-600">
                  {formatCurrency(filteredAccounts.reduce((s, a) => s + a.gross_debit, 0))}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-600">
                  {formatCurrency(filteredAccounts.reduce((s, a) => s + a.gross_credit, 0))}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-sm text-[#011F39] font-extrabold">
                  {formatCurrency(computedDebitTotal)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-sm text-[#011F39] font-extrabold">
                  {formatCurrency(computedCreditTotal)}
                </td>
                <td className="py-3.5 px-4 text-center">
                  {isBalanced ? (
                    <span className="text-emerald-600 text-xs font-bold" title="Debits equal Credits">✓</span>
                  ) : (
                    <span className="text-rose-600 text-xs font-bold" title="Unbalanced difference">⚠</span>
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Drilldown Modal */}
      <TrialBalanceDrilldownModal
        accountItem={drilldownAccount}
        onClose={() => setDrilldownAccount(null)}
        asOfDate={store.asOfDate}
      />
    </div>
  );
};
