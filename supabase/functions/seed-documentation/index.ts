import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Documentation index mapping - Wave 1 (Published), Wave 2 & 3 (Coming Soon)
const documentationIndex = [
  // Wave 1 - Core Systems (Published)
  {
    id: 'country-code-spec',
    title: 'Country Code Specification',
    category: 'Core Systems',
    description: 'Dual-column country identification system',
    audience: 'developer',
    tags: ['country', 'data-model', 'schema'],
    path: '/docs/COUNTRY_CODE_SPECIFICATION.md',
    status: 'published'
  },
  {
    id: 'data-isolation',
    title: 'Data Isolation Quick Reference',
    category: 'Core Systems',
    description: 'Ensuring data isolation by country',
    audience: 'developer',
    tags: ['country', 'data-isolation', 'queries'],
    path: '/docs/DATA_ISOLATION_QUICK_REFERENCE.md',
    status: 'published'
  },
  {
    id: 'mobile-validation',
    title: 'Mobile Validation',
    category: 'Core Systems',
    description: 'Country-aware mobile number validation',
    audience: 'developer',
    tags: ['validation', 'mobile', 'country'],
    path: '/docs/MOBILE_VALIDATION.md',
    status: 'published'
  },
  {
    id: 'profile-system-architecture',
    title: 'Profile System Architecture',
    category: 'Core Systems',
    description: 'Complete profile system architecture',
    audience: 'developer',
    tags: ['architecture', 'profile', 'system'],
    path: '/docs/PROFILE_SYSTEM_ARCHITECTURE.md',
    status: 'published'
  },
  {
    id: 'rep-classification',
    title: 'Reputation Classification System',
    category: 'Strategy',
    description: 'User reputation classification',
    audience: 'developer',
    tags: ['reputation', 'classification', 'tiers'],
    path: '/docs/REP_CLASSIFICATION_SYSTEM.md',
    status: 'published'
  },
  {
    id: 'streak-reputation',
    title: 'Streak & Reputation System',
    category: 'Strategy',
    description: 'Integrated streak and reputation system',
    audience: 'developer',
    tags: ['streak', 'reputation', 'gamification'],
    path: '/docs/STREAK_REPUTATION_SYSTEM.md',
    status: 'published'
  },
  {
    id: 'knowledge-centre',
    title: 'Knowledge Centre Guide',
    category: 'Admin Guides',
    description: 'Complete guide to using the Knowledge Centre',
    audience: 'all',
    tags: ['documentation', 'knowledge', 'search', 'version-control'],
    path: '/docs/KNOWLEDGE_CENTRE.md',
    status: 'published'
  },
  
  // Wave 2 - Profiling System (Coming Soon)
  {
    id: 'profiling-readme',
    title: 'Profiling System Overview',
    category: 'Profiling',
    description: 'Comprehensive profiling system documentation hub',
    audience: 'all',
    tags: ['profiling', 'overview', 'navigation'],
    path: '/docs/PROFILING/README.md',
    status: 'coming_soon'
  },
  {
    id: 'profiling-user-guide',
    title: 'Profiling User Guide',
    category: 'Profiling',
    description: 'End-user guide to the profile system',
    audience: 'user',
    tags: ['profiling', 'user-guide', 'levels'],
    path: '/docs/PROFILING/USER_GUIDE.md',
    status: 'coming_soon'
  },
  {
    id: 'level-strategy',
    title: 'Progressive Profiling Strategy',
    category: 'Profiling',
    description: '3-level progressive profiling system',
    audience: 'strategy',
    tags: ['profiling', 'strategy', 'levels'],
    path: '/docs/PROFILING/LEVEL_STRATEGY.md',
    status: 'coming_soon'
  },
  {
    id: 'earning-rules',
    title: 'Earning Rules',
    category: 'Profiling',
    description: 'Hierarchical earning access requirements',
    audience: 'developer',
    tags: ['earning', 'rules', 'targeting'],
    path: '/docs/PROFILING/EARNING_RULES.md',
    status: 'coming_soon'
  },
  {
    id: 'global-local-brands',
    title: 'Global vs Local Brands',
    category: 'Profiling',
    description: 'Managing global and local brand options',
    audience: 'developer',
    tags: ['brands', 'country', 'options'],
    path: '/docs/PROFILING/GLOBAL_VS_LOCAL_BRANDS.md',
    status: 'coming_soon'
  },
  {
    id: 'auto-scaling',
    title: 'Auto-Scaling System',
    category: 'Profiling',
    description: 'AI-powered country option generation',
    audience: 'developer',
    tags: ['ai', 'automation', 'scaling'],
    path: '/docs/PROFILING/AUTO_SCALING_SYSTEM.md',
    status: 'coming_soon'
  },
  {
    id: 'admin-guide',
    title: 'Admin Guide',
    category: 'Profiling',
    description: 'Comprehensive admin portal guide',
    audience: 'admin',
    tags: ['admin', 'guide', 'management'],
    path: '/docs/PROFILING/ADMIN_GUIDE.md',
    status: 'coming_soon'
  },
  {
    id: 'question-builder',
    title: 'Question Builder Guide',
    category: 'Profiling',
    description: 'Creating and managing profile questions',
    audience: 'admin',
    tags: ['questions', 'builder', 'admin'],
    path: '/docs/PROFILING/QUESTION_BUILDER_GUIDE.md',
    status: 'coming_soon'
  },
  {
    id: 'decay-system',
    title: 'Data Decay System',
    category: 'Profiling',
    description: 'Profile data expiration and refresh',
    audience: 'developer',
    tags: ['decay', 'staleness', 'data-quality'],
    path: '/docs/PROFILING/DECAY_SYSTEM.md',
    status: 'coming_soon'
  },
  {
    id: 'architecture',
    title: 'Profiling Architecture',
    category: 'Profiling',
    description: 'Technical architecture and data flow',
    audience: 'developer',
    tags: ['architecture', 'technical', 'database'],
    path: '/docs/PROFILING/ARCHITECTURE.md',
    status: 'coming_soon'
  },
  {
    id: 'integration-guide',
    title: 'Integration Guide',
    category: 'Profiling',
    description: 'Integrating profiling into features',
    audience: 'developer',
    tags: ['integration', 'hooks', 'api'],
    path: '/docs/PROFILING/INTEGRATION_GUIDE.md',
    status: 'coming_soon'
  },
  {
    id: 'contextual-triggers',
    title: 'Contextual Triggers',
    category: 'Profiling',
    description: 'Smart question triggering system',
    audience: 'developer',
    tags: ['triggers', 'context', 'ux'],
    path: '/docs/PROFILING/CONTEXTUAL_TRIGGERS.md',
    status: 'coming_soon'
  },
  {
    id: 'country-question-management',
    title: 'Country Question Management',
    category: 'Profiling',
    description: 'Managing country-specific options',
    audience: 'admin',
    tags: ['country', 'options', 'admin'],
    path: '/docs/PROFILING/COUNTRY_QUESTION_MANAGEMENT.md',
    status: 'coming_soon'
  },
  {
    id: 'ai-generation-prompts',
    title: 'AI Generation Prompts',
    category: 'Profiling',
    description: 'AI prompts for generating country options',
    audience: 'developer',
    tags: ['ai', 'prompts', 'generation'],
    path: '/docs/PROFILING/AI_GENERATION_PROMPTS.md',
    status: 'coming_soon'
  },
  {
    id: 'admin-auto-generation',
    title: 'Admin Auto-Generation Guide',
    category: 'Profiling',
    description: 'Using AI auto-generation in admin portal',
    audience: 'admin',
    tags: ['ai', 'admin', 'automation'],
    path: '/docs/PROFILING/ADMIN_AUTO_GENERATION_GUIDE.md',
    status: 'coming_soon'
  },
  
  // Wave 3 - Admin & Technical (Coming Soon)
  {
    id: 'mobile-validation-global',
    title: 'Mobile Validation Global Expansion',
    category: 'Core Systems',
    description: 'Expanding mobile validation to new countries',
    audience: 'developer',
    tags: ['mobile', 'validation', 'expansion'],
    path: '/docs/MOBILE_VALIDATION_GLOBAL_EXPANSION.md',
    status: 'coming_soon'
  },
  {
    id: 'user-type-management',
    title: 'User Type Management',
    category: 'Admin Guides',
    description: 'Office users vs Looplly users management',
    audience: 'admin',
    tags: ['user-types', 'management', 'admin'],
    path: '/docs/USER_TYPE_MANAGEMENT.md',
    status: 'coming_soon'
  },
  {
    id: 'warren-admin',
    title: 'Warren Admin Guide',
    category: 'Admin Guides',
    description: 'Admin guide for Warren',
    audience: 'admin',
    tags: ['warren', 'admin', 'guide'],
    path: '/docs/WARREN_ADMIN_GUIDE.md',
    status: 'coming_soon'
  },
  {
    id: 'admin-portal-guide',
    title: 'Admin Portal Guide',
    category: 'Admin Guides',
    description: 'Complete guide to the Admin Portal features and sections',
    audience: 'admin',
    tags: ['admin', 'portal', 'guide', 'management'],
    path: '/docs/ADMIN_PORTAL_GUIDE.md',
    status: 'coming_soon'
  },
  {
    id: 'account-management',
    title: 'Account Management',
    category: 'Admin Guides',
    description: 'Managing user and team member accounts',
    audience: 'admin',
    tags: ['accounts', 'deletion', 'team-management'],
    path: '/docs/ACCOUNT_MANAGEMENT.md',
    status: 'coming_soon'
  },
  {
    id: 'role-architecture',
    title: 'Role Architecture',
    category: 'Technical Reference',
    description: 'Dual-table roles and user types system',
    audience: 'developer',
    tags: ['roles', 'security', 'architecture'],
    path: '/docs/ROLE_ARCHITECTURE.md',
    status: 'coming_soon'
  },
  {
    id: 'table-architecture',
    title: 'Table Architecture',
    category: 'Technical Reference',
    description: 'Database table architecture and separation',
    audience: 'developer',
    tags: ['database', 'architecture', 'tables'],
    path: '/docs/TABLE_ARCHITECTURE.md',
    status: 'coming_soon'
  },
  {
    id: 'user-classification',
    title: 'User Classification',
    category: 'Technical Reference',
    description: 'User type classification and management',
    audience: 'developer',
    tags: ['users', 'classification', 'types'],
    path: '/docs/USER_CLASSIFICATION.md',
    status: 'coming_soon'
  },
  {
    id: 'documentation-version-control',
    title: 'Documentation Version Control',
    category: 'Technical Reference',
    description: 'Version control system for documentation',
    audience: 'admin',
    tags: ['version-control', 'documentation', 'history'],
    path: '/docs/DOCUMENTATION_VERSION_CONTROL.md',
    status: 'coming_soon'
  },
  {
    id: 'password-reset-flow',
    title: 'Password Reset Flow',
    category: 'Technical Reference',
    description: 'Password reset flow and implementation',
    audience: 'developer',
    tags: ['password', 'reset', 'security'],
    path: '/docs/PASSWORD_RESET_FLOW.md',
    status: 'coming_soon'
  },
  {
    id: 'environment-setup',
    title: 'Environment Setup',
    category: 'Technical Reference',
    description: 'Environment variable configuration guide',
    audience: 'developer',
    tags: ['setup', 'environment', 'configuration'],
    path: '/docs/ENVIRONMENT_SETUP.md',
    status: 'coming_soon'
  },
  {
    id: 'analytics',
    title: 'Analytics Implementation',
    category: 'Technical Reference',
    description: 'Google Analytics tracking guide',
    audience: 'developer',
    tags: ['analytics', 'tracking', 'gtag'],
    path: '/docs/ANALYTICS.md',
    status: 'coming_soon'
  },
  {
    id: 'integrations-setup',
    title: 'Integrations Setup',
    category: 'Technical Reference',
    description: 'Setting up external integrations',
    audience: 'developer',
    tags: ['integrations', 'setup', 'configuration'],
    path: '/docs/INTEGRATIONS_SETUP.md',
    status: 'coming_soon'
  },
  {
    id: 'deployment-config',
    title: 'Deployment Configuration',
    category: 'Technical Reference',
    description: 'Deployment configuration guide',
    audience: 'developer',
    tags: ['deployment', 'config', 'production'],
    path: '/docs/DEPLOYMENT_CONFIG.md',
    status: 'coming_soon'
  },
  {
    id: 'supabase-config',
    title: 'Backend Config Management',
    category: 'Technical Reference',
    description: 'Managing backend configuration',
    audience: 'developer',
    tags: ['backend', 'config', 'management'],
    path: '/docs/SUPABASE_CONFIG_MANAGEMENT.md',
    status: 'coming_soon'
  }
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting documentation seeding process...');

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const doc of documentationIndex) {
      try {
        // Read file content
        const filePath = `./public${doc.path}`;
        let content = '';
        
        try {
          content = await Deno.readTextFile(filePath);
        } catch (fileError) {
          console.error(`Failed to read file ${filePath}:`, fileError);
          errors.push(`File not found: ${doc.path}`);
          errorCount++;
          continue;
        }

        // Insert into database
        const { error: insertError } = await supabase
          .from('documentation')
          .upsert({
            id: doc.id,
            title: doc.title,
            content: content,
            category: doc.category,
            tags: doc.tags,
            description: doc.description,
            audience: doc.audience,
            parent: null,
            status: doc.status || 'draft'
          }, {
            onConflict: 'id'
          });

        if (insertError) {
          console.error(`Failed to insert ${doc.id}:`, insertError);
          errors.push(`Insert failed for ${doc.id}: ${insertError.message}`);
          errorCount++;
        } else {
          console.log(`✓ Seeded: ${doc.title}`);
          successCount++;
        }
      } catch (error) {
        console.error(`Error processing ${doc.id}:`, error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(`Processing error for ${doc.id}: ${errorMessage}`);
        errorCount++;
      }
    }

    console.log(`Seeding complete: ${successCount} success, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Seeded ${successCount} documents successfully`,
        errors: errors,
        stats: {
          total: documentationIndex.length,
          success: successCount,
          failed: errorCount
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Seeding error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
