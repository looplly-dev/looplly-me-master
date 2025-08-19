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

export interface CommunityPost {
  id: string;
  type: 'tip' | 'poll' | 'suggestion';
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    reputation: number;
  };
  votes: {
    up: number;
    down: number;
    userVote?: 'up' | 'down';
  };
  createdAt: string;
  status: 'approved' | 'pending' | 'rejected';
  moderationScore?: {
    relevance: number;
    quality: number;
    toxicity: number;
  };
  category?: string;
  pollOptions?: {
    option: string;
    votes: number;
  }[];
  reputationImpact?: number;
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

export const mockCommunityPosts: CommunityPost[] = [
  {
    id: '1',
    type: 'tip',
    title: 'Maximize Survey Earnings',
    content: 'Always complete your profile 100% before starting surveys. This increases qualification rates by 40%!',
    author: {
      id: 'user1',
      name: 'Sarah M.',
      avatar: '👩‍💼',
      reputation: 89
    },
    votes: { up: 24, down: 2 },
    createdAt: '2024-01-15T10:30:00Z',
    status: 'approved',
    moderationScore: {
      relevance: 95,
      quality: 88,
      toxicity: 5
    },
    category: 'earnings',
    reputationImpact: 5
  },
  {
    id: '2',
    type: 'poll',
    title: 'What earning method do you prefer?',
    content: 'Help us understand what types of activities our community enjoys most.',
    author: {
      id: 'admin',
      name: 'Looplly Team',
      avatar: '🎯',
      reputation: 100
    },
    votes: { up: 18, down: 0 },
    createdAt: '2024-01-14T15:45:00Z',
    status: 'approved',
    pollOptions: [
      { option: 'Surveys', votes: 45 },
      { option: 'Video watching', votes: 23 },
      { option: 'Micro tasks', votes: 31 },
      { option: 'Focus groups', votes: 12 }
    ],
    category: 'feedback'
  },
  {
    id: '3',
    type: 'suggestion',
    title: 'Add dark mode to the app',
    content: 'Would love to see a dark mode option for better nighttime usage. Many other apps have this feature.',
    author: {
      id: 'user2',
      name: 'Mike R.',
      avatar: '🧑‍💻',
      reputation: 67
    },
    votes: { up: 15, down: 3, userVote: 'up' },
    createdAt: '2024-01-13T20:15:00Z',
    status: 'approved',
    moderationScore: {
      relevance: 85,
      quality: 75,
      toxicity: 0
    },
    category: 'feature-request',
    reputationImpact: 3
  },
  {
    id: '4',
    type: 'tip',
    title: 'Best times to check for new surveys',
    content: 'I\'ve noticed most new surveys are posted between 9-11 AM EST and 3-5 PM EST. Set reminders!',
    author: {
      id: 'user3',
      name: 'Lisa K.',
      avatar: '⏰',
      reputation: 72
    },
    votes: { up: 12, down: 1 },
    createdAt: '2024-01-12T14:20:00Z',
    status: 'approved',
    category: 'timing',
    reputationImpact: 2
  },
  {
    id: '5',
    type: 'suggestion',
    title: 'Add cryptocurrency payout option',
    content: 'Please consider adding Bitcoin or Ethereum as payout options alongside PayPal and bank transfers.',
    author: {
      id: 'user4',
      name: 'Alex P.',
      avatar: '₿',
      reputation: 45
    },
    votes: { up: 8, down: 7 },
    createdAt: '2024-01-11T11:30:00Z',
    status: 'pending',
    category: 'payments'
  },
  {
    id: '6',
    type: 'tip',
    title: 'Avoid survey speeding penalties',
    content: 'Take your time with surveys. I got penalized for completing a 15-minute survey in 3 minutes. Quality over speed!',
    author: {
      id: 'user5',
      name: 'Tom L.',
      avatar: '🐢',
      reputation: 55
    },
    votes: { up: 20, down: 0 },
    createdAt: '2024-01-10T16:45:00Z',
    status: 'approved',
    moderationScore: {
      relevance: 92,
      quality: 85,
      toxicity: 0
    },
    category: 'warnings',
    reputationImpact: 4
  },
  {
    id: '7',
    type: 'suggestion',
    title: 'More detailed survey descriptions',
    content: 'Would be helpful to know the general topic before starting a survey to avoid disqualifications.',
    author: {
      id: 'user6',
      name: 'Emma W.',
      avatar: '📝',
      reputation: 61
    },
    votes: { up: 11, down: 2 },
    createdAt: '2024-01-09T09:15:00Z',
    status: 'approved',
    category: 'user-experience'
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
  ],
  community: {
    postsCreated: 3,
    totalVotes: 42,
    reputationFromPosts: 8,
    moderationPenalties: 0
  }
};