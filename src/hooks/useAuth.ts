import { useState, useEffect, createContext, useContext } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthState } from '@/types/auth';
import { registerUser, loginUser, logoutUser, resetUserPassword } from '@/utils/auth';
import { updateUserProfile, fetchUserProfile } from '@/utils/profile';
import { createDemoEarningActivities } from '@/utils/demoData';
import { rateLimiter, withRateLimit } from '@/utils/rateLimiter';
import { auditActions } from '@/utils/auditLogger';

const AuthContext = createContext<{
  authState: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
  verifyOTP: (code: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  completeProfile: (profile: any) => Promise<boolean>;
  updateCommunicationPreferences: (preferences: any) => Promise<boolean>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (email: string, otp: string, password: string) => Promise<boolean>;
} | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Real Supabase authentication
export const useAuthLogic = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    step: 'login'
  });

  console.log('useAuthLogic - Current authState:', authState);

  useEffect(() => {
    let mounted = true;
    
    // Check for mock user in localStorage first
    const mockUser = localStorage.getItem('mockUser');
    if (mockUser) {
      try {
        const user = JSON.parse(mockUser);
        console.log('Found mock user in localStorage:', user);
        if (mounted) {
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            step: 'dashboard'
          });
        }
        return;
      } catch (error) {
        console.error('Error parsing mock user from localStorage:', error);
        localStorage.removeItem('mockUser');
      }
    }
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (!mounted) return;
        
        if (session?.user) {
          console.log('Processing user session...');
          
          // Use setTimeout to avoid blocking the auth state change
          setTimeout(async () => {
            if (!mounted) return;
            
            try {
              // Fetch user profile from our profiles table
              console.log('Fetching profile for user:', session.user.id);
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();

              if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error);
              }

              console.log('Profile fetched:', profile);

              if (!mounted) return;

              const user: User = {
                id: session.user.id,
                mobile: profile?.mobile || session.user.phone || '',
                countryCode: profile?.country_code || '+1',
                email: session.user.email || undefined,
                firstName: profile?.first_name || '',
                lastName: profile?.last_name || '',
                isVerified: session.user.email_confirmed_at !== null,
                profileComplete: profile?.profile_complete || false,
                profile: profile ? {
                  sec: (profile.sec as 'A' | 'B' | 'C1' | 'C2' | 'D' | 'E') || 'B',
                  gender: (profile.gender as 'male' | 'female' | 'other') || 'other',
                  dateOfBirth: profile.date_of_birth ? new Date(profile.date_of_birth) : new Date(),
                  address: profile.address || '',
                  gpsEnabled: true,
                  firstName: profile.first_name || '',
                  lastName: profile.last_name || '',
                  email: session.user.email || ''
                } : undefined
              };

              console.log('Setting auth state with user:', user);
              setAuthState({
                user,
                isAuthenticated: true,
                isLoading: false,
                step: !profile?.profile_complete ? 'profile-setup' : 'dashboard'
              });
              
              // Audit log successful login (non-blocking)
              if (event === 'SIGNED_IN') {
                setTimeout(() => {
                  auditActions.login(session.user.id, { 
                    method: 'email_password',
                    profile_complete: profile?.profile_complete || false
                  }).catch(console.error);
                }, 0);
              }
            } catch (error) {
              console.error('Error processing auth state:', error);
              if (!mounted) return;
              setAuthState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                step: 'login'
              });
            }
          }, 0);
        } else {
          console.log('No session, setting unauthenticated state');
          if (!mounted) return;
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            step: 'login'
          });
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session);
      // The auth state change listener will handle this
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const register = withRateLimit('registration', async (data: any): Promise<boolean> => {
    console.log('Registering user with data:', data);
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const result = await registerUser({
        mobile: data.mobile,
        countryCode: data.countryCode,
        password: data.password,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName
      });

      if (result.success) {
        // Stop loading and move to OTP step (no session yet after sign-up)
        setAuthState(prev => ({ ...prev, isLoading: false, step: 'otp-verification' }));
        return true;
      } else {
        console.error('Registration failed:', result.error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  });

  const login = withRateLimit('login', async (email: string, password: string): Promise<boolean> => {
    console.log('Logging in user with email:', email);
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Check for demo/mock login
      if (email === 'demo@looplly.com' && password === 'demo123') {
        console.log('Using mock login for demo user');
        
        // Create mock user directly
        const mockUser: User = {
          id: '12345678-1234-1234-1234-123456789012',
          mobile: '+1234567890',
          countryCode: '+1',
          email: 'demo@looplly.com',
          firstName: 'Demo',
          lastName: 'User',
          isVerified: true,
          profileComplete: true,
          profile: {
            sec: 'B' as const,
            gender: 'other' as const,
            dateOfBirth: new Date('1990-01-01'),
            address: '123 Demo Street, Demo City',
            gpsEnabled: true,
            firstName: 'Demo',
            lastName: 'User',
            email: 'demo@looplly.com'
          }
        };

        // Store mock user in localStorage
        localStorage.setItem('mockUser', JSON.stringify(mockUser));

        setAuthState({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          step: 'dashboard'
        });
        
        return true;
      }
      
      // For other emails, try real Supabase authentication
      const result = await loginUser({ email, password });
      
      if (result.success) {
        return true;
      } else {
        console.error('Login failed:', result.error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  });

  const verifyOTP = async (code: string): Promise<boolean> => {
    console.log('Verifying OTP:', code);
    // Demo OTP: accept exactly "12345"
    if (code === '12345') {
      return true;
    }
    return false;
  };

  const completeProfile = async (profileData: any): Promise<boolean> => {
    console.log('Completing profile:', profileData);
    
    if (!authState.user?.id) {
      return false;
    }

    try {
      const success = await updateUserProfile(authState.user.id, profileData);
      
      if (success) {
        // Fetch the updated profile to get the complete data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', authState.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching updated profile:', profileError);
        }

        // Update the auth state with profile complete flag
        setAuthState(prev => ({
          ...prev,
          user: prev.user ? {
            ...prev.user,
            profileComplete: true,
            profile: profile ? {
              sec: (profile.sec as 'A' | 'B' | 'C1' | 'C2' | 'D' | 'E') || 'B',
              gender: (profile.gender as 'male' | 'female' | 'other') || 'other',
              dateOfBirth: profile.date_of_birth ? new Date(profile.date_of_birth) : new Date(),
              address: profile.address || '',
              gpsEnabled: profile.gps_enabled || false,
              firstName: profile.first_name || '',
              lastName: profile.last_name || '',
              email: profile.email || ''
            } : prev.user.profile
          } : null,
          step: 'dashboard'
        }));

        // Audit log profile completion
        auditActions.dataModify(authState.user.id, 'complete', 'profile', authState.user.id, { 
          profile_completed: true
        }).catch(console.error);

        return true;
      }
      return false;
    } catch (error) {
      console.error('Profile completion error:', error);
      return false;
    }
  };

  const updateCommunicationPreferences = async (preferences: any): Promise<boolean> => {
    console.log('Updating communication preferences:', preferences);
    
    if (!authState.user?.id) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('communication_preferences')
        .upsert({
          user_id: authState.user.id,
          ...preferences
        });

      if (error) {
        console.error('Error updating communication preferences:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Communication preferences update error:', error);
      return false;
    }
  };

  const logout = async () => {
    console.log('Logging out user');
    
    // Clear mock user from localStorage
    localStorage.removeItem('mockUser');
    
    await logoutUser();
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    console.log('Initiating password reset for email:', email);
    
    try {
      const result = await resetUserPassword(email);
      return result.success;
    } catch (error) {
      console.error('Forgot password error:', error);
      return false;
    }
  };

  const resetPassword = async (email: string, otp: string, password: string): Promise<boolean> => {
    console.log('Resetting password for email:', email);
    // In a real implementation, this would verify OTP and reset password
    // For now, we'll simulate success
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
