import React, { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';
import EmailVerificationForm from '../components/auth/EmailVerificationForm';
import WelcomeScreen from '../components/auth/WelcomeScreen';

export default function Auth({ onAuthSuccess, brandingSettings }) {
  const [currentView, setCurrentView] = useState('login'); // login, register, forgot-password, reset-password, verify-email, welcome
  const [userData, setUserData] = useState(null);

  const handleLoginSuccess = (user) => {
    setUserData(user);
    onAuthSuccess(user);
  };

  const handleRegisterSuccess = (user) => {
    setUserData(user);
    setCurrentView('verify-email');
  };

  const handleVerifySuccess = () => {
    setCurrentView('welcome');
  };

  const handleResetSuccess = () => {
    setCurrentView('login');
    // Show success toast
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50';
    toast.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span>Password reset successful! Please sign in.</span>';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const handleGetStarted = () => {
    onAuthSuccess(userData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full flex items-center justify-center">
        {currentView === 'login' && (
          <LoginForm
            onSwitchToRegister={() => setCurrentView('register')}
            onSwitchToForgotPassword={() => setCurrentView('forgot-password')}
            onLoginSuccess={handleLoginSuccess}
            brandingSettings={brandingSettings}
          />
        )}

        {currentView === 'register' && (
          <RegisterForm
            onSwitchToLogin={() => setCurrentView('login')}
            onRegisterSuccess={handleRegisterSuccess}
          />
        )}

        {currentView === 'forgot-password' && (
          <ForgotPasswordForm
            onSwitchToLogin={() => setCurrentView('login')}
          />
        )}

        {currentView === 'reset-password' && (
          <ResetPasswordForm
            onResetSuccess={handleResetSuccess}
          />
        )}

        {currentView === 'verify-email' && (
          <EmailVerificationForm
            email={userData?.email}
            onVerifySuccess={handleVerifySuccess}
          />
        )}

        {currentView === 'welcome' && (
          <WelcomeScreen
            user={userData}
            onGetStarted={handleGetStarted}
          />
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-sm text-gray-600 z-10">
        <p>© 2025 Zawadi JRN Academy. All rights reserved.</p>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
