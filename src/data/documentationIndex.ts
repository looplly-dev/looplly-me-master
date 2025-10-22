export interface DocumentationItem {
  id: string;
  title: string;
  path: string;
  category: 'Core Systems' | 'Admin Guides' | 'Technical Reference' | 'Strategy';
  tags: string[];
  description: string;
  parent?: string;
  audience: 'all' | 'office_user' | 'admin' | 'super_admin';
}

export const documentationIndex: DocumentationItem[] = [
  // Core Systems
  {
    id: 'mobile-validation',
    title: 'Mobile Number Validation',
    path: '/docs/MOBILE_VALIDATION.md',
    category: 'Core Systems',
    tags: ['validation', 'mobile', 'international', 'e164'],
    description: 'Country-aware mobile validation system using E.164 format',
    audience: 'all'
  },
  {
    id: 'mobile-validation-global',
    title: 'Global Expansion Strategy',
    path: '/docs/MOBILE_VALIDATION_GLOBAL_EXPANSION.md',
    category: 'Core Systems',
    tags: ['validation', 'mobile', 'global', 'expansion', 'strategy'],
    description: 'Strategies for expanding mobile validation to global markets',
    parent: 'mobile-validation',
    audience: 'admin'
  },
  {
    id: 'profile-system',
    title: 'Profile System Architecture',
    path: '/docs/PROFILE_SYSTEM_ARCHITECTURE.md',
    category: 'Core Systems',
    tags: ['profile', 'architecture', 'database', 'schema'],
    description: 'Complete architecture for the user profile system',
    audience: 'all'
  },
  {
    id: 'reputation-system',
    title: 'Reputation Classification System',
    path: '/docs/REP_CLASSIFICATION_SYSTEM.md',
    category: 'Core Systems',
    tags: ['reputation', 'classification', 'points', 'levels'],
    description: 'User reputation and classification system rules',
    audience: 'all'
  },
  {
    id: 'reputation-beta-pitfalls',
    title: 'Reputation System Beta Pitfalls',
    path: '/docs/REPUTATION_BETA_PITFALLS.md',
    category: 'Core Systems',
    tags: ['reputation', 'beta', 'issues', 'lessons'],
    description: 'Lessons learned and pitfalls to avoid in reputation system',
    audience: 'admin'
  },
  {
    id: 'streak-reputation',
    title: 'Streak & Reputation System',
    path: '/docs/STREAK_REPUTATION_SYSTEM.md',
    category: 'Core Systems',
    tags: ['streak', 'reputation', 'engagement', 'rewards'],
    description: 'Daily streak tracking and reputation integration',
    audience: 'all'
  },
  {
    id: 'country-codes',
    title: 'Country Code Specification',
    path: '/docs/COUNTRY_CODE_SPECIFICATION.md',
    category: 'Core Systems',
    tags: ['country', 'codes', 'iso', 'localization'],
    description: 'ISO country code standards and usage',
    audience: 'all'
  },
  {
    id: 'data-isolation',
    title: 'Data Isolation Quick Reference',
    path: '/docs/DATA_ISOLATION_QUICK_REFERENCE.md',
    category: 'Technical Reference',
    tags: ['security', 'rls', 'isolation', 'multi-tenant'],
    description: 'Quick reference for data isolation and RLS policies',
    audience: 'admin'
  },

  // Admin Guides
  {
    id: 'user-type-management',
    title: 'User Type Management',
    path: '/docs/USER_TYPE_MANAGEMENT.md',
    category: 'Admin Guides',
    tags: ['user-types', 'office-user', 'looplly-user', 'b2b'],
    description: 'Managing office_user vs looplly_user classifications',
    audience: 'admin'
  },
  {
    id: 'role-architecture',
    title: 'Role Architecture',
    path: '/docs/ROLE_ARCHITECTURE.md',
    category: 'Technical Reference',
    tags: ['roles', 'permissions', 'security', 'rls'],
    description: 'Dual-table architecture for roles and user types',
    audience: 'super_admin'
  },
  {
    id: 'warren-admin-guide',
    title: 'Warren Admin Guide',
    path: '/docs/WARREN_ADMIN_GUIDE.md',
    category: 'Admin Guides',
    tags: ['admin', 'guide', 'operations', 'management'],
    description: 'Administrative guide for platform management',
    audience: 'admin'
  },
  {
    id: 'admin-setup',
    title: 'Admin Setup Instructions',
    path: '/ADMIN_SETUP_INSTRUCTIONS.md',
    category: 'Admin Guides',
    tags: ['setup', 'admin', 'installation', 'configuration'],
    description: 'Step-by-step admin setup and configuration',
    audience: 'super_admin'
  },
  {
    id: 'phase1-setup',
    title: 'Phase 1 Setup Instructions',
    path: '/PHASE1_SETUP_INSTRUCTIONS.md',
    category: 'Admin Guides',
    tags: ['setup', 'phase1', 'deployment', 'migration'],
    description: 'Phase 1 deployment and setup instructions',
    audience: 'super_admin'
  },

  // Profiling System
  {
    id: 'profiling-readme',
    title: 'Profiling System Overview',
    path: '/docs/PROFILING/README.md',
    category: 'Core Systems',
    tags: ['profiling', 'overview', 'architecture'],
    description: 'Complete overview of the user profiling system',
    audience: 'all'
  },
  {
    id: 'profiling-architecture',
    title: 'Profiling Architecture',
    path: '/docs/PROFILING/ARCHITECTURE.md',
    category: 'Technical Reference',
    tags: ['profiling', 'architecture', 'technical', 'database'],
    description: 'Technical architecture of the profiling system',
    audience: 'admin'
  },
  {
    id: 'profiling-user-guide',
    title: 'Profiling User Guide',
    path: '/docs/PROFILING/USER_GUIDE.md',
    category: 'Admin Guides',
    tags: ['profiling', 'user-guide', 'how-to'],
    description: 'End-user guide for completing profiles',
    audience: 'all'
  },
  {
    id: 'profiling-admin-guide',
    title: 'Profiling Admin Guide',
    path: '/docs/PROFILING/ADMIN_GUIDE.md',
    category: 'Admin Guides',
    tags: ['profiling', 'admin', 'management', 'questions'],
    description: 'Admin guide for managing profiling questions',
    audience: 'admin'
  },
  {
    id: 'profiling-question-builder',
    title: 'Question Builder Guide',
    path: '/docs/PROFILING/QUESTION_BUILDER_GUIDE.md',
    category: 'Admin Guides',
    tags: ['profiling', 'questions', 'builder', 'tool'],
    description: 'Guide to using the question builder interface',
    audience: 'admin'
  },
  {
    id: 'profiling-ai-generation',
    title: 'AI Generation Prompts',
    path: '/docs/PROFILING/AI_GENERATION_PROMPTS.md',
    category: 'Admin Guides',
    tags: ['profiling', 'ai', 'generation', 'prompts'],
    description: 'AI prompt templates for generating profile questions',
    audience: 'admin'
  },
  {
    id: 'profiling-admin-auto-generation',
    title: 'Admin Auto-Generation Guide',
    path: '/docs/PROFILING/ADMIN_AUTO_GENERATION_GUIDE.md',
    category: 'Admin Guides',
    tags: ['profiling', 'ai', 'auto-generation', 'admin'],
    description: 'Guide for auto-generating profile questions with AI',
    audience: 'admin'
  },
  {
    id: 'profiling-country-questions',
    title: 'Country Question Management',
    path: '/docs/PROFILING/COUNTRY_QUESTION_MANAGEMENT.md',
    category: 'Admin Guides',
    tags: ['profiling', 'country', 'localization', 'questions'],
    description: 'Managing country-specific profile questions',
    audience: 'admin'
  },
  {
    id: 'profiling-auto-scaling',
    title: 'Auto-Scaling System',
    path: '/docs/PROFILING/AUTO_SCALING_SYSTEM.md',
    category: 'Technical Reference',
    tags: ['profiling', 'scaling', 'performance', 'optimization'],
    description: 'Auto-scaling system for profile question delivery',
    audience: 'admin'
  },
  {
    id: 'profiling-decay-system',
    title: 'Profile Decay System',
    path: '/docs/PROFILING/DECAY_SYSTEM.md',
    category: 'Core Systems',
    tags: ['profiling', 'decay', 'freshness', 'updates'],
    description: 'Profile data decay and freshness system',
    audience: 'admin'
  },
  {
    id: 'profiling-earning-rules',
    title: 'Profile Earning Rules',
    path: '/docs/PROFILING/EARNING_RULES.md',
    category: 'Core Systems',
    tags: ['profiling', 'earning', 'rewards', 'points'],
    description: 'Earning rules for profile completion',
    audience: 'all'
  },
  {
    id: 'profiling-level-strategy',
    title: 'Level Strategy',
    path: '/docs/PROFILING/LEVEL_STRATEGY.md',
    category: 'Core Systems',
    tags: ['profiling', 'levels', 'progression', 'strategy'],
    description: 'User progression and level strategy',
    audience: 'admin'
  },
  {
    id: 'profiling-contextual-triggers',
    title: 'Contextual Triggers',
    path: '/docs/PROFILING/CONTEXTUAL_TRIGGERS.md',
    category: 'Technical Reference',
    tags: ['profiling', 'triggers', 'context', 'automation'],
    description: 'Contextual triggers for smart question delivery',
    audience: 'admin'
  },
  {
    id: 'profiling-global-vs-local',
    title: 'Global vs Local Brands',
    path: '/docs/PROFILING/GLOBAL_VS_LOCAL_BRANDS.md',
    category: 'Strategy',
    tags: ['profiling', 'brands', 'global', 'local'],
    description: 'Strategy for global vs local brand questions',
    audience: 'admin'
  },
  {
    id: 'profiling-integration',
    title: 'Profiling Integration Guide',
    path: '/docs/PROFILING/INTEGRATION_GUIDE.md',
    category: 'Technical Reference',
    tags: ['profiling', 'integration', 'api', 'technical'],
    description: 'Technical integration guide for profiling system',
    audience: 'admin'
  },
  {
    id: 'profiling-rollout',
    title: 'Rollout Checklist',
    path: '/docs/PROFILING/ROLLOUT_CHECKLIST.md',
    category: 'Admin Guides',
    tags: ['profiling', 'rollout', 'deployment', 'checklist'],
    description: 'Checklist for rolling out profiling features',
    audience: 'admin'
  },

  // Technical Reference
  {
    id: 'analytics',
    title: 'Analytics Documentation',
    path: '/docs/ANALYTICS.md',
    category: 'Technical Reference',
    tags: ['analytics', 'tracking', 'metrics', 'reporting'],
    description: 'Analytics system architecture and usage',
    audience: 'admin'
  },
  {
    id: 'deployment-config',
    title: 'Deployment Configuration',
    path: '/docs/DEPLOYMENT_CONFIG.md',
    category: 'Technical Reference',
    tags: ['deployment', 'config', 'environment', 'production'],
    description: 'Production deployment configuration guide',
    audience: 'super_admin'
  },
  {
    id: 'environment-setup',
    title: 'Environment Setup',
    path: '/docs/ENVIRONMENT_SETUP.md',
    category: 'Technical Reference',
    tags: ['environment', 'setup', 'configuration', 'dev'],
    description: 'Development environment setup guide',
    audience: 'admin'
  },
  {
    id: 'supabase-config',
    title: 'Supabase Configuration Management',
    path: '/docs/SUPABASE_CONFIG_MANAGEMENT.md',
    category: 'Technical Reference',
    tags: ['supabase', 'config', 'backend', 'database'],
    description: 'Backend configuration and management',
    audience: 'super_admin'
  },

  // Strategy
  {
    id: 'seo-strategy',
    title: 'SEO Strategy',
    path: '/SEO_STRATEGY.md',
    category: 'Strategy',
    tags: ['seo', 'marketing', 'optimization', 'strategy'],
    description: 'SEO optimization strategy and guidelines',
    audience: 'admin'
  },
];
