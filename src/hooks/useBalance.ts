import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/integrations/supabase/activeClient';
import { useAuth } from './useAuth';

export interface UserBalance {
  total_earned: number;
  available_balance: number;
  pending_balance: number;
  lifetime_withdrawn: number;
}

export const useBalance = () => {
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { authState } = useAuth();

  const fetchBalance = async () => {
    if (!authState.user?.id) {
      setBalance(null);
      setIsLoading(false);
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('user_balances')
        .select('*')
        .eq('user_id', authState.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching balance:', error);
        setBalance(null);
      } else if (data) {
        // Map database fields to UserBalance interface
        setBalance({
          total_earned: data.lifetime_earnings || 0,
          available_balance: data.balance || 0,
          pending_balance: data.pending_balance || 0,
          lifetime_withdrawn: 0 // Not in database yet, default to 0
        });
      } else {
        // Fallback mock data
        setBalance({
          total_earned: 12.50,
          available_balance: 4.00,
          pending_balance: 2.50,
          lifetime_withdrawn: 6.00
        });
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [authState.user?.id]);

  // Set up realtime subscription for balance changes
  useEffect(() => {
    if (!authState.user?.id) return;

    const supabase = getSupabaseClient();
    const channel = supabase
      .channel('balance-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_balances',
          filter: `user_id=eq.${authState.user.id}`
        },
        (payload) => {
          console.log('Balance updated:', payload);
          const newData = payload.new as any;
          setBalance({
            total_earned: newData.lifetime_earnings || 0,
            available_balance: newData.balance || 0,
            pending_balance: newData.pending_balance || 0,
            lifetime_withdrawn: 0
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authState.user?.id]);

  return {
    balance,
    isLoading,
    refetch: fetchBalance
  };
};