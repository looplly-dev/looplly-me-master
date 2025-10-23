export interface User {
  id: string;
  mobile: string;
  countryCode: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  isVerified: boolean;
  profileComplete: boolean;
  mustChangePassword?: boolean;
  profile?: UserProfile;
}

/**
 * User profile data structure
 * 
 * Country identification:
 * - country_code: Phone dial code (e.g., '+27') - Source of Truth
 * - country_iso: ISO 3166-1 alpha-2 code (e.g., 'ZA') - Auto-derived via DB trigger
 * 
 * User type classification:
 * - looplly_user: Regular users (main user base)
 * - looplly_team_user: Looplly staff (access admin portal)
 * - client_user: B2B clients (future implementation)
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
  user_type?: 'looplly_user' | 'looplly_team_user' | 'client_user';
  company_name?: string;  // For team members: team name; For clients: company name
  company_role?: string;  // For team members: job title; For clients: role at company
  must_change_password?: boolean;  // Team member invitation flag
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