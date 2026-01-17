import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Users } from 'lucide-react';

export default function LoginForm({ onSwitchToRegister, onSwitchToForgotPassword, onLoginSuccess, brandingSettings }) {
  // Mock admin credentials pre-filled for easy access
  const [formData, setFormData] = useState({
    email: 'admin@zawadijrn.ac.ke',
    password: 'admin123',
    rememberMe: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSampleUsers, setShowSampleUsers] = useState(false);
  const sampleUsersRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sampleUsersRef.current && !sampleUsersRef.current.contains(event.target)) {
        setShowSampleUsers(false);
      }
    };

    if (showSampleUsers) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSampleUsers]);

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

  // Mock users database for authentication
  const mockUsers = [
    { 
      email: 'admin@zawadijrn.ac.ke', 
      password: 'admin123', 
      name: 'System Administrator', 
      role: 'Administrator',
      empNo: 'EMP001',
      department: 'Administration'
    },
    { 
      email: 'grace.wanjiru@zawadijrn.ac.ke', 
      password: 'teacher123', 
      name: 'Grace Wanjiru', 
      role: 'Teacher',
      empNo: 'TCH002',
      department: 'Academic'
    },
    { 
      email: 'david.omondi@zawadijrn.ac.ke', 
      password: 'teacher123', 
      name: 'David Omondi', 
      role: 'Teacher',
      empNo: 'TCH003',
      department: 'Academic'
    }
  ];

  // Sample users for quick login
  const sampleUsers = [
    { 
      label: 'Admin User', 
      email: 'admin@zawadijrn.ac.ke', 
      password: 'admin123', 
      role: 'Administrator' 
    },
    { 
      label: 'Teacher - Grace Wanjiru', 
      email: 'grace.wanjiru@zawadijrn.ac.ke', 
      password: 'teacher123', 
      role: 'Teacher' 
    },
    { 
      label: 'Teacher - David Omondi', 
      email: 'david.omondi@zawadijrn.ac.ke', 
      password: 'teacher123', 
      role: 'Teacher' 
    },
    { 
      label: 'Parent User (Coming Soon)', 
      email: '', 
      password: '', 
      role: 'Parent',
      disabled: true 
    },
    { 
      label: 'Student User (Coming Soon)', 
      email: '', 
      password: '', 
      role: 'Student',
      disabled: true 
    }
  ];

  // Function to populate credentials from sample users
  const selectSampleUser = (user) => {
    if (!user.disabled) {
      setFormData({
        email: user.email,
        password: user.password,
        rememberMe: true
      });
      setShowSampleUsers(false);
      setErrors({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      // Check against mock users
      const user = mockUsers.find(
        u => u.email === formData.email && u.password === formData.password
      );
      
      if (user) {
        onLoginSuccess({
          email: user.email,
          name: user.name,
          role: user.role,
          empNo: user.empNo,
          department: user.department
        });
      } else {
        setErrors({
          email: 'Invalid email or password',
          password: 'Invalid email or password'
        });
      }
    }, 1500);
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

  return (
    <div className="w-full h-screen">
      {/* Two Column Layout */}
      <div className="bg-white overflow-hidden h-full flex flex-col lg:flex-row">
        
        {/* Left Column - Branding Area */}
        <div 
          className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center items-center text-white"
          style={{ backgroundColor: brandingSettings?.brandColor || '#1e3a8a' }}
        >
          <div className="max-w-md text-center">
            {/* Logo Placeholder */}
            <div className="mb-8">
              <img 
                src={brandingSettings?.logoUrl || '/logo-zawadi.png'} 
                alt="School Logo" 
                className="w-32 h-32 object-contain mx-auto"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/logo-zawadi.png';
                }}
              />
            </div>
            
            {/* Onboarding Message */}
            <h2 className="text-3xl font-bold mb-4">
              {brandingSettings?.welcomeTitle || 'Welcome to Zawadi JRN Academy'}
            </h2>
            <p className="text-blue-200 text-lg leading-relaxed">
              {brandingSettings?.welcomeMessage || 'Empowering education through innovative learning management.'}
            </p>
          </div>
        </div>

        {/* Right Column - Login Form */}
        <div className="w-full lg:w-1/2 p-6 lg:p-16 flex flex-col justify-center overflow-y-auto">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600">Sign in to continue to your dashboard</p>
            </div>

            {/* Sample Users Floating Button */}
            <div className="relative mb-6" ref={sampleUsersRef}>
              <button
                type="button"
                onClick={() => setShowSampleUsers(!showSampleUsers)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
              >
                <Users size={18} />
                <span className="font-medium">Sample Users</span>
              </button>

              {/* Sample Users Dropdown */}
              {showSampleUsers && (
                <div className="absolute top-full mt-2 left-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-10 overflow-hidden">
                  <div className="bg-blue-50 px-4 py-3 border-b border-blue-100">
                    <h3 className="font-semibold text-blue-900 text-sm">Select a Sample User</h3>
                    <p className="text-xs text-blue-600 mt-0.5">Click to auto-fill credentials</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {sampleUsers.map((user, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectSampleUser(user)}
                        disabled={user.disabled}
                        className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 transition-colors ${
                          user.disabled 
                            ? 'bg-gray-50 cursor-not-allowed opacity-60' 
                            : 'hover:bg-blue-50 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 text-sm">{user.label}</div>
                            {!user.disabled && (
                              <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                                <div className="font-mono">{user.email}</div>
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium">
                                    {user.role}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
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
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
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
        </div>


          </div>
        </div>
      </div>
    </div>
  );
}
