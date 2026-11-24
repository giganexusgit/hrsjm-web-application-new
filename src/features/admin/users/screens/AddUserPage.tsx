import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersStore } from '../store/usersStore';
import type { UserType, UserGender } from '../types/user.types';
import {
  ChevronLeft,
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Calendar,
  MapPin,
  CheckCircle,
} from 'lucide-react';

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  userType?: string;
  password?: string;
  confirmPassword?: string;
}

const USER_TYPE_OPTIONS: { label: string; value: UserType }[] = [
  { label: 'Admin', value: 'admin' },
  { label: 'Member', value: 'member' },
  { label: 'Donor', value: 'donor' },
  { label: 'Donation Seeker', value: 'seeker' },
  { label: 'General User', value: 'general' },
];

const GENDER_OPTIONS: UserGender[] = ['Male', 'Female', 'Other'];

export const AddUserPage: React.FC = () => {
  const navigate = useNavigate();

  // Form Field States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState<UserType>('general');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<UserGender | ''>('');
  const [address, setAddress] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // States
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validate = (): boolean => {
    const err: FormErrors = {};

    if (!name.trim()) {
      err.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      err.name = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      err.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      err.email = 'Please enter a valid email address';
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) {
      err.phone = 'Phone number is required';
    } else if (cleanPhone.length !== 10) {
      err.phone = 'Phone number must be exactly 10 digits';
    }

    if (!password) {
      err.password = 'Password is required';
    } else if (password.length < 6) {
      err.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      err.confirmPassword = 'Passwords do not match';
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSuccessMessage(null);

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const formattedPhone = `+91 ${cleanPhone}`;

    try {
      const res = await usersStore.addUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: formattedPhone,
        userType,
        password,
        dob: dob || undefined,
        gender: gender || undefined,
        address: address.trim() || undefined,
      });

      if (res.success && res.user) {
        setSuccessMessage(`User "${res.user.name}" created successfully!`);
        setTimeout(() => {
          navigate(`/admin/users/${res.user?.id}`);
        }, 1200);
      } else {
        setErrors({ name: res.message || 'Failed to create user' });
      }
    } catch (err: any) {
      setErrors({ name: err?.message || 'Unexpected error creating user' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Back button */}
      <div style={{ marginBottom: '16px' }}>
        <button
          type="button"
          onClick={() => navigate('/admin/users')}
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
          <span>Back to Users</span>
        </button>
      </div>

      {/* Main Form Card */}
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
            Create New User Account
          </h1>
          <p style={{ fontSize: '14px', color: '#718096', margin: 0 }}>
            Register a member, seeker, donor, or admin user directly to the platform.
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
            {/* Full Name */}
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
                  placeholder="e.g. Rahul Sharma"
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

            {/* Email Address */}
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
                Email Address <span style={{ color: '#DC2626' }}>*</span>
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
                  placeholder="e.g. rahul.sharma@example.com"
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
            {/* Phone */}
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
                Phone Number <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div
                  style={{
                    padding: '10px 12px',
                    backgroundColor: '#FAF7F0',
                    border: '1px solid #DBE5EE',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#011F39',
                  }}
                >
                  +91
                </div>
                <div style={{ position: 'relative', flex: 1 }}>
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
                    placeholder="9876543210"
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
              </div>
              {errors.phone && (
                <div style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px' }}>
                  {errors.phone}
                </div>
              )}
            </div>

            {/* User Role */}
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
                Account Role <span style={{ color: '#DC2626' }}>*</span>
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

          {/* Row 3: Password & Confirm Password */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              marginBottom: '20px',
            }}
          >
            {/* Password */}
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
                Temporary Password <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  color="#718096"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 40px 10px 38px',
                    fontSize: '14px',
                    borderRadius: '8px',
                    border: errors.password ? '1px solid #DC2626' : '1px solid #DBE5EE',
                    backgroundColor: '#FFFFFF',
                    color: '#011F39',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#718096',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <div style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px' }}>
                  {errors.password}
                </div>
              )}
            </div>

            {/* Confirm Password */}
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
                Confirm Password <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  color="#718096"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 40px 10px 38px',
                    fontSize: '14px',
                    borderRadius: '8px',
                    border: errors.confirmPassword ? '1px solid #DC2626' : '1px solid #DBE5EE',
                    backgroundColor: '#FFFFFF',
                    color: '#011F39',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#718096',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <div style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px' }}>
                  {errors.confirmPassword}
                </div>
              )}
            </div>
          </div>

          {/* Row 4: DOB & Gender */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              marginBottom: '20px',
            }}
          >
            {/* DOB */}
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
                Date of Birth (Optional)
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

            {/* Gender */}
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
                Gender (Optional)
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

          {/* Row 5: Address */}
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
              Address (Optional)
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin
                size={16}
                color="#718096"
                style={{ position: 'absolute', left: '12px', top: '14px' }}
              />
              <textarea
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Street address, City, State, PIN"
                rows={3}
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
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
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
              {isSubmitting ? 'Creating User...' : 'Create User Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

