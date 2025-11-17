import { useState, useEffect } from 'react';
import { adminClient } from '@/integrations/supabase/adminClient';
import { formatMobileForDisplay } from '@/utils/mobileValidation';

export interface AdminUser {
  user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  mobile: string | null;
  country_code: string | null;
  created_at: string | null;
  profile_complete: boolean | null;
  level_2_complete: boolean | null;  // Using level_2_complete instead of is_verified
  is_suspended: boolean | null;
  user_type: 'looplly_user' | 'looplly_team_user' | 'client_user' | null;
}

export function useAdminUsers(searchQuery: string = '') {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Debug: Check admin session
      const { data: sessionData, error: sessionError } = await adminClient.auth.getSession();
      console.log('[useAdminUsers] Session check:', { 
        hasSession: !!sessionData?.session,
        userId: sessionData?.session?.user?.id,
        email: sessionData?.session?.user?.email,
        sessionError 
      });

      let query = adminClient
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
          level_2_complete,
          is_suspended,
          user_type
        `)
        .eq('user_type', 'looplly_user')
        .order('created_at', { ascending: false });

      if (searchQuery.trim()) {
        query = query.or(
          `email.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,mobile.ilike.%${searchQuery}%`
        );
      }

      const { data: profilesData, error: profilesError } = await query;
      
      console.log('[useAdminUsers] Query result:', { 
        dataCount: profilesData?.length ?? 0,
        error: profilesError 
      });
      
      if (profilesError) {
        console.error('[useAdminUsers] Query error:', profilesError);
        throw profilesError;
      }

      const usersWithTypes = profilesData?.map(profile => ({
        ...profile,
        mobile: profile.mobile && profile.country_code 
          ? formatMobileForDisplay(profile.mobile, profile.country_code, 'international')
          : profile.mobile
      })) || [];

      console.log('[useAdminUsers] Processed users:', usersWithTypes.length);
      setUsers(usersWithTypes);
    } catch (err) {
      console.error('[useAdminUsers] Error fetching users:', err);
      console.error('[useAdminUsers] Error details:', JSON.stringify(err, null, 2));
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
