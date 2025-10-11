import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Badge {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'elite';
  category: string | null;
  icon_url: string | null;
  metadata: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  rarity?: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  rep_points?: number;
  requirement?: string;
  shape?: 'circle' | 'hexagon' | 'star' | 'diamond';
  icon_name?: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  awarded_at: string;
  metadata: Record<string, any>;
  badge: Badge;
}

export interface GenerateBadgeParams {
  badgeName: string;
  tier: Badge['tier'];
  category?: string;
  iconTheme?: string;
  type?: 'badge' | 'tier-icon';
}

export function useBadgeService() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateBadge = async (params: GenerateBadgeParams) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: funcError } = await supabase.functions.invoke('generate-badge-image', {
        body: params,
      });

      if (funcError) throw funcError;
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to generate badge');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const listBadges = async (activeOnly = true) => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase.from('badge_catalog').select('*');
      
      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error: queryError } = await query.order('created_at', { ascending: false });

      if (queryError) throw queryError;
      return data as Badge[];
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to list badges');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const awardBadge = async (userId: string, badgeId: string, metadata: Record<string, any> = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: insertError } = await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          badge_id: badgeId,
          metadata,
        })
        .select()
        .single();

      if (insertError) {
        // Check if already awarded
        if (insertError.code === '23505') {
          throw new Error('Badge already awarded to this user');
        }
        throw insertError;
      }

      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to award badge');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserBadges = async (userId?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;

      if (!targetUserId) {
        throw new Error('No user ID provided');
      }

      const { data, error: queryError } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badge_catalog(*)
        `)
        .eq('user_id', targetUserId)
        .order('awarded_at', { ascending: false });

      if (queryError) throw queryError;
      return data as UserBadge[];
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get user badges');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBadge = async (badgeId: string, updates: Partial<Badge>) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from('badge_catalog')
        .update(updates)
        .eq('id', badgeId)
        .select()
        .single();

      if (updateError) throw updateError;
      return data as Badge;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update badge');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBadgeStatus = async (badgeId: string, currentStatus: boolean) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from('badge_catalog')
        .update({ is_active: !currentStatus })
        .eq('id', badgeId)
        .select()
        .single();

      if (updateError) throw updateError;
      return data as Badge;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to toggle badge status');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBadge = async (badgeId: string, iconUrl?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Delete from catalog
      const { error: deleteError } = await supabase
        .from('badge_catalog')
        .delete()
        .eq('id', badgeId);

      if (deleteError) throw deleteError;

      // Clean up storage file if exists
      if (iconUrl) {
        const filename = iconUrl.split('/').pop();
        if (filename) {
          await supabase.storage.from('badges').remove([filename]);
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete badge');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    generateBadge,
    listBadges,
    awardBadge,
    getUserBadges,
    updateBadge,
    toggleBadgeStatus,
    deleteBadge,
  };
}
