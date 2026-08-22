import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Smartphone, 
  KeyRound, 
  UserCheck, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  X, 
  AlertCircle,
  Building2,
  CheckCircle2,
  Phone,
  Fingerprint
} from 'lucide-react';
import { DEPARTMENTS } from '../data/mockData';

export interface AuthUser {
  uid: string;
  name: string;
  role: 'CITIZEN' | 'OFFICER' | 'ADMIN';
  phone?: string;
  aadhaarLast4?: string;
  departmentId?: string;
  designation?: string;
  officerBadge?: string;
  isVerified?: boolean;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'MOBILE_OTP' | 'AADHAAR_OTP' | 'OFFICER_LOGIN'>('MOBILE_OTP');
  
  // Citizen form state
  const [identifier, setIdentifier] = useState('');
  const [citizenName, setCitizenName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'ENTER_IDENTIFIER' | 'ENTER_OTP'>('ENTER_IDENTIFIER');
  const [demoReceivedOtp, setDemoReceivedOtp] = useState<string | null>(null);

  // Officer form state
  const [selectedDeptId, setSelectedDeptId] = useState('DEPT_PWD');
  const [badgeNumber, setBadgeNumber] = useState('PWD-ENG-8402');
  const [secretPin, setSecretPin] = useState('1234');

  // General state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!identifier || identifier.length < 10) {
      setErrorMessage(
        authMode === 'AADHAAR_OTP'
          ? 'Please enter a valid 12-digit Aadhaar number.'
          : 'Please enter a valid 10-digit mobile number.'
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, type: authMode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch OTP');

      setStep('ENTER_OTP');
      if (data.demoOtp) {
        setDemoReceivedOtp(data.demoOtp);
        setOtpCode(data.demoOtp); // Auto-fill for convenience
      }
      setSuccessMessage(
        authMode === 'AADHAAR_OTP'
          ? `6-digit UIDAI Aadhaar verification OTP dispatched to registered mobile linked with XXXX-XXXX-${identifier.slice(-4)}`
          : `SMS OTP dispatched to +91 ${identifier}`
      );
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!otpCode || otpCode.length < 4) {
      setErrorMessage('Please enter the verification OTP code.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          otpCode,
          type: authMode,
          citizenName: citizenName || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'OTP verification failed');

      localStorage.setItem('samadhan_jwt', data.token);
      localStorage.setItem('samadhan_user', JSON.stringify(data.user));

      onLoginSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOfficerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/officer-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          badgeNumber,
          secretPin,
          departmentId: selectedDeptId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Officer authentication failed');

      localStorage.setItem('samadhan_jwt', data.token);
      localStorage.setItem('samadhan_user', JSON.stringify(data.user));

      onLoginSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#020617] border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Secure Citizen & Officer Login
              </h2>
              <p className="text-xs text-slate-400">
                PostgreSQL • Aadhaar/OTP • Municipal JWT Session
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 p-2 bg-white/[0.02] border-b border-white/10 gap-1 text-xs font-semibold">
          <button
            onClick={() => {
              setAuthMode('MOBILE_OTP');
              setStep('ENTER_IDENTIFIER');
              setErrorMessage(null);
            }}
            className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'MOBILE_OTP'
                ? 'bg-indigo-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile OTP</span>
          </button>

          <button
            onClick={() => {
              setAuthMode('AADHAAR_OTP');
              setStep('ENTER_IDENTIFIER');
              setErrorMessage(null);
            }}
            className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'AADHAAR_OTP'
                ? 'bg-indigo-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>Aadhaar OTP</span>
          </button>

          <button
            onClick={() => {
              setAuthMode('OFFICER_LOGIN');
              setErrorMessage(null);
            }}
            className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'OFFICER_LOGIN'
                ? 'bg-indigo-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Officer Login</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. Mobile OTP / Aadhaar OTP Flow */}
          {authMode !== 'OFFICER_LOGIN' && (
            <>
              {step === 'ENTER_IDENTIFIER' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Your Full Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={citizenName}
                      onChange={(e) => setCitizenName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {authMode === 'AADHAAR_OTP'
                        ? '12-Digit Aadhaar UID'
                        : '10-Digit Mobile Number'}
                    </label>
                    <div className="relative">
                      {authMode === 'MOBILE_OTP' ? (
                        <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      ) : (
                        <Fingerprint className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      )}
                      <input
                        type="text"
                        placeholder={
                          authMode === 'AADHAAR_OTP'
                            ? '9999 8888 7777'
                            : '9876543210'
                        }
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
                  >
                    <span>{isLoading ? 'Sending OTP...' : 'Send Verification OTP'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        Enter 6-Digit OTP Code
                      </label>
                      <button
                        type="button"
                        onClick={() => setStep('ENTER_IDENTIFIER')}
                        className="text-[11px] text-indigo-400 hover:underline"
                      >
                        Change {authMode === 'AADHAAR_OTP' ? 'Aadhaar' : 'Mobile'}
                      </button>
                    </div>

                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 748291"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full text-center tracking-[0.5em] text-lg font-mono px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                      required
                    />
                    {demoReceivedOtp && (
                      <p className="text-[11px] text-emerald-400 mt-1 font-mono">
                        Demo OTP: {demoReceivedOtp}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
                  >
                    <span>{isLoading ? 'Verifying...' : 'Verify OTP & Sign In'}</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </form>
              )}
            </>
          )}

          {/* 2. Municipal Officer Login Flow */}
          {authMode === 'OFFICER_LOGIN' && (
            <form onSubmit={handleOfficerLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Municipal Department
                </label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept.id} value={dept.id} className="bg-slate-900 text-white">
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Officer Duty Badge ID
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={badgeNumber}
                    onChange={(e) => setBadgeNumber(e.target.value)}
                    placeholder="e.g. PWD-ENG-8402"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Duty Secret PIN
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="password"
                    value={secretPin}
                    onChange={(e) => setSecretPin(e.target.value)}
                    placeholder="****"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
              >
                <span>{isLoading ? 'Authenticating...' : 'Sign In as Officer'}</span>
                <UserCheck className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white/[0.02] border-t border-white/10 text-center text-[11px] text-slate-400">
          Integrated with PostgreSQL User Identity & Firebase Storage
        </div>
      </div>
    </div>
  );
};
