export interface CintSurvey {
  id: string;
  title: string;
  description: string;
  reward_amount: number;
  time_estimate: number;
  category: string;
  provider: 'cint';
  qualification_score: number;
  completion_rate: number;
  status: 'available' | 'qualification_required' | 'full';
  metadata: {
    target_audience?: string;
    difficulty_level?: 'easy' | 'medium' | 'hard';
    survey_type?: 'consumer' | 'b2b' | 'medical' | 'political';
  };
}

export interface CintSurveySession {
  id: string;
  survey_id: string;
  user_id: string;
  cint_session_id: string;
  survey_url: string;
  estimated_reward: number;
  estimated_duration?: number;
  status: 'started' | 'completed' | 'terminated' | 'expired';
  started_at: string;
  completed_at?: string;
  actual_reward?: number;
  terminated_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface CintQualificationResult {
  qualified: boolean;
  redirect_url?: string;
  termination_reason?: string;
  estimated_reward?: number;
  estimated_duration?: number;
}