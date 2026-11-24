import React, { useState } from 'react';
import { X, Heart, AlertCircle, PlusCircle } from 'lucide-react';
import type { CreateDonationInput, DonationCategory, DonationSource } from '../types/donations.types';

interface AddDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateDonationInput) => Promise<void> | void;
  isSubmitting?: boolean;
}

const TYPE_OPTIONS: { key: Exclude<DonationCategory, 'ALL'>; label: string }[] = [
  { key: 'ONE_TIME', label: 'One-time' },
  { key: 'RECURRING', label: 'Recurring' },
  { key: 'OFFLINE', label: 'Offline' },
];

const SOURCE_OPTIONS: { key: DonationSource; label: string }[] = [
  { key: 'Website', label: '🌐 Website' },
  { key: 'Web App', label: '💻 Web App' },
  { key: 'Application UI', label: '📱 App UI' },
];

export const AddDonationModal: React.FC<AddDonationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [donorName, setDonorName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [cause, setCause] = useState('General Donation');
  const [amount, setAmount] = useState('');
  const [donationType, setDonationType] = useState<'ONE_TIME' | 'RECURRING' | 'OFFLINE'>('ONE_TIME');
  const [source, setSource] = useState<DonationSource>('Web App');
  const [paymentMethod, setPaymentMethod] = useState('UPI (Google Pay)');
  const [remark, setRemark] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!donorName.trim()) {
      newErrors.donorName = 'Donor full name is required.';
    }
    const cleanMobile = mobileNumber.replace(/\D/g, '').slice(-10);
    if (!cleanMobile) {
      newErrors.mobileNumber = 'Mobile number is required.';
    } else if (cleanMobile.length !== 10) {
      newErrors.mobileNumber = 'Mobile number must be exactly 10 digits.';
    }
    const numAmount = parseFloat(amount.trim());
    if (!amount.trim() || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Please enter a valid positive donation amount.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = () => {
    setDonorName('');
    setMobileNumber('');
    setEmail('');
    setCause('General Donation');
    setAmount('');
    setDonationType('ONE_TIME');
    setSource('Web App');
    setPaymentMethod('UPI (Google Pay)');
    setRemark('');
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit({
        donor_name: donorName.trim(),
        donor_mobile: mobileNumber.trim(),
        donor_email: email.trim() || undefined,
        cause: cause.trim() || 'General Donation',
        amount: parseFloat(amount.trim()),
        donation_type: donationType,
        source: source,
        payment_method: paymentMethod,
        remark: remark.trim() || undefined,
      });
      handleReset();
      onClose();
    } catch {
      // parent handles error toast
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-[#011F39] px-6 py-4 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <Heart className="h-5 w-5 text-[#FAD465]" />
            <div>
              <h3 className="font-semibold text-base font-serif tracking-wide text-white">
                Record New Donation
              </h3>
              <p className="text-xs text-slate-300">
                Log a verified contribution received for the mission.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {Object.keys(errors).length > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>Please resolve highlighted errors below before saving.</span>
            </div>
          )}

          {/* Donor Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Donor Full Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Aman Shaikh"
              value={donorName}
              onChange={e => {
                setDonorName(e.target.value);
                if (errors.donorName) setErrors(prev => ({ ...prev, donorName: '' }));
              }}
              className={`w-full rounded-lg border px-3.5 py-2 text-xs text-slate-800 focus:outline-none ${
                errors.donorName ? 'border-red-500' : 'border-slate-300 focus:border-[#011F39]'
              }`}
              required
            />
            {errors.donorName && (
              <span className="text-[11px] text-red-600 mt-1 block">{errors.donorName}</span>
            )}
          </div>

          {/* Contact Row (Mobile & Email) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                maxLength={10}
                value={mobileNumber}
                onChange={e => {
                  setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10));
                  if (errors.mobileNumber) setErrors(prev => ({ ...prev, mobileNumber: '' }));
                }}
                className={`w-full rounded-lg border px-3.5 py-2 text-xs text-slate-800 focus:outline-none ${
                  errors.mobileNumber ? 'border-red-500' : 'border-slate-300 focus:border-[#011F39]'
                }`}
                required
              />
              {errors.mobileNumber && (
                <span className="text-[11px] text-red-600 mt-1 block">{errors.mobileNumber}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="e.g. donor@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-xs text-slate-800 focus:border-[#011F39] focus:outline-none"
              />
            </div>
          </div>

          {/* Amount & Cause */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Amount (₹ INR) *
              </label>
              <input
                type="number"
                placeholder="e.g. 5000"
                value={amount}
                min="1"
                step="any"
                onChange={e => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors(prev => ({ ...prev, amount: '' }));
                }}
                className={`w-full rounded-lg border px-3.5 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none ${
                  errors.amount ? 'border-red-500' : 'border-slate-300 focus:border-[#011F39]'
                }`}
                required
              />
              {errors.amount && (
                <span className="text-[11px] text-red-600 mt-1 block">{errors.amount}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Cause / Purpose
              </label>
              <select
                value={cause}
                onChange={e => setCause(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 bg-white focus:border-[#011F39] focus:outline-none font-medium"
              >
                <option value="General Donation">General Donation</option>
                <option value="Education Support">Education Support</option>
                <option value="Medical Support">Medical Support</option>
                <option value="Relief Support">Relief Support</option>
                <option value="Building Fund">Building Fund</option>
                <option value="Women Legal Aid Fund">Women Legal Aid Fund</option>
                <option value="Child Welfare Aid">Child Welfare Aid</option>
              </select>
            </div>
          </div>

          {/* Donation Category Pills */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Donation Category
            </label>
            <div className="flex gap-2">
              {TYPE_OPTIONS.map(opt => {
                const isSelected = donationType === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setDonationType(opt.key)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#011F39] text-[#FAD465] shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Source Platform Pills */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Receiving Channel / Source
            </label>
            <div className="flex gap-2">
              {SOURCE_OPTIONS.map(opt => {
                const isSelected = source === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setSource(opt.key)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#011F39] text-[#FAD465] shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 bg-white focus:border-[#011F39] focus:outline-none font-medium"
            >
              <option value="UPI (Google Pay)">UPI (Google Pay)</option>
              <option value="UPI (PhonePe)">UPI (PhonePe)</option>
              <option value="UPI (Paytm)">UPI (Paytm)</option>
              <option value="Bank Transfer (NEFT)">Bank Transfer (NEFT)</option>
              <option value="Bank Transfer (RTGS)">Bank Transfer (RTGS)</option>
              <option value="Net Banking (HDFC/SBI)">Net Banking</option>
              <option value="Cash / Cheque">Cash / Cheque</option>
            </select>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Remarks / Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Special dedication, campaign tag, or volunteer reference..."
              value={remark}
              onChange={e => setRemark(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-xs text-slate-800 focus:border-[#011F39] focus:outline-none"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#011F39] px-5 py-2 text-xs font-semibold text-white hover:bg-[#022c50] shadow-sm transition-colors disabled:opacity-50"
            >
              <PlusCircle className="h-3.5 w-3.5 text-[#FAD465]" />
              <span>{isSubmitting ? 'Recording...' : 'Record Donation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

