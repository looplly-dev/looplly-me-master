// Simplified Authentication utilities using standard Supabase Auth
import { getSupabaseClient } from '@/integrations/supabase/activeClient';
import { validateAndNormalizeMobile } from './mobileValidation';

// Blocked country codes (data residency compliance)
const BLOCKED_COUNTRY_CODES = [
  '+91',  // India
  '+86',  // China
  '+7',   // Russia/Kazakhstan
  '+84',  // Vietnam
  '+62',  // Indonesia
  '+92',  // Pakistan
  '+90',  // Turkey
];

export interface RegistrationParams {
  mobile: string;
  countryCode: string;
  password: string;
  email: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gpsEnabled?: boolean;
  latitude?: number;
  longitude?: number;
}

export interface LoginParams {
  email?: string;
  password: string;
  mobile?: string;
  countryCode?: string;
}

/**
 * Register a new user using standard Supabase Auth
 * Uses email-based authentication (mobile stored in user_metadata)
 */
export const registerUser = async (params: RegistrationParams): Promise<{ success: boolean; error?: any }> => {
  try {
    console.log('=== Registration Debug ===');
    console.log('Email:', params.email);
    console.log('Mobile (raw):', params.mobile);
    console.log('Country Code:', params.countryCode);
    console.log('First Name:', params.firstName);
    console.log('Last Name:', params.lastName);
    console.log('Date of Birth:', params.dateOfBirth);
    console.log('GPS Enabled:', params.gpsEnabled);
    console.log('Coordinates:', params.latitude, params.longitude);
    
    // Check if country is blocked
    if (BLOCKED_COUNTRY_CODES.includes(params.countryCode)) {
      return { 
        success: false, 
        error: { 
          message: 'Registration is not available in your country due to data residency requirements. We apologize for the inconvenience.' 
        } 
      };
    }
    
    // Validate and normalize mobile number
    const mobileValidation = validateAndNormalizeMobile(params.mobile, params.countryCode);
    
    if (!mobileValidation.isValid) {
      console.error('Mobile validation error:', mobileValidation.error);
      return { success: false, error: { message: mobileValidation.error || 'Invalid mobile number' } };
    }
    
    const normalizedMobile = mobileValidation.normalized;
    console.log('Mobile (normalized):', normalizedMobile);
    
    // Prepare metadata object
    const userMetadata = {
      mobile: normalizedMobile,
      country_code: params.countryCode,
      first_name: params.firstName || '',
      last_name: params.lastName || '',
      date_of_birth: params.dateOfBirth || null,
      gps_enabled: params.gpsEnabled || false,
      latitude: params.latitude || null,
      longitude: params.longitude || null,
    };
    
    console.log('User Metadata:', JSON.stringify(userMetadata, null, 2));
    
    // Use standard Supabase Auth sign up
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: userMetadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      console.error('Registration error:', error);
      return { success: false, error: { message: error.message } };
    }
    
    if (!data.user) {
      return { success: false, error: { message: 'Registration failed - no user created' } };
    }
    
    console.log('Registration successful - user_id:', data.user.id);
    return { success: true };
  } catch (error) {
    console.error('Registration failed:', error);
    return { success: false, error };
  }
};

/**
 * Login user using standard Supabase Auth
 * Supports both email and mobile-based login
 */
export const loginUser = async (params: LoginParams): Promise<{ success: boolean; error?: any }> => {
  try {
    const supabase = getSupabaseClient();
    
    // Determine if this is mobile or email login
    const isMobileLogin = params.mobile && params.countryCode;
    
    if (isMobileLogin) {
      console.log('[loginUser] Mobile login - converting to email lookup');
      
      // Normalize mobile number
      const mobileValidation = validateAndNormalizeMobile(params.mobile!, params.countryCode!);
      if (!mobileValidation.isValid) {
        return { success: false, error: { message: 'Invalid mobile number' } };
      }
      
      const normalizedMobile = mobileValidation.normalized;
      
      // Look up user by mobile number in profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('mobile', normalizedMobile)
        .maybeSingle();
      
      if (profileError || !profile) {
        console.error('[loginUser] Profile lookup error:', profileError);
        return { 
          success: false, 
          error: { message: 'Invalid mobile number or password' } 
        };
      }
      
      // Get auth user email from auth.users
      const { data: authUser, error: authError } = await supabase
        .rpc('get_user_email', { user_uuid: profile.user_id });
      
      if (authError || !authUser) {
        console.error('[loginUser] Auth user lookup error:', authError);
        return { 
          success: false, 
          error: { message: 'Invalid mobile number or password' } 
        };
      }
      
      // Sign in with email
      console.log('[loginUser] Signing in with email for mobile user');
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: authUser,
        password: params.password
      });
      
      if (signInError) {
        console.error('[loginUser] Sign in error:', signInError);
        return { 
          success: false, 
          error: { message: 'Invalid mobile number or password' } 
        };
      }
    } else if (params.email) {
      console.log('[loginUser] Email login:', params.email);
      
      // Standard email login
      const { error } = await supabase.auth.signInWithPassword({
        email: params.email,
        password: params.password
      });

      if (error) {
        console.error('[loginUser] Email login error:', error);
        const errorMessage = error.message === 'Email not confirmed' 
          ? 'Please verify your email before logging in' 
          : error.message === 'Invalid login credentials'
          ? 'Invalid email or password'
          : error.message || 'Login failed';
        return { success: false, error: { message: errorMessage } };
      }
    } else {
      return { success: false, error: { message: 'Invalid login parameters' } };
    }
    
    console.log('[loginUser] Login successful');
    return { success: true };
  } catch (error) {
    console.error('[loginUser] Login failed:', error);
    return { success: false, error: { message: 'Something went wrong. Please try again.' } };
  }
};

/**
 * Logout user using standard Supabase Auth
 */
export const logoutUser = async (): Promise<void> => {
  console.log('Logging out user');
  
  const supabase = getSupabaseClient();
  await supabase.auth.signOut();
};

/**
 * Reset user password using standard Supabase Auth
 */
export const resetUserPassword = async (email: string): Promise<{ success: boolean; error?: any }> => {
  try {
    const client = getSupabaseClient();
    console.log('Initiating password reset for email:', email);
    
    // Check if email belongs to a team member
    const { data: teamProfile } = await client
      .from('team_profiles')
      .select('email')
      .eq('email', email)
      .maybeSingle();
    
    console.log('Team profile check result:', { email, found: !!teamProfile });
    
    // Determine redirect path based on user type
    const resetPath = teamProfile ? '/admin/reset-password' : '/reset-password';
    
    const redirectUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    const fullRedirectUrl = `${redirectUrl}${resetPath}`;
    
    console.log('Sending password reset email with redirect:', fullRedirectUrl);
    
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: fullRedirectUrl,
    });
    
    if (error) {
      console.error('Password reset error:', error);
      return { success: false, error };
    }
    
    console.log('Password reset email sent');
    return { success: true };
  } catch (error) {
    console.error('Password reset failed:', error);
    return { success: false, error };
  }
};

export const getCurrentSession = async () => {
  return await getSupabaseClient().auth.getSession();
};

export const getCurrentUser = async () => {
  return await getSupabaseClient().auth.getUser();
};
