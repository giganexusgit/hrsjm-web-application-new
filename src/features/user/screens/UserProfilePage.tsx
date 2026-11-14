import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Lock,
  KeyRound,
  Building,
  CheckCircle2,
  BadgeCheck,
  CreditCard,
  Pencil,
  ChevronRight,
  Eye,
  X,
  Save,
  AlertCircle,
  Key,
} from 'lucide-react';
import { useUserAuth } from '../store/userAuthStore';
import { authService } from '@/features/auth/services/authService';
import { CalendarDatePicker } from '../../../components/common/CalendarDatePicker';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80';

export const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUserAuth();

  // State
  const [fullName, setFullName] = useState(user?.full_name || 'Mubasshir Farooqui');
  const [email, setEmail] = useState(user?.email || 'user@hrsjm.org');
  const [phone, setPhone] = useState(user?.mobile_number || '8850248292');
  const [dob, setDob] = useState((user as any)?.dob || (user as any)?.date_of_birth || '2002-08-31');
  const [bloodGroup, setBloodGroup] = useState(user?.blood_group || 'O+');
  const [stateName, setStateName] = useState(user?.state || '');
  const [city, setCity] = useState(user?.city || '');
  const [address, setAddress] = useState(user?.address || '');

  // Modals state
  const [isEditPersonalOpen, setIsEditPersonalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Edit form state
  const [editFullName, setEditFullName] = useState(fullName);
  const [editEmail, setEditEmail] = useState(email);
  const [editPhone, setEditPhone] = useState(phone);
  const [editDob, setEditDob] = useState(dob);
  const [editBloodGroup, setEditBloodGroup] = useState(bloodGroup);
  const [editState, setEditState] = useState(stateName);
  const [editCity, setEditCity] = useState(city);
  const [editAddress, setEditAddress] = useState(address);
  const [savingPersonal, setSavingPersonal] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Notification state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch live user on mount
  useEffect(() => {
    let mounted = true;
    authService.fetchMe().then((fresh) => {
      if (mounted && fresh) {
        setUser(fresh as any);
        if (fresh.full_name) {
          setFullName(fresh.full_name);
          setEditFullName(fresh.full_name);
        }
        if (fresh.email) {
          setEmail(fresh.email);
          setEditEmail(fresh.email);
        }
        if (fresh.mobile_number) {
          setPhone(fresh.mobile_number);
          setEditPhone(fresh.mobile_number);
        }
        if ((fresh as any).dob || (fresh as any).date_of_birth) {
          const freshDob = (fresh as any).dob || (fresh as any).date_of_birth;
          setDob(freshDob);
          setEditDob(freshDob);
        }
        if (fresh.blood_group) {
          setBloodGroup(fresh.blood_group);
          setEditBloodGroup(fresh.blood_group);
        }
        if (fresh.state) {
          setStateName(fresh.state);
          setEditState(fresh.state);
        }
        if (fresh.city) {
          setCity(fresh.city);
          setEditCity(fresh.city);
        }
        if (fresh.address) {
          setAddress(fresh.address);
          setEditAddress(fresh.address);
        }
      }
    });
    return () => {
      mounted = false;
    };
  }, [setUser]);

  const handleOpenEditPersonal = () => {
    setEditFullName(fullName);
    setEditEmail(email);
    setEditPhone(phone);
    setEditDob(dob);
    setEditBloodGroup(bloodGroup);
    setEditState(stateName);
    setEditCity(city);
    setEditAddress(address);
    setIsEditPersonalOpen(true);
  };

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPersonal(true);
    try {
      const updated = await authService.updateMe({
        full_name: editFullName.trim(),
        email: editEmail.trim(),
        mobile_number: editPhone.trim(),
        blood_group: editBloodGroup,
        state: editState.trim(),
        city: editCity.trim(),
        address: editAddress.trim(),
      });

      setFullName(editFullName.trim());
      setEmail(editEmail.trim());
      setPhone(editPhone.trim());
      setDob(editDob);
      setBloodGroup(editBloodGroup);
      setStateName(editState.trim());
      setCity(editCity.trim());
      setAddress(editAddress.trim());

      if (updated) {
        setUser({ ...(user as any), ...updated, dob: editDob });
      } else if (user) {
        setUser({
          ...user,
          full_name: editFullName.trim(),
          email: editEmail.trim(),
          mobile_number: editPhone.trim(),
          blood_group: editBloodGroup,
          state: editState.trim(),
          city: editCity.trim(),
          address: editAddress.trim(),
          dob: editDob,
        });
      }

      setIsEditPersonalOpen(false);
      showToast('Personal information updated successfully.');
    } catch (err: any) {
      showToast(err?.message || 'Failed to update personal information.', 'error');
    } finally {
      setSavingPersonal(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Please enter your current password.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await authService.changePassword({
        current_password: currentPassword,
        old_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      if (res?.success) {
        setIsChangePasswordOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showToast('Password updated successfully.');
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to change password.', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const effectiveAvatar = user?.avatar || DEFAULT_AVATAR;
  const roleName = user?.roles?.[0]?.name || user?.account_type || 'User';
  const displayRole = roleName.charAt(0).toUpperCase() + roleName.slice(1).toLowerCase();

  const appId =
    user?.membership_number ||
    (user as any)?.application_number ||
    (user?.id ? `HRSJM-${String(user.id).replace(/\D/g, '').slice(-5).padStart(5, '0')}` : 'HRSJM-00029');

  const appStatus = user?.membership_status || 'Applied';
  const appType = (user as any)?.membership_type || 'Individual Membership';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-xl shadow-lg border text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all animate-in fade-in slide-in-from-top-2 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Page Title & Subtitle */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#06294D] leading-tight">
          My Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal information and account settings.
        </p>
      </div>

      {/* Profile Summary Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative shrink-0">
            <img
              src={effectiveAvatar}
              alt={fullName}
              className="w-14 h-14 rounded-full object-cover border border-slate-200 shadow-xs"
            />
            <button
              type="button"
              onClick={handleOpenEditPersonal}
              className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#06294D] text-white flex items-center justify-center border-2 border-white shadow-xs hover:bg-[#0C2340] cursor-pointer transition-colors"
              title="Change profile photo"
            >
              <Pencil size={10} />
            </button>
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-[#06294D] truncate">
              {fullName}
            </h2>
            <p className="text-xs text-slate-500 font-medium">{displayRole}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsStatusModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF9E6] border border-[#FDE68A] hover:bg-[#FEF3C7] text-[#06294D] font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-xs shrink-0"
        >
          <User size={14} className="text-[#06294D]" />
          <span>My Status</span>
          <ChevronRight size={14} className="text-[#06294D]" />
        </button>
      </div>

      {/* Personal Information Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-[#06294D] text-sm sm:text-base">
            <User size={16} className="text-[#06294D]" />
            <span>Personal Information</span>
          </div>
          <button
            type="button"
            onClick={handleOpenEditPersonal}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
          >
            <Pencil size={11} className="text-slate-500" />
            <span>Edit</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100 text-xs sm:text-sm">
          <div className="px-5 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-slate-500">
              <User size={16} className="text-slate-400 shrink-0" />
              <span>Full Name</span>
            </div>
            <span className="font-bold text-[#06294D] text-right truncate">
              {fullName}
            </span>
          </div>

          <div className="px-5 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-slate-500">
              <Mail size={16} className="text-slate-400 shrink-0" />
              <span>Email Address</span>
            </div>
            <span className="font-bold text-[#06294D] text-right truncate">
              {email}
            </span>
          </div>

          <div className="px-5 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-slate-500">
              <Phone size={16} className="text-slate-400 shrink-0" />
              <span>Phone Number</span>
            </div>
            <span className="font-bold text-[#06294D] text-right">
              {phone}
            </span>
          </div>

          <div className="px-5 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-slate-500">
              <Calendar size={16} className="text-slate-400 shrink-0" />
              <span>Date of Birth</span>
            </div>
            <span className="font-bold text-[#06294D] text-right">
              {dob}
            </span>
          </div>
        </div>
      </div>

      {/* Security & Password Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-[#06294D] text-sm sm:text-base">
            <Lock size={16} className="text-[#06294D]" />
            <span>Security & Password</span>
          </div>
          <button
            type="button"
            onClick={() => setIsChangePasswordOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
          >
            <Key size={11} className="text-slate-500" />
            <span>Change</span>
          </button>
        </div>

        <div className="px-5 py-3.5 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2.5 text-slate-500">
            <KeyRound size={16} className="text-slate-400 shrink-0" />
            <span>Password</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-slate-700 tracking-widest text-sm font-black">
              ••••••••••••
            </span>
            <button
              type="button"
              onClick={() => setIsChangePasswordOpen(true)}
              className="px-3 py-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#06294D] font-bold text-xs cursor-pointer transition-colors"
            >
              Change
            </button>
          </div>
        </div>
      </div>

      {/* Account Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-[#06294D] text-sm sm:text-base">
            <Building size={16} className="text-[#06294D]" />
            <span>Account Details</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100 text-xs sm:text-sm">
          <div className="px-5 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-slate-500">
              <CreditCard size={16} className="text-slate-400 shrink-0" />
              <span>Role</span>
            </div>
            <span className="font-bold text-[#06294D] text-right">
              {displayRole}
            </span>
          </div>

          <div className="px-5 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-slate-500">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <span>Account Status</span>
            </div>
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Application Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-[#06294D] text-sm sm:text-base">
            <BadgeCheck size={16} className="text-[#06294D]" />
            <span>Application Status</span>
          </div>
          <button
            type="button"
            onClick={() => setIsStatusModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
          >
            <Eye size={11} className="text-slate-500" />
            <span>View Details</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100 text-xs sm:text-sm">
          <div className="px-5 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-slate-500">
              <Building size={16} className="text-slate-400 shrink-0" />
              <span>Application Type</span>
            </div>
            <span className="font-bold text-[#06294D] text-right">
              {appType}
            </span>
          </div>

          <div className="px-5 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-slate-500">
              <CreditCard size={16} className="text-slate-400 shrink-0" />
              <span>Application ID</span>
            </div>
            <span className="font-mono font-bold text-[#06294D] text-right">
              {appId}
            </span>
          </div>

          <div className="px-5 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-slate-500">
              <Calendar size={16} className="text-slate-400 shrink-0" />
              <span>Status</span>
            </div>
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              {appStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Modal: Edit Personal Information */}
      {isEditPersonalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 font-bold text-[#06294D]">
                <User size={18} />
                <span>Edit Personal Information</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditPersonalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePersonal} className="p-5 overflow-y-auto space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#06294D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#06294D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#06294D]"
                  />
                </div>
                <div>
                  <CalendarDatePicker
                    label="Date of Birth"
                    minAge={18}
                    value={editDob}
                    onChange={(selectedVal) => setEditDob(selectedVal)}
                    placeholder="dd-mm-yyyy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={editBloodGroup}
                    onChange={(e) => setEditBloodGroup(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#06294D] bg-white"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State / Chapter
                  </label>
                  <input
                    type="text"
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                    placeholder="e.g. Maharashtra"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#06294D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City / District
                </label>
                <input
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#06294D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Permanent Address
                </label>
                <textarea
                  rows={2}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Enter full street address"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#06294D]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditPersonalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPersonal}
                  className="px-5 py-2 rounded-xl bg-[#07294E] hover:bg-[#0C2340] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save size={13} />
                  <span>{savingPersonal ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Change Password */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 font-bold text-[#06294D]">
                <Lock size={18} />
                <span>Change Password</span>
              </div>
              <button
                type="button"
                onClick={() => setIsChangePasswordOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-5 space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current account password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#06294D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#06294D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#06294D]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-5 py-2 rounded-xl bg-[#07294E] hover:bg-[#0C2340] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Key size={13} />
                  <span>{savingPassword ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: My Status / Application Status */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 font-bold text-[#06294D]">
                <BadgeCheck size={18} className="text-[#06294D]" />
                <span>Application Progress</span>
              </div>
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                    Application ID
                  </p>
                  <p className="font-mono font-black text-sm text-[#06294D] mt-0.5">{appId}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  {appStatus}
                </span>
              </div>

              {/* Progress Steps */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">Application Submitted</h4>
                    <p className="text-[11px] text-slate-500">Your profile and application form were received.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">Document Verification</h4>
                    <p className="text-[11px] text-slate-500">Identity and contact details verified.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    ●
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">Under Review</h4>
                    <p className="text-[11px] text-slate-500">Secretariat review is in progress.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 opacity-50">
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">Approved & Active</h4>
                    <p className="text-[11px] text-slate-500">Official membership badge & digital ID card issuance.</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsStatusModalOpen(false);
                    navigate('/membership');
                  }}
                  className="text-xs font-bold text-[#06294D] hover:underline cursor-pointer"
                >
                  View Membership Programs →
                </button>
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#07294E] text-white font-bold text-xs cursor-pointer hover:bg-[#0C2340]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
