import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import Auth from './pages/Auth';
// Import the refactored version
import CBCGradingSystem from './components/CBCGrading/CBCGradingSystem';
import EDucoreLanding from './components/EDucore/EDucoreLanding2';
import Registration from './components/EDucore/RegistrationFull';
import SuperAdminDashboard from './components/EDucore/SuperAdminDashboard';

export default function App() {
  const { isAuthenticated, user, login, logout } = useAuth();
  const [entryView, setEntryView] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const v = params.get('view');
      return v || 'landing';
    } catch {
      return 'landing';
    }
  });
  
  // Load branding settings from localStorage
  const [brandingSettings, setBrandingSettings] = useState(() => {
    const savedLogo = localStorage.getItem('schoolLogo');
    const savedSchoolName = localStorage.getItem('schoolName');
    const savedFavicon = localStorage.getItem('schoolFavicon');
    const savedBrandColor = localStorage.getItem('brandColor');
    const savedWelcomeTitle = localStorage.getItem('welcomeTitle');
    const savedWelcomeMessage = localStorage.getItem('welcomeMessage');
    const savedOnboardingTitle = localStorage.getItem('onboardingTitle');
    const savedOnboardingMessage = localStorage.getItem('onboardingMessage');
    
    return {
      logoUrl: savedLogo || '/logo-zawadi.png',
      faviconUrl: savedFavicon || '/favicon.png',
      brandColor: savedBrandColor || '#1e3a8a',
      welcomeTitle: savedWelcomeTitle || 'Welcome to EDucore V1',
      welcomeMessage: savedWelcomeMessage || 'Unified education management for schools and institutions.',
      onboardingTitle: savedOnboardingTitle || 'Create Your EDucore Account',
      onboardingMessage: savedOnboardingMessage || 'Sign up to access powerful tools for managing learning and assessment.',
      schoolName: savedSchoolName || 'EDucore'
    };
  });

  // Update localStorage when branding settings change
  useEffect(() => {
    if (brandingSettings.logoUrl && brandingSettings.logoUrl !== '/logo-zawadi.png') {
      localStorage.setItem('schoolLogo', brandingSettings.logoUrl);
    }
    if (brandingSettings.schoolName) {
      localStorage.setItem('schoolName', brandingSettings.schoolName);
    }
    if (brandingSettings.faviconUrl && brandingSettings.faviconUrl !== '/favicon.png') {
      localStorage.setItem('schoolFavicon', brandingSettings.faviconUrl);
    }
  }, [brandingSettings]);

  // Update document favicon dynamically whenever brandingSettings.faviconUrl changes
  useEffect(() => {
    const setFavicon = (url) => {
      let link = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }

      if (!url) {
        link.href = '/favicon.png';
        return;
      }

      if (url.startsWith('data:')) {
        link.href = url;
      } else {
        // Add cache-busting query param for hosted URLs
        const sep = url.includes('?') ? '&' : '?';
        link.href = `${url}${sep}v=${Date.now()}`;
      }
    };

    setFavicon(brandingSettings.faviconUrl);
  }, [brandingSettings.faviconUrl]);

  useEffect(() => {
    let title = 'EDucore V1';
    if (!isAuthenticated) {
      if (entryView === 'landing') title = 'EDucore V1 — Home';
      else if (entryView === 'get-started') title = 'EDucore V1 — Get Started';
      else if (entryView === 'auth') title = 'EDucore V1 — Login';
    } else {
      if (entryView === 'superadmin') title = 'EDucore V1 — Super Admin';
      else title = `${(user && (user.school?.name || user.schoolName)) || brandingSettings.schoolName || 'EDucore V1'} — Dashboard`;
    }
    document.title = title;
  }, [isAuthenticated, entryView, user, brandingSettings.schoolName]);

  const handleAuthSuccess = (userData) => {
    // userData should contain: { email, name, role, id, firstName, lastName }
    // Token is already stored in localStorage by LoginForm
    const token = localStorage.getItem('token') || localStorage.getItem('authToken') || 'temp-token';
    login(userData, token);
    if (userData?.role === 'SUPER_ADMIN') {
      setEntryView('superadmin');
    } else {
      setEntryView('app');
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated) {
    if (entryView === 'landing') {
      return (
        <EDucoreLanding
          onLoginClick={() => setEntryView('auth')}
          onGetStartedClick={() => setEntryView('get-started')}
          isAuthenticated={false}
          onOpenAppClick={() => setEntryView('app')}
        />
      );
    }
    if (entryView === 'get-started') {
      return <Registration />;
    }
    return <Auth onAuthSuccess={handleAuthSuccess} brandingSettings={brandingSettings} />;
  }

  return (
    entryView === 'landing' ? (
      <EDucoreLanding
        onLoginClick={() => setEntryView('auth')}
        onGetStartedClick={() => setEntryView('get-started')}
        isAuthenticated={true}
        onOpenAppClick={() => setEntryView('app')}
      />
    ) : (
      entryView === 'get-started' ? (
        <Registration />
      ) : (
        entryView === 'superadmin' ? (
          <SuperAdminDashboard onLogout={handleLogout} />
        ) : (
          <CBCGradingSystem 
            user={user} 
            onLogout={handleLogout} 
            brandingSettings={brandingSettings} 
            setBrandingSettings={setBrandingSettings} 
          />
        )
      )
    )
  );
}
