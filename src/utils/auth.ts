// Authentication utilities
import { supabase } from '@/integrations/supabase/client';
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
}

export interface LoginParams {
  email: string;
  password: string;
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
    const { data, error } = await supabase.functions.invoke('mock-looplly-register', {
      body: {
        mobile: params.mobile,
        countryCode: params.countryCode,
        password: params.password,
        firstName: params.firstName || '',
        lastName: params.lastName || '',
        dateOfBirth: null, // Will be set at Level 1 completion
        gpsEnabled: false  // Will be set at Level 1 completion
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
    // Determine if this is mobile or email login
    const isMobileLogin = params.email.startsWith('+');
    
    if (isMobileLogin) {
      console.log('Logging in Looplly user with mobile:', params.email);
      
      // Extract country code and mobile
      const countryCodeMatch = params.email.match(/^\+\d+/);
      const countryCode = countryCodeMatch?.[0] || '+27';
      const mobile = params.email.replace(/^\+\d+/, '');
      
      // Call custom login edge function (NOT Supabase Auth)
      const { data, error } = await supabase.functions.invoke('mock-looplly-login', {
        body: {
          mobile,
          countryCode,
          password: params.password
        }
      });

      if (error || !data?.token) {
        console.error('Login error:', error || data);
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
      
      console.log('Login successful - custom JWT stored');
      
      // CRITICAL: Establish Supabase session for RLS to work
      if (data.supabase_auth_id) {
        console.log('Establishing Supabase session for RLS...');
        
        // Sign in to Supabase with the mobile user's credentials
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: `${data.user.id}@looplly.mobile`,
          password: params.password
        });
        
        if (signInError) {
          console.warn('Failed to establish Supabase session:', signInError.message);
          // Don't fail login, but note that RLS might have issues
        } else {
          console.log('Supabase session established successfully');
        }
      }
    } else {
      console.log('Logging in admin user with email:', params.email);
      // Email login for admin/team users (Supabase Auth)
      const { error } = await supabase.auth.signInWithPassword({
        email: params.email,
        password: params.password
      });

      if (error) {
        console.error('Login error:', error);
        const errorMessage = error.message === 'Email not confirmed' 
          ? 'Please verify your email before logging in' 
          : error.message === 'Invalid login credentials'
          ? 'Invalid email or password'
          : error.message || 'Login failed';
        return { success: false, error: { message: errorMessage } };
      }
    }
    
    console.log('Login successful');
    return { success: true };
  } catch (error) {
    console.error('Login failed:', error);
    return { success: false, error: { message: 'Something went wrong. Please try again.' } };
  }
};

export const logoutUser = async (): Promise<void> => {
  console.log('Logging out user');
  
  // Clear custom Looplly auth if present
  localStorage.removeItem('looplly_auth_token');
  localStorage.removeItem('looplly_user');
  
  // Also sign out from Supabase Auth (for admin/team users)
  await supabase.auth.signOut();
};

export const resetUserPassword = async (email: string): Promise<{ success: boolean; error?: any }> => {
  try {
    console.log('Initiating forgot password for email:', email);
    
    // Check if email belongs to a team member
    const { data: teamProfile } = await supabase
      .from('team_profiles')
      .select('email')
      .eq('email', email)
      .maybeSingle();
    
    // Determine redirect path based on user type
    const resetPath = teamProfile ? '/admin/reset-password' : '/reset-password';
    
    // Use VITE_APP_URL for production, fallback to window.location.origin for dev
    const redirectUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${redirectUrl}${resetPath}`,
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
  return await supabase.auth.getSession();
};

export const getCurrentUser = async () => {
  return await supabase.auth.getUser();
};