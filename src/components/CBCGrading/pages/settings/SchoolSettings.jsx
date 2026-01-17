/**
 * School Settings Page
 */

import React, { useState, useRef, useEffect } from 'react';
import { School, Save, Upload, X } from 'lucide-react';
import PageHeader from '../../shared/PageHeader';
import { useNotifications } from '../../hooks/useNotifications';

const SchoolSettings = ({ brandingSettings, setBrandingSettings }) => {
  const { showSuccess } = useNotifications();
  const fileInputRef = useRef(null);
  
  // Load saved settings from localStorage on mount
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('schoolSettings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (e) {
        console.error('Error parsing saved settings:', e);
      }
    }
    
    // Default settings
    return {
      schoolName: brandingSettings?.schoolName || 'Zawadi Junior School',
      address: '123 Education Lane, Nairobi',
      phone: '+254700000000',
      email: 'info@zawadischool.ac.ke',
      motto: 'Excellence in Education',
      vision: 'To provide quality education for all learners',
      mission: 'Nurturing future leaders through innovative learning'
    };
  });

  const [logoPreview, setLogoPreview] = useState(() => {
    const savedLogo = localStorage.getItem('schoolLogo');
    return savedLogo || brandingSettings?.logoUrl || '/logo-zawadi.png';
  });

  // Update branding settings when component mounts
  useEffect(() => {
    if (setBrandingSettings) {
      setBrandingSettings(prev => ({
        ...prev,
        logoUrl: logoPreview,
        schoolName: settings.schoolName
      }));
    }
  }, [logoPreview, settings.schoolName, setBrandingSettings]);

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (PNG, JPG, SVG)');
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const logoUrl = reader.result;
        setLogoPreview(logoUrl);
        showSuccess('Logo uploaded! Click "Save Changes" to persist.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview('/logo-zawadi.png');
    showSuccess('Logo removed. Click "Save Changes" to persist.');
  };

  const handleSave = () => {
    try {
      // Save all settings to localStorage
      localStorage.setItem('schoolSettings', JSON.stringify(settings));
      localStorage.setItem('schoolLogo', logoPreview);
      localStorage.setItem('schoolName', settings.schoolName);
      
      // Update branding settings in app state
      if (setBrandingSettings) {
        setBrandingSettings(prev => ({
          ...prev,
          logoUrl: logoPreview,
          schoolName: settings.schoolName,
          welcomeTitle: `Welcome to ${settings.schoolName}`,
          welcomeMessage: settings.motto || 'Empowering education through innovative learning management.'
        }));
      }
      
      showSuccess('All settings saved successfully! Logo will appear everywhere.');
      
      // Force a small delay to ensure state updates propagate
      setTimeout(() => {
        window.dispatchEvent(new Event('storage'));
      }, 100);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="School Settings" subtitle="Configure school information and upload logo" icon={School} />

      {/* Important Notice */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Important:</strong> Make sure to click <strong>"Save Changes"</strong> at the bottom to persist your logo and settings. 
              The logo will then appear on the login page and sidebar permanently.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="space-y-6">
          {/* Logo Upload Section */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-bold mb-4">School Logo</h3>
            <div className="flex items-start gap-6">
              {/* Logo Preview */}
              <div className="relative">
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="School Logo" 
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        e.target.src = '/logo-zawadi.png';
                      }}
                    />
                  ) : (
                    <School size={48} className="text-gray-400" />
                  )}
                </div>
                {logoPreview && logoPreview !== '/logo-zawadi.png' && (
                  <button
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition"
                    title="Remove Logo"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Upload Instructions */}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-2">Upload School Logo</h4>
                <p className="text-sm text-gray-600 mb-3">
                  This logo will appear on the login page and in the sidebar. 
                  For best results, use a square image (recommended: 200x200px or larger).
                </p>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>• Supported formats: JPG, PNG, SVG</p>
                  <p>• Maximum file size: 2MB</p>
                  <p>• Recommended dimensions: 200x200px</p>
                  <p className="text-orange-600 font-semibold">• Click "Save Changes" below to persist the logo!</p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                
                <div className="flex gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Upload size={20} />
                    Upload Logo
                  </button>
                  
                  {logoPreview && logoPreview !== '/logo-zawadi.png' && (
                    <button
                      onClick={handleRemoveLogo}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      <X size={20} />
                      Use Default
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-bold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">School Name *</label>
                <input 
                  type="text" 
                  value={settings.schoolName} 
                  onChange={(e) => handleChange('schoolName', e.target.value)} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="Enter school name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  value={settings.email} 
                  onChange={(e) => handleChange('email', e.target.value)} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="school@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input 
                  type="tel" 
                  value={settings.phone} 
                  onChange={(e) => handleChange('phone', e.target.value)} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="+254700000000"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                <input 
                  type="text" 
                  value={settings.address} 
                  onChange={(e) => handleChange('address', e.target.value)} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="School address"
                />
              </div>
            </div>
          </div>

          {/* School Identity */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold mb-4">School Identity</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">School Motto</label>
                <input 
                  type="text" 
                  value={settings.motto} 
                  onChange={(e) => handleChange('motto', e.target.value)} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="Enter school motto"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vision Statement</label>
                <textarea 
                  value={settings.vision} 
                  onChange={(e) => handleChange('vision', e.target.value)} 
                  rows="3" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="Enter school vision"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mission Statement</label>
                <textarea 
                  value={settings.mission} 
                  onChange={(e) => handleChange('mission', e.target.value)} 
                  rows="3" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="Enter school mission"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t">
            <button 
              onClick={handleSave} 
              className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold shadow-lg"
            >
              <Save size={20} />
              Save Changes (Persist Logo & Settings)
            </button>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold mb-4">Preview - How it will appear</h3>
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <img 
              src={logoPreview} 
              alt="School Logo Preview" 
              className="w-16 h-16 object-contain"
              onError={(e) => {
                e.target.src = '/logo-zawadi.png';
              }}
            />
            <div>
              <h4 className="text-xl font-bold text-gray-800">{settings.schoolName}</h4>
              <p className="text-gray-600 italic">{settings.motto}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 font-semibold">Email:</p>
              <p className="text-gray-800">{settings.email}</p>
            </div>
            <div>
              <p className="text-gray-600 font-semibold">Phone:</p>
              <p className="text-gray-800">{settings.phone}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-600 font-semibold">Address:</p>
              <p className="text-gray-800">{settings.address}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolSettings;
