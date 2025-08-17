// Centralized validation utilities
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface RegistrationData {
  countryCode: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  email?: string;
  acceptTerms: boolean;
}

export interface ProfileData {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  address?: string;
  householdIncome?: string;
  ethnicity?: string;
  sec?: string;
}

export const validateRegistration = (data: RegistrationData): ValidationResult => {
  const errors: string[] = [];

  if (!data.mobile.trim()) {
    errors.push('Mobile number is required');
  }

  if (!data.password.trim()) {
    errors.push('Password is required');
  }

  if (!data.confirmPassword.trim()) {
    errors.push('Password confirmation is required');
  }

  if (data.password !== data.confirmPassword) {
    errors.push('Passwords do not match');
  }

  if (!data.acceptTerms) {
    errors.push('Please accept the terms and privacy policy');
  }

  if (data.email && data.email.trim() && !isValidEmail(data.email)) {
    errors.push('Please enter a valid email address');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateProfile = (data: ProfileData): ValidationResult => {
  const errors: string[] = [];

  if (!data.firstName.trim()) {
    errors.push('First name is required');
  }

  if (!data.lastName.trim()) {
    errors.push('Last name is required');
  }

  if (!data.gender.trim()) {
    errors.push('Gender is required');
  }

  if (!data.dateOfBirth.trim()) {
    errors.push('Date of birth is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateMobile = (mobile: string): boolean => {
  // Basic mobile validation - digits only, minimum 7 characters
  const mobileRegex = /^\d{7,15}$/;
  return mobileRegex.test(mobile.replace(/\s+/g, ''));
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};