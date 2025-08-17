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
    console.log('Registering user with phone:', params);
    
    // Format mobile number consistently 
    const fullMobile = `${params.countryCode}${params.mobile}`;
    
    // Use phone-based auth instead of email
    const { error } = await supabase.auth.signUp({
      phone: fullMobile,
      password: params.password,
      options: {
        data: {
          first_name: params.firstName || '',
          last_name: params.lastName || '',
          mobile: fullMobile,
          country_code: params.countryCode,
          email: params.email || ''
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
    
    // Format the mobile number to match what's stored
    const fullMobile = params.mobile.startsWith('+') ? params.mobile : `+44${params.mobile}`;
    
    // Use phone-based login instead of email lookup
    const { error } = await supabase.auth.signInWithPassword({
      phone: fullMobile,
      password: params.password
    });

    if (error) {
      console.error('Login error:', error);
      return { success: false, error: { message: 'Invalid mobile number or password' } };
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