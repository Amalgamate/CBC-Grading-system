import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function WelcomeScreen({ user, onGetStarted, brandingSettings }) {
  return (
    <div
      className="w-full h-screen flex items-center justify-center"
      style={{ backgroundColor: brandingSettings?.brandColor || '#1e3a8a' }}
    >
      {/* Simple centered content */}
      <div className="text-center px-6 max-w-2xl">
        {/* Logo */}
        <img
          src={brandingSettings?.logoUrl || '/logo-zawadi.png'}
          alt="School Logo"
          className="w-24 h-24 object-contain mx-auto mb-6"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/logo-zawadi.png';
          }}
        />

        {/* Success Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-6 shadow-lg">
          <CheckCircle className="text-green-500" size={40} />
        </div>

        {/* Welcome Message */}
        <h1 className="text-4xl font-bold text-white mb-3">
          Welcome, {user?.name || 'User'}!
        </h1>
        <p className="text-xl text-blue-100 mb-8">
          Your account has been successfully created
        </p>

        {/* Get Started Button */}
        <button
          onClick={onGetStarted}
          className="inline-flex items-center gap-3 bg-white text-blue-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
        >
          Get Started
          <ArrowRight size={24} />
        </button>

        {/* Footer */}
        <p className="text-blue-100 text-sm mt-8">
          © 2025 {brandingSettings?.schoolName || 'Zawadi JRN Academy'}
        </p>
      </div>
    </div>
  );
}
