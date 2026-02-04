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
    setErrors({});

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
          if (credentialsData.refreshToken) {
            localStorage.setItem('refreshToken', credentialsData.refreshToken);
          }
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
        const sid = credentialsData.user.schoolId || credentialsData.user.school?.id || '';
        const bid = credentialsData.user.branchId || credentialsData.user.branch?.id || '';

        if (sid) setAdminSchoolId(sid);
        if (bid) setBranchId(bid);

        onLoginSuccess(userData, credentialsData.token, credentialsData.refreshToken);
        return;
      }

      // Step 2: Send OTP to phone
      try {
        const sid = credentialsData.user?.schoolId || credentialsData.user?.school?.id || '';
        const result = await authAPI.sendOTP({
          email: formData.email,
          schoolId: sid
        });
        console.log('OTP Send Result:', result);

        // Store pending user data for OTP verification
        setPendingUserData({
          email: formData.email,
          phone: credentialsData.user?.phone || credentialsData.user?.school?.phone || '+254XXXXXXXX',
          user: credentialsData.user,
          token: credentialsData.token,
          refreshToken: credentialsData.refreshToken
        });

        // Show OTP verification screen
        console.log('Switching to OTP Verification Form');
        setShowOTPVerification(true);
        setErrors({});
      } catch (otpError) {
        console.error('OTP Send Error:', otpError);
        // If OTP fails but credentials are valid, show the error but keep form
        setErrors({
          form: otpError.message || 'Failed to send OTP. Please try again.'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        email: error.message || 'Invalid email or password',
        password: error.message || 'Invalid email or password',
        form: error.message || 'Authentication failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsSuperAdmin = () => {
    // Instead of auto-login, we set the email and clear password to "ask for credentials"
    setFormData(prev => ({
      ...prev,
      email: 'superadmin@local.test',
      password: ''
    }));
    setErrors({});
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
      if (pendingUserData.refreshToken) {
        localStorage.setItem('refreshToken', pendingUserData.refreshToken);
      }
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

    // SUPER_ADMIN: Auto-assign first available school for switching UX if missing.
    if (pendingUserData.user.role === 'SUPER_ADMIN' && !sid) {
      const assigned = await assignFirstAvailableSchoolForSuperAdmin({
        token: pendingUserData.token,
        userData: loginUserData
      });
      sid = assigned.schoolId || sid;
      loginUserData = assigned.userData || loginUserData;
    }

    const bid = pendingUserData.user.branchId || pendingUserData.user.branch?.id || '';

    if (sid) setAdminSchoolId(sid);
    if (bid) setBranchId(bid);

    onLoginSuccess(loginUserData, pendingUserData.token, pendingUserData.refreshToken);
  };

  const handleBackToLogin = () => {
    setShowOTPVerification(false);
    setPendingUserData(null);
    setErrors({});
  };

  return (
    <div className="w-full h-screen bg-brand-light font-sans text-brand-dark">
      {/* Main Layout Container */}
      <div className="bg-white h-full flex flex-col lg:flex-row items-stretch">

        {/* Left Column - Branding Area (Enterprise Purple) */}
        <div
          className="w-full lg:w-1/2 h-full p-8 lg:p-16 flex flex-col justify-between items-center text-white relative bg-[#714B67]"
        >
          {/* Decorative Elements - Restored Blobs */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Top Right Blob - Teal Tint */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#0D9488] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            {/* Bottom Left Blob - Darker Purple Tint */}
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#2e1d2b] rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
            {/* Center Blob - Light Accent */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-400 rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex items-center justify-center relative z-10">
            <div className="max-w-md text-center">
              {/* Logo */}
              <div className="mb-8 sm:mb-10">
                <img
                  src={brandingSettings?.logoUrl || '/logo-new.png'}
                  alt="Elimcrown Logo"
                  className="w-32 h-32 sm:w-40 sm:h-40 object-contain mx-auto drop-shadow-xl"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/logo-new.png';
                  }}
                />
              </div>

              {/* Welcome Message */}
              <h2 className="text-3xl sm:text-5xl font-extrabold mb-4 drop-shadow-md text-center tracking-tight">
                ElimuCrown
              </h2>
              <p className="text-purple-100 text-lg sm:text-xl leading-relaxed text-center font-light">
                Amazing software for amazing schools.
              </p>
            </div>
          </div>

          {/* Footer Copyright */}
          <div className="relative z-10 text-center text-purple-200 text-sm">
            <p>
              © {new Date().getFullYear()} Elimcrown Inc. All rights reserved.
            </p>
          </div>
        </div>

        {/* Right Column - Dynamic Content */}
        <div className="w-full lg:w-1/2 h-full flex flex-col justify-center items-center bg-[#F9FAFB] p-4 lg:p-0">
          {showOTPVerification && pendingUserData ? (
            <div className="w-full max-w-md px-6">
              <OTPVerificationForm
                email={pendingUserData.email}
                phone={pendingUserData.phone}
                onVerifySuccess={handleOTPVerifySuccess}
                onBackToLogin={handleBackToLogin}
                brandingSettings={brandingSettings}
              />
            </div>
          ) : (
            <div className="w-full max-w-md px-6 animate-fade-in relative z-20">
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-extrabold text-[#111827] mb-2">Sign In</h1>
                <p className="text-slate-500 text-base">Access your institution's dashboard.</p>
              </div>

              {errors.form && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 text-red-700 animate-shake shadow-sm">
                  <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                  <div className="text-sm font-medium">{errors.form}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-[#714B67] focus:border-transparent transition-all outline-none text-gray-900 ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-[#714B67]/50'
                        }`}
                      placeholder="name@school.com"
                    />
                  </div>
                  {errors.email && (
                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm font-medium">
                      <AlertCircle size={14} />
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-gray-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={onSwitchToForgotPassword}
                      className="text-sm font-bold text-[#714B67] hover:text-[#5d3d54] hover:underline transition-all"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-12 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-[#714B67] focus:border-transparent transition-all outline-none text-gray-900 ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-[#714B67]/50'
                        }`}
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#714B67] transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm font-medium">
                      <AlertCircle size={14} />
                      <span>{errors.password}</span>
                    </div>
                  )}
                </div>

                {/* Remember Me */}
                <div className="flex items-center pt-2">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="w-5 h-5 text-brand-purple border-gray-300 rounded focus:ring-brand-purple cursor-pointer"
                    />
                    <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Remember me</span>
                  </label>
                </div>


                {/* Skip OTP Checkbox (Development) */}
                <label className="flex items-center p-3 bg-orange-50 rounded-lg border border-orange-100 cursor-pointer hover:bg-orange-100 transition-colors">
                  <input
                    type="checkbox"
                    name="skipOTP"
                    checked={formData.skipOTP}
                    onChange={handleChange}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="ml-3 text-sm text-orange-700 font-semibold">Skip OTP verification (Dev Check)</span>
                </label>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-brand-purple text-white py-4 rounded-lg font-bold hover:bg-brand-purple/90 focus:ring-4 focus:ring-brand-purple/20 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none text-lg flex items-center justify-center transform active:scale-95"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>

              </form>

              {/* Sign Up Link */}
              <div className="mt-8 text-center pt-6 border-t border-gray-100">
                <p className="text-base text-gray-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={onSwitchToRegister}
                    className="font-bold text-brand-teal hover:text-brand-teal/80 hover:underline transition-all"
                  >
                    Create an account
                  </button>
                </p>
                <div className="mt-4">
                  <button
                    type="button"
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
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
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
