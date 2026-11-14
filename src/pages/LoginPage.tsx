import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  X,
  AlertCircle,
  Shield,
} from 'lucide-react';
import {
  authService,
  resolveUserDestination,
  isPathAllowedForUser,
} from '../features/auth/services/authService';
import { authStore } from '../features/auth/store/authStore';
import { userAuthStore } from '../features/user/store/userAuthStore';
import { ApiError } from '../services/apiClient';
import memberRallyImg from '../assets/images/member-hero-rally.jpg';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Role query param (e.g. ?role=member | ?role=seeker | ?role=admin)
  const roleParam = searchParams.get('role')?.toLowerCase() || null;

  // Form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [focusedField, setFocusedField] = useState<'identifier' | 'password' | null>(null);

  // Status & Validation
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({});

  // Forgot Password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // If already authenticated with a valid token, verify with /auth/me and route according to actual role
  useEffect(() => {
    const existingToken = authService.getAuthToken();
    if (existingToken) {
      authService
        .fetchMe()
        .then((user) => {
          if (user) {
            const params = new URLSearchParams(window.location.search);
            const redirect = params.get('redirect');
            if (redirect && redirect.startsWith('/') && isPathAllowedForUser(redirect, user)) {
              navigate(redirect, { replace: true });
              return;
            }

            const destination = resolveUserDestination(user);
            navigate(destination, { replace: true });
          } else {
            authService.clearSession();
          }
        })
        .catch(() => {
          authService.clearSession();
        });
    }
  }, [navigate]);

  /**
   * Client-side validation mirroring APK's auth.schemas.ts
   */
  const validateForm = (): boolean => {
    const errors: { identifier?: string; password?: string } = {};

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier || cleanIdentifier.length < 3) {
      errors.identifier = 'Enter your registered mobile number or email ID';
    }

    if (!password) {
      errors.password = 'Enter your account password';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Maps backend auth failures per the Admin BRD test matrix (TC-ADMIN-002 / TC-ADMIN-003)
   */
  const resolveLoginError = (error: unknown): string => {
    if (error instanceof ApiError) {
      if (error.statusCode === 403) {
        return 'Your account has been deactivated. Contact the HRSJM Central Secretariat.';
      }
      if (error.statusCode === 401) {
        return 'Invalid email or password. Please verify your credentials.';
      }
      if (error.message) {
        return error.message;
      }
    }
    return 'Unable to login. Please check your network connection and try again.';
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setFormError(null);

    try {
      const session = await authService.login({
        identifier: identifier.trim(),
        password,
      });

      authService.setSession(session, rememberMe);
      authStore.setUserDirectly(session.user, session.access_token, session.refresh_token);
      userAuthStore.setUser(session.user as any);

      // Verify and hydrate current user profile from /auth/me
      try {
        const freshUser = await authService.fetchMe();
        if (freshUser) {
          session.user = freshUser;
          authStore.setUserDirectly(freshUser, session.access_token, session.refresh_token);
          userAuthStore.setUser(freshUser as any);
        }
      } catch {
        // Continue with validated session.user
      }

      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      if (redirect && redirect.startsWith('/') && isPathAllowedForUser(redirect, session.user)) {
        navigate(redirect, { replace: true });
        return;
      }

      // Check if user specified a role parameter and has credentials for it
      if (
        roleParam === 'seeker' &&
        (session.user.account_type === 'seeker' ||
          session.user.roles?.some((r: any) => (r.name || r) === 'DONATION_SEEKER'))
      ) {
        navigate('/seeker/home', { replace: true });
        return;
      }
      if (
        roleParam === 'member' &&
        (session.user.account_type === 'member' ||
          session.user.roles?.some((r: any) => (r.name || r) === 'MEMBER'))
      ) {
        navigate('/member/dashboard', { replace: true });
        return;
      }

      // Determine verified destination based on authenticated account type and roles
      const destination = resolveUserDestination(session.user);
      navigate(destination, { replace: true });
    } catch (err: any) {
      setFormError(resolveLoginError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) {
      setForgotError('Enter your registered email address or mobile number');
      return;
    }

    setForgotSubmitting(true);
    setForgotError(null);
    try {
      await authService.forgotPassword(forgotIdentifier.trim());
      setForgotSuccess(true);
    } catch (err: any) {
      setForgotError(err?.message || 'Password reset request failed. Please verify your email address.');
    } finally {
      setForgotSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col lg:flex-row text-slate-800 font-sans selection:bg-[#FAD465] selection:text-[#011F39]">
      {/* ════════════════════════════════════════════════════════════
          LEFT HERO SECTION: Editorial Mission Showcase (Desktop)
      ════════════════════════════════════════════════════════════ */}
      <section className="lg:w-1/2 xl:w-7/12 bg-[#011F39] relative flex flex-col justify-between gap-6 sm:gap-8 overflow-y-auto p-6 sm:p-8 lg:p-10 xl:p-12 text-white min-h-[300px] lg:min-h-screen">
        {/* Background Documentary Rally Imagery with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={memberRallyImg}
            alt="HRSJM Human Rights Rally"
            className="w-full h-full object-cover opacity-15 mix-blend-luminosity filter contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#011F39]/98 via-[#06294D]/92 to-[#011F39]/98" />
          {/* Subtle Ambient Radial Glows */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#FAD465]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#123F68]/40 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Top Header / National Seal */}
        <div className="relative z-10 shrink-0 space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Link to="/login" className="flex items-center gap-3.5 group cursor-pointer">
              <div>
                <div className="text-sm sm:text-base font-extrabold tracking-wider text-white font-serif flex items-center gap-2">
                  <span>HRSJM</span>

                </div>
                <div className="text-[10px] sm:text-[11px] font-bold text-[#FAD465] tracking-wider uppercase">
                  HUMAN RIGHTS & SOCIAL JUSTICE MISSION
                </div>
              </div>
            </Link>

            {/* Back to Public Home Button */}
            <Link
              to="https://hrsjm-ngo-website-8tr9.vercel.app/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-xs font-semibold border border-white/15 transition backdrop-blur-sm"
            >
              <ArrowLeft size={14} />
              <span>Public Website</span>
            </Link>
          </div>

          {/* Active Portal Indicator if filtered */}
          {roleParam && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAD465]/20 text-[#FAD465] text-xs font-bold border border-[#FAD465]/30">
              <Shield size={13} />
              <span className="capitalize">{roleParam} Portal Sign-In Active</span>
            </div>
          )}
        </div>

        {/* Center Editorial Headlines & Mission Pillars (Guaranteed vertical flow without overlap) */}
        <div className="relative z-10 py-2 sm:py-4 space-y-5 xl:space-y-6 max-w-xl">


          <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black font-serif tracking-tight text-white leading-[1.18]">
            Together for a{' '}
            <span className="text-[#FAD465] italic font-serif relative">
              More Just
            </span>{' '}
            Society
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal opacity-95">
            Championing pro-bono legal aid, rapid grievance interventions, and civic protections across India. Dedicated to upholding fundamental constitutional guarantees under the law.
          </p>

        </div>

        {/* Hero Footer */}
        <div className="relative z-10 shrink-0 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
          <div>Regd. Societies Registration Act XXI of 1860</div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          RIGHT AUTH SECTION: Executive Sign In Card (Ivory Surface)
      ════════════════════════════════════════════════════════════ */}
      <section className="lg:w-1/2 xl:w-5/12 bg-[#FAF7F0] flex flex-col justify-center items-center p-4 sm:p-8 lg:p-10 xl:p-12 relative overflow-y-auto">
        {/* Auth Card */}
        <div className="w-full max-w-[460px] bg-white rounded-3xl shadow-xl border border-[#DCE4EC] p-6 sm:p-8 md:p-9 space-y-6">
          {/* Card Header */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-[#06294D] bg-[#EDF2F7] px-2.5 py-0.5 rounded-full border border-[#DBE5EE]">
                <Shield size={12} className="text-[#06294D]" />
                Official Access Portal
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-serif text-[#0B2F52] tracking-tight pt-1">
              Sign In to Portal
            </h2>
            <p className="text-xs text-[#718096] leading-relaxed">
              Enter your registered credentials to access your administrative, membership, or citizen service dashboard.
            </p>
          </div>

          {/* Logout Success Banner */}
          {searchParams.get('logout') === 'success' && !formError && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>You have been safely signed out. Thank you for your service.</span>
            </div>
          )}

          {/* Form Error Alert */}
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in duration-200">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-semibold">{formError}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* 1. Identifier Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0B2F52] uppercase tracking-wider">
                Mobile Number or Email ID <span className="text-rose-500">*</span>
              </label>

              <div
                className={`flex items-center bg-[#FAF7F0] border rounded-xl px-3.5 h-[50px] transition-all shadow-xs ${focusedField === 'identifier'
                  ? 'border-[#06294D] bg-white ring-2 ring-[#FAD465]/40'
                  : fieldErrors.identifier
                    ? 'border-rose-400 bg-rose-50/50'
                    : 'border-[#DCE4EC] hover:border-slate-300'
                  }`}
              >
                <div className="w-5 flex items-center justify-center text-slate-400 mr-2.5">
                  <Mail
                    size={17}
                    className={focusedField === 'identifier' ? 'text-[#06294D]' : 'text-slate-400'}
                  />
                </div>
                <input
                  type="text"
                  value={identifier}
                  disabled={submitting}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (fieldErrors.identifier) setFieldErrors((prev) => ({ ...prev, identifier: undefined }));
                  }}
                  onFocus={() => setFocusedField('identifier')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="e.g. 9876543210 or member@hrsjm.org"
                  className="w-full bg-transparent text-sm text-[#0B2F52] font-semibold placeholder-slate-400 focus:outline-none"
                  autoCapitalize="none"
                  autoCorrect="off"
                />
              </div>
              {fieldErrors.identifier && (
                <p className="text-[11px] text-rose-600 font-semibold pl-1">{fieldErrors.identifier}</p>
              )}
            </div>

            {/* 2. Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0B2F52] uppercase tracking-wider">
                Account Password <span className="text-rose-500">*</span>
              </label>

              <div
                className={`flex items-center bg-[#FAF7F0] border rounded-xl px-3.5 h-[50px] transition-all shadow-xs ${focusedField === 'password'
                  ? 'border-[#06294D] bg-white ring-2 ring-[#FAD465]/40'
                  : fieldErrors.password
                    ? 'border-rose-400 bg-rose-50/50'
                    : 'border-[#DCE4EC] hover:border-slate-300'
                  }`}
              >
                <div className="w-5 flex items-center justify-center text-slate-400 mr-2.5">
                  <Lock
                    size={17}
                    className={focusedField === 'password' ? 'text-[#06294D]' : 'text-slate-400'}
                  />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  disabled={submitting}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter your security password"
                  className="w-full bg-transparent text-sm text-[#0B2F52] font-semibold placeholder-slate-400 focus:outline-none"
                  autoCapitalize="none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="p-1 text-slate-400 hover:text-[#06294D] transition cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <Eye size={17} /> : <EyeOff size={17} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-rose-600 font-semibold pl-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* 3. Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <button
                  type="button"
                  onClick={() => setRememberMe((p) => !p)}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer ${rememberMe ? 'bg-[#06294D] border-[#06294D] text-[#FAD465]' : 'bg-white border-[#DCE4EC]'
                    }`}
                  aria-checked={rememberMe}
                  role="checkbox"
                >
                  {rememberMe && <Check size={11} className="stroke-[3]" />}
                </button>
                <span className="text-xs text-[#34516D] font-medium">Keep me signed in</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setForgotIdentifier(identifier);
                  setForgotSuccess(false);
                  setForgotError(null);
                  setForgotModalOpen(true);
                }}
                className="text-xs font-bold text-[#06294D] hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            {/* 4. Primary Sign In Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-[50px] rounded-xl bg-[#FAD465] hover:bg-[#E9B82E] active:bg-[#D4A416] text-[#011F39] font-black text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#011F39] border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <span>Sign In </span>
                  <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          {/* Sign Up / Registration Link */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs text-[#718096]">
            <span>New to HRSJM? </span>
            <Link
              to="/signup"
              className="font-bold text-[#06294D] hover:text-[#0B2F52] hover:underline inline-flex items-center gap-1 group"
            >
              <span>Create an Account / Sign Up</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Security & Statutory Notice */}
        <div className="mt-6 text-center text-[11px] text-slate-400 space-y-1">
          <div>Official Portal of the Human Rights & Social Justice Mission</div>
          <div>Authorized National Executive Personnel & Registered Members Only</div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          FORGOT PASSWORD MODAL
      ════════════════════════════════════════════════════════════ */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#011F39]/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#DCE4EC] overflow-hidden relative">
            <button
              type="button"
              onClick={() => setForgotModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="p-6 sm:p-8">
              {!forgotSuccess ? (
                <>
                  <div className="mb-5 space-y-1">
                    <span className="text-[10px] font-bold text-[#06294D] uppercase tracking-wider bg-[#EDF2F7] px-2 py-0.5 rounded-full border border-[#DBE5EE]">
                      Account Recovery Cell
                    </span>
                    <h3 className="text-xl font-black font-serif text-[#0B2F52] pt-1">
                      Reset Your Password
                    </h3>
                    <p className="text-xs text-slate-500">
                      Enter your registered email address or mobile phone number to generate a secure recovery link.
                    </p>
                  </div>

                  {forgotError && (
                    <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                      <AlertCircle size={15} className="shrink-0" />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0B2F52] uppercase tracking-wider mb-1.5">
                        Registered Mobile Number or Email
                      </label>
                      <input
                        type="text"
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        placeholder="e.g. 9876543210 or member@hrsjm.org"
                        disabled={forgotSubmitting}
                        className="w-full px-3.5 py-2.5 text-xs font-semibold bg-[#FAF7F0] border border-[#DCE4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FAD465] text-[#0B2F52]"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setForgotModalOpen(false)}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={forgotSubmitting}
                        className="px-5 py-2.5 text-xs font-bold bg-[#06294D] text-[#FAD465] hover:bg-[#083a6b] rounded-xl shadow-sm transition cursor-pointer disabled:opacity-70"
                      >
                        {forgotSubmitting ? 'Generating Link...' : 'Send Reset Link'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center py-4 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-serif text-[#0B2F52]">Recovery Notice Dispatched</h3>
                    <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                      If an account is associated with this credential, a password reset link has been dispatched.
                    </p>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs text-amber-800 flex items-start gap-2">
                    <Clock size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">VALID FOR 15 MINUTES</span>
                      <span className="text-[11px] text-amber-700">Check your SMS inbox or email spam folder if you do not receive it promptly.</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-[#06294D] text-[#FAD465] text-xs font-bold hover:bg-[#083a6b] transition cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
