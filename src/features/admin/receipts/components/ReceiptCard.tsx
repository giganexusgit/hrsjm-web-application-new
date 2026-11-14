import type React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  ChevronRight,
  CreditCard,
  Building,
  Smartphone,
  Banknote,
  Globe,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import type { ReceiptEntryItem } from '../types/receipts.types';
import { classifyReceipt } from '../utils/receiptClassification';
import { formatINR } from '../types/receipts.types';

export interface ReceiptCardProps {
  voucher: ReceiptEntryItem;
  onCancelVoucher?: (voucher: ReceiptEntryItem) => void;
}

export const ReceiptCard: React.FC<ReceiptCardProps> = ({ voucher }) => {
  const navigate = useNavigate();
  const classified = classifyReceipt(voucher);
  const isCancelled = voucher.status === 'CANCELLED';

  const formatDate = (isoStr?: string | null): string => {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      return (
        d.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }) +
        ' • ' +
        d.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    } catch {
      return isoStr;
    }
  };

  const getMethodIcon = () => {
    const m = String(voucher.payment_method || '').toUpperCase();
    if (m.includes('UPI') || m.includes('CASHFREE') || m.includes('ONLINE')) {
      return <Smartphone size={12} className="text-[#07294E] shrink-0" />;
    }
    if (m.includes('BANK') || m.includes('TRANSFER')) {
      return <Building size={12} className="text-[#07294E] shrink-0" />;
    }
    if (m.includes('CARD') || m.includes('DEBIT') || m.includes('CREDIT')) {
      return <CreditCard size={12} className="text-[#07294E] shrink-0" />;
    }
    if (m.includes('CHEQUE')) {
      return <FileText size={12} className="text-[#07294E] shrink-0" />;
    }
    return <Banknote size={12} className="text-[#07294E] shrink-0" />;
  };

  const getMethodLabel = (): string => {
    const m = String(voucher.payment_method || '').toUpperCase();
    if (m.includes('UPI')) return 'UPI';
    if (m.includes('CASHFREE')) return 'Cashfree';
    if (m.includes('BANK') || m.includes('TRANSFER')) return 'Bank Transfer';
    if (m.includes('CARD') || m.includes('DEBIT') || m.includes('CREDIT')) return 'Debit / Credit Card';
    if (m.includes('CHEQUE')) return 'Cheque / DD';
    if (m.includes('CASH')) return 'Cash in Hand';
    return voucher.payment_method || 'Online';
  };

  const getInitials = (name?: string | null): string => {
    if (!name) return 'HR';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const payerName = classified.payerName || voucher.received_from || 'Direct Contributor';
  const payerContact = classified.payerContact;
  const initials = getInitials(payerName);

  return (
    <tr
      onClick={() => navigate(`/admin/receipts/${voucher.id}`)}
      className={`group border-b border-[#EDF2F7] hover:bg-[#FAF7F0]/70 transition-colors cursor-pointer text-xs ${
        isCancelled ? 'bg-slate-50/70' : 'bg-white'
      }`}
    >
      {/* 1. Voucher No & Stream (27%) */}
      <td className="py-3 px-3.5 align-top">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#EDF2F7] border border-[#DBE5EE] text-[#07294E] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#FAF7F0] group-hover:border-[#DCE4EC] transition-colors">
            <FileText size={15} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`font-mono text-xs font-bold transition-colors ${
                  isCancelled
                    ? 'text-slate-400 line-through'
                    : 'text-[#07294E] group-hover:text-[#C9971A]'
                }`}
              >
                {voucher.voucher_number}
              </span>

              {/* Category Badge */}
              <span className="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#EDF2F7] text-[#07294E] border border-[#DBE5EE] shrink-0">
                {classified.categoryLabel}
              </span>

              {/* Channel Badge */}
              {classified.sourceBadgeText && (
                <span className="inline-flex items-center gap-1 text-[9.5px] font-medium px-1.5 py-0.5 rounded-md bg-[#FAF7F0] text-[#34516D] border border-[#DCE4EC] shrink-0">
                  <Globe size={9} className="text-[#34516D]" />
                  <span>{classified.sourceBadgeText}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-[11px] text-[#718096] font-medium mt-0.5 truncate">
              <Calendar size={10.5} className="text-[#718096] shrink-0" />
              <span>{formatDate(voucher.receipt_date || voucher.created_at)}</span>
            </div>

            {/* Purpose / Cause Highlight */}
            {classified.sourceHighlightValue && (
              <div className="text-[11px] text-[#718096] truncate mt-0.5" title={classified.sourceHighlightValue}>
                Purpose: <span className="font-semibold text-[#07294E]">{classified.sourceHighlightValue}</span>
              </div>
            )}
          </div>
        </div>
      </td>

      {/* 2. Received From (Contributor / Payer) (23%) */}
      <td className="py-3 px-3.5 align-top">
        <div className="flex items-start gap-2.5 min-w-0">
          {/* Avatar with brand Navy + Gold Initials */}
          <div className="w-7 h-7 rounded-full bg-[#07294E] text-[#FAD465] font-bold text-[10.5px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-xs text-[#07294E] truncate" title={payerName}>
              {payerName}
            </div>
            {payerContact && (
              <div className="text-[11px] text-[#34516D] truncate mt-0.5" title={payerContact}>
                {payerContact}
              </div>
            )}
            {voucher.reference_number && (
              <div className="text-[10px] font-mono text-[#718096] truncate mt-0.5" title={voucher.reference_number}>
                Ref: {voucher.reference_number}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* 3. Account Allocation (18%) */}
      <td className="py-3 px-3.5 align-top">
        <div className="min-w-0">
          <div className="font-semibold text-xs text-[#07294E] truncate" title={voucher.income_account?.account_name || 'Donation Income'}>
            {voucher.income_account?.account_name || 'Donation Income'}
          </div>
          <div className="text-[11px] text-[#718096] mt-0.5 flex items-center gap-1 truncate">
            <ArrowRight size={10} className="text-[#718096] shrink-0" />
            <span className="text-[#34516D] font-medium truncate">
              {voucher.received_in_account?.account_name || 'Bank Account'}
            </span>
          </div>
        </div>
      </td>

      {/* 4. Payment Method (15%) */}
      <td className="py-3 px-3.5 align-top whitespace-nowrap">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#EDF2F7] text-[#07294E] border border-[#DBE5EE] whitespace-nowrap">
          {getMethodIcon()}
          <span>{getMethodLabel()}</span>
        </span>
      </td>

      {/* 5. Amount & Status (13%) */}
      <td className="py-3 px-3.5 align-top text-right whitespace-nowrap">
        <div
          className={`font-mono font-bold text-sm ${
            isCancelled ? 'text-slate-400 line-through' : 'text-[#07294E]'
          }`}
        >
          {formatINR(voucher.amount)}
        </div>
        <div className="mt-1">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${
              isCancelled
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isCancelled ? 'bg-rose-500' : 'bg-emerald-600'
              }`}
            />
            <span>{isCancelled ? 'Cancelled' : 'Received'}</span>
          </span>
        </div>
      </td>

      {/* 6. Action (9%) */}
      <td className="py-3 px-3.5 align-middle text-right">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/receipts/${voucher.id}`);
          }}
          className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#FAF7F0] hover:bg-[#07294E] text-[#718096] hover:text-white border border-[#DCE4EC] hover:border-[#07294E] transition shadow-2xs cursor-pointer group/btn"
          title="View Voucher Slip"
        >
          <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </td>
    </tr>
  );
};

export const ReceiptTableRow = ReceiptCard;
