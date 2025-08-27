import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  uses_count: number;
  max_uses: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useReferralCodes = () => {
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [primaryCode, setPrimaryCode] = useState<ReferralCode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { authState } = useAuth();

  const fetchReferralCodes = async () => {
    if (!authState.user?.id) {
      setCodes([]);
      setPrimaryCode(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('referral_codes' as any)
        .select('*')
        .eq('user_id', authState.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching referral codes:', error);
        setCodes([]);
        setPrimaryCode(null);
      } else {
        const codesData = (data as any[] || []) as ReferralCode[];
        setCodes(codesData);
        
        // Set the most recent active code as primary
        const activeCode = codesData.find(c => c.is_active) || codesData[0];
        setPrimaryCode(activeCode || null);

        // If no codes exist, create one
        if (codesData.length === 0) {
          await generateReferralCode();
        }
      }
    } catch (error) {
      console.error('Error fetching referral codes:', error);
      setCodes([]);
      setPrimaryCode(null);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReferralCode = async (): Promise<ReferralCode | null> => {
    if (!authState.user?.id) return null;

    try {
      // Generate a unique code based on user ID and timestamp
      const timestamp = Date.now().toString(36);
      const userId = authState.user.id.slice(-6).toUpperCase();
      const code = `REF${userId}${timestamp}`.slice(0, 12);

      const { data, error } = await supabase
        .from('referral_codes' as any)
        .insert({
          user_id: authState.user.id,
          code,
          uses_count: 0,
          max_uses: 100,
          is_active: true
        } as any)
        .select()
        .single();

      if (error) {
        console.error('Error generating referral code:', error);
        return null;
      }

      const newCode = data as any as ReferralCode;
      setCodes(prev => [newCode, ...prev]);
      setPrimaryCode(newCode);
      
      return newCode;
    } catch (error) {
      console.error('Error generating referral code:', error);
      return null;
    }
  };

  const deactivateCode = async (codeId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('referral_codes' as any)
        .update({ is_active: false } as any)
        .eq('id', codeId)
        .eq('user_id', authState.user?.id);

      if (error) {
        console.error('Error deactivating referral code:', error);
        return false;
      }

      await fetchReferralCodes();
      return true;
    } catch (error) {
      console.error('Error deactivating referral code:', error);
      return false;
    }
  };

  const incrementCodeUsage = async (code: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('referral_codes' as any)
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.error('Invalid or inactive referral code:', code);
        return false;
      }

      const referralCode = data as any as ReferralCode;

      // Check if code has reached max uses
      if (referralCode.uses_count >= referralCode.max_uses) {
        console.error('Referral code has reached maximum uses');
        return false;
      }

      // Increment usage count
      const { error: updateError } = await supabase
        .from('referral_codes' as any)
        .update({ uses_count: referralCode.uses_count + 1 } as any)
        .eq('id', referralCode.id);

      if (updateError) {
        console.error('Error incrementing code usage:', updateError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error incrementing code usage:', error);
      return false;
    }
  };

  const getReferralLink = (code?: string): string => {
    const baseUrl = window.location.origin;
    const referralCode = code || primaryCode?.code || 'INVALID';
    return `${baseUrl}/ref/${referralCode}`;
  };

  useEffect(() => {
    fetchReferralCodes();
  }, [authState.user?.id]);

  return {
    codes,
    primaryCode,
    isLoading,
    generateReferralCode,
    deactivateCode,
    incrementCodeUsage,
    getReferralLink,
    refetch: fetchReferralCodes
  };
};