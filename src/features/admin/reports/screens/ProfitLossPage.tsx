import React, { useEffect, useMemo, useState, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  ArrowLeft,
  Download,
  Printer,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useReportsStore, reportsStore } from '../store/reportsStore';
import { ReportDateSelector } from '../components/ReportDateSelector';
import { reportsService, formatCurrency } from '../services/reportsService';
import type { DatePresetKey } from '../types/reports.types';

export const ProfitLossPage: React.FC = () => {
  const navigate = useNavigate();
  const store = useReportsStore();
  const [, startTransition] = useTransition();

  const [search, setSearch] = useState('');
  const [includeZero, setIncludeZero] = useState(false);

  useEffect(() => {
    reportsStore.fetchProfitLoss(includeZero);
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
      reportsStore.fetchProfitLoss(includeZero);
    });
  };

  const handleExportCsv = () => {
    reportsService.exportProfitLossCsv(store.profitLoss);
  };

  const handlePrintStatement = () => {
    reportsService.printProfitLoss(store.profitLoss);
  };

  // Filtered income and expense items
  const filteredIncome = useMemo(() => {
    let items = store.profitLoss.income.items || [];
    if (!includeZero) {
      items = items.filter(i => i.amount > 0);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      items = items.filter(
        i =>
          i.account.account_name.toLowerCase().includes(q) ||
          (i.account.account_code && i.account.account_code.toLowerCase().includes(q))
      );
    }
    return items;
  }, [store.profitLoss.income.items, includeZero, search]);

  const filteredExpenses = useMemo(() => {
    let items = store.profitLoss.expenses.items || [];
    if (!includeZero) {
      items = items.filter(i => i.amount > 0);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      items = items.filter(
        i =>
          i.account.account_name.toLowerCase().includes(q) ||
          (i.account.account_code && i.account.account_code.toLowerCase().includes(q))
      );
    }
    return items;
  }, [store.profitLoss.expenses.items, includeZero, search]);

  const computedTotalIncome = useMemo(() => {
    return filteredIncome.reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredIncome]);

  const computedTotalExpenses = useMemo(() => {
    return filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredExpenses]);

  const computedNetResult = computedTotalIncome - computedTotalExpenses;
  const isSurplus = computedNetResult >= 0;

  const marginPct = computedTotalIncome > 0
    ? ((computedNetResult / computedTotalIncome) * 100).toFixed(1)
    : '0.0';

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
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-sm">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-serif">
                Profit & Loss (Income & Expenditure)
              </h1>
              <p className="text-sm text-slate-500">
                Operating revenues, donations, program expenses and operating surplus from {store.startDate} to {store.endDate}.
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

      {/* Date Range Selector Bar */}
      <ReportDateSelector
        selectedPreset={store.selectedPreset}
        startDate={store.startDate}
        endDate={store.endDate}
        onSelectPreset={handleSelectPreset}
        onApplyCustom={handleApplyCustom}
        onRefresh={handleRefresh}
        isRefreshing={store.isRefreshing}
        subText={`Period: ${store.startDate} to ${store.endDate}`}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Revenue / Income
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-600 mt-2 block">
            {formatCurrency(computedTotalIncome)}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">
            Donations, grants & memberships
          </span>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Expenditure
          </span>
          <span className="text-2xl font-bold font-mono text-rose-600 mt-2 block">
            {formatCurrency(computedTotalExpenses)}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">
            Program aid, salaries & rent
          </span>
        </div>

        {/* Net Result */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            {isSurplus ? 'Net Operating Surplus' : 'Net Operating Deficit'}
          </span>
          <span
            className={`text-2xl font-bold font-mono mt-2 block ${
              isSurplus ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {formatCurrency(Math.abs(computedNetResult))}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">
            {isSurplus ? 'Excess of Income over Expenditure' : 'Excess of Expenditure over Income'}
          </span>
        </div>

        {/* Margin % */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Surplus Margin Rate
          </span>
          <span className="text-2xl font-bold text-slate-900 mt-2 block font-serif">
            {marginPct}%
          </span>
          <span className="text-xs text-slate-400 mt-1 block">
            Retention percentage of inflows
          </span>
        </div>
      </div>

      {/* Result Status Banner */}
      <div
        className={`rounded-xl p-4 border flex items-center justify-between ${
          isSurplus
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}
      >
        <div className="flex items-center gap-3">
          {isSurplus ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          )}
          <div>
            <h4 className="text-sm font-bold">
              {isSurplus
                ? `Net Operating Surplus: ${formatCurrency(computedNetResult)}`
                : `Net Operating Deficit: ${formatCurrency(Math.abs(computedNetResult))}`}
            </h4>
            <p className="text-xs opacity-80 mt-0.5">
              {isSurplus
                ? 'This surplus will be carried forward to the Balance Sheet under Capital & Corpus Reserves.'
                : 'Attention: Expenditures exceed recognized income for this accounting period.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/admin/reports/balance-sheet')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-50 shadow-sm transition-colors shrink-0"
        >
          View in Balance Sheet
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search income or expense accounts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:border-[#011F39] focus:outline-none focus:ring-1 focus:ring-[#011F39]"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
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

      {/* SECTION 1: INCOME TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-emerald-700 text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-sm tracking-wide">1. INCOME / INFLOW ACCOUNTS</span>
          </div>
          <span className="font-mono font-bold text-sm bg-emerald-800/80 px-3 py-0.5 rounded">
            Subtotal: {formatCurrency(computedTotalIncome)}
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase text-[10px] font-semibold tracking-wider">
            <tr>
              <th className="py-2.5 px-4 w-28">Code</th>
              <th className="py-2.5 px-4">Account Name</th>
              <th className="py-2.5 px-4 text-right w-36">Gross Credits</th>
              <th className="py-2.5 px-4 text-right w-40">Recognized Income</th>
              <th className="py-2.5 px-4 text-right w-28">% of Inflows</th>
              <th className="py-2.5 px-4 text-center w-16">Ledger</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {filteredIncome.map((item, idx) => {
              const pct = computedTotalIncome > 0 ? ((item.amount / computedTotalIncome) * 100).toFixed(1) : '0';
              return (
                <tr key={item.account.id} className={idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}>
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">
                    {item.account.account_code || '—'}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {item.account.account_name}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-500">
                    {formatCurrency(item.gross_credit)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-500">
                    {pct}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      title="Open Ledger"
                      onClick={() => navigate(`/admin/accounting/accounts/${item.account.id}/ledger`)}
                      className="p-1 rounded text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredIncome.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No income accounts recorded for this period.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-emerald-50/50 border-t border-emerald-100 font-bold text-slate-900">
            <tr>
              <td colSpan={3} className="py-3 px-4 uppercase text-xs text-emerald-900 font-serif">
                Total Operating Income (A)
              </td>
              <td className="py-3 px-4 text-right font-mono text-sm text-emerald-800 font-extrabold">
                {formatCurrency(computedTotalIncome)}
              </td>
              <td className="py-3 px-4 text-right font-mono text-xs text-slate-600">100.0%</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* SECTION 2: EXPENSES TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-rose-700 text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-sm tracking-wide">
              2. OPERATING EXPENDITURE / OUTFLOW ACCOUNTS
            </span>
          </div>
          <span className="font-mono font-bold text-sm bg-rose-800/80 px-3 py-0.5 rounded">
            Subtotal: {formatCurrency(computedTotalExpenses)}
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase text-[10px] font-semibold tracking-wider">
            <tr>
              <th className="py-2.5 px-4 w-28">Code</th>
              <th className="py-2.5 px-4">Account Name</th>
              <th className="py-2.5 px-4 text-right w-36">Gross Debits</th>
              <th className="py-2.5 px-4 text-right w-40">Expenditure Amount</th>
              <th className="py-2.5 px-4 text-right w-28">% of Outflows</th>
              <th className="py-2.5 px-4 text-center w-16">Ledger</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {filteredExpenses.map((item, idx) => {
              const pct = computedTotalExpenses > 0 ? ((item.amount / computedTotalExpenses) * 100).toFixed(1) : '0';
              return (
                <tr key={item.account.id} className={idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}>
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">
                    {item.account.account_code || '—'}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {item.account.account_name}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-500">
                    {formatCurrency(item.gross_debit)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-rose-700">
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-500">
                    {pct}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      title="Open Ledger"
                      onClick={() => navigate(`/admin/accounting/accounts/${item.account.id}/ledger`)}
                      className="p-1 rounded text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredExpenses.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No expense accounts recorded for this period.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-rose-50/50 border-t border-rose-100 font-bold text-slate-900">
            <tr>
              <td colSpan={3} className="py-3 px-4 uppercase text-xs text-rose-900 font-serif">
                Total Operating Expenses (B)
              </td>
              <td className="py-3 px-4 text-right font-mono text-sm text-rose-800 font-extrabold">
                {formatCurrency(computedTotalExpenses)}
              </td>
              <td className="py-3 px-4 text-right font-mono text-xs text-slate-600">100.0%</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* FINAL SUMMARY BOTTOM LINE CARD */}
      <div className="bg-[#011F39] text-white rounded-xl p-6 shadow-md border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#FAD465] font-semibold block">
            Net Surplus / Deficit Statement Summary
          </span>
          <h3 className="text-xl font-bold font-serif text-white mt-1">
            {isSurplus ? 'NET OPERATING SURPLUS (A - B)' : 'NET OPERATING DEFICIT (B - A)'}
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Accounting period from {store.startDate} to {store.endDate}. Extracted from verified ledger balances.
          </p>
        </div>

        <div className="text-right">
          <span
            className={`text-3xl font-bold font-mono ${
              isSurplus ? 'text-[#FAD465]' : 'text-rose-400'
            }`}
          >
            {formatCurrency(computedNetResult)}
          </span>
          <span className="block text-xs text-slate-300 mt-1">
            {isSurplus ? 'Surplus ready for reserve transfer' : 'Operating shortfall for period'}
          </span>
        </div>
      </div>
    </div>
  );
};
