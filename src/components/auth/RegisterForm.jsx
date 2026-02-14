import React, { useState, useCallback, useEffect } from 'react';
import { User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Building2, ChevronRight, ChevronLeft, MapPin, Loader2, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { onboardingAPI, authAPI } from '../../services/api';
import debounce from 'lodash/debounce';

export default function RegisterForm({ onSwitchToLogin, onRegisterSuccess, brandingSettings }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [countryCode, setCountryCode] = useState('+254'); // Default to Kenya
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    schoolName: '',
    schoolType: '',
    address: '',
    county: '',
    subCounty: '',
    ward: '',
    termsAccepted: false
  });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  // validationStatus: { [field]: 'valid' | 'invalid' | 'loading' | null }
  const [fieldStatus, setFieldStatus] = useState({});
  const [checkingField, setCheckingField] = useState(null);

  // Debounced check function
  const checkAvailability = useCallback(
    debounce(async (field, value) => {
      if (!value) return;

      // Regex pre-check
      if (field === 'email' && !/\S+@\S+\.\S+/.test(value)) return;
      if (field === 'phone' && !/^\+?[0-9]{10,15}$/.test(value)) return;

      setCheckingField(field);
      setFieldStatus(prev => ({ ...prev, [field]: 'loading' }));

      try {
        await authAPI.checkAvailability({ [field]: value });
        setFieldStatus(prev => ({ ...prev, [field]: 'valid' }));
        setErrors(prev => ({ ...prev, [field]: '' }));
      } catch (error) {
        const msg = error.response?.data?.message || `${field === 'email' ? 'Email' : 'Phone'} already exists`;
        setFieldStatus(prev => ({ ...prev, [field]: 'invalid' }));
        setErrors(prev => ({ ...prev, [field]: msg }));
      } finally {
        setCheckingField(null);
      }
    }, 500),
    []
  );

  // Update field status immediately for synchronous validations
  const updateFieldStatus = (name, value) => {
    if (name === 'fullName') {
      setFieldStatus(prev => ({ ...prev, [name]: value.length > 3 ? 'valid' : null }));
    }
    if (name === 'schoolName') {
      setFieldStatus(prev => ({ ...prev, [name]: value.length > 3 ? 'valid' : null }));
    }
    if (name === 'password') {
      const isStrong = value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value);
      setFieldStatus(prev => ({ ...prev, [name]: isStrong ? 'valid' : null }));
    }
    if (name === 'confirmPassword') {
      setFieldStatus(prev => ({ ...prev, [name]: value === formData.password && value ? 'valid' : null }));
    }

    // Trigger async check for email/phone
    if (name === 'email' || name === 'phone') {
      if (name === 'email' && !/\S+@\S+\.\S+/.test(value)) {
        setFieldStatus(prev => ({ ...prev, [name]: 'invalid' }));
        return;
      }
      if (name === 'phone' && !/^\d{9,12}$/.test(value) && value.length > 0) {
        // wait for full length
      } else {
        checkAvailability(name, value);
      }
    }
  };

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
      { strength: 3, label: 'Good', color: 'bg-brand-teal' },
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
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = 'Password must include an uppercase letter';
      } else if (!/[a-z]/.test(formData.password)) {
        newErrors.password = 'Password must include a lowercase letter';
      } else if (!/\d/.test(formData.password)) {
        newErrors.password = 'Password must include a number';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (step === 3) {
      if (!formData.schoolName.trim()) newErrors.schoolName = 'School name is required';
      if (!formData.schoolType) newErrors.schoolType = 'School type is required';
      if (!formData.county) newErrors.county = 'County is required';
      if (!formData.address.trim()) newErrors.address = 'Physical address is required';
      if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Kenya county coordinates for reverse lookup
  const kenyaCounties = {
    'Baringo': { bounds: [[0.05, 35.26], [1.27, 36.47]] },
    'Bomet': { bounds: [[-0.68, 34.7], [0.42, 35.33]] },
    'Bungoma': { bounds: [[0.25, 34.33], [1.38, 35.45]] },
    'Busia': { bounds: [[0.18, 33.89], [0.63, 34.38]] },
    'Elgeyo-Marakwet': { bounds: [[0.52, 35.15], [1.45, 35.98]] },
    'Embu': { bounds: [[-0.35, 37.31], [0.43, 37.82]] },
    'Garissa': { bounds: [[-0.47, 39.18], [2.1, 41.58]] },
    'Homa Bay': { bounds: [[-0.7, 33.94], [0.18, 34.88]] },
    'Isiolo': { bounds: [[0.35, 36.66], [2.27, 37.99]] },
    'Kajiado': { bounds: [[-2.77, 36.53], [-1.05, 37.29]] },
    'Kakamega': { bounds: [[0.22, 34.83], [0.93, 35.45]] },
    'Kericho': { bounds: [[-0.37, 35.27], [0.39, 35.83]] },
    'Kiambu': { bounds: [[-1.04, 36.65], [-0.59, 37.25]] },
    'Kilifi': { bounds: [[-3.64, 39.35], [-2.62, 40.32]] },
    'Kirinyaga': { bounds: [[-0.67, 37.32], [-0.07, 37.95]] },
    'Kisii': { bounds: [[-0.98, 34.78], [-0.56, 35.31]] },
    'Kisumu': { bounds: [[-0.67, 33.94], [0.18, 34.71]] },
    'Kitui': { bounds: [[-1.24, 37.86], [0.19, 39.03]] },
    'Kwale': { bounds: [[-4.68, 39.35], [-3.6, 40.55]] },
    'Laikipia': { bounds: [[-0.68, 36.63], [0.84, 37.37]] },
    'Lamu': { bounds: [[-2.62, 40.89], [-1.67, 41.94]] },
    'Machakos': { bounds: [[-2.22, 37.27], [-1.27, 38.32]] },
    'Makueni': { bounds: [[-3.29, 37.36], [-2.28, 38.48]] },
    'Mandera': { bounds: [[2.27, 40.31], [4.7, 41.58]] },
    'Marsabit': { bounds: [[2.18, 37.09], [4.43, 38.33]] },
    'Meru': { bounds: [[-1.32, 37.4], [0.68, 38.42]] },
    'Migori': { bounds: [[-1.73, 33.95], [-0.9, 34.65]] },
    'Mombasa': { bounds: [[-4.72, 39.15], [-3.98, 39.93]] },
    'Murang\'a': { bounds: [[-1.08, 36.98], [-0.36, 37.46]] },
    'Nairobi': { bounds: [[-1.38, 36.68], [-1.17, 37.11]] },
    'Nakuru': { bounds: [[-1.27, 36.13], [0.27, 36.95]] },
    'Nandi': { bounds: [[0.14, 34.89], [0.82, 35.45]] },
    'Narok': { bounds: [[-1.99, 35.3], [-0.74, 36.13]] },
    'Nyamira': { bounds: [[-0.81, 34.43], [-0.56, 34.98]] },
    'Nyandarua': { bounds: [[-0.73, 36.71], [-0.15, 37.09]] },
    'Nyeri': { bounds: [[-0.73, 36.98], [-0.21, 37.41]] },
    'Samburu': { bounds: [[0.73, 36.52], [2.27, 37.99]] },
    'Siaya': { bounds: [[-0.15, 33.94], [0.6, 34.57]] },
    'Taita-Taveta': { bounds: [[-3.99, 37.69], [-3.1, 38.9]] },
    'Tana River': { bounds: [[-2.62, 39.35], [-1.67, 40.89]] },
    'Tharaka-Nithi': { bounds: [[-0.35, 37.82], [0.43, 38.52]] },
    'Trans Nzoia': { bounds: [[0.82, 34.72], [1.52, 35.32]] },
    'Turkana': { bounds: [[1.27, 34.49], [3.91, 36.47]] },
    'Uasin Gishu': { bounds: [[0.21, 34.71], [1.14, 35.45]] },
    'Vihiga': { bounds: [[0.47, 34.72], [0.76, 35.05]] },
    'Wajir': { bounds: [[1.58, 40.05], [3.91, 41.58]] },
    'West Pokot': { bounds: [[1.14, 34.8], [2.33, 35.96]] }
  };

  const getCountyFromCoordinates = (latitude, longitude) => {
    for (const [county, { bounds }] of Object.entries(kenyaCounties)) {
      const [[minLat, minLon], [maxLat, maxLon]] = bounds;
      if (latitude >= minLat && latitude <= maxLat && longitude >= minLon && longitude <= maxLon) {
        return county;
      }
    }
    return '';
  };

  const handleAutoLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          let detectedCounty = getCountyFromCoordinates(latitude, longitude);

          // Use Nominatim for street-level details AND accurate county
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              { signal: AbortSignal.timeout(5000) }
            );

            if (!response.ok) throw new Error('Nominatim request failed');

            const data = await response.json();

            if (data.address) {
              const addr = data.address;
              // Extract meaningful address components
              const subCounty = addr.city || addr.town || addr.suburb || addr.city_district || '';
              const address = [
                addr.road || addr.street,
                addr.village || addr.neighbourhood,
                subCounty
              ].filter(Boolean).join(', ').trim() || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

              // Try to get accurate county from API (Nominatim often returns it as 'state' or 'county')
              // Map valid Kenya counties to ensure we match our dropdown values
              const apiCounty = addr.county || addr.state;
              const normalizedApiCounty = apiCounty ? apiCounty.replace(' County', '') : '';

              // Check if normalizedApiCounty exists in our keys
              if (normalizedApiCounty && kenyaCounties[normalizedApiCounty]) {
                detectedCounty = normalizedApiCounty;
              }

              setFormData(prev => ({
                ...prev,
                county: detectedCounty || prev.county, // Fallback to existing if nothing found
                subCounty: subCounty,
                address: address
              }));

              // Clear validation errors since we just filled the fields
              setErrors(prev => ({
                ...prev,
                county: '',
                subCounty: '',
                address: ''
              }));

              toast.success('Location detected successfully!');
              setLocationEnabled(true);
            } else {
              // Fallback if Nominatim doesn't return address details
              setFormData(prev => ({
                ...prev,
                county: detectedCounty,
                address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
              }));
              toast.success('Coordinates detected! Please enter details.');
              setLocationEnabled(true);
            }
          } catch (nominatimError) {
            console.warn('Nominatim error, using coordinates fallback:', nominatimError);

            if (!detectedCounty) {
              throw new Error('Could not determine location within Kenya.');
            }

            setFormData(prev => ({
              ...prev,
              county: detectedCounty,
              address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            }));

            // Clear errors for what we found
            setErrors(prev => ({ ...prev, county: '', address: '' }));

            toast.success('County detected! Please enter address details.');
            setLocationEnabled(true);
          }
        } catch (error) {
          console.error('Location error:', error);
          toast.error('Failed to detect location. Please enter manually.');
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        setIsDetectingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Location access denied. Please enable it in your browser settings.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          toast.error('Location information is unavailable.');
        } else if (error.code === error.TIMEOUT) {
          toast.error('Location request timed out. Please try again.');
        } else {
          toast.error('Unable to retrieve your location.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleNext = () => {
    setShowErrors(true);
    if (validateStep(currentStep)) {
      // Combine country code and phone number before moving to next step
      if (currentStep === 1) {
        setFormData(prev => ({ ...prev, phone: countryCode + phoneNumber }));
      }
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      setErrors({});
      setShowErrors(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors({});
    setShowErrors(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowErrors(true);

    // If not on final step, just validate and go to next
    if (currentStep < totalSteps) {
      handleNext();
      return;
    }

    if (!validateStep(currentStep)) return;

    setIsLoading(true);

    try {
      console.log('📤 Sending registration request...');

      const requestBody = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        passwordConfirm: formData.confirmPassword,
        schoolName: formData.schoolName,
        schoolType: formData.schoolType,
        address: formData.address,
        county: formData.county,
        subCounty: formData.subCounty,
        ward: formData.ward
      };

      console.log('📋 Request data:', requestBody);

      // Call full onboarding registration endpoint using the API service which handles CSRF
      const data = await onboardingAPI.registerFull(requestBody);
      console.log('📦 Response data:', data);

      if (data) {
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
            email: data.data.user.email,
            phone: data.data.user.phone,
            name: `${data.data.user.firstName} ${data.data.user.lastName}`,
            role: data.data.user.role
          });
        }, 1000);
      } else {
        const errorMessage = data.error || data.message || 'Registration failed';
        console.error('❌ Registration failed:', errorMessage);

        // Show error toast
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-slide-in';
        toast.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg><span>${errorMessage}</span>`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);

        // Set field-specific errors if possible
        if (errorMessage.toLowerCase().includes('phone')) {
          setErrors({ phone: errorMessage });
          setCurrentStep(1);
        } else if (errorMessage.toLowerCase().includes('email')) {
          setErrors({ email: errorMessage });
          setCurrentStep(1);
        } else {
          setErrors({ email: errorMessage }); // Fallback to email/general error
          setCurrentStep(1);
        }
      }
    } catch (error) {
      console.error('💥 Registration error:', error);

      let errorMsg = 'Unable to connect to server. Please check your connection.';

      // If we have a specific error message from the throw
      if (error.response && error.response.data && error.response.data.error) {
        errorMsg = error.response.data.error;
      } else if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMsg = 'Could not reach server. Is the backend running?';
        } else {
          errorMsg = error.message;
        }
      }

      // Show error toast
      const toastEl = document.createElement('div');
      toastEl.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-slide-in';
      toastEl.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg><span>${errorMsg}</span>`;
      document.body.appendChild(toastEl);
      setTimeout(() => toastEl.remove(), 5000);

      setErrors({
        email: errorMsg
      });
      // Don't automatically reset to step 1 unless it was a validation error from server
      // currentStep stays where it is for user to retry
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
    // Pass full number including country code for availability check
    if (value.length >= 9) {
      updateFieldStatus('phone', countryCode + value);
    }
  };

  const handleCountryCodeChange = (e) => {
    const code = e.target.value;
    setCountryCode(code);
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
    // Re-validate logic if number is entered
    if (phoneNumber.length >= 9) {
      updateFieldStatus('phone', code + phoneNumber);
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
    updateFieldStatus(name, value);
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // Get step titles
  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Personal Information';
      case 2: return 'Account Security';
      case 3: return 'School Registration';
      default: return 'Register School';
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
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
          className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-between items-center text-white relative overflow-hidden bg-[#875A7B]"
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
              {/* Premium Wordmark Logo */}
              <div className="mb-12 text-center">
                <div className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl mb-8 transform hover:scale-105 transition-transform duration-500">
                  <span className="text-5xl sm:text-6xl font-black tracking-tighter flex items-center gap-1">
                    <span className="text-white">Elim</span>
                    <span className="text-teal-300 font-light">crown</span>
                  </span>
                </div>
              </div>

              {/* Onboarding Message */}
              <div className="space-y-6">
                <h2 className="text-4xl font-bold drop-shadow-md">
                  {brandingSettings?.onboardingTitle || 'Join Our Community'}
                </h2>
                <p className="text-[#f4f0f2] text-lg leading-relaxed">
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
                      <p className="text-[#f4f0f2] text-sm">Track formative and summative assessments effortlessly</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-left">
                    <div className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mt-0.5">
                      <CheckCircle size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Real-time Reporting</h4>
                      <p className="text-[#f4f0f2] text-sm">Generate comprehensive reports with just a few clicks</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-left">
                    <div className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mt-0.5">
                      <CheckCircle size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Seamless Collaboration</h4>
                      <p className="text-[#f4f0f2] text-sm">Connect teachers, parents, and students in one place</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Copyright */}
          <div className="relative z-10 text-center">
            <p className="text-[#f4f0f2] text-sm">
              © 2026 {brandingSettings?.schoolName || 'ElimCrown'}. All rights reserved.
            </p>
          </div>
        </div>

        {/* Right Column - Registration Form */}
        <div className="w-full lg:w-1/2 p-6 lg:p-16 flex flex-col justify-center overflow-y-auto bg-[#F9FAFB]">
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
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition ${step < currentStep ? 'bg-green-500 text-white' :
                        step === currentStep ? 'bg-[#875A7B] text-white' :
                          'bg-gray-200 text-gray-500'
                        }`}>
                        {step < currentStep ? <CheckCircle size={20} /> : step}
                      </div>
                      <span className={`text-xs mt-2 ${step === currentStep ? 'font-semibold text-[#875A7B]' : 'text-gray-600'
                        }`}>
                        {step === 1 ? 'Personal' : step === 2 ? 'Security' : 'School'}
                      </span>
                    </div>
                    {index < 2 && (
                      <div className="flex-1 flex items-center" style={{ marginTop: '20px' }}>
                        <div className={`w-full h-1 transition ${step < currentStep ? 'bg-green-500' : 'bg-gray-200'
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
                        className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-[#875A7B] focus:border-transparent transition ${fieldStatus.fullName === 'invalid' || (showErrors && errors.fullName) ? 'border-red-500 shadow-sm' :
                          fieldStatus.fullName === 'valid' ? 'border-green-500' : 'border-gray-300'
                          }`}
                        placeholder="John Doe"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {fieldStatus.fullName === 'loading' && <Loader2 className="animate-spin text-gray-400 h-5 w-5" />}
                        {fieldStatus.fullName === 'valid' && <CheckCircle className="text-green-500 h-5 w-5" />}
                        {fieldStatus.fullName === 'invalid' && <XCircle className="text-red-500 h-5 w-5" />}
                      </div>
                    </div>
                    {showErrors && errors.fullName && (
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
                        className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-[#875A7B] focus:border-transparent transition ${fieldStatus.email === 'invalid' || (showErrors && errors.email) ? 'border-red-500 shadow-sm' :
                          fieldStatus.email === 'valid' ? 'border-green-500' : 'border-gray-300'
                          }`}
                        placeholder="you@example.com"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {fieldStatus.email === 'loading' && <Loader2 className="animate-spin text-gray-400 h-5 w-5" />}
                        {fieldStatus.email === 'valid' && <CheckCircle className="text-green-500 h-5 w-5" />}
                        {fieldStatus.email === 'invalid' && <XCircle className="text-red-500 h-5 w-5" />}
                      </div>
                    </div>
                    {showErrors && errors.email && (
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
                          className="pl-3 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#875A7B] focus:border-transparent transition appearance-none bg-white cursor-pointer"
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
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#875A7B] focus:border-transparent transition ${showErrors && errors.phone ? 'border-red-500 shadow-sm' : 'border-gray-300'
                            }`}
                          placeholder="712345678"
                          maxLength={africanCountries.find(c => c.code === countryCode)?.length || 10}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          {fieldStatus.phone === 'loading' && <Loader2 className="animate-spin text-gray-400 h-5 w-5" />}
                          {fieldStatus.phone === 'valid' && <CheckCircle className="text-green-500 h-5 w-5" />}
                          {fieldStatus.phone === 'invalid' && <XCircle className="text-red-500 h-5 w-5" />}
                        </div>
                      </div>
                    </div>
                    {showErrors && errors.phone && (
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
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent transition ${showErrors && errors.password ? 'border-red-500 shadow-sm' : 'border-gray-300'
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
                          <span className={`text-xs font-semibold ${passwordStrength.strength === 4 ? 'text-green-600' :
                            passwordStrength.strength === 3 ? 'text-brand-teal' :
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
                    {showErrors && errors.password && (
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
                        className={`w-full pl-10 pr-20 py-3 border rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent transition ${fieldStatus.confirmPassword === 'valid' ? 'border-green-500' :
                          showErrors && errors.confirmPassword ? 'border-red-500 shadow-sm' : 'border-gray-300'
                          }`}
                        placeholder="Re-enter your password"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
                        {fieldStatus.confirmPassword === 'valid' && <CheckCircle className="text-green-500 h-5 w-5 pointer-events-none" />}
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                    {showErrors && errors.confirmPassword && (
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
                        className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent transition ${fieldStatus.schoolName === 'invalid' || (showErrors && errors.schoolName) ? 'border-red-500 shadow-sm' :
                          fieldStatus.schoolName === 'valid' ? 'border-green-500' : 'border-gray-300'
                          }`}
                        placeholder="Elimcrown Academy"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {fieldStatus.schoolName === 'loading' && <Loader2 className="animate-spin text-gray-400 h-5 w-5" />}
                        {fieldStatus.schoolName === 'valid' && <CheckCircle className="text-green-500 h-5 w-5" />}
                        {fieldStatus.schoolName === 'invalid' && <XCircle className="text-red-500 h-5 w-5" />}
                      </div>
                    </div>
                    {showErrors && errors.schoolName && (
                      <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                        <AlertCircle size={14} />
                        <span>{errors.schoolName}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      School Type
                    </label>
                    <select
                      name="schoolType"
                      value={formData.schoolType}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent transition ${showErrors && errors.schoolType ? 'border-red-500 shadow-sm' : 'border-gray-300'}`}
                    >
                      <option value="">Select Type</option>
                      <option>Public Primary School</option>
                      <option>Public Secondary School</option>
                      <option>Private Primary School</option>
                      <option>Private Secondary School</option>
                    </select>
                    {showErrors && errors.schoolType && (
                      <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                        <AlertCircle size={14} />
                        <span>{errors.schoolType}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 bg-brand-purple/5 border border-brand-purple/10 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${locationEnabled ? 'bg-green-100 text-green-600' : 'bg-brand-teal/10 text-brand-teal'}`}>
                        {isDetectingLocation ? <Loader2 size={20} className="animate-spin" /> : <MapPin size={20} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Auto-detect Location</p>
                        <p className="text-xs text-gray-600">Fills County and Address automatically</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoLocation}
                      disabled={isDetectingLocation}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${locationEnabled ? 'bg-brand-teal' : 'bg-gray-200'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${locationEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        County
                      </label>
                      <select
                        name="county"
                        value={formData.county}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent transition ${showErrors && errors.county ? 'border-red-500 shadow-sm' : 'border-gray-300'}`}
                      >
                        <option value="">Select County</option>
                        {['Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang’a', 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {showErrors && errors.county && (
                        <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                          <AlertCircle size={14} />
                          <span>{errors.county}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Sub-County
                      </label>
                      <input
                        type="text"
                        name="subCounty"
                        value={formData.subCounty}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent transition"
                        placeholder="e.g. Westlands"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Physical Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent transition ${showErrors && errors.address ? 'border-red-500 shadow-sm' : 'border-gray-300'}`}
                      placeholder="Street, Town"
                    />
                    {showErrors && errors.address && (
                      <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                        <AlertCircle size={14} />
                        <span>{errors.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-brand-purple/5 border border-brand-purple/10 rounded-lg p-4">
                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        name="termsAccepted"
                        checked={formData.termsAccepted}
                        onChange={handleChange}
                        className="mt-1 w-4 h-4 text-brand-purple border-gray-300 rounded focus:ring-brand-purple"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        I agree to the{' '}
                        <button type="button" className="font-semibold text-brand-purple hover:text-brand-purple/80">
                          Terms and Conditions
                        </button>
                        {' '}and{' '}
                        <button type="button" className="font-semibold text-brand-purple hover:text-brand-purple/80">
                          Privacy Policy
                        </button>
                      </span>
                    </label>
                    {showErrors && errors.termsAccepted && (
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
                    className={`flex items-center justify-center gap-2 bg-[#875A7B] text-white py-3 rounded-lg font-semibold hover:bg-[#714B67] focus:ring-4 focus:ring-[#875A7B]/20 transition-all shadow-lg ${currentStep === 1 ? 'flex-1' : 'flex-1'
                      }`}
                  >
                    Next
                    <ChevronRight size={20} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-[#875A7B] text-white py-3 rounded-lg font-semibold hover:bg-[#714B67] focus:ring-4 focus:ring-[#875A7B]/20 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="font-semibold text-[#875A7B] hover:text-[#714B67] transition"
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
