import { useState, useEffect, createContext, useContext } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthState } from '@/types/auth';
import { registerUser, loginUser, logoutUser, resetUserPassword } from '@/utils/auth';
import { updateUserProfile, fetchUserProfile } from '@/utils/profile';

const AuthContext = createContext<{
  authState: AuthState;
  login: (mobile: string, password: string) => Promise<boolean>;
  verifyOTP: (code: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  completeProfile: (profile: any) => Promise<boolean>;
  updateCommunicationPreferences: (preferences: any) => Promise<boolean>;
  logout: () => void;
  forgotPassword: (mobile: string) => Promise<boolean>;
  resetPassword: (mobile: string, otp: string, password: string) => Promise<boolean>;
} | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Mock authentication functions
export const useAuthLogic = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    step: 'login'
  });

  console.log('useAuthLogic - Current authState:', authState);

  // Mock user data
  const mockUser: User = {
    id: 'mock-user-123',
    mobile: '+447708997235',
    countryCode: '+44',
    email: 'nadia.gaspari1@outlook.com',
    firstName: 'Nadia',
    lastName: 'Gaspari',
    isVerified: true,
    profileComplete: true,
    profile: {
      sec: 'B' as const,
      gender: 'female' as const,
      dateOfBirth: new Date('1990-01-01'),
      address: '123 Mock Street, London, UK',
      gpsEnabled: true,
      firstName: 'Nadia',
      lastName: 'Gaspari',
      email: 'nadia.gaspari1@outlook.com'
    }
  };

  useEffect(() => {
    // Auto-login with mock user after 1 second
    const timer = setTimeout(() => {
      setAuthState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        step: 'dashboard'
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const register = async (data: any): Promise<boolean> => {
    console.log('Mock registration with data:', data);
    // Simulate registration delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setAuthState({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      step: 'dashboard'
    });
    return true;
  };

  const login = async (mobile: string, password: string): Promise<boolean> => {
    console.log('Mock login with mobile:', mobile);
    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setAuthState({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      step: 'dashboard'
    });
    return true;
  };

  const verifyOTP = async (code: string): Promise<boolean> => {
    console.log('Mock OTP verification:', code);
    // Accept any 6-digit code
    if (code.length === 6) {
      setAuthState(prev => ({ 
        ...prev, 
        user: prev.user ? { ...prev.user, isVerified: true } : mockUser,
        step: 'dashboard' 
      }));
      return true;
    }
    return false;
  };

  const completeProfile = async (profile: any): Promise<boolean> => {
    console.log('Mock profile completion:', profile);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setAuthState(prev => ({ 
      ...prev, 
      user: prev.user ? { ...prev.user, profileComplete: true, profile } : mockUser,
      step: 'dashboard' 
    }));
    return true;
  };

  const updateCommunicationPreferences = async (preferences: any): Promise<boolean> => {
    console.log('Mock communication preferences update:', preferences);
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  };

  const logout = async () => {
    console.log('Mock logout');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      step: 'login'
    });
  };

  const forgotPassword = async (mobile: string): Promise<boolean> => {
    console.log('Mock forgot password for mobile:', mobile);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  };

  const resetPassword = async (mobile: string, otp: string, password: string): Promise<boolean> => {
    console.log('Mock reset password for mobile:', mobile);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  };

  return {
    authState,
    login,
    verifyOTP,
    register,
    completeProfile,
    updateCommunicationPreferences,
    logout,
    forgotPassword,
    resetPassword
  };
};

export { AuthContext };