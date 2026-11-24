import React, { useState, useSyncExternalStore } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersStore } from '../store/usersStore';
import type { UserType, UserStatus, UserGender } from '../types/user.types';
import {
  ChevronLeft,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
}

const USER_TYPE_OPTIONS: { label: string; value: UserType }[] = [
  { label: 'Admin', value: 'admin' },
  { label: 'Member', value: 'member' },
  { label: 'Donor', value: 'donor' },
  { label: 'Donation Seeker', value: 'seeker' },
  { label: 'General User', value: 'general' },
];

const STATUS_OPTIONS: { label: string; value: UserStatus; color: string }[] = [
  { label: 'Approved / Active', value: 'active', color: '#059669' },
  { label: 'Pending Review', value: 'pending', color: '#D97706' },
  { label: 'Blocked / Suspended', value: 'blocked', color: '#DC2626' },
];

const GENDER_OPTIONS: UserGender[] = ['Male', 'Female', 'Other'];

export const EditUserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useSyncExternalStore(usersStore.subscribe, usersStore.getSnapshot);

  const user = id ? usersStore.getUserById(id) : undefined;

  // Form Field States
  const [name, setName] = useState(() => user?.name || '');
  const [email, setEmail] = useState(() => user?.email || '');
  const [phone, setPhone] = useState(() => user?.phone || '');
  const [userType, setUserType] = useState<UserType>(() => user?.userType || 'general');
  const [status, setStatus] = useState<UserStatus>(() => user?.status || 'active');
  const [dob, setDob] = useState(() => user?.dob || '');
  const [gender, setGender] = useState<UserGender | ''>(() => user?.gender || '');
  const [address, setAddress] = useState(() => user?.address || '');
  const [remarks, setRemarks] = useState(() => user?.remarks || user?.notes || '');

  // States
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!user) {
    return (
      <div
        style={{
          maxWidth: '600px',
          margin: '60px auto',
          textAlign: 'center',
          backgroundColor: '#FFFFFF',
          padding: '40px 30px',
          borderRadius: '16px',
          border: '1px solid #EDF2F7',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}
      >
        <AlertCircle size={48} color="#DC2626" style={{ margin: '0 auto 16px' }} />
        <h2
          style={{
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: '22px',
            color: '#011F39',
            margin: '0 0 8px',
          }}
        >
          User Not Found
        </h2>
        <p style={{ fontSize: '14px', color: '#718096', margin: '0 0 24px' }}>
          Cannot edit because the specified user does not exist.
        </p>
        <button
          type="button"
          onClick={() => navigate('/admin/users')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#011F39',
            color: '#FFFFFF',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Return to Users List
        </button>
      </div>
    );
  }

  const validate = (): boolean => {
    const err: FormErrors = {};

    if (!name.trim()) {
      err.name = 'Full name is required';
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      err.email = 'Please enter a valid email address';
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (phone.trim() && cleanPhone.length !== 10) {
      err.phone = 'Phone number must be exactly 10 digits';
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      const res = await usersStore.updateUser(user.id, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        userType,
        status,
        dob: dob || undefined,
        gender: gender || undefined,
        address: address.trim() || undefined,
        remarks: remarks.trim() || undefined,
      });

      if (res.success) {
        setSuccessMessage('User profile updated successfully!');
        setTimeout(() => {
          navigate(`/admin/users/${user.id}`);
        }, 1000);
      } else {
        setErrors({ name: res.message || 'Failed to update user' });
      }
    } catch (err: any) {
      setErrors({ name: err?.message || 'Unexpected error updating user' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Top back navigation */}
      <div style={{ marginBottom: '16px' }}>
        <button
          type="button"
          onClick={() => navigate(`/admin/users/${user.id}`)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#011F39',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <ChevronLeft size={18} />
          <span>Back to Profile</span>
        </button>
      </div>

      {/* Main Edit Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #DCE4EC',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(1, 31, 57, 0.04)',
        }}
      >
        <div style={{ marginBottom: '24px', borderBottom: '1px solid #EDF2F7', paddingBottom: '16px' }}>
          <h1
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: '24px',
              fontWeight: 700,
              color: '#011F39',
              margin: '0 0 6px',
            }}
          >
            Edit User Profile
          </h1>
          <p style={{ fontSize: '14px', color: '#718096', margin: 0 }}>
            Modify account details, assign permissions, or adjust membership status for {user.name}.
          </p>
        </div>

        {successMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#059669',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '20px',
            }}
          >
            <CheckCircle size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Row 1: Full Name & Email */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              marginBottom: '20px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#011F39',
                  marginBottom: '6px',
                }}
              >
                Full Name <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <UserIcon
                  size={16}
                  color="#718096"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 14px 10px 38px',
                    fontSize: '14px',
                    borderRadius: '8px',
                    border: errors.name ? '1px solid #DC2626' : '1px solid #DBE5EE',
                    backgroundColor: '#FFFFFF',
                    color: '#011F39',
                    outline: 'none',
                  }}
                />
              </div>
              {errors.name && (
                <div style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px' }}>
                  {errors.name}
                </div>
              )}
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#011F39',
                  marginBottom: '6px',
                }}
              >
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  color="#718096"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 14px 10px 38px',
                    fontSize: '14px',
                    borderRadius: '8px',
                    border: errors.email ? '1px solid #DC2626' : '1px solid #DBE5EE',
                    backgroundColor: '#FFFFFF',
                    color: '#011F39',
                    outline: 'none',
                  }}
                />
              </div>
              {errors.email && (
                <div style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px' }}>
                  {errors.email}
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Phone & Role */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              marginBottom: '20px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#011F39',
                  marginBottom: '6px',
                }}
              >
                Phone Number
              </label>
              <div style={{ position: 'relative' }}>
                <Phone
                  size={16}
                  color="#718096"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 14px 10px 38px',
                    fontSize: '14px',
                    borderRadius: '8px',
                    border: errors.phone ? '1px solid #DC2626' : '1px solid #DBE5EE',
                    backgroundColor: '#FFFFFF',
                    color: '#011F39',
                    outline: 'none',
                  }}
                />
              </div>
              {errors.phone && (
                <div style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px' }}>
                  {errors.phone}
                </div>
              )}
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#011F39',
                  marginBottom: '6px',
                }}
              >
                User Role
              </label>
              <select
                value={userType}
                onChange={e => setUserType(e.target.value as UserType)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 14px',
                  fontSize: '14px',
                  borderRadius: '8px',
                  border: '1px solid #DBE5EE',
                  backgroundColor: '#FFFFFF',
                  color: '#011F39',
                  outline: 'none',
                }}
              >
                {USER_TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Status & Gender */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              marginBottom: '20px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#011F39',
                  marginBottom: '6px',
                }}
              >
                Account Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as UserStatus)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 14px',
                  fontSize: '14px',
                  borderRadius: '8px',
                  border: '1px solid #DBE5EE',
                  backgroundColor: '#FFFFFF',
                  color: '#011F39',
                  outline: 'none',
                }}
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#011F39',
                  marginBottom: '6px',
                }}
              >
                Gender
              </label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as UserGender | '')}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 14px',
                  fontSize: '14px',
                  borderRadius: '8px',
                  border: '1px solid #DBE5EE',
                  backgroundColor: '#FFFFFF',
                  color: '#011F39',
                  outline: 'none',
                }}
              >
                <option value="">Select Gender</option>
                {GENDER_OPTIONS.map(g => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: DOB & Address */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              marginBottom: '20px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#011F39',
                  marginBottom: '6px',
                }}
              >
                Date of Birth
              </label>
              <div style={{ position: 'relative' }}>
                <Calendar
                  size={16}
                  color="#718096"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 14px 10px 38px',
                    fontSize: '14px',
                    borderRadius: '8px',
                    border: '1px solid #DBE5EE',
                    backgroundColor: '#FFFFFF',
                    color: '#011F39',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#011F39',
                  marginBottom: '6px',
                }}
              >
                Address
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin
                  size={16}
                  color="#718096"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 14px 10px 38px',
                    fontSize: '14px',
                    borderRadius: '8px',
                    border: '1px solid #DBE5EE',
                    backgroundColor: '#FFFFFF',
                    color: '#011F39',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Row 5: Admin Remarks */}
          <div style={{ marginBottom: '28px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: '#011F39',
                marginBottom: '6px',
              }}
            >
              Admin Remarks / Internal Notes
            </label>
            <textarea
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="Add internal notes about this account or verification history"
              rows={3}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 14px',
                fontSize: '14px',
                borderRadius: '8px',
                border: '1px solid #DBE5EE',
                backgroundColor: '#FFFFFF',
                color: '#011F39',
                outline: 'none',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => navigate(`/admin/users/${user.id}`)}
              style={{
                padding: '10px 20px',
                fontSize: '13.5px',
                fontWeight: 600,
                color: '#06294D',
                backgroundColor: '#EDF2F7',
                border: '1px solid #DCE4EC',
                borderRadius: '12px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '10px 28px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#011F39',
                backgroundColor: '#FAD465',
                border: 'none',
                borderRadius: '12px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                boxShadow: '0 2px 4px rgba(1, 31, 57, 0.08)',
              }}
            >
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
