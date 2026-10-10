import React, { useState } from 'react';
import { TaaziTokariEmblem } from './BrandLogo';

export type UserRole = 'customer' | 'ops' | 'admin' | 'architect';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar: string;
  location: string;
  badge: string;
}

export const MOCK_USERS: Record<UserRole, UserProfile> = {
  customer: {
    id: 'usr-res-904',
    name: 'Priya Sharma',
    phone: '+91 98765 43210',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    location: 'Gomti Nagar Phase 2, Eldeco Elegance',
    badge: 'Resident Customer',
  },
  ops: {
    id: 'usr-ops-201',
    name: 'Ramesh Kumar',
    phone: '+91 98123 45678',
    role: 'ops',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    location: 'Lucknow Central Warehouse (Station #3)',
    badge: 'Operations & Logistics',
  },
  admin: {
    id: 'usr-adm-001',
    name: 'Amit Sharma',
    phone: '+91 99999 88888',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    location: 'Admin HQ • Mandi Rate Governor',
    badge: 'Super Administrator',
  },
  architect: {
    id: 'usr-arc-000',
    name: 'Lead System Architect',
    phone: '+91 90000 00000',
    role: 'architect',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    location: 'System Engine & Blueprint Specs',
    badge: 'Technical Architect',
  },
};

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onSelectRole,
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'otp'>('quick');
  const [phone, setPhone] = useState('9876543210');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState(['4', '8', '2', '1']);
  const [selectedOtpRole, setSelectedOtpRole] = useState<UserRole>('customer');

  if (!isOpen) return null;

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      setOtpSent(true);
    } else {
      onSelectRole(selectedOtpRole);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-emerald-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#072917] via-[#0b3b24] to-[#124b2f] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>

          <div className="flex items-center gap-3">
            <TaaziTokariEmblem size={52} className="drop-shadow-md" />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#f4a62a]">
                Multi-Role Portal Access
              </span>
              <h2 className="text-xl font-bold tracking-tight font-headline-md">
                Sign In / Switch Portal
              </h2>
              <p className="text-xs text-[#bdeecd] mt-0.5">
                Switch seamlessly between Customer, Operations, Admin, and Blueprint view.
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-[#031d10] p-1 rounded-xl mt-5 gap-1 border border-[#1e4b33]">
            <button
              onClick={() => setActiveTab('quick')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'quick'
                  ? 'bg-[#f4a62a] text-[#072917] shadow-sm'
                  : 'text-[#8bba9b] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">touch_app</span>
              <span>1-Click Role Switcher</span>
            </button>
            <button
              onClick={() => setActiveTab('otp')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'otp'
                  ? 'bg-[#f4a62a] text-[#072917] shadow-sm'
                  : 'text-[#8bba9b] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">smartphone</span>
              <span>Phone & OTP Sign In</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === 'quick' ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-[#414943] uppercase tracking-wider">
                Select your active persona:
              </p>

              {/* Customer Role Card */}
              <div
                onClick={() => {
                  onSelectRole('customer');
                  onClose();
                }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                  currentRole === 'customer'
                    ? 'border-[#02341e] bg-[#f0f9f3] shadow-md'
                    : 'border-slate-100 hover:border-emerald-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={MOCK_USERS.customer.avatar}
                    alt="Customer"
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#02341e] text-sm">
                        {MOCK_USERS.customer.name}
                      </span>
                      <span className="bg-[#e2f5e9] text-[#125835] text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                        Resident
                      </span>
                    </div>
                    <p className="text-xs text-[#526057] mt-0.5">
                      Shop produce, order Health Kits, view Sikka savings & track orders
                    </p>
                    <span className="text-[11px] text-emerald-700 font-medium block mt-1">
                      📍 {MOCK_USERS.customer.location}
                    </span>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-xl bg-[#02341e] text-white text-xs font-bold group-hover:bg-[#f4a62a] group-hover:text-[#02341e] transition-colors shrink-0">
                  {currentRole === 'customer' ? 'Active' : 'Switch'}
                </button>
              </div>

              {/* Ops Role Card */}
              <div
                onClick={() => {
                  onSelectRole('ops');
                  onClose();
                }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                  currentRole === 'ops'
                    ? 'border-[#02341e] bg-[#f0f9f3] shadow-md'
                    : 'border-slate-100 hover:border-amber-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={MOCK_USERS.ops.avatar}
                    alt="Ops Staff"
                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-500 shadow-xs"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#02341e] text-sm">
                        {MOCK_USERS.ops.name}
                      </span>
                      <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                        Ops Lead
                      </span>
                    </div>
                    <p className="text-xs text-[#526057] mt-0.5">
                      Crate packing, tower delivery routing, dawn mandi procurement & QC
                    </p>
                    <span className="text-[11px] text-amber-800 font-medium block mt-1">
                      🏬 {MOCK_USERS.ops.location}
                    </span>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-xl bg-[#02341e] text-white text-xs font-bold group-hover:bg-[#f4a62a] group-hover:text-[#02341e] transition-colors shrink-0">
                  {currentRole === 'ops' ? 'Active' : 'Switch'}
                </button>
              </div>

              {/* Admin Role Card */}
              <div
                onClick={() => {
                  onSelectRole('admin');
                  onClose();
                }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                  currentRole === 'admin'
                    ? 'border-[#02341e] bg-[#f0f9f3] shadow-md'
                    : 'border-slate-100 hover:border-purple-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={MOCK_USERS.admin.avatar}
                    alt="Admin"
                    className="w-12 h-12 rounded-full object-cover border-2 border-purple-500 shadow-xs"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#02341e] text-sm">
                        {MOCK_USERS.admin.name}
                      </span>
                      <span className="bg-purple-100 text-purple-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                        Super Admin
                      </span>
                    </div>
                    <p className="text-xs text-[#526057] mt-0.5">
                      Catalogue manager, Mandi rate manipulator, settlement ledgers & cut-offs
                    </p>
                    <span className="text-[11px] text-purple-800 font-medium block mt-1">
                      ⚙️ {MOCK_USERS.admin.location}
                    </span>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-xl bg-[#02341e] text-white text-xs font-bold group-hover:bg-[#f4a62a] group-hover:text-[#02341e] transition-colors shrink-0">
                  {currentRole === 'admin' ? 'Active' : 'Switch'}
                </button>
              </div>

              {/* Architect Role Card */}
              <div
                onClick={() => {
                  onSelectRole('architect');
                  onClose();
                }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                  currentRole === 'architect'
                    ? 'border-[#02341e] bg-[#f0f9f3] shadow-md'
                    : 'border-slate-100 hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={MOCK_USERS.architect.avatar}
                    alt="Architect"
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 shadow-xs"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#02341e] text-sm">
                        {MOCK_USERS.architect.name}
                      </span>
                      <span className="bg-blue-100 text-blue-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                        Architect Specs
                      </span>
                    </div>
                    <p className="text-xs text-[#526057] mt-0.5">
                      System data architecture blueprint, API payloads & state flow engine
                    </p>
                    <span className="text-[11px] text-blue-800 font-medium block mt-1">
                      📐 {MOCK_USERS.architect.location}
                    </span>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-xl bg-[#02341e] text-white text-xs font-bold group-hover:bg-[#f4a62a] group-hover:text-[#02341e] transition-colors shrink-0">
                  {currentRole === 'architect' ? 'Active' : 'Switch'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4 py-2">
              <div className="bg-[#f0f9f3] p-4 rounded-2xl border border-emerald-200">
                <label className="block text-xs font-bold text-[#02341e] mb-1">
                  Mobile Number (India)
                </label>
                <div className="flex gap-2">
                  <span className="bg-white border border-slate-300 text-slate-700 text-xs font-bold px-3 py-2.5 rounded-xl flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-[#02341e]"
                    required
                  />
                </div>
              </div>

              {otpSent && (
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 animate-fadeIn">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-900">
                      Enter OTP sent to +91 {phone}
                    </span>
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">
                      Demo OTP: 4821
                    </span>
                  </div>
                  <div className="flex gap-2 justify-center my-3">
                    {otpCode.map((digit, idx) => (
                      <input
                        key={idx}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          const val = e.target.value;
                          const next = [...otpCode];
                          next[idx] = val;
                          setOtpCode(next);
                        }}
                        className="w-12 h-12 text-center text-lg font-extrabold bg-white border-2 border-amber-400 rounded-xl focus:outline-none focus:border-amber-600"
                      />
                    ))}
                  </div>

                  <label className="block text-xs font-bold text-amber-900 mt-3 mb-1">
                    Select Login Persona Role:
                  </label>
                  <select
                    value={selectedOtpRole}
                    onChange={(e) => setSelectedOtpRole(e.target.value as UserRole)}
                    className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-xs font-bold focus:outline-none"
                  >
                    <option value="customer">🛒 Resident Customer (Priya Sharma)</option>
                    <option value="ops">🚚 Operations Staff (Ramesh Kumar)</option>
                    <option value="admin">⚙️ Mandi Governor & Admin (Amit Sharma)</option>
                    <option value="architect">📐 System Blueprint Architect</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-[#02341e] hover:bg-[#07472b] text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>{otpSent ? 'Verify & Sign In' : 'Send OTP Code'}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 text-center text-[11px] text-slate-500 font-medium">
          Taazi Tokari Platform • Lucknow Multi-Tenant Resident & Mandi Operations
        </div>
      </div>
    </div>
  );
};
