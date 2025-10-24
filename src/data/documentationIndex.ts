export interface DocumentationItem {
  id: string;
  title: string;
  category: 'Core Systems' | 'Admin Guides' | 'Technical Reference' | 'Strategy';
  tags: string[];
  description: string;
  parent?: string;
  audience: 'all' | 'office_user' | 'admin' | 'super_admin';
  status?: 'draft' | 'published' | 'coming_soon';
}

// NOTE: Documentation content is now stored securely in the database.
// Content is only accessible to authenticated users via the documentation table.

export const documentationIndex: DocumentationItem[] = [
  // Wave 1 - Core Systems (Published)
  {
    id: 'mobile-validation',
    title: 'Mobile Number Validation',
    category: 'Core Systems',
    tags: ['validation', 'mobile', 'international', 'e164'],
    description: 'Country-aware mobile validation system using E.164 format',
    audience: 'all',
    status: 'published'
  },
  {
    id: 'mobile-validation-global',
    title: 'Global Expansion Strategy',
    category: 'Core Systems',
    tags: ['validation', 'mobile', 'global', 'expansion', 'strategy'],
    description: 'Strategies for expanding mobile validation to global markets',
    parent: 'mobile-validation',
    audience: 'admin',
    status: 'coming_soon'
  },
  {
    id: 'profile-system',
    title: 'Profile System Architecture',
    category: 'Core Systems',
    tags: ['profile', 'architecture', 'database', 'schema'],
    description: 'Complete architecture for the user profile system',
    audience: 'all',
    status: 'published'
  },
  {
    id: 'reputation-system',
    title: 'Reputation Classification System',
    category: 'Core Systems',
    tags: ['reputation', 'classification', 'points', 'levels'],
    description: 'User reputation and classification system rules',
    audience: 'all',
    status: 'published'
  },
  {
    id: 'streak-reputation',
    title: 'Streak & Reputation System',
    category: 'Core Systems',
    tags: ['streak', 'reputation', 'engagement', 'rewards'],
    description: 'Daily streak tracking and reputation integration',
    audience: 'all',
    status: 'published'
  },
  {
    id: 'country-codes',
    title: 'Country Code Specification',
    category: 'Core Systems',
    tags: ['country', 'codes', 'iso', 'localization'],
    description: 'ISO country code standards and usage',
    audience: 'all',
    status: 'published'
  },
  {
    id: 'data-isolation',
    title: 'Data Isolation Quick Reference',
    category: 'Technical Reference',
    tags: ['security', 'rls', 'isolation', 'multi-tenant'],
    description: 'Quick reference for data isolation and RLS policies',
    audience: 'admin',
    status: 'published'
  },
  {
    id: 'knowledge-centre',
    title: 'Knowledge Centre Guide',
    category: 'Admin Guides',
    tags: ['documentation', 'knowledge', 'search', 'version-control'],
    description: 'Complete guide to using the Knowledge Centre',
    audience: 'all',
    status: 'published'
  },

  // Wave 2 & 3 - Coming Soon
  // Admin Guides
  {
    id: 'user-type-management',
    title: 'User Type Management',
    category: 'Admin Guides',
    tags: ['user-types', 'office-user', 'looplly-user', 'b2b'],
    description: 'Managing office_user vs looplly_user classifications',
    audience: 'admin',
    status: 'coming_soon'
  },
  {
    id: 'role-architecture',
    title: 'Role Architecture',
    category: 'Technical Reference',
    tags: ['roles', 'permissions', 'security', 'rls'],
    description: 'Dual-table architecture for roles and user types',
    audience: 'super_admin',
    status: 'coming_soon'
  },
  {
    id: 'warren-admin-guide',
    title: 'Warren Admin Guide',
    category: 'Admin Guides',
    tags: ['admin', 'guide', 'operations', 'management'],
    description: 'Administrative guide for platform management',
    audience: 'admin',
    status: 'coming_soon'
  },
  {
    id: 'admin-setup',
    title: 'Admin Setup Instructions',
    category: 'Admin Guides',
    tags: ['setup', 'admin', 'installation', 'configuration'],
    description: 'Step-by-step admin setup and configuration',
    audience: 'super_admin',
    status: 'coming_soon'
  },
  {
    id: 'phase1-setup',
    title: 'Phase 1 Setup Instructions',
    category: 'Admin Guides',
    tags: ['setup', 'phase1', 'deployment', 'migration'],
    description: 'Phase 1 deployment and setup instructions',
    audience: 'super_admin',
    status: 'coming_soon'
  },

  // Profiling System
  {
    id: 'profiling-readme',
    title: 'Profiling System Overview',
    category: 'Core Systems',
    tags: ['profiling', 'overview', 'architecture'],
    description: 'Complete overview of the user profiling system',
    audience: 'all',
    status: 'coming_soon'
  },
  {
    id: 'profiling-architecture',
    title: 'Profiling Architecture',
    category: 'Technical Reference',
    tags: ['profiling', 'architecture', 'technical', 'database'],
    description: 'Technical architecture of the profiling system',
    audience: 'admin',
    status: 'coming_soon'
  },
  {
    id: 'profiling-user-guide',
    title: 'Profiling User Guide',
    category: 'Admin Guides',
    tags: ['profiling', 'user-guide', 'how-to'],
    description: 'End-user guide for completing profiles',
    audience: 'all',
    status: 'coming_soon'
  },
  {
    id: 'profiling-admin-guide',
    title: 'Profiling Admin Guide',
    category: 'Admin Guides',
    tags: ['profiling', 'admin', 'management', 'questions'],
    description: 'Admin guide for managing profiling questions',
    audience: 'admin',
    status: 'coming_soon'
  },
  {
    id: 'profiling-question-builder',
    title: 'Question Builder Guide',
    category: 'Admin Guides',
    tags: ['profiling', 'questions', 'builder', 'tool'],
    description: 'Guide to using the question builder interface',
    audience: 'admin',
    status: 'coming_soon'
  },
  {
    id: 'profiling-ai-generation',
    title: 'AI Generation Prompts',
    category: 'Admin Guides',
    tags: ['profiling', 'ai', 'generation', 'prompts'],
    description: 'AI prompt templates for generating profile questions',
    audience: 'admin',
    status: 'coming_soon'
  },
  {
    id: 'profiling-admin-auto-generation',
    title: 'Admin Auto-Generation Guide',
    category: 'Admin Guides',
    tags: ['profiling', 'ai', 'auto-generation', 'admin'],
    description: 'Guide for auto-generating profile questions with AI',
    audience: 'admin',
    status: 'coming_soon'
  },
  {
    id: 'profiling-country-questions',
    title: 'Country Question Management',
    category: 'Admin Guides',
    tags: ['profiling', 'country', 'localization', 'questions'],
    description: 'Managing country-specific profile questions',
    audience: 'admin',
    status: 'coming_soon'
  },
  {
    id: 'profiling-auto-scaling',
    title: 'Auto-Scaling System',
    category: 'Technical Reference',
    tags: ['profiling', 'scaling', 'performance', 'optimization'],
    description: 'Auto-scaling system for profile question delivery',
    audience: 'admin',
    status: 'coming_soon'
  },
  {
    id: 'profiling-decay-system',
    title: 'Profile Decay System',
    category: 'Core Systems',
    tags: ['profiling', 'decay', 'freshness', 'updates'],
    description: 'Profile data decay and freshness system',
    audience: 'admin',
    status: 'coming_soon'
  },
  {
    id: 'profiling-earning-rules',
    title: 'Profile Earning Rules',
    category: 'Core Systems',
    tags: ['profiling', 'earning', 'rewards', 'points'],
    description: 'Earning rules for profile completion',
    audience: 'all',
    status: 'coming_soon'
  },
  {
    id: 'profiling-level-strategy',
    title: 'Level Strategy',
    category: 'Core Systems',
    tags: ['profiling', 'levels', 'progression', 'strategy'],
    description: 'User progression and level strategy',
    audience: 'admin',
    status: 'coming_soon'
  },
  {
    id: 'profiling-contextual-triggers',
    title: 'Contextual Triggers',
    category: 'Technical Reference',
    tags: ['profiling', 'triggers', 'context', 'automation'],
    description: 'Contextual triggers for smart question delivery',
    audience: 'admin',
    status: 'coming_soon'
  },
  {
    id: 'profiling-global-vs-local',
    title: 'Global vs Local Brands',
    category: 'Strategy',
    tags: ['profiling', 'brands', 'global', 'local'],
    description: 'Strategy for global vs local brand questions',
    audience: 'admin',
    status: 'coming_soon'
  },
  {
    id: 'profiling-integration',
    title: 'Profiling Integration Guide',
    category: 'Technical Reference',
    tags: ['profiling', 'integration', 'api', 'technical'],
    description: 'Technical integration guide for profiling system',
    audience: 'admin',
    status: 'coming_soon'
  },

  // Technical Reference
  {
    id: 'analytics',
    title: 'Analytics Documentation',
    category: 'Technical Reference',
    tags: ['analytics', 'tracking', 'metrics', 'reporting'],
    description: 'Analytics system architecture and usage',
    audience: 'admin',
    status: 'coming_soon'
  },
  {
    id: 'deployment-config',
    title: 'Deployment Configuration',
    category: 'Technical Reference',
    tags: ['deployment', 'config', 'environment', 'production'],
    description: 'Production deployment configuration guide',
    audience: 'super_admin',
    status: 'coming_soon'
  },
  {
    id: 'environment-setup',
    title: 'Environment Setup',
    category: 'Technical Reference',
    tags: ['environment', 'setup', 'configuration', 'dev'],
    description: 'Development environment setup guide',
    audience: 'admin',
    status: 'coming_soon'
  },
  {
    id: 'supabase-config',
    title: 'Supabase Configuration Management',
    category: 'Technical Reference',
    tags: ['supabase', 'config', 'backend', 'database'],
    description: 'Backend configuration and management',
    audience: 'super_admin',
    status: 'coming_soon'
  },
  {
    id: 'admin-portal-guide',
    title: 'Admin Portal Guide',
    category: 'Admin Guides',
    tags: ['admin', 'portal', 'guide', 'management'],
    description: 'Complete guide to the Admin Portal features and sections',
    audience: 'admin',
    status: 'coming_soon'
  },
  {
    id: 'account-management',
    title: 'Account Management',
    category: 'Admin Guides',
    tags: ['accounts', 'deletion', 'team-management'],
    description: 'Managing user and team member accounts',
    audience: 'admin',
    status: 'coming_soon'
  },
  {
    id: 'documentation-version-control',
    title: 'Documentation Version Control',
    category: 'Technical Reference',
    tags: ['version-control', 'documentation', 'history'],
    description: 'Version control system for documentation',
    audience: 'admin',
    status: 'coming_soon'
  },
  {
    id: 'table-architecture',
    title: 'Table Architecture',
    category: 'Technical Reference',
    tags: ['database', 'architecture', 'tables'],
    description: 'Database table architecture and separation',
    audience: 'admin',
    status: 'coming_soon'
  },
  {
    id: 'user-classification',
    title: 'User Classification',
    category: 'Technical Reference',
    tags: ['users', 'classification', 'types'],
    description: 'User type classification and management',
    audience: 'admin',
    status: 'coming_soon'
  },
  {
    id: 'integrations-setup',
    title: 'Integrations Setup',
    category: 'Technical Reference',
    tags: ['integrations', 'setup', 'configuration'],
    description: 'Setting up external integrations',
    audience: 'admin',
    status: 'coming_soon'
  },
  {
    id: 'password-reset-flow',
    title: 'Password Reset Flow',
    category: 'Technical Reference',
    tags: ['password', 'reset', 'security'],
    description: 'Password reset flow and implementation',
    audience: 'admin',
    status: 'coming_soon'
  },

  // Strategy
  {
    id: 'seo-strategy',
    title: 'SEO Strategy',
    category: 'Strategy',
    tags: ['seo', 'marketing', 'optimization', 'strategy'],
    description: 'SEO optimization strategy and guidelines',
    audience: 'admin',
    status: 'coming_soon'
  },
];
