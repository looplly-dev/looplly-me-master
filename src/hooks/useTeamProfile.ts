import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface TeamProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  company_role: string | null;
  is_active: boolean;
  must_change_password: boolean;
  temp_password_expires_at: string | null;
  first_login_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Hook to fetch and manage team member profile
 * Only works for looplly_team_user type
 */
export function useTeamProfile() {
  const [profile, setProfile] = useState<TeamProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authState } = useAuth();

  useEffect(() => {
    if (!authState.user?.id) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: queryError } = await supabase
          .from('team_profiles')
          .select('*')
          .eq('user_id', authState.user!.id)
          .single();

        if (queryError) {
          throw queryError;
        }

        setProfile(data);
      } catch (err) {
        console.error('Error fetching team profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [authState.user?.id]);

  const updateProfile = async (updates: Partial<TeamProfile>) => {
    if (!authState.user?.id) {
      throw new Error('No authenticated user');
    }

    try {
      const { data, error: updateError } = await supabase
        .from('team_profiles')
        .update(updates)
        .eq('user_id', authState.user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setProfile(data);
      return true;
    } catch (err) {
      console.error('Error updating team profile:', err);
      throw err;
    }
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile,
  };
}
