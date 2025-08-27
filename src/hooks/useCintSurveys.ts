import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import type { CintSurvey, CintSurveySession } from '@/types/cint';

// Mock data for development - will be replaced with real API calls
const mockCintSurveys: CintSurvey[] = [
  {
    id: 'cint-001',
    title: 'Consumer Shopping Habits',
    description: 'Share your thoughts on online shopping preferences and habits',
    reward_amount: 3.50,
    time_estimate: 8,
    category: 'Consumer Research',
    provider: 'cint',
    qualification_score: 85,
    completion_rate: 92,
    status: 'available',
    metadata: {
      target_audience: 'Adults 18-54',
      difficulty_level: 'easy',
      survey_type: 'consumer'
    }
  },
  {
    id: 'cint-002',
    title: 'Brand Perception Study',
    description: 'Help us understand how consumers view different brands',
    reward_amount: 5.00,
    time_estimate: 12,
    category: 'Market Research',
    provider: 'cint',
    qualification_score: 78,
    completion_rate: 89,
    status: 'available',
    metadata: {
      target_audience: 'Adults 25-65',
      difficulty_level: 'medium',
      survey_type: 'consumer'
    }
  },
  {
    id: 'cint-003',
    title: 'Technology Usage Survey',
    description: 'Share insights about your technology and device usage',
    reward_amount: 2.75,
    time_estimate: 6,
    category: 'Technology',
    provider: 'cint',
    qualification_score: 90,
    completion_rate: 94,
    status: 'available',
    metadata: {
      target_audience: 'Tech users 18-45',
      difficulty_level: 'easy',
      survey_type: 'consumer'
    }
  }
];

export const useCintSurveys = () => {
  const [surveys, setSurveys] = useState<CintSurvey[]>([]);
  const [sessions, setSessions] = useState<CintSurveySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { authState } = useAuth();
  const { toast } = useToast();

  const fetchSurveys = async () => {
    try {
      // For now, use mock data
      // TODO: Replace with actual Cint API call when keys are available
      setSurveys(mockCintSurveys);
    } catch (error) {
      console.error('Error fetching Cint surveys:', error);
      setSurveys([]);
    }
  };

  const fetchSessions = async () => {
    if (!authState.user?.id) {
      setSessions([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cint_survey_sessions')
        .select('*')
        .eq('user_id', authState.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching survey sessions:', error);
        setSessions([]);
      } else {
        setSessions((data as CintSurveySession[]) || []);
      }
    } catch (error) {
      console.error('Error fetching survey sessions:', error);
      setSessions([]);
    }
  };

  const startSurvey = async (survey: CintSurvey): Promise<boolean> => {
    if (!authState.user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to start surveys",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Generate mock session data
      const sessionId = `cint_session_${Date.now()}`;
      const surveyUrl = `https://survey.cint.com/start?session=${sessionId}&survey=${survey.id}`;

      const { error } = await supabase
        .from('cint_survey_sessions')
        .insert({
          survey_id: survey.id,
          user_id: authState.user.id,
          cint_session_id: sessionId,
          survey_url: surveyUrl,
          estimated_reward: survey.reward_amount,
          estimated_duration: survey.time_estimate,
          status: 'started'
        });

      if (error) {
        console.error('Error creating survey session:', error);
        toast({
          title: "Error",
          description: "Failed to start survey. Please try again.",
          variant: "destructive"
        });
        return false;
      }

      // For now, show success message instead of redirecting
      toast({
        title: "Survey Started!",
        description: `You've started: ${survey.title}. This will open in a new window when API is connected.`,
      });

      await fetchSessions();
      return true;
    } catch (error) {
      console.error('Error starting survey:', error);
      toast({
        title: "Error",
        description: "Failed to start survey. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const completeSurvey = async (sessionId: string, actualReward: number): Promise<boolean> => {
    if (!authState.user?.id) return false;

    try {
      const { error } = await supabase
        .from('cint_survey_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          actual_reward: actualReward
        })
        .eq('id', sessionId)
        .eq('user_id', authState.user.id);

      if (error) {
        console.error('Error completing survey:', error);
        return false;
      }

      // Add transaction for the reward
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: authState.user.id,
          type: 'earning',
          amount: actualReward,
          source: 'cint_survey',
          metadata: { session_id: sessionId }
        });

      if (transactionError) {
        console.error('Error creating transaction:', transactionError);
      }

      toast({
        title: "Survey Completed!",
        description: `You earned $${actualReward.toFixed(2)} for completing the survey.`,
      });

      await fetchSessions();
      return true;
    } catch (error) {
      console.error('Error completing survey:', error);
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchSurveys(), fetchSessions()]);
      setIsLoading(false);
    };

    loadData();
  }, [authState.user?.id]);

  const availableSurveys = surveys.filter(survey => survey.status === 'available');
  const activeSessions = sessions.filter(session => session.status === 'started');
  const completedSessions = sessions.filter(session => session.status === 'completed');

  return {
    surveys: availableSurveys,
    sessions,
    activeSessions,
    completedSessions,
    isLoading,
    startSurvey,
    completeSurvey,
    refresh: () => Promise.all([fetchSurveys(), fetchSessions()])
  };
};