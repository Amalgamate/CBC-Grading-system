import React, { useEffect, useState } from 'react';

/**
 * Mobile Splash/Loading Screen
 * Shows while app initializes
 */
export default function SplashScreen({ isLoading = true }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      // Fade out when loading is complete
      const timer = setTimeout(() => setFadeOut(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (fadeOut) return null;

  return (
    <div
      className={`fixed inset-0 bg-gradient-to-b from-teal-600 to-teal-700 flex flex-col items-center justify-center z-[9999] transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
      }}
    >
      {/* EDucore Logo */}
      <div className="mb-8">
        <img
          src="/logo-educore.png"
          alt="EDucore"
          className="h-24 w-24 object-contain drop-shadow-lg"
        />
      </div>

      {/* App Name */}
      <h1 className="text-4xl font-bold text-white mb-12 tracking-wider">
        EDucore
      </h1>

      {/* Loading Spinner */}
      <div className="relative w-12 h-12 mb-8">
        <div
          className="absolute inset-0 rounded-full border-4 border-white border-opacity-30"
          style={{
            animation: 'spin 1s linear infinite',
          }}
        />
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-white"
          style={{
            animation: 'spin 1s linear infinite',
          }}
        />
      </div>

      {/* Loading Text */}
      <p className="text-white text-sm tracking-widest">LOADING...</p>

      {/* Spinner Animation */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
