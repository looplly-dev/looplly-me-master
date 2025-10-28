import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { create } from 'https://deno.land/x/djwt@v2.8/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-simulator-session',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    // Check if caller is a team member using the is_team_member RPC
    console.log('[create-simulator-session] Verifying team membership for:', user.id);

    const { data: isTeam, error: teamErr } = await supabaseAdmin
      .rpc('is_team_member', { _user_id: user.id });

    if (teamErr) {
      console.error('[create-simulator-session] Team membership check failed:', teamErr);
      throw new Error('Failed to verify team membership');
    }

    console.log('[create-simulator-session] Is team member:', isTeam);

    if (!isTeam) {
      throw new Error('Only team members can create simulator sessions');
    }

    console.log('[create-simulator-session] Checking role permissions...');

    const { data: callerRole, error: roleErr } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleErr) {
      console.error('[create-simulator-session] Role check failed:', roleErr);
    }

    const role = callerRole?.role ?? 'user';
    console.log('[create-simulator-session] User role:', role);

    if (!['super_admin', 'admin', 'tester'].includes(role)) {
      throw new Error('Insufficient permissions. Requires tester role or higher');
    }

    const { test_user_id, stage }: CreateSimulatorSessionRequest = await req.json();
    console.log('[create-simulator-session] Request:', { test_user_id, stage });

    // Verify target is a test account
    const { data: testUser } = await supabaseAdmin
      .from('profiles')
      .select('is_test_account, email, mobile, first_name, last_name')
      .eq('user_id', test_user_id)
      .single();

    console.log('[create-simulator-session] Selected test user:', {
      user_id: test_user_id,
      name: `${testUser?.first_name} ${testUser?.last_name}`,
      mobile: testUser?.mobile,
      email: testUser?.email
    });

    if (!testUser?.is_test_account) {
      throw new Error('Target user is not a test account. Only test accounts can be used in simulator');
    }

    // Reset user to the selected stage
    const { data: resetResult, error: resetError } = await supabaseAdmin
      .rpc('reset_user_journey', {
        p_caller_user_id: user.id,
        p_target_user_id: test_user_id,
        p_stage: stage
      });

    if (resetError) {
      console.error('Reset error:', resetError);
      throw new Error(`Failed to reset user journey: ${resetError.message}`);
    }

    console.log('[create-simulator-session] Reset result:', resetResult);

    // Extract show_ui flag if present
    const showUI = resetResult?.show_ui || null;

    // Create a session using custom JWT for test user
    console.log('[create-simulator-session] Generating custom JWT for test user...');

    // Fetch test user profile AFTER reset (to get post-reset data)
    const { data: testUserProfile } = await supabaseAdmin
      .from('profiles')
      .select('user_id, mobile, first_name, last_name, is_verified, profile_complete')
      .eq('user_id', test_user_id)
      .single();

    if (!testUserProfile) {
      throw new Error('Test user profile not found');
    }

    console.log('[create-simulator-session] Post-reset profile:', {
      user_id: testUserProfile.user_id,
      mobile: testUserProfile.mobile,
      name: `${testUserProfile.first_name} ${testUserProfile.last_name}`,
      is_verified: testUserProfile.is_verified,
      profile_complete: testUserProfile.profile_complete
    });

    // Generate custom JWT token (same as login flow)
    const JWT_SECRET = Deno.env.get('LOOPLLY_JWT_SECRET') || 'dev-secret-change-in-production';
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const payload = {
      sub: testUserProfile.user_id,
      mobile: testUserProfile.mobile,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour for simulator
      user_type: 'looplly_user',
      is_simulator: true // Mark as simulator session
    };

    const customToken = await create({ alg: 'HS256', typ: 'JWT' }, payload, key);

    console.log('Custom JWT created successfully for test user');

    const sessionObject = {
      custom_token: customToken, // NEW: Return custom JWT instead of Supabase tokens
      show_ui: showUI // Pass show_ui flag from reset_user_journey
    };

    console.log('Session created successfully for test user');

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
        session: sessionObject,
        test_user: {
          id: test_user_id,
          email: testUser.email,
          mobile: testUser.mobile,
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
