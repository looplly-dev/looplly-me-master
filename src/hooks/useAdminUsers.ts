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
  user_type: 'office_user' | 'looplly_user' | null; // Changed from role
}

export function useAdminUsers(searchQuery: string = '') {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
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

      if (searchQuery.trim()) {
        query = query.or(
          `email.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,mobile.ilike.%${searchQuery}%`
        );
      }

      const { data: profilesData, error: profilesError } = await query;
      if (profilesError) throw profilesError;

      // Fetch user types using raw SQL since types aren't generated yet
      const userIds = profilesData?.map(p => p.user_id) || [];
      const { data: typesData } = await supabase.rpc('get_auth_users_with_phones').select('*').in('user_id', userIds);

      const usersWithTypes = profilesData?.map(profile => ({
        ...profile,
        user_type: 'looplly_user' as 'office_user' | 'looplly_user'
      })) || [];

      setUsers(usersWithTypes);
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
