export interface Survey {
  id: string;
  title: string;
  estimatedMinutes: number;
  reward: number;
  status: 'available' | 'ineligible' | 'completed';
  description: string;
  category: string;
  rating?: {
    average: number;
    count: number;
  };
}

export interface Video {
  id: string;
  title: string;
  estimatedMinutes: number;
  reward: number;
  status: 'available' | 'completed';
  thumbnail: string;
  description: string;
}

export interface MicroTask {
  id: string;
  title: string;
  type: 'poll' | 'rating' | 'quick_survey';
  reward: number;
  status: 'available' | 'completed';
  description: string;
  estimatedMinutes: number;
}

export interface Transaction {
  id: string;
  type: 'earn' | 'redeem';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending';
}

export const mockSurveys: Survey[] = [
    {
    id: '1',
    title: 'Shopping Habits Survey',
    estimatedMinutes: 12,
    reward: 2.50,
    status: 'available',
    description: 'Tell us about your shopping preferences',
    category: 'Consumer Research',
    rating: {
      average: 4.2,
      count: 284
    }
  },
  {
    id: '2',
    title: 'Food & Dining Preferences',
    estimatedMinutes: 8,
    reward: 1.50,
    status: 'available',
    description: 'Share your dining and food preferences',
    category: 'Food & Beverage',
    rating: {
      average: 4.7,
      count: 156
    }
  },
  {
    id: '3',
    title: 'Technology Usage Study',
    estimatedMinutes: 15,
    reward: 3.00,
    status: 'ineligible',
    description: 'Survey about technology and device usage',
    category: 'Technology',
    rating: {
      average: 3.8,
      count: 92
    }
  },
  {
    id: '4',
    title: 'Travel & Vacation Survey',
    estimatedMinutes: 10,
    reward: 2.00,
    status: 'completed',
    description: 'Your travel experiences and preferences',
    category: 'Travel',
    rating: {
      average: 4.5,
      count: 203
    }
  }
];

export const mockVideos: Video[] = [
  {
    id: '1',
    title: 'Product Demo: Smart Home Devices',
    estimatedMinutes: 3,
    reward: 0.50,
    status: 'available',
    thumbnail: '🏠',
    description: 'Watch a demo of the latest smart home technology'
  },
  {
    id: '2',
    title: 'Financial Planning Tips',
    estimatedMinutes: 5,
    reward: 0.75,
    status: 'available',
    thumbnail: '💰',
    description: 'Learn about saving and investment strategies'
  },
  {
    id: '3',
    title: 'Health & Wellness Guide',
    estimatedMinutes: 4,
    reward: 0.60,
    status: 'completed',
    thumbnail: '🏃‍♂️',
    description: 'Tips for maintaining a healthy lifestyle'
  }
];

export const mockMicroTasks: MicroTask[] = [
  {
    id: '1',
    title: 'Rate this Advertisement',
    type: 'rating',
    reward: 0.25,
    status: 'available',
    description: 'Rate the effectiveness of this ad',
    estimatedMinutes: 1
  },
  {
    id: '2',
    title: 'Quick Poll: Favorite Color',
    type: 'poll',
    reward: 0.15,
    status: 'available',
    description: 'One-question poll about color preferences',
    estimatedMinutes: 1
  },
  {
    id: '3',
    title: 'Logo Preference Survey',
    type: 'quick_survey',
    reward: 0.30,
    status: 'completed',
    description: 'Choose your preferred logo design',
    estimatedMinutes: 2
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'earn',
    amount: 2.50,
    description: 'Shopping Habits Survey completed',
    date: '2024-01-15',
    status: 'completed'
  },
  {
    id: '2',
    type: 'earn',
    amount: 0.50,
    description: 'Daily check-in bonus',
    date: '2024-01-15',
    status: 'completed'
  },
  {
    id: '3',
    type: 'earn',
    amount: 0.75,
    description: 'Video watch reward',
    date: '2024-01-14',
    status: 'completed'
  },
  {
    id: '4',
    type: 'redeem',
    amount: -5.00,
    description: 'PayPal withdrawal',
    date: '2024-01-13',
    status: 'pending'
  },
  {
    id: '5',
    type: 'earn',
    amount: 3.00,
    description: 'Technology Usage Study',
    date: '2024-01-12',
    status: 'completed'
  },
  {
    id: '6',
    type: 'earn',
    amount: 1.25,
    description: 'Data sharing revenue - Q4 2023',
    date: '2024-01-10',
    status: 'completed'
  }
];

export const userStats = {
  totalEarnings: '$24.50',
  currentBalance: '$12.50',
  surveysCompleted: 12,
  videosWatched: 8,
  tasksCompleted: 15,
  checkInStreak: 7,
  referrals: {
    invited: 3,
    joined: 2,
    qualified: 1,
    earnings: '$1.50'
  },
  reputation: {
    score: 67,
    level: 'Gold',
    badges: ['OTP Verified', 'GPS Enabled', '5-day Streak', 'First Survey'],
    history: [
      { action: 'OTP Verification completed', points: +15, date: '2024-01-15' },
      { action: 'GPS location enabled', points: +10, date: '2024-01-14' },
      { action: 'First survey completed', points: +20, date: '2024-01-13' },
      { action: 'Daily check-in streak: 5 days', points: +25, date: '2024-01-12' },
      { action: 'Survey rejected: Inconsistent responses', points: -15, date: '2024-01-11' },
      { action: 'Survey rejected: Speeding (completed in 2min)', points: -10, date: '2024-01-10' },
      { action: 'High-quality survey completed', points: +25, date: '2024-01-09' },
      { action: 'Profile incomplete warning', points: -5, date: '2024-01-08' }
    ],
    qualityMetrics: {
      surveysCompleted: 12,
      surveysRejected: 3,
      averageTime: '8.5 min',
      consistencyScore: 85,
      speedingRate: 8 // percentage
    }
  },
  kyc: {
    verified: false,
    status: 'pending',
    provider: 'Soulbase Identity'
  },
  permissions: {
    sms: true,
    whatsapp: false,
    email: true,
    pushNotifications: true
  },
  pendingPayments: [
    { id: '1', amount: '$5.00', method: 'PayPal', date: '2024-01-14', status: 'awaiting_revenue' },
    { id: '2', amount: '$2.50', method: 'M-Pesa', date: '2024-01-13', status: 'processing' }
  ]
};