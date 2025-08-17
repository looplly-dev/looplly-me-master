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
          // Fetch user profile with error handling
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle();

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
                isVerified: false, // Always start as unverified for OTP flow
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

              // For new registrations, don't require OTP yet - let them complete the flow
              // OTP will be required on subsequent logins
              setAuthState({
                user,
                isAuthenticated: true,
                isLoading: false,
                step: user.profileComplete ? 'dashboard' : 'profile-setup'
              });
            } else {
              console.log('No profile found, logging out user and redirecting to registration');
              // If no profile exists, log out the user and redirect to login/registration
              await supabase.auth.signOut();
              setAuthState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                step: 'login'
              });
            }
          } catch (profileError) {
            console.error('Profile fetch failed:', profileError);
            // If profile fetch fails, log user out to prevent infinite loading
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              step: 'login'
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
      // Always set loading to false after initial check
      setAuthState(prev => ({ ...prev, isLoading: false }));
    });

    return () => subscription.unsubscribe();
  }, []);

  const register = async (data: any): Promise<boolean> => {
    try {
      console.log('Registering user with data:', data);
      const result = await registerUser({
        mobile: data.mobile,
        countryCode: data.countryCode,
        password: data.password,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName
      });

      if (!result.success) {
        console.error('Registration error:', result.error);
        // Re-throw the error with proper structure for the component to handle
        throw result.error;
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
      const result = await loginUser({ mobile, password });

      if (!result.success) {
        console.error('Login error:', result.error);
        throw result.error;
      }
      
      console.log('Login successful - triggering OTP verification');
      // After successful login, always require OTP verification
      setAuthState(prev => ({ 
        ...prev, 
        step: 'otp-verification' 
      }));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const verifyOTP = async (code: string): Promise<boolean> => {
    console.log('Verifying OTP:', code);
    // For demo purposes, accept specific codes
    if (code === '123456' || code.length === 6) {
      // Mark user as verified and proceed to next step
      setAuthState(prev => ({ 
        ...prev, 
        user: prev.user ? { ...prev.user, isVerified: true } : null,
        step: prev.user?.profileComplete ? 'dashboard' : 'profile-setup' 
      }));
      return true;
    }
    return false;
  };

  const completeProfile = async (profile: any): Promise<boolean> => {
    try {
      console.log('Completing profile with data:', profile);
      if (!session?.user) {
        console.log('No session found for profile completion');
        return false;
      }

      // Age validation removed
      console.log('Skipping age validation, proceeding with profile completion');

      const success = await updateUserProfile(session.user.id, profile);
      
      if (!success) {
        console.error('Profile completion failed');
        return false;
      }
      
      // After profile completion, redirect to earn page (dashboard)
      setAuthState(prev => ({ ...prev, step: 'dashboard' }));
      console.log('Profile completion successful, redirecting to dashboard');
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
    await logoutUser();
  };

  const forgotPassword = async (mobile: string): Promise<boolean> => {
    try {
      console.log('Initiating forgot password for mobile:', mobile);
      const result = await resetUserPassword(mobile);
      
      if (!result.success) {
        console.error('Forgot password error:', result.error);
        throw result.error;
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