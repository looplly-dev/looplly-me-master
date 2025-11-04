import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  email?: string;
  user_id?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify caller is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !caller) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify caller is super_admin
    const { data: roles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id);

    const isSuperAdmin = roles?.some(r => r.role === 'super_admin');
    if (!isSuperAdmin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: super_admin role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: RequestBody = await req.json();
    const { email, user_id } = body;

    if (!email && !user_id) {
      return new Response(
        JSON.stringify({ error: 'Either email or user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find team profile
    let query = supabaseAdmin.from('team_profiles').select('user_id, email');
    if (email) {
      query = query.eq('email', email);
    } else if (user_id) {
      query = query.eq('user_id', user_id);
    }

    const { data: teamProfile, error: profileError } = await query.maybeSingle();

    if (profileError) {
      console.error('Error fetching team profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch team profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!teamProfile) {
      return new Response(
        JSON.stringify({ error: 'Team profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Ensure team_members row exists and is active
    const { error: upsertError } = await supabaseAdmin
      .from('team_members')
      .upsert(
        {
          user_id: teamProfile.user_id,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        }
      );

    if (upsertError) {
      console.error('Error upserting team_members:', upsertError);
      return new Response(
        JSON.stringify({ error: 'Failed to ensure team membership' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log audit event
    await supabaseAdmin.from('audit_logs').insert({
      user_id: caller.id,
      action: 'ensure_team_member',
      resource_type: 'team_member',
      resource_id: teamProfile.user_id,
      metadata: {
        target_email: teamProfile.email,
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`Team membership ensured for user: ${teamProfile.email}`);

    return new Response(
      JSON.stringify({
        success: true,
        user_id: teamProfile.user_id,
        email: teamProfile.email,
        message: 'Team membership verified and activated',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
