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

    // Check if we're in mock mode
    const isMockMode = authState.user.id === 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    
    if (isMockMode) {
      // Return mock activities for demo
      const mockActivities: EarningActivity[] = [
        {
          id: 'mock-1',
          activity_type: 'survey',
          title: 'Market Research Survey',
          description: 'Share your opinion on new consumer products - takes about 15 minutes',
          reward_amount: 2.50,
          time_estimate: 15,
          status: 'available',
          external_id: 'survey-123',
          provider: 'SurveyMonkey',
          metadata: { category: 'consumer goods', difficulty: 'easy', rating: '4.7', reviews: '234' },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'mock-2',
          activity_type: 'task',
          title: 'Enroll in Qual Study',
          description: 'Join a focus group or research study in your area - higher rewards for in-person participation',
          reward_amount: 75.00,
          time_estimate: 90,
          status: 'available',
          provider: 'Research Partners',
          metadata: { platform: 'in-person', category: 'research', difficulty: 'easy', rating: '4.8', reviews: '127' },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'mock-3',
          activity_type: 'video',
          title: 'Watch Product Demo',
          description: 'Watch a 5-minute product demonstration video and answer questions',
          reward_amount: 1.75,
          time_estimate: 8,
          status: 'available',
          provider: 'AdNetwork',
          metadata: { category: 'technology', difficulty: 'easy', rating: '4.3', reviews: '156' },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'mock-4',
          activity_type: 'app_download',
          title: 'Install & Try New App',
          description: 'Download a productivity app, use it for 10 minutes, and share feedback',
          reward_amount: 3.25,
          time_estimate: 12,
          status: 'available',
          provider: 'AppLovin',
          metadata: { platform: 'mobile', category: 'productivity', difficulty: 'easy', rating: '4.5', reviews: '89' },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'mock-5',
          activity_type: 'game_play',
          title: 'Play Mobile Game',
          description: 'Download and play a new mobile game for 20 minutes to unlock rewards',
          reward_amount: 4.00,
          time_estimate: 25,
          status: 'available',
          provider: 'GameStudio',
          metadata: { platform: 'mobile', category: 'entertainment', difficulty: 'medium', rating: '4.6', reviews: '312' },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'mock-6',
          activity_type: 'task',
          title: 'Product Testing',
          description: 'Test a new website interface and provide detailed feedback on user experience',
          reward_amount: 8.50,
          time_estimate: 30,
          status: 'available',
          provider: 'UXResearch',
          metadata: { platform: 'web', category: 'ux_testing', difficulty: 'medium', rating: '4.9', reviews: '67' },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      setActivities(mockActivities);
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
        setActivities((data as EarningActivity[]) || []);
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

    // Check if we're in mock mode
    const isMockMode = authState.user.id === 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    
    if (isMockMode) {
      // Update mock activities locally
      setActivities(prev => prev.map(activity => 
        activity.id === activityId 
          ? { 
              ...activity, 
              status, 
              completed_at: status === 'completed' ? new Date().toISOString() : activity.completed_at,
              updated_at: new Date().toISOString()
            }
          : activity
      ));
      return true;
    }

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

    // Check if we're in mock mode
    const isMockMode = authState.user.id === 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    
    if (isMockMode) {
      // Add to mock activities locally
      const newActivity: EarningActivity = {
        ...activity,
        id: `mock-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setActivities(prev => [newActivity, ...prev]);
      return true;
    }

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