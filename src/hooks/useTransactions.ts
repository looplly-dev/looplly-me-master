import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Transaction {
  id: string;
  user_id?: string;
  type: 'earning' | 'withdrawal' | 'bonus' | 'referral';
  amount: number;
  currency: string;
  description?: string;
  source: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  metadata: any;
  created_at: string;
  updated_at: string;
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { authState } = useAuth();

  const fetchTransactions = async () => {
    if (!authState.user?.id) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', authState.user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching transactions:', error);
        setTransactions([]);
      } else {
        setTransactions((data as Transaction[]) || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
    if (!authState.user?.id) return false;

    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: authState.user.id,
          ...transaction
        });

      if (error) {
        console.error('Error adding transaction:', error);
        return false;
      }

      // Refresh transactions
      await fetchTransactions();
      return true;
    } catch (error) {
      console.error('Error adding transaction:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [authState.user?.id]);

  // Set up realtime subscription for new transactions
  useEffect(() => {
    if (!authState.user?.id) return;

    const channel = supabase
      .channel('transaction-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${authState.user.id}`
        },
        (payload) => {
          console.log('New transaction:', payload);
          setTransactions(prev => [payload.new as Transaction, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authState.user?.id]);

  return {
    transactions,
    isLoading,
    addTransaction,
    refetch: fetchTransactions
  };
};