import React, { useState, useEffect } from 'react';
import Auth from './pages/Auth';
// Import the refactored version
import CBCGradingSystem from './components/CBCGrading/CBCGradingSystem';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Load branding settings from localStorage
  const [brandingSettings, setBrandingSettings] = useState(() => {
    const savedLogo = localStorage.getItem('schoolLogo');
    const savedSchoolName = localStorage.getItem('schoolName');
    const savedFavicon = localStorage.getItem('schoolFavicon');
    
    return {
      logoUrl: savedLogo || '/logo-zawadi.png',
      faviconUrl: savedFavicon || '/favicon.png',
      brandColor: '#1e3a8a', // blue-900
      welcomeTitle: 'Welcome to Zawadi JRN Academy',
      welcomeMessage: 'Empowering education through innovative learning management.',
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

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccess} brandingSettings={brandingSettings} />;
  }

  return (
    <CBCGradingSystem 
      user={currentUser} 
      onLogout={handleLogout} 
      brandingSettings={brandingSettings} 
      setBrandingSettings={setBrandingSettings} 
    />
  );
}
