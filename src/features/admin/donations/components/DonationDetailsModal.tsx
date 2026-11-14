import React from 'react';
import { X, FileText, RotateCcw, Smartphone, Globe, Laptop, Heart, Calendar } from 'lucide-react';
import type { DonationRowModel } from '../types/donations.types';

interface DonationDetailsModalProps {
  row: DonationRowModel | null;
  onClose: () => void;
  onViewReceipt: (row: DonationRowModel) => void;
  onRefund: (row: DonationRowModel) => void;
}

const formatINR = (val: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

export const DonationDetailsModal: React.FC<DonationDetailsModalProps> = ({
  row,
  onClose,
  onViewReceipt,
  onRefund,
}) => {
  if (!row) return null;

  const isCompleted = row.rawStatus === 'SUCCESS';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-[#011F39] px-6 py-4 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <Heart className="h-5 w-5 text-[#FAD465]" />
            <div>
              <h3 className="font-semibold text-base font-serif tracking-wide text-white">
                Donation Record Details
              </h3>
              <p className="text-xs text-slate-300 font-mono">ID: {row.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Donor Card */}
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-xl p-4">
            <div className="w-12 h-12 rounded-full bg-[#011F39] text-[#FAD465] font-bold text-lg flex items-center justify-center shrink-0 uppercase shadow-sm">
              {row.donorName.charAt(0)}
            </div>
            <div className="min-w-0">
              <h4 className="text-base font-bold text-slate-900 font-serif">
                {row.donorName}
              </h4>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                {row.phone && <span>Mobile: {row.phone}</span>}
                {row.memberCode && (
                  <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
                    Member ID: {row.memberCode}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Key Particulars */}
          <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs">
            {/* Amount */}
            <div className="flex justify-between items-center p-3.5 bg-emerald-50/50">
              <span className="font-semibold text-slate-600 uppercase tracking-wider">Donation Amount</span>
              <span className="font-mono text-xl font-bold text-emerald-800">
                {formatINR(row.amount)}
              </span>
            </div>

            {/* Cause */}
            <div className="flex justify-between items-center p-3">
              <span className="text-slate-500">Cause / Purpose:</span>
              <span className="font-bold text-slate-800 text-right">{row.donationTitle}</span>
            </div>

            {/* Associated Event (if event donation) */}
            {(row.eventId || row.eventName) && (
              <div className="flex justify-between items-center p-3 bg-amber-50/60 border-t border-b border-amber-100">
                <div className="flex items-center gap-1.5 text-amber-900 font-semibold">
                  <Calendar className="h-3.5 w-3.5 text-amber-700" />
                  <span>Associated Event:</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#011F39] text-xs">
                    {row.eventName || row.donationTitle.replace(/^Event Donation:\s*/, '')}
                  </div>
                  {row.eventId && (
                    <div className="text-[10px] font-mono text-slate-500">
                      Event ID: {row.eventId}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Remarks */}
            {row.donationDescription && (
              <div className="flex justify-between items-start p-3">
                <span className="text-slate-500 shrink-0">Notes / Remark:</span>
                <span className="text-slate-700 text-right max-w-xs">{row.donationDescription}</span>
              </div>
            )}

            {/* Category */}
            <div className="flex justify-between items-center p-3">
              <span className="text-slate-500">Donation Category:</span>
              <span className="font-semibold text-slate-800">
                {row.donationType === 'RECURRING'
                  ? 'Recurring (Monthly mandate)'
                  : row.donationType === 'OFFLINE'
                  ? 'Offline Contribution'
                  : 'One-time Direct Donation'}
              </span>
            </div>

            {/* Source */}
            <div className="flex justify-between items-center p-3">
              <span className="text-slate-500">Originating Platform:</span>
              <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                {row.source === 'Application UI' ? (
                  <Smartphone className="h-3.5 w-3.5 text-blue-600" />
                ) : row.source === 'Web App' ? (
                  <Laptop className="h-3.5 w-3.5 text-indigo-600" />
                ) : (
                  <Globe className="h-3.5 w-3.5 text-emerald-600" />
                )}
                <span>{row.source || 'Website'}</span>
              </span>
            </div>

            {/* Date & Time */}
            <div className="flex justify-between items-center p-3">
              <span className="text-slate-500">Transaction Timestamp:</span>
              <span className="font-mono text-slate-700">
                {row.dateText} {row.timeText ? `at ${row.timeText}` : ''}
              </span>
            </div>

            {/* Payment Method / Txn ID */}
            {row.rawDonation?.payment_method && (
              <div className="flex justify-between items-center p-3">
                <span className="text-slate-500">Payment Channel:</span>
                <span className="font-medium text-slate-800">{row.rawDonation.payment_method}</span>
              </div>
            )}

            {row.rawDonation?.transaction_id && (
              <div className="flex justify-between items-center p-3">
                <span className="text-slate-500">Reference / Txn ID:</span>
                <span className="font-mono text-slate-800 font-semibold">{row.rawDonation.transaction_id}</span>
              </div>
            )}

            {/* Status */}
            <div className="flex justify-between items-center p-3">
              <span className="text-slate-500">Verification Status:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                  row.statusTone === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : row.statusTone === 'warning'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : row.statusTone === 'neutral'
                    ? 'bg-slate-100 text-slate-600 border border-slate-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {row.statusLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <div>
            {isCompleted && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRefund(row);
                }}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100/60 border border-rose-200 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Refund Donation</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-white transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onViewReceipt(row);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#011F39] text-[#FAD465] text-xs font-semibold hover:bg-[#022c50] shadow-sm transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>View 80G Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

