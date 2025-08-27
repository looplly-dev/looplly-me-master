import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useTransactions } from './useTransactions';
import { useToast } from '@/hooks/use-toast';

export interface Referral {
  id: string;
  referrer_id: string;
  referee_id: string;
  referral_code: string;
  status: 'pending' | 'qualified' | 'paid' | 'disqualified';
  referee_earnings: number;
  referrer_payout: number;
  qualification_met: boolean;
  min_rep_points: number;
  accountant_status: 'awaiting_referee_earnings' | 'verifying_funds' | 'funds_verified' | 'payout_approved' | 'payout_completed';
  funds_verified: boolean;
  payout_completed: boolean;
  created_at: string;
  updated_at: string;
  qualified_at?: string;
  paid_at?: string;
}

export interface ReferralStats {
  total_invited: number;
  total_joined: number;
  total_qualified: number;
  total_earnings: number;
  pending_payouts: number;
  success_rate: number;
}

export const useReferrals = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { authState } = useAuth();
  const { addTransaction } = useTransactions();
  const { toast } = useToast();

  const fetchReferrals = async () => {
    if (!authState.user?.id) {
      setReferrals([]);
      setStats(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('referrals' as any)
        .select('*')
        .eq('referrer_id', authState.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching referrals:', error);
        setReferrals([]);
      } else {
        const referralData = (data as any[] || []) as Referral[];
        setReferrals(referralData);
        
        // Calculate stats
        const qualified = referralData.filter(r => r.qualification_met);
        const stats: ReferralStats = {
          total_invited: referralData.length,
          total_joined: referralData.filter(r => r.status !== 'pending').length,
          total_qualified: qualified.length,
          total_earnings: qualified.reduce((sum, r) => sum + (r.payout_completed ? r.referrer_payout : 0), 0),
          pending_payouts: qualified.filter(r => !r.payout_completed).length,
          success_rate: referralData.length > 0 ? (qualified.length / referralData.length) * 100 : 0
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching referrals:', error);
      setReferrals([]);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  const createReferral = async (referralCode: string, refereeId: string) => {
    if (!authState.user?.id) return false;

    try {
      const { error } = await supabase
        .from('referrals' as any)
        .insert({
          referrer_id: authState.user.id,
          referee_id: refereeId,
          referral_code: referralCode,
          status: 'pending',
          referee_earnings: 0,
          referrer_payout: 0.35,
          min_rep_points: 100,
          accountant_status: 'awaiting_referee_earnings'
        } as any);

      if (error) {
        console.error('Error creating referral:', error);
        return false;
      }

      await fetchReferrals();
      return true;
    } catch (error) {
      console.error('Error creating referral:', error);
      return false;
    }
  };

  const updateRefereeEarnings = async (referralId: string, newEarnings: number) => {
    try {
      // Check if referee has met minimum earnings for qualification ($0.35)
      const qualification_met = newEarnings >= 0.35;
      let updates: any = {
        referee_earnings: newEarnings,
        qualification_met
      };

      // Update accountant status based on earnings
      if (qualification_met) {
        updates.status = 'qualified';
        updates.accountant_status = 'verifying_funds';
        updates.qualified_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('referrals' as any)
        .update(updates as any)
        .eq('id', referralId);

      if (error) {
        console.error('Error updating referee earnings:', error);
        return false;
      }

      // If qualified, start AI accountant verification process
      if (qualification_met) {
        await simulateAIAccountantVerification(referralId);
      }

      await fetchReferrals();
      return true;
    } catch (error) {
      console.error('Error updating referee earnings:', error);
      return false;
    }
  };

  // Simulate AI accountant verification process
  const simulateAIAccountantVerification = async (referralId: string) => {
    try {
      // Step 1: Verifying funds (simulate 2-5 seconds)
      setTimeout(async () => {
        await supabase
          .from('referrals' as any)
          .update({ 
            accountant_status: 'funds_verified',
            funds_verified: true 
          } as any)
          .eq('id', referralId);

        // Step 2: Approve payout (simulate additional 1-2 seconds)
        setTimeout(async () => {
          await supabase
            .from('referrals' as any)
            .update({ accountant_status: 'payout_approved' } as any)
            .eq('id', referralId);

          // Step 3: Process payout
          await processReferralPayout(referralId);
        }, Math.random() * 2000 + 1000);

      }, Math.random() * 3000 + 2000);

    } catch (error) {
      console.error('Error in AI accountant verification:', error);
    }
  };

  const processReferralPayout = async (referralId: string) => {
    try {
      const { data: referral, error: fetchError } = await supabase
        .from('referrals' as any)
        .select('*')
        .eq('id', referralId)
        .single();

      if (fetchError || !referral) {
        console.error('Error fetching referral for payout:', fetchError);
        return;
      }

      const referralData = referral as any as Referral;

      // Create transaction for referral payout
      const success = await addTransaction({
        user_id: referralData.referrer_id,
        type: 'referral',
        amount: referralData.referrer_payout,
        currency: 'USD',
        source: 'referral_system',
        status: 'completed',
        metadata: { referral_id: referralId }
      });

      if (success) {
        // Mark referral as paid
        await supabase
          .from('referrals' as any)
          .update({
            status: 'paid',
            accountant_status: 'payout_completed',
            payout_completed: true,
            paid_at: new Date().toISOString()
          } as any)
          .eq('id', referralId);

        // Show success notification
        toast({
          title: "Referral Payout Completed! 🎉",
          description: `$${referralData.referrer_payout} has been added to your balance.`,
        });

        await fetchReferrals();
      }
    } catch (error) {
      console.error('Error processing referral payout:', error);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, [authState.user?.id]);

  // Set up realtime subscription for referral updates
  useEffect(() => {
    if (!authState.user?.id) return;

    const channel = supabase
      .channel('referral-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'referrals',
          filter: `referrer_id=eq.${authState.user.id}`
        },
        (payload) => {
          console.log('Referral updated:', payload);
          setReferrals(prev => prev.map(r => 
            r.id === payload.new.id ? payload.new as Referral : r
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authState.user?.id]);

  return {
    referrals,
    stats,
    isLoading,
    createReferral,
    updateRefereeEarnings,
    refetch: fetchReferrals
  };
};