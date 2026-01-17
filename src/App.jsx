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
    
    return {
      logoUrl: savedLogo || '/logo-zawadi.png',
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
  }, [brandingSettings]);

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
