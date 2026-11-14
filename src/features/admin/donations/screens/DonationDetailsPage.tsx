import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  RotateCcw,
  Heart,
  Smartphone,
  Globe,
  Laptop,
  Scale,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useDonationsStore } from '../store/donationsStore';
import { donationsService } from '../services/donationsService';
import { DonationReceiptModal } from '../components/DonationReceiptModal';
import { RefundConfirmModal } from '../components/RefundConfirmModal';
import { toDonationRowModel } from '../data/donationsFixtures';
import type { Donation, DonationReceiptModel, DonationRowModel } from '../types/donations.types';

const formatINR = (val: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

export const DonationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const store = useDonationsStore();

  const matchedFromStore = id ? store.donations.find(d => d.id === id) || null : null;
  const [asyncDonation, setAsyncDonation] = useState<Donation | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receipt, setReceipt] = useState<DonationReceiptModel | null>(null);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundedStatus, setRefundedStatus] = useState<string | null>(null);

  useEffect(() => {
    if (id && !matchedFromStore) {
      donationsService.getDonationById(id).then(d => {
        if (d) setAsyncDonation(d);
      });
    }
  }, [id, matchedFromStore]);

  const baseDonation = matchedFromStore || asyncDonation;
  const donation = baseDonation
    ? refundedStatus
      ? { ...baseDonation, status: refundedStatus }
      : baseDonation
    : null;

  if (!donation) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <Heart className="h-10 w-10 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Donation Record Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          The requested donation does not exist or has been removed.
        </p>
        <button
          type="button"
          onClick={() => navigate('/admin/donations')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#011F39] text-[#FAD465] text-xs font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Donations List
        </button>
      </div>
    );
  }

  const rowModel: DonationRowModel = toDonationRowModel(donation);
  const isCompleted = donation.status?.toUpperCase() === 'SUCCESS';

  const handleOpenReceipt = async () => {
    try {
      const r = await donationsService.getReceiptByDonationId(donation.id);
      setReceipt(r);
      setReceiptModalOpen(true);
    } catch (e) {
      console.error('Failed to load receipt:', e);
    }
  };

  const handleConfirmRefund = async (refundId: string, reason: string) => {
    setIsRefunding(true);
    try {
      await donationsService.refundDonation(refundId, reason);
      setRefundedStatus('REFUNDED');
    } finally {
      setIsRefunding(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Breadcrumb & Header */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/admin/donations')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#011F39] transition-colors mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Donations List
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#011F39] text-[#FAD465] rounded-xl shadow-sm">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-serif">
                Donation Details
              </h1>
              <p className="text-xs text-slate-500 font-mono">ID: {donation.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isCompleted && (
              <button
                type="button"
                onClick={() => setRefundModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Refund
              </button>
            )}
            <button
              type="button"
              onClick={handleOpenReceipt}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#011F39] text-[#FAD465] text-xs font-semibold hover:bg-[#022c50] shadow-sm transition-colors"
            >
              <FileText className="h-4 w-4" />
              View 80G Receipt
            </button>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
        {/* Donor Banner */}
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-xl p-4">
          <div className="w-14 h-14 rounded-full bg-[#011F39] text-[#FAD465] font-bold text-xl flex items-center justify-center shrink-0 uppercase shadow-sm">
            {donation.donor_name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-900 font-serif">
              {donation.donor_name}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span>Mobile: {donation.donor_mobile}</span>
              {donation.donor_email && <span>Email: {donation.donor_email}</span>}
              {donation.member_code && (
                <span className="font-mono text-[11px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold">
                  Member ID: {donation.member_code}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Amount Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
              Contribution Amount
            </span>
            <span className="text-2xl font-bold font-mono text-emerald-800 mt-1 block">
              {formatINR(donation.amount)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                rowModel.statusTone === 'success'
                  ? 'bg-emerald-100 text-emerald-800'
                  : rowModel.statusTone === 'warning'
                  ? 'bg-amber-100 text-amber-800'
                  : rowModel.statusTone === 'neutral'
                  ? 'bg-slate-200 text-slate-700'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {rowModel.statusLabel}
            </span>
          </div>
        </div>

        {/* Detailed Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <span className="font-bold uppercase tracking-wider text-slate-400 block text-[11px]">
              Campaign & Purpose
            </span>
            <div>
              <span className="text-slate-500 block">Cause / Category:</span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                {donation.cause}
              </span>
            </div>
            {(rowModel.eventId || rowModel.eventName || donation.event_id) && (
              <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                <span className="text-amber-800 font-bold block text-[11px] uppercase tracking-wider">
                  Associated Event
                </span>
                <span className="font-semibold text-[#011F39] text-xs mt-0.5 block">
                  {rowModel.eventName || donation.cause.replace(/^Event Donation:\s*/, '')}
                </span>
                {(rowModel.eventId || donation.event_id) && (
                  <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                    Event ID: {rowModel.eventId || donation.event_id}
                  </span>
                )}
              </div>
            )}
            <div>
              <span className="text-slate-500 block">Category Type:</span>
              <span className="font-medium text-slate-800 mt-0.5 block">
                {donation.donation_type === 'RECURRING'
                  ? 'Recurring Mandate'
                  : donation.donation_type === 'OFFLINE'
                  ? 'Offline Contribution'
                  : 'One-time Donation'}
              </span>
            </div>
            {donation.remark && (
              <div>
                <span className="text-slate-500 block">Notes / Remark:</span>
                <span className="text-slate-700 mt-0.5 block leading-relaxed">
                  {donation.remark}
                </span>
              </div>
            )}
          </div>

          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <span className="font-bold uppercase tracking-wider text-slate-400 block text-[11px]">
              Payment Particulars
            </span>
            <div>
              <span className="text-slate-500 block">Platform Origin:</span>
              <span className="inline-flex items-center gap-1 font-medium text-slate-800 mt-0.5">
                {donation.source === 'Application UI' ? (
                  <Smartphone className="h-3.5 w-3.5 text-blue-600" />
                ) : donation.source === 'Web App' ? (
                  <Laptop className="h-3.5 w-3.5 text-indigo-600" />
                ) : (
                  <Globe className="h-3.5 w-3.5 text-emerald-600" />
                )}
                <span>{donation.source || 'Website'}</span>
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Payment Method:</span>
              <span className="font-medium text-slate-800 mt-0.5 block">
                {donation.payment_method || 'Online Payment'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Reference / Transaction ID:</span>
              <span className="font-mono text-slate-800 mt-0.5 block font-bold">
                {donation.transaction_id || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Recorded At:</span>
              <span className="text-slate-700 mt-0.5 block">
                {new Date(donation.created_at).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Double-Entry General Ledger Integration */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-[#011F39] text-[#FAD465] rounded-lg">
                <Scale className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#011F39]">
                  Double-Entry General Ledger Status
                </h4>
                <p className="text-[11px] text-slate-500">
                  Automated financial reconciliation &amp; audit entry posting
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/admin/accounting?search=${donation.transaction_id || donation.id}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-[#011F39] shadow-2xs transition cursor-pointer self-start sm:self-auto"
            >
              <span>View in Accounting &amp; Ledger</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Debit Account</span>
              <span className="font-semibold text-slate-800 block mt-1">Bank / Cashfree Clearing</span>
              <span className="text-[11px] text-slate-500 font-mono">A/c #1010 (Asset)</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Credit Account</span>
              <span className="font-semibold text-slate-800 block mt-1">Public Donations &amp; Grants</span>
              <span className="text-[11px] text-slate-500 font-mono">A/c #4010 (Income)</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Audit Voucher Status</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold mt-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Posted &amp; Reconciled</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono mt-1">Ref: DONATION_PAYMENT</span>
            </div>
          </div>
        </div>
      </div>

      <DonationReceiptModal
        receipt={receiptModalOpen ? receipt : null}
        onClose={() => {
          setReceiptModalOpen(false);
          setReceipt(null);
        }}
      />

      <RefundConfirmModal
        row={rowModel}
        isOpen={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
        onConfirm={handleConfirmRefund}
        isProcessing={isRefunding}
      />
    </div>
  );
};
