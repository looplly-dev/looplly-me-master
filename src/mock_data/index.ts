// Central export point for all mock data

// Export types
export * from './types';

// Export helper functions
export * from './helpers/transaction-helpers';

// Import JSON data
import earnData from './pages/earn.json';
import walletData from './pages/wallet.json';
import repData from './pages/rep.json';
import communityData from './pages/community.json';
import settingsData from './pages/settings.json';
import adminRedemptionsData from './pages/admin-redemptions.json';
import badgesData from './features/badges.json';
import cintSurveysData from './features/cint-surveys.json';
import earningActivitiesData from './features/earning-activities.json';
import userStatsData from './features/user-stats.json';

// Type imports
import type {
  Survey,
  Video,
  MicroTask,
  Transaction,
  CommunityPost,
  BadgeType,
  UserStats,
  CintSurvey,
  EarningActivity,
  Redemption
} from './types';

// Export typed data for Earn page
export const mockSurveys: Survey[] = earnData.surveys as Survey[];
export const mockVideos: Video[] = earnData.videos as Video[];
export const mockMicroTasks: MicroTask[] = earnData.microTasks as MicroTask[];

// Export typed data for Wallet page
export const mockTransactions: Transaction[] = walletData.transactions as Transaction[];
export const mockLegacyTransactions: Transaction[] = walletData.legacyTransactions as Transaction[];

// Export typed data for Community page
export const mockCommunityPosts: CommunityPost[] = communityData.posts as CommunityPost[];

// Export typed data for Rep page
export const userStats: UserStats = repData.userStats as UserStats;

// Export typed data for Admin Redemptions page
export const mockRedemptions: Redemption[] = adminRedemptionsData.redemptions as Redemption[];

// Export typed badge system
export const badgeSystem: {
  coreVerification: BadgeType[];
  streakAchievements: BadgeType[];
  qualityAchievements: BadgeType[];
  socialConnector: BadgeType[];
  speedDemon: BadgeType[];
  perfectionist: BadgeType[];
  explorer: BadgeType[];
} = {
  coreVerification: badgesData.coreVerification as BadgeType[],
  streakAchievements: badgesData.streakAchievements as BadgeType[],
  qualityAchievements: badgesData.qualityAchievements as BadgeType[],
  socialConnector: badgesData.socialConnector as BadgeType[],
  speedDemon: badgesData.speedDemon as BadgeType[],
  perfectionist: badgesData.perfectionist as BadgeType[],
  explorer: badgesData.explorer as BadgeType[]
};

// Export Cint surveys
export const mockCintSurveys: CintSurvey[] = cintSurveysData.surveys as CintSurvey[];

// Export earning activities
export const demoActivities: EarningActivity[] = earningActivitiesData.demoActivities.map(activity => ({
  ...activity,
  user_id: '', // Will be set when used
})) as EarningActivity[];

export const minimalDemoActivities: EarningActivity[] = earningActivitiesData.minimalDemoActivities.map(activity => ({
  ...activity,
  user_id: '', // Will be set when used
})) as EarningActivity[];

// Legacy exports for backward compatibility
export { earningActivitiesData, userStatsData };
