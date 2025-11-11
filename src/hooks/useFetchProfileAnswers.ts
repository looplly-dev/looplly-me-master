import { useQuery } from '@tanstack/react-query';
import { getSupabaseClient } from '@/integrations/supabase/activeClient';
import { useAuth } from '@/hooks/useAuth';

export interface ProfileAnswer {
  question_id: string;
  question_key: string;
  answer_value: string | null;
  answer_json: any | null;
  answer_normalized: string | null;
  selected_option_short_id: string | null;
}

export const useFetchProfileAnswers = () => {
  const { authState } = useAuth();
  const userId = authState.user?.id;

  return useQuery({
    queryKey: ['profile-answers', userId],
    queryFn: async () => {
      if (!userId) return {};

      const supabase = getSupabaseClient();
      
      // Fetch all profile answers with question keys
      const { data, error } = await supabase
        .from('profile_answers')
        .select(`
          question_id,
          answer_value,
          answer_json,
          answer_normalized,
          selected_option_short_id,
          profile_questions!inner(
            question_key
          )
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching profile answers:', error);
        throw error;
      }

      // Transform into a key-value map for easy lookup
      const answersMap: Record<string, ProfileAnswer> = {};
      
      data?.forEach((item: any) => {
        const questionKey = item.profile_questions?.question_key;
        if (questionKey) {
          answersMap[questionKey] = {
            question_id: item.question_id,
            question_key: questionKey,
            answer_value: item.answer_value,
            answer_json: item.answer_json,
            answer_normalized: item.answer_normalized,
            selected_option_short_id: item.selected_option_short_id
          };
        }
      });

      return answersMap;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
