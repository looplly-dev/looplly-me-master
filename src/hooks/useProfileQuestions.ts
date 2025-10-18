import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ProfileQuestion {
  id: string;
  category_id: string;
  question_key: string;
  question_text: string;
  question_type: 'text' | 'select' | 'multiselect' | 'date' | 'number' | 'address' | 'email' | 'phone' | 'boolean';
  validation_rules: any;
  options: string[] | null;
  placeholder: string | null;
  help_text: string | null;
  level: number;
  is_required: boolean;
  display_order: number;
  staleness_days: number | null;
  user_answer?: {
    id: string;
    answer_value: string | null;
    answer_json: any | null;
    is_stale: boolean | null;
    last_updated: string | null;
  } | null;
}

export interface ProfileCategory {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  icon: string | null;
  level: number;
  display_order: number;
  questions: ProfileQuestion[];
  completedCount: number;
  totalCount: number;
  staleCount: number;
}

export const useProfileQuestions = () => {
  const { authState } = useAuth();
  const userId = authState.user?.id;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['profile-questions', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');

      // Fetch categories with questions
      const { data: categories, error: categoriesError } = await supabase
        .from('profile_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (categoriesError) throw categoriesError;

      // Fetch questions
      const { data: questions, error: questionsError } = await supabase
        .from('profile_questions')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (questionsError) throw questionsError;

      // Fetch user's answers
      const { data: answers, error: answersError } = await supabase
        .from('profile_answers')
        .select('*')
        .eq('user_id', userId);

      if (answersError) throw answersError;

      // Create answer map for quick lookup
      const answerMap = new Map(
        answers?.map(a => [a.question_id, a]) || []
      );

      // Group questions by category and attach user answers
      const categoriesWithQuestions: ProfileCategory[] = categories.map(cat => {
        const categoryQuestions = questions
          .filter(q => q.category_id === cat.id)
          .map(q => {
            const userAnswer = answerMap.get(q.id);
            
            // Calculate staleness
            let isStale = false;
            if (userAnswer && q.staleness_days && userAnswer.last_updated) {
              const lastUpdated = new Date(userAnswer.last_updated);
              const daysSinceUpdate = Math.floor(
                (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
              );
              isStale = daysSinceUpdate > q.staleness_days;
            }

            return {
              ...q,
              question_type: q.question_type as ProfileQuestion['question_type'],
              user_answer: userAnswer ? {
                ...userAnswer,
                is_stale: isStale
              } : null
            } as ProfileQuestion;
          });

        const answeredCount = categoryQuestions.filter(
          q => q.user_answer?.answer_value || q.user_answer?.answer_json
        ).length;

        const staleCount = categoryQuestions.filter(
          q => q.user_answer?.is_stale
        ).length;

        return {
          ...cat,
          questions: categoryQuestions,
          completedCount: answeredCount,
          totalCount: categoryQuestions.length,
          staleCount
        };
      });

      // Calculate level completion
      const level2Categories = categoriesWithQuestions.filter(c => c.level === 2);
      const level2RequiredQuestions = level2Categories.flatMap(c => 
        c.questions.filter(q => q.is_required)
      );
      const level2CompletedRequired = level2RequiredQuestions.filter(
        q => q.user_answer?.answer_value || q.user_answer?.answer_json
      ).length;
      const level2Complete = level2CompletedRequired === level2RequiredQuestions.length;

      // Calculate Level 3 percentage
      const level3Categories = categoriesWithQuestions.filter(c => c.level === 3);
      const level3Questions = level3Categories.flatMap(c => c.questions);
      const level3Answered = level3Questions.filter(
        q => q.user_answer?.answer_value || q.user_answer?.answer_json
      ).length;
      const level3Percentage = level3Questions.length > 0 
        ? Math.round((level3Answered / level3Questions.length) * 100)
        : 0;

      // Count stale answers across all levels
      const staleQuestionCount = categoriesWithQuestions
        .flatMap(c => c.questions)
        .filter(q => q.user_answer?.is_stale).length;

      return {
        categoriesWithQuestions,
        level2Complete,
        level3Percentage,
        staleQuestionCount,
        level2Categories,
        level3Categories
      };
    },
    enabled: !!userId,
    staleTime: 30000, // 30 seconds
  });

  return {
    categoriesWithQuestions: data?.categoriesWithQuestions || [],
    level2Complete: data?.level2Complete || false,
    level3Percentage: data?.level3Percentage || 0,
    staleQuestionCount: data?.staleQuestionCount || 0,
    level2Categories: data?.level2Categories || [],
    level3Categories: data?.level3Categories || [],
    isLoading,
    refetch
  };
};
