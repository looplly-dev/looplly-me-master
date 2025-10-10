import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface EarningActivity {
  id: string;
  activity_type: 'survey' | 'video' | 'task' | 'app_download' | 'game_play';
  title: string;
  description?: string;
  reward_amount: number;
  time_estimate?: number;
  status: 'available' | 'in_progress' | 'completed' | 'expired';
  external_id?: string;
  provider?: string;
  metadata: any;
  completed_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export const useEarningActivities = () => {
  const [activities, setActivities] = useState<EarningActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { authState } = useAuth();

  const fetchActivities = async () => {
    if (!authState.user?.id) {
      setActivities([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('earning_activities')
        .select('*')
        .eq('user_id', authState.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching activities:', error);
        setActivities([]);
      } else {
        // Map database fields to EarningActivity interface
        const mappedData = data?.map(activity => ({
          ...activity,
          updated_at: activity.created_at // Use created_at as fallback for updated_at
        })) || [];
        setActivities(mappedData as EarningActivity[]);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateActivityStatus = async (activityId: string, status: EarningActivity['status']) => {
    if (!authState.user?.id) return false;

    try {
      const updateData: any = { status };
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('earning_activities')
        .update(updateData)
        .eq('id', activityId)
        .eq('user_id', authState.user.id);

      if (error) {
        console.error('Error updating activity status:', error);
        return false;
      }

      // Refresh activities
      await fetchActivities();
      return true;
    } catch (error) {
      console.error('Error updating activity status:', error);
      return false;
    }
  };

  const addActivity = async (activity: Omit<EarningActivity, 'id' | 'created_at' | 'updated_at'>) => {
    if (!authState.user?.id) return false;

    try {
      const { error } = await supabase
        .from('earning_activities')
        .insert({
          user_id: authState.user.id,
          ...activity
        });

      if (error) {
        console.error('Error adding activity:', error);
        return false;
      }

      await fetchActivities();
      return true;
    } catch (error) {
      console.error('Error adding activity:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [authState.user?.id]);

  return {
    activities,
    isLoading,
    updateActivityStatus,
    addActivity,
    refetch: fetchActivities
  };
};