import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  streak_started_at: string | null;
  milestones: {
    weekly: { achieved: boolean; count: number };
    monthly: { achieved: boolean; count: number };
    quarterly: { achieved: boolean; count: number };
    yearly: { achieved: boolean; count: number };
  };
  unlocked_stages: {
    stage1: boolean;
    stage2: boolean;
  };
  stage_unlock_history: Array<{ stage: number; unlockedAt: string }>;
  consecutive_days_missed: number;
  grace_period_started_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useUserStreaks = () => {
  const { authState } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: streak, isLoading } = useQuery({
    queryKey: ['user-streak', authState.user?.id],
    queryFn: async () => {
      if (!authState.user?.id) return null;

      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', authState.user.id)
        .maybeSingle();

      if (error) throw error;

      // If no streak exists, create one
      if (!data) {
        const { data: newStreak, error: insertError } = await supabase
          .from('user_streaks')
          .insert({
            user_id: authState.user.id,
            current_streak: 0,
            longest_streak: 0,
            milestones: {
              weekly: { achieved: false, count: 0 },
              monthly: { achieved: false, count: 0 },
              quarterly: { achieved: false, count: 0 },
              yearly: { achieved: false, count: 0 }
            }
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newStreak as UserStreak;
      }

      return data as UserStreak;
    },
    enabled: !!authState.user?.id,
  });

  const updateStreakMutation = useMutation({
    mutationFn: async () => {
      if (!authState.user?.id || !streak) return;

      const today = new Date().toISOString().split('T')[0];
      const lastActivityDate = streak.last_activity_date;

      // If already logged in today, do nothing
      if (lastActivityDate === today) return;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newCurrentStreak = streak.current_streak;
      let newLongestStreak = streak.longest_streak;
      let newConsecutiveDaysMissed = streak.consecutive_days_missed || 0;
      let newGracePeriodStartedAt = streak.grace_period_started_at;
      let toastMessage = '';
      let toastTitle = 'Streak Updated';

      // Check Stage 2 unlock status
      const isStage2Unlocked = streak.unlocked_stages?.stage2 || false;
      const STAGE_2_CAP = 29;
      const GRACE_PERIOD_DAYS = 7;

      // Calculate days missed
      const daysMissed = lastActivityDate 
        ? Math.floor((new Date(today).getTime() - new Date(lastActivityDate).getTime()) / (1000 * 60 * 60 * 24)) - 1
        : 0;

      // Consecutive day logic
      if (lastActivityDate === yesterdayStr) {
        // Check Stage 2 cap
        if (!isStage2Unlocked && newCurrentStreak >= STAGE_2_CAP) {
          // At cap, no increment
          toastTitle = '🔒 Stage 2 Locked';
          toastMessage = `Streak capped at ${STAGE_2_CAP} days. Unlock Stage 2 to continue!`;
          newConsecutiveDaysMissed = 0;
          newGracePeriodStartedAt = null;
        } else {
          // Normal increment
          newCurrentStreak += 1;
          newConsecutiveDaysMissed = 0;
          newGracePeriodStartedAt = null;
          toastMessage = `${newCurrentStreak} day streak! Keep it going! 🔥`;
        }
      } else if (daysMissed > 0 && daysMissed <= GRACE_PERIOD_DAYS) {
        // Grace period active
        newConsecutiveDaysMissed += daysMissed;
        
        if (!newGracePeriodStartedAt) {
          newGracePeriodStartedAt = new Date().toISOString();
        }

        const graceDaysRemaining = GRACE_PERIOD_DAYS - newConsecutiveDaysMissed;

        if (!isStage2Unlocked && newCurrentStreak >= STAGE_2_CAP) {
          // At cap in grace period
          toastTitle = '⚠️ Grace Period Active';
          toastMessage = `Streak paused at ${STAGE_2_CAP} days. ${graceDaysRemaining} day${graceDaysRemaining !== 1 ? 's' : ''} left - unlock Stage 2 to continue!`;
        } else {
          // Normal grace period increment
          newCurrentStreak += 1;
          toastTitle = graceDaysRemaining <= 1 ? '🚨 Final Grace Day!' : '⚠️ Grace Period Active';
          toastMessage = graceDaysRemaining <= 1
            ? `Streak continued! But this is your last grace day - don't miss tomorrow! 🔥`
            : `Streak continued to ${newCurrentStreak} days! ${graceDaysRemaining} grace day${graceDaysRemaining !== 1 ? 's' : ''} remaining.`;
        }
      } else {
        // Streak reset
        newCurrentStreak = 1;
        newConsecutiveDaysMissed = 0;
        newGracePeriodStartedAt = null;
        toastTitle = '🎯 Starting Fresh!';
        toastMessage = "Let's build an even longer streak this time! Day 1 begins now 💪";
      }

      // Update longest streak if needed
      newLongestStreak = Math.max(newLongestStreak, newCurrentStreak);

      const { error } = await supabase
        .from('user_streaks')
        .update({
          current_streak: newCurrentStreak,
          longest_streak: newLongestStreak,
          last_activity_date: today,
          consecutive_days_missed: newConsecutiveDaysMissed,
          grace_period_started_at: newGracePeriodStartedAt,
          streak_started_at: streak.streak_started_at || new Date().toISOString()
        })
        .eq('user_id', authState.user.id);

      if (error) throw error;

      return { toastTitle, toastMessage };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-streak', authState.user?.id] });
      if (data?.toastMessage) {
        toast({
          title: data.toastTitle,
          description: data.toastMessage,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMilestones = useMutation({
    mutationFn: async (milestones: UserStreak['milestones']) => {
      if (!authState.user?.id) return;

      const { error } = await supabase
        .from('user_streaks')
        .update({ milestones })
        .eq('user_id', authState.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-streak', authState.user?.id] });
    },
  });

  return {
    streak,
    isLoading,
    updateStreak: updateStreakMutation.mutate,
    updateMilestones: updateMilestones.mutate,
  };
};
