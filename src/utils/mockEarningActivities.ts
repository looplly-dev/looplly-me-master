import { supabase } from '@/integrations/supabase/client';

export const addMockEarningActivities = async (userId: string) => {
  // Check if mock activities already exist
  const { data: existingActivities, error } = await supabase
    .from('earning_activities')
    .select('id')
    .eq('user_id', userId)
    .gt('reward_amount', 50); // Check for high-value activities that indicate mocks

  if (error) {
    console.error('Error checking existing activities:', error);
    return false;
  }

  // If mock activities already exist, don't add more
  if (existingActivities && existingActivities.length > 0) {
    return true;
  }

  const mockActivities = [
    // Surveys
    {
      user_id: userId,
      activity_type: 'survey' as const,
      title: 'Shopping Preferences Survey',
      description: 'Share your online shopping habits and preferences',
      reward_amount: 2.50,
      time_estimate: 8,
      status: 'available' as const,
      provider: 'Research Co.',
      metadata: { platform: 'web', rating: '4.6', reviews: '234' }
    },
    {
      user_id: userId,
      activity_type: 'survey' as const,
      title: 'Food & Dining Survey',
      description: 'Tell us about your dining preferences and habits',
      reward_amount: 1.75,
      time_estimate: 5,
      status: 'available' as const,
      provider: 'Market Insights',
      metadata: { platform: 'mobile', rating: '4.4', reviews: '89' }
    },
    {
      user_id: userId,
      activity_type: 'survey' as const,
      title: 'Technology Usage Study',
      description: 'Help improve tech products by sharing your device usage',
      reward_amount: 3.25,
      time_estimate: 12,
      status: 'available' as const,
      provider: 'Tech Research Lab',
      metadata: { platform: 'web', rating: '4.8', reviews: '156' }
    },

    // Videos
    {
      user_id: userId,
      activity_type: 'video' as const,
      title: 'Product Demo: Smart Home',
      description: 'Watch a 3-minute demo of the latest smart home technology',
      reward_amount: 0.85,
      time_estimate: 3,
      status: 'available' as const,
      provider: 'AdNetwork Pro',
      metadata: { platform: 'mobile', rating: '4.2', reviews: '67' }
    },
    {
      user_id: userId,
      activity_type: 'video' as const,
      title: 'New Car Features Video',
      description: 'Learn about innovative features in electric vehicles',
      reward_amount: 1.20,
      time_estimate: 4,
      status: 'available' as const,
      provider: 'Auto Marketing',
      metadata: { platform: 'web', rating: '4.5', reviews: '93' }
    },
    {
      user_id: userId,
      activity_type: 'video' as const,
      title: 'Fashion Trends 2024',
      description: 'Discover the hottest fashion trends for this season',
      reward_amount: 0.95,
      time_estimate: 5,
      status: 'available' as const,
      provider: 'Style Network',
      metadata: { platform: 'mobile', rating: '4.3', reviews: '78' }
    },

    // Tasks
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
    },
    {
      user_id: userId,
      activity_type: 'task' as const,
      title: 'Website Testing',
      description: 'Test a new e-commerce website and provide feedback',
      reward_amount: 4.50,
      time_estimate: 15,
      status: 'available' as const,
      provider: 'UX Testing Co.',
      metadata: { platform: 'web', rating: '4.7', reviews: '145' }
    },
    {
      user_id: userId,
      activity_type: 'task' as const,
      title: 'Social Media Engagement',
      description: 'Follow and engage with brand social media accounts',
      reward_amount: 0.75,
      time_estimate: 3,
      status: 'available' as const,
      provider: 'Social Boost',
      metadata: { platform: 'mobile', rating: '4.1', reviews: '56' }
    },
    {
      user_id: userId,
      activity_type: 'task' as const,
      title: 'Product Photography',
      description: 'Take photos of products in your home for market research',
      reward_amount: 6.25,
      time_estimate: 20,
      status: 'available' as const,
      provider: 'Market Photo',
      metadata: { platform: 'mobile', rating: '4.6', reviews: '112' }
    }
  ];

  try {
    const { error } = await supabase
      .from('earning_activities')
      .insert(mockActivities);

    if (error) {
      console.error('Error adding mock activities:', error);
      return false;
    }

    console.log('Mock earning activities added successfully');
    return true;
  } catch (error) {
    console.error('Failed to add mock activities:', error);
    return false;
  }
};