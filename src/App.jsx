import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import Auth from './pages/Auth';
// Import the refactored version
import CBCGradingSystem from './components/CBCGrading/CBCGradingSystem';

export default function App() {
  const { isAuthenticated, user, login, logout } = useAuth();
  
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
      welcomeTitle: savedWelcomeTitle || 'Welcome to Zawadi JRN Academy',
      welcomeMessage: savedWelcomeMessage || 'Empowering education through innovative learning management.',
      onboardingTitle: savedOnboardingTitle || 'Join Our Community',
      onboardingMessage: savedOnboardingMessage || 'Start your journey with us today. Create an account to access powerful tools for managing learning and assessment with ease.',
      schoolName: savedSchoolName || 'Zawadi JRN'
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

  const handleAuthSuccess = (userData) => {
    // userData should contain: { email, name, role, id, firstName, lastName }
    // Token is already stored in localStorage by LoginForm
    const token = localStorage.getItem('token') || localStorage.getItem('authToken') || 'temp-token';
    login(userData, token);
  };

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccess} brandingSettings={brandingSettings} />;
  }

  return (
    <CBCGradingSystem 
      user={user} 
      onLogout={handleLogout} 
      brandingSettings={brandingSettings} 
      setBrandingSettings={setBrandingSettings} 
    />
  );
}
