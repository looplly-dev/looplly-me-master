import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DecayConfig {
  id: string;
  config_key: string;
  interval_type: string;
  interval_days: number | null;
  description: string | null;
  is_active: boolean;
}

export const useDecayConfig = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: configs, isLoading } = useQuery({
    queryKey: ['decay-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile_decay_config')
        .select('*')
        .eq('is_active', true)
        .order('interval_days', { ascending: true, nullsFirst: false });
      
      if (error) throw error;
      return data as DecayConfig[];
    }
  });

  const updateInterval = useMutation({
    mutationFn: async ({ configKey, days }: { configKey: string; days: number }) => {
      const { error } = await supabase
        .from('profile_decay_config')
        .update({ interval_days: days })
        .eq('config_key', configKey);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decay-configs'] });
      queryClient.invalidateQueries({ queryKey: ['profile-questions'] });
      toast({ title: 'Decay interval updated successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to update interval',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const updateCategoryDefault = useMutation({
    mutationFn: async ({ categoryId, configKey }: { categoryId: string; configKey: string }) => {
      const { error } = await supabase
        .from('profile_categories')
        .update({ default_decay_config_key: configKey })
        .eq('id', categoryId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-categories'] });
      queryClient.invalidateQueries({ queryKey: ['profile-questions'] });
      toast({ title: 'Category default updated successfully' });
    }
  });

  const updateQuestionOverride = useMutation({
    mutationFn: async ({ questionId, configKey }: { questionId: string; configKey: string | null }) => {
      const { error } = await supabase
        .from('profile_questions')
        .update({ decay_config_key: configKey })
        .eq('id', questionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-questions'] });
      toast({ title: 'Question decay override updated' });
    }
  });

  return {
    configs,
    isLoading,
    updateInterval,
    updateCategoryDefault,
    updateQuestionOverride
  };
};
