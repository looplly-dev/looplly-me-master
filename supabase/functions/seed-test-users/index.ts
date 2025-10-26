import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

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
    let created = 0;
    let updated = 0;
    let failed = 0;

    // Process test users - Create directly in profiles (NOT auth.users)
    for (let i = 0; i < testUsers.length; i++) {
      const testUser = testUsers[i];
      const mobileNumber = `+2782309395${i}`;
      const userId = crypto.randomUUID(); // Generate our own UUID

      console.log(`Processing ${testUser.firstName} (${mobileNumber})...`);

      try {
        // Hash password with bcrypt
        const passwordHash = await bcrypt.hash('Test123!');

        // Check if user already exists by mobile (NOT email)
        const { data: existingProfile } = await supabaseAdmin
          .from('profiles')
          .select('user_id, mobile')
          .eq('mobile', mobileNumber)
          .maybeSingle();

        if (existingProfile) {
          // Update password hash for existing test user
          const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ 
              password_hash: passwordHash,
              is_test_account: true,
              first_name: testUser.firstName,
              last_name: testUser.lastName,
              email: testUser.email // Keep for reference
            })
            .eq('user_id', existingProfile.user_id);

          if (updateError) {
            errors.push({ mobile: mobileNumber, error: updateError.message });
            failed++;
          } else {
            results.push({
              mobile: mobileNumber,
              status: 'updated',
              user_id: existingProfile.user_id,
            });
            updated++;
          }
          continue;
        }

        // Create NEW user directly in profiles (NOT auth.users)
        const { error: insertError } = await supabaseAdmin
          .from('profiles')
          .insert({
            user_id: userId,
            mobile: mobileNumber,
            country_code: '+27',
            password_hash: passwordHash,
            first_name: testUser.firstName,
            last_name: testUser.lastName,
            email: testUser.email,
            is_test_account: true,
            profile_level: 1,
            profile_completeness_score: 0,
            is_verified: false,
            created_at: new Date().toISOString()
          });

        if (insertError) {
          console.error(`Failed to create ${testUser.firstName}:`, insertError);
          errors.push({ mobile: mobileNumber, error: insertError.message });
          failed++;
        } else {
          results.push({ 
            mobile: mobileNumber, 
            status: 'created', 
            user_id: userId 
          });
          created++;
        }
      } catch (userError) {
        console.error(`Error processing ${testUser.firstName}:`, userError);
        errors.push({ mobile: mobileNumber, error: userError instanceof Error ? userError.message : 'Unknown error' });
        failed++;
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
        created,
        updated,
        already_correct: results.filter(r => r.status === 'already_correct').length,
        failed,
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
