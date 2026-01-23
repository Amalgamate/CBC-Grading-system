/**
 * School Settings Page
 */

import React, { useState, useRef, useEffect } from 'react';
import { School, Save, Upload, X, AlertTriangle } from 'lucide-react';
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

  const [faviconPreview, setFaviconPreview] = useState(() => {
    const savedFavicon = localStorage.getItem('schoolFavicon');
    return savedFavicon || brandingSettings?.faviconUrl || '/favicon.png';
  });

  const faviconInputRef = useRef(null);

  // Track initial state for dirty checking
  const [savedState, setSavedState] = useState(() => ({
    settings: settings,
    logo: logoPreview,
    favicon: faviconPreview
  }));

  // Check for unsaved changes
  const hasUnsavedChanges = 
    JSON.stringify(settings) !== JSON.stringify(savedState.settings) ||
    logoPreview !== savedState.logo ||
    faviconPreview !== savedState.favicon;

  // Warn on page leave if unsaved
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Update branding settings when component mounts
  useEffect(() => {
    if (setBrandingSettings) {
      setBrandingSettings(prev => ({
        ...prev,
        logoUrl: logoPreview,
        faviconUrl: faviconPreview,
        schoolName: settings.schoolName
      }));
    }
  }, [logoPreview, faviconPreview, settings.schoolName, setBrandingSettings]);

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

  const handleFaviconUpload = (e) => {
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

      const reader = new FileReader();
      reader.onloadend = () => {
        setFaviconPreview(reader.result);
        showSuccess('Favicon uploaded! Click "Save Changes" to persist.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFavicon = () => {
    setFaviconPreview('/favicon.png');
    showSuccess('Favicon reset to default. Click "Save Changes" to persist.');
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
      localStorage.setItem('schoolFavicon', faviconPreview);
      localStorage.setItem('schoolName', settings.schoolName);
      
      // Update branding settings in app state
      if (setBrandingSettings) {
        setBrandingSettings(prev => ({
          ...prev,
          logoUrl: logoPreview,
          faviconUrl: faviconPreview,
          schoolName: settings.schoolName,
          welcomeTitle: `Welcome to ${settings.schoolName}`,
          welcomeMessage: settings.motto || 'Empowering education through innovative learning management.'
        }));
      }
      
      // Update saved state to current values
      setSavedState({
        settings: settings,
        logo: logoPreview,
        favicon: faviconPreview
      });

      showSuccess('All settings saved successfully! Logo and favicon will appear everywhere.');
      
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
      {/* Unsaved Changes Notification */}
      {hasUnsavedChanges && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg flex justify-between items-center animate-pulse">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                <strong>Unsaved Changes:</strong> You have made changes to the school settings. 
                Please save your changes to ensure they are applied.
              </p>
            </div>
          </div>
          <button 
            onClick={handleSave}
            className="ml-4 px-3 py-1 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded text-sm font-medium transition"
          >
            Save Now
          </button>
        </div>
      )}

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

                {/* Favicon Upload */}
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Favicon</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 border rounded flex items-center justify-center bg-gray-50 overflow-hidden">
                      <img src={faviconPreview} alt="Favicon" className="w-full h-full object-contain p-1" onError={(e) => { e.target.src = '/favicon.png'; }} />
                    </div>
                    <div className="flex gap-2 items-center">
                      <input ref={faviconInputRef} type="file" accept=".png,.svg,.jpg,.jpeg" onChange={handleFaviconUpload} className="hidden" />
                      <button onClick={() => faviconInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                        Upload Favicon
                      </button>
                      {faviconPreview && faviconPreview !== '/favicon.png' && (
                        <button onClick={handleRemoveFavicon} className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm">Remove</button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">Recommended: PNG or SVG, max 200 KB</p>
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
