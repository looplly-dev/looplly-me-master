// Authentication utilities
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

export const registerUser = async (params: RegistrationParams): Promise<{ success: boolean; error?: any }> => {
  try {
    console.log('Registering Looplly user with mobile:', params.mobile);
    
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
    
    // Call custom registration edge function (NOT Supabase Auth)
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.functions.invoke('looplly-register', {
      body: {
        mobile: params.mobile,
        countryCode: params.countryCode,
        password: params.password,
        firstName: params.firstName || '',
        lastName: params.lastName || '',
        dateOfBirth: params.dateOfBirth || null,
        gpsEnabled: params.gpsEnabled || false,
        latitude: params.latitude || null,
        longitude: params.longitude || null
      }
    });

    if (error || !data?.success) {
      console.error('Registration error:', error || data);
      return { success: false, error: error || { message: data?.error || 'Registration failed' } };
    }
    
    console.log('Registration successful - user_id:', data.user_id);
    return { success: true };
  } catch (error) {
    console.error('Registration failed:', error);
    return { success: false, error };
  }
};

export const loginUser = async (params: LoginParams): Promise<{ success: boolean; error?: any }> => {
  try {
    const supabase = getSupabaseClient();
    // Determine if this is mobile or email login
    const isMobileLogin = params.mobile && params.countryCode;
    
    if (isMobileLogin) {
      console.log('[loginUser] Mobile login with countryCode:', params.countryCode, 'mobile:', params.mobile);
      
      // Call custom login edge function (NOT Supabase Auth)
      const { data, error } = await supabase.functions.invoke('mock-looplly-login', {
        body: {
          mobile: params.mobile,
          countryCode: params.countryCode,
          password: params.password
        }
      });

      if (error || !data?.token) {
        console.error('[loginUser] Login error:', error || data);
        return { 
          success: false, 
          error: { 
            message: error?.message || data?.error || 'Invalid mobile number or password' 
          } 
        };
      }
      
      // Store custom JWT token and user data
      localStorage.setItem('looplly_auth_token', data.token);
      localStorage.setItem('looplly_user', JSON.stringify(data.user));
      
      console.log('[loginUser] Login successful - custom JWT stored');
      
      // CRITICAL: ALWAYS establish Supabase session for RLS to work
      // Use synthetic email pattern for backend authentication
      const syntheticEmail = `${data.user.id}@looplly.mobile`;
      console.log('[loginUser] Establishing Supabase session with synthetic email:', syntheticEmail);
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: syntheticEmail,
        password: params.password
      });
      
      if (signInError) {
        console.error('[loginUser] Failed to establish Supabase session:', signInError.message);
        // Clear the custom token since we can't establish a backend session
        localStorage.removeItem('looplly_auth_token');
        localStorage.removeItem('looplly_user');
        return { 
          success: false, 
          error: { 
            message: 'Login failed. Please try again or contact support if the issue persists.' 
          } 
        };
      }
      
      console.log('[loginUser] Supabase session established successfully - RLS will work');
      
      // Set a flag to help useAuth avoid premature token clearing
      sessionStorage.setItem('looplly_just_logged_in', '1');
      setTimeout(() => sessionStorage.removeItem('looplly_just_logged_in'), 1000);
    } else if (params.email) {
      console.log('[loginUser] Email login for admin/team user:', params.email);
      // Email login for admin/team users (Supabase Auth)
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

export const logoutUser = async (): Promise<void> => {
  console.log('Logging out user');
  
  // Clear custom Looplly auth if present
  localStorage.removeItem('looplly_auth_token');
  localStorage.removeItem('looplly_user');
  
  // Also sign out from Supabase Auth (for admin/team users)
  const supabase = getSupabaseClient();
  await supabase.auth.signOut();
};

export const resetUserPassword = async (email: string): Promise<{ success: boolean; error?: any }> => {
  try {
    // Use route-aware client to maintain session isolation
    // When called from /admin/login, uses adminClient (admin_auth storage)
    // When called from user login, uses supabase (auth storage)
    const client = getSupabaseClient();
    console.log('Initiating forgot password for email:', email);
    
    // Check if email belongs to a team member
    // RLS policy allows unauthenticated lookups on team_profiles.email
    const { data: teamProfile } = await client
      .from('team_profiles')
      .select('email')
      .eq('email', email)
      .maybeSingle();
    
    console.log('Team profile check result:', { email, found: !!teamProfile });
    
    // Determine redirect path based on user type
    const resetPath = teamProfile ? '/admin/reset-password' : '/reset-password';
    
    // Use VITE_APP_URL for production, fallback to window.location.origin for dev
    const redirectUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    const fullRedirectUrl = `${redirectUrl}${resetPath}`;
    
    console.log('Sending password reset email with redirect:', fullRedirectUrl);
    
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: fullRedirectUrl,
    });
    
    if (error) {
      console.error('Forgot password error:', error);
      return { success: false, error };
    }
    
    console.log('Password reset email sent to:', resetPath);
    return { success: true };
  } catch (error) {
    console.error('Forgot password failed:', error);
    return { success: false, error };
  }
};

export const getCurrentSession = async () => {
  return await getSupabaseClient().auth.getSession();
};

export const getCurrentUser = async () => {
  return await getSupabaseClient().auth.getUser();
};