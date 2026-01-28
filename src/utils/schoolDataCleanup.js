/**
 * School Data Cleanup Utilities
 * 
 * This module provides functions to clear school-specific data from localStorage
 * to ensure a fresh start when logging in to a new school or switching accounts.
 */

/**
 * List of all school-specific localStorage keys that should be cleared
 * 
 * IMPORTANT: The following keys are INTENTIONALLY EXCLUDED to prevent data loss:
 * - currentSchoolId: Must persist to maintain school context
 * - cbc_last_school_id: Tracks school changes, needed for proper initialization
 * - token/authToken: Only cleared on explicit logout
 * - user: Only cleared on explicit logout
 */
export const SCHOOL_DATA_KEYS = [
  'schoolSettings',
  'schoolLogo',
  'schoolFavicon',
  'schoolName',
  'brandColor',
  'welcomeTitle',
  'welcomeMessage',
  'onboardingTitle',
  'onboardingMessage',
  'registrationDraft',
  'prefillEmail',
  // DO NOT ADD: 'currentSchoolId' - Critical for data persistence
  // DO NOT ADD: 'cbc_last_school_id' - Needed for school switching logic
];

/**
 * Clear all school-specific data from localStorage
 * Call this function on logout or when switching schools
 * 
 * @returns {Object} Result object with success status and count of cleared items
 */
export const clearAllSchoolData = () => {
  let clearedCount = 0;
  const errors = [];

  SCHOOL_DATA_KEYS.forEach(key => {
    try {
      if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
        clearedCount++;
      }
    } catch (error) {
      errors.push({ key, error: error.message });
    }
  });

  if (errors.length > 0) {
    console.error('Errors clearing school data:', errors);
  }

  console.log(`✅ Cleared ${clearedCount} school data items from localStorage`);
  console.log('🔒 Protected keys (NOT cleared): currentSchoolId, cbc_last_school_id, token, user');

  return {
    success: errors.length === 0,
    clearedCount,
    errors
  };
};

/**
 * Check if there is any school data stored in localStorage
 * 
 * @returns {boolean} True if any school data exists
 */
export const hasStoredSchoolData = () => {
  return SCHOOL_DATA_KEYS.some(key => localStorage.getItem(key) !== null);
};

/**
 * Get all currently stored school data as an object
 * Useful for debugging and data inspection
 * 
 * @returns {Object} Object containing all stored school data
 */
export const getStoredSchoolData = () => {
  const data = {};
  
  SCHOOL_DATA_KEYS.forEach(key => {
    const value = localStorage.getItem(key);
    if (value !== null) {
      data[key] = value;
    }
  });

  return data;
};

/**
 * Initialize fresh school data from backend response
 * Call this after successful login to populate school-specific settings
 * 
 * @param {Object} schoolData - School data from backend API
 */
export const initializeSchoolData = (schoolData) => {
  if (!schoolData) {
    console.warn('No school data provided for initialization');
    return;
  }

  try {
    const settings = {
      schoolName: schoolData.name || '',
      address: schoolData.address || '',
      phone: schoolData.phone || '',
      email: schoolData.email || '',
      motto: schoolData.motto || '',
      vision: schoolData.vision || '',
      mission: schoolData.mission || ''
    };

    localStorage.setItem('schoolSettings', JSON.stringify(settings));
    localStorage.setItem('schoolName', schoolData.name || '');

    // Only set logo/favicon if they exist in the backend
    if (schoolData.logoUrl) {
      localStorage.setItem('schoolLogo', schoolData.logoUrl);
    }
    if (schoolData.faviconUrl) {
      localStorage.setItem('schoolFavicon', schoolData.faviconUrl);
    }

    console.log('✅ School data initialized successfully');
  } catch (error) {
    console.error('Error initializing school data:', error);
  }
};
