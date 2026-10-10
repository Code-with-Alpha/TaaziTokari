import React, { useState, useEffect } from 'react';
import { ResidentApp, ResidentTab } from './components/ResidentApp';
import { OpsApp, OpsTab } from './components/OpsApp';
import { AdminConsole, AdminView } from './components/AdminConsole';
import { ArchitectBlueprintEngine } from './components/ArchitectBlueprintEngine';
import { TaaziTokariEmblem } from './components/BrandLogo';
import { AuthModal, UserRole, MOCK_USERS } from './components/AuthModal';
import { hasPermission, getAccessiblePortals } from './services/rbacService';
import { dataStore, AuditLogRecord } from './services/dataStore';

export default function App() {
  const [activeRole, setActiveRole] = useState<UserRole>('customer');
  const [residentTab, setResidentTab] = useState<ResidentTab>('shop');
  const [opsTab, setOpsTab] = useState<OpsTab>('pack');
  const [adminView, setAdminView] = useState<AdminView>('catalogue-inventory');
  const [showGallery, setShowGallery] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);

  useEffect(() => {
    setAuditLogs(dataStore.getAuditLogs());
  }, [activeRole]);

  const currentUser = MOCK_USERS[activeRole];

  const handleRoleSelect = (role: UserRole) => {
    setActiveRole(role);
    setShowGallery(false);
    dataStore.addAuditLog({
      action: 'USER_ROLE_SWITCHED',
      entity: `Role: ${role.toUpperCase()}`,
      actor: MOCK_USERS[role].name,
      details: `Switched active portal view to ${role.toUpperCase()}`,
    });
  };

  const isRoleAuthorized = (roleToCheck: UserRole) => {
    if (activeRole === 'admin') return true;
    return activeRole === roleToCheck;
  };

  return (
    <div className="min-h-screen bg-[#f2fcf1] text-[#151e17] flex flex-col font-sans">
      {/* 1. TOP ANNOUNCEMENT TICKER */}
      <div className="bg-[#031d10] text-[#bdeecd] px-4 py-1.5 text-xs font-semibold flex items-center justify-between border-b border-[#1e4b33]">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="w-2 h-2 rounded-full bg-[#f4a62a] animate-pulse shrink-0" />
          <span className="truncate">
            🌾 <strong className="text-white">Taazi Tokari Lucknow:</strong> Morning Batch Cut-off
            is active! Place orders before 10:00 PM for 6:00 AM Fresh Doorstep Delivery.
          </span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-[11px] text-[#8bba9b] shrink-0 font-medium">
          <span>📍 Hub: Gomti Nagar Phase 2 (#LKO-24)</span>
          <span>📞 Support: +91 98765 43210</span>
        </div>
      </div>

      {/* 2. MAIN BRAND HEADER & NAV */}
      <header className="bg-[#072917] text-white sticky top-0 z-40 shadow-xl border-b border-[#18482d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveRole('customer'); setShowGallery(false); }}>
            <TaaziTokariEmblem size={44} className="drop-shadow-md hover:scale-105 transition-transform" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline-md text-xl font-bold tracking-tight text-white">
                  Taazi Tokari
                </span>
                <span className="bg-[#f4a62a] text-[#072917] text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Kishan Fresh
                </span>
              </div>
              <p className="text-[11px] text-[#8bba9b] font-medium hidden sm:block">
                Farm-to-Kitchen Society Produce • Lucknow
              </p>
            </div>
          </div>

          {/* Main Mode Navigation (Customer / Ops / Admin / Blueprint) */}
          <div className="hidden lg:flex items-center bg-[#031d10] p-1 rounded-2xl border border-[#18482d] gap-1">
            <button
              onClick={() => { setActiveRole('customer'); setShowGallery(false); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeRole === 'customer' && !showGallery
                  ? 'bg-[#f4a62a] text-[#072917] shadow-md'
                  : 'text-[#8bba9b] hover:text-white hover:bg-[#0c3920]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
              <span>Customer Shop</span>
            </button>

            <button
              onClick={() => { setActiveRole('ops'); setShowGallery(false); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeRole === 'ops' && !showGallery
                  ? 'bg-[#f4a62a] text-[#072917] shadow-md'
                  : 'text-[#8bba9b] hover:text-white hover:bg-[#0c3920]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">local_shipping</span>
              <span>Field & Warehouse Ops</span>
            </button>

            <button
              onClick={() => { setActiveRole('admin'); setShowGallery(false); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeRole === 'admin' && !showGallery
                  ? 'bg-[#bdeecd] text-[#002111] shadow-md'
                  : 'text-[#8bba9b] hover:text-white hover:bg-[#0c3920]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
              <span>Admin Console</span>
            </button>

            <button
              onClick={() => { setActiveRole('architect'); setShowGallery(false); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeRole === 'architect' && !showGallery
                  ? 'bg-[#f4a62a] text-[#072917] shadow-md'
                  : 'text-[#8bba9b] hover:text-white hover:bg-[#0c3920]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">architecture</span>
              <span>Architect Engine</span>
            </button>

            <button
              onClick={() => setShowGallery(!showGallery)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                showGallery
                  ? 'bg-white text-[#072917] shadow-md'
                  : 'text-[#8bba9b] hover:text-white hover:bg-[#0c3920]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
              <span>All Screens Gallery</span>
            </button>
          </div>

          {/* User Sign In / Role Switch Pill Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-[#0e3b23] hover:bg-[#155030] border border-[#236841] text-white p-1.5 sm:pl-2.5 sm:pr-3 rounded-2xl flex items-center gap-2.5 transition-all shadow-md group"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-[#f4a62a]"
              />
              <div className="text-left hidden sm:block">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-extrabold text-white group-hover:text-[#f4a62a] transition-colors">
                    {currentUser.name}
                  </span>
                  <span className="material-symbols-outlined text-[14px] text-[#8bba9b]">
                    expand_more
                  </span>
                </div>
                <span className="text-[10px] text-[#8bba9b] font-semibold block capitalize">
                  🔑 {currentUser.badge}
                </span>
              </div>
              <span className="bg-[#f4a62a] text-[#072917] text-[10px] font-black px-2 py-1 rounded-xl uppercase tracking-wider hidden md:inline">
                Switch Role / Sign In
              </span>
            </button>
          </div>
        </div>

        {/* SUB-NAVIGATIONAL BAR DEPENDING ON ACTIVE ROLE */}
        {!showGallery && (
          <div className="bg-[#031d10] border-t border-[#124b2f] px-4 py-2">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
              {/* Customer Sub-Nav */}
              {activeRole === 'customer' && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#8bba9b] uppercase tracking-wider mr-2 hidden md:inline">
                    Resident Portal:
                  </span>
                  <button
                    onClick={() => setResidentTab('shop')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                      residentTab === 'shop'
                        ? 'bg-[#f4a62a] text-[#072917]'
                        : 'text-[#e9f4e8] hover:bg-[#124b2f]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">storefront</span>
                    <span>Fresh Vegetables & Fruits</span>
                  </button>
                  <button
                    onClick={() => setResidentTab('health')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                      residentTab === 'health'
                        ? 'bg-[#f4a62a] text-[#072917]'
                        : 'text-[#e9f4e8] hover:bg-[#124b2f]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">sanitizer</span>
                    <span>Kitchen Health Kits</span>
                  </button>
                  <button
                    onClick={() => setResidentTab('rewards')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                      residentTab === 'rewards'
                        ? 'bg-[#f4a62a] text-[#072917]'
                        : 'text-[#e9f4e8] hover:bg-[#124b2f]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">monetization_on</span>
                    <span>Sikka Rewards & Ledger</span>
                  </button>
                </div>
              )}

              {/* Ops Sub-Nav */}
              {activeRole === 'ops' && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#8bba9b] uppercase tracking-wider mr-2 hidden md:inline">
                    Operations Hub:
                  </span>
                  <button
                    onClick={() => setOpsTab('pack')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                      opsTab === 'pack'
                        ? 'bg-[#f4a62a] text-[#072917]'
                        : 'text-[#e9f4e8] hover:bg-[#124b2f]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">inventory_2</span>
                    <span>Crate Packing Station</span>
                  </button>
                  <button
                    onClick={() => setOpsTab('deliver')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                      opsTab === 'deliver'
                        ? 'bg-[#f4a62a] text-[#072917]'
                        : 'text-[#e9f4e8] hover:bg-[#124b2f]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">directions_run</span>
                    <span>Tower Delivery Sequence</span>
                  </button>
                  <button
                    onClick={() => setOpsTab('procure')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                      opsTab === 'procure'
                        ? 'bg-[#f4a62a] text-[#072917]'
                        : 'text-[#e9f4e8] hover:bg-[#124b2f]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">agriculture</span>
                    <span>Dawn Mandi Procurement</span>
                  </button>
                </div>
              )}

              {/* Admin Sub-Nav */}
              {activeRole === 'admin' && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#bdeecd] uppercase tracking-wider mr-2 hidden md:inline">
                    Admin Modules:
                  </span>
                  <button
                    onClick={() => setAdminView('catalogue-inventory')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                      adminView === 'catalogue-inventory'
                        ? 'bg-[#bdeecd] text-[#002111]'
                        : 'text-[#e9f4e8] hover:bg-[#124b2f]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">list_alt</span>
                    <span>Catalogue & Stock</span>
                  </button>
                  <button
                    onClick={() => setAdminView('daily-mandi-rate-manipulation')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                      adminView === 'daily-mandi-rate-manipulation'
                        ? 'bg-[#bdeecd] text-[#002111]'
                        : 'text-[#e9f4e8] hover:bg-[#124b2f]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">trending_up</span>
                    <span>Daily Mandi Rates</span>
                  </button>
                  <button
                    onClick={() => setAdminView('payment-gateway-settlement')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                      adminView === 'payment-gateway-settlement'
                        ? 'bg-[#bdeecd] text-[#002111]'
                        : 'text-[#e9f4e8] hover:bg-[#124b2f]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">account_balance_wallet</span>
                    <span>Payments & Ledger</span>
                  </button>
                </div>
              )}

              {/* Mobile Quick Role Switch Buttons */}
              <div className="flex lg:hidden items-center gap-1 shrink-0 ml-auto">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-2.5 py-1 bg-[#f4a62a] text-[#072917] rounded-lg text-[11px] font-extrabold"
                >
                  Switch Role
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 3. MAIN PORTAL CONTENT AREA */}
      <main className="flex-1">
        {showGallery ? (
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-8 flex flex-col gap-10">
            {/* Gallery Header Banner */}
            <div className="bg-white rounded-3xl p-6 border border-[#dbe5da] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <TaaziTokariEmblem size={96} className="shrink-0 drop-shadow-sm" />
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#835400]">
                    Complete Multi-Surface Platform • Lucknow Pilot (#LKO-24)
                  </span>
                  <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-[#02341e] mt-1">
                    Taazi Tokari — Kishan Fresh to Kitchen
                  </h1>
                  <p className="text-sm text-[#414943] mt-1 max-w-2xl">
                    Explore all 6 mobile & desktop interfaces side-by-side. Use the header "Sign In / Switch Role" button to test Customer, Ops, Admin, or Blueprint engine in full interactive mode.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  onClick={() => { setActiveRole('admin'); setShowGallery(false); }}
                  className="px-4 py-2.5 rounded-xl bg-[#0b3b24] text-white font-bold text-xs flex items-center gap-1.5 hover:bg-[#124b2f] transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">desktop_windows</span>
                  <span>Launch Admin Console</span>
                </button>
              </div>
            </div>

            {/* Section 1: Resident Mobile Screens */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-headline-md text-xl font-bold text-[#02341e]">
                  Resident App Screens (Taazi Tokari Fresh • Lucknow)
                </h2>
                <span className="text-xs font-semibold text-[#414943]">
                  Interactive Live Previews
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#414943] mb-2 px-2">
                    Screen 1 • Morning Batch Shop
                  </div>
                  <ResidentApp
                    activeTab="shop"
                    setActiveTab={(t) => { setResidentTab(t); setActiveRole('customer'); setShowGallery(false); }}
                    embeddedMode
                  />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#414943] mb-2 px-2">
                    Screen 2 • Kitchen Health & Curated Baskets
                  </div>
                  <ResidentApp
                    activeTab="health"
                    setActiveTab={(t) => { setResidentTab(t); setActiveRole('customer'); setShowGallery(false); }}
                    embeddedMode
                  />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#414943] mb-2 px-2">
                    Screen 3 • Savings & Sikka Rewards Ledger
                  </div>
                  <ResidentApp
                    activeTab="rewards"
                    setActiveTab={(t) => { setResidentTab(t); setActiveRole('customer'); setShowGallery(false); }}
                    embeddedMode
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Ops Screens */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-headline-md text-xl font-bold text-[#02341e]">
                  Warehouse & Field Ops Screens (Taazi Tokari)
                </h2>
                <span className="text-xs font-semibold text-[#414943]">
                  Interactive Handheld Terminal Previews
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#414943] mb-2 px-2">
                    Screen 4 • Station #3 Crate Packing
                  </div>
                  <OpsApp
                    activeTab="pack"
                    setActiveTab={(t) => { setOpsTab(t); setActiveRole('ops'); setShowGallery(false); }}
                    embeddedMode
                  />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#414943] mb-2 px-2">
                    Screen 5 • Tower B Lift Sequence Delivery
                  </div>
                  <OpsApp
                    activeTab="deliver"
                    setActiveTab={(t) => { setOpsTab(t); setActiveRole('ops'); setShowGallery(false); }}
                    embeddedMode
                  />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#414943] mb-2 px-2">
                    Screen 6 • Dawn Mandi Procurement
                  </div>
                  <OpsApp
                    activeTab="procure"
                    setActiveTab={(t) => { setOpsTab(t); setActiveRole('ops'); setShowGallery(false); }}
                    embeddedMode
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {activeRole === 'customer' && (
              <div className="py-4 sm:py-6 px-0 sm:px-4">
                <ResidentApp activeTab={residentTab} setActiveTab={setResidentTab} />
              </div>
            )}

            {activeRole === 'ops' && (
              <div className="py-4 sm:py-6 px-0 sm:px-4">
                <OpsApp
                  activeTab={opsTab}
                  setActiveTab={setOpsTab}
                  onSwitchWorkspace={() => { setActiveRole('admin'); setAdminView('catalogue-inventory'); }}
                />
              </div>
            )}

            {activeRole === 'admin' && (
              <AdminConsole activeView={adminView} setActiveView={setAdminView} />
            )}

            {activeRole === 'architect' && (
              <ArchitectBlueprintEngine />
            )}
          </>
        )}
      </main>

      {/* 4. FOOTER */}
      <footer className="bg-[#031d10] text-[#8bba9b] border-t border-[#124b2f] py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <TaaziTokariEmblem size={36} />
            <div>
              <p className="text-sm font-bold text-white">Taazi Tokari — Kishan Fresh to Kitchen</p>
              <p className="text-xs text-[#8bba9b]">Residential Society Produce Pre-ordering • Mandi Procurement System</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <button onClick={() => { setActiveRole('customer'); setResidentTab('shop'); }} className="hover:text-white transition-colors">🛒 Customer Shop</button>
            <button onClick={() => { setActiveRole('ops'); setOpsTab('pack'); }} className="hover:text-white transition-colors">🚚 Ops Hub</button>
            <button onClick={() => { setActiveRole('admin'); setAdminView('catalogue-inventory'); }} className="hover:text-white transition-colors">⚙️ Admin Console</button>
            <button onClick={() => { setActiveRole('architect'); }} className="hover:text-white transition-colors">📐 Architecture Specs</button>
            <button onClick={() => setIsAuthModalOpen(true)} className="text-[#f4a62a] hover:underline font-bold">🔑 Sign In / Switch Account</button>
          </div>
          <p className="text-[11px] text-[#527d63]">© 2026 Taazi Tokari Technologies. Lucknow Pilot (#LKO-24).</p>
        </div>
      </footer>

      {/* 5. SIGN IN / ROLE SWITCHER MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentRole={activeRole}
        onSelectRole={handleRoleSelect}
      />
    </div>
  );
}
