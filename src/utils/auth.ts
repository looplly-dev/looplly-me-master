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
    
    // Format mobile number consistently 
    const fullMobile = `${params.countryCode}${params.mobile}`;
    
    // Use email if provided, otherwise use temporary email with emailRedirectTo
    const email = params.email || `${params.mobile}@temp.com`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password: params.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          first_name: params.firstName || '',
          last_name: params.lastName || '',
          mobile: fullMobile,
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
    
    // Format the mobile number to match what's stored
    const fullMobile = params.mobile.startsWith('+') ? params.mobile : `+44${params.mobile}`;
    
    // Try to find the user by phone number
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('mobile', fullMobile)
      .maybeSingle();

    if (userError) {
      console.error('Error querying profiles:', userError);
      return { success: false, error: { message: 'Invalid mobile number or password' } };
    }

    if (!userData) {
      console.log('No profile found for mobile:', fullMobile);
      return { success: false, error: { message: 'Invalid mobile number or password' } };
    }

    // Get the user's actual email from auth.users
    const { data: authUser, error: authError } = await supabase
      .rpc('get_user_email', { user_uuid: userData.user_id });

    if (authError || !authUser) {
      console.error('Could not find user email:', authError);
      return { success: false, error: { message: 'Invalid mobile number or password' } };
    }

    console.log('Found user email:', authUser, 'for user_id:', userData.user_id);

    const { error } = await supabase.auth.signInWithPassword({
      email: authUser,
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