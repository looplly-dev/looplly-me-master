import { useState, useEffect, createContext, useContext } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthState } from '@/types/auth';
import { registerUser, loginUser, logoutUser, resetUserPassword } from '@/utils/auth';
import { updateUserProfile, fetchUserProfile } from '@/utils/profile';
import { createDemoEarningActivities } from '@/utils/demoData';

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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (session?.user) {
          try {
            // Fetch user profile from our profiles table
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();

            if (error && error.code !== 'PGRST116') {
              console.error('Error fetching profile:', error);
            }

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
                firstName: profile.first_name,
                lastName: profile.last_name,
                email: session.user.email || ''
              } : undefined
            };

            setAuthState({
              user,
              isAuthenticated: true,
              isLoading: false,
              step: !profile?.profile_complete ? 'profile-setup' : 'dashboard'
            });
          } catch (error) {
            console.error('Error processing auth state:', error);
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              step: 'login'
            });
          }
        } else {
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
      // The auth state change listener will handle this
    });

    return () => subscription.unsubscribe();
  }, []);

  const register = async (data: any): Promise<boolean> => {
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
        // Create demo earning activities for new users
        setTimeout(async () => {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
              await createDemoEarningActivities(session.user.id);
            }
          } catch (error) {
            console.error('Error creating demo activities:', error);
          }
        }, 2000);
        
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
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('Logging in user with email:', email);
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
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
  };

  const verifyOTP = async (code: string): Promise<boolean> => {
    console.log('Verifying OTP:', code);
    // In a real implementation, this would verify OTP via Supabase
    // For now, we'll simulate success for any 6-digit code
    if (code.length === 6) {
      setAuthState(prev => ({ 
        ...prev, 
        user: prev.user ? { ...prev.user, isVerified: true } : prev.user,
        step: 'dashboard' 
      }));
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
        // Trigger a refresh of auth state
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // The auth state listener will handle the update
        }
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