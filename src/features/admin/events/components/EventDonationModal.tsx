import React, { useState } from 'react';
import {
  HeartHandshake,
  X,
  ShieldCheck,
  ArrowRight,
  CheckCircle,
  Calendar,
  MapPin,
  Printer,
  Loader2,
} from 'lucide-react';
import type { EventListItem } from '../types/events.types';
import { cashfreeService } from '@/features/payments';
import { donationsStore } from '@/features/admin/donations/store/donationsStore';

interface EventDonationModalProps {
  event: EventListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (receipt: any) => void;
  defaultDonorName?: string;
  defaultDonorMobile?: string;
  defaultDonorEmail?: string;
}

export const EventDonationModal: React.FC<EventDonationModalProps> = ({
  event,
  isOpen,
  onClose,
  onSuccess,
  defaultDonorName = '',
  defaultDonorMobile = '',
  defaultDonorEmail = '',
}) => {
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState<string>(defaultDonorName);
  const [donorMobile, setDonorMobile] = useState<string>(defaultDonorMobile);
  const [donorEmail, setDonorEmail] = useState<string>(defaultDonorEmail);
  const [panNumber, setPanNumber] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<any | null>(null);

  if (!isOpen || !event) return null;

  // If donations are disabled for this event, do not render donation initiation
  if (!event.isDonationEnabled) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
            <X size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-800">Donations Not Enabled</h3>
          <p className="text-xs text-slate-500">
            Voluntary donations are not active for "{event.title}".
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#011F39] text-white hover:bg-[#06294D] transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const parsedAmount = parseFloat(customAmount);
  const isValidAmount = Number.isFinite(parsedAmount) && parsedAmount >= 10;

  const handleProceedDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isValidAmount) {
      setErrorMsg('Please enter a valid donation amount (minimum ₹10).');
      return;
    }

    try {
      setIsSubmitting(true);

      const session = await cashfreeService.createDonationOrder({
        amount: parsedAmount,
        cause: event.title,
        donorName: donorName.trim() || 'Voluntary Contributor',
        donorMobile: donorMobile.trim() || undefined,
        donorEmail: donorEmail.trim() || undefined,
        panNumber: panNumber.trim() ? panNumber.trim().toUpperCase() : undefined,
        need80G: Boolean(panNumber.trim()),
        eventId: event.id,
      });

      await cashfreeService.launchCashfreeCheckout(
        session,
        (verifyRes) => {
          const completedDonation: any = {
            id: session.order_id,
            amount: parsedAmount,
            cause: `Event Donation: ${event.title}`,
            donor_name: donorName.trim() || 'Voluntary Contributor',
            donor_mobile: donorMobile.trim(),
            donor_email: donorEmail.trim() || null,
            transaction_id: verifyRes.transaction_id || `CF-${Date.now().toString().slice(-8)}`,
            receipt_number:
              verifyRes.receipt_number ||
              `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
            status: 'SUCCESS',
            source: 'Web App',
            donation_type: 'ONE_TIME',
            event_id: event.id,
            event_name: event.title,
            remark: `Event ID: ${event.id}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Update authoritative donations store
          try {
            donationsStore.recordCompletedDonation(completedDonation);
          } catch {}

          setReceiptData({
            orderId: session.order_id,
            amount: parsedAmount,
            receiptNumber: completedDonation.receipt_number,
            transactionId: completedDonation.transaction_id,
            eventId: event.id,
            eventTitle: event.title,
            donorName: completedDonation.donor_name,
            paidAt: new Date().toLocaleString('en-IN'),
          });

          setIsSubmitting(false);
          if (onSuccess) onSuccess(completedDonation);
        },
        () => {
          setIsSubmitting(false);
        },
      );
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Payment initiation failed. Please try again.');
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-3xl flex flex-col shadow-2xl overflow-hidden relative max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Receipt View (Shown upon successful backend verification) */}
        {receiptData ? (
          <div className="p-6 space-y-5 overflow-y-auto">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold font-serif text-[#011F39]">
                Donation Received with Gratitude!
              </h3>
              <p className="text-xs text-slate-500">
                Your voluntary donation for <span className="font-semibold text-slate-800">"{receiptData.eventTitle}"</span> has been verified.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="rounded-2xl border border-slate-200 bg-[#FAF7F0] p-4 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-amber-200/70">
                <span className="text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  Amount Donated
                </span>
                <span className="font-mono text-xl font-black text-[#011F39]">
                  ₹{Number(receiptData.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Receipt No:</span>
                <span className="font-mono font-bold text-slate-800">{receiptData.receiptNumber}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono font-medium text-slate-700">{receiptData.transactionId}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Event Name:</span>
                <span className="font-semibold text-slate-800 text-right max-w-xs">{receiptData.eventTitle}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Event ID:</span>
                <span className="font-mono text-[11px] text-slate-600">{receiptData.eventId}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Donor:</span>
                <span className="font-semibold text-slate-800">{receiptData.donorName}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="text-slate-700">{receiptData.paidAt}</span>
              </div>
            </div>

            {/* 80G Statutory Callout */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-[11px] text-emerald-800">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <span>
                Section 80G(5)(vi) Income Tax deduction applicable. Official tax receipt logged in your account.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Printer size={15} />
                <span>Print Receipt</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-black bg-[#FAD465] text-[#011F39] hover:bg-[#E9B82E] transition cursor-pointer shadow-sm text-center"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Donation Form View */
          <form onSubmit={handleProceedDonation} className="flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#011F39] flex items-center justify-center">
                  <HeartHandshake size={20} className="text-[#011F39]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold font-serif text-[#011F39]">
                    Support This Event
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    50% Section 80G Tax Exemption Applicable
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer transition"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Event Overview Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                <span className="text-[10px] font-bold text-[#B45309] uppercase tracking-wider block">
                  Event Details
                </span>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {event.title}
                </h4>
                <div className="flex items-center gap-3 text-slate-500 pt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-slate-400" />
                    <span className="truncate">{event.location}</span>
                  </span>
                  {event.startAt && (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-slate-400" />
                      <span>{new Date(event.startAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Donation Appeal Message (Visible when configured) */}
              {event.donationMessage && (
                <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#FDE68A] text-xs">
                  <span className="text-[10.5px] font-bold text-[#011F39] uppercase tracking-wider block mb-1">
                    Message from Event Organizers:
                  </span>
                  <p className="text-slate-800 italic leading-relaxed">
                    "{event.donationMessage}"
                  </p>
                </div>
              )}

              {/* Voluntary Donation Amount (Strictly User-Defined, NO Preset Buttons) */}
              <div>
                <label className="block text-xs font-bold text-[#011F39] uppercase tracking-wider mb-1.5">
                  Enter Your Voluntary Donation Amount (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-base pointer-events-none">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="10"
                    step="1"
                    placeholder="Enter amount (e.g. 500)"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    autoFocus
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#011F39] focus:ring-1 focus:ring-[#011F39]"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Every contribution is voluntary. Donors choose whatever amount they wish to give.
                </p>
              </div>

              {/* Donor Contact Particulars */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                  Donor Particulars (For 80G Receipt)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="Your Full Name"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-[#011F39]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={donorMobile}
                      onChange={(e) => setDonorMobile(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-[#011F39]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      placeholder="donor@example.com"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-[#011F39]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">PAN Number (80G Tax Benefit)</label>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="ABCDE1234F"
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono uppercase text-slate-800 focus:outline-none focus:border-[#011F39]"
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              {/* 80G Statutory Callout */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-[11px] text-emerald-800">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                <span>
                  Qualifies for 50% IT deduction under Section 80G(5)(vi). Statutory receipt issued instantly upon verification.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isValidAmount}
                className={`px-5 py-2.5 rounded-xl text-xs font-black text-[#011F39] bg-[#FAD465] hover:bg-[#E9B82E] shadow-sm flex items-center gap-1.5 transition ${
                  isSubmitting || !isValidAmount
                    ? 'opacity-60 cursor-not-allowed'
                    : 'cursor-pointer hover:shadow-md'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-[#011F39]" />
                    <span>Initiating Payment...</span>
                  </>
                ) : (
                  <>
                    <span>
                      Donate {isValidAmount ? `₹${parsedAmount.toLocaleString('en-IN')}` : 'Now'}
                    </span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
