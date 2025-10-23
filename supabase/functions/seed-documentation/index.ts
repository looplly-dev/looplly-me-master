import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Documentation index mapping
const documentationIndex = [
  {
    id: 'country-code-spec',
    title: 'Country Code Specification',
    category: 'Core Systems',
    description: 'Dual-column country identification system',
    audience: 'developer',
    tags: ['country', 'data-model', 'schema'],
    path: '/docs/COUNTRY_CODE_SPECIFICATION.md'
  },
  {
    id: 'data-isolation',
    title: 'Data Isolation Quick Reference',
    category: 'Core Systems',
    description: 'Ensuring data isolation by country',
    audience: 'developer',
    tags: ['country', 'data-isolation', 'queries'],
    path: '/docs/DATA_ISOLATION_QUICK_REFERENCE.md'
  },
  {
    id: 'environment-setup',
    title: 'Environment Setup',
    category: 'Development',
    description: 'Environment variable configuration guide',
    audience: 'developer',
    tags: ['setup', 'environment', 'configuration'],
    path: '/docs/ENVIRONMENT_SETUP.md'
  },
  {
    id: 'profiling-readme',
    title: 'Profiling System Overview',
    category: 'Profiling',
    description: 'Comprehensive profiling system documentation hub',
    audience: 'all',
    tags: ['profiling', 'overview', 'navigation'],
    path: '/docs/PROFILING/README.md'
  },
  {
    id: 'mobile-validation',
    title: 'Mobile Validation',
    category: 'Core Systems',
    description: 'Country-aware mobile number validation',
    audience: 'developer',
    tags: ['validation', 'mobile', 'country'],
    path: '/docs/MOBILE_VALIDATION.md'
  },
  {
    id: 'user-type-management',
    title: 'User Type Management',
    category: 'User Management',
    description: 'Office users vs Looplly users management',
    audience: 'admin',
    tags: ['user-types', 'management', 'admin'],
    path: '/docs/USER_TYPE_MANAGEMENT.md'
  },
  {
    id: 'profiling-user-guide',
    title: 'Profiling User Guide',
    category: 'Profiling',
    description: 'End-user guide to the profile system',
    audience: 'user',
    tags: ['profiling', 'user-guide', 'levels'],
    path: '/docs/PROFILING/USER_GUIDE.md'
  },
  {
    id: 'earning-rules',
    title: 'Earning Rules',
    category: 'Profiling',
    description: 'Hierarchical earning access requirements',
    audience: 'developer',
    tags: ['earning', 'rules', 'targeting'],
    path: '/docs/PROFILING/EARNING_RULES.md'
  },
  {
    id: 'role-architecture',
    title: 'Role Architecture',
    category: 'Security',
    description: 'Dual-table roles and user types system',
    audience: 'developer',
    tags: ['roles', 'security', 'architecture'],
    path: '/docs/ROLE_ARCHITECTURE.md'
  },
  {
    id: 'level-strategy',
    title: 'Progressive Profiling Strategy',
    category: 'Profiling',
    description: '3-level progressive profiling system',
    audience: 'strategy',
    tags: ['profiling', 'strategy', 'levels'],
    path: '/docs/PROFILING/LEVEL_STRATEGY.md'
  },
  {
    id: 'analytics',
    title: 'Analytics Implementation',
    category: 'Development',
    description: 'Google Analytics tracking guide',
    audience: 'developer',
    tags: ['analytics', 'tracking', 'gtag'],
    path: '/docs/ANALYTICS.md'
  },
  {
    id: 'global-local-brands',
    title: 'Global vs Local Brands',
    category: 'Profiling',
    description: 'Managing global and local brand options',
    audience: 'developer',
    tags: ['brands', 'country', 'options'],
    path: '/docs/PROFILING/GLOBAL_VS_LOCAL_BRANDS.md'
  },
  {
    id: 'auto-scaling',
    title: 'Auto-Scaling System',
    category: 'Profiling',
    description: 'AI-powered country option generation',
    audience: 'developer',
    tags: ['ai', 'automation', 'scaling'],
    path: '/docs/PROFILING/AUTO_SCALING_SYSTEM.md'
  },
  {
    id: 'admin-guide',
    title: 'Admin Guide',
    category: 'Profiling',
    description: 'Comprehensive admin portal guide',
    audience: 'admin',
    tags: ['admin', 'guide', 'management'],
    path: '/docs/PROFILING/ADMIN_GUIDE.md'
  },
  {
    id: 'question-builder',
    title: 'Question Builder Guide',
    category: 'Profiling',
    description: 'Creating and managing profile questions',
    audience: 'admin',
    tags: ['questions', 'builder', 'admin'],
    path: '/docs/PROFILING/QUESTION_BUILDER_GUIDE.md'
  },
  {
    id: 'decay-system',
    title: 'Data Decay System',
    category: 'Profiling',
    description: 'Profile data expiration and refresh',
    audience: 'developer',
    tags: ['decay', 'staleness', 'data-quality'],
    path: '/docs/PROFILING/DECAY_SYSTEM.md'
  },
  {
    id: 'architecture',
    title: 'Profiling Architecture',
    category: 'Profiling',
    description: 'Technical architecture and data flow',
    audience: 'developer',
    tags: ['architecture', 'technical', 'database'],
    path: '/docs/PROFILING/ARCHITECTURE.md'
  },
  {
    id: 'integration-guide',
    title: 'Integration Guide',
    category: 'Profiling',
    description: 'Integrating profiling into features',
    audience: 'developer',
    tags: ['integration', 'hooks', 'api'],
    path: '/docs/PROFILING/INTEGRATION_GUIDE.md'
  },
  {
    id: 'contextual-triggers',
    title: 'Contextual Triggers',
    category: 'Profiling',
    description: 'Smart question triggering system',
    audience: 'developer',
    tags: ['triggers', 'context', 'ux'],
    path: '/docs/PROFILING/CONTEXTUAL_TRIGGERS.md'
  },
  {
    id: 'country-question-management',
    title: 'Country Question Management',
    category: 'Profiling',
    description: 'Managing country-specific options',
    audience: 'admin',
    tags: ['country', 'options', 'admin'],
    path: '/docs/PROFILING/COUNTRY_QUESTION_MANAGEMENT.md'
  },
  {
    id: 'ai-generation-prompts',
    title: 'AI Generation Prompts',
    category: 'Profiling',
    description: 'AI prompts for generating country options',
    audience: 'developer',
    tags: ['ai', 'prompts', 'generation'],
    path: '/docs/PROFILING/AI_GENERATION_PROMPTS.md'
  },
  {
    id: 'admin-auto-generation',
    title: 'Admin Auto-Generation Guide',
    category: 'Profiling',
    description: 'Using AI auto-generation in admin portal',
    audience: 'admin',
    tags: ['ai', 'admin', 'automation'],
    path: '/docs/PROFILING/ADMIN_AUTO_GENERATION_GUIDE.md'
  },
  {
    id: 'rollout-checklist',
    title: 'Rollout Checklist',
    category: 'Profiling',
    description: 'Launch checklist for profiling system',
    audience: 'strategy',
    tags: ['rollout', 'checklist', 'launch'],
    path: '/docs/PROFILING/ROLLOUT_CHECKLIST.md'
  },
  {
    id: 'mobile-validation-global',
    title: 'Mobile Validation Global Expansion',
    category: 'Core Systems',
    description: 'Expanding mobile validation to new countries',
    audience: 'developer',
    tags: ['mobile', 'validation', 'expansion'],
    path: '/docs/MOBILE_VALIDATION_GLOBAL_EXPANSION.md'
  },
  {
    id: 'profile-system-architecture',
    title: 'Profile System Architecture',
    category: 'Core Systems',
    description: 'Complete profile system architecture',
    audience: 'developer',
    tags: ['architecture', 'profile', 'system'],
    path: '/docs/PROFILE_SYSTEM_ARCHITECTURE.md'
  },
  {
    id: 'deployment-config',
    title: 'Deployment Configuration',
    category: 'Development',
    description: 'Deployment configuration guide',
    audience: 'developer',
    tags: ['deployment', 'config', 'production'],
    path: '/docs/DEPLOYMENT_CONFIG.md'
  },
  {
    id: 'reputation-beta-pitfalls',
    title: 'Reputation Beta Pitfalls',
    category: 'Reputation',
    description: 'Common pitfalls in reputation system',
    audience: 'developer',
    tags: ['reputation', 'beta', 'pitfalls'],
    path: '/docs/REPUTATION_BETA_PITFALLS.md'
  },
  {
    id: 'rep-classification',
    title: 'Reputation Classification System',
    category: 'Reputation',
    description: 'User reputation classification',
    audience: 'developer',
    tags: ['reputation', 'classification', 'tiers'],
    path: '/docs/REP_CLASSIFICATION_SYSTEM.md'
  },
  {
    id: 'streak-reputation',
    title: 'Streak & Reputation System',
    category: 'Reputation',
    description: 'Integrated streak and reputation system',
    audience: 'developer',
    tags: ['streak', 'reputation', 'gamification'],
    path: '/docs/STREAK_REPUTATION_SYSTEM.md'
  },
  {
    id: 'supabase-config',
    title: 'Supabase Config Management',
    category: 'Development',
    description: 'Managing Supabase configuration',
    audience: 'developer',
    tags: ['supabase', 'config', 'backend'],
    path: '/docs/SUPABASE_CONFIG_MANAGEMENT.md'
  },
  {
    id: 'warren-admin',
    title: 'Warren Admin Guide',
    category: 'Admin',
    description: 'Admin guide for Warren',
    audience: 'admin',
    tags: ['warren', 'admin', 'guide'],
    path: '/docs/WARREN_ADMIN_GUIDE.md'
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
            parent: null
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
