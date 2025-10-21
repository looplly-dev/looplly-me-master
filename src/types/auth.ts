export interface User {
  id: string;
  mobile: string;
  countryCode: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  isVerified: boolean;
  profileComplete: boolean;
  profile?: UserProfile;
}

/**
 * User profile data structure
 * 
 * Country identification:
 * - country_code: Phone dial code (e.g., '+27') - Source of Truth
 * - country_iso: ISO 3166-1 alpha-2 code (e.g., 'ZA') - Auto-derived via DB trigger
 * 
 * The ISO code is automatically derived from the dial code via database trigger.
 * See docs/COUNTRY_CODE_SPECIFICATION.md for details.
 */
export interface UserProfile {
  sec: 'A' | 'B' | 'C1' | 'C2' | 'D' | 'E';
  gender: 'male' | 'female' | 'other';
  dateOfBirth: Date;
  address: string;
  gpsEnabled: boolean;
  firstName: string;
  lastName: string;
  email?: string;
  country_code?: string;  // Dial code (e.g., '+27') - Source of Truth
  country_iso?: string;   // ISO code (e.g., 'ZA') - Auto-derived
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  step: 'login' | 'otp-verification' | 'profile-setup' | 'communication-preferences' | 'dashboard';
}

export interface Country {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
}