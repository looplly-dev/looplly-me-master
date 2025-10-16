import { supabase } from '@/integrations/supabase/client';
import { demoActivities as demoActivitiesTemplate } from '@/mock_data';

export const createDemoEarningActivities = async (userId: string) => {
  const demoActivities = demoActivitiesTemplate.map(activity => ({
    ...activity,
    user_id: userId
  }));

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