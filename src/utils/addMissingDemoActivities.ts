import { supabase } from '@/integrations/supabase/client';

export const addMissingDemoActivities = async (userId: string) => {
  // Check if any demo activities already exist for this user to avoid duplicates
  const { data: existingActivities } = await supabase
    .from('earning_activities')
    .select('title')
    .eq('user_id', userId);

  const existingTitles = existingActivities?.map(a => a.title) || [];

  // If the user already has demo activities, don't add more
  if (existingTitles.length > 0) {
    return true;
  }

  // Add only two demo activities: one Qual study and one other task
  const demoActivities = [
    {
      user_id: userId,
      activity_type: 'task' as const,
      title: 'Enroll in Qual Study',
      description: 'Join a focus group or research study in your area - higher rewards for in-person participation',
      reward_amount: 75.00,
      time_estimate: 90,
      status: 'available' as const,
      provider: 'Research Partners',
      metadata: { 
        platform: 'in-person', 
        category: 'research', 
        difficulty: 'easy', 
        rating: '4.8', 
        reviews: '127' 
      }
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
      metadata: { platform: 'mobile', rating: '4.2', reviews: '89' }
    }
  ];

  try {
    const { error } = await supabase
      .from('earning_activities')
      .insert(demoActivities);

    if (error) {
      console.error('Error adding demo activities:', error);
      return false;
    }

    console.log('Demo activities added successfully');
    return true;
  } catch (error) {
    console.error('Failed to add demo activities:', error);
    return false;
  }
};