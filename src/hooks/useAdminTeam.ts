import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TeamMember {
  user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: 'super_admin' | 'admin';
  created_at: string;
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

      // Fetch users with admin roles (super_admin or admin only)
      let query = supabase
        .from('profiles')
        .select(`
          user_id,
          email,
          first_name,
          last_name,
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
