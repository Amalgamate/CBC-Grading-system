import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Users } from 'lucide-react';
import { authAPI, API_BASE_URL } from '../../services/api';

export default function LoginForm({ onSwitchToRegister, onSwitchToForgotPassword, onLoginSuccess, brandingSettings }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [seededUsers, setSeededUsers] = useState([]);
  const [showSeededUsers, setShowSeededUsers] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [branchOptions, setBranchOptions] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');

  // Fetch seeded users for development
  useEffect(() => {
    const fetchSeededUsers = async () => {
      try {
        setLoadingUsers(true);
        const data = await authAPI.getSeededUsers();
        setSeededUsers(data.users || []);
      } catch (error) {
        console.log('Seeded users not available (production mode or not seeded yet)');
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchSeededUsers();
  }, []);

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
      const data = await authAPI.login({
        email: formData.email,
        password: formData.password
      });

      // Store token
      if (data.token) {
        localStorage.setItem('token', data.token);
        if (formData.rememberMe) {
          localStorage.setItem('authToken', data.token);
        }
      }

      const userData = {
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

      // Persist tenancy context for API headers
      let sid = data.user.schoolId || data.user.school?.id || '';
      const bid = data.user.branchId || data.user.branch?.id || '';

      // SUPER ADMIN FIX: If Super Admin has no school, fetch and assign first available school
      if (data.user.role === 'SUPER_ADMIN' && !sid) {
        try {
          // Fetch schools list
          const schoolsResponse = await fetch(`${API_BASE_URL}/admin/schools`, {
            headers: {
              'Authorization': `Bearer ${data.token}`
            }
          });
          const schoolsData = await schoolsResponse.json();

          if (schoolsData.data && schoolsData.data.length > 0) {
            // Get first active school
            const firstSchool = schoolsData.data.find(s => s.active) || schoolsData.data[0];
            sid = firstSchool.id;
            userData.schoolId = sid;
            userData.school = firstSchool;
            console.log('✅ Super Admin auto-assigned to school:', firstSchool.name);
          }
        } catch (error) {
          console.warn('⚠️ Could not fetch schools for Super Admin:', error);
        }
      }

      if (sid) localStorage.setItem('currentSchoolId', sid);
      if (bid) localStorage.setItem('currentBranchId', bid);

      onLoginSuccess(userData);
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

      const userData = {
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

      // SUPER ADMIN FIX: Auto-assign first available school
      let sid = data.user.schoolId || data.user.school?.id || '';

      if (!sid) {
        try {
          const schoolsResponse = await fetch(`${API_BASE_URL}/admin/schools`, {
            headers: { 'Authorization': `Bearer ${data.token}` }
          });
          const schoolsData = await schoolsResponse.json();

          if (schoolsData.data && schoolsData.data.length > 0) {
            const firstSchool = schoolsData.data.find(s => s.active) || schoolsData.data[0];
            sid = firstSchool.id;
            userData.schoolId = sid;
            userData.school = firstSchool;
            console.log('✅ Super Admin auto-assigned to school:', firstSchool.name);
          }
        } catch (error) {
          console.warn('⚠️ Could not fetch schools for Super Admin:', error);
        }
      }

      if (sid) localStorage.setItem('currentSchoolId', sid);

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

    if (name === 'email') {
      const email = value;
      setSelectedBranch('');
      setBranchOptions([]);
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        const controller = new AbortController();
        setTimeout(async () => {
          try {
            const res = await fetch(`${API_BASE_URL}/onboarding/branch-options?email=${encodeURIComponent(email)}`, { signal: controller.signal });
            const data = await res.json();
            setBranchOptions(data.branches || []);
          } catch (_) { }
        }, 250);
        return () => controller.abort();
      }
    }
  };

  const handleSelectSeededUser = (user) => {
    setFormData({
      email: user.email,
      password: user.passwordHint,
      rememberMe: true
    });
    setShowSeededUsers(false);
    setErrors({});
  };

  return (
    <div className="w-full h-screen bg-white">
      {/* Two Column Layout - Full Screen */}
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

        {/* Right Column - Login Form */}
        <div className="w-full lg:w-1/2 h-full p-6 lg:p-16 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">EDucore V1 — Login</h1>
              <p className="text-gray-600">Sign in to continue to your dashboard</p>
            </div>

            {/* Seeded Users Button - Development Only */}
            {seededUsers.length > 0 && (
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setShowSeededUsers(!showSeededUsers)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg font-semibold"
                >
                  <Users size={20} />
                  <span>Development Users ({seededUsers.length})</span>
                </button>

                {/* Seeded Users Dropdown */}
                {showSeededUsers && (
                  <div className="mt-2 bg-white border-2 border-purple-200 rounded-lg shadow-xl overflow-hidden animate-fade-in">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 border-b border-purple-100">
                      <h3 className="font-bold text-purple-900 text-sm">Seeded Development Users</h3>
                      <p className="text-xs text-purple-600 mt-0.5">Click to auto-fill credentials</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {loadingUsers ? (
                        <div className="px-4 py-6 text-center text-gray-500">
                          <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          Loading users...
                        </div>
                      ) : (
                        seededUsers.map((user, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSelectSeededUser(user)}
                            className="w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-purple-50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900 text-sm">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                                  <div className="font-mono">{user.email}</div>
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-semibold">
                                      {user.role}
                                    </span>
                                    <span className="text-[10px] text-gray-500">
                                      Password: {user.passwordHint}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}



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
              {branchOptions.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Branch</label>
                  <select
                    className="w-full border rounded-lg px-3 py-3"
                    value={selectedBranch}
                    onChange={(e) => {
                      setSelectedBranch(e.target.value);
                      localStorage.setItem('currentBranchId', e.target.value);
                    }}
                  >
                    <option value="">Choose a branch</option>
                    {branchOptions.map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-600 mt-1">This helps route you to the correct branch context after login.</p>
                </div>
              )}
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
