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
  is_immutable?: boolean;
  decay_config_key?: string | null;
  decay_interval_days?: number | null;
  decay_interval_type?: string | null;
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

      // Get user's country code
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('country_code')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;

      const userCountry = profile?.country_code || 'ZA'; // Default to South Africa

      // Fetch categories with questions and decay config
      const { data: categories, error: categoriesError } = await supabase
        .from('profile_categories')
        .select(`
          *,
          default_decay_config:profile_decay_config!profile_categories_default_decay_config_key_fkey(
            config_key,
            interval_type,
            interval_days
          )
        `)
        .eq('is_active', true)
        .order('display_order');

      if (categoriesError) throw categoriesError;

      // Fetch questions filtered by country
      const { data: questions, error: questionsError } = await supabase
        .from('profile_questions')
        .select(`
          *,
          question_decay_config:profile_decay_config!profile_questions_decay_config_key_fkey(
            config_key,
            interval_type,
            interval_days
          )
        `)
        .eq('is_active', true)
        .or(`applicability.eq.global,country_codes.cs.{${userCountry}}`)
        .order('display_order');

      if (questionsError) throw questionsError;

      // Get IDs of country-specific questions
      const countrySpecificIds = questions
        ?.filter((q: any) => q.applicability === 'country_specific')
        .map((q: any) => q.id) || [];

      // Fetch country-specific options
      let countryOptions: any[] = [];
      if (countrySpecificIds.length > 0) {
        const { data: optionsData, error: optionsError } = await supabase
          .from('country_question_options')
          .select('*')
          .in('question_id', countrySpecificIds)
          .eq('country_code', userCountry);
        
        if (optionsError) throw optionsError;
        countryOptions = optionsData || [];
      }

      // Create options map
      const optionsMap = new Map(
        countryOptions.map(opt => [opt.question_id, { options: opt.options, metadata: opt.metadata }])
      );

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
          .filter((q: any) => q.category_id === cat.id)
          .map((q: any) => {
            const userAnswer = answerMap.get(q.id);
            
            // Merge country-specific options if applicable
            const countryData = optionsMap.get(q.id);
            const finalOptions = q.applicability === 'country_specific' && countryData
              ? countryData.options
              : q.options;
            
            // Resolve decay config: question override → category default
            const decayConfig = q.question_decay_config || cat.default_decay_config;
            const intervalDays = decayConfig?.interval_days;
            
            // Calculate staleness using resolved decay config (not expiry date)
            let isStale = false;
            if (userAnswer && intervalDays && userAnswer.last_updated && !q.is_immutable) {
              const lastUpdated = new Date(userAnswer.last_updated);
              const daysSinceUpdate = Math.floor(
                (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
              );
              isStale = daysSinceUpdate > intervalDays;
            }

            return {
              ...q,
              options: finalOptions,
              question_type: q.question_type as ProfileQuestion['question_type'],
              decay_interval_days: intervalDays,
              decay_interval_type: decayConfig?.interval_type,
              user_answer: userAnswer ? {
                ...userAnswer,
                is_stale: isStale // Computed on-the-fly, not stored
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
