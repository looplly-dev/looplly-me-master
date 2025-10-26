import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/integrations/supabase/activeClient';
import { useAuth } from '@/hooks/useAuth';

export type UserRole = 'super_admin' | 'admin' | 'tester' | 'user' | null;

/**
 * Role hierarchy for staff permissions
 * super_admin (Level 3) > admin (Level 2) > tester (Level 1.5) > user (Level 1)
 * 
 * Note: This is separate from user_types (office_user, looplly_user)
 * which control feature access, not admin permissions.
 */
const ROLE_HIERARCHY: Record<NonNullable<UserRole>, number> = {
  super_admin: 3,
  admin: 2,
  tester: 1.5,
  user: 1,
};

export function useRole() {
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { authState } = useAuth();

  useEffect(() => {
    if (!authState.user) {
      setRole(null);
      setIsLoading(false);
      return;
    }

    const fetchUserRole = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', authState.user!.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setRole('user'); // Default to user role
        } else {
          setRole((data?.role as UserRole) || 'user');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('user');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [authState.user]);

  /**
   * Check if user has the required role or higher in the hierarchy
   * super_admin > admin > user
   */
  const hasRole = (requiredRole: UserRole): boolean => {
    if (!role || !requiredRole) return false;
    
    const userLevel = ROLE_HIERARCHY[role] || 0;
    const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
    
    return userLevel >= requiredLevel;
  };

  /**
   * Check if user is admin or super_admin
   */
  const isAdmin = (): boolean => {
    return role === 'admin' || role === 'super_admin';
  };

  /**
   * Check if user is super_admin specifically
   */
  const isSuperAdmin = (): boolean => {
    return role === 'super_admin';
  };

  /**
   * Check if user is tester or higher
   */
  const isTester = (): boolean => {
    return hasRole('tester');
  };

  /**
   * Get numeric role level (higher = more permissions)
   */
  const getRoleLevel = (): number => {
    return role ? (ROLE_HIERARCHY[role] || 0) : 0;
  };

  return {
    role,
    isLoading,
    hasRole,
    isAdmin,
    isSuperAdmin,
    isTester,
    getRoleLevel,
  };
}
