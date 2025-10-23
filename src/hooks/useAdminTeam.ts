import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TeamMember {
  user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  company_role: string | null;
  role: 'super_admin' | 'admin';
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

      // Fetch team members from team_profiles with their roles
      let query = supabase
        .from('team_profiles')
        .select(`
          user_id,
          email,
          first_name,
          last_name,
          company_name,
          company_role,
          is_active,
          created_at,
          user_roles!inner(role)
        `)
        .in('user_roles.role', ['super_admin', 'admin'])
        .order('created_at', { ascending: false });

      // Apply search filter if provided
      if (searchQuery.trim()) {
        query = query.or(
          `email.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`
        );
      }

      const { data, error: queryError } = await query;

      if (queryError) {
        throw queryError;
      }

      // Transform data to TeamMember format
      const members: TeamMember[] = (data || []).map((profile: any) => ({
        user_id: profile.user_id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        company_name: profile.company_name,
        company_role: profile.company_role,
        is_active: profile.is_active,
        role: profile.user_roles.role as 'super_admin' | 'admin',
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
