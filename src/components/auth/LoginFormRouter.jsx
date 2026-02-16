import React, { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import LoginFormMobile from './LoginFormMobile';

export default function LoginFormRouter({ onSwitchToRegister, onSwitchToForgotPassword, onLoginSuccess, brandingSettings, deviceIsMobile }) {
  const [isMobile, setIsMobile] = useState(deviceIsMobile ?? window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    console.log(`[LoginFormRouter] Initialized: ${isMobile ? 'MOBILE' : 'DESKTOP'} (${window.innerWidth}px)`);
  }, [isMobile]);

  if (isMobile) {
    return (
      <LoginFormMobile
        onSwitchToRegister={onSwitchToRegister}
        onSwitchToForgotPassword={onSwitchToForgotPassword}
        onLoginSuccess={onLoginSuccess}
        brandingSettings={brandingSettings}
      />
    );
  }

  return (
    <LoginForm
      onSwitchToRegister={onSwitchToRegister}
      onSwitchToForgotPassword={onSwitchToForgotPassword}
      onLoginSuccess={onLoginSuccess}
      brandingSettings={brandingSettings}
    />
  );
}
