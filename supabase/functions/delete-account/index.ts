import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[delete-account] No authorization header');
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Create client with user's token to verify identity
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    );

    // Get the user from the token
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    
    if (userError || !user) {
      console.error('[delete-account] Failed to get user:', userError);
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    console.log('[delete-account] Deleting account for user:', userId);

    // Start deletion process
    // Strategy: Delete dependent data first, then profile, then auth user
    // Many tables have ON DELETE CASCADE to profiles, so deleting profile will cascade
    
    try {
      // Step 1: Delete tables that may not have proper cascade constraints
      console.log('[delete-account] Deleting dependent records...');
      
      // Delete user-specific data that might block profile deletion
      const tablesToCleanup = [
        'profile_answers',
        'address_components',
        'kyc_verifications',
        'user_streaks',
        'user_reputation',
        'user_balances',
        'user_badges',
        'earning_activities',
        'transactions',
        'cint_survey_sessions',
        'community_posts',
        'community_votes',
        'communication_preferences',
        'audit_logs'
      ];

      for (const table of tablesToCleanup) {
        try {
          await supabaseAdmin.from(table).delete().eq('user_id', userId);
          console.log(`[delete-account] Deleted from ${table}`);
        } catch (err) {
          // Log but continue - table might not exist or already be empty
          console.warn(`[delete-account] Could not delete from ${table}:`, err);
        }
      }

      // Step 2: Delete from profiles (this should cascade to remaining tables)
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (profileError) {
        console.error('[delete-account] Error deleting profile:', profileError);
        throw new Error(`Failed to delete profile: ${profileError.message}`);
      }

      console.log('[delete-account] Profile deleted successfully');

      // Step 3: Delete the user from auth.users (final cleanup)
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (authError) {
        console.error('[delete-account] Error deleting auth user:', authError);
        throw new Error(`Failed to delete authentication record: ${authError.message}`);
      }

      console.log('[delete-account] User deleted successfully from auth');
      
    } catch (error) {
      console.error('[delete-account] Deletion process error:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Account and all associated data have been permanently deleted' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[delete-account] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
