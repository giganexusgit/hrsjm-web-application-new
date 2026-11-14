import type React from 'react';
import { BookOpen, ArrowDownLeft, ArrowUpRight, BarChart3 } from 'lucide-react';
import type { MainAccountingMode } from '../types/accounting.types';

interface LedgerModeChipsProps {
  activeMode: MainAccountingMode;
  onSelectMode: (mode: MainAccountingMode) => void;
  counts: {
    PASSBOOK: number;
    CREDIT: number;
    EXPENSE: number;
  };
}

export const LedgerModeChips: React.FC<LedgerModeChipsProps> = ({
  activeMode,
  onSelectMode,
  counts,
}) => {
  const modes: Array<{
    id: MainAccountingMode;
    label: string;
    icon: typeof BookOpen;
    count?: number;
    activeBadgeClass?: string;
  }> = [
    {
      id: 'PASSBOOK',
      label: 'All Transactions',
      icon: BookOpen,
      count: counts.PASSBOOK,
      activeBadgeClass: 'bg-[#FAD465] text-[#011F39]',
    },
    {
      id: 'CREDIT',
      label: 'Income (Inflows)',
      icon: ArrowDownLeft,
      count: counts.CREDIT,
      activeBadgeClass: 'bg-emerald-400 text-emerald-950',
    },
    {
      id: 'EXPENSE',
      label: 'Expenses (Outflows)',
      icon: ArrowUpRight,
      count: counts.EXPENSE,
      activeBadgeClass: 'bg-rose-400 text-rose-950',
    },
    {
      id: 'ANALYTICS',
      label: 'Stream Breakdown',
      icon: BarChart3,
    },
  ];

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
      <div className="p-1 bg-slate-100/90 rounded-xl inline-flex items-center gap-1 border border-slate-200/80 shadow-2xs overflow-x-auto scrollbar-none max-w-full">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = activeMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onSelectMode(mode.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-[#011F39] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-[#FAD465]' : 'text-slate-400'} />
              <span>{mode.label}</span>
              {mode.count !== undefined && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full leading-tight font-mono transition-colors ${
                    isActive
                      ? mode.activeBadgeClass || 'bg-white/20 text-white'
                      : 'bg-slate-200/90 text-slate-700'
                  }`}
                >
                  {mode.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
