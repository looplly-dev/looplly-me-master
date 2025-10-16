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
    stage3: boolean;
    stage4: boolean;
  };
  stage_unlock_history: Array<{ stage: number; unlockedAt: string }>;
  daily_rep_cap_hits: string[];
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

      let newCurrentStreak = streak.current_streak;
      let newLongestStreak = streak.longest_streak;

      // Check if this is a new day
      if (lastActivityDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // If last activity was yesterday, increment streak
        if (lastActivityDate === yesterdayStr) {
          newCurrentStreak += 1;
        } else {
          // Streak broken, reset to 1
          newCurrentStreak = 1;
        }

        // Update longest streak if needed
        newLongestStreak = Math.max(newLongestStreak, newCurrentStreak);

        const { error } = await supabase
          .from('user_streaks')
          .update({
            current_streak: newCurrentStreak,
            longest_streak: newLongestStreak,
            last_activity_date: today,
            streak_started_at: streak.streak_started_at || new Date().toISOString()
          })
          .eq('user_id', authState.user.id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-streak', authState.user?.id] });
      toast({
        title: 'Streak Updated',
        description: 'Your daily streak has been recorded!',
      });
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
