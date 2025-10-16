import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StreakUnlockConfig {
  id: string;
  stage: number;
  config_key: string;
  config_value: any;
  description: string | null;
  is_active: boolean;
  tenant_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useStreakUnlockConfig = (stage?: number) => {
  return useQuery({
    queryKey: ['streak-unlock-config', stage],
    queryFn: async () => {
      let query = supabase
        .from('streak_unlock_config')
        .select('*')
        .eq('is_active', true);

      if (stage !== undefined) {
        query = query.eq('stage', stage);
      }

      const { data, error } = await query.order('stage');

      if (error) throw error;
      return data as StreakUnlockConfig[];
    },
  });
};
