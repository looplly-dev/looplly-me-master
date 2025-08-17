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

export interface UserProfile {
  sec: 'A' | 'B' | 'C1' | 'C2' | 'D' | 'E';
  gender: 'male' | 'female' | 'other';
  dateOfBirth: Date;
  address: string;
  gpsEnabled: boolean;
  firstName: string;
  lastName: string;
  email?: string;
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