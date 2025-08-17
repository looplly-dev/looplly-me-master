import { supabase } from '@/integrations/supabase/client';

export const createDemoEarningActivities = async (userId: string) => {
  const demoActivities = [
    {
      user_id: userId,
      activity_type: 'survey' as const,
      title: 'Consumer Preferences Survey',
      description: 'Share your shopping preferences to help brands improve their products',
      reward_amount: 2.50,
      time_estimate: 8,
      status: 'available' as const,
      provider: 'Pollfish',
      metadata: { difficulty: 'easy', category: 'shopping' }
    },
    {
      user_id: userId,
      activity_type: 'video' as const,
      title: 'Tech Product Demo',
      description: 'Watch a 3-minute product demonstration video',
      reward_amount: 0.75,
      time_estimate: 3,
      status: 'available' as const,
      provider: 'AdColony',
      metadata: { category: 'technology' }
    },
    {
      user_id: userId,
      activity_type: 'task' as const,
      title: 'App Store Review',
      description: 'Download and write a review for a mobile app',
      reward_amount: 1.25,
      time_estimate: 5,
      status: 'available' as const,
      provider: 'AppLovin',
      metadata: { platform: 'mobile' }
    },
    {
      user_id: userId,
      activity_type: 'task' as const,
      title: 'Enroll in Qual Study',
      description: 'Join a focus group or research study in your area - higher rewards for in-person participation',
      reward_amount: 75.00,
      time_estimate: 90,
      status: 'available' as const,
      provider: 'Research Partners',
      metadata: { platform: 'in-person', category: 'research', difficulty: 'easy', rating: '4.8', reviews: '127' }
    },
    {
      user_id: userId,
      activity_type: 'survey' as const,
      title: 'Food & Dining Habits',
      description: 'Tell us about your eating habits and restaurant preferences',
      reward_amount: 3.00,
      time_estimate: 12,
      status: 'available' as const,
      provider: 'SurveyMonkey',
      metadata: { difficulty: 'medium', category: 'lifestyle' }
    }
  ];

  try {
    const { error } = await supabase
      .from('earning_activities')
      .insert(demoActivities);

    if (error) {
      console.error('Error creating demo activities:', error);
      return false;
    }

    console.log('Demo earning activities created successfully');
    return true;
  } catch (error) {
    console.error('Failed to create demo activities:', error);
    return false;
  }
};