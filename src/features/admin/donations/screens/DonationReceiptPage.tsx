import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { donationsService } from '../services/donationsService';
import type { DonationReceiptModel } from '../types/donations.types';

const formatINR = (val: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

export const DonationReceiptPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<DonationReceiptModel | null>(null);

  useEffect(() => {
    if (id) {
      donationsService.getReceiptByDonationId(id).then(r => {
        if (r) setReceipt(r);
      });
    }
  }, [id]);

  if (!receipt) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center text-xs text-slate-500">
        Loading donation receipt...
      </div>
    );
  }

  const handlePrint = () => {
    donationsService.printDonationReceipt(receipt);
  };

  const handleDownload = () => {
    donationsService.downloadDonationReceipt(receipt);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(`/admin/donations/${id}`)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#011F39] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Donation
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-800 text-xs font-semibold hover:bg-slate-50 shadow-xs transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Print Receipt</span>
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#011F39] text-[#FAD465] text-xs font-semibold hover:bg-[#022c50] shadow-sm transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download 80G PDF</span>
          </button>
        </div>
      </div>

      <div className="bg-white border-2 border-[#011F39]/40 rounded-xl p-8 shadow-sm">
        {/* Trust Header */}
        <div className="text-center border-b-2 border-[#011F39] pb-4 mb-5">
          <h1 className="text-2xl font-bold font-serif text-[#011F39] tracking-wide">
            Human Rights &  Social Justice Mission
          </h1>
          <p className="text-sm font-semibold text-slate-700 mt-1">
            मानव अधिकार एवं सामाजिक न्याय संरक्षण ट्रस्ट
          </p>
          <p className="text-xs text-slate-500 italic mt-0.5">
            मानव अधिकार · सामाजिक न्याय
          </p>
          <p className="text-xs text-slate-600 mt-1">
            National HQ: New Delhi, India • Regd. No: HR/0092/2019 • PAN: AABTH4589K
          </p>
          <div className="inline-block bg-[#011F39] text-[#FAD465] text-xs font-bold uppercase tracking-wider px-4 py-1 rounded mt-3 shadow-sm">
            Official Donation Receipt
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs mb-5">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Receipt No:</span>
            <span className="font-mono font-bold text-slate-900">{receipt.receiptNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Date:</span>
            <span className="font-mono text-slate-900">
              {new Date(receipt.receiptDate).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Payment Mode:</span>
            <span className="font-medium text-slate-800">{receipt.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Txn Ref:</span>
            <span className="font-mono text-slate-800 font-medium">{receipt.transactionId || 'N/A'}</span>
          </div>
        </div>

        {/* Donor Information */}
        <div className="text-xs mb-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            DONOR DETAILS
          </span>
          <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-1">
            <div className="text-base font-bold text-slate-900 font-serif">
              {receipt.donorName}
            </div>
            {receipt.donorMobile && (
              <div className="text-slate-600">Mobile: {receipt.donorMobile}</div>
            )}
            {receipt.donorEmail && (
              <div className="text-slate-600">Email: {receipt.donorEmail}</div>
            )}
            {receipt.memberCode && (
              <div className="text-slate-600 font-mono text-[11px]">
                Member ID: <strong>{receipt.memberCode}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Contribution Details */}
        <div className="text-xs mb-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            CONTRIBUTION PARTICULARS
          </span>
          <div className="border border-slate-200 rounded-lg p-4 bg-white flex justify-between items-center">
            <div>
              <div className="font-bold text-sm text-slate-800">{receipt.cause}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Platform Source: {receipt.source || 'Website'}
              </div>
              {receipt.notes && (
                <div className="text-[11px] text-slate-500 italic mt-0.5">
                  Note: {receipt.notes}
                </div>
              )}
            </div>
            <div className="text-right">
              <span className="font-mono text-xl font-bold text-emerald-700">
                {formatINR(receipt.amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Amount Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex justify-between items-center mb-5">
          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
            Total Amount Received
          </span>
          <span className="font-mono text-2xl font-bold text-emerald-700">
            {formatINR(receipt.amount)}
          </span>
        </div>

        {/* 80G Tax Exemption Clause */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 leading-relaxed">
          <span className="font-bold">🏛️ Tax Exemption Notice under Section 80G:</span>
          <p className="mt-0.5 text-[11px] text-amber-800">
            Donations to Human Rights &  Social Justice Mission are eligible for tax deduction under Section 80G of the Income Tax Act, 1961 vide Unique Registration Number (URN) <strong>AAATH1234KF20214</strong> dated 12/04/2021.
          </p>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-12 mt-12 pt-6 border-t border-dashed border-slate-300 text-center text-xs text-slate-600">
          <div>
            <div className="h-10" />
            <div className="border-t border-slate-400 pt-1 font-semibold">
              Finance &amp; Accounts Desk
            </div>
          </div>
          <div>
            <div className="h-10" />
            <div className="border-t border-slate-400 pt-1 font-semibold">
              Authorized Signatory / National Treasurer
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
