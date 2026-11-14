import React from 'react';
import { Eye, FileText, RotateCcw, Smartphone, Globe, Laptop, Heart, Calendar } from 'lucide-react';
import type { Donation, DonationRowModel } from '../types/donations.types';
import { toDonationRowModel } from '../data/donationsFixtures';

interface DonationsTableProps {
  donations: Donation[];
  onViewDetails: (row: DonationRowModel) => void;
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

export const DonationsTable: React.FC<DonationsTableProps> = ({
  donations,
  onViewDetails,
  onViewReceipt,
  onRefund,
}) => {
  const rowModels = donations.map(toDonationRowModel);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#011F39] text-white uppercase text-[11px] font-semibold tracking-wider">
            <tr>
              <th className="py-3 px-4 w-60">Donor Information</th>
              <th className="py-3 px-4">Cause / Campaign Purpose</th>
              <th className="py-3 px-4 text-right w-36">Amount</th>
              <th className="py-3 px-4 w-28">Type</th>
              <th className="py-3 px-4 w-32">Source</th>
              <th className="py-3 px-4 w-36">Date & Time</th>
              <th className="py-3 px-4 text-center w-28">Status</th>
              <th className="py-3 px-4 text-center w-28">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {rowModels.map((row, idx) => {
              const isCompleted = row.rawStatus === 'SUCCESS';
              const canRefund = isCompleted;

              return (
                <tr
                  key={row.id}
                  onClick={() => onViewDetails(row)}
                  className={`cursor-pointer transition-colors hover:bg-blue-50/60 ${
                    idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                  }`}
                >
                  {/* Donor Info */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0 uppercase text-xs">
                        {row.donorName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">
                          {row.donorName}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <span>{row.phone || 'No phone'}</span>
                          {row.memberCode && (
                            <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 rounded">
                              {row.memberCode}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Cause & Description */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800 line-clamp-1">
                      {row.donationTitle}
                    </div>
                    {row.donationDescription && (
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {row.donationDescription}
                      </div>
                    )}
                    {(row.eventId || row.eventName) && (
                      <div className="mt-1">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          <Calendar className="h-2.5 w-2.5 text-amber-700" />
                          <span>Event: {row.eventName || row.eventId}</span>
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Amount */}
                  <td className="py-3 px-4 text-right font-mono font-bold text-sm text-[#011F39]">
                    {formatINR(row.amount)}
                  </td>

                  {/* Category Type */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.donationType === 'RECURRING'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : row.donationType === 'OFFLINE'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {row.donationType === 'RECURRING'
                        ? 'Recurring'
                        : row.donationType === 'OFFLINE'
                        ? 'Offline'
                        : 'One-time'}
                    </span>
                  </td>

                  {/* Source */}
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {row.source === 'Application UI' ? (
                        <Smartphone className="h-3 w-3 text-blue-600" />
                      ) : row.source === 'Web App' ? (
                        <Laptop className="h-3 w-3 text-indigo-600" />
                      ) : (
                        <Globe className="h-3 w-3 text-emerald-600" />
                      )}
                      <span>{row.source || 'Website'}</span>
                    </span>
                  </td>

                  {/* Date & Time */}
                  <td className="py-3 px-4 text-slate-600 text-[11px]">
                    <div className="font-medium text-slate-800">{row.dateText}</div>
                    {row.timeText && (
                      <div className="text-[10px] text-slate-400">{row.timeText}</div>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
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
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-center" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      {/* View Details */}
                      <button
                        type="button"
                        title="View Full Details"
                        onClick={() => onViewDetails(row)}
                        className="p-1.5 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>

                      {/* View Receipt */}
                      <button
                        type="button"
                        title="View 80G Receipt"
                        onClick={() => onViewReceipt(row)}
                        className="p-1.5 rounded text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      >
                        <FileText className="h-3.5 w-3.5" />
                      </button>

                      {/* Refund */}
                      {canRefund && (
                        <button
                          type="button"
                          title="Process Refund Reversal"
                          onClick={() => onRefund(row)}
                          className="p-1.5 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {rowModels.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <Heart className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-600">No donation records found</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Try adjusting your filters, date range, or search criteria.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

