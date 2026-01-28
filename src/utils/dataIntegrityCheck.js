/**
 * Data Integrity Checker
 * Verifies that critical data is present and correct
 * Helps prevent and debug data loss issues
 */

export const verifyDataIntegrity = () => {
  const checks = {
    hasToken: false,
    hasUser: false,
    hasSchoolId: false,
    schoolIdMatches: false,
    details: {
      token: null,
      userId: null,
      currentSchoolId: null,
      userSchoolId: null,
      lastSchoolId: null,
    }
  };

  // Check 1: Token exists
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  checks.hasToken = !!token;
  checks.details.token = token ? 'present' : 'missing';

  // Check 2: User data exists
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      checks.hasUser = !!user;
      checks.details.userId = user.id || user.userId || 'unknown';
      
      // Check 3: School ID exists
      const currentSchoolId = localStorage.getItem('currentSchoolId');
      const userSchoolId = user.schoolId || user.school?.id;
      const lastSchoolId = localStorage.getItem('cbc_last_school_id');
      
      checks.details.currentSchoolId = currentSchoolId || 'missing';
      checks.details.userSchoolId = userSchoolId || 'missing';
      checks.details.lastSchoolId = lastSchoolId || 'missing';
      
      checks.hasSchoolId = !!currentSchoolId;
      
      // Check 4: School IDs match
      checks.schoolIdMatches = currentSchoolId === userSchoolId;
      
      // Auto-fix: If user has school ID but localStorage doesn't
      if (userSchoolId && !currentSchoolId) {
        localStorage.setItem('currentSchoolId', userSchoolId);
        localStorage.setItem('cbc_last_school_id', userSchoolId);
        checks.hasSchoolId = true;
        checks.schoolIdMatches = true;
        checks.details.currentSchoolId = userSchoolId;
        console.log('✅ Auto-fixed: Restored school ID from user data:', userSchoolId);
      }
      
      // Auto-fix: If current and last school IDs don't match, update last
      if (currentSchoolId && lastSchoolId !== currentSchoolId) {
        localStorage.setItem('cbc_last_school_id', currentSchoolId);
        console.log('✅ Auto-fixed: Synchronized last school ID with current');
      }
    }
  } catch (e) {
    console.error('❌ Error verifying data integrity:', e);
  }

  return checks;
};

export const logDataIntegrity = () => {
  const checks = verifyDataIntegrity();
  
  console.group('🔍 Data Integrity Check');
  console.log('Token:', checks.hasToken ? '✅ Present' : '❌ Missing');
  console.log('User Data:', checks.hasUser ? '✅ Present' : '❌ Missing');
  console.log('School ID:', checks.hasSchoolId ? '✅ Present' : '❌ Missing');
  console.log('School IDs Match:', checks.schoolIdMatches ? '✅ Yes' : '⚠️ No');
  
  console.group('📋 Details');
  console.log('Token Status:', checks.details.token);
  console.log('User ID:', checks.details.userId);
  console.log('Current School ID:', checks.details.currentSchoolId);
  console.log('User School ID:', checks.details.userSchoolId);
  console.log('Last School ID:', checks.details.lastSchoolId);
  console.groupEnd();
  
  // Overall status
  const allChecksPass = checks.hasToken && checks.hasUser && checks.hasSchoolId && checks.schoolIdMatches;
  console.log('');
  console.log('Overall Status:', allChecksPass ? '✅ All checks passed' : '⚠️ Issues detected');
  console.groupEnd();
  
  return checks;
};

/**
 * Ensure school ID is set from user data if missing
 * @returns {string|null} The school ID or null if not available
 */
export const ensureSchoolIdFromUser = () => {
  let schoolId = localStorage.getItem('currentSchoolId');
  
  if (!schoolId) {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        schoolId = user.schoolId || user.school?.id;
        
        if (schoolId) {
          localStorage.setItem('currentSchoolId', schoolId);
          localStorage.setItem('cbc_last_school_id', schoolId);
          console.log('✅ School ID restored from user object:', schoolId);
        }
      }
    } catch (e) {
      console.error('❌ Error restoring school ID from user:', e);
    }
  }
  
  return schoolId;
};

/**
 * Export all localStorage data for debugging
 * @returns {Object} All localStorage data
 */
export const exportLocalStorageData = () => {
  const data = {};
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      try {
        const value = localStorage.getItem(key);
        // Try to parse as JSON, otherwise store as string
        try {
          data[key] = JSON.parse(value);
        } catch {
          data[key] = value;
        }
      } catch (e) {
        data[key] = '<error reading value>';
      }
    }
  }
  
  console.log('📦 LocalStorage Export:', data);
  return data;
};
