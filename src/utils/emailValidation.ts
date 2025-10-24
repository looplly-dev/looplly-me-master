// Email validation utilities with domain blocking for User Portal registration

export interface EmailValidationResult {
  isValid: boolean;
  normalizedEmail?: string;  // Lowercase, trimmed version
  error?: string;            // Validation error message
  warning?: string;          // Optional warnings (future use)
}

/**
 * Validates and normalizes email addresses for User Portal registration
 * Blocks internal test emails and staff emails
 * 
 * @param email - The email address to validate
 * @returns EmailValidationResult with validation status and normalized email
 */
export function validateAndNormalizeEmail(email: string): EmailValidationResult {
  // Step 1: Normalize (trim whitespace, lowercase)
  const normalized = email.trim().toLowerCase();
  
  if (!normalized) {
    return { isValid: false, error: 'Email is required' };
  }
  
  // Step 2: Extract domain
  const atIndex = normalized.indexOf('@');
  if (atIndex === -1) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  const domain = normalized.substring(atIndex + 1);
  
  if (!domain) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  // Step 3: Block internal test domain (Journey Simulator test users)
  if (domain === 'looplly-testing.internal') {
    return {
      isValid: false,
      error: 'Test emails cannot be used for registration'
    };
  }
  
  // Step 4: Block staff domain (redirect to Admin Portal)
  if (domain === 'looplly.me') {
    return {
      isValid: false,
      error: 'Staff emails must use the Admin Portal'
    };
  }
  
  // Step 5: Block invalid test/local domains
  const invalidDomains = ['.test', '.local', '.localhost', '.invalid', '.example'];
  if (invalidDomains.some(d => domain.endsWith(d))) {
    return {
      isValid: false,
      error: 'Invalid email domain'
    };
  }
  
  // Step 6: Format validation (RFC 5322 simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalized)) {
    return {
      isValid: false,
      error: 'Invalid email format'
    };
  }
  
  // Step 7: Success
  return {
    isValid: true,
    normalizedEmail: normalized
  };
}

/**
 * Simple boolean check if email is valid for public user registration
 * Used in form-level validation
 * 
 * @param email - The email address to validate
 * @returns true if email is valid for User Portal, false otherwise
 */
export function isValidPublicEmail(email: string): boolean {
  const result = validateAndNormalizeEmail(email);
  return result.isValid;
}
