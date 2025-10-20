import { ReactNode, createContext, useContext } from 'react';
import { useJourneyPreview } from './JourneyPreviewContext';
import {
  generateMockSurveys,
  generateMockBadges,
  generateMockReputationHistory,
  generateMockTransactions,
  getMockBalance,
  getMockStreak
} from '@/utils/journeyPreviewMocks';

interface MockAuthContextType {
  isPreviewMode: boolean;
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentStep: string;
  register: (data: any) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  verifyOTP: (code: string) => Promise<boolean>;
  completeProfile: (profileData: any) => Promise<boolean>;
  updateCommunicationPreferences: (preferences: any) => Promise<boolean>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (email: string, otp: string, password: string) => Promise<boolean>;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

export const MockAuthProvider = ({ children }: { children: ReactNode }) => {
  const { mockUserState, setCurrentStepId } = useJourneyPreview();

  const mockAuthValue: MockAuthContextType = {
    isPreviewMode: true,
    user: {
      id: mockUserState.userId,
      email: mockUserState.email,
      user_metadata: {
        first_name: mockUserState.firstName,
        last_name: mockUserState.lastName
      }
    },
    isAuthenticated: true,
    isLoading: false,
    currentStep: mockUserState.profileLevel === 1 ? 'profile' : 'complete',
    register: async (data: any) => {
      console.log('[Preview] Mock register called with:', data);
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    },
    login: async (email: string, password: string) => {
      console.log('[Preview] Mock login called');
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    },
    verifyOTP: async (code: string) => {
      console.log('[Preview] Mock OTP verification:', code);
      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentStepId('level1');
      return true;
    },
    completeProfile: async (profileData: any) => {
      console.log('[Preview] Mock profile completion:', profileData);
      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentStepId('communication');
      return true;
    },
    updateCommunicationPreferences: async (preferences: any) => {
      console.log('[Preview] Mock communication preferences update:', preferences);
      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentStepId('dashboard-first');
      return true;
    },
    logout: () => {
      console.log('[Preview] Mock logout called');
    },
    forgotPassword: async (email: string) => {
      console.log('[Preview] Mock forgot password:', email);
      return true;
    },
    resetPassword: async (email: string, otp: string, password: string) => {
      console.log('[Preview] Mock reset password');
      return true;
    }
  };

  return (
    <MockAuthContext.Provider value={mockAuthValue}>
      {children}
    </MockAuthContext.Provider>
  );
};

export const useMockAuth = () => {
  const context = useContext(MockAuthContext);
  if (!context) {
    throw new Error('useMockAuth must be used within MockAuthProvider');
  }
  return context;
};

// Mock hooks that override real ones
export const useMockBalance = () => {
  const { mockUserState } = useJourneyPreview();
  return {
    balance: getMockBalance(mockUserState),
    isLoading: false,
    error: null
  };
};

export const useMockUserReputation = () => {
  const { mockUserState } = useJourneyPreview();
  return {
    reputation: {
      score: mockUserState.reputationScore,
      level: mockUserState.reputationLevel,
      tier: mockUserState.reputationLevel.split(' ')[0],
      prestige: 0,
      next_level_threshold: mockUserState.reputationScore + 150,
      history: generateMockReputationHistory(mockUserState.reputationScore),
      quality_metrics: {
        surveysCompleted: 47,
        surveysRejected: 2,
        averageTime: '8 min',
        consistencyScore: 92,
        speedingRate: 3
      }
    },
    isLoading: false,
    error: null
  };
};

export const useMockUserStreaks = () => {
  const { mockUserState } = useJourneyPreview();
  return {
    streak: getMockStreak(mockUserState),
    isLoading: false,
    error: null
  };
};

export const useMockTransactions = () => {
  return {
    transactions: generateMockTransactions(),
    isLoading: false,
    error: null
  };
};

export const useMockCintSurveys = () => {
  const { mockUserState } = useJourneyPreview();
  return {
    surveys: generateMockSurveys(mockUserState.countryCode),
    isLoading: false,
    error: null
  };
};

export const useMockBadges = () => {
  const { mockUserState } = useJourneyPreview();
  return {
    userBadges: generateMockBadges(mockUserState.badgesEarned),
    availableBadges: generateMockBadges(10),
    isLoading: false,
    error: null
  };
};
