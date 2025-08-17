import { supabase } from '@/integrations/supabase/client';

export const addMissingDemoActivities = async (userId: string) => {
  // Check if the "Enroll in Qual Study" task already exists for this user
  const { data: existingActivity } = await supabase
    .from('earning_activities')
    .select('id')
    .eq('user_id', userId)
    .eq('title', 'Enroll in Qual Study')
    .single();

  // If it already exists, don't add it again
  if (existingActivity) {
    return true;
  }

  // Add the missing "Enroll in Qual Study" activity
  const newActivity = {
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
  };

  try {
    const { error } = await supabase
      .from('earning_activities')
      .insert(newActivity);

    if (error) {
      console.error('Error adding missing demo activity:', error);
      return false;
    }

    console.log('Missing demo activity added successfully');
    return true;
  } catch (error) {
    console.error('Failed to add missing demo activity:', error);
    return false;
  }
};