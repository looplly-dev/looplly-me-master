import { MockUserState } from '@/contexts/JourneyPreviewContext';

export const generateMockSurveys = (countryCode: string) => {
  const baseSurveys = [
    {
      id: '1',
      title: 'Consumer Habits Survey',
      reward: 2.50,
      duration: 15,
      category: 'Shopping'
    },
    {
      id: '2',
      title: 'Tech Usage Survey',
      reward: 1.75,
      duration: 10,
      category: 'Technology'
    },
    {
      id: '3',
      title: 'Entertainment Preferences',
      reward: 3.00,
      duration: 20,
      category: 'Entertainment'
    }
  ];

  // Country-specific surveys
  if (countryCode === 'ZA') {
    baseSurveys.push({
      id: '4',
      title: 'South African Market Research',
      reward: 2.00,
      duration: 12,
      category: 'Local'
    });
  }

  return baseSurveys;
};

export const generateMockBadges = (count: number) => {
  const allBadges = [
    { id: '1', name: 'First Steps', icon_name: 'Award', tier: 'bronze' },
    { id: '2', name: 'Profile Complete', icon_name: 'User', tier: 'silver' },
    { id: '3', name: 'Survey Master', icon_name: 'Target', tier: 'gold' },
    { id: '4', name: 'Streak Keeper', icon_name: 'Flame', tier: 'silver' },
    { id: '5', name: 'Community Helper', icon_name: 'Users', tier: 'bronze' }
  ];

  return allBadges.slice(0, count);
};

export const generateMockReputationHistory = (score: number) => {
  const history = [];
  let currentScore = 0;
  const actions = [
    'Profile completion',
    'Survey completion',
    'Daily streak bonus',
    'First survey',
    'Level 2 completion',
    'Badge earned'
  ];

  while (currentScore < score) {
    const points = Math.floor(Math.random() * 50) + 25;
    currentScore += points;
    history.push({
      action: actions[Math.floor(Math.random() * actions.length)],
      points,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'activity',
      type: 'gain'
    });
  }

  return history.slice(0, 10);
};

export const generateMockTransactions = (count: number = 5) => {
  const types = ['survey', 'referral', 'bonus', 'daily_activity'];
  const transactions = [];

  for (let i = 0; i < count; i++) {
    transactions.push({
      id: `tx-${i}`,
      type: types[Math.floor(Math.random() * types.length)],
      amount: (Math.random() * 5 + 0.5).toFixed(2),
      status: 'completed',
      created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Survey completion reward'
    });
  }

  return transactions;
};

export const generateMockProfileQuestions = (level: number, countryCode: string) => {
  const level2Questions = [
    {
      id: 'q1',
      question_text: 'What is your occupation?',
      question_type: 'select',
      options: ['Employed', 'Self-employed', 'Student', 'Unemployed', 'Retired'],
      level: 2,
      category_id: 'work'
    },
    {
      id: 'q2',
      question_text: 'What is your education level?',
      question_type: 'select',
      options: ['High School', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD'],
      level: 2,
      category_id: 'demographics'
    },
    {
      id: 'q3',
      question_text: 'How many people live in your household?',
      question_type: 'number',
      level: 2,
      category_id: 'household'
    }
  ];

  const level3Questions = [
    {
      id: 'q4',
      question_text: 'What brands do you regularly purchase?',
      question_type: 'multi-select',
      options: countryCode === 'ZA' 
        ? ['Woolworths', 'Pick n Pay', 'Checkers', 'Shoprite']
        : ['Walmart', 'Target', 'Costco', 'Amazon'],
      level: 3,
      category_id: 'shopping'
    }
  ];

  return level === 2 ? level2Questions : level3Questions;
};

export const getMockBalance = (userState: MockUserState) => {
  return {
    balance: 45.75,
    pending_balance: 12.50,
    lifetime_earnings: 234.80,
    currency: 'USD'
  };
};

export const getMockStreak = (userState: MockUserState) => {
  return {
    current_streak: userState.currentStreak,
    longest_streak: userState.longestStreak,
    last_activity_date: new Date().toISOString(),
    milestones: {
      weekly: { achieved: userState.currentStreak >= 7 },
      monthly: { achieved: false },
      quarterly: { achieved: false },
      yearly: { achieved: false }
    }
  };
};
