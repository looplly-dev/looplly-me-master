import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfileQuestionInsert {
  id?: string;
  question_key: string;
  question_text: string;
  question_type: string;
  level: number;
  category_id: string;
  options?: any;
  is_required?: boolean;
  help_text?: string;
  placeholder?: string;
  validation_rules?: any;
  decay_config_key?: string;
  country_codes?: string[];
  display_order?: number;
  is_draft?: boolean;
  is_immutable?: boolean;
}

export function useSurveyJsSync() {
  const queryClient = useQueryClient();
  
  const saveMutation = useMutation({
    mutationFn: async (questions: ProfileQuestionInsert[]) => {
      // Batch upsert to profile_questions
      const { data, error } = await supabase
        .from('profile_questions')
        .upsert(questions, { 
          onConflict: 'question_key',
          ignoreDuplicates: false 
        })
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`${data?.length || 0} question(s) saved successfully`);
      queryClient.invalidateQueries({ queryKey: ['admin-questions-unified'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to save: ${error.message}`);
      console.error('Save error:', error);
    }
  });
  
  return { 
    save: saveMutation.mutate, 
    isSaving: saveMutation.isPending 
  };
}
