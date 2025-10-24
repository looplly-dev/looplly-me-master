import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type UserType = 'looplly_user' | 'looplly_team_user' | 'client_user' | null;

/**
 * Hook to manage user types
 * 
 * User Types:
 * - looplly_user: Regular users (main user base, no admin portal access)
 * - looplly_team_user: Looplly staff (access admin portal, have roles in user_roles table)
 * - client_user: B2B clients (future - companies using Looplly services)
 * 
 * This is separate from useRole which manages staff roles (super_admin, admin, tester).
 * User types control WHAT features you access, roles control PERMISSION LEVEL within those features.
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
        // SECURITY: Check team_members table first (most secure, super_admin only visibility)
        const { data: teamMember } = await supabase
          .from('team_members')
          .select('is_active')
          .eq('user_id', authState.user!.id)
          .maybeSingle();

        if (teamMember?.is_active) {
          setUserType('looplly_team_user');
          setIsLoading(false);
          return;
        }

        // Fallback to profiles for backward compatibility
        const result = await supabase
          .from('profiles')
          .select('user_type')
          .eq('user_id', authState.user!.id)
          .single();

        if (result.error) {
          console.error('Error fetching user type:', result.error);
          setUserType('looplly_user'); // Default fallback
        } else {
          setUserType(result.data?.user_type as UserType || 'looplly_user');
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
   * Check if user is Looplly staff member
   */
  const isTeamMember = (): boolean => {
    return userType === 'looplly_team_user';
  };

  /**
   * Check if user is a B2B client (future)
   */
  const isClientUser = (): boolean => {
    return userType === 'client_user';
  };

  /**
   * Check if user is a regular Looplly user
   */
  const isLoopllyUser = (): boolean => {
    return userType === 'looplly_user';
  };

  return {
    userType,
    isLoading,
    hasUserType,
    isTeamMember,
    isClientUser,
    isLoopllyUser,
  };
}
