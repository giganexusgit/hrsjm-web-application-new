import React, { useEffect, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  Download,
  Printer,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { useReportsStore, reportsStore } from '../store/reportsStore';
import { ReportDateSelector } from '../components/ReportDateSelector';
import { reportsService, formatCurrency } from '../services/reportsService';
import type { DatePresetKey } from '../types/reports.types';

export const BalanceSheetPage: React.FC = () => {
  const navigate = useNavigate();
  const store = useReportsStore();
  const [, startTransition] = useTransition();

  useEffect(() => {
    reportsStore.fetchBalanceSheet();
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
      reportsStore.fetchBalanceSheet();
    });
  };

  const handleExportCsv = () => {
    reportsService.exportBalanceSheetCsv(store.balanceSheet);
  };

  const handlePrintStatement = () => {
    reportsService.printBalanceSheet(store.balanceSheet);
  };

  const { assets, liabilities, equity, total_assets, total_liabilities_and_equity, is_balanced, difference } =
    store.balanceSheet;

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
            <div className="p-2 bg-purple-600 text-white rounded-xl shadow-sm">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-serif">Balance Sheet Statement</h1>
              <p className="text-sm text-slate-500">
                Statutory position of Assets, Liabilities, and Capital & Corpus Reserves as of {store.asOfDate}.
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Assets */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Assets (A)
          </span>
          <span className="text-2xl font-bold font-mono text-blue-700 mt-2 block">
            {formatCurrency(total_assets)}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">
            Cash, bank balances & capital items
          </span>
        </div>

        {/* Total Liabilities & Equity */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Liabilities & Fund Equity (B)
          </span>
          <span className="text-2xl font-bold font-mono text-purple-700 mt-2 block">
            {formatCurrency(total_liabilities_and_equity)}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">
            Vendor dues, corpus fund & net reserves
          </span>
        </div>

        {/* Balanced Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Balance Equation
          </span>
          <div className="flex items-center gap-2 mt-2">
            {is_balanced ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="h-4 w-4" />
                A = B (BALANCED)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                <AlertTriangle className="h-4 w-4" />
                OUT OF BALANCE
              </span>
            )}
          </div>
          <span className="text-xs text-slate-500 mt-1 block font-mono">
            Discrepancy: {formatCurrency(difference)}
          </span>
        </div>
      </div>

      {/* Balancing Status Banner */}
      <div
        className={`rounded-xl p-4 border flex items-center justify-between ${
          is_balanced
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}
      >
        <div className="flex items-center gap-3">
          {is_balanced ? (
            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
          )}
          <div>
            <h4 className="text-sm font-bold">
              {is_balanced
                ? '✓ BALANCED — Total Assets equal Total Liabilities & Fund Equity.'
                : `⚠ OUT OF BALANCE — Net Difference: ${formatCurrency(difference)}`}
            </h4>
            <p className="text-xs opacity-80 mt-0.5">
              Verified statutory compliance with Double-Entry Bookkeeping standard for Registered NGOs.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/admin/accounting')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-50 shadow-sm transition-colors shrink-0"
        >
          <BookOpen className="h-3.5 w-3.5 text-[#011F39]" />
          View General Ledger
        </button>
      </div>

      {/* 2-COLUMN CLASSIFICATION LAYOUT: ASSETS ON LEFT, LIABILITIES & EQUITY ON RIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* COLUMN 1: ASSETS */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-blue-700 text-white px-5 py-3.5 flex items-center justify-between">
            <span className="font-serif font-bold text-sm tracking-wide">1. ASSETS</span>
            <span className="font-mono font-bold text-sm bg-blue-800/80 px-3 py-0.5 rounded">
              Subtotal: {formatCurrency(assets.total)}
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="py-2.5 px-4 w-28">Code</th>
                <th className="py-2.5 px-4">Account Title</th>
                <th className="py-2.5 px-4 text-right w-36">Amount</th>
                <th className="py-2.5 px-4 text-center w-14">Ledger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {assets.items.map((item, idx) => (
                <tr key={item.account.id} className={idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}>
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">
                    {item.account.account_code || '—'}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {item.account.account_name}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-blue-800">
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      title="Open Ledger"
                      onClick={() => navigate(`/admin/accounting/accounts/${item.account.id}/ledger`)}
                      className="p-1 rounded text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-blue-50/50 border-t border-blue-100 font-bold text-slate-900">
              <tr>
                <td colSpan={2} className="py-3.5 px-4 uppercase text-xs text-blue-900 font-serif">
                  TOTAL ASSETS (A)
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-sm text-blue-900 font-extrabold">
                  {formatCurrency(assets.total)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>

        {/* COLUMN 2: LIABILITIES & FUND EQUITY */}
        <div className="space-y-6">
          {/* LIABILITIES SECTION */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-amber-700 text-white px-5 py-3 flex items-center justify-between">
              <span className="font-serif font-bold text-sm tracking-wide">2. CURRENT LIABILITIES</span>
              <span className="font-mono font-bold text-sm bg-amber-800/80 px-3 py-0.5 rounded">
                Subtotal: {formatCurrency(liabilities.total)}
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="py-2.5 px-4 w-28">Code</th>
                  <th className="py-2.5 px-4">Account Title</th>
                  <th className="py-2.5 px-4 text-right w-36">Amount</th>
                  <th className="py-2.5 px-4 text-center w-14">Ledger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {liabilities.items.map((item, idx) => (
                  <tr key={item.account.id} className={idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {item.account.account_code || '—'}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {item.account.account_name}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-800">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        title="Open Ledger"
                        onClick={() => navigate(`/admin/accounting/accounts/${item.account.id}/ledger`)}
                        className="p-1 rounded text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-amber-50/50 border-t border-amber-100 font-bold text-slate-900">
                <tr>
                  <td colSpan={2} className="py-3 px-4 uppercase text-xs text-amber-900 font-serif">
                    Subtotal Liabilities
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-sm text-amber-900 font-extrabold">
                    {formatCurrency(liabilities.total)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* CAPITAL & CORPUS FUND EQUITY SECTION */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-purple-700 text-white px-5 py-3 flex items-center justify-between">
              <span className="font-serif font-bold text-sm tracking-wide">3. CAPITAL & CORPUS EQUITY</span>
              <span className="font-mono font-bold text-sm bg-purple-800/80 px-3 py-0.5 rounded">
                Subtotal: {formatCurrency(equity.total)}
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="py-2.5 px-4 w-28">Code</th>
                  <th className="py-2.5 px-4">Account Title</th>
                  <th className="py-2.5 px-4 text-right w-36">Amount</th>
                  <th className="py-2.5 px-4 text-center w-14">Ledger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {equity.items.map((item, idx) => (
                  <tr key={item.account.id} className={idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {item.account.account_code || '—'}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {item.account.account_name}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-purple-800">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        title="Open Ledger"
                        onClick={() => navigate(`/admin/accounting/accounts/${item.account.id}/ledger`)}
                        className="p-1 rounded text-slate-400 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Current Period Surplus from P&L Row */}
                <tr className="bg-emerald-50/60 font-semibold border-t border-emerald-100">
                  <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                    P&L SURPLUS
                  </td>
                  <td className="py-3 px-4 text-emerald-900">
                    Current Period Net Operating Surplus
                    <span className="block text-[10px] text-emerald-700 font-normal">
                      Transferred automatically from Income & Expenditure statement
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800">
                    {formatCurrency(equity.current_surplus_deficit)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      title="View Profit & Loss"
                      onClick={() => navigate('/admin/reports/profit-loss')}
                      className="p-1 rounded text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-purple-50/50 border-t border-purple-100 font-bold text-slate-900">
                <tr>
                  <td colSpan={2} className="py-3 px-4 uppercase text-xs text-purple-900 font-serif">
                    Subtotal Fund Equity
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-sm text-purple-900 font-extrabold">
                    {formatCurrency(equity.total)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* TOTAL LIABILITIES & EQUITY BANNER */}
          <div className="bg-[#011F39] text-white rounded-xl p-4 flex items-center justify-between">
            <span className="font-serif font-bold text-sm tracking-wide">
              TOTAL LIABILITIES & FUND EQUITY (B)
            </span>
            <span className="font-mono font-bold text-base text-[#FAD465]">
              {formatCurrency(total_liabilities_and_equity)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
