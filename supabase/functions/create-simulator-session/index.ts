import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateSimulatorSessionRequest {
  test_user_id: string;
  stage: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if caller is team member with tester role
    const { data: callerProfile } = await supabaseAdmin
      .from('profiles')
      .select('user_type')
      .eq('user_id', user.id)
      .single();

    if (callerProfile?.user_type !== 'looplly_team_user') {
      throw new Error('Only team members can create simulator sessions');
    }

    const { data: callerRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!['super_admin', 'admin', 'tester'].includes(callerRole?.role)) {
      throw new Error('Insufficient permissions. Requires tester role or higher');
    }

    const { test_user_id, stage }: CreateSimulatorSessionRequest = await req.json();

    // Verify target is a test account
    const { data: testUser } = await supabaseAdmin
      .from('profiles')
      .select('is_test_account, email, first_name, last_name')
      .eq('user_id', test_user_id)
      .single();

    if (!testUser?.is_test_account) {
      throw new Error('Target user is not a test account. Only test accounts can be used in simulator');
    }

    // Reset user to the selected stage
    const { data: resetResult, error: resetError } = await supabaseAdmin
      .rpc('reset_user_journey', {
        p_target_user_id: test_user_id,
        p_stage: stage
      });

    if (resetError) {
      console.error('Reset error:', resetError);
      throw new Error(`Failed to reset user journey: ${resetError.message}`);
    }

    // Generate temporary auth link for the test user
    const { data: authData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: testUser.email,
      options: {
        redirectTo: `${req.headers.get('origin')}/simulator-session?stage=${stage}`
      }
    });

    if (linkError || !authData.properties) {
      console.error('Link generation error:', linkError);
      throw new Error('Failed to generate simulator session');
    }

    // Extract session token from the action link
    const actionLink = authData.properties.action_link;
    const urlParams = new URLSearchParams(actionLink.split('#')[1]);
    const sessionToken = urlParams.get('access_token');

    if (!sessionToken) {
      throw new Error('Failed to extract session token');
    }

    // Log simulator session creation
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'simulator_session_created',
        metadata: {
          test_user_id,
          test_user_email: testUser.email,
          stage,
          timestamp: new Date().toISOString()
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        session_token: sessionToken,
        test_user: {
          id: test_user_id,
          email: testUser.email,
          name: `${testUser.first_name} ${testUser.last_name}`.trim()
        },
        stage_info: resetResult,
        expires_in: 3600
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
