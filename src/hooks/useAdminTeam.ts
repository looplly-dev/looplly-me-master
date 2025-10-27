import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TeamMember {
  user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  company_role: string | null;
  role: 'super_admin' | 'admin' | 'tester';
  created_at: string;
  is_active: boolean;
}

/**
 * Hook to fetch and manage Looplly team members (staff with admin roles)
 * 
 * This fetches users from user_roles table (staff only), not user_types.
 * Only returns users with super_admin or admin roles.
 */
export function useAdminTeam(searchQuery: string = '') {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Step 1: Fetch team profiles with optional search filter
      let profileQuery = supabase
        .from('team_profiles')
        .select('user_id, email, first_name, last_name, company_name, company_role, is_active, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (searchQuery.trim()) {
        profileQuery = profileQuery.or(
          `email.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`
        );
      }

      const { data: profiles, error: profileError } = await profileQuery;
      if (profileError) throw profileError;

      // Step 2: Fetch user roles for admin/super_admin/tester
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('role', ['super_admin', 'admin', 'tester']);

      if (rolesError) throw rolesError;

      // Step 3: Build role map with highest role resolution
      const roleHierarchy = { super_admin: 3, admin: 2, tester: 1 };
      const userRolesMap = new Map<string, string[]>();
      
      roles?.forEach(r => {
        if (!userRolesMap.has(r.user_id)) {
          userRolesMap.set(r.user_id, []);
        }
        userRolesMap.get(r.user_id)!.push(r.role);
      });

      const roleMap = new Map<string, 'super_admin' | 'admin' | 'tester'>();
      userRolesMap.forEach((userRoles, userId) => {
        const highest = userRoles.sort((a, b) => 
          (roleHierarchy[b as keyof typeof roleHierarchy] || 0) - 
          (roleHierarchy[a as keyof typeof roleHierarchy] || 0)
        )[0];
        roleMap.set(userId, highest as 'super_admin' | 'admin' | 'tester');
      });

      // Step 4: Merge profiles with roles, filtering out non-staff users
      const members: TeamMember[] = (profiles || [])
        .filter(profile => roleMap.has(profile.user_id))
        .map(profile => ({
          user_id: profile.user_id,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          company_name: profile.company_name,
          company_role: profile.company_role,
          is_active: profile.is_active,
          role: roleMap.get(profile.user_id) as 'super_admin' | 'admin' | 'tester',
          created_at: profile.created_at,
        }));

      setTeamMembers(members);
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch team members');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, [searchQuery]);

  return {
    teamMembers,
    isLoading,
    error,
    refetch: fetchTeamMembers,
  };
}
