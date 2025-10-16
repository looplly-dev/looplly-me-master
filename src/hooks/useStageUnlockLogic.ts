import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useStreakUnlockConfig } from './useStreakUnlockConfig';
import { useQuery } from '@tanstack/react-query';

export const useStageUnlockLogic = () => {
  const { authState } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: configs } = useStreakUnlockConfig();

  // Check Stage 2: Badge requirements
  const checkStage2Unlock = useQuery({
    queryKey: ['check-stage2-unlock', authState.user?.id],
    queryFn: async () => {
      if (!authState.user?.id || !configs) return { canUnlock: false, progress: 0, total: 0 };

      const stage2Config = configs.find(c => c.stage === 2 && c.config_key === 'required_badges');
      if (!stage2Config) return { canUnlock: false, progress: 0, total: 0 };

      const { required, total, category, excludedBadgeIds } = stage2Config.config_value;

      // Get user's earned badges in the core verification category
      const { data: userBadges, error: badgesError } = await supabase
        .from('user_badges')
        .select('badge_id, badge_catalog(category, id)')
        .eq('user_id', authState.user.id);

      if (badgesError) throw badgesError;

      const earnedCoreVerificationBadges = userBadges?.filter(
        (ub: any) => 
          ub.badge_catalog?.category === category &&
          !excludedBadgeIds.includes(ub.badge_catalog.id)
      ) || [];

      const progress = earnedCoreVerificationBadges.length;
      const canUnlock = progress >= required;

      return { canUnlock, progress, total, required };
    },
    enabled: !!authState.user?.id && !!configs,
  });

  // Check Stage 3: Daily rep cap hits
  const checkStage3Unlock = useQuery({
    queryKey: ['check-stage3-unlock', authState.user?.id],
    queryFn: async () => {
      if (!authState.user?.id || !configs) return { canUnlock: false, progress: 0, required: 0 };

      const stage3Config = configs.find(c => c.stage === 3 && c.config_key === 'daily_rep_cap_days');
      if (!stage3Config) return { canUnlock: false, progress: 0, required: 0 };

      const { requiredDays } = stage3Config.config_value;

      // Get user's streak data
      const { data: streak, error } = await supabase
        .from('user_streaks')
        .select('daily_rep_cap_hits')
        .eq('user_id', authState.user.id)
        .maybeSingle();

      if (error) throw error;

      const capHits = (streak?.daily_rep_cap_hits as string[]) || [];
      const progress = capHits.length;
      const canUnlock = progress >= requiredDays;

      return { canUnlock, progress, required: requiredDays };
    },
    enabled: !!authState.user?.id && !!configs,
  });

  // Check Stage 4: SMS payment
  const checkStage4Unlock = useQuery({
    queryKey: ['check-stage4-unlock', authState.user?.id],
    queryFn: async () => {
      if (!authState.user?.id || !configs) return { canUnlock: false, hasPaid: false };

      const stage4Config = configs.find(c => c.stage === 4 && c.config_key === 'sms_unlock_payment');
      if (!stage4Config) return { canUnlock: false, hasPaid: false };

      // Check if user has a completed SMS payment transaction
      const { data: payment, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', authState.user.id)
        .eq('type', 'sms_unlock_payment')
        .eq('status', 'completed')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      const hasPaid = !!payment;
      return { canUnlock: hasPaid, hasPaid };
    },
    enabled: !!authState.user?.id && !!configs,
  });

  // Unlock a stage
  const unlockStageMutation = useMutation({
    mutationFn: async (stage: number) => {
      if (!authState.user?.id) throw new Error('Not authenticated');

      const { data: currentStreak, error: fetchError } = await supabase
        .from('user_streaks')
        .select('unlocked_stages, stage_unlock_history')
        .eq('user_id', authState.user.id)
        .single();

      if (fetchError) throw fetchError;

      const unlockedStages = currentStreak?.unlocked_stages || {
        stage1: true,
        stage2: false,
        stage3: false,
        stage4: false,
      };

      const history = (currentStreak?.stage_unlock_history || []) as Array<{
        stage: number;
        unlockedAt: string;
      }>;

      // Update unlocked stages
      const stageKey = `stage${stage}` as 'stage1' | 'stage2' | 'stage3' | 'stage4';
      unlockedStages[stageKey] = true;
      history.push({
        stage,
        unlockedAt: new Date().toISOString(),
      });

      const { error: updateError } = await supabase
        .from('user_streaks')
        .update({
          unlocked_stages: unlockedStages,
          stage_unlock_history: history,
        })
        .eq('user_id', authState.user.id);

      if (updateError) throw updateError;

      return { stage, unlockedStages };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-streak'] });
      queryClient.invalidateQueries({ queryKey: ['check-stage2-unlock'] });
      queryClient.invalidateQueries({ queryKey: ['check-stage3-unlock'] });
      queryClient.invalidateQueries({ queryKey: ['check-stage4-unlock'] });
      
      toast({
        title: `Stage ${data.stage} Unlocked! 🎉`,
        description: 'You can now access new earning opportunities.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Unlock Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    checkStage2Unlock,
    checkStage3Unlock,
    checkStage4Unlock,
    unlockStage: unlockStageMutation.mutate,
    isUnlocking: unlockStageMutation.isPending,
  };
};
