import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminUser {
  user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  mobile: string | null;
  country_code: string | null;
  created_at: string | null;
  profile_complete: boolean | null;
  is_verified: boolean | null;
  is_suspended: boolean | null;
  role: string | null;
}

export function useAdminUsers(searchQuery: string = '') {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Query profiles table with optional search filter
      let query = supabase
        .from('profiles')
        .select(`
          user_id,
          email,
          first_name,
          last_name,
          mobile,
          country_code,
          created_at,
          profile_complete,
          is_verified,
          is_suspended
        `)
        .order('created_at', { ascending: false });

      // Apply search filter if query exists
      if (searchQuery.trim()) {
        query = query.or(
          `email.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,mobile.ilike.%${searchQuery}%`
        );
      }

      const { data: profilesData, error: profilesError } = await query;

      if (profilesError) throw profilesError;

      // Fetch roles for all users
      const userIds = profilesData?.map(p => p.user_id) || [];
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      // Merge profiles with roles
      const usersWithRoles = profilesData?.map(profile => ({
        ...profile,
        role: rolesData?.find(r => r.user_id === profile.user_id)?.role || 'user'
      })) || [];

      setUsers(usersWithRoles);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery]);

  return { users, isLoading, error, refetch: fetchUsers };
}
