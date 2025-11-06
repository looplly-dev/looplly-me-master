import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '@/integrations/supabase/activeClient';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useUserType } from './useUserType';

export interface ReputationHistory {
  transaction_id: string; // UUID for admin lookup
  action: string; // e.g., "Survey Completed"
  points: number; // +50 or -10
  date: string; // ISO timestamp
  category: 'survey' | 'streak' | 'badge' | 'profile' | 'referral' | 'admin';
  description: string; // Human-readable explanation
  metadata?: Record<string, any>;
  type: 'gain' | 'loss' | 'adjustment';
}

export interface QualityMetrics {
  surveysCompleted: number;
  surveysRejected: number;
  averageTime: string;
  consistencyScore: number;
  speedingRate: number;
}

export interface UserReputation {
  id: string;
  user_id: string;
  score: number;
  level: string;
  tier: string;
  prestige: number;
  next_level_threshold: number;
  history: ReputationHistory[];
  quality_metrics: QualityMetrics;
  beta_cohort: boolean;
  cohort_joined_at: string;
  beta_rep_cap: number;
  created_at: string;
  updated_at: string;
}

export const useUserReputation = () => {
  const { authState } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userType, isLoading: typeLoading } = useUserType();
  
  // CRITICAL: Call useQuery unconditionally (Rules of Hooks)
  // Disable query for team users instead of early return
  const { data: reputation, isLoading } = useQuery({
    queryKey: ['user-reputation', authState.user?.id, userType],
    queryFn: async () => {
      if (!authState.user?.id) return null;

      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('user_reputation')
        .select('*')
        .eq('user_id', authState.user.id)
        .maybeSingle();

      if (error) throw error;

      // Database trigger handles auto-creation, so just return null if not found
      if (!data) return null;

      return {
        ...data,
        history: data.history as unknown as ReputationHistory[],
        quality_metrics: data.quality_metrics as unknown as QualityMetrics,
      } as UserReputation;
    },
    // Disable query for team users and when still loading user type
    enabled: !!authState.user?.id && !typeLoading && userType !== 'looplly_team_user',
  });
  // After all hooks are declared, we'll derive what to return for team users below.


  const addReputationPoints = useMutation({
    mutationFn: async ({ points, action, category, description, metadata }: {
      points: number;
      action: string;
      category?: ReputationHistory['category'];
      description?: string;
      metadata?: ReputationHistory['metadata'];
    }) => {
      if (!authState.user?.id || !reputation) return;

      // Apply soft cap for Beta users above 500 Rep
      let actualPoints = points;
      if (reputation.beta_cohort && reputation.score > 500) {
        const softCapMultiplier = 1 - (reputation.score / reputation.beta_rep_cap);
        actualPoints = Math.round(points * Math.max(0.1, softCapMultiplier));
      }

      const newScore = Math.max(0, reputation.score + actualPoints); // Floor at 0

      // Calculate tier based on newScore
      let tier = 'Bronze';
      let level = 'Bronze Novice';
      let nextThreshold = 100;

      if (newScore >= 2000) {
        tier = 'Diamond';
        level = 'Diamond Master';
        nextThreshold = 5000;
      } else if (newScore >= 1000) {
        tier = 'Gold';
        level = 'Gold Elite';
        nextThreshold = 2000;
      } else if (newScore >= 500) {
        tier = 'Silver';
        level = 'Silver Elite';
        nextThreshold = 1000;
      } else if (newScore >= 100) {
        tier = 'Bronze';
        level = 'Bronze Champion';
        nextThreshold = 500;
      }

      // Build new history entry with expanded schema
      const newHistoryEntry: ReputationHistory = {
        transaction_id: crypto.randomUUID(),
        action,
        points: actualPoints,
        date: new Date().toISOString(),
        category: category || 'profile',
        description: description || action,
        metadata: metadata || {},
        type: actualPoints >= 0 ? 'gain' : 'loss'
      };

      const newHistory = [
        newHistoryEntry,
        ...reputation.history
      ].slice(0, 50); // Keep last 50 entries

      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('user_reputation')
        .update({
          score: newScore,
          level,
          tier,
          next_level_threshold: nextThreshold,
          history: newHistory as any
        })
        .eq('user_id', authState.user.id);

      if (error) throw error;

      return { newScore, level, tier, actualPoints };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-reputation', authState.user?.id] });
      if (data) {
        toast({
          title: 'Reputation Updated',
          description: `You earned reputation points! Current level: ${data.level}`,
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

  const updateQualityMetrics = useMutation({
    mutationFn: async (metrics: QualityMetrics) => {
      if (!authState.user?.id) return;

      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('user_reputation')
        .update({ quality_metrics: metrics as any })
        .eq('user_id', authState.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-reputation', authState.user?.id] });
    },
  });

  const effectiveReputation = (typeLoading || userType === 'looplly_team_user') ? null : reputation;
  const effectiveLoading = typeLoading || (userType !== 'looplly_team_user' && isLoading);

  return {
    reputation: effectiveReputation,
    isLoading: effectiveLoading,
    addReputationPoints: addReputationPoints.mutate,
    updateQualityMetrics: updateQualityMetrics.mutate,
  };
};
