import { useState, useEffect, createContext, useContext } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthState } from '@/types/auth';

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

// Real Supabase authentication functions
export const useAuthLogic = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    step: 'login'
  });
  const [session, setSession] = useState<Session | null>(null);

  console.log('useAuthLogic - Current authState:', authState);

  useEffect(() => {
    console.log('useAuthLogic - Setting up auth listener');
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change event:', event, 'Session:', !!session);
        setSession(session);
        
        if (session?.user) {
          console.log('User found in session, fetching profile for:', session.user.id);
          // Fetch user profile
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          console.log('Profile fetch result:', profile, 'Error:', error);
          
          if (profile) {
            console.log('Setting authenticated user state');
            const user: User = {
              id: session.user.id,
              mobile: profile.mobile,
              countryCode: profile.country_code,
              email: session.user.email,
              firstName: profile.first_name,
              lastName: profile.last_name,
              isVerified: true,
              profileComplete: profile.profile_complete,
              profile: profile.profile_complete ? {
                sec: profile.sec as 'A' | 'B' | 'C1' | 'C2' | 'D' | 'E',
                gender: profile.gender as 'male' | 'female' | 'other',
                dateOfBirth: new Date(profile.date_of_birth),
                address: profile.address,
                gpsEnabled: false,
                firstName: profile.first_name,
                lastName: profile.last_name,
                email: session.user.email
              } : undefined
            };

            setAuthState({
              user,
              isAuthenticated: true,
              isLoading: false,
              step: profile.profile_complete ? 'dashboard' : 'profile'
            });
          } else {
            console.log('No profile found, user needs to complete setup');
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              step: 'profile'
            });
          }
        } else {
          console.log('No session found, setting unauthenticated state');
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
    console.log('Checking for existing session...');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check result:', !!session);
      if (!session) {
        console.log('No initial session, setting loading to false');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const register = async (data: any): Promise<boolean> => {
    try {
      console.log('Registering user with data:', data);
      const { error } = await supabase.auth.signUp({
        email: data.email || `${data.mobile}@temp.com`,
        password: data.password,
        phone: `${data.countryCode}${data.mobile}`,
        options: {
          data: {
            first_name: data.firstName || '',
            last_name: data.lastName || '',
            mobile: data.mobile,
            country_code: data.countryCode
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        throw error;
      }
      console.log('Registration successful');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const login = async (mobile: string, password: string): Promise<boolean> => {
    try {
      console.log('Logging in user with mobile:', mobile);
      // For now, use email-based login since mobile auth requires additional setup
      const email = `${mobile}@temp.com`;
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        throw error;
      }
      console.log('Login successful');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const verifyOTP = async (code: string): Promise<boolean> => {
    console.log('Verifying OTP:', code);
    // For demo purposes, auto-verify
    return true;
  };

  const completeProfile = async (profile: any): Promise<boolean> => {
    try {
      console.log('Completing profile with data:', profile);
      if (!session?.user) {
        console.log('No session found for profile completion');
        return false;
      }

      // Calculate age from date of birth
      const today = new Date();
      const birthDate = new Date(profile.dateOfBirth);
      const age = today.getFullYear() - birthDate.getFullYear();
      
      // Check age restriction
      if (age < 16) {
        console.log('User is under 16, rejecting profile completion');
        return false;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.firstName,
          last_name: profile.lastName,
          gender: profile.gender,
          date_of_birth: profile.dateOfBirth,
          address: profile.address,
          household_income: profile.householdIncome,
          ethnicity: profile.ethnicity,
          sec: profile.sec,
          profile_complete: true
        })
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Profile completion error:', error);
        throw error;
      }
      console.log('Profile completion successful');
      return true;
    } catch (error) {
      console.error('Profile completion error:', error);
      return false;
    }
  };

  const updateCommunicationPreferences = async (preferences: any): Promise<boolean> => {
    try {
      console.log('Updating communication preferences:', preferences);
      if (!session?.user) {
        console.log('No session found for communication preferences update');
        return false;
      }

      const { error } = await supabase
        .from('communication_preferences')
        .update({
          sms_enabled: preferences.sms,
          whatsapp_enabled: preferences.whatsapp,
          push_enabled: preferences.push,
          email_enabled: preferences.email
        })
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Communication preferences error:', error);
        throw error;
      }
      console.log('Communication preferences updated successfully');
      return true;
    } catch (error) {
      console.error('Communication preferences error:', error);
      return false;
    }
  };

  const logout = async () => {
    console.log('Logging out user');
    await supabase.auth.signOut();
  };

  const forgotPassword = async (mobile: string): Promise<boolean> => {
    try {
      console.log('Initiating forgot password for mobile:', mobile);
      const email = `${mobile}@temp.com`;
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        console.error('Forgot password error:', error);
        throw error;
      }
      console.log('Password reset email sent');
      return true;
    } catch (error) {
      console.error('Forgot password error:', error);
      return false;
    }
  };

  const resetPassword = async (mobile: string, otp: string, password: string): Promise<boolean> => {
    console.log('Resetting password for mobile:', mobile);
    // This would require additional OTP verification logic
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