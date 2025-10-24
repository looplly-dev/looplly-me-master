import { validateAndNormalizeMobile, formatMobileForDisplay } from '../mobileValidation';

describe('mobileValidation', () => {
  describe('validateAndNormalizeMobile', () => {
    it('should validate US mobile numbers', () => {
      expect(validateAndNormalizeMobile('2025551234', '+1').isValid).toBe(true);
      expect(validateAndNormalizeMobile('(202) 555-1234', '+1').isValid).toBe(true);
      expect(validateAndNormalizeMobile('202-555-1234', '+1').isValid).toBe(true);
    });

    it('should validate UK mobile numbers', () => {
      expect(validateAndNormalizeMobile('7400123456', '+44').isValid).toBe(true);
      expect(validateAndNormalizeMobile('07400123456', '+44').isValid).toBe(true);
    });

    it('should validate AU mobile numbers', () => {
      expect(validateAndNormalizeMobile('412345678', '+61').isValid).toBe(true);
      expect(validateAndNormalizeMobile('0412345678', '+61').isValid).toBe(true);
    });

    it('should reject invalid mobile numbers', () => {
      expect(validateAndNormalizeMobile('123', '+1').isValid).toBe(false);
      expect(validateAndNormalizeMobile('notanumber', '+1').isValid).toBe(false);
      expect(validateAndNormalizeMobile('', '+1').isValid).toBe(false);
    });

    it('should provide error messages', () => {
      const result = validateAndNormalizeMobile('123', '+1');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle international formats', () => {
      expect(validateAndNormalizeMobile('612345678', '+33').isValid).toBe(true);
      expect(validateAndNormalizeMobile('1512345678', '+49').isValid).toBe(true);
      expect(validateAndNormalizeMobile('9012345678', '+81').isValid).toBe(true);
    });

    it('should strip formatting characters', () => {
      expect(validateAndNormalizeMobile('(202) 555-1234', '+1').isValid).toBe(true);
      expect(validateAndNormalizeMobile('202.555.1234', '+1').isValid).toBe(true);
      expect(validateAndNormalizeMobile('202 555 1234', '+1').isValid).toBe(true);
    });
  });

  describe('formatMobileForDisplay', () => {
    it('should format US numbers', () => {
      const formatted = formatMobileForDisplay('+12025551234', '+1');
      expect(formatted).toContain('202');
    });

    it('should format UK numbers', () => {
      const formatted = formatMobileForDisplay('+447400123456', '+44');
      expect(formatted).toContain('7400');
    });

    it('should return input for invalid numbers', () => {
      const formatted = formatMobileForDisplay('invalid', '+1');
      expect(formatted).toBe('invalid');
    });
  });
});
