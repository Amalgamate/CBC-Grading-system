/**
 * Branding Settings Page
 */

import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Upload, Image, MessageSquare } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

const BrandingSettings = ({ brandingSettings, setBrandingSettings }) => {
  const { showSuccess, showError } = useNotifications();

  const [localSettings, setLocalSettings] = useState({
    welcomeTitle: brandingSettings?.welcomeTitle || 'Welcome to EDucore V1',
    welcomeMessage: brandingSettings?.welcomeMessage || 'Empowering education through innovative learning management.',
    onboardingTitle: brandingSettings?.onboardingTitle || 'Join Our Community',
    onboardingMessage: brandingSettings?.onboardingMessage || 'Start your journey with us today. Create an account to access powerful tools for managing learning and assessment with ease.',
    brandColor: brandingSettings?.brandColor || '#1e3a8a',
    logoUrl: brandingSettings?.logoUrl || '/logo-educore.png',
    faviconUrl: brandingSettings?.faviconUrl || '/favicon.png',
    schoolName: brandingSettings?.schoolName || 'EDucore V1'
  });

  const [logoPreview, setLogoPreview] = useState(localSettings.logoUrl);
  const [faviconPreview, setFaviconPreview] = useState(localSettings.faviconUrl);

  // Sync with parent branding settings
  useEffect(() => {
    setLocalSettings({
      welcomeTitle: brandingSettings?.welcomeTitle || 'Welcome to EDucore V1',
      welcomeMessage: brandingSettings?.welcomeMessage || 'Empowering education through innovative learning management.',
      onboardingTitle: brandingSettings?.onboardingTitle || 'Join Our Community',
      onboardingMessage: brandingSettings?.onboardingMessage || 'Start your journey with us today. Create an account to access powerful tools for managing learning and assessment with ease.',
      brandColor: brandingSettings?.brandColor || '#1e3a8a',
      logoUrl: brandingSettings?.logoUrl || '/logo-educore.png',
      faviconUrl: brandingSettings?.faviconUrl || '/favicon.png',
      schoolName: brandingSettings?.schoolName || 'EDucore V1'
    });
    setLogoPreview(brandingSettings?.logoUrl || '/logo-educore.png');
    setFaviconPreview(brandingSettings?.faviconUrl || '/favicon.png');
  }, [brandingSettings]);

  const handleChange = (field, value) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showError('Image size should be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      if (type === 'logo') {
        setLogoPreview(base64String);
        handleChange('logoUrl', base64String);
      } else if (type === 'favicon') {
        setFaviconPreview(base64String);
        handleChange('faviconUrl', base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    // Update parent state
    setBrandingSettings(localSettings);

    // Save to localStorage
    localStorage.setItem('welcomeTitle', localSettings.welcomeTitle);
    localStorage.setItem('welcomeMessage', localSettings.welcomeMessage);
    localStorage.setItem('onboardingTitle', localSettings.onboardingTitle);
    localStorage.setItem('onboardingMessage', localSettings.onboardingMessage);
    localStorage.setItem('brandColor', localSettings.brandColor);
    localStorage.setItem('schoolLogo', localSettings.logoUrl);
    localStorage.setItem('schoolFavicon', localSettings.faviconUrl);
    localStorage.setItem('schoolName', localSettings.schoolName);

    showSuccess('Branding settings saved successfully!');
  };

  const handleReset = () => {
    const defaultSettings = {
      welcomeTitle: 'Welcome to EDucore V1',
      welcomeMessage: 'Empowering education through innovative learning management.',
      onboardingTitle: 'Join Our Community',
      onboardingMessage: 'Start your journey with us today. Create an account to access powerful tools for managing learning and assessment with ease.',
      brandColor: '#1e3a8a',
      logoUrl: '/logo-educore.png',
      faviconUrl: '/favicon.png',
      schoolName: 'EDucore V1'
    };

    setLocalSettings(defaultSettings);
    setLogoPreview(defaultSettings.logoUrl);
    setFaviconPreview(defaultSettings.faviconUrl);

    // Clear localStorage
    localStorage.removeItem('welcomeTitle');
    localStorage.removeItem('welcomeMessage');
    localStorage.removeItem('onboardingTitle');
    localStorage.removeItem('onboardingMessage');
    localStorage.removeItem('brandColor');
    localStorage.removeItem('schoolLogo');
    localStorage.removeItem('schoolFavicon');
    localStorage.removeItem('schoolName');

    showSuccess('Reset to default branding');
  };

  return (
    <div className="space-y-6">
      {/* Important Notice */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* School Information */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Image size={20} className="text-blue-600" />
            School Information
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                School Name
              </label>
              <input
                type="text"
                value={localSettings.schoolName}
                onChange={(e) => handleChange('schoolName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Enter school name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Brand Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={localSettings.brandColor}
                  onChange={(e) => handleChange('brandColor', e.target.value)}
                  className="w-16 h-16 border border-gray-300 rounded cursor-pointer"
                />
                <div className="flex-1">
                  <div className="w-full h-16 rounded" style={{ backgroundColor: localSettings.brandColor }}></div>
                  <p className="text-xs text-gray-600 mt-2 font-mono">{localSettings.brandColor}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                School Logo
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <img
                  src={logoPreview}
                  alt="Logo Preview"
                  className="w-32 h-32 object-contain mx-auto mb-3"
                  onError={(e) => {
                    e.target.src = '/logo-educore.png';
                  }}
                />
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  <Upload size={18} />
                  Upload Logo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'logo')}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 2MB</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Favicon
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <img
                  src={faviconPreview}
                  alt="Favicon Preview"
                  className="w-16 h-16 object-contain mx-auto mb-3"
                  onError={(e) => {
                    e.target.src = '/favicon.png';
                  }}
                />
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  <Upload size={18} />
                  Upload Favicon
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'favicon')}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">32x32 or 64x64 recommended</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Configuration */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <MessageSquare size={20} className="text-blue-600" />
            Welcome & Onboarding Messages
          </h3>

          <div className="space-y-6">
            {/* Login Page Messages */}
            <div className="border-b pb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Login Page</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Welcome Title
                  </label>
                  <input
                    type="text"
                    value={localSettings.welcomeTitle}
                    onChange={(e) => handleChange('welcomeTitle', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="e.g., Welcome to EDucore Academy"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Welcome Message
                  </label>
                  <textarea
                    value={localSettings.welcomeMessage}
                    onChange={(e) => handleChange('welcomeMessage', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                    placeholder="Enter a welcoming message for users logging in"
                  />
                </div>
              </div>
            </div>

            {/* Registration Page Messages */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Registration Page</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Onboarding Title
                  </label>
                  <input
                    type="text"
                    value={localSettings.onboardingTitle}
                    onChange={(e) => handleChange('onboardingTitle', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="e.g., Join Our Community"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Onboarding Message
                  </label>
                  <textarea
                    value={localSettings.onboardingMessage}
                    onChange={(e) => handleChange('onboardingMessage', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                    placeholder="Enter a motivating message for new users"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold mb-4">Preview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Login Preview */}
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b">
              <p className="text-xs font-semibold text-gray-600">Login Page Preview</p>
            </div>
            <div
              className="p-8 text-white relative overflow-hidden"
              style={{ backgroundColor: localSettings.brandColor }}
            >
              <div className="absolute inset-0 overflow-hidden opacity-10">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
              </div>
              <div className="relative z-10 text-center">
                <img
                  src={logoPreview}
                  alt="Logo"
                  className="w-24 h-24 object-contain mx-auto mb-4"
                  onError={(e) => {
                    e.target.src = '/logo-educore.png';
                  }}
                />
                <h3 className="text-xl font-bold mb-2">{localSettings.welcomeTitle}</h3>
                <p className="text-sm opacity-90">{localSettings.welcomeMessage}</p>
              </div>
            </div>
          </div>

          {/* Registration Preview */}
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b">
              <p className="text-xs font-semibold text-gray-600">Registration Page Preview</p>
            </div>
            <div
              className="p-8 text-white relative overflow-hidden"
              style={{ backgroundColor: localSettings.brandColor }}
            >
              <div className="absolute inset-0 overflow-hidden opacity-10">
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
              </div>
              <div className="relative z-10 text-center">
                <img
                  src={logoPreview}
                  alt="Logo"
                  className="w-24 h-24 object-contain mx-auto mb-4"
                  onError={(e) => {
                    e.target.src = '/logo-educore.png';
                  }}
                />
                <h3 className="text-xl font-bold mb-2">{localSettings.onboardingTitle}</h3>
                <p className="text-sm opacity-90">{localSettings.onboardingMessage}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition"
        >
          <RefreshCw size={20} />
          Reset to Default
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition shadow-lg"
        >
          <Save size={20} />
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default BrandingSettings;
