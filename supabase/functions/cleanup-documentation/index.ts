import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Authentication required'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Check if this is a trusted service call
    const isTrustedServiceCall = authHeader === `Bearer ${supabaseServiceKey}`;
    
    if (!isTrustedServiceCall) {
      // Verify user authentication & admin role
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });

      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      
      if (userError || !user) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid authentication'
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: roleData, error: roleError } = await supabaseClient
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'super_admin', 'tester'])
        .maybeSingle();

      if (roleError || !roleData) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Insufficient permissions'
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log('[cleanup-documentation] Starting cleanup process...');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Legacy "Coming Soon" document IDs to delete
    const legacyComingSoonIds = [
      'profiling-admin-auto-generation',
      'profiling-ai-generation',
      'profiling-auto-scaling',
      'profiling-contextual-triggers',
      'profiling-country-questions',
      'profiling-global-vs-local',
      'profiling-level-strategy',
      'profiling-decay-system',
      'profiling-earning-rules',
      'profiling-admin-guide',
      'profiling-architecture',
      'profiling-integration',
      'profiling-readme',
      'profiling-user-guide',
      'profiling-question-builder',
      'supabase-config',
      'warren-admin'
    ];

    // Uncategorized document IDs to delete
    const uncategorizedIds = [
      'profile-decay-system',
      'rep-classification-system',
      'user-guide'
    ];

    const allIdsToDelete = [...legacyComingSoonIds, ...uncategorizedIds];

    console.log(`[cleanup-documentation] Deleting ${allIdsToDelete.length} legacy documents...`);

    // Delete legacy documents
    const { error: deleteError, count } = await supabase
      .from('documentation')
      .delete({ count: 'exact' })
      .in('id', allIdsToDelete);

    if (deleteError) {
      console.error('[cleanup-documentation] Delete error:', deleteError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: deleteError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[cleanup-documentation] Deleted ${count} documents`);

    // Verify clean state
    const { data: comingSoonDocs, error: comingSoonError } = await supabase
      .from('documentation')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'coming_soon');

    const { data: uncategorizedDocs, error: uncategorizedError } = await supabase
      .from('documentation')
      .select('id', { count: 'exact', head: true })
      .eq('category', 'Uncategorized');

    if (comingSoonError || uncategorizedError) {
      console.error('[cleanup-documentation] Verification error:', comingSoonError || uncategorizedError);
    }

    const comingSoonCount = comingSoonDocs || 0;
    const uncategorizedCount = uncategorizedDocs || 0;

    console.log(`[cleanup-documentation] ✅ Cleanup complete. Remaining: ${comingSoonCount} coming_soon, ${uncategorizedCount} uncategorized`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully deleted ${count} legacy documents`,
        deletedCount: count,
        verification: {
          comingSoonRemaining: comingSoonCount,
          uncategorizedRemaining: uncategorizedCount
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Cleanup error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
