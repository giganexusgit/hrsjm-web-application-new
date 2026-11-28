import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Search,
  Filter,
  CheckCircle2,
  X,
  Printer,
  Sparkles,
  Heart,
} from 'lucide-react';
import { useCurrentMember } from '../store/memberStore';
import type { MemberPassbookEntry, TransactionType } from '../types/member.types';
import { generate80GReceiptPdf } from '../utils/memberDocumentGenerator';
import { GlobalPaymentModal } from '../../payments';

export const MemberPassbookPage: React.FC = () => {
  const { member, passbook, processDonation } = useCurrentMember();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | TransactionType>('ALL');
  const [selectedReceipt, setSelectedReceipt] = useState<MemberPassbookEntry | null>(null);
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);

  // Filtered transactions
  const filteredEntries = useMemo(() => {
    return passbook.filter((entry) => {
      if (typeFilter !== 'ALL' && entry.type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesReceipt = entry.receiptNumber.toLowerCase().includes(q);
        const matchesTxnId = entry.transactionId.toLowerCase().includes(q);
        const matchesTitle = entry.title.toLowerCase().includes(q);
        const matchesDesc = entry.description.toLowerCase().includes(q);
        if (!matchesReceipt && !matchesTxnId && !matchesTitle && !matchesDesc) return false;
      }
      return true;
    });
  }, [passbook, typeFilter, searchQuery]);

  // Aggregate stats
  const totalAmount = useMemo(() => {
    return passbook.reduce((sum, item) => sum + item.amount, 0);
  }, [passbook]);

  const total80GEligible = useMemo(() => {
    return passbook
      .filter((item) => item.has80GReceipt)
      .reduce((sum, item) => sum + item.amount, 0);
  }, [passbook]);

  const handleDownloadPdf = (entry: MemberPassbookEntry) => {
    const doc = generate80GReceiptPdf(member, entry);
    doc.save(`HRSJM_80G_Receipt_${entry.receiptNumber.replace(/\//g, '_')}.pdf`);
  };

  const getBadgeColor = (type: TransactionType) => {
    switch (type) {
      case 'DONATION':
        return 'bg-[#FFF9E6] text-[#C9971A] border-[#FAD465]/60';
      case 'MEMBERSHIP_FEE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'MEMBERSHIP_RENEWAL':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'EVENT_FEE':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* Top Banner / Metrics Overview */}
      <div className="bg-gradient-to-r from-[#011F39] via-[#06294D] to-[#011F39] text-white p-6 md:p-8 rounded-2xl shadow-md border border-[#FAD465]/30 relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FAD465]/20 text-[#FAD465] border border-[#FAD465]/30 mb-2">
                <FileText className="w-3.5 h-3.5" />
                Statutory Financial Ledger & Tax Exemption Vault
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white !text-white" style={{ color: '#FFFFFF' }}>
                Member Passbook & Receipts
              </h1>
              <p className="text-xs md:text-sm text-slate-200 max-w-xl mt-1">
                Complete verifiable audit trail of your membership contributions and humanitarian relief donations with instant 80G IT deductions.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2.5 rounded-xl text-right">
                <span className="text-[11px] text-slate-300 block">Registered Donor PAN</span>
                <span className="text-sm font-mono font-bold text-[#FAD465]">ABCDE1234F</span>
              </div>

              <button
                type="button"
                onClick={() => setIsContributeModalOpen(true)}
                className="bg-[#FAD465] hover:bg-[#E9B82E] text-[#06294D] font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 fill-[#06294D]" />
                <span>Contribute via Cashfree (80G)</span>
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-xl">
              <span className="text-xs text-slate-300 block font-medium">Cumulative Contributions</span>
              <span className="text-2xl font-black text-white font-mono mt-1 block">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Across {passbook.length} total transactions
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-xl">
              <span className="text-xs text-[#FAD465] block font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> 80G Tax Deductible Total
              </span>
              <span className="text-2xl font-black text-[#FAD465] font-mono mt-1 block">
                ₹{total80GEligible.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-slate-300 mt-1 block">
                50% allowable deduction under Sec 80G(5)(vi)
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-xl">
              <span className="text-xs text-slate-300 block font-medium">Form 10BD Compliance</span>
              <span className="text-lg font-bold text-emerald-400 mt-1 block flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5" /> Reconciled & Reported
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Synced with Income Tax e-filing portal
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search receipt #, UTR, or cause..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#06294D]"
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto text-xs">
          <span className="text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Category:
          </span>
          <button
            type="button"
            onClick={() => setTypeFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              typeFilter === 'ALL'
                ? 'bg-[#06294D] text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All ({passbook.length})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('DONATION')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              typeFilter === 'DONATION'
                ? 'bg-[#06294D] text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Donations
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('MEMBERSHIP_RENEWAL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              typeFilter === 'MEMBERSHIP_RENEWAL'
                ? 'bg-[#06294D] text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Renewals
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('MEMBERSHIP_FEE')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              typeFilter === 'MEMBERSHIP_FEE'
                ? 'bg-[#06294D] text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Induction Fees
          </button>
        </div>
      </div>

      {/* Transaction Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-sm">No transactions match your search</h3>
            <p className="text-xs text-slate-400">Try resetting the filter or entering another search term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Receipt Number</th>
                  <th className="py-3 px-4">Particulars</th>
                  <th className="py-3 px-4">Mode / UTR</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">80G Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Date */}
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      <div className="font-medium text-slate-800">
                        {new Date(entry.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(entry.date).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    {/* Receipt No */}
                    <td className="py-3 px-4 font-mono font-bold text-[#06294D] whitespace-nowrap">
                      {entry.receiptNumber}
                    </td>

                    {/* Particulars & Badge */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getBadgeColor(
                            entry.type
                          )}`}
                        >
                          {entry.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-800 text-xs">{entry.title}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{entry.description}</div>
                    </td>

                    {/* Payment Mode */}
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      <div className="font-medium text-slate-700">{entry.paymentMethod}</div>
                      <div className="text-[11px] font-mono text-slate-400">{entry.transactionId}</div>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-right font-black text-sm text-emerald-700 whitespace-nowrap">
                      ₹{entry.amount.toLocaleString('en-IN')}
                    </td>

                    {/* 80G Status */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {entry.has80GReceipt ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Eligible
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Standard</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedReceipt(entry)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadPdf(entry)}
                          className="px-2.5 py-1 rounded-lg bg-[#06294D] hover:bg-[#083a6b] text-white font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
                          title="Download 80G Tax Receipt (PDF)"
                        >
                          <Download className="w-3 h-3 text-[#FAD465]" />
                          PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Receipt Voucher Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 border border-slate-200 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="border-b border-slate-100 pb-4 text-center space-y-1">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#FAD465]/20 text-[#06294D] border border-[#FAD465]/40 inline-block mb-1">
                Official Computerized Voucher
              </span>
              <h2 className="text-xl font-black text-[#06294D]">
                Human Rights & Social Justice Mission
              </h2>
              <p className="text-xs text-slate-500">
                80G Order: CIT(E)/DELHI/80G/2021-22/A/10492 • PAN: AAATH1234F
              </p>
            </div>

            {/* Voucher Details */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200/80">
                <div>
                  <span className="text-slate-400 block text-[11px]">Receipt Number</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {selectedReceipt.receiptNumber}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[11px]">Date of Receipt</span>
                  <span className="font-medium text-slate-700">
                    {new Date(selectedReceipt.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Received From (Donor / Member)</span>
                <span className="font-bold text-[#06294D] text-sm">{member.fullName}</span>
                <span className="text-slate-500 block text-[11px]">
                  Member ID: {member.membershipNumber} • PAN: {selectedReceipt.donorPan || 'ABCDE1234F'}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200/80">
                <span className="text-slate-400 block text-[11px]">Particulars / Purpose</span>
                <span className="font-semibold text-slate-800">{selectedReceipt.title}</span>
                <p className="text-slate-500 text-[11px] mt-0.5">{selectedReceipt.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
                <div>
                  <span className="text-slate-400 block text-[11px]">Payment Mode & Ref</span>
                  <span className="font-medium text-slate-700">
                    {selectedReceipt.paymentMethod} • <span className="font-mono text-[11px]">{selectedReceipt.transactionId}</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[11px]">Amount Received</span>
                  <span className="text-xl font-black text-emerald-700">
                    ₹{selectedReceipt.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {selectedReceipt.has80GReceipt && (
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-[11px] space-y-0.5">
                  <p className="font-bold">Sec 80G(5)(vi) Income Tax Deduction Eligibility</p>
                  <p className="text-amber-800">
                    This contribution qualifies for a 50% deduction under Section 80G of the IT Act 1961. Unique Reference: {selectedReceipt.section80GRef}.
                  </p>
                </div>
              )}
            </div>

            {/* Voucher Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleDownloadPdf(selectedReceipt)}
                className="flex-1 py-3 rounded-xl bg-[#06294D] hover:bg-[#083a6b] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4 text-[#FAD465]" />
                Download Formal 80G PDF
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cashfree Contribution Modal */}
      {isContributeModalOpen && (
        <GlobalPaymentModal
          isOpen={isContributeModalOpen}
          onClose={() => setIsContributeModalOpen(false)}
          payload={{
            purpose: 'donation',
            amount: 1000,
            title: 'Humanitarian & Human Rights Legal Aid',
            subtitle: 'Tax-Exempt Contribution with 80G Deductions',
            userId: member.id,
            donorName: member.fullName,
            donorMobile: member.phone,
            donorEmail: member.email,
            panNumber: 'ABCDE1234F',
            need80GReceipt: true,
          }}
          onSuccess={(receipt) => {
            processDonation(
              receipt.purposeTitle || 'Humanitarian Legal Aid Contribution',
              receipt.amount,
              'CASHFREE',
              receipt.panNumber,
              receipt.transactionId
            );
            setIsContributeModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
