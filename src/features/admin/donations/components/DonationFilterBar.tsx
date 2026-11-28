import React, { useState } from 'react';
import { Search, Calendar, X, RotateCcw } from 'lucide-react';
import type { DonationStatus, DateRange } from '../types/donations.types';
import { DonationDateRangeModal } from './DonationDateRangeModal';

interface DonationFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: DonationStatus | null;
  onStatusChange: (val: DonationStatus | null) => void;
  source: string | null;
  onSourceChange: (val: string | null) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  onResetFilters: () => void;
}

export const DonationFilterBar: React.FC<DonationFilterBarProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  source,
  onSourceChange,
  dateRange,
  onDateRangeChange,
  onResetFilters,
}) => {
  const [dateModalOpen, setDateModalOpen] = useState(false);

  const hasActiveFilters = Boolean(
    search || status || source || dateRange.from || dateRange.to
  );

  const dateLabel =
    dateRange.from && dateRange.to
      ? `${dateRange.from} to ${dateRange.to}`
      : dateRange.from
      ? `From ${dateRange.from}`
      : dateRange.to
      ? `Until ${dateRange.to}`
      : 'Date Range';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by donor name, phone, code, cause, amount..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:border-[#011F39] focus:outline-none focus:ring-1 focus:ring-[#011F39]"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">
              Status:
            </span>
            <select
              value={status || ''}
              onChange={e => onStatusChange((e.target.value as DonationStatus) || null)}
              className="text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-700 font-medium focus:border-[#011F39] focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="SUCCESS">Completed</option>
              <option value="REFUNDED">Refunded</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          {/* Source Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">
              Source:
            </span>
            <select
              value={source || ''}
              onChange={e => onSourceChange(e.target.value || null)}
              className="text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-700 font-medium focus:border-[#011F39] focus:outline-none"
            >
              <option value="">All Sources</option>
              <option value="Website">🌐 Website</option>
              <option value="Web App">💻 Web App</option>
              <option value="Application UI">📱 Application UI</option>
            </select>
          </div>

          {/* Date Range Picker Trigger */}
          <button
            type="button"
            onClick={() => setDateModalOpen(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
              dateRange.from || dateRange.to
                ? 'bg-[#011F39] text-[#FAD465] border-[#011F39] font-semibold shadow-sm'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>{dateLabel}</span>
          </button>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              title="Reset all filters"
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      <DonationDateRangeModal
        isOpen={dateModalOpen}
        onClose={() => setDateModalOpen(false)}
        dateRange={dateRange}
        onApply={onDateRangeChange}
        onClear={() => onDateRangeChange({ from: null, to: null })}
      />
    </div>
  );
};
