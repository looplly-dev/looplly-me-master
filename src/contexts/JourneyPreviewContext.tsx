import { createContext, useContext, useState, ReactNode } from 'react';

export interface JourneyStep {
  id: string;
  title: string;
  description: string;
  component: string;
  category: 'signup' | 'profile' | 'dashboard' | 'earning' | 'reputation';
}

export interface MockUserState {
  userId: string;
  email: string;
  countryCode: string;
  profileLevel: number;
  level2Complete: boolean;
  level2CompletionPercent: number;
  reputationScore: number;
  reputationLevel: string;
  reputationTier: string;
  currentStreak: number;
  longestStreak: number;
  badgesEarned: number;
  hasStaleData: boolean;
  staleQuestionCount: number;
  unlockedStages: {
    stage1: boolean;
    stage2: boolean;
  };
  firstName: string;
  lastName: string;
  gender: string | null;
  dateOfBirth: string | null;
}

interface JourneyPreviewContextType {
  currentStepId: string;
  setCurrentStepId: (id: string) => void;
  mockUserState: MockUserState;
  updateMockUserState: (updates: Partial<MockUserState>) => void;
  resetMockUserState: () => void;
  isPreviewMode: boolean;
}

const JourneyPreviewContext = createContext<JourneyPreviewContextType | undefined>(undefined);

const defaultMockUserState: MockUserState = {
  userId: 'preview-user-123',
  email: 'preview@looplly.me',
  countryCode: 'ZA',
  profileLevel: 1,
  level2Complete: false,
  level2CompletionPercent: 0,
  reputationScore: 0,
  reputationLevel: 'Bronze Novice',
  reputationTier: 'Bronze',
  currentStreak: 0,
  longestStreak: 0,
  badgesEarned: 0,
  hasStaleData: false,
  staleQuestionCount: 0,
  unlockedStages: {
    stage1: true,
    stage2: false,
  },
  firstName: 'Preview',
  lastName: 'User',
  gender: null,
  dateOfBirth: null,
};

export const journeySteps: JourneyStep[] = [
  {
    id: 'signup',
    title: 'User Signup',
    description: 'Email, password, and mobile number registration',
    component: 'Register.tsx',
    category: 'signup',
  },
  {
    id: 'otp',
    title: 'OTP Verification',
    description: 'Mobile number verification step',
    component: 'OTPVerification.tsx',
    category: 'signup',
  },
  {
    id: 'level1',
    title: 'Level 1 Profile Setup',
    description: 'Basic information: name, gender, DOB, address',
    component: 'MultiStepProfileSetup.tsx',
    category: 'profile',
  },
  {
    id: 'communication',
    title: 'Communication Preferences',
    description: 'Select preferred communication channels',
    component: 'CommunicationPreferences.tsx',
    category: 'signup',
  },
  {
    id: 'dashboard-first',
    title: 'Dashboard First Load',
    description: 'Initial dashboard view with welcome state',
    component: 'Dashboard.tsx',
    category: 'dashboard',
  },
  {
    id: 'level2-prompt',
    title: 'Level 2 Profile Prompt',
    description: 'Alert banner encouraging profile completion',
    component: 'LevelCompletionAlert.tsx',
    category: 'profile',
  },
  {
    id: 'level2-questions',
    title: 'Level 2 Profile Questions',
    description: 'Complete demographic and lifestyle questions',
    component: 'ProfileTab.tsx',
    category: 'profile',
  },
  {
    id: 'stale-data-modal',
    title: 'Stale Data Update',
    description: 'Modal prompting to refresh outdated answers',
    component: 'ProfileUpdateModal.tsx',
    category: 'profile',
  },
  {
    id: 'earn-tab',
    title: 'Earn Tab - Surveys',
    description: 'Browse available earning opportunities',
    component: 'SimplifiedEarnTab.tsx',
    category: 'earning',
  },
  {
    id: 'rep-onboarding',
    title: 'Reputation System Intro',
    description: 'First-time explanation of reputation system',
    component: 'ReputationOnboarding.tsx',
    category: 'reputation',
  },
  {
    id: 'rep-tab',
    title: 'Reputation Tab',
    description: 'View reputation score, history, and tier',
    component: 'RepTab.tsx',
    category: 'reputation',
  },
  {
    id: 'contextual-tour',
    title: 'Contextual Dashboard Tour',
    description: 'Guided tour highlighting key features',
    component: 'ContextualRepTour.tsx',
    category: 'dashboard',
  },
  {
    id: 'stage2-unlock',
    title: 'Stage 2 Unlock Alert',
    description: 'Notification when Stage 2 becomes available',
    component: 'Stage2CapAlert.tsx',
    category: 'dashboard',
  },
  {
    id: 'badges',
    title: 'Badge Collection',
    description: 'View earned badges and achievements',
    component: 'BadgeDetailModal.tsx',
    category: 'reputation',
  },
];

export function JourneyPreviewProvider({ children }: { children: ReactNode }) {
  const [currentStepId, setCurrentStepId] = useState(journeySteps[0].id);
  const [mockUserState, setMockUserState] = useState<MockUserState>(defaultMockUserState);

  const updateMockUserState = (updates: Partial<MockUserState>) => {
    setMockUserState(prev => ({ ...prev, ...updates }));
  };

  const resetMockUserState = () => {
    setMockUserState(defaultMockUserState);
    setCurrentStepId(journeySteps[0].id);
  };

  return (
    <JourneyPreviewContext.Provider
      value={{
        currentStepId,
        setCurrentStepId,
        mockUserState,
        updateMockUserState,
        resetMockUserState,
        isPreviewMode: true,
      }}
    >
      {children}
    </JourneyPreviewContext.Provider>
  );
}

export function useJourneyPreview() {
  const context = useContext(JourneyPreviewContext);
  if (!context) {
    throw new Error('useJourneyPreview must be used within JourneyPreviewProvider');
  }
  return context;
}
