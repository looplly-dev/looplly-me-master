// All TypeScript interfaces for mock data

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
  type: 'earning' | 'withdrawal' | 'bonus' | 'referral' | 'earn' | 'redeem';
  amount: number;
  currency?: string;
  status?: 'verified' | 'pending_verification' | 'processing' | 'failed' | 'completed' | 'pending';
  accountant_status?: 'funds_received' | 'awaiting_funds' | 'verifying' | 'completed';
  description: string;
  method?: string;
  date?: string;
  created_at?: string;
  verified_at?: string;
  user_id?: string;
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

export interface BadgeType {
  id: string;
  name: string;
  description: string;
  tier: string;
  repPoints: number;
  earned: boolean;
  rarity: string;
  icon: string;
  shape: 'circle' | 'hexagon' | 'shield' | 'star' | 'diamond';
  category: string;
  requirement?: number;
  earnedAt?: string;
}

export interface UserStats {
  totalEarnings: string;
  currentBalance: string;
  surveysCompleted: number;
  videosWatched: number;
  tasksCompleted: number;
  streaks: {
    currentStreak: number;
    longestStreak: number;
    daysUntilMonthlyMilestone: number;
    monthsUntilYearly: number;
    milestones: {
      weekly: { achieved: boolean; count: number };
      monthly: { achieved: boolean; count: number };
      quarterly: { achieved: boolean; count: number };
      yearly: { achieved: boolean; count: number };
    };
  };
  referrals: {
    invited: number;
    joined: number;
    qualified: number;
    earnings: string;
  };
  reputation: {
    score: number;
    level: string;
    tier: string;
    prestige: number;
    nextLevelThreshold: number;
    history: Array<{ action: string; points: number; date: string }>;
    qualityMetrics: {
      surveysCompleted: number;
      surveysRejected: number;
      averageTime: string;
      consistencyScore: number;
      speedingRate: number;
    };
  };
  kyc: {
    verified: boolean;
    status: string;
    provider: string;
  };
  verification: {
    otpVerified: boolean;
    gpsEnabled: boolean;
    kycVerified: boolean;
    cryptoToken: boolean;
    communicationsEnabled: boolean;
  };
  permissions: {
    sms: boolean;
    whatsapp: boolean;
    email: boolean;
    pushNotifications: boolean;
  };
  pendingPayments: Array<{
    id: string;
    amount: string;
    method: string;
    date: string;
    status: string;
  }>;
  community: {
    postsCreated: number;
    totalVotes: number;
    reputationFromPosts: number;
    moderationPenalties: number;
  };
}

export interface CintSurvey {
  id: string;
  title: string;
  description: string;
  reward_amount: number;
  time_estimate: number;
  category: string;
  provider: 'cint';
  qualification_score: number;
  completion_rate: number;
  status: 'available' | 'qualification_required' | 'full';
  metadata: {
    target_audience?: string;
    difficulty_level?: 'easy' | 'medium' | 'hard';
    survey_type?: 'consumer' | 'b2b' | 'medical' | 'political';
  };
}

export interface EarningActivity {
  id?: string;
  user_id: string;
  activity_type: 'survey' | 'video' | 'task';
  title: string;
  description: string;
  reward_amount: number;
  time_estimate: number;
  status: 'available' | 'completed';
  provider: string;
  metadata: {
    platform?: string;
    category?: string;
    difficulty?: string;
    rating?: string;
    reviews?: string;
  };
}

export interface Redemption {
  id: number;
  user: string;
  amount: number;
  status: string;
  date: string;
}
