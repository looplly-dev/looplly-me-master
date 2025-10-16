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
      };

      const history = (currentStreak?.stage_unlock_history || []) as Array<{
        stage: number;
        unlockedAt: string;
      }>;

      // Update unlocked stages
      const stageKey = `stage${stage}` as 'stage1' | 'stage2';
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
    unlockStage: unlockStageMutation.mutate,
    isUnlocking: unlockStageMutation.isPending,
  };
};
