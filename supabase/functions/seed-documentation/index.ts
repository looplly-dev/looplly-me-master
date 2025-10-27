import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Documentation index mapping - Wave 1 (Published), Wave 2 & 3 (Coming Soon)
const documentationIndex = [
  // Wave 1 - Core Systems (Published)
  {
    id: 'country-codes',
    title: 'Country Code Specification',
    category: 'Core Systems',
    description: 'ISO country code standards and usage',
    audience: 'all',
    tags: ['country', 'codes', 'iso', 'localization'],
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
    title: 'Mobile Number Validation',
    category: 'Core Systems',
    description: 'Global mobile validation system supporting 193 countries using E.164 format',
    audience: 'all',
    tags: ['validation', 'mobile', 'international', 'e164'],
    path: '/docs/MOBILE_VALIDATION.md',
    status: 'published'
  },
  {
    id: 'profile-system',
    title: 'Profile System Architecture',
    category: 'Core Systems',
    description: 'Complete architecture for the user profile system',
    audience: 'all',
    tags: ['profile', 'architecture', 'database', 'schema'],
    path: '/docs/PROFILE_SYSTEM_ARCHITECTURE.md',
    status: 'published'
  },
  {
    id: 'reputation-system',
    title: 'Reputation Classification System',
    category: 'Core Systems',
    description: 'User reputation and classification system rules',
    audience: 'all',
    tags: ['reputation', 'classification', 'points', 'levels'],
    path: '/docs/REP_CLASSIFICATION_SYSTEM.md',
    status: 'published'
  },
  {
    id: 'streak-reputation',
    title: 'Streak & Reputation System',
    category: 'Core Systems',
    description: 'Daily streak tracking and reputation integration',
    audience: 'all',
    tags: ['streak', 'reputation', 'engagement', 'rewards'],
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
    category: 'Core Systems',
    description: 'Complete overview of the user profiling system',
    audience: 'all',
    tags: ['profiling', 'overview', 'architecture'],
    path: '/docs/PROFILING/README.md',
    status: 'coming_soon'
  },
  {
    id: 'profiling-user-guide',
    title: 'Profiling User Guide',
    category: 'Admin Guides',
    description: 'End-user guide for completing profiles',
    audience: 'all',
    tags: ['profiling', 'user-guide', 'how-to'],
    path: '/docs/PROFILING/USER_GUIDE.md',
    status: 'coming_soon'
  },
  {
    id: 'profiling-level-strategy',
    title: 'Level Strategy',
    category: 'Core Systems',
    description: 'User progression and level strategy',
    audience: 'admin',
    tags: ['profiling', 'levels', 'progression', 'strategy'],
    path: '/docs/PROFILING/LEVEL_STRATEGY.md',
    status: 'coming_soon'
  },
  {
    id: 'profiling-earning-rules',
    title: 'Profile Earning Rules',
    category: 'Core Systems',
    description: 'Earning rules for profile completion',
    audience: 'all',
    tags: ['profiling', 'earning', 'rewards', 'points'],
    path: '/docs/PROFILING/EARNING_RULES.md',
    status: 'coming_soon'
  },
  {
    id: 'profiling-global-vs-local',
    title: 'Global vs Local Brands',
    category: 'Strategy',
    description: 'Strategy for global vs local brand questions',
    audience: 'admin',
    tags: ['profiling', 'brands', 'global', 'local'],
    path: '/docs/PROFILING/GLOBAL_VS_LOCAL_BRANDS.md',
    status: 'coming_soon'
  },
  {
    id: 'profiling-auto-scaling',
    title: 'Auto-Scaling System',
    category: 'Technical Reference',
    description: 'Auto-scaling system for profile question delivery',
    audience: 'admin',
    tags: ['profiling', 'scaling', 'performance', 'optimization'],
    path: '/docs/PROFILING/AUTO_SCALING_SYSTEM.md',
    status: 'coming_soon'
  },
  {
    id: 'profiling-admin-guide',
    title: 'Profiling Admin Guide',
    category: 'Admin Guides',
    description: 'Admin guide for managing profiling questions',
    audience: 'admin',
    tags: ['profiling', 'admin', 'management', 'questions'],
    path: '/docs/PROFILING/ADMIN_GUIDE.md',
    status: 'coming_soon'
  },
  {
    id: 'profiling-question-builder',
    title: 'Question Builder Guide',
    category: 'Admin Guides',
    description: 'Guide to using the question builder interface',
    audience: 'admin',
    tags: ['profiling', 'questions', 'builder', 'tool'],
    path: '/docs/PROFILING/QUESTION_BUILDER_GUIDE.md',
    status: 'coming_soon'
  },
  {
    id: 'profiling-decay-system',
    title: 'Profile Decay System',
    category: 'Core Systems',
    description: 'Profile data decay and freshness system',
    audience: 'admin',
    tags: ['profiling', 'decay', 'freshness', 'updates'],
    path: '/docs/PROFILING/DECAY_SYSTEM.md',
    status: 'coming_soon'
  },
  {
    id: 'profiling-architecture',
    title: 'Profiling Architecture',
    category: 'Technical Reference',
    description: 'Technical architecture of the profiling system',
    audience: 'admin',
    tags: ['profiling', 'architecture', 'technical', 'database'],
    path: '/docs/PROFILING/ARCHITECTURE.md',
    status: 'coming_soon'
  },
  {
    id: 'profiling-integration',
    title: 'Profiling Integration Guide',
    category: 'Technical Reference',
    description: 'Technical integration guide for profiling system',
    audience: 'admin',
    tags: ['profiling', 'integration', 'api', 'technical'],
    path: '/docs/PROFILING/INTEGRATION_GUIDE.md',
    status: 'coming_soon'
  },
  {
    id: 'profiling-contextual-triggers',
    title: 'Contextual Triggers',
    category: 'Technical Reference',
    description: 'Contextual triggers for smart question delivery',
    audience: 'admin',
    tags: ['profiling', 'triggers', 'context', 'automation'],
    path: '/docs/PROFILING/CONTEXTUAL_TRIGGERS.md',
    status: 'coming_soon'
  },
  {
    id: 'profiling-country-questions',
    title: 'Country Question Management',
    category: 'Admin Guides',
    description: 'Managing country-specific profile questions',
    audience: 'admin',
    tags: ['profiling', 'country', 'localization', 'questions'],
    path: '/docs/PROFILING/COUNTRY_QUESTION_MANAGEMENT.md',
    status: 'coming_soon'
  },
  {
    id: 'profiling-ai-generation',
    title: 'AI Generation Prompts',
    category: 'Admin Guides',
    description: 'AI prompt templates for generating profile questions',
    audience: 'admin',
    tags: ['profiling', 'ai', 'generation', 'prompts'],
    path: '/docs/PROFILING/AI_GENERATION_PROMPTS.md',
    status: 'coming_soon'
  },
  {
    id: 'profiling-admin-auto-generation',
    title: 'Admin Auto-Generation Guide',
    category: 'Admin Guides',
    description: 'Guide for auto-generating profile questions with AI',
    audience: 'admin',
    tags: ['profiling', 'ai', 'auto-generation', 'admin'],
    path: '/docs/PROFILING/ADMIN_AUTO_GENERATION_GUIDE.md',
    status: 'coming_soon'
  },
  
  // Wave 3 - Admin & Technical (Coming Soon)
  {
    id: 'mobile-validation-global',
    title: 'Mobile Validation Documentation Guide',
    category: 'Core Systems',
    description: 'Guide for documenting mobile validation patterns for new countries (validation works globally)',
    audience: 'admin',
    tags: ['validation', 'mobile', 'documentation', 'patterns'],
    path: '/docs/MOBILE_VALIDATION_GLOBAL_EXPANSION.md',
    status: 'published'
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
    title: 'Role Architecture (Security-First Design)',
    category: 'Technical Reference',
    description: 'Security-first RBAC system with server-side role enforcement',
    audience: 'developer',
    tags: ['roles', 'security', 'architecture', 'rbac', 'rls'],
    path: '/docs/ROLE_ARCHITECTURE.md',
    status: 'published'
  },
  {
    id: 'role-security-migration',
    title: 'Role Security Migration Guide',
    category: 'Technical Reference',
    description: 'Migrate from insecure role storage to database-enforced role architecture',
    audience: 'developer',
    tags: ['security', 'roles', 'migration', 'rls', 'database'],
    path: '/docs/ROLE_SECURITY_MIGRATION.md',
    status: 'published'
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
    title: 'Supabase Configuration Management',
    category: 'Technical Reference',
    description: 'Backend configuration and management',
    audience: 'super_admin',
    tags: ['supabase', 'config', 'backend', 'database'],
    path: '/docs/SUPABASE_CONFIG_MANAGEMENT.md',
    status: 'coming_soon'
  }
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // CRITICAL SECURITY: Verify authentication and admin role
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create client with user's auth token to verify identity
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error('Authentication failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // CRITICAL: Verify user has admin role
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || !roleData || !['admin', 'super_admin'].includes(roleData.role)) {
      console.error('Admin verification failed for user:', user.id);
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required for documentation seeding' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Admin user ${user.id} authorized. Starting documentation seeding process...`);

    // Try to parse request body for alternate modes
    let inputDocs: any[] | null = null;
    let requestAction: string | null = null;
    try {
      const body = await req.json();
      if (Array.isArray(body?.docs)) inputDocs = body.docs;
      if (typeof body?.action === 'string') requestAction = body.action;
    } catch (_) {
      // No JSON body provided - continue with default behavior
    }

    // If the caller is asking for the index, return it so the frontend can fetch files client-side
    if (requestAction === 'get-index') {
      return new Response(
        JSON.stringify({ index: documentationIndex }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Use service role key for actual seeding operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // If docs were provided in the request body, upsert them directly (preferred - avoids filesystem access in edge runtime)
    if (inputDocs && inputDocs.length > 0) {
      for (const doc of inputDocs) {
        try {
          const { error: insertError } = await supabase
            .from('documentation')
            .upsert({
              id: doc.id,
              title: doc.title,
              content: doc.content ?? '',
              category: doc.category,
              tags: doc.tags,
              description: doc.description,
              audience: doc.audience,
              parent: doc.parent ?? null,
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

      console.log(`Seeding complete (client-provided): ${successCount} success, ${errorCount} errors`);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Seeded ${successCount} documents successfully`,
          errors,
          stats: { total: (inputDocs?.length ?? 0), success: successCount, failed: errorCount }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Fallback: attempt to read files from the repository (expected under web app public/docs). This may fail in hosted edge runtimes.
    for (const doc of documentationIndex) {
      try {
        // Read file content from public/docs path
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
