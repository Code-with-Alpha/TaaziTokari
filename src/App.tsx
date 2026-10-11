// ==============================================================================
// TAAZI TOKARI (ताज़ी टोकरी) - APPLICATION ROOT ROUTER & ORCHESTRATOR
// Clean, single-navbar per portal architecture. Protected Admin Control Center,
// Google OAuth & Session Restoration, First-Run Location Selection, and Persistent Store.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { CustomerPortal } from './components/customer/CustomerPortal';
import { AdminPortal } from './components/admin/AdminPortal';
import { LocationModal } from './components/location/LocationModal';
import { AuthModal } from './components/auth/AuthModal';
import { UserProfile, CustomerAddress, appStore } from './services/store';
import { authService } from './services/supabase';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(appStore.getCurrentUser());
  const [activePortal, setActivePortal] = useState<'customer' | 'admin'>('customer');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<CustomerAddress | null>(appStore.getActiveAddress());

  // Restore authenticated session on boot
  useEffect(() => {
    authService.initSession().then((user) => {
      setCurrentUser(user);
    });

    // Check if location setup is done. If not, introduce location modal on first open
    if (!appStore.isLocationSetupDone()) {
      setIsLocationModalOpen(true);
    }
  }, []);

  // Handle successful login or registration
  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    // If authenticated as admin, offer direct route to admin console
    if (user.role === 'admin') {
      setActivePortal('admin');
    } else {
      setActivePortal('customer');
    }
  };

  // Handle logout
  const handleSignOut = () => {
    authService.signOut();
    setCurrentUser(null);
    setActivePortal('customer');
  };

  // Switch to admin portal safely
  const handleSwitchToAdmin = () => {
    if (currentUser?.role === 'admin') {
      setActivePortal('admin');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] text-[#151e17] flex flex-col font-sans">
      {/* 1. PORTAL ROUTING */}
      {activePortal === 'admin' && currentUser?.role === 'admin' ? (
        <AdminPortal
          currentUser={currentUser}
          onSwitchToCustomer={() => setActivePortal('customer')}
          onSignOut={handleSignOut}
        />
      ) : (
        <CustomerPortal
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenLocation={() => setIsLocationModalOpen(true)}
          onSwitchToAdmin={currentUser?.role === 'admin' ? handleSwitchToAdmin : undefined}
          onSignOut={handleSignOut}
        />
      )}

      {/* 2. LOCATION & SERVICEABILITY MODAL */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentAddress={currentAddress}
        onAddressSelected={(addr) => {
          setCurrentAddress(addr);
          appStore.setActiveAddress(addr);
        }}
      />

      {/* 3. AUTHENTICATION & REGISTRATION MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
