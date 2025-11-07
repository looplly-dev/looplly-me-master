import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/integrations/supabase/activeClient';
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
    let mounted = true;
    
    if (!authState.user) {
      setUserType(null);
      setIsLoading(false);
      return;
    }

    const fetchUserType = async () => {
      try {
        const supabase = getSupabaseClient();
        
        // Step 1: Check team membership via team_profiles (own row)
        const { data: teamProfile, error: teamError } = await supabase
          .from('team_profiles')
          .select('user_id')
          .eq('user_id', authState.user!.id)
          .maybeSingle();

        if (!mounted) return;

        if (teamError && teamError.code !== 'PGRST116') {
          console.error('[useUserType] Error checking team_profiles:', teamError);
        }

        if (teamProfile) {
          setUserType('looplly_team_user');
          setIsLoading(false);
          if (import.meta.env.DEV) {
            console.info('[useUserType] Team membership verified via team_profiles');
          }
          return;
        }

        // Step 2: Check profiles for regular users (use maybeSingle to handle missing rows gracefully)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('user_id', authState.user!.id)
          .maybeSingle();

        if (!mounted) return;

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('[useUserType] Error fetching user type from profiles:', profileError);
        }

        if (profile) {
          setUserType((profile.user_type as UserType) || 'looplly_user');
        } else {
          // User not found in either table - silently default without warning in production
          if (import.meta.env.DEV) {
            console.info('[useUserType] User not found in team_profiles or profiles, defaulting to looplly_user');
          }
          setUserType('looplly_user');
        }
      } catch (error) {
        console.error('[useUserType] Error in fetchUserType:', error);
        if (mounted) {
          setUserType('looplly_user');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUserType();
    
    return () => {
      mounted = false;
    };
  }, [authState.user?.id]); // Only depend on user ID, not entire user object

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
