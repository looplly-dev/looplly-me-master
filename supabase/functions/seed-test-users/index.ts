import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
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

    // Verify caller is admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    const { data: roles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roles || !['admin', 'super_admin'].includes(roles.role)) {
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Define test users
    const testUsers = [
      { email: 'test1@looplly-testing.internal', firstName: 'Alex', lastName: 'Johnson' },
      { email: 'test2@looplly-testing.internal', firstName: 'Morgan', lastName: 'Smith' },
      { email: 'test3@looplly-testing.internal', firstName: 'Jordan', lastName: 'Williams' },
      { email: 'test4@looplly-testing.internal', firstName: 'Casey', lastName: 'Brown' },
      { email: 'test5@looplly-testing.internal', firstName: 'Riley', lastName: 'Davis' },
      { email: 'test6@looplly-testing.internal', firstName: 'Skylar', lastName: 'Martinez' },
    ];

    const results = [];
    const errors = [];

    for (let i = 0; i < testUsers.length; i++) {
      const testUser = testUsers[i];
      const mobileNumber = `+274129900${(i + 1).toString().padStart(1, '0')}`;
      
      // Check if user already exists by email
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('user_id')
        .eq('email', testUser.email)
        .maybeSingle();

      if (existingProfile) {
        results.push({ email: testUser.email, status: 'already_exists', user_id: existingProfile.user_id });
        continue;
      }

      // Check if mobile number already exists
      const { data: existingMobile } = await supabaseAdmin
        .from('profiles')
        .select('user_id, email')
        .eq('mobile', mobileNumber)
        .maybeSingle();

      if (existingMobile) {
        results.push({ 
          email: testUser.email, 
          status: 'mobile_conflict', 
          user_id: existingMobile.user_id,
          conflicting_email: existingMobile.email
        });
        continue;
      }

      // Create user in auth.users
      const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: testUser.email,
        email_confirm: true,
        user_metadata: {
          first_name: testUser.firstName,
          last_name: testUser.lastName,
          mobile: mobileNumber,
          country_code: '+27',
        },
      });

      if (createError) {
        console.error(`Failed to create ${testUser.email}:`, createError);
        errors.push({ email: testUser.email, error: createError.message });
        continue;
      }

      // Update profile to mark as test account
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ is_test_account: true })
        .eq('user_id', authUser.user.id);

      if (updateError) {
        console.error(`Failed to mark ${testUser.email} as test:`, updateError);
        errors.push({ email: testUser.email, error: 'Created but failed to mark as test' });
      } else {
        results.push({ email: testUser.email, status: 'created', user_id: authUser.user.id });
      }
    }

    // Log the seeding
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'seed_test_users',
        metadata: { results, errors, timestamp: new Date().toISOString() },
      });

    return new Response(
      JSON.stringify({
        success: true,
        created: results.filter(r => r.status === 'created').length,
        existing: results.filter(r => r.status === 'already_exists').length,
        failed: errors.length,
        results,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Seed test users error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
