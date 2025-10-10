import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  api_key: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useTenant() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { authState } = useAuth();

  useEffect(() => {
    if (!authState.user) {
      setTenant(null);
      setIsLoading(false);
      return;
    }

    const fetchTenant = async () => {
      try {
        setIsLoading(true);
        
        // Get user's profile with tenant info
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('tenant_id')
          .eq('user_id', authState.user!.id)
          .single();

        if (profileError) throw profileError;

        if (profile?.tenant_id) {
          // Fetch tenant details
          const { data: tenantData, error: tenantError } = await supabase
            .from('tenants')
            .select('*')
            .eq('id', profile.tenant_id)
            .single();

          if (tenantError) throw tenantError;
          setTenant(tenantData);
        }
      } catch (err) {
        console.error('Error fetching tenant:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch tenant'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenant();
  }, [authState.user]);

  return {
    tenant,
    isLoading,
    error,
  };
}
