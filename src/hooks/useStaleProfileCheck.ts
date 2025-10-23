import { useProfileQuestions } from './useProfileQuestions';
import { useUserType } from './useUserType';

export const useStaleProfileCheck = () => {
  const { level2Categories, level3Categories, isLoading } = useProfileQuestions();
  const { isTeamMember } = useUserType();
  
  // Team members don't have profile data requirements
  if (isTeamMember()) {
    return {
      hasStaleData: false,
      staleQuestions: [],
      staleCount: 0,
      isLoading: false
    };
  }
  
  const allQuestions = [
    ...level2Categories.flatMap(c => c.questions),
    ...level3Categories.flatMap(c => c.questions)
  ];
  
  const staleQuestions = allQuestions.filter(q => {
    // Skip immutable fields
    if (q.is_immutable) return false;
    
    // Skip unanswered questions
    if (!q.user_answer?.answer_value && !q.user_answer?.answer_json) return false;
    
    // Skip questions without decay config
    if (!q.decay_interval_days) return false;
    
    // Calculate staleness
    const lastUpdated = new Date(q.user_answer.last_updated);
    const daysSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate > q.decay_interval_days;
  });
  
  return {
    hasStaleData: staleQuestions.length > 0,
    staleQuestions,
    staleCount: staleQuestions.length,
    isLoading
  };
};
