// Centralized validation utilities
import { isValidPublicEmail } from './emailValidation';
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface RegistrationData {
  countryCode: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  gpsEnabled: boolean;
  firstName?: string;
  lastName?: string;
  acceptTerms: boolean;
  acceptPrivacyPolicy?: boolean;
  confirmAge?: boolean;
  privacyPolicyAcceptedAt?: string;
  ageVerifiedAt?: string;
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

  if (!data.firstName?.trim()) {
    errors.push('First name is required');
  }

  if (!data.lastName?.trim()) {
    errors.push('Last name is required');
  }

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

  if (!data.acceptTerms && !data.acceptPrivacyPolicy) {
    errors.push('Please accept the privacy policy and confirm your age');
  }

  if (!data.acceptPrivacyPolicy) {
    errors.push('Please accept the Privacy Policy and Terms of Service');
  }

  if (!data.confirmAge) {
    errors.push('You must confirm you are 18 years or older');
  }

  // DOB validation - required and 18+ check
  if (!data.dateOfBirth?.trim()) {
    errors.push('Date of birth is required');
  } else {
    const dob = new Date(data.dateOfBirth);
    const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 18) {
      errors.push('You must be 18 years or older to register');
    }
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