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
    console.log('Registering user with email:', params.email);
    
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
    
    const normalizedMobile = mobileValidation.normalizedNumber!;
    
    // Use email-based auth instead of phone
    const { error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          first_name: params.firstName || '',
          last_name: params.lastName || '',
          mobile: normalizedMobile,
          country_code: params.countryCode
        }
      }
    });

    if (error) {
      console.error('Registration error:', error);
      return { success: false, error };
    }
    
    console.log('Registration successful');
    return { success: true };
  } catch (error) {
    console.error('Registration failed:', error);
    return { success: false, error };
  }
};

export const loginUser = async (params: LoginParams): Promise<{ success: boolean; error?: any }> => {
  try {
    console.log('Logging in user with email:', params.email);
    
    // Use email-based login
    const { error } = await supabase.auth.signInWithPassword({
      email: params.email,
      password: params.password
    });

    if (error) {
      console.error('Login error:', error);
      // Return more specific error messages
      const errorMessage = error.message === 'Email not confirmed' 
        ? 'Please verify your email before logging in' 
        : error.message === 'Invalid login credentials'
        ? 'Invalid email or password'
        : error.message || 'Login failed';
      return { success: false, error: { message: errorMessage } };
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
  await supabase.auth.signOut();
};

export const resetUserPassword = async (email: string): Promise<{ success: boolean; error?: any }> => {
  try {
    console.log('Initiating forgot password for email:', email);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      console.error('Forgot password error:', error);
      return { success: false, error };
    }
    
    console.log('Password reset email sent');
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