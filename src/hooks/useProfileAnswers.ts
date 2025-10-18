import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

      const { error } = await supabase
        .from('profile_answers')
        .upsert([
          {
            user_id: userId,
            question_id: questionId,
            answer_value: typeof value === 'string' ? value : null,
            answer_json: typeof value === 'object' ? value : null,
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
