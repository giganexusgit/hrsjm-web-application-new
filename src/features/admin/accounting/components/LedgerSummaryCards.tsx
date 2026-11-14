import type React from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight, Scale } from 'lucide-react';
import { formatINR, type LedgerSummary } from '../types/accounting.types';

interface LedgerSummaryCardsProps {
  summary: LedgerSummary;
}

export const LedgerSummaryCards: React.FC<LedgerSummaryCardsProps> = ({ summary }) => {
  const cards = [
    {
      id: 'opening',
      label: 'Opening Balance',
      amount: formatINR(summary.opening_balance),
      amountColor: 'text-slate-900',
      subtitle: 'Carried forward start balance',
      icon: Wallet,
      iconBg: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      id: 'inflow',
      label: 'Total Inflow (Income)',
      amount: summary.total_debit > 0 ? `+ ${formatINR(summary.total_debit)}` : formatINR(0),
      amountColor: 'text-emerald-700',
      subtitle: 'Donations, memberships & receipts',
      icon: ArrowDownLeft,
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'outflow',
      label: 'Total Outflow (Expenses)',
      amount: summary.total_credit > 0 ? `- ${formatINR(summary.total_credit)}` : formatINR(0),
      amountColor: 'text-rose-700',
      subtitle: 'Operations, aid relief & legal costs',
      icon: ArrowUpRight,
      iconBg: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      id: 'closing',
      label: 'Closing Net Balance',
      amount: formatINR(summary.closing_balance),
      amountColor: 'text-[#011F39]',
      subtitle: 'Net liquid cash & bank reserve',
      icon: Scale,
      iconBg: 'bg-[#FFF9E6] text-[#B45309] border-[#FDE68A]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 w-full max-w-full min-w-0">
      {cards.map((c) => {
        const IconComponent = c.icon;
        return (
          <div
            key={c.id}
            className="bg-white rounded-xl border border-slate-200/90 p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between min-w-0 w-full overflow-hidden"
          >
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                  {c.label}
                </span>
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 border ${c.iconBg}`}
                >
                  <IconComponent size={17} />
                </div>
              </div>

              <div
                className={`font-serif font-bold text-lg sm:text-2xl lg:text-[26px] xl:text-3xl tracking-tight leading-none mb-1.5 truncate ${c.amountColor}`}
                title={c.amount}
              >
                {c.amount}
              </div>
            </div>

            <div className="text-[11px] text-slate-500 font-medium truncate pt-2 border-t border-slate-100 mt-2 min-w-0">
              {c.subtitle}
            </div>
          </div>
        );
      })}
    </div>
  );
};
