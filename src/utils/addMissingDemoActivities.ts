import { supabase } from '@/integrations/supabase/client';
import { minimalDemoActivities as minimalDemoActivitiesTemplate } from '@/mock_data';

export const addMissingDemoActivities = async (userId: string) => {
  // Check if any demo activities already exist for this user to prevent duplicates
  const { data: existingActivities, error } = await supabase
    .from('earning_activities')
    .select('id')
    .eq('user_id', userId)
    .limit(1);

  if (error) {
    console.error('Error checking existing activities:', error);
    return false;
  }

  // If the user already has any activities, don't add more
  if (existingActivities && existingActivities.length > 0) {
    return true;
  }

  // Add only two demo activities from centralized mock data
  const demoActivities = minimalDemoActivitiesTemplate.map(activity => ({
    ...activity,
    user_id: userId
  }));

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