import { useState, useEffect, createContext, useContext } from 'react';
import { User, AuthState } from '@/types/auth';

const AuthContext = createContext<{
  authState: AuthState;
  login: (mobile: string, password: string) => Promise<boolean>;
  verifyOTP: (code: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  completeProfile: (profile: any) => Promise<boolean>;
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

  const login = async (mobile: string, password: string): Promise<boolean> => {
    // Mock login - accept any password for demo
    if (mobile && password) {
      const user: User = {
        id: '1',
        mobile,
        countryCode: '+1',
        isVerified: false,
        profileComplete: false
      };
      setAuthState({
        user,
        isAuthenticated: false,
        isLoading: false,
        step: 'otp'
      });
      return true;
    }
    return false;
  };

  const verifyOTP = async (code: string): Promise<boolean> => {
    // Mock OTP verification - accept '123456' for demo
    if (code === '123456') {
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, isVerified: true } : null,
        step: prev.user?.profileComplete ? 'dashboard' : 'profile'
      }));
      return true;
    }
    return false;
  };

  const register = async (data: any): Promise<boolean> => {
    // Mock registration
    const user: User = {
      id: Date.now().toString(),
      mobile: data.mobile,
      countryCode: data.countryCode,
      email: data.email,
      isVerified: false,
      profileComplete: false
    };
    
    setAuthState({
      user,
      isAuthenticated: false,
      isLoading: false,
      step: 'login'
    });
    return true;
  };

  const completeProfile = async (profile: any): Promise<boolean> => {
    // Check age restriction
    if (profile.age < 16) {
      return false;
    }

    setAuthState(prev => ({
      ...prev,
      user: prev.user ? {
        ...prev.user,
        profileComplete: true,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        profile
      } : null,
      isAuthenticated: true,
      step: 'dashboard'
    }));
    return true;
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      step: 'login'
    });
  };

  const forgotPassword = async (mobile: string): Promise<boolean> => {
    // Mock forgot password
    return true;
  };

  const resetPassword = async (mobile: string, otp: string, password: string): Promise<boolean> => {
    // Mock reset password
    if (otp === '123456') {
      return true;
    }
    return false;
  };

  return {
    authState,
    login,
    verifyOTP,
    register,
    completeProfile,
    logout,
    forgotPassword,
    resetPassword
  };
};

export { AuthContext };