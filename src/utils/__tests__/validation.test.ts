import { validateProfile, validateMobile } from '../validation';

describe('Validation Utils', () => {
  describe('validateProfile', () => {
    const validProfile = {
      sec: 'A' as const,
      gender: 'male' as const,
      dateOfBirth: '1990-01-01',
      address: '123 Main St, City, State',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    };

    it('should return valid for a complete profile', () => {
      const result = validateProfile(validProfile);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return error for missing SEC', () => {
      const invalidProfile = { ...validProfile, sec: undefined as any };
      const result = validateProfile(invalidProfile);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('SEC is required');
    });

    it('should return error for missing gender', () => {
      const invalidProfile = { ...validProfile, gender: undefined as any };
      const result = validateProfile(invalidProfile);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Gender is required');
    });

    it('should return error for missing date of birth', () => {
      const invalidProfile = { ...validProfile, dateOfBirth: undefined as any };
      const result = validateProfile(invalidProfile);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Date of birth is required');
    });

    it('should return error for missing address', () => {
      const invalidProfile = { ...validProfile, address: '' };
      const result = validateProfile(invalidProfile);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Address is required');
    });

    it('should return error for missing first name', () => {
      const invalidProfile = { ...validProfile, firstName: '' };
      const result = validateProfile(invalidProfile);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('First name is required');
    });

    it('should return error for missing last name', () => {
      const invalidProfile = { ...validProfile, lastName: '' };
      const result = validateProfile(invalidProfile);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Last name is required');
    });

    it('should return error for invalid email', () => {
      const invalidProfile = { ...validProfile, email: 'invalid-email' };
      const result = validateProfile(invalidProfile);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Please enter a valid email address');
    });

    it('should handle multiple validation errors', () => {
      const invalidProfile = {
        ...validProfile,
        firstName: '',
        lastName: '',
        email: 'invalid-email',
        address: '',
      };
      const result = validateProfile(invalidProfile);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(4);
      expect(result.errors).toContain('First name is required');
      expect(result.errors).toContain('Last name is required');
      expect(result.errors).toContain('Please enter a valid email address');
      expect(result.errors).toContain('Address is required');
    });
  });

  describe('validateMobile', () => {
    it('should return true for valid mobile numbers', () => {
      expect(validateMobile('1234567890')).toBe(true);
      expect(validateMobile('9876543210')).toBe(true);
      expect(validateMobile('5555555555')).toBe(true);
    });

    it('should return false for invalid mobile numbers', () => {
      expect(validateMobile('123')).toBe(false); // Too short
      expect(validateMobile('12345678901')).toBe(false); // Too long
      expect(validateMobile('abcdefghij')).toBe(false); // Not numeric
      expect(validateMobile('')).toBe(false); // Empty
      expect(validateMobile('123-456-7890')).toBe(false); // With dashes
      expect(validateMobile('+1234567890')).toBe(false); // With country code
    });

    it('should handle edge cases', () => {
      expect(validateMobile('0000000000')).toBe(true); // All zeros (valid format)
      expect(validateMobile('1111111111')).toBe(true); // All ones (valid format)
    });
  });
});