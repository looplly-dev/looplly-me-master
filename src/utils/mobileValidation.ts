// Mobile number validation utilities using libphonenumber-js
import { parsePhoneNumber, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';
import { getISOFromDialCode } from './countries';

export interface MobileValidationResult {
  isValid: boolean;
  normalizedNumber?: string;  // E.164 format: +27823093959
  nationalFormat?: string;     // National format: 082 309 3959
  error?: string;
}

/**
 * Validate and normalize mobile number with country awareness
 * Handles all common input variations and provides detailed feedback
 * 
 * @param mobile - Raw mobile number input (e.g., "0823093959", "823093959", "082 309 3959")
 * @param countryDialCode - Dial code with + prefix (e.g., "+27")
 * @returns Validation result with normalized number and error if invalid
 * 
 * @example
 * validateAndNormalizeMobile("0823093959", "+27")
 * // Returns: { isValid: true, normalizedNumber: "+27823093959", nationalFormat: "082 309 3959" }
 * 
 * @example
 * validateAndNormalizeMobile("1234567", "+27")
 * // Returns: { isValid: false, error: "Number too short for ZA" }
 */
export const validateAndNormalizeMobile = (
  mobile: string,
  countryDialCode: string
): MobileValidationResult => {
  try {
    // Get ISO code from dial code (e.g., '+27' → 'ZA')
    const countryISO = getISOFromDialCode(countryDialCode);
    
    if (!countryISO) {
      return {
        isValid: false,
        error: 'Invalid country code selected'
      };
    }

    // Remove all spaces, dashes, parentheses
    let cleanInput = mobile.replace(/[\s\-\(\)]/g, '');
    
    // If user included country code in the mobile field, strip it
    const dialCodeWithoutPlus = countryDialCode.replace('+', '');
    if (cleanInput.startsWith(dialCodeWithoutPlus)) {
      cleanInput = cleanInput.substring(dialCodeWithoutPlus.length);
    }
    if (cleanInput.startsWith(countryDialCode)) {
      cleanInput = cleanInput.substring(countryDialCode.length);
    }
    
    // Remove leading zeros (common in local format)
    cleanInput = cleanInput.replace(/^0+/, '');
    
    // Construct full international number
    const fullNumber = `${countryDialCode}${cleanInput}`;
    
    // Parse and validate using libphonenumber
    const phoneNumber = parsePhoneNumber(fullNumber, countryISO as CountryCode);
    
    if (!phoneNumber) {
      return {
        isValid: false,
        error: 'Could not parse phone number'
      };
    }
    
    // Check if it's valid for the specified country
    if (!phoneNumber.isValid()) {
      // Provide specific error based on what's wrong
      const nationalNumber = phoneNumber.nationalNumber;
      if (nationalNumber.length < 9) {
        return {
          isValid: false,
          error: `Number too short for ${countryISO}`
        };
      }
      if (nationalNumber.length > 11) {
        return {
          isValid: false,
          error: `Number too long for ${countryISO}`
        };
      }
      return {
        isValid: false,
        error: `Invalid mobile number format for ${countryISO}`
      };
    }
    
    // Verify it's a mobile number (not landline)
    const phoneType = phoneNumber.getType();
    if (phoneType && phoneType !== 'MOBILE' && phoneType !== 'FIXED_LINE_OR_MOBILE') {
      return {
        isValid: false,
        error: 'Please enter a mobile number (not a landline)'
      };
    }
    
    return {
      isValid: true,
      normalizedNumber: phoneNumber.number,  // E.164: +27823093959
      nationalFormat: phoneNumber.formatNational()  // 082 309 3959
    };
    
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Invalid phone number'
    };
  }
};

/**
 * Quick validation check (for form-level validation)
 * 
 * @param mobile - Raw mobile number input
 * @param countryDialCode - Dial code with + prefix
 * @returns true if valid, false otherwise
 */
export const isValidMobileForCountry = (
  mobile: string,
  countryDialCode: string
): boolean => {
  const result = validateAndNormalizeMobile(mobile, countryDialCode);
  return result.isValid;
};

/**
 * Format mobile number for display
 * 
 * @param mobile - Mobile number (preferably in E.164 format)
 * @param countryDialCode - Dial code with + prefix
 * @param format - 'international' (+27 82 309 3959) or 'national' (082 309 3959)
 * @returns Formatted mobile number or original if can't parse
 */
export const formatMobileForDisplay = (
  mobile: string,
  countryDialCode: string,
  format: 'international' | 'national' = 'national'
): string => {
  try {
    const countryISO = getISOFromDialCode(countryDialCode);
    if (!countryISO) return mobile;
    
    const phoneNumber = parsePhoneNumber(mobile, countryISO as CountryCode);
    
    if (!phoneNumber) return mobile;
    
    return format === 'international' 
      ? phoneNumber.formatInternational()  // +27 82 309 3959
      : phoneNumber.formatNational();       // 082 309 3959
  } catch {
    return mobile;
  }
};
