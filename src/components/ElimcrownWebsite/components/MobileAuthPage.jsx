import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * MobileAuthPage Component
 * Simplified, mobile-first authentication interface
 * Easy login/logout for all user roles on mobile devices
 * 
 * Features:
 * - Minimal UI, maximum clarity
 * - Large touch targets (48px+)
 * - One-field-at-a-time on mobile
 * - Clear feedback and error states
 * - Fast logout with confirmation
 */
export const MobileAuthPage = ({
  mode = 'login', // 'login' | 'logout' | 'register'
  school,
  user,
  onSubmit,
  onLogout,
  onBack,
  loading = false,
  error = null,
  success = null
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (touched.email) {
      validateEmail(e.target.value);
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (touched.password) {
      validatePassword(e.target.value);
    }
  };

  const validateEmail = (value) => {
    if (!value) {
      setFieldErrors(prev => ({ ...prev, email: 'Email is required' }));
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setFieldErrors(prev => ({ ...prev, email: 'Invalid email format' }));
      return false;
    }
    setFieldErrors(prev => ({ ...prev, email: null }));
    return true;
  };

  const validatePassword = (value) => {
    if (!value) {
      setFieldErrors(prev => ({ ...prev, password: 'Password is required' }));
      return false;
    }
    if (value.length < 6) {
      setFieldErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
      return false;
    }
    setFieldErrors(prev => ({ ...prev, password: null }));
    return true;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'email') validateEmail(email);
    if (field === 'password') validatePassword(password);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const emailValid = validateEmail(email);
    const passwordValid = validatePassword(password);
    
    if (emailValid && passwordValid) {
      onSubmit?.({ email, password });
    }
  };

  const handleLogoutClick = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout?.();
    }
  };

  // ========== LOGIN MODE ==========
  if (mode === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#520050] to-[#3D0038] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 flex items-center justify-between">
          {onBack && (
            <button
              onClick={onBack}
              className="p-3 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-white" strokeWidth={2} />
            </button>
          )}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-xl sm:text-2xl font-bold text-white text-center">
              {school?.name || 'Elimcrown'}
            </h1>
            <p className="text-xs sm:text-sm text-white/60 text-center mt-1">Login to access dashboard</p>
          </div>
          <div className="w-10"></div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
            
            {/* Error Alert */}
            {error && (
              <div className="flex gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {/* Success Alert */}
            {success && (
              <div className="flex gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-sm text-green-700">{success}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-900">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400 pointer-events-none" strokeWidth={2} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={() => handleBlur('email')}
                    placeholder="your@email.com"
                    className={`w-full pl-12 pr-4 py-3 sm:py-4 rounded-lg border-2 text-base focus:outline-none transition-colors ${
                      touched.email && fieldErrors.email
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200 focus:border-[#520050]'
                    }`}
                  />
                </div>
                {touched.email && fieldErrors.email && (
                  <p className="text-xs sm:text-sm text-red-600">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-900">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-400 pointer-events-none" strokeWidth={2} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={() => handleBlur('password')}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-12 py-3 sm:py-4 rounded-lg border-2 text-base focus:outline-none transition-colors ${
                      touched.password && fieldErrors.password
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200 focus:border-[#520050]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff size={20} strokeWidth={2} />
                    ) : (
                      <Eye size={20} strokeWidth={2} />
                    )}
                  </button>
                </div>
                {touched.password && fieldErrors.password && (
                  <p className="text-xs sm:text-sm text-red-600">{fieldErrors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 sm:py-4 rounded-lg bg-[#520050] hover:bg-[#3D0038] disabled:bg-gray-300 text-white font-semibold transition-colors text-base"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            {/* Footer Links */}
            <div className="pt-4 border-t border-gray-200 space-y-3 text-center">
              <button className="text-sm text-[#520050] hover:underline font-medium">
                Forgot password?
              </button>
              <p className="text-xs text-gray-600">
                Don't have an account?{' '}
                <button className="text-[#520050] hover:underline font-semibold">
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 text-center text-xs text-white/50">
          Secure platform • Enterprise-grade authentication
        </div>
      </div>
    );
  }

  // ========== LOGOUT MODE ==========
  if (mode === 'logout') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#520050] to-[#3D0038] flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 sm:p-8 space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-yellow-100 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-600" strokeWidth={2} />
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Are you sure?
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              You are about to logout from your {school?.name || 'School'} account.
            </p>
            {user && (
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-700">
                  Logged in as: <strong>{user.email}</strong>
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Role: <strong>{user.role}</strong>
                </p>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleLogoutClick}
              className="w-full py-3 sm:py-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors text-base"
            >
              Yes, Logout
            </button>
            <button
              onClick={onBack}
              className="w-full py-3 sm:py-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 text-gray-900 font-semibold transition-colors text-base"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MobileAuthPage;
