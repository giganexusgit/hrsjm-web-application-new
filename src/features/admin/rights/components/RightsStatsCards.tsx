import type React from 'react';
import { FileText, Clock, CheckCircle2, Archive } from 'lucide-react';
import type { RightsStatsSummary, RightsStatusFilter } from '../types/rights.types';

interface RightsStatsCardsProps {
  stats: RightsStatsSummary;
  activeStatus: RightsStatusFilter;
  onSelectStatus?: (status: RightsStatusFilter) => void;
}

export const RightsStatsCards: React.FC<RightsStatsCardsProps> = ({
  stats,
  activeStatus,
  onSelectStatus,
}) => {
  const cards: Array<{
    key: RightsStatusFilter;
    label: string;
    value: number;
    subtitle: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    iconBg: string;
    iconColor: string;
    ringColor: string;
  }> = [
    {
      key: 'ALL',
      label: 'Total Articles',
      value: stats.total,
      subtitle: 'Complete legal rights directory',
      icon: FileText,
      iconBg: 'bg-[#011F39]/10',
      iconColor: 'text-[#011F39]',
      ringColor: 'ring-[#011F39]',
    },
    {
      key: 'DRAFT',
      label: 'Drafts',
      value: stats.drafts,
      subtitle: 'In-progress revisions',
      icon: Clock,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-700',
      ringColor: 'ring-amber-500',
    },
    {
      key: 'PUBLISHED',
      label: 'Published',
      value: stats.published,
      subtitle: 'Active & citizen-accessible',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-700',
      ringColor: 'ring-emerald-500',
    },
    {
      key: 'ARCHIVED',
      label: 'Archived',
      value: stats.archived,
      subtitle: 'Superceded or retired guides',
      icon: Archive,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      ringColor: 'ring-slate-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 w-full min-w-0">
      {cards.map((c) => {
        const IconComponent = c.icon;
        const isSelected = activeStatus === c.key;

        return (
          <button
            key={c.key}
            type="button"
            onClick={() => onSelectStatus && onSelectStatus(c.key)}
            className={`w-full min-w-0 text-left bg-white rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${
              isSelected
                ? `border-transparent ring-2 ${c.ringColor} shadow-md bg-slate-50/50`
                : 'border-slate-200/90 shadow-xs hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2.5 min-w-0">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                {c.label}
              </span>
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${c.iconBg} ${c.iconColor}`}
              >
                <IconComponent size={18} />
              </div>
            </div>

            <div className="font-serif font-bold text-2xl lg:text-3xl text-slate-900 tracking-tight leading-none mb-1.5">
              {c.value}
            </div>

            <div className="text-[11px] text-slate-500 font-medium truncate">
              {c.subtitle}
            </div>
          </button>
        );
      })}
    </div>
  );
};
