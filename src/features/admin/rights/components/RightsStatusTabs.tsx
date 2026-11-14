import type React from 'react';
import type { RightsFilterTab, RightsStatusFilter } from '../types/rights.types';

interface RightsStatusTabsProps {
  tabs: RightsFilterTab[];
  activeStatus: RightsStatusFilter;
  onSelectTab: (status: RightsStatusFilter) => void;
}

export const RightsStatusTabs: React.FC<RightsStatusTabsProps> = ({
  tabs,
  activeStatus,
  onSelectTab,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 w-full min-w-0 pb-1 mb-5">
      {tabs.map((tab) => {
        const isActive = activeStatus === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onSelectTab(tab.key)}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
              isActive
                ? 'bg-[#011F39] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full leading-tight ${
                isActive
                  ? 'bg-[#FAD465] text-[#011F39]'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
