import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Lock,
  KeyRound,
  Pencil,
  Building2,
  IdCard,
  Printer,
  Download,
  X,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useCurrentMember } from '../store/memberStore';
import { useAuth } from '@/features/auth/store/authStore';
import { MemberFlipCard } from '../components/MemberFlipCard';
import {
  downloadMemberCardPdf,
  printMemberCardHtml,
} from '../utils/memberDocumentGenerator';

export const MemberIdCardPage: React.FC = () => {
  const { member, updateProfile } = useCurrentMember();
  const { user } = useAuth();

  const [isEditPersonalOpen, setIsEditPersonalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const effectiveName = user?.full_name || member.fullName || 'SAHIL Test Member';
  const effectiveEmail = user?.email || member.email || 'member@hrsjm.org';
  const effectivePhone =
    user?.mobile_number || (user as any)?.phone || member.phone || '9888880002';
  const effectiveDob =
    (user as any)?.date_of_birth || (user as any)?.dob || member.dob || 'Not provided';
  const effectiveId =
    (user as any)?.member_id || member.membershipNumber || 'HRSJM-47611';

  const [formData, setFormData] = useState({
    fullName: effectiveName,
    email: effectiveEmail,
    phone: effectivePhone,
    dob: effectiveDob === 'Not provided' ? '' : effectiveDob,
  });

  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = formData.phone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      showToast('Phone number must be exactly 10 digits.');
      return;
    }
    await updateProfile({
      full_name: formData.fullName,
      email: formData.email,
      phone: cleanPhone,
    });
    setIsEditPersonalOpen(false);
    showToast('Personal information updated successfully.');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.newPass || passwords.newPass !== passwords.confirm) {
      alert('Passwords do not match.');
      return;
    }
    setIsChangePasswordOpen(false);
    setPasswords({ current: '', newPass: '', confirm: '' });
    showToast('Password changed successfully.');
  };

  return (
    <div className="w-full space-y-4 pb-16 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0C2340] text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={16} className="text-[#F6B819]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0C2340]">
          My Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal information and account settings.
        </p>
      </div>

      {/* 2. Top Identity Summary Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex items-center gap-4">
        <div className="relative shrink-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-white shadow-xs bg-slate-100">
            <img
              src={
                member.avatarUrl ||
                user?.avatar ||
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300'
              }
              alt={effectiveName}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsEditPersonalOpen(true)}
            className="w-5 h-5 rounded-full bg-[#0C2340] border-2 border-white text-white flex items-center justify-center absolute -bottom-0.5 -right-0.5 cursor-pointer shadow-xs"
            title="Edit profile photo"
          >
            <Pencil size={10} />
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-[#0C2340] truncate">
            {effectiveName}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Member</p>
          <div className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-[#EDF4FB] text-[#0C2340] font-bold text-xs tracking-wider border border-blue-100/60">
            {effectiveId}
          </div>
        </div>
      </div>

      {/* 3. Personal Information Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-2xs space-y-1">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-[#0C2340] font-bold text-sm sm:text-base">
            <User size={18} className="text-[#0C2340]" />
            <span>Personal Information</span>
          </div>
          <button
            type="button"
            onClick={() => setIsEditPersonalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer transition-colors shadow-2xs"
          >
            <Pencil size={12} />
            <span>Edit</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100 text-xs sm:text-sm">
          <div className="flex items-center justify-between py-3.5">
            <div className="flex items-center gap-2.5 text-slate-500 font-medium">
              <User size={15} className="text-slate-400" />
              <span>Full Name</span>
            </div>
            <div className="font-bold text-[#0C2340]">{effectiveName}</div>
          </div>

          <div className="flex items-center justify-between py-3.5">
            <div className="flex items-center gap-2.5 text-slate-500 font-medium">
              <Mail size={15} className="text-slate-400" />
              <span>Email Address</span>
            </div>
            <div className="font-bold text-[#0C2340]">{effectiveEmail}</div>
          </div>

          <div className="flex items-center justify-between py-3.5">
            <div className="flex items-center gap-2.5 text-slate-500 font-medium">
              <Phone size={15} className="text-slate-400" />
              <span>Phone Number</span>
            </div>
            <div className="font-bold text-[#0C2340]">{effectivePhone}</div>
          </div>

          <div className="flex items-center justify-between py-3.5">
            <div className="flex items-center gap-2.5 text-slate-500 font-medium">
              <Calendar size={15} className="text-slate-400" />
              <span>Date of Birth</span>
            </div>
            <div className="font-bold text-[#0C2340]">{effectiveDob}</div>
          </div>
        </div>
      </div>

      {/* 4. Security & Password Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-2xs space-y-1">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-[#0C2340] font-bold text-sm sm:text-base">
            <Lock size={18} className="text-[#0C2340]" />
            <span>Security & Password</span>
          </div>
          <button
            type="button"
            onClick={() => setIsChangePasswordOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer transition-colors shadow-2xs"
          >
            <KeyRound size={12} />
            <span>Change</span>
          </button>
        </div>

        <div className="flex items-center justify-between py-3.5 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5 text-slate-500 font-medium">
            <KeyRound size={15} className="text-slate-400" />
            <span>Password</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#0C2340] tracking-widest">••••••••••</span>
            <button
              type="button"
              onClick={() => setIsChangePasswordOpen(true)}
              className="px-2.5 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
            >
              Change
            </button>
          </div>
        </div>
      </div>

      {/* 5. Account Details Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-2xs space-y-1">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-[#0C2340] font-bold text-sm sm:text-base">
            <Building2 size={18} className="text-[#0C2340]" />
            <span>Account Details</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100 text-xs sm:text-sm">
          <div className="flex items-center justify-between py-3.5">
            <span className="text-slate-500 font-medium">Role</span>
            <span className="font-bold text-[#0C2340]">Member</span>
          </div>
          <div className="flex items-center justify-between py-3.5">
            <span className="text-slate-500 font-medium">Member ID</span>
            <span className="font-bold text-[#0C2340]">{effectiveId}</span>
          </div>
          <div className="flex items-center justify-between py-3.5">
            <span className="text-slate-500 font-medium">Account Status</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EDF9F0] text-[#16A34A] font-semibold text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
              Active
            </span>
          </div>
        </div>
      </div>

      {/* 6. Member ID Card Section */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-[#0C2340] font-bold text-sm sm:text-base">
            <IdCard size={18} className="text-[#0C2340]" />
            <span>Member ID Card</span>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <a
              href={`/verify/member/${encodeURIComponent(member.membershipNumber || 'HRSJM-47611')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-xs font-bold text-emerald-800 cursor-pointer shadow-2xs transition-colors"
            >
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>Verify Status</span>
            </a>
            <button
              type="button"
              onClick={() => printMemberCardHtml(member)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-[#0C2340] cursor-pointer shadow-2xs transition-colors"
            >
              <Printer size={13} />
              <span>Print Badge</span>
            </button>
            <button
              type="button"
              onClick={() => downloadMemberCardPdf(member)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#F6B819] hover:bg-[#e5aa14] text-[#0C2340] text-xs font-bold cursor-pointer shadow-xs transition-colors"
            >
              <Download size={13} />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        <div className="max-w-lg mx-auto py-2">
          <MemberFlipCard member={member} interactive={true} />
        </div>
      </div>

      {/* 7. Edit Personal Info Modal */}
      {isEditPersonalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setIsEditPersonalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#0C2340]">
                Edit Personal Information
              </h3>
              <button
                type="button"
                onClick={() => setIsEditPersonalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSavePersonal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:border-[#0C2340]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:border-[#0C2340]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:border-[#0C2340]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) =>
                    setFormData({ ...formData, dob: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:border-[#0C2340]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditPersonalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#F6B819] hover:bg-[#e5aa14] text-[#0C2340] cursor-pointer shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Change Password Modal */}
      {isChangePasswordOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setIsChangePasswordOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#0C2340]">Change Password</h3>
              <button
                type="button"
                onClick={() => setIsChangePasswordOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter current password"
                  value={passwords.current}
                  onChange={(e) =>
                    setPasswords({ ...passwords, current: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:border-[#0C2340]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter new password"
                  value={passwords.newPass}
                  onChange={(e) =>
                    setPasswords({ ...passwords, newPass: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:border-[#0C2340]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Confirm new password"
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirm: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:border-[#0C2340]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#F6B819] hover:bg-[#e5aa14] text-[#0C2340] cursor-pointer shadow-xs"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
