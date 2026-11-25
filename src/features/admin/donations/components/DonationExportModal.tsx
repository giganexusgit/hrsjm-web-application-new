import React, { useState, useMemo } from 'react';
import {
  X,
  Download,
  Calendar,
  CalendarDays,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import type { Donation } from '../types/donations.types';
import { donationsService } from '../services/donationsService';

interface DonationExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  donations: Donation[];
}

type ExportScope = 'THIS_MONTH' | 'LAST_MONTH' | 'CUSTOM' | 'ALL';

export const DonationExportModal: React.FC<DonationExportModalProps> = ({
  isOpen,
  onClose,
  donations,
}) => {
  const [scope, setScope] = useState<ExportScope>('THIS_MONTH');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Month names for badges
  const { currentMonthName, lastMonthName } = useMemo(() => {
    const now = new Date();
    const curr = now.toLocaleString('en-IN', { month: 'short', year: 'numeric' });
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const last = lastMonthDate.toLocaleString('en-IN', { month: 'short', year: 'numeric' });
    return { currentMonthName: curr, lastMonthName: last };
  }, []);

  // Compute preset date ranges
  const rangeBounds = useMemo(() => {
    const now = new Date();
    if (scope === 'THIS_MONTH') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return {
        from: start.toISOString().slice(0, 10),
        to: end.toISOString().slice(0, 10),
        label: `This Month (${currentMonthName})`,
      };
    }
    if (scope === 'LAST_MONTH') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        from: start.toISOString().slice(0, 10),
        to: end.toISOString().slice(0, 10),
        label: `Last Month (${lastMonthName})`,
      };
    }
    if (scope === 'CUSTOM') {
      return {
        from: fromDate || null,
        to: toDate || null,
        label: fromDate || toDate ? `${fromDate || 'Start'} to ${toDate || 'End'}` : 'Custom Range',
      };
    }
    return { from: null, to: null, label: 'All Recorded Time' };
  }, [scope, fromDate, toDate, currentMonthName, lastMonthName]);

  // Filter donations strictly by the active scope
  const filteredDonations = useMemo(() => {
    const { from, to } = rangeBounds;
    if (!from && !to) return donations;

    const fromMs = from ? new Date(`${from}T00:00:00`).getTime() : null;
    const toMs = to ? new Date(`${to}T23:59:59.999`).getTime() : null;

    return donations.filter((d) => {
      const dTime = new Date(d.created_at).getTime();
      if (isNaN(dTime)) {
        const dateStr = (d.created_at || '').slice(0, 10);
        if (from && dateStr < from) return false;
        if (to && dateStr > to) return false;
        return true;
      }
      if (fromMs !== null && dTime < fromMs) return false;
      if (toMs !== null && dTime > toMs) return false;
      return true;
    });
  }, [donations, rangeBounds]);

  // Statistics
  const totalAmount = useMemo(() => {
    return filteredDonations
      .filter((d) => d.status?.toUpperCase() === 'SUCCESS')
      .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  }, [filteredDonations]);

  if (!isOpen) return null;

  const handleExport = () => {
    if (scope === 'CUSTOM') {
      if (fromDate && toDate && new Date(fromDate).getTime() > new Date(toDate).getTime()) {
        setError('From Date cannot be after To Date.');
        return;
      }
    }
    setError(null);

    let filename = `HRSJM_Donations_${new Date().toISOString().slice(0, 10)}.csv`;
    if (scope === 'THIS_MONTH') {
      filename = `HRSJM_Donations_ThisMonth_${rangeBounds.from}_to_${rangeBounds.to}.csv`;
    } else if (scope === 'LAST_MONTH') {
      filename = `HRSJM_Donations_LastMonth_${rangeBounds.from}_to_${rangeBounds.to}.csv`;
    } else if (scope === 'CUSTOM' && (fromDate || toDate)) {
      filename = `HRSJM_Donations_Custom_${fromDate || 'start'}_to_${toDate || 'latest'}.csv`;
    } else if (scope === 'ALL') {
      filename = `HRSJM_Donations_AllTime_${new Date().toISOString().slice(0, 10)}.csv`;
    }

    donationsService.exportDonationsCsv(filteredDonations, filename);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-[#011F39] px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/10 rounded-lg text-[#FAD465]">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base font-serif tracking-wide text-white">
                Export Donations
              </h3>
              <p className="text-xs text-slate-300">
                Select export date scope for verified donor records and ledger reconciliation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Date Scope Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Select Date Range
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  setScope('THIS_MONTH');
                  setError(null);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  scope === 'THIS_MONTH'
                    ? 'border-[#011F39] bg-[#011F39] text-[#FAD465] shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <CalendarDays className="h-4 w-4 mb-1" />
                <span>This Month</span>
                <span className={`text-[10px] font-normal ${scope === 'THIS_MONTH' ? 'text-slate-300' : 'text-slate-400'}`}>
                  {currentMonthName}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setScope('LAST_MONTH');
                  setError(null);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  scope === 'LAST_MONTH'
                    ? 'border-[#011F39] bg-[#011F39] text-[#FAD465] shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Calendar className="h-4 w-4 mb-1" />
                <span>Last Month</span>
                <span className={`text-[10px] font-normal ${scope === 'LAST_MONTH' ? 'text-slate-300' : 'text-slate-400'}`}>
                  {lastMonthName}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setScope('CUSTOM');
                  setError(null);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  scope === 'CUSTOM'
                    ? 'border-[#011F39] bg-[#011F39] text-[#FAD465] shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Calendar className="h-4 w-4 mb-1" />
                <span>Custom Date</span>
                <span className={`text-[10px] font-normal ${scope === 'CUSTOM' ? 'text-slate-300' : 'text-slate-400'}`}>
                  Pick Dates
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setScope('ALL');
                  setError(null);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  scope === 'ALL'
                    ? 'border-[#011F39] bg-[#011F39] text-[#FAD465] shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FileSpreadsheet className="h-4 w-4 mb-1" />
                <span>All Time</span>
                <span className={`text-[10px] font-normal ${scope === 'ALL' ? 'text-slate-300' : 'text-slate-400'}`}>
                  Full History
                </span>
              </button>
            </div>
          </div>

          {/* Custom Date Pickers */}
          {scope === 'CUSTOM' && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 bg-white focus:border-[#011F39] focus:outline-none focus:ring-1 focus:ring-[#011F39]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 bg-white focus:border-[#011F39] focus:outline-none focus:ring-1 focus:ring-[#011F39]"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Exports donations recorded between 00:00 on From Date to 23:59 on To Date.
              </p>
            </div>
          )}

          {/* Scope Summary Preview */}
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Selected Scope
              </span>
              <span className="text-sm font-bold text-slate-800">
                {rangeBounds.label}
              </span>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>{filteredDonations.length} Records</span>
              </div>
              {filteredDonations.length > 0 && (
                <p className="text-xs font-semibold text-slate-600 mt-1">
                  Vol: ₹ {totalAmount.toLocaleString('en-IN')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={filteredDonations.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#011F39] text-[#FAD465] text-xs font-semibold hover:bg-[#022c50] shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4 text-[#FAD465]" />
            <span>Download CSV ({filteredDonations.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
