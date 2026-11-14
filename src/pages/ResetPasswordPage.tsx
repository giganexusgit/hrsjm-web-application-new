import type React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  Check,
  Sparkles,
} from 'lucide-react';
import { authService } from '../features/auth/services/authService';
import { ApiError } from '../services/apiClient';

/**
 * Extracts reset token from search params, hash fragment, or window location.
 */
function extractTokenFromLocation(paramToken: string | null): string {
  if (paramToken && paramToken.trim().length > 0) {
    return paramToken.trim();
  }
  if (typeof window !== 'undefined' && window.location) {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const urlToken = searchParams.get('token');
      if (urlToken && urlToken.trim().length > 0) {
        return urlToken.trim();
      }

      if (window.location.hash) {
        const hashQuery = window.location.hash.split('?')[1];
        if (hashQuery) {
          const hashParams = new URLSearchParams(hashQuery);
          const hashToken = hashParams.get('token');
          if (hashToken && hashToken.trim().length > 0) {
            return hashToken.trim();
          }
        }
      }
    } catch {
      // Ignore URL parse errors
    }
  }
  return '';
}

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Token state: derived directly from URL param or manual input
  const rawParamToken = searchParams.get('token');
  const [manualToken, setManualToken] = useState('');
  const [manualTokenInput, setManualTokenInput] = useState('');
  const [showManualTokenInput, setShowManualTokenInput] = useState(false);

  const token = manualToken.trim() || extractTokenFromLocation(rawParamToken);

  // Form inputs
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verification & Status states
  const [tokenVerified, setTokenVerified] = useState<boolean | null>(null);
  const [tokenEmail, setTokenEmail] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Derived validating state
  const tokenValidating = Boolean(token && tokenVerified === null && !tokenError);

  // Live Token Verification when token is present
  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();
    void authService.verifyResetToken(token).then(
      (result) => {
        if (controller.signal.aborted) return;
        if (result.valid) {
          setTokenVerified(true);
          setTokenEmail(result.email || null);
          setTokenError(null);
        } else {
          setTokenVerified(false);
          setTokenError(result.message || 'Invalid or expired reset token.');
        }
      },
      (err: unknown) => {
        if (controller.signal.aborted) return;
        setTokenVerified(false);
        if (err instanceof ApiError) {
          setTokenError(err.message || 'The reset link is invalid or has expired.');
        } else {
          setTokenError('The reset link is invalid or has expired. Please request a new link.');
        }
      }
    );

    return () => {
      controller.abort();
    };
  }, [token]);

  // Password Policy Rules
  const passwordChecks = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasDigitOrSpecial: /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    };
  }, [password]);

  const passwordStrengthScore = useMemo(() => {
    let score = 0;
    if (passwordChecks.minLength) score += 1;
    if (passwordChecks.hasUpper) score += 1;
    if (passwordChecks.hasLower) score += 1;
    if (passwordChecks.hasDigitOrSpecial) score += 1;
    return score;
  }, [passwordChecks]);

  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return null;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  const isFormValid = useMemo(() => {
    return (
      Boolean(token && token.trim().length > 0) &&
      passwordChecks.minLength &&
      passwordChecks.hasUpper &&
      passwordChecks.hasLower &&
      passwordChecks.hasDigitOrSpecial &&
      passwordsMatch === true
    );
  }, [token, passwordChecks, passwordsMatch]);

  const handleApplyManualToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualTokenInput.trim()) {
      setManualToken(manualTokenInput.trim());
      setShowManualTokenInput(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!token) {
      setSubmitError('Missing reset token. Please request a new password reset link.');
      return;
    }

    if (!passwordChecks.minLength) {
      setSubmitError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setSubmitError('Passwords do not match. Please verify your confirmation password.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      await authService.resetPassword({
        token: token.trim(),
        password,
        confirm_password: confirmPassword,
      });
      setIsSuccess(true);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.statusCode === 400 && (err.message.includes('token') || err.message.includes('expired'))) {
          setSubmitError('This reset link has expired or is invalid. Please request a new one.');
        } else if (err.statusCode === 429) {
          setSubmitError('Too many attempts. Please wait a minute and try again.');
        } else {
          setSubmitError(err.message || 'Failed to update password. Please try again.');
        }
      } else {
        setSubmitError('Network error. Please verify your internet connection and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col justify-between selection:bg-[#FAD465] selection:text-[#011F39]">
      {/* Top National Header Band */}
      <header className="bg-[#011F39] border-b border-[#06294D] text-white shadow-md relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div>
              <div className="font-serif font-bold text-sm sm:text-base tracking-wide text-white leading-tight">
                Human Rights &  Social Justice Mission
              </div>
              <div className="text-[10.5px] text-[#FAD465] font-medium tracking-wider">
                मानव अधिकार एवं सामाजिक न्याय संरक्षण ट्रस्ट • National Portal
              </div>
            </div>
          </Link>

          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-[#FAD465] transition-colors py-1.5 px-3 rounded-lg hover:bg-white/5"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Back to</span> Sign In
          </Link>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-md">
          {/* Success Screen State */}
          {isSuccess ? (
            <div className="bg-white rounded-2xl shadow-xl border border-emerald-200/80 p-8 sm:p-10 text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center mx-auto mb-5 shadow-inner">
                <CheckCircle2 size={36} className="text-emerald-600" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 mb-3">
                <ShieldCheck size={14} />
                Database Updated
              </div>

              <h2 className="text-2xl font-serif font-bold text-[#011F39] mb-2">
                Password Reset Successfully
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mb-8 leading-relaxed">
                Your account password has been securely updated in the HRSJM central registry.
                You can now sign in using your new credentials.
              </p>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full h-12 rounded-xl bg-[#FAD465] hover:bg-[#E9B82E] text-[#011F39] font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Sign In Now</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
              {/* Card Banner */}
              <div className="bg-gradient-to-r from-[#011F39] via-[#06294D] to-[#011F39] p-6 text-white text-center relative">
                <div className="w-12 h-12 rounded-xl bg-[#FAD465]/20 border border-[#FAD465]/40 flex items-center justify-center mx-auto mb-3 text-[#FAD465]">
                  <KeyRound size={24} />
                </div>
                <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-wide">
                  Set New Password
                </h1>
                <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                  Create a strong, secure password for your HRSJM account
                </p>
              </div>

              {/* Form Body */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Token Verification Status Badge */}
                {token ? (
                  <div className="rounded-xl border p-3 text-xs flex items-start gap-2.5 transition-all">
                    {tokenValidating ? (
                      <div className="flex items-center gap-2 text-slate-600 w-full">
                        <span className="w-3.5 h-3.5 border-2 border-[#011F39] border-t-transparent rounded-full animate-spin shrink-0" />
                        <span>Validating reset authorization token...</span>
                      </div>
                    ) : tokenVerified ? (
                      <div className="flex items-start gap-2.5 text-emerald-800 bg-emerald-50/50 w-full">
                        <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-emerald-900">Valid Reset Token</p>
                          <p className="text-[11px] text-emerald-700 mt-0.5">
                            Authorized for {tokenEmail ? <span className="font-mono font-medium">{tokenEmail}</span> : 'your registered account'}.
                          </p>
                        </div>
                      </div>
                    ) : tokenError ? (
                      <div className="flex items-start gap-2.5 text-rose-800 bg-rose-50/50 w-full">
                        <XCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-rose-900">Invalid or Expired Token</p>
                          <p className="text-[11px] text-rose-700 mt-0.5">{tokenError}</p>
                          <button
                            type="button"
                            onClick={() => setShowManualTokenInput(true)}
                            className="text-[11px] font-bold text-rose-900 underline mt-1 block"
                          >
                            Enter Token Manually
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 space-y-2">
                    <div className="flex items-center gap-2 font-semibold">
                      <AlertCircle size={15} className="text-amber-700 shrink-0" />
                      <span>No Reset Token Detected in URL</span>
                    </div>
                    <p className="text-[11.5px] text-amber-800">
                      If you received a reset code/token via email or SMS, paste it below to proceed.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowManualTokenInput(true)}
                      className="text-xs font-bold text-[#011F39] underline cursor-pointer"
                    >
                      Paste Reset Token
                    </button>
                  </div>
                )}

                {/* Manual Token Input Modal/Form */}
                {showManualTokenInput && (
                  <form onSubmit={handleApplyManualToken} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Reset Token / Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={manualTokenInput}
                        onChange={(e) => setManualTokenInput(e.target.value)}
                        placeholder="Paste reset token string here"
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#011F39]"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 text-xs font-bold bg-[#011F39] text-[#FAD465] rounded-lg hover:bg-[#06294D] transition"
                      >
                        Apply
                      </button>
                    </div>
                  </form>
                )}

                {/* Submit Error Banner */}
                {submitError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
                    <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* New Password Field */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock size={16} />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        disabled={submitting}
                        autoComplete="new-password"
                        className="w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#011F39]/20 focus:border-[#011F39] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {password && (
                      <div className="mt-2 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Strength:</span>
                          <span
                            className={`font-bold ${passwordStrengthScore <= 1
                                ? 'text-rose-600'
                                : passwordStrengthScore <= 2
                                  ? 'text-amber-600'
                                  : passwordStrengthScore === 3
                                    ? 'text-blue-600'
                                    : 'text-emerald-600'
                              }`}
                          >
                            {passwordStrengthScore <= 1
                              ? 'Weak'
                              : passwordStrengthScore <= 2
                                ? 'Fair'
                                : passwordStrengthScore === 3
                                  ? 'Good'
                                  : 'Strong'}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                          <div
                            className={`h-full flex-1 rounded-full transition-all duration-300 ${passwordStrengthScore >= 1
                                ? passwordStrengthScore === 1
                                  ? 'bg-rose-500'
                                  : passwordStrengthScore === 2
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                : 'bg-slate-200'
                              }`}
                          />
                          <div
                            className={`h-full flex-1 rounded-full transition-all duration-300 ${passwordStrengthScore >= 2
                                ? passwordStrengthScore === 2
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                                : 'bg-slate-200'
                              }`}
                          />
                          <div
                            className={`h-full flex-1 rounded-full transition-all duration-300 ${passwordStrengthScore >= 3 ? 'bg-emerald-500' : 'bg-slate-200'
                              }`}
                          />
                          <div
                            className={`h-full flex-1 rounded-full transition-all duration-300 ${passwordStrengthScore >= 4 ? 'bg-emerald-600' : 'bg-slate-200'
                              }`}
                          />
                        </div>

                        {/* Rules Checklist */}
                        <div className="pt-1 grid grid-cols-2 gap-x-2 gap-y-1 text-[10.5px]">
                          <div
                            className={`flex items-center gap-1 ${passwordChecks.minLength ? 'text-emerald-700' : 'text-slate-400'
                              }`}
                          >
                            <Check size={12} className={passwordChecks.minLength ? 'opacity-100' : 'opacity-40'} />
                            <span>8+ characters</span>
                          </div>
                          <div
                            className={`flex items-center gap-1 ${passwordChecks.hasUpper ? 'text-emerald-700' : 'text-slate-400'
                              }`}
                          >
                            <Check size={12} className={passwordChecks.hasUpper ? 'opacity-100' : 'opacity-40'} />
                            <span>Uppercase letter</span>
                          </div>
                          <div
                            className={`flex items-center gap-1 ${passwordChecks.hasLower ? 'text-emerald-700' : 'text-slate-400'
                              }`}
                          >
                            <Check size={12} className={passwordChecks.hasLower ? 'opacity-100' : 'opacity-40'} />
                            <span>Lowercase letter</span>
                          </div>
                          <div
                            className={`flex items-center gap-1 ${passwordChecks.hasDigitOrSpecial ? 'text-emerald-700' : 'text-slate-400'
                              }`}
                          >
                            <Check
                              size={12}
                              className={passwordChecks.hasDigitOrSpecial ? 'opacity-100' : 'opacity-40'}
                            />
                            <span>Number / symbol</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock size={16} />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        disabled={submitting}
                        autoComplete="new-password"
                        className="w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#011F39]/20 focus:border-[#011F39] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {confirmPassword && (
                      <p
                        className={`text-[11px] mt-1.5 font-medium flex items-center gap-1 ${passwordsMatch ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                      >
                        {passwordsMatch ? (
                          <>
                            <CheckCircle2 size={12} />
                            <span>Passwords match</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={12} />
                            <span>Passwords do not match</span>
                          </>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting || !isFormValid}
                    className="w-full h-12 rounded-xl bg-[#FAD465] hover:bg-[#E9B82E] text-[#011F39] font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-4"
                  >
                    {submitting ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-[#011F39] border-t-transparent rounded-full animate-spin" />
                        <span>Updating Password...</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <span>Save & Reset Password</span>
                        <ArrowRight size={16} />
                      </span>
                    )}
                  </button>
                </form>

                {/* Footer links */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <Link to="/login" className="font-semibold text-[#011F39] hover:underline flex items-center gap-1">
                    <ArrowLeft size={13} />
                    <span>Return to Login</span>
                  </Link>
                  <Link to="/contact" className="hover:underline text-slate-500">
                    Need Help?
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200/60 bg-white/50">
        <p className="flex items-center justify-center gap-2">
          <span>Human Rights &  Social Justice Mission (Regd. HR/0092/2019)</span>
          <span>•</span>
          <span className="inline-flex items-center gap-1 text-[#011F39] font-medium">
            <Sparkles size={12} className="text-[#FAD465]" />
            Official Security Portal
          </span>
        </p>
      </footer>
    </div>
  );
};
export default ResetPasswordPage;
