import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface ReputationHistory {
  action: string;
  points: number;
  date: string;
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
  created_at: string;
  updated_at: string;
}

export const useUserReputation = () => {
  const { authState } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reputation, isLoading } = useQuery({
    queryKey: ['user-reputation', authState.user?.id],
    queryFn: async () => {
      if (!authState.user?.id) return null;

      const { data, error } = await supabase
        .from('user_reputation')
        .select('*')
        .eq('user_id', authState.user.id)
        .maybeSingle();

      if (error) throw error;

      // If no reputation exists, create one
      if (!data) {
        const { data: newReputation, error: insertError } = await supabase
          .from('user_reputation')
          .insert({
            user_id: authState.user.id,
            score: 0,
            level: 'Bronze Novice',
            tier: 'Bronze',
            prestige: 0,
            next_level_threshold: 100,
            history: [],
            quality_metrics: {
              surveysCompleted: 0,
              surveysRejected: 0,
              averageTime: '0 min',
              consistencyScore: 0,
              speedingRate: 0
            }
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return {
          ...newReputation,
          history: newReputation.history as unknown as ReputationHistory[],
          quality_metrics: newReputation.quality_metrics as unknown as QualityMetrics,
        } as UserReputation;
      }

      return {
        ...data,
        history: data.history as unknown as ReputationHistory[],
        quality_metrics: data.quality_metrics as unknown as QualityMetrics,
      } as UserReputation;
    },
    enabled: !!authState.user?.id,
  });

  const addReputationPoints = useMutation({
    mutationFn: async ({ points, action }: { points: number; action: string }) => {
      if (!authState.user?.id || !reputation) return;

      const newScore = reputation.score + points;
      const newHistory = [
        { action, points, date: new Date().toISOString().split('T')[0] },
        ...reputation.history
      ].slice(0, 50); // Keep last 50 entries

      // Calculate tier based on score
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

      return { newScore, level, tier };
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

  return {
    reputation,
    isLoading,
    addReputationPoints: addReputationPoints.mutate,
    updateQualityMetrics: updateQualityMetrics.mutate,
  };
};
