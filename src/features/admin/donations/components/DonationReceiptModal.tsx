import React, { useState } from 'react';
import { X, Printer, ShieldCheck, Download, Loader2 } from 'lucide-react';
import type { DonationReceiptModel } from '../types/donations.types';
import { donationsService } from '../services/donationsService';
import { numberToIndianWords } from '../utils/donationReceiptGenerator';
import hrsjmLogo from '../../../../assets/hrsjm_logo.png';

interface DonationReceiptModalProps {
  receipt: DonationReceiptModel | null;
  onClose: () => void;
}

const formatINR = (val: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

export const DonationReceiptModal: React.FC<DonationReceiptModalProps> = ({
  receipt,
  onClose,
}) => {
  const [downloading, setDownloading] = useState(false);

  if (!receipt) return null;

  const handlePrint = () => {
    donationsService.printDonationReceipt(receipt);
  };

  const handleDownload = () => {
    try {
      setDownloading(true);
      donationsService.downloadDonationReceipt(receipt);
    } finally {
      setTimeout(() => setDownloading(false), 900);
    }
  };

  const amountInWords = numberToIndianWords(receipt.amount);
  const halfDeductible = (receipt.amount * 0.5).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const donorPan = receipt.donorPan || receipt.panNumber || 'Available upon record';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#011F39]/70 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#011F39] px-6 py-4 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FAD465]/20 flex items-center justify-center text-[#FAD465] border border-[#FAD465]/30">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base font-serif tracking-wide text-white">
                Official 80G Statutory Donation Receipt
              </h3>
              <p className="text-xs text-amber-300 font-mono">
                Receipt No: {receipt.receiptNumber}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Receipt Document Body (Scrollable) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-100/70">
          <div
            id="official-80g-receipt"
            className="bg-white border-2 border-[#011F39]/40 rounded-xl p-5 sm:p-7 shadow-sm relative overflow-hidden"
          >
            {/* Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-30 text-5xl sm:text-6xl font-black text-[#011F39]/[0.03] select-none pointer-events-none tracking-widest whitespace-nowrap">
              HRSJM SECTION 80G
            </div>

            {/* Official Trust Letterhead */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 border-b-2 border-[#011F39] pb-4 mb-4 text-center sm:text-left">
              <img
                src={hrsjmLogo}
                alt="HRSJM Official Crest"
                className="w-16 h-16 object-contain shrink-0"
              />
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-lg sm:text-xl font-black font-serif text-[#011F39] tracking-wide leading-tight">
                  Human Rights &  Social Justice Mission
                </h2>
                <div className="text-xs font-bold text-amber-700 mt-0.5">
                  मानव अधिकार एवं सामाजिक न्याय संरक्षण ट्रस्ट
                </div>
                <div className="text-[11px] text-slate-500 italic">
                  मानव अधिकार · सामाजिक न्याय | Protecting Constitutional Liberties
                </div>
                <div className="text-[10px] text-slate-600 font-medium mt-1 leading-snug">
                  Regd. Under Indian Trust Act &amp; Societies Reg. Act XXI 1860 • Regd. No: <strong>HR/0092/2019</strong><br />
                  PAN: <strong>AABTH4589K</strong> • 12A URN: <strong>AAATH1234KE20212</strong> • NITI Aayog: <strong>DL/2021/0284719</strong><br />
                  National Secretariat: Central Janpath, New Delhi - 110001 • Web: www.hrsjm.org
                </div>
              </div>
            </div>

            {/* Statutory 80G Ribbon */}
            <div className="bg-gradient-to-r from-[#011F39] to-[#06294D] text-[#FAD465] text-center py-2 px-3 rounded-lg mb-4 border border-[#FAD465]/40 shadow-xs">
              <div className="text-[11px] font-black uppercase tracking-wider">
                Official Statutory Donation Receipt &amp; 80G Tax Exemption Certificate
              </div>
              <div className="text-[9.5px] text-slate-200 mt-0.5">
                Eligible for 50% Tax Deduction under Section 80G(5)(vi) of the Income Tax Act, 1961
              </div>
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] mb-4">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Receipt No:</span>
                <span className="font-mono font-bold text-[#011F39]">{receipt.receiptNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Receipt Date:</span>
                <span className="font-semibold text-slate-800">
                  {new Date(receipt.receiptDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">80G URN:</span>
                <span className="font-mono font-bold text-[#011F39]">AABTH4589KF20214</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Financial Year:</span>
                <span className="font-semibold text-slate-800">2026 – 2027</span>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Payment Mode:</span>
                <span className="font-medium text-slate-800">{receipt.paymentMethod || 'Cashfree PG (Verified)'}</span>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Transaction Ref:</span>
                <span className="font-mono text-slate-800 text-[10.5px] truncate block" title={receipt.transactionId || ''}>
                  {receipt.transactionId || 'N/A'}
                </span>
              </div>
            </div>

            {/* Donor Information */}
            <div className="text-xs mb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                CONTRIBUTOR / DONOR DETAILS
              </span>
              <div className="border border-slate-200 rounded-lg p-3 bg-white grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Legal Name:</div>
                  <div className="text-sm font-bold text-slate-900 font-serif">{receipt.donorName}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Donor PAN (For 80G):</div>
                  <div className="font-mono font-bold text-amber-700">{donorPan}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Contact:</div>
                  <div className="text-slate-600 text-[11px]">{receipt.donorMobile || 'Available on record'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Email:</div>
                  <div className="text-slate-600 text-[11px] truncate">{receipt.donorEmail || 'Available on record'}</div>
                </div>
              </div>
            </div>

            {/* Contribution Particulars Table */}
            <div className="text-xs mb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                CONTRIBUTION PARTICULARS
              </span>
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[10px] uppercase">
                    <tr>
                      <th className="p-2.5 font-bold">Mission Purpose / Cause</th>
                      <th className="p-2.5 font-bold hidden sm:table-cell">Account Allocation</th>
                      <th className="p-2.5 font-bold text-right">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2.5">
                        <div className="font-bold text-slate-800">{receipt.cause}</div>
                        <div className="text-[10px] text-slate-400">Source: {receipt.source || 'Website Official Portal'}</div>
                      </td>
                      <td className="p-2.5 text-slate-600 text-[11px] hidden sm:table-cell">
                        HRSJM General Relief &amp; Legal Pool
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900 text-sm">
                        {formatINR(receipt.amount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Amount in Words & Figure Banner */}
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Amount in Words:
                </span>
                <span className="text-xs font-bold text-emerald-950">{amountInWords}</span>
                <div className="text-[10.5px] text-emerald-700 font-medium mt-0.5">
                  Section 80G Deductible Amount (50%): <strong>₹{halfDeductible}</strong>
                </div>
              </div>
              <div className="text-right sm:border-l sm:border-emerald-200 sm:pl-4 w-full sm:w-auto">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Net Received:
                </span>
                <span className="font-serif text-xl font-black text-emerald-700">
                  {formatINR(receipt.amount)}
                </span>
              </div>
            </div>

            {/* 80G Tax Exemption Clause */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-900 leading-relaxed mb-4">
              <span className="font-bold">🏛️ Tax Exemption Certificate under Section 80G:</span>
              <p className="mt-0.5 text-[10.5px] text-amber-800">
                Donations to Human Rights &  Social Justice Mission are eligible for tax deduction under Section 80G(5)(vi) of the Income Tax Act, 1961 vide Unique Registration Number (URN) <strong>AABTH4589KF20214</strong> dated 12/04/2021. No commercial return, goods, or services were provided in consideration of this contribution.
              </p>
            </div>

            {/* Dual Signatures & Seals */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full border border-dashed border-[#06294D] flex items-center justify-center text-[7px] font-bold text-[#06294D] text-center leading-tight bg-slate-50 uppercase">
                  HRSJM<br />SEAL<br />DELHI
                </div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  <span className="font-bold text-slate-700">Internal Audit Desk</span><br />
                  Electronic Reconciliation<br />
                  Central Accounts Cell
                </div>
              </div>
              <div className="text-right">
                <div className="font-serif italic font-bold text-slate-800 text-sm">K. S. Rathore</div>
                <div className="font-bold text-[11px] text-[#011F39]">Authorized Signatory / National Treasurer</div>
                <div className="text-[9px] text-slate-400">Human Rights &  Social Justice Mission</div>
              </div>
            </div>

            {/* Verification Footnote */}
            <div className="mt-3 pt-2 border-t border-slate-100 text-center text-[9px] text-slate-400">
              This is an authorized, computer-generated statutory receipt valid under Section 80G of the Income Tax Act, 1961. Requires no physical signature under IT Act 2000.
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="h-4 w-4 text-[#011F39]" />
              <span>Print Receipt</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#011F39] text-[#FAD465] text-xs font-bold hover:bg-[#06294D] shadow-sm transition-colors cursor-pointer disabled:opacity-75"
            >
              {downloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Download 80G PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
