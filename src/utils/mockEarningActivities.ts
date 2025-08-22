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
    // Surveys (20 items)
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
    {
      user_id: userId,
      activity_type: 'survey' as const,
      title: 'Travel Behavior Survey',
      description: 'Share insights about your travel and vacation planning',
      reward_amount: 2.00,
      time_estimate: 7,
      status: 'available' as const,
      provider: 'Travel Insights',
      metadata: { platform: 'web', rating: '4.5', reviews: '178' }
    },
    {
      user_id: userId,
      activity_type: 'survey' as const,
      title: 'Health & Wellness Study',
      description: 'Participate in research about fitness and wellness habits',
      reward_amount: 3.75,
      time_estimate: 15,
      status: 'available' as const,
      provider: 'Wellness Research',
      metadata: { platform: 'mobile', rating: '4.7', reviews: '245' }
    },
    {
      user_id: userId,
      activity_type: 'survey' as const,
      title: 'Entertainment Preferences',
      description: 'Tell us about your streaming and entertainment choices',
      reward_amount: 1.50,
      time_estimate: 6,
      status: 'completed' as const,
      provider: 'Media Research',
      metadata: { platform: 'web', rating: '4.3', reviews: '134' }
    },
    {
      user_id: userId,
      activity_type: 'survey' as const,
      title: 'Financial Services Survey',
      description: 'Share your banking and financial service preferences',
      reward_amount: 4.25,
      time_estimate: 18,
      status: 'available' as const,
      provider: 'FinTech Research',
      metadata: { platform: 'web', rating: '4.6', reviews: '198' }
    },
    {
      user_id: userId,
      activity_type: 'survey' as const,
      title: 'Gaming Habits Study',
      description: 'Participate in research about gaming preferences and habits',
      reward_amount: 2.25,
      time_estimate: 9,
      status: 'available' as const,
      provider: 'Gaming Analytics',
      metadata: { platform: 'mobile', rating: '4.4', reviews: '167' }
    },
    {
      user_id: userId,
      activity_type: 'survey' as const,
      title: 'Work From Home Survey',
      description: 'Share your remote work experiences and preferences',
      reward_amount: 3.00,
      time_estimate: 12,
      status: 'available' as const,
      provider: 'Workplace Research',
      metadata: { platform: 'web', rating: '4.5', reviews: '203' }
    },
    {
      user_id: userId,
      activity_type: 'survey' as const,
      title: 'Environmental Awareness Study',
      description: 'Help research sustainable living and environmental concerns',
      reward_amount: 2.75,
      time_estimate: 10,
      status: 'available' as const,
      provider: 'Green Research Co.',
      metadata: { platform: 'web', rating: '4.8', reviews: '289' }
    },
    {
      user_id: userId,
      activity_type: 'survey' as const,
      title: 'Pet Ownership Survey',
      description: 'Share insights about pet care and animal welfare',
      reward_amount: 1.25,
      time_estimate: 5,
      status: 'available' as const,
      provider: 'Pet Research Lab',
      metadata: { platform: 'mobile', rating: '4.2', reviews: '76' }
    },
    {
      user_id: userId,
      activity_type: 'survey' as const,
      title: 'Social Media Usage Study',
      description: 'Participate in research about social media habits',
      reward_amount: 2.50,
      time_estimate: 8,
      status: 'completed' as const,
      provider: 'Digital Behavior Lab',
      metadata: { platform: 'web', rating: '4.4', reviews: '156' }
    },
    {
      user_id: userId,
      activity_type: 'survey' as const,
      title: 'Fashion & Style Survey',
      description: 'Share your fashion preferences and shopping behavior',
      reward_amount: 1.75,
      time_estimate: 6,
      status: 'available' as const,
      provider: 'Fashion Insights',
      metadata: { platform: 'mobile', rating: '4.3', reviews: '123' }
    },
    {
      user_id: userId,
      activity_type: 'survey' as const,
      title: 'Home Improvement Study',
      description: 'Tell us about your home renovation and improvement plans',
      reward_amount: 3.50,
      time_estimate: 14,
      status: 'available' as const,
      provider: 'Home Research Co.',
      metadata: { platform: 'web', rating: '4.6', reviews: '187' }
    },
    {
      user_id: userId,
      activity_type: 'survey' as const,
      title: 'Education & Learning Survey',
      description: 'Share your thoughts on online learning and education',
      reward_amount: 2.25,
      time_estimate: 9,
      status: 'available' as const,
      provider: 'EdTech Research',
      metadata: { platform: 'web', rating: '4.5', reviews: '234' }
    },
    {
      user_id: userId,
      activity_type: 'survey' as const,
      title: 'Automotive Preferences',
      description: 'Tell us about your car buying and maintenance habits',
      reward_amount: 4.00,
      time_estimate: 16,
      status: 'available' as const,
      provider: 'Auto Research Lab',
      metadata: { platform: 'web', rating: '4.7', reviews: '298' }
    },
    {
      user_id: userId,
      activity_type: 'survey' as const,
      title: 'Parenting & Family Study',
      description: 'Share insights about parenting and family life',
      reward_amount: 2.75,
      time_estimate: 11,
      status: 'available' as const,
      provider: 'Family Research Inc.',
      metadata: { platform: 'mobile', rating: '4.4', reviews: '145' }
    },
    {
      user_id: userId,
      activity_type: 'survey' as const,
      title: 'Sports & Recreation Survey',
      description: 'Tell us about your sports and recreational activities',
      reward_amount: 1.50,
      time_estimate: 6,
      status: 'available' as const,
      provider: 'Sports Analytics',
      metadata: { platform: 'mobile', rating: '4.2', reviews: '89' }
    },
    {
      user_id: userId,
      activity_type: 'survey' as const,
      title: 'Insurance Preferences Study',
      description: 'Share your insurance needs and decision-making process',
      reward_amount: 3.25,
      time_estimate: 13,
      status: 'available' as const,
      provider: 'Insurance Research',
      metadata: { platform: 'web', rating: '4.5', reviews: '167' }
    },
    {
      user_id: userId,
      activity_type: 'survey' as const,
      title: 'Mental Health Awareness',
      description: 'Participate in research about mental health and wellness',
      reward_amount: 4.50,
      time_estimate: 20,
      status: 'available' as const,
      provider: 'Health Research Institute',
      metadata: { platform: 'web', rating: '4.8', reviews: '312' }
    },

    // Videos (15 items)
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
    {
      user_id: userId,
      activity_type: 'video' as const,
      title: 'Cooking Masterclass Preview',
      description: 'Watch a preview of online cooking classes',
      reward_amount: 1.10,
      time_estimate: 6,
      status: 'completed' as const,
      provider: 'Culinary Network',
      metadata: { platform: 'web', rating: '4.6', reviews: '124' }
    },
    {
      user_id: userId,
      activity_type: 'video' as const,
      title: 'Fitness Equipment Review',
      description: 'Learn about the latest home fitness equipment',
      reward_amount: 0.75,
      time_estimate: 4,
      status: 'available' as const,
      provider: 'Fitness Media',
      metadata: { platform: 'mobile', rating: '4.1', reviews: '56' }
    },
    {
      user_id: userId,
      activity_type: 'video' as const,
      title: 'Travel Destination Guide',
      description: 'Explore amazing travel destinations around the world',
      reward_amount: 1.35,
      time_estimate: 7,
      status: 'available' as const,
      provider: 'Travel Channel',
      metadata: { platform: 'web', rating: '4.7', reviews: '189' }
    },
    {
      user_id: userId,
      activity_type: 'video' as const,
      title: 'Tech Product Unboxing',
      description: 'Watch the unboxing of the latest smartphone',
      reward_amount: 0.90,
      time_estimate: 5,
      status: 'available' as const,
      provider: 'Tech Reviews',
      metadata: { platform: 'mobile', rating: '4.4', reviews: '201' }
    },
    {
      user_id: userId,
      activity_type: 'video' as const,
      title: 'Investment Tips for Beginners',
      description: 'Learn basic investment strategies and tips',
      reward_amount: 1.50,
      time_estimate: 8,
      status: 'available' as const,
      provider: 'Finance Education',
      metadata: { platform: 'web', rating: '4.5', reviews: '156' }
    },
    {
      user_id: userId,
      activity_type: 'video' as const,
      title: 'Home Decor Trends',
      description: 'Discover the latest trends in home decoration',
      reward_amount: 0.80,
      time_estimate: 4,
      status: 'available' as const,
      provider: 'Home & Garden TV',
      metadata: { platform: 'mobile', rating: '4.2', reviews: '89' }
    },
    {
      user_id: userId,
      activity_type: 'video' as const,
      title: 'Gaming Console Review',
      description: 'In-depth review of the latest gaming console',
      reward_amount: 1.25,
      time_estimate: 6,
      status: 'available' as const,
      provider: 'Gaming Network',
      metadata: { platform: 'web', rating: '4.6', reviews: '234' }
    },
    {
      user_id: userId,
      activity_type: 'video' as const,
      title: 'Sustainable Living Tips',
      description: 'Learn how to live more sustainably and eco-friendly',
      reward_amount: 1.00,
      time_estimate: 5,
      status: 'completed' as const,
      provider: 'Green Living Media',
      metadata: { platform: 'web', rating: '4.8', reviews: '167' }
    },
    {
      user_id: userId,
      activity_type: 'video' as const,
      title: 'Pet Care Essentials',
      description: 'Essential tips for taking care of your pets',
      reward_amount: 0.70,
      time_estimate: 3,
      status: 'available' as const,
      provider: 'Pet Care Network',
      metadata: { platform: 'mobile', rating: '4.3', reviews: '78' }
    },
    {
      user_id: userId,
      activity_type: 'video' as const,
      title: 'DIY Home Projects',
      description: 'Easy DIY projects you can do at home',
      reward_amount: 1.15,
      time_estimate: 6,
      status: 'available' as const,
      provider: 'DIY Channel',
      metadata: { platform: 'web', rating: '4.4', reviews: '145' }
    },
    {
      user_id: userId,
      activity_type: 'video' as const,
      title: 'Career Development Tips',
      description: 'Advance your career with these professional tips',
      reward_amount: 1.40,
      time_estimate: 7,
      status: 'available' as const,
      provider: 'Career Network',
      metadata: { platform: 'web', rating: '4.6', reviews: '198' }
    },
    {
      user_id: userId,
      activity_type: 'video' as const,
      title: 'Mindfulness Meditation Guide',
      description: 'Learn basic mindfulness and meditation techniques',
      reward_amount: 1.30,
      time_estimate: 8,
      status: 'available' as const,
      provider: 'Wellness Media',
      metadata: { platform: 'mobile', rating: '4.7', reviews: '223' }
    },

    // Tasks (20 items)
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
    },
    {
      user_id: userId,
      activity_type: 'task' as const,
      title: 'Beta App Testing',
      description: 'Test a beta version of a productivity app',
      reward_amount: 3.75,
      time_estimate: 12,
      status: 'completed' as const,
      provider: 'Beta Testing Inc.',
      metadata: { platform: 'mobile', rating: '4.5', reviews: '167' }
    },
    {
      user_id: userId,
      activity_type: 'task' as const,
      title: 'Online Store Navigation',
      description: 'Navigate through an online store and report user experience',
      reward_amount: 2.25,
      time_estimate: 8,
      status: 'available' as const,
      provider: 'E-commerce Research',
      metadata: { platform: 'web', rating: '4.3', reviews: '98' }
    },
    {
      user_id: userId,
      activity_type: 'task' as const,
      title: 'Voice Recording Task',
      description: 'Record voice samples for AI training purposes',
      reward_amount: 5.00,
      time_estimate: 18,
      status: 'available' as const,
      provider: 'AI Training Corp',
      metadata: { platform: 'mobile', rating: '4.4', reviews: '134' }
    },
    {
      user_id: userId,
      activity_type: 'task' as const,
      title: 'Price Comparison Research',
      description: 'Compare prices across different online retailers',
      reward_amount: 1.50,
      time_estimate: 6,
      status: 'available' as const,
      provider: 'Price Research Co.',
      metadata: { platform: 'web', rating: '4.2', reviews: '76' }
    },
    {
      user_id: userId,
      activity_type: 'task' as const,
      title: 'Content Moderation',
      description: 'Help moderate user-generated content for appropriateness',
      reward_amount: 3.25,
      time_estimate: 10,
      status: 'available' as const,
      provider: 'Content Safety Inc.',
      metadata: { platform: 'web', rating: '4.6', reviews: '189' }
    },
    {
      user_id: userId,
      activity_type: 'task' as const,
      title: 'Map Data Verification',
      description: 'Verify and update location information on maps',
      reward_amount: 2.75,
      time_estimate: 9,
      status: 'available' as const,
      provider: 'Map Data Corp',
      metadata: { platform: 'mobile', rating: '4.3', reviews: '123' }
    },
    {
      user_id: userId,
      activity_type: 'task' as const,
      title: 'Transcription Work',
      description: 'Transcribe short audio clips into text',
      reward_amount: 4.25,
      time_estimate: 14,
      status: 'available' as const,
      provider: 'Transcription Services',
      metadata: { platform: 'web', rating: '4.5', reviews: '201' }
    },
    {
      user_id: userId,
      activity_type: 'task' as const,
      title: 'Image Tagging',
      description: 'Tag and categorize images for machine learning training',
      reward_amount: 1.75,
      time_estimate: 7,
      status: 'completed' as const,
      provider: 'ML Training Co.',
      metadata: { platform: 'web', rating: '4.4', reviews: '156' }
    },
    {
      user_id: userId,
      activity_type: 'task' as const,
      title: 'Restaurant Review',
      description: 'Visit a local restaurant and write a detailed review',
      reward_amount: 7.50,
      time_estimate: 25,
      status: 'available' as const,
      provider: 'Food Review Network',
      metadata: { platform: 'mobile', rating: '4.7', reviews: '234' }
    },
    {
      user_id: userId,
      activity_type: 'task' as const,
      title: 'Data Entry Project',
      description: 'Enter data from scanned documents into digital format',
      reward_amount: 3.00,
      time_estimate: 10,
      status: 'available' as const,
      provider: 'Data Processing Inc.',
      metadata: { platform: 'web', rating: '4.2', reviews: '89' }
    },
    {
      user_id: userId,
      activity_type: 'task' as const,
      title: 'Online Course Feedback',
      description: 'Take a short online course and provide detailed feedback',
      reward_amount: 5.75,
      time_estimate: 22,
      status: 'available' as const,
      provider: 'Education Research',
      metadata: { platform: 'web', rating: '4.6', reviews: '178' }
    },
    {
      user_id: userId,
      activity_type: 'task' as const,
      title: 'Mobile Game Testing',
      description: 'Play and test a new mobile game for bugs and feedback',
      reward_amount: 2.50,
      time_estimate: 8,
      status: 'available' as const,
      provider: 'Game Testing Studio',
      metadata: { platform: 'mobile', rating: '4.3', reviews: '134' }
    },
    {
      user_id: userId,
      activity_type: 'task' as const,
      title: 'Customer Service Chat Test',
      description: 'Test customer service chatbot functionality',
      reward_amount: 1.25,
      time_estimate: 5,
      status: 'available' as const,
      provider: 'Chat Testing Co.',
      metadata: { platform: 'web', rating: '4.1', reviews: '67' }
    },
    {
      user_id: userId,
      activity_type: 'task' as const,
      title: 'Receipt Scanning',
      description: 'Scan and upload shopping receipts for market research',
      reward_amount: 0.50,
      time_estimate: 2,
      status: 'available' as const,
      provider: 'Receipt Research',
      metadata: { platform: 'mobile', rating: '4.0', reviews: '45' }
    },
    {
      user_id: userId,
      activity_type: 'task' as const,
      title: 'Podcast Review',
      description: 'Listen to a podcast episode and write a review',
      reward_amount: 3.50,
      time_estimate: 12,
      status: 'available' as const,
      provider: 'Podcast Network',
      metadata: { platform: 'mobile', rating: '4.5', reviews: '189' }
    },
    {
      user_id: userId,
      activity_type: 'task' as const,
      title: 'Virtual Shopping Task',
      description: 'Complete a virtual shopping experience and provide feedback',
      reward_amount: 4.00,
      time_estimate: 15,
      status: 'available' as const,
      provider: 'Virtual Commerce Lab',
      metadata: { platform: 'web', rating: '4.4', reviews: '156' }
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