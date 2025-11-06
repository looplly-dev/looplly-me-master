import { useState, useEffect } from 'react';
import type { AuthState, User } from '@/types/auth';

/**
 * Mock authentication hook for development/testing
 * Bypasses real auth and auto-authenticates with test user
 */
export function useMockAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    step: 'dashboard',
  });

  useEffect(() => {
    // Auto-authenticate with mock user
    const mockUser: User = {
      id: 'mock-user-123',
      mobile: '0828543494',
      countryCode: '+27',
      email: 'mock@looplly.test',
      firstName: 'Mock',
      lastName: 'Test User',
      isVerified: true,
      profileComplete: true,
      profile: {
        sec: 'B',
        gender: 'male',
        dateOfBirth: new Date('1990-01-01'),
        address: '123 Mock Street, Mock City',
        gpsEnabled: true,
        firstName: 'Mock',
        lastName: 'Test User',
        email: 'mock@looplly.test',
        country_code: '+27',
        country_iso: 'ZA',
        user_type: 'looplly_user',
      },
    };

    // Simulate loading delay
    setTimeout(() => {
      setAuthState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        step: 'dashboard',
      });
      
      console.info('[MOCK AUTH] ⚠️  Auto-authenticated as:', mockUser.mobile);
    }, 500);
  }, []);

  return {
    authState,
    login: async () => {
      console.warn('[MOCK AUTH] login() called - no-op in mock mode');
      return true;
    },
    logout: async () => {
      console.warn('[MOCK AUTH] logout() called - clearing mock session');
      setAuthState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
      }));
    },
    register: async () => {
      console.warn('[MOCK AUTH] register() called - no-op in mock mode');
      return { success: true };
    },
    verifyOTP: async () => {
      console.warn('[MOCK AUTH] verifyOTP() called - no-op in mock mode');
      return true;
    },
    resendOTP: async () => {
      console.warn('[MOCK AUTH] resendOTP() called - no-op in mock mode');
    },
    forgotPassword: async () => {
      console.warn('[MOCK AUTH] forgotPassword() called - no-op in mock mode');
      return true;
    },
    resetPassword: async () => {
      console.warn('[MOCK AUTH] resetPassword() called - no-op in mock mode');
      return true;
    },
    completeProfile: async () => {
      console.warn('[MOCK AUTH] completeProfile() called - no-op in mock mode');
    },
    updateCommunicationPreferences: async () => {
      console.warn('[MOCK AUTH] updateCommunicationPreferences() called - no-op in mock mode');
    },
    refreshUserProfile: async () => {
      console.warn('[MOCK AUTH] refreshUserProfile() called - no-op in mock mode');
    },
  };
}
