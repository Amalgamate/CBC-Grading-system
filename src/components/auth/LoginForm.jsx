import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { authAPI, API_BASE_URL } from '../../services/api';
import { setAdminSchoolId, setBranchId } from '../../services/tenantContext';
import OTPVerificationForm from './OTPVerificationForm';

export default function LoginForm({ onSwitchToRegister, onSwitchToForgotPassword, onLoginSuccess, brandingSettings }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
    skipOTP: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [branchOptions, setBranchOptions] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');

  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [pendingUserData, setPendingUserData] = useState(null);

  const assignFirstAvailableSchoolForSuperAdmin = async ({ token, userData }) => {
    // Only applies when SUPER_ADMIN has no schoolId.
    if (!token) return { schoolId: '', userData };
    if (userData?.role !== 'SUPER_ADMIN') return { schoolId: userData?.schoolId || '', userData };
    if (userData?.schoolId) return { schoolId: userData.schoolId, userData };

    try {
      const schoolsResponse = await fetch(`${API_BASE_URL}/admin/schools`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const schoolsData = await schoolsResponse.json();

      if (schoolsData?.data && schoolsData.data.length > 0) {
        const firstSchool = schoolsData.data.find((s) => s.active) || schoolsData.data[0];
        const sid = firstSchool?.id || '';
        if (sid) {
          const updatedUserData = {
            ...userData,
            schoolId: sid,
            school: firstSchool,
          };
          console.log('✅ Super Admin auto-assigned to school:', firstSchool.name);
          return { schoolId: sid, userData: updatedUserData };
        }
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch schools for Super Admin:', error);
    }

    return { schoolId: '', userData };
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Step 1: Validate credentials
      const credentialsData = await authAPI.login({
        email: formData.email,
        password: formData.password,
      });

      // Check if user wants to skip OTP
      if (formData.skipOTP) {
        // Direct login without OTP verification
        if (credentialsData.token) {
          localStorage.setItem('token', credentialsData.token);
          if (formData.rememberMe) {
            localStorage.setItem('authToken', credentialsData.token);
          }
        }

        let userData = {
          email: credentialsData.user.email,
          name: `${credentialsData.user.firstName} ${credentialsData.user.lastName}`,
          role: credentialsData.user.role,
          id: credentialsData.user.id,
          firstName: credentialsData.user.firstName,
          lastName: credentialsData.user.lastName,
          schoolId: credentialsData.user.schoolId || credentialsData.user.school?.id || null,
          branchId: credentialsData.user.branchId || credentialsData.user.branch?.id || null,
          school: credentialsData.user.school || null,
          branch: credentialsData.user.branch || null
        };

        // Persist tenancy context
        let sid = credentialsData.user.schoolId || credentialsData.user.school?.id || '';
        const bid = credentialsData.user.branchId || credentialsData.user.branch?.id || '';

        if (sid) setAdminSchoolId(sid);
        if (bid) setBranchId(bid);

        onLoginSuccess(userData);
        return;
      }

      // Step 2: Send OTP to phone (if not skipping)
      try {
        await authAPI.sendOTP({
          email: formData.email
        });

        // Store pending user data for OTP verification
        setPendingUserData({
          email: formData.email,
          phone: credentialsData.user?.phone || '+254XXXXXXXX',
          user: credentialsData.user,
          token: credentialsData.token
        });

        // Show OTP verification screen
        setShowOTPVerification(true);
        setErrors({});
      } catch (otpError) {
        // If OTP fails but credentials are valid, show the error but keep form
        setErrors({
          form: otpError.message || 'Failed to send OTP. Please try again.'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        email: error.message || 'Invalid email or password',
        password: error.message || 'Invalid email or password'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsSuperAdmin = async () => {
    setIsLoading(true);
    setErrors({});
    try {
      const email = 'superadmin@local.test';
      const password = process.env.REACT_APP_SUPER_ADMIN_PASSWORD || 'ChangeMeNow123!';
      const data = await authAPI.login({ email, password });

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('authToken', data.token);
      }

      let userData = {
        email: data.user.email,
        name: `${data.user.firstName} ${data.user.lastName}`,
        role: data.user.role,
        id: data.user.id,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        schoolId: data.user.schoolId || data.user.school?.id || null,
        branchId: data.user.branchId || data.user.branch?.id || null,
        school: data.user.school || null,
        branch: data.user.branch || null
      };

      // SUPER_ADMIN: Auto-assign first available school for switching UX.
      let sid = data.user.schoolId || data.user.school?.id || '';
      if (!sid) {
        const assigned = await assignFirstAvailableSchoolForSuperAdmin({ token: data.token, userData });
        sid = assigned.schoolId || sid;
        userData = assigned.userData || userData;
      }

      if (sid) setAdminSchoolId(sid);

      onLoginSuccess(userData);
    } catch (error) {
      setErrors({
        email: error.message || 'Login failed',
        password: error.message || 'Login failed'
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }


  };

  const handleOTPVerifySuccess = async (userData) => {
    // Complete the login flow with the OTP-verified user
    if (pendingUserData?.token) {
      localStorage.setItem('token', pendingUserData.token);
      if (formData.rememberMe) {
        localStorage.setItem('authToken', pendingUserData.token);
      }
    }

    let loginUserData = {
      email: pendingUserData.user.email,
      name: `${pendingUserData.user.firstName} ${pendingUserData.user.lastName}`,
      role: pendingUserData.user.role,
      id: pendingUserData.user.id,
      firstName: pendingUserData.user.firstName,
      lastName: pendingUserData.user.lastName,
      schoolId: pendingUserData.user.schoolId || pendingUserData.user.school?.id || null,
      branchId: pendingUserData.user.branchId || pendingUserData.user.branch?.id || null,
      school: pendingUserData.user.school || null,
      branch: pendingUserData.user.branch || null
    };

    // Persist tenancy context
    let sid = pendingUserData.user.schoolId || pendingUserData.user.school?.id || '';
    const bid = pendingUserData.user.branchId || pendingUserData.user.branch?.id || '';

    if (sid) setAdminSchoolId(sid);
    if (bid) setBranchId(bid);

    onLoginSuccess(loginUserData);
  };

  const handleBackToLogin = () => {
    setShowOTPVerification(false);
    setPendingUserData(null);
    setErrors({});
  };

  return (
    <div className="w-full h-screen bg-white">
      {/* Main Layout Container */}
      <div className="bg-white h-full flex flex-col lg:flex-row items-stretch">

        {/* Left Column - Branding Area */}
        <div
          className="w-full lg:w-1/2 h-full p-8 lg:p-16 flex flex-col justify-between items-center text-white relative bg-gradient-to-br from-blue-800 to-indigo-800"
        >
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex items-center justify-center relative z-10">
            <div className="max-w-md text-center">
              {/* Logo */}
              <div className="mb-8 sm:mb-10">
                <img
                  src={brandingSettings?.logoUrl || '/logo-zawadi.png'}
                  alt="EDucore Logo"
                  className="w-28 h-28 sm:w-36 sm:h-36 lg:w-48 lg:h-48 object-contain mx-auto drop-shadow-2xl"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/logo-zawadi.png';
                  }}
                />
              </div>

              {/* Welcome Message */}
              <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 drop-shadow-md text-center">
                Welcome to EDucore V1
              </h2>
              <p className="text-blue-100 text-base sm:text-lg leading-relaxed text-center">
                Unified education management for schools and institutions.
              </p>
            </div>
          </div>

          {/* Footer Copyright */}
          <div className="relative z-10 text-center">
            <p className="text-blue-100 text-sm">
              © 2026 EDucore V1. All rights reserved.
            </p>
          </div>
        </div>

        {/* Right Column - Dynamic Content */}
        <div className="w-full lg:w-1/2 h-full p-6 lg:p-16 flex flex-col justify-center">
          {showOTPVerification && pendingUserData ? (
            <OTPVerificationForm
              email={pendingUserData.email}
              phone={pendingUserData.phone}
              onVerifySuccess={handleOTPVerifySuccess}
              onBackToLogin={handleBackToLogin}
              brandingSettings={brandingSettings}
            />
          ) : (
            <div className="max-w-md mx-auto w-full animate-fade-in">
              <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">EDucore V1 — Login</h1>
                <p className="text-gray-600">Sign in to continue to your dashboard</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && (
                    <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                      <AlertCircle size={14} />
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                      <AlertCircle size={14} />
                      <span>{errors.password}</span>
                    </div>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={onSwitchToForgotPassword}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Skip OTP Checkbox (Development) */}
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="skipOTP"
                    checked={formData.skipOTP}
                    onChange={handleChange}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-orange-600 font-medium">Skip OTP verification (Testing)</span>
                </label>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 focus:ring-4 focus:ring-blue-300 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>

                {/* Branch Selection */}

              </form>

              {/* Sign Up Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={onSwitchToRegister}
                    className="font-semibold text-blue-600 hover:text-blue-700 transition"
                  >
                    Create an account
                  </button>
                </p>
                <div className="mt-2">
                  <button
                    type="button"
                    className="text-xs text-gray-600 underline hover:text-gray-800"
                    onClick={loginAsSuperAdmin}
                  >
                    Login as Super Admin
                  </button>
                </div>
              </div>


            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
