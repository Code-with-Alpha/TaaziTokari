// ==============================================================================
// TAAZI TOKARI (ताज़ी टोकरी) - AUTHENTICATION & REGISTRATION MODAL
// Real Google OAuth + Email/Mobile Login + Registration with profile fields.
// Admin roles verified strictly server-side/whitelist, never customer selected.
// ==============================================================================

import React, { useState } from 'react';
import { UserProfile, appStore } from '../../services/store';
import { authService, isAuthorizedAdminEmail } from '../../services/supabase';
import { TaaziTokariEmblem } from '../BrandLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  initialMode?: 'signin' | 'register' | 'admin';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'signin',
}) => {
  const [mode, setMode] = useState<'signin' | 'register' | 'admin'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. Google OAuth Sign In
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { user, error } = await authService.signInWithGoogle();
      if (error) {
        setErrorMsg(error);
      } else if (user) {
        onSuccess(user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in encountered an error.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Email / Mobile Password Sign In
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const { user, error } = await authService.signInWithEmailPassword(email, password);
      if (error) {
        setErrorMsg(error);
      } else if (user) {
        onSuccess(user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  // 3. New Customer Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phoneNumber.trim()) {
      setErrorMsg('Please enter your full name, email, and mobile number.');
      return;
    }
    if (phoneNumber.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number for order dispatch.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const { user, error } = await authService.registerCustomer({
        fullName,
        email,
        phoneNumber,
      });
      if (error) {
        setErrorMsg(error);
      } else if (user) {
        onSuccess(user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Quick Demo Sign In
  const handleQuickDemo = (type: 'customer' | 'admin') => {
    setLoading(true);
    if (type === 'admin') {
      const admin = authService.signInWithEmailPassword('admin@taazitokari.in', 'demo-admin-pass');
      admin.then(({ user }) => {
        if (user) {
          onSuccess(user);
          onClose();
        }
      });
    } else {
      const cust = authService.signInWithEmailPassword('priya.sharma@example.com', 'demo-pass');
      cust.then(({ user }) => {
        if (user) {
          onSuccess(user);
          onClose();
        }
      });
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-emerald-100 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#072917] px-6 py-5 text-white flex items-center justify-between border-b border-[#14482a]">
          <div className="flex items-center gap-3">
            <TaaziTokariEmblem size={38} />
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                {mode === 'register'
                  ? 'Create Account'
                  : mode === 'admin'
                  ? 'Admin Authentication'
                  : 'Welcome Back'}
                <span className="text-xs font-normal text-emerald-300">
                  {mode === 'register' ? '(पंजीकरण)' : '(साइन इन)'}
                </span>
              </h2>
              <p className="text-xs text-emerald-200/80">
                Taazi Tokari • Kishan Fresh to Kitchen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-lg"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[85vh]">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-900 px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Mode Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => { setMode('signin'); setErrorMsg(null); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'signin' ? 'bg-white text-emerald-950 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Customer Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg(null); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'register' ? 'bg-white text-emerald-950 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              New Customer
            </button>
            <button
              type="button"
              onClick={() => { setMode('admin'); setErrorMsg(null); }}
              className={`py-1.5 px-3 text-xs font-bold rounded-xl transition-all ${
                mode === 'admin' ? 'bg-[#072917] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Admin ⚙️
            </button>
          </div>

          {/* 1. GOOGLE OAUTH BUTTON (Prominent for Customers) */}
          {mode !== 'admin' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 bg-white hover:bg-gray-50 active:scale-[0.99] border border-gray-300 text-gray-800 font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  or with email / mobile
                </span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'signin' && (
            <form onSubmit={handleEmailSignIn} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email Address or Mobile
                </label>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. priya.sharma@example.com"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Authenticating...' : 'Sign In as Customer'}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Mobile Number (For Dawn Delivery SMS) <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <p className="text-[11px] text-gray-500 leading-normal">
                🔒 We collect only your name, phone number, and delivery address to fulfill farm orders. We never request Aadhaar or sensitive identity documents.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Creating Profile...' : 'Create Customer Account'}
              </button>
            </form>
          )}

          {/* ADMIN PORTAL LOGIN */}
          {mode === 'admin' && (
            <form onSubmit={handleEmailSignIn} className="space-y-3.5">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 leading-relaxed">
                🛡️ <strong>Authorized Personnel Only:</strong> Admin access requires verification against the configured server whitelist (e.g. <code>admin@taazitokari.in</code>). Customer accounts cannot access administrative features.
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Administrator Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@taazitokari.in"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Admin Passkey
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#072917] hover:bg-[#0b3b24] text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Verifying Credentials...' : 'Authenticate Admin Console'}
              </button>
            </form>
          )}

          {/* Demo Convenience Pills */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
            <span>One-click test accounts:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('customer')}
                className="text-emerald-700 font-bold hover:underline"
              >
                Priya (Customer)
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="text-amber-800 font-bold hover:underline"
              >
                Amit (Admin)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
