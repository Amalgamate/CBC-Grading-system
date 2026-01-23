import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Building2, ChevronRight, ChevronLeft } from 'lucide-react';

export default function RegisterForm({ onSwitchToLogin, onRegisterSuccess, brandingSettings }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [countryCode, setCountryCode] = useState('+254'); // Default to Kenya
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
    schoolName: '',
    role: 'Teacher',
    termsAccepted: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const totalSteps = 3;

  // African country codes
  const africanCountries = [
    { code: '+254', country: 'Kenya', flag: '🇰🇪', length: 9 },
    { code: '+255', country: 'Tanzania', flag: '🇹🇿', length: 9 },
    { code: '+256', country: 'Uganda', flag: '🇺🇬', length: 9 },
    { code: '+250', country: 'Rwanda', flag: '🇷🇼', length: 9 },
    { code: '+257', country: 'Burundi', flag: '🇧🇮', length: 8 },
    { code: '+251', country: 'Ethiopia', flag: '🇪🇹', length: 9 },
    { code: '+252', country: 'Somalia', flag: '🇸🇴', length: 8 },
    { code: '+211', country: 'South Sudan', flag: '🇸🇸', length: 9 },
    { code: '+27', country: 'South Africa', flag: '🇿🇦', length: 9 },
    { code: '+234', country: 'Nigeria', flag: '🇳🇬', length: 10 },
    { code: '+233', country: 'Ghana', flag: '🇬🇭', length: 9 },
    { code: '+20', country: 'Egypt', flag: '🇪🇬', length: 10 },
    { code: '+212', country: 'Morocco', flag: '🇲🇦', length: 9 },
    { code: '+213', country: 'Algeria', flag: '🇩🇿', length: 9 },
    { code: '+216', country: 'Tunisia', flag: '🇹🇳', length: 8 },
    { code: '+218', country: 'Libya', flag: '🇱🇾', length: 9 },
    { code: '+221', country: 'Senegal', flag: '🇸🇳', length: 9 },
    { code: '+225', country: 'Ivory Coast', flag: '🇨🇮', length: 10 },
    { code: '+226', country: 'Burkina Faso', flag: '🇧🇫', length: 8 },
    { code: '+227', country: 'Niger', flag: '🇳🇪', length: 8 },
    { code: '+228', country: 'Togo', flag: '🇹🇬', length: 8 },
    { code: '+229', country: 'Benin', flag: '🇧🇯', length: 8 },
    { code: '+230', country: 'Mauritius', flag: '🇲🇺', length: 8 },
    { code: '+231', country: 'Liberia', flag: '🇱🇷', length: 9 },
    { code: '+232', country: 'Sierra Leone', flag: '🇸🇱', length: 8 },
    { code: '+233', country: 'Ghana', flag: '🇬🇭', length: 9 },
    { code: '+235', country: 'Chad', flag: '🇹🇩', length: 8 },
    { code: '+236', country: 'CAR', flag: '🇨🇫', length: 8 },
    { code: '+237', country: 'Cameroon', flag: '🇨🇲', length: 9 },
    { code: '+238', country: 'Cape Verde', flag: '🇨🇻', length: 7 },
    { code: '+240', country: 'Eq. Guinea', flag: '🇬🇶', length: 9 },
    { code: '+241', country: 'Gabon', flag: '🇬🇦', length: 7 },
    { code: '+242', country: 'Congo', flag: '🇨🇬', length: 9 },
    { code: '+243', country: 'DR Congo', flag: '🇨🇩', length: 9 },
    { code: '+244', country: 'Angola', flag: '🇦🇴', length: 9 },
    { code: '+245', country: 'Guinea-Bissau', flag: '🇬🇼', length: 7 },
    { code: '+248', country: 'Seychelles', flag: '🇸🇨', length: 7 },
    { code: '+249', country: 'Sudan', flag: '🇸🇩', length: 9 },
    { code: '+260', country: 'Zambia', flag: '🇿🇲', length: 9 },
    { code: '+261', country: 'Madagascar', flag: '🇲🇬', length: 9 },
    { code: '+262', country: 'Réunion', flag: '🇷🇪', length: 9 },
    { code: '+263', country: 'Zimbabwe', flag: '🇿🇼', length: 9 },
    { code: '+264', country: 'Namibia', flag: '🇳🇦', length: 9 },
    { code: '+265', country: 'Malawi', flag: '🇲🇼', length: 9 },
    { code: '+266', country: 'Lesotho', flag: '🇱🇸', length: 8 },
    { code: '+267', country: 'Botswana', flag: '🇧🇼', length: 8 },
    { code: '+268', country: 'Eswatini', flag: '🇸🇿', length: 8 },
    { code: '+269', country: 'Comoros', flag: '🇰🇲', length: 7 },
  ];

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    const levels = [
      { strength: 1, label: 'Weak', color: 'bg-red-500' },
      { strength: 2, label: 'Fair', color: 'bg-yellow-500' },
      { strength: 3, label: 'Good', color: 'bg-blue-500' },
      { strength: 4, label: 'Strong', color: 'bg-green-500' }
    ];

    return levels.find(l => l.strength === strength) || levels[0];
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      
      // Validate phone number
      const selectedCountry = africanCountries.find(c => c.code === countryCode);
      if (!phoneNumber.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\d+$/.test(phoneNumber)) {
        newErrors.phone = 'Please enter only numbers';
      } else if (selectedCountry && phoneNumber.length !== selectedCountry.length) {
        newErrors.phone = `Phone number should be ${selectedCountry.length} digits for ${selectedCountry.country}`;
      }
    }

    if (step === 2) {
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 4) {
        newErrors.username = 'Username must be at least 4 characters';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (step === 3) {
      if (!formData.schoolName.trim()) newErrors.schoolName = 'School name is required';
      if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      // Combine country code and phone number before moving to next step
      if (currentStep === 1) {
        setFormData(prev => ({ ...prev, phone: countryCode + phoneNumber }));
      }
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) return;
    
    setIsLoading(true);
    
    try {
      console.log('📤 Sending registration request...');
      
      const requestBody = {
        firstName: formData.fullName.split(' ')[0],
        lastName: formData.fullName.split(' ').slice(1).join(' ') || formData.fullName.split(' ')[0],
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role.toUpperCase()
      };
      
      console.log('📋 Request data:', requestBody);
      
      // Call backend API for registration
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Response status:', response.status);
      
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (response.ok) {
        console.log('✅ Registration successful!');
        
        // Show success toast
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-slide-in';
        toast.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span>Registration successful! Redirecting...</span>';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
        
        // Redirect to verification
        setTimeout(() => {
          onRegisterSuccess({
            email: data.user.email,
            phone: data.user.phone,
            name: `${data.user.firstName} ${data.user.lastName}`,
            role: data.user.role
          });
        }, 1000);
      } else {
        console.error('❌ Registration failed:', data.message);
        
        // Show error toast
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-slide-in';
        toast.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg><span>${data.message || 'Registration failed'}</span>`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
        
        setErrors({
          email: data.message || 'Registration failed. Please try again.'
        });
        setCurrentStep(1); // Go back to first step to show error
      }
    } catch (error) {
      console.error('💥 Registration error:', error);
      
      // Show error toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-slide-in';
      toast.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg><span>Unable to connect to server. Please check your connection.</span>';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 5000);
      
      setErrors({
        email: 'Unable to connect to server. Please try again.'
      });
      setCurrentStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    setPhoneNumber(value);
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const handleCountryCodeChange = (e) => {
    setCountryCode(e.target.value);
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
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

  const passwordStrength = getPasswordStrength(formData.password);

  // Get step titles
  const getStepTitle = () => {
    switch(currentStep) {
      case 1: return 'Personal Information';
      case 2: return 'Account Security';
      case 3: return 'School Details';
      default: return 'Create Account';
    }
  };

  const getStepSubtitle = () => {
    switch(currentStep) {
      case 1: return 'Let\'s start with your basic information';
      case 2: return 'Secure your account with a strong password';
      case 3: return 'Tell us about your school';
      default: return '';
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden">
      {/* Two Column Layout - Full Screen */}
      <div className="bg-white h-full flex flex-col lg:flex-row">
        
        {/* Left Column - Branding Area */}
        <div 
          className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-between items-center text-white relative overflow-hidden"
          style={{ backgroundColor: brandingSettings?.brandColor || '#1e3a8a' }}
        >
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
            <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-white rounded-full -translate-y-1/2"></div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex items-center justify-center relative z-10">
            <div className="max-w-md text-center space-y-8">
              {/* Logo */}
              <div className="mb-12">
                <img 
                  src={brandingSettings?.logoUrl || '/logo-zawadi.png'} 
                  alt="School Logo" 
                  className="w-48 h-48 object-contain mx-auto drop-shadow-2xl"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/logo-zawadi.png';
                  }}
                />
              </div>
              
              {/* Onboarding Message */}
              <div className="space-y-6">
                <h2 className="text-4xl font-bold drop-shadow-md">
                  {brandingSettings?.onboardingTitle || 'Join Our Community'}
                </h2>
                <p className="text-blue-100 text-lg leading-relaxed">
                  {brandingSettings?.onboardingMessage || 'Start your journey with us today. Create an account to access powerful tools for managing learning and assessment with ease.'}
                </p>

                {/* Features List */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-start gap-3 text-left">
                    <div className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mt-0.5">
                      <CheckCircle size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Complete Assessment Tools</h4>
                      <p className="text-blue-100 text-sm">Track formative and summative assessments effortlessly</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 text-left">
                    <div className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mt-0.5">
                      <CheckCircle size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Real-time Reporting</h4>
                      <p className="text-blue-100 text-sm">Generate comprehensive reports with just a few clicks</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 text-left">
                    <div className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mt-0.5">
                      <CheckCircle size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Seamless Collaboration</h4>
                      <p className="text-blue-100 text-sm">Connect teachers, parents, and students in one place</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Copyright */}
          <div className="relative z-10 text-center">
            <p className="text-blue-100 text-sm">
              © 2025 {brandingSettings?.schoolName || 'Zawadi JRN Academy'}. All rights reserved.
            </p>
          </div>
        </div>

        {/* Right Column - Registration Form */}
        <div className="w-full lg:w-1/2 p-6 lg:p-16 flex flex-col justify-center overflow-y-auto">
          <div className="max-w-md mx-auto w-full">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{getStepTitle()}</h1>
              <p className="text-gray-600">{getStepSubtitle()}</p>
            </div>

            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-3">
                {[1, 2, 3].map((step, index) => (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition ${
                        step < currentStep ? 'bg-green-500 text-white' :
                        step === currentStep ? 'bg-blue-600 text-white' :
                        'bg-gray-200 text-gray-500'
                      }`}>
                        {step < currentStep ? <CheckCircle size={20} /> : step}
                      </div>
                      <span className={`text-xs mt-2 ${
                        step === currentStep ? 'font-semibold text-blue-600' : 'text-gray-600'
                      }`}>
                        {step === 1 ? 'Personal' : step === 2 ? 'Security' : 'School'}
                      </span>
                    </div>
                    {index < 2 && (
                      <div className="flex-1 flex items-center" style={{ marginTop: '20px' }}>
                        <div className={`w-full h-1 transition ${
                          step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                        }`} />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                          errors.fullName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="John Doe"
                      />
                    </div>
                    {errors.fullName && (
                      <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                        <AlertCircle size={14} />
                        <span>{errors.fullName}</span>
                      </div>
                    )}
                  </div>

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

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="flex gap-2">
                      <div className="relative">
                        <select
                          value={countryCode}
                          onChange={handleCountryCodeChange}
                          className="pl-3 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none bg-white cursor-pointer"
                          style={{ minWidth: '120px' }}
                        >
                          {africanCountries.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.flag} {country.code}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={handlePhoneChange}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                            errors.phone ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="712345678"
                          maxLength={africanCountries.find(c => c.code === countryCode)?.length || 10}
                        />
                      </div>
                    </div>
                    {errors.phone && (
                      <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                        <AlertCircle size={14} />
                        <span>{errors.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Account Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                          errors.username ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="johndoe"
                      />
                    </div>
                    {errors.username && (
                      <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                        <AlertCircle size={14} />
                        <span>{errors.username}</span>
                      </div>
                    )}
                  </div>

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
                        placeholder="Enter a strong password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Password strength:</span>
                          <span className={`text-xs font-semibold ${
                            passwordStrength.strength === 4 ? 'text-green-600' :
                            passwordStrength.strength === 3 ? 'text-blue-600' :
                            passwordStrength.strength === 2 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${passwordStrength.color}`}
                            style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {errors.password && (
                      <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                        <AlertCircle size={14} />
                        <span>{errors.password}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Re-enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                        <AlertCircle size={14} />
                        <span>{errors.confirmPassword}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: School Info */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      School/Organization Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="schoolName"
                        value={formData.schoolName}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                          errors.schoolName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Zawadi JRN Academy"
                      />
                    </div>
                    {errors.schoolName && (
                      <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                        <AlertCircle size={14} />
                        <span>{errors.schoolName}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Role
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    >
                      <option value="Teacher">Teacher</option>
                      <option value="Admin">Administrator</option>
                      <option value="Staff">Staff Member</option>
                      <option value="Principal">Principal</option>
                    </select>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        name="termsAccepted"
                        checked={formData.termsAccepted}
                        onChange={handleChange}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        I agree to the{' '}
                        <button type="button" className="font-semibold text-blue-600 hover:text-blue-700">
                          Terms and Conditions
                        </button>
                        {' '}and{' '}
                        <button type="button" className="font-semibold text-blue-600 hover:text-blue-700">
                          Privacy Policy
                        </button>
                      </span>
                    </label>
                    {errors.termsAccepted && (
                      <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                        <AlertCircle size={14} />
                        <span>{errors.termsAccepted}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-4">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
                  >
                    <ChevronLeft size={20} />
                    Back
                  </button>
                )}
                
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className={`flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 focus:ring-4 focus:ring-blue-300 transition-all shadow-lg ${
                      currentStep === 1 ? 'flex-1' : 'flex-1'
                    }`}
                  >
                    Next
                    <ChevronRight size={20} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 focus:ring-4 focus:ring-blue-300 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                )}
              </div>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="font-semibold text-blue-600 hover:text-blue-700 transition"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
