// Authentication utilities
import { supabase } from '@/integrations/supabase/client';

export interface RegistrationParams {
  mobile: string;
  countryCode: string;
  password: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginParams {
  mobile: string;
  password: string;
}

export const registerUser = async (params: RegistrationParams): Promise<{ success: boolean; error?: any }> => {
  try {
    console.log('Registering user with data:', params);
    
    // Use email if provided, otherwise use temporary email with emailRedirectTo
    const email = params.email || `${params.mobile}@temp.com`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password: params.password,
      phone: `${params.countryCode}${params.mobile}`,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          first_name: params.firstName || '',
          last_name: params.lastName || '',
          mobile: params.mobile,
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
    console.log('Logging in user with mobile:', params.mobile);
    
    // For now, use email-based login since mobile auth requires additional setup
    const email = `${params.mobile}@temp.com`;
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: params.password
    });

    if (error) {
      console.error('Login error:', error);
      return { success: false, error };
    }
    
    console.log('Login successful');
    return { success: true };
  } catch (error) {
    console.error('Login failed:', error);
    return { success: false, error };
  }
};

export const logoutUser = async (): Promise<void> => {
  console.log('Logging out user');
  await supabase.auth.signOut();
};

export const resetUserPassword = async (mobile: string): Promise<{ success: boolean; error?: any }> => {
  try {
    console.log('Initiating forgot password for mobile:', mobile);
    const email = `${mobile}@temp.com`;
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
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