export interface QuickStartGuide {
  id: string;
  title: string;
  description: string;
  documentId: string;
  icon: string;
  estimatedMinutes: number;
}

export const quickStartGuides: QuickStartGuide[] = [
  {
    id: 'new-user-onboarding',
    title: 'New User Onboarding',
    description: 'Learn the basics of Looplly and get started quickly',
    documentId: 'user-classification',
    icon: 'UserCircle',
    estimatedMinutes: 5
  },
  {
    id: 'admin-first-steps',
    title: 'Admin First Steps',
    description: 'Essential guide for new administrators',
    documentId: 'platform-guide',
    icon: 'Shield',
    estimatedMinutes: 10
  },
  {
    id: 'user-types',
    title: 'Understanding User Types',
    description: 'Learn about different user types and their permissions',
    documentId: 'user-type-management',
    icon: 'Users',
    estimatedMinutes: 7
  },
  {
    id: 'profiling',
    title: 'Setting Up Profiling',
    description: 'Configure and manage user profiling questions',
    documentId: 'profiling-architecture',
    icon: 'ClipboardList',
    estimatedMinutes: 12
  },
  {
    id: 'team-management',
    title: 'Managing Team Members',
    description: 'Add and manage team members effectively',
    documentId: 'account-management',
    icon: 'UserPlus',
    estimatedMinutes: 8
  },
  {
    id: 'reputation-system',
    title: 'Understanding Reputation',
    description: 'Learn how the reputation and streak system works',
    documentId: 'reputation-system',
    icon: 'Star',
    estimatedMinutes: 6
  }
];
