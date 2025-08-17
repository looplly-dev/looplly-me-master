import { supabase } from '@/integrations/supabase/client';

export const deleteConflictingUser = async (email: string, userId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('delete-user', {
      body: { email, userId }
    });

    if (error) {
      console.error('Error calling delete-user function:', error);
      return false;
    }

    console.log('User deletion result:', data);
    return true;
  } catch (error) {
    console.error('Failed to delete conflicting user:', error);
    return false;
  }
};