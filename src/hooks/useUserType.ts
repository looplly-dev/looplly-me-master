import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type UserType = 'office_user' | 'looplly_user' | null;

/**
 * Hook to manage user types (office_user vs looplly_user)
 * 
 * This is separate from useRole which manages staff roles (super_admin, admin, user).
 * User types control feature access, not admin permissions.
 */
export function useUserType() {
  const [userType, setUserType] = useState<UserType>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { authState } = useAuth();

  useEffect(() => {
    if (!authState.user) {
      setUserType(null);
      setIsLoading(false);
      return;
    }

    const fetchUserType = async () => {
      try {
        // Use raw query since types table may not be in generated types yet
        const { data, error } = await supabase
          .rpc('get_user_type', { _user_id: authState.user!.id });

        if (error) {
          console.error('Error fetching user type:', error);
          setUserType('looplly_user');
        } else {
          setUserType((data as UserType) || 'looplly_user');
        }
      } catch (error) {
        console.error('Error fetching user type:', error);
        setUserType('looplly_user');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserType();
  }, [authState.user]);

  /**
   * Check if user has the specified type
   */
  const hasUserType = (type: UserType): boolean => {
    if (!userType || !type) return false;
    return userType === type;
  };

  /**
   * Check if user is an office user (B2B customer)
   */
  const isOfficeUser = (): boolean => {
    return userType === 'office_user';
  };

  /**
   * Check if user is a looplly user (direct B2C user)
   */
  const isLoopllyUser = (): boolean => {
    return userType === 'looplly_user';
  };

  return {
    userType,
    isLoading,
    hasUserType,
    isOfficeUser,
    isLoopllyUser,
  };
}
