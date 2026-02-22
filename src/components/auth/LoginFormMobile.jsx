import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { authAPI, API_BASE_URL } from '../../services/api';
import { setAdminSchoolId, setBranchId } from '../../services/tenantContext';
import OTPVerificationForm from './OTPVerificationForm';
import ConnectionStatus from './ConnectionStatus';

export default function LoginFormMobile({ onSwitchToRegister, onSwitchToForgotPassword, onLoginSuccess, brandingSettings }) {
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
      const credentialsData = await authAPI.login({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (formData.skipOTP) {
        if (credentialsData.token) {
          localStorage.setItem('token', credentialsData.token);
          if (credentialsData.refreshToken) {
            localStorage.setItem('refreshToken', credentialsData.refreshToken);
          }
          if (formData.rememberMe) {
            localStorage.setItem('authToken', credentialsData.token);
          }
        }

        let loginUserData = {
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

        let sid = credentialsData.user.schoolId || credentialsData.user.school?.id || '';

        if (credentialsData.user.role === 'SUPER_ADMIN' && !sid) {
          const assigned = await assignFirstAvailableSchoolForSuperAdmin({
            token: credentialsData.token,
            userData: loginUserData
          });
          sid = assigned.schoolId || sid;
          loginUserData = assigned.userData || loginUserData;
        }

        const bid = credentialsData.user.branchId || credentialsData.user.branch?.id || '';

        if (sid) setAdminSchoolId(sid);
        if (bid) setBranchId(bid);

        onLoginSuccess(loginUserData, credentialsData.token, credentialsData.refreshToken);
      } else {
        const otpData = await authAPI.requestOTP({
          email: formData.email.trim(),
          phoneNumber: credentialsData.user?.phone || '',
        });

        if (otpData.success) {
          setPendingUserData({
            email: credentialsData.user.email,
            phone: credentialsData.user?.phone || '',
            token: credentialsData.token,
            refreshToken: credentialsData.refreshToken,
            user: credentialsData.user,
          });
          setShowOTPVerification(true);
        } else {
          const otpError = new Error(otpData.message || 'Failed to send OTP');
          setErrors({
            form: otpError.message || 'Failed to send OTP. Please try again.'
          });
        }
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const loginAsSuperAdmin = () => {
    setFormData(prev => ({
      ...prev,
      email: 'superadmin@template.test',
      password: ''
    }));
    setErrors({});
  };

  const handleOTPVerifySuccess = async (userData) => {
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

    let sid = pendingUserData.user.schoolId || pendingUserData.user.school?.id || '';

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
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-[#520050] to-[#3D0038] overflow-hidden">
      {/* Header with Logo */}
      <div className="pt-8 px-4 text-center">
        <div className="inline-flex items-center justify-center mb-6">
          <span className="text-4xl font-black tracking-tighter">
            <span className="text-white">Elim</span>
            <span className="text-teal-300 font-light">crown</span>
          </span>
        </div>
        <h1 className="text-white text-xl font-bold">Teaching Made Simple</h1>
      </div>

      {/* Scrollable Form Container */}
      <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
        <div className="w-full max-w-sm">
          {showOTPVerification && pendingUserData ? (
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <OTPVerificationForm
                email={pendingUserData.email}
                phone={pendingUserData.phone}
                onVerifySuccess={handleOTPVerifySuccess}
                onBackToLogin={handleBackToLogin}
                brandingSettings={brandingSettings}
              />
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign In</h2>
                <p className="text-gray-500 text-sm">Access your dashboard</p>
              </div>

              {/* Connection Status Indicator */}
              <div className="mb-5">
                <ConnectionStatus />
              </div>

              {errors.form && (
                <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700">
                  <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                  <div className="text-sm font-medium">{errors.form}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-[#520050] focus:border-transparent pointer-events-auto ${
                        errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'
                      }`}
                      style={{ touchAction: 'manipulation' }}
                      placeholder="name@school.com"
                    />
                  </div>
                  {errors.email && (
                    <div className="mt-2 text-red-600 text-xs font-medium flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.email}
                    </div>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-12 py-3 text-base border rounded-lg focus:ring-2 focus:ring-[#520050] focus:border-transparent pointer-events-auto ${
                        errors.password ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'
                      }`}
                      style={{ touchAction: 'manipulation' }}
                      placeholder="••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 pointer-events-auto"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="mt-2 text-red-600 text-xs font-medium flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.password}
                    </div>
                  )}
                </div>

                {/* Remember Me */}
                <label className="flex items-center cursor-pointer py-2">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 border-gray-300 rounded pointer-events-auto"
                    style={{ touchAction: 'manipulation' }}
                  />
                  <span className="ml-2 text-sm text-gray-700">Remember me</span>
                </label>

                {/* Skip OTP */}
                <label className="flex items-center p-3 bg-orange-50 rounded-lg border border-orange-100 cursor-pointer">
                  <input
                    type="checkbox"
                    name="skipOTP"
                    checked={formData.skipOTP}
                    onChange={handleChange}
                    className="w-4 h-4 border-gray-300 rounded pointer-events-auto"
                    style={{ touchAction: 'manipulation' }}
                  />
                  <span className="ml-2 text-xs text-orange-700 font-semibold">Skip OTP</span>
                </label>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#520050] text-white py-3.5 rounded-lg font-bold text-base hover:bg-[#3D0038] focus:ring-4 focus:ring-[#520050]/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-6 pointer-events-auto"
                  style={{ touchAction: 'manipulation' }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* Footer Links */}
              <div className="mt-6 pt-6 border-t border-gray-200 text-center space-y-3">
                <button
                  type="button"
                  onClick={onSwitchToForgotPassword}
                  className="block w-full text-sm text-[#520050] font-semibold hover:underline pointer-events-auto"
                >
                  Forgot Password?
                </button>
                <p className="text-xs text-gray-600">
                  New user?{' '}
                  <button
                    type="button"
                    onClick={onSwitchToRegister}
                    className="font-bold text-teal-600 hover:underline pointer-events-auto"
                  >
                    Create account
                  </button>
                </p>
                {process.env.NODE_ENV === 'development' && (
                  <button
                    type="button"
                    className="text-xs text-gray-400 hover:text-gray-600 pointer-events-auto"
                    onClick={loginAsSuperAdmin}
                  >
                    Login as Admin
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 text-center text-white/60 text-xs">
        <p>© {new Date().getFullYear()} Elimcrown Inc. All rights reserved.</p>
      </div>
    </div>
  );
}
