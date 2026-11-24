import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth, executeSignOut } from '@/features/auth/store/authStore';
import { useCurrentMember } from '../store/memberStore';
import { authService } from '@/features/auth/services/authService';

export const MemberSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { member, updateProfile } = useCurrentMember();

  const effectiveName = user?.full_name || member.fullName || 'SAHIL Test Member';
  const effectiveEmail = user?.email || member.email || 'member@hrsjm.org';
  const effectivePhone =
    user?.mobile_number || (user as any)?.phone || member.phone || '9888880002';

  // Initials for avatar
  const initials =
    effectiveName
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'SM';

  // Personal Info Form State
  const [fullName, setFullName] = useState(effectiveName);
  const [email, setEmail] = useState(effectiveEmail);
  const [phone, setPhone] = useState(effectivePhone);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Security Toggles
  const [biometricLock, setBiometricLock] = useState(false);

  // Logout Modal
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    if (!fullName.trim()) {
      setProfileError('Please enter your name.');
      return;
    }
    if (!email.trim()) {
      setProfileError('Please enter your email address.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      setProfileError('Phone number must be exactly 10 digits.');
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });
      setProfileSuccess('Personal information updated successfully.');
      setTimeout(() => setProfileSuccess(null), 4000);
    } catch (err: any) {
      setProfileError(
        err?.message || 'Failed to update personal information. Please try again.'
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (!newPassword) {
      setPasswordError('Please enter your new password.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (!confirmPassword) {
      setPasswordError('Please confirm your new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setIsSavingPassword(true);

    try {
      await authService.changePassword({
        old_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setPasswordSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err: any) {
      setPasswordError(
        err?.message || 'Failed to update password. Please check your current password.'
      );
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleConfirmLogout = async () => {
    setIsLogoutModalOpen(false);
    await executeSignOut(navigate);
  };

  return (
    <div className="w-full space-y-4 pb-16 font-sans">
      {/* 1. Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0C2340]">
          Profile & Settings
        </h1>
      </div>

      {/* 2. Top Identity Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex items-center gap-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#EDF4FB] text-[#0C2340] font-bold text-lg sm:text-xl flex items-center justify-center shrink-0 border border-blue-100">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-[#0C2340] truncate">
            {effectiveName}
          </h2>
          <p className="text-xs text-slate-500 font-medium">{effectiveEmail}</p>
          <span className="inline-block mt-1 text-[11px] font-bold tracking-wider text-[#0C2340] uppercase">
            MEMBER
          </span>
        </div>
      </div>

      {/* 3. Personal Information Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-2xs space-y-3.5">
        <h3 className="text-base font-bold text-[#0C2340]">Personal Information</h3>

        <form onSubmit={handleSaveProfile} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setProfileError(null);
                setProfileSuccess(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 bg-white focus:outline-hidden focus:border-[#0C2340]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setProfileError(null);
                setProfileSuccess(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 bg-white focus:outline-hidden focus:border-[#0C2340]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
            <input
              type="tel"
              maxLength={10}
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                setProfileError(null);
                setProfileSuccess(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 bg-white focus:outline-hidden focus:border-[#0C2340]"
            />
          </div>

          <p className="text-xs text-slate-500 font-medium">
            Pending backend support — the API does not expose this capability yet.
          </p>

          {profileError && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
              {profileError}
            </div>
          )}

          {profileSuccess && (
            <div className="p-2.5 rounded-xl bg-green-50 border border-green-200 text-xs text-green-700 font-medium flex items-center gap-1.5">
              <CheckCircle2 size={14} />
              <span>{profileSuccess}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSavingProfile}
            className="w-full py-2.5 sm:py-3 rounded-xl bg-[#07294E] hover:bg-[#051f3b] active:scale-[0.99] text-white font-bold text-xs sm:text-sm cursor-pointer shadow-xs transition-all disabled:opacity-50"
          >
            {isSavingProfile ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* 4. Change Password Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-2xs space-y-3.5">
        <h3 className="text-base font-bold text-[#0C2340]">Change Password</h3>

        <form onSubmit={handlePasswordChange} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setPasswordError(null);
                setPasswordSuccess(null);
              }}
              placeholder="Enter current password"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#0C2340]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordError(null);
                setPasswordSuccess(null);
              }}
              placeholder="Enter new password"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#0C2340]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordError(null);
                setPasswordSuccess(null);
              }}
              placeholder="Confirm new password"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#0C2340]"
            />
          </div>

          {passwordError && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="p-2.5 rounded-xl bg-green-50 border border-green-200 text-xs text-green-700 font-medium flex items-center gap-1.5">
              <CheckCircle2 size={14} />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSavingPassword}
            className="w-full py-2.5 sm:py-3 rounded-xl bg-[#07294E] hover:bg-[#051f3b] active:scale-[0.99] text-white font-bold text-xs sm:text-sm cursor-pointer shadow-xs transition-all disabled:opacity-50"
          >
            {isSavingPassword ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* 5. Security Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-2xs space-y-3">
        <h3 className="text-base font-bold text-[#0C2340]">Security</h3>

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#0C2340]">Biometric Lock</h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
              Locks local app access only - it does not replace sign-in. Enforcement
              pending the shared biometric integration.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={biometricLock}
            onClick={() => setBiometricLock(!biometricLock)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              biometricLock ? 'bg-[#0C2340]' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                biometricLock ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 6. Legal Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-2xs space-y-2">
        <h3 className="text-base font-bold text-[#0C2340] mb-2">Legal</h3>

        <div className="divide-y divide-slate-100">
          <button
            type="button"
            onClick={() => window.open('https://hrsjm.org/privacy-policy', '_blank')}
            className="w-full flex items-center justify-between py-3 text-xs sm:text-sm font-bold text-[#0C2340] hover:text-amber-600 transition-colors cursor-pointer text-left"
          >
            <span>Privacy Policy</span>
            <span className="text-slate-400 text-base font-bold">›</span>
          </button>

          <button
            type="button"
            onClick={() => window.open('https://hrsjm.org/terms-conditions', '_blank')}
            className="w-full flex items-center justify-between py-3 text-xs sm:text-sm font-bold text-[#0C2340] hover:text-amber-600 transition-colors cursor-pointer text-left"
          >
            <span>Terms & Conditions</span>
            <span className="text-slate-400 text-base font-bold">›</span>
          </button>
        </div>
      </div>

      {/* 7. App Info Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-2xs space-y-2">
        <h3 className="text-base font-bold text-[#0C2340] mb-2">App</h3>

        <div className="flex items-center justify-between py-2 text-xs sm:text-sm">
          <span className="font-medium text-slate-700">App Version</span>
          <span className="font-bold text-[#0C2340]">1.0.0</span>
        </div>
      </div>

      {/* 8. Log Out Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setIsLogoutModalOpen(true)}
          className="w-full py-3.5 rounded-2xl bg-[#DC2626] hover:bg-[#b91c1c] text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer text-center"
        >
          Log Out
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setIsLogoutModalOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#0C2340]">Confirm Log Out</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to sign out of your HRSJM Member account?
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#b91c1c] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
