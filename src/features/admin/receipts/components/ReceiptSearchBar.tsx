import type React from 'react';
import { Search, X, SlidersHorizontal, RotateCcw } from 'lucide-react';

interface ReceiptSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenFilterModal: () => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  totalFilteredCount?: number;
}

export const ReceiptSearchBar: React.FC<ReceiptSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenFilterModal,
  onResetFilters,
  hasActiveFilters,
  totalFilteredCount,
}) => {
  return (
    <div className="bg-white p-3.5 sm:p-4 border-b border-[#DCE4EC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0 w-full">
      {/* Search Input Box */}
      <div className="relative flex-1 min-w-[200px] max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#718096] pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search voucher, donor name, contact, cause or ref..."
          className="w-full pl-9 pr-8 py-2 rounded-xl border border-[#DBE5EE] text-xs text-[#0B2F52] placeholder-[#718096] bg-[#EDF2F7] hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FAD465] transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter and Reset Actions */}
      <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto min-w-0">
        {typeof totalFilteredCount === 'number' && (
          <span className="text-xs text-[#718096] font-medium hidden md:inline mr-1">
            Showing <strong className="text-[#0B2F52]">{totalFilteredCount}</strong> vouchers
          </span>
        )}

        <button
          type="button"
          onClick={onOpenFilterModal}
          className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${
            hasActiveFilters
              ? 'bg-[#06294D] text-[#FAD465] border-[#06294D]'
              : 'bg-[#EDF2F7] hover:bg-[#DBE5EE] text-[#06294D] border-[#DBE5EE]'
          }`}
        >
          <SlidersHorizontal size={13} />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#FAD465]" />
          )}
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl border border-[#DBE5EE] bg-white hover:bg-[#EDF2F7] text-[#718096] hover:text-[#06294D] transition cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
