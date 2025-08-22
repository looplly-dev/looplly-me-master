// Profile-related utilities
import { supabase } from '@/integrations/supabase/client';

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  gender?: 'male' | 'female' | 'other';
  date_of_birth?: string;
  address?: string;
  household_income?: string;
  ethnicity?: string;
  sec?: 'A' | 'B' | 'C1' | 'C2' | 'D' | 'E';
  profile_complete?: boolean;
}

export const formatProfileForDatabase = (profile: any): ProfileUpdateData => {
  return {
    first_name: profile.firstName,
    last_name: profile.lastName,
    gender: profile.gender as 'male' | 'female' | 'other',
    date_of_birth: profile.dateOfBirth,
    address: profile.address,
    household_income: profile.householdIncome,
    ethnicity: profile.ethnicity,
    sec: profile.sec as 'A' | 'B' | 'C1' | 'C2' | 'D' | 'E',
    profile_complete: true
  };
};

export const updateUserProfile = async (userId: string, profileData: any): Promise<boolean> => {
  try {
    console.log('Updating profile for user:', userId, 'with data:', profileData);
    
    const formattedData = formatProfileForDatabase(profileData);
    
    const { error } = await supabase
      .from('profiles')
      .update(formattedData)
      .eq('user_id', userId);

    if (error) {
      console.error('Profile update error:', error);
      throw error;
    }
    
    console.log('Profile updated successfully');
    return true;
  } catch (error) {
    console.error('Profile update failed:', error);
    return false;
  }
};

export const fetchUserProfile = async (userId: string) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }

    return profile;
  } catch (error) {
    console.error('Profile fetch failed:', error);
    return null;
  }
};

export const createUserProfile = async (userId: string, profileData: any, mobile: string, countryCode: string): Promise<boolean> => {
  try {
    console.log('Creating profile for user:', userId);
    
    const formattedData = formatProfileForDatabase(profileData);
    
    const { error } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        mobile: mobile,
        country_code: countryCode,
        first_name: profileData.firstName || '',
        last_name: profileData.lastName || '',
        ...formattedData
      });

    if (error) {
      console.error('Profile creation error:', error);
      throw error;
    }
    
    console.log('Profile created successfully');
    return true;
  } catch (error) {
    console.error('Profile creation failed:', error);
    return false;
  }
};