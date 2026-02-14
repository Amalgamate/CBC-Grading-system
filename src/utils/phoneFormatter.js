/**
 * Phone Number Formatter Utility
 * Standardizes Kenyan phone numbers to international format (+254)
 */

/**
 * Format phone number to international format (+254)
 * Handles multiple input formats:
 * - 0712345678 -> +254712345678
 * - 254712345678 -> +254712345678
 * - +254712345678 -> +254712345678
 * - 712345678 -> +254712345678
 * 
 * @param {string} phone - Phone number in various formats
 * @returns {string} Formatted phone number (+254...)
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  if (!cleaned) return '';
  
  // Already in 254 format with correct length
  if (cleaned.startsWith('254') && cleaned.length === 12) {
    return `+${cleaned}`;
  }
  
  // Starts with 0 (Kenya format)
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `+254${cleaned.substring(1)}`;
  }
  
  // 9 digits without country code
  if (cleaned.length === 9 && !cleaned.startsWith('0')) {
    return `+254${cleaned}`;
  }
  
  // Already has country code but missing +
  if (cleaned.startsWith('254') && cleaned.length === 12) {
    return `+${cleaned}`;
  }
  
  // Default: assume it needs a country code
  return `+254${cleaned.substring(cleaned.startsWith('0') ? 1 : 0)}`;
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export const isValidPhoneNumber = (phone) => {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, '');
  // Valid if:
  // - 10 digits starting with 0 (Kenya format like 0712345678)
  // - 9 digits without country code (like 712345678)
  // - 12 digits with country code (like 254712345678)
  return cleaned.length === 10 || cleaned.length === 9 || cleaned.length === 12;
};

/**
 * Get display format (for showing in UI)
 * @param {string} phone - Phone number
 * @returns {string} Display format
 */
export const getDisplayPhoneNumber = (phone) => {
  const formatted = formatPhoneNumber(phone);
  // Show as +254 712 345 678
  if (formatted.length === 13) {
    return `${formatted.substring(0, 4)} ${formatted.substring(4, 7)} ${formatted.substring(7, 10)} ${formatted.substring(10)}`;
  }
  return formatted;
};

/**
 * Normalize multiple phone numbers from a parent object
 * Handles various property names from database
 * @param {object} parent - Parent/guardian object
 * @returns {string} Formatted phone number (or empty string)
 */
export const getParentPhoneNumber = (parent) => {
  if (!parent) return '';
  
  // Check multiple possible phone number properties
  const possiblePhones = [
    parent.phone,
    parent.phoneNumber,
    parent.mobilePhone,
    parent.guardianPhone,
    parent.parentPhone,
    parent.contactPhone,
    parent.primaryPhone
  ];
  
  for (const phone of possiblePhones) {
    if (phone && isValidPhoneNumber(phone)) {
      return formatPhoneNumber(phone);
    }
  }
  
  return '';
};
