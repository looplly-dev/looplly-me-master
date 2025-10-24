import { isValidPublicEmail, validateAndNormalizeEmail } from '../emailValidation';

describe('emailValidation', () => {
  describe('isValidPublicEmail', () => {
    it('should accept valid public email addresses', () => {
      expect(isValidPublicEmail('user@gmail.com')).toBe(true);
      expect(isValidPublicEmail('test@yahoo.com')).toBe(true);
      expect(isValidPublicEmail('contact@outlook.com')).toBe(true);
      expect(isValidPublicEmail('info@hotmail.com')).toBe(true);
    });

    it('should reject disposable email domains', () => {
      expect(isValidPublicEmail('test@tempmail.com')).toBe(false);
      expect(isValidPublicEmail('user@throwaway.email')).toBe(false);
      expect(isValidPublicEmail('spam@guerrillamail.com')).toBe(false);
    });

    it('should reject invalid email formats', () => {
      expect(isValidPublicEmail('notanemail')).toBe(false);
      expect(isValidPublicEmail('@example.com')).toBe(false);
      expect(isValidPublicEmail('user@')).toBe(false);
      expect(isValidPublicEmail('')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(isValidPublicEmail('USER@GMAIL.COM')).toBe(true);
      expect(isValidPublicEmail('Test@Yahoo.COM')).toBe(true);
    });

    it('should handle emails with subdomains', () => {
      expect(isValidPublicEmail('user@mail.yahoo.com')).toBe(true);
      expect(isValidPublicEmail('test@subdomain.example.com')).toBe(true);
    });

    it('should reject emails with only spaces', () => {
      expect(isValidPublicEmail('   ')).toBe(false);
    });

    it('should handle plus addressing', () => {
      expect(isValidPublicEmail('user+tag@gmail.com')).toBe(true);
      expect(isValidPublicEmail('test+123@yahoo.com')).toBe(true);
    });
  });
});
