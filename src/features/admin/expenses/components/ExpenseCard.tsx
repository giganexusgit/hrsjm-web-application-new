import type React from 'react';
import { FileText, ChevronRight, Building, CreditCard, Smartphone, Banknote } from 'lucide-react';
import type { ExpenseEntryItem } from '../types/expenses.types';
import { formatINR } from '../types/expenses.types';

export const ExpenseListHeader: React.FC = () => {
  return (
    <div className="hidden lg:grid grid-cols-12 gap-3 px-5 py-3.5 bg-[#FAF7F0] border-b border-[#DCE4EC] text-[11px] font-bold text-[#06294D] uppercase tracking-[0.12em] items-center">
      <div className="col-span-2">Voucher &amp; Date</div>
      <div className="col-span-2">Expense Account &amp; Category</div>
      <div className="col-span-3">Payee &amp; Reference</div>
      <div className="col-span-2">Source</div>
      <div className="col-span-1 text-center">Status</div>
      <div className="col-span-2 text-right">Amount</div>
    </div>
  );
};

export const ExpenseCard: React.FC<{
  voucher: ExpenseEntryItem;
  onPress: (voucher: ExpenseEntryItem) => void;
}> = ({ voucher, onPress }) => {
  const isCancelled = voucher.status === 'CANCELLED';
  const isPosted = voucher.status === 'POSTED';
  const accountName = voucher.expense_account?.account_name || 'Expense Account';
  const accountCode = voucher.expense_account?.account_code || '5000';

  // Only vouchers originating specifically from the Web App receive the Web App tag
  const isWebApp = Boolean(
    voucher.reference_number?.toUpperCase().startsWith('WEB-APP') ||
    voucher.description?.includes('[Source: Web App]')
  );

  const formatDate = (isoStr: string): string => {
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return '28 Sep 2026';
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '28 Sep 2026';
    }
  };

  // Resolve source display according to payment method chosen
  const getSourceDisplay = () => {
    const method = String(voucher.payment_method || '').toUpperCase();
    if (method === 'UPI') {
      return {
        label: 'UPI',
        icon: <Smartphone size={12} className="text-[#07294E] shrink-0" />,
      };
    }
    if (method === 'CASH') {
      return {
        label: 'Cash',
        icon: <Banknote size={12} className="text-[#07294E] shrink-0" />,
      };
    }
    if (method === 'BANK_TRANSFER') {
      return {
        label: 'Bank Transfer',
        icon: <Building size={12} className="text-[#07294E] shrink-0" />,
      };
    }
    if (method === 'CARD') {
      return {
        label: 'Card',
        icon: <CreditCard size={12} className="text-[#07294E] shrink-0" />,
      };
    }
    if (method === 'CHEQUE') {
      return {
        label: 'Cheque',
        icon: <Building size={12} className="text-[#07294E] shrink-0" />,
      };
    }
    return {
      label: voucher.paid_from_account?.account_name || 'Bank',
      icon: <Building size={12} className="text-[#07294E] shrink-0" />,
    };
  };

  const sourceInfo = getSourceDisplay();

  return (
    <div
      onClick={() => onPress(voucher)}
      className={`group grid grid-cols-1 lg:grid-cols-12 gap-3 px-5 py-3.5 border-b border-[#EDF2F7] last:border-b-0 hover:bg-[#FAF7F0]/60 transition-all cursor-pointer items-center text-xs ${
        isCancelled ? 'bg-slate-50/70' : 'bg-white'
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onPress(voucher);
      }}
    >
      {/* Col 1: Voucher & Date (col-span-2) */}
      <div className="lg:col-span-2 flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-[#EDF2F7] border border-[#DBE5EE] text-[#07294E] flex items-center justify-center shrink-0 group-hover:bg-[#FAF7F0] group-hover:border-[#DCE4EC] transition-colors">
          <FileText size={16} />
        </div>
        <div className="flex flex-col min-w-0">
          <span
            className={`font-mono text-xs font-bold transition-colors truncate ${
              isCancelled
                ? 'text-slate-400 line-through'
                : 'text-[#07294E] group-hover:text-[#C9971A]'
            }`}
          >
            {voucher.voucher_number}
          </span>
          <span className="text-[11px] text-[#718096] font-medium">
            {formatDate(voucher.expense_date)}
          </span>
        </div>
      </div>

      {/* Col 2: Expense Account & Category (col-span-2) */}
      <div className="lg:col-span-2 flex flex-col min-w-0">
        <span className="font-semibold text-xs text-[#07294E] truncate" title={accountName}>
          {accountName}
        </span>
        <span className="text-[11px] text-[#718096] truncate">
          Code: {accountCode}
        </span>
      </div>

      {/* Col 3: Payee & Reference (col-span-3) */}
      <div className="lg:col-span-3 flex flex-col min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs text-[#34516D] truncate" title={voucher.paid_to}>
            Paid to <strong className="text-[#07294E] font-semibold">{voucher.paid_to}</strong>
          </span>
          {isWebApp && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#EBF5FF] text-[#0369A1] border border-[#BAE6FD] shrink-0"
              title="Created via Web App"
            >
              💻 Web App
            </span>
          )}
        </div>
        {voucher.reference_number ? (
          <span className="text-[11px] text-[#718096] font-mono truncate" title={voucher.reference_number}>
            Ref: {voucher.reference_number}
          </span>
        ) : voucher.description ? (
          <span className="text-[11px] text-[#718096] truncate" title={voucher.description}>
            {voucher.description}
          </span>
        ) : (
          <span className="text-[11px] text-slate-300">—</span>
        )}
      </div>

      {/* Col 4: Payment Source (col-span-2) - Plenty of room, no premature cut-off */}
      <div className="lg:col-span-2 min-w-0">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#EDF2F7] border border-[#DBE5EE] text-[#07294E] max-w-full">
          {sourceInfo.icon}
          <span className="truncate" title={sourceInfo.label}>{sourceInfo.label}</span>
        </span>
      </div>

      {/* Col 5: Status (col-span-1 text-center) */}
      <div className="lg:col-span-1 flex items-center justify-start lg:justify-center">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${
            isCancelled
              ? 'bg-rose-50 text-rose-700 border-rose-200 line-through'
              : isPosted
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-[#FAF7F0] text-[#07294E] border-[#DCE4EC]'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isCancelled
                ? 'bg-rose-500'
                : isPosted
                ? 'bg-emerald-600'
                : 'bg-amber-500'
            }`}
          />
          <span>{voucher.status}</span>
        </span>
      </div>

      {/* Col 6: Amount & Chevron (col-span-2 text-right) - Generous space, clean formatting */}
      <div className="lg:col-span-2 flex items-center justify-between lg:justify-end gap-2.5 whitespace-nowrap min-w-0">
        <span
          className={`font-mono font-bold text-sm sm:text-base ${
            isCancelled
              ? 'text-slate-400 line-through'
              : 'text-[#07294E]'
          }`}
        >
          {formatINR(voucher.amount)}
        </span>
        <div className="w-7 h-7 rounded-lg bg-[#FAF7F0] group-hover:bg-[#07294E] text-[#718096] group-hover:text-white border border-[#DCE4EC] group-hover:border-[#07294E] flex items-center justify-center transition-colors shrink-0">
          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};
