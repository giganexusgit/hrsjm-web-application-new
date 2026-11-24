import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, Mail, Lock, MapPin, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../store/authStore';
import { HrsjmLogo } from '../../../components/common/HrsjmLogo';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    agreeTerms: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let finalValue = value;
    if (name === 'mobile') {
      finalValue = value.replace(/\D/g, '').slice(0, 10);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : finalValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || formData.fullName.length < 2) {
      setError('Please enter your full name (minimum 2 characters).');
      return;
    }

    const cleanMobile = formData.mobile.replace(/\D/g, '').slice(-10);
    if (!cleanMobile || cleanMobile.length !== 10) {
      setError('Mobile number must be exactly 10 digits.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!formData.agreeTerms) {
      setError('You must accept the terms of service.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register({
        full_name: formData.fullName.trim(),
        mobile_number: cleanMobile,
        email: formData.email.trim() || undefined,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        role_name: 'DONATION_SEEKER',
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/seeker/home', { replace: true });
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Failed to create account. Mobile number or email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col justify-center items-center p-4 py-8">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-[#DCE4EC] overflow-hidden">
        {/* Navy Brand Banner */}
        <div className="bg-gradient-to-r from-[#011F39] via-[#06294D] to-[#123F68] p-6 text-white text-center">
          <div className="flex justify-center mb-2">
            <HrsjmLogo size="md" variant="light" />
          </div>
          <h1 className="text-xl font-bold font-['Playfair_Display',Georgia,serif] text-white">
            Register as a <span className="text-[#FAD465]">Donation Seeker</span>
          </h1>
          <p className="text-xs text-blue-200 mt-1 max-w-md mx-auto">
            Create your account to submit humanitarian assistance requests, verify supporting documents, and track relief disbursements.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {success ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-xl font-bold text-[#0B2F52]">Registration Successful!</h2>
              <p className="text-sm text-[#34516D] max-w-sm mx-auto">
                Your Donation Seeker account has been created. Redirecting to your personal portal...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0B2F52] uppercase tracking-wider mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Mohd. Ayaan Shaikh"
                      className="w-full px-3.5 py-2 pl-9 text-sm bg-[#EDF2F7] border border-[#DBE5EE] rounded-xl text-[#0B2F52] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FAD465]"
                      required
                    />
                    <User size={15} className="absolute left-3 top-2.5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0B2F52] uppercase tracking-wider mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="10-digit mobile"
                      maxLength={10}
                      className="w-full px-3.5 py-2 pl-9 text-sm bg-[#EDF2F7] border border-[#DBE5EE] rounded-xl text-[#0B2F52] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FAD465]"
                      required
                    />
                    <Phone size={15} className="absolute left-3 top-2.5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B2F52] uppercase tracking-wider mb-1">
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. name@example.com"
                    className="w-full px-3.5 py-2 pl-9 text-sm bg-[#EDF2F7] border border-[#DBE5EE] rounded-xl text-[#0B2F52] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FAD465]"
                  />
                  <Mail size={15} className="absolute left-3 top-2.5 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0B2F52] uppercase tracking-wider mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min 6 characters"
                      className="w-full px-3.5 py-2 pl-9 text-sm bg-[#EDF2F7] border border-[#DBE5EE] rounded-xl text-[#0B2F52] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FAD465]"
                      required
                    />
                    <Lock size={15} className="absolute left-3 top-2.5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0B2F52] uppercase tracking-wider mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat password"
                      className="w-full px-3.5 py-2 pl-9 text-sm bg-[#EDF2F7] border border-[#DBE5EE] rounded-xl text-[#0B2F52] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FAD465]"
                      required
                    />
                    <Lock size={15} className="absolute left-3 top-2.5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B2F52] uppercase tracking-wider mb-1">
                  Residential Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="House/Street/Locality"
                    className="w-full px-3.5 py-2 pl-9 text-sm bg-[#EDF2F7] border border-[#DBE5EE] rounded-xl text-[#0B2F52] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FAD465]"
                  />
                  <MapPin size={15} className="absolute left-3 top-2.5 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#0B2F52] uppercase tracking-wider mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Mumbai"
                    className="w-full px-3 py-1.5 text-sm bg-[#EDF2F7] border border-[#DBE5EE] rounded-lg text-[#0B2F52] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FAD465]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#0B2F52] uppercase tracking-wider mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Maharashtra"
                    className="w-full px-3 py-1.5 text-sm bg-[#EDF2F7] border border-[#DBE5EE] rounded-lg text-[#0B2F52] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FAD465]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#0B2F52] uppercase tracking-wider mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="400001"
                    maxLength={6}
                    className="w-full px-3 py-1.5 text-sm bg-[#EDF2F7] border border-[#DBE5EE] rounded-lg text-[#0B2F52] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FAD465]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-start text-xs text-[#34516D] cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="rounded border-[#DBE5EE] text-[#06294D] focus:ring-[#FAD465] mr-2 mt-0.5"
                  />
                  <span>
                    I confirm that the assistance requested is for genuine personal relief, and the documents provided will be authentic.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3 px-4 bg-[#FAD465] hover:bg-[#E9B82E] active:bg-[#C9971A] text-[#011F39] font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Donation Seeker Account</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="mt-4 text-center text-xs text-[#34516D]">
                Already have an account?{' '}
                <Link to="/login" className="text-[#06294D] font-bold hover:underline">
                  Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
