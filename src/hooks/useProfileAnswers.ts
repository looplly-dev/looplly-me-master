import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '@/integrations/supabase/activeClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { AddressComponents } from '@/services/googlePlacesService';

export const useProfileAnswers = () => {
  const { authState } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const userId = authState.user?.id;
  const [errors, setErrors] = useState<Record<string, string>>({});

  const saveAnswerMutation = useMutation({
    mutationFn: async ({ 
      questionId, 
      value 
    }: { 
      questionId: string; 
      value: any;
    }) => {
      if (!userId) throw new Error('User not authenticated');

      const supabase = getSupabaseClient();
      
      // Normalize value for targeting
      const normalizedValue = typeof value === 'string' 
        ? value 
        : (value?.value || JSON.stringify(value));

      // Extract selected_option_short_id if value is an object with short_id
      let selectedOptionShortId: string | null = null;
      if (typeof value === 'object' && value?.short_id) {
        selectedOptionShortId = value.short_id;
      } else if (typeof value === 'string') {
        // Try to find the option short_id by matching the value
        const { data: matchedOption } = await supabase
          .from('question_answer_options')
          .select('short_id')
          .eq('question_id', questionId)
          .eq('value', value)
          .single();
        
        if (matchedOption) {
          selectedOptionShortId = matchedOption.short_id;
        }
      }

      const { error } = await supabase
        .from('profile_answers')
        .upsert([
          {
            user_id: userId,
            question_id: questionId,
            answer_value: typeof value === 'string' ? value : null,
            answer_json: typeof value === 'object' ? value : null,
            answer_normalized: normalizedValue,
            selected_option_short_id: selectedOptionShortId,
            last_updated: new Date().toISOString(),
            is_stale: false
          }
        ], {
          onConflict: 'user_id,question_id'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-questions'] });
      toast({
        title: 'Saved',
        description: 'Your answer has been saved',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save answer',
        variant: 'destructive',
      });
    }
  });

  const saveAddressMutation = useMutation({
    mutationFn: async (addressData: AddressComponents) => {
      if (!userId) throw new Error('User not authenticated');

      const supabase = getSupabaseClient();
      
      // Save to address_components table
      const { error: addressError } = await supabase
        .from('address_components')
        .upsert({
          user_id: userId,
          place_id: addressData.place_id,
          formatted_address: addressData.formatted_address,
          street_number: addressData.street_number,
          route: addressData.route,
          locality: addressData.locality,
          administrative_area_level_1: addressData.administrative_area_level_1,
          administrative_area_level_2: addressData.administrative_area_level_2,
          country: addressData.country,
          postal_code: addressData.postal_code,
          latitude: addressData.latitude,
          longitude: addressData.longitude,
          is_primary: true
        }, {
          onConflict: 'user_id,place_id'
        });

      if (addressError) throw addressError;

      // Also save formatted address to profile_answers for the address question
      const { data: addressQuestion } = await supabase
        .from('profile_questions')
        .select('id')
        .eq('question_key', 'address')
        .single();

      if (addressQuestion) {
        const { error: answerError } = await supabase
          .from('profile_answers')
          .upsert([
            {
              user_id: userId,
              question_id: addressQuestion.id,
              answer_value: addressData.formatted_address,
              answer_json: addressData as any,
              answer_normalized: addressData.formatted_address, // For targeting
              last_updated: new Date().toISOString(),
              is_stale: false
            }
          ], {
            onConflict: 'user_id,question_id'
          });

        if (answerError) throw answerError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-questions'] });
      toast({
        title: 'Address Saved',
        description: 'Your address has been saved successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save address',
        variant: 'destructive',
      });
    }
  });

  const saveAnswer = async (questionId: string, value: any) => {
    setErrors(prev => ({ ...prev, [questionId]: '' }));
    await saveAnswerMutation.mutateAsync({ questionId, value });
  };

  const saveAddress = async (addressData: AddressComponents) => {
    await saveAddressMutation.mutateAsync(addressData);
  };

  return {
    saveAnswer,
    saveAddress,
    isSaving: saveAnswerMutation.isPending || saveAddressMutation.isPending,
    errors
  };
};
