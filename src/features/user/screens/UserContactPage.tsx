import React, { useState } from 'react';
import {
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  Building2,
  Shield,
} from 'lucide-react';
import { supportService } from '../../admin/support/services/supportService';
import { useUserAuth } from '../store/userAuthStore';

const REGIONAL_OFFICES = [
  {
    city: 'National Headquarters - New Delhi',
    address: 'HRSJM Bhavan, Constitutional Enclave, Barakhamba Road, New Delhi 110001',
    phone: '+91 (011) 2338-9011 / 2338-9012',
    email: 'hq@hrsjm.org',
  },
  {
    city: 'Western Regional Chapter - Mumbai',
    address: 'Suite 402, High Court Chambers, Fort, Mumbai, Maharashtra 400001',
    phone: '+91 (022) 2267-4400',
    email: 'mumbai@hrsjm.org',
  },
  {
    city: 'Northern Chapter - Lucknow',
    address: 'Civil Lines, Near Vidhan Sabha, Lucknow, Uttar Pradesh 226001',
    phone: '+91 (0522) 2239-110',
    email: 'up@hrsjm.org',
  },
];

export const UserContactPage: React.FC = () => {
  const { user } = useUserAuth();

  const [name, setName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.mobile_number || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (phone.trim() && cleanPhone.length !== 10) {
      setErrorMessage('Mobile phone number must be exactly 10 digits.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);
      await supportService.submitContactInquiry({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        subject: subject.trim() || undefined,
        message: message.trim(),
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error('Failed to submit contact inquiry:', err);
      setErrorMessage(err?.message || 'Unable to submit your inquiry at this moment. Please check your network and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-[#06294D] text-white p-6 sm:p-8 shadow-md">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9B82E]/20 text-[#FAD465] text-xs font-bold uppercase tracking-wider mb-1">
            <PhoneCall size={14} />
            <span>National Citizen Helpline & Helpdesk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-['Playfair_Display',Georgia,serif] text-white">Contact HRSJM</h1>
          <p className="text-xs sm:text-sm text-slate-200">
            Reach out to our constitutional legal cell, central administration, or state field directors. We operate free grievance redressal desks across India.
          </p>
        </div>
      </div>

      {/* Main Grid: Form Left, Office Cards Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Form */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-2xl bg-white border border-[#DCE4EC] shadow-xs">
          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-xl font-bold font-['Playfair_Display',Georgia,serif] text-[#06294D]">Message Received Successfully</h2>
              <p className="text-xs sm:text-sm text-[#718096] max-w-md mx-auto">
                Thank you for reaching out. Your inquiry has been routed to our citizen support cell. An official representative will review and respond within 24 to 48 business hours.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setErrorMessage(null);
                  setMessage('');
                  setSubject('');
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#011F39] bg-[#FAD465] hover:bg-[#E9B82E] cursor-pointer shadow-xs transition"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h2 className="text-lg font-bold font-['Playfair_Display',Georgia,serif] text-[#06294D]">Send an Official Inquiry</h2>
                <p className="text-xs text-[#718096]">Fill in your details below and our team will get in touch with you.</p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[#06294D] mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE4EC] text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#FAD465]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#06294D] mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE4EC] text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#FAD465]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#06294D] mb-1">Mobile Phone Number</label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile"
                    maxLength={10}
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE4EC] text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#FAD465]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#06294D] mb-1">Subject / Nature of Inquiry *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Legal Aid, Educational Support, Workshop Query"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE4EC] text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#FAD465]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#06294D] mb-1">Your Message or Grievance Details *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Please describe your query or incident thoroughly..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE4EC] text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#FAD465]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl bg-[#FAD465] hover:bg-[#E9B82E] text-[#011F39] font-bold text-xs shadow-xs transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <Send size={14} />
                <span>{submitting ? 'Submitting Message...' : 'Submit Inquiry'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Quick Contact & Info Sidebar */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#06294D] text-white space-y-3">
            <h3 className="text-xs font-bold text-[#FAD465] uppercase tracking-wider flex items-center gap-2">
              <Shield size={14} />
              <span>Emergency Grievance Cell</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <PhoneCall size={14} className="text-[#FAD465]" />
                <span className="font-bold">+91 (011) 2338-9011 (Toll-Free Helpline)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-[#FAD465]" />
                <span>helpline@hrsjm.org</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[#FAD465]" />
                <span>Mon - Sat: 9:00 AM - 6:00 PM IST</span>
              </div>
            </div>
          </div>

          {/* Regional Offices */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-[#06294D] uppercase tracking-wider flex items-center gap-1.5">
              <Building2 size={14} />
              <span>State & Regional Chapters</span>
            </h3>

            <div className="space-y-3">
              {REGIONAL_OFFICES.map((office, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <span className="font-bold text-[#06294D] block">{office.city}</span>
                  <div className="flex items-start gap-1.5 text-slate-500">
                    <MapPin size={12} className="shrink-0 mt-0.5" />
                    <span>{office.address}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 pt-1 flex justify-between font-mono">
                    <span>{office.phone}</span>
                    <span className="text-amber-700">{office.email}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
