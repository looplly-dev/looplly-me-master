import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface KycVerification {
  id: string;
  user_id: string;
  verified: boolean;
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  provider: string | null;
  verification_date: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const useKycVerification = () => {
  const { authState } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: kycStatus, isLoading } = useQuery({
    queryKey: ['kyc-verification', authState.user?.id],
    queryFn: async () => {
      if (!authState.user?.id) return null;

      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('*')
        .eq('user_id', authState.user.id)
        .maybeSingle();

      if (error) throw error;

      // If no KYC record exists, create one
      if (!data) {
        const { data: newKyc, error: insertError } = await supabase
          .from('kyc_verifications')
          .insert({
            user_id: authState.user.id,
            verified: false,
            status: 'pending',
            metadata: {}
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newKyc as KycVerification;
      }

      return data as KycVerification;
    },
    enabled: !!authState.user?.id,
  });

  const submitKyc = useMutation({
    mutationFn: async (provider: string) => {
      if (!authState.user?.id) return;

      const { error } = await supabase
        .from('kyc_verifications')
        .update({
          status: 'pending',
          provider,
          metadata: { submittedAt: new Date().toISOString() }
        })
        .eq('user_id', authState.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-verification', authState.user?.id] });
      toast({
        title: 'KYC Submitted',
        description: 'Your verification request has been submitted.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateKycStatus = useMutation({
    mutationFn: async ({ status, verified }: { status: KycVerification['status']; verified: boolean }) => {
      if (!authState.user?.id) return;

      const { error } = await supabase
        .from('kyc_verifications')
        .update({
          status,
          verified,
          verification_date: verified ? new Date().toISOString() : null
        })
        .eq('user_id', authState.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-verification', authState.user?.id] });
    },
  });

  return {
    kycStatus,
    isLoading,
    submitKyc: submitKyc.mutate,
    updateKycStatus: updateKycStatus.mutate,
  };
};
