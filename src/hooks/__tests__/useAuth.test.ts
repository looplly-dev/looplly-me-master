import { renderHook, act } from '@testing-library/react';
import { useAuthLogic } from '../useAuth';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
jest.mock('@/integrations/supabase/client');

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default auth state', () => {
    const { result } = renderHook(() => useAuthLogic());
    
    expect(result.current.authState).toEqual({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      step: 'login',
    });
  });

  it('should handle user registration', async () => {
    const mockSignUp = jest.fn().mockResolvedValue({ error: null });
    (supabase.auth.signUp as jest.Mock) = mockSignUp;

    const { result } = renderHook(() => useAuthLogic());

    const registrationData = {
      mobile: '+1234567890',
      countryCode: '+1',
      password: 'password123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    };

    await act(async () => {
      const success = await result.current.register(registrationData);
      expect(success).toBe(true);
    });
  });

  it('should handle user login', async () => {
    const mockSignIn = jest.fn().mockResolvedValue({ error: null });
    (supabase.auth.signInWithPassword as jest.Mock) = mockSignIn;

    const { result } = renderHook(() => useAuthLogic());

    await act(async () => {
      const success = await result.current.login('+1234567890', 'password123');
      expect(success).toBe(true);
    });

    expect(result.current.authState.step).toBe('otp-verification');
  });

  it('should handle OTP verification', async () => {
    const { result } = renderHook(() => useAuthLogic());

    // Set up a mock user state first
    act(() => {
      result.current.authState.user = {
        id: 'test-id',
        mobile: '+1234567890',
        countryCode: '+1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isVerified: false,
        profileComplete: false,
      };
    });

    await act(async () => {
      const success = await result.current.verifyOTP('123456');
      expect(success).toBe(true);
    });

    expect(result.current.authState.step).toBe('profile-setup');
  });

  it('should handle logout', async () => {
    const mockSignOut = jest.fn().mockResolvedValue({ error: null });
    (supabase.auth.signOut as jest.Mock) = mockSignOut;

    const { result } = renderHook(() => useAuthLogic());

    await act(async () => {
      await result.current.logout();
    });

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('should handle forgot password', async () => {
    const { result } = renderHook(() => useAuthLogic());

    await act(async () => {
      const success = await result.current.forgotPassword('+1234567890');
      expect(success).toBe(true);
    });
  });
});