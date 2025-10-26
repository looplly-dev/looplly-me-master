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

    // Define test users with valid SA mobile numbers (10 digits after +27)
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
    let archived = 0;

    // Process test users - Idempotent seeder (update existing or create new)
    for (let i = 0; i < testUsers.length; i++) {
      const testUser = testUsers[i];
      // Valid SA mobile: 10 digits after +27 (e.g., +27823093950 to +27823093955)
      const mobileNumber = `+2782309395${i}`;

      console.log(`Processing ${testUser.firstName} ${testUser.lastName} (${mobileNumber})...`);

      try {
        // Hash password with bcrypt
        const passwordHash = await bcrypt.hash('Test123!');

        // Search for existing test user: first by email, then by name
        let existingProfile = null;
        
        // Try email first
        const { data: emailMatch } = await supabaseAdmin
          .from('profiles')
          .select('user_id, mobile, first_name, last_name')
          .eq('email', testUser.email)
          .eq('is_test_account', true)
          .maybeSingle();

        if (emailMatch) {
          existingProfile = emailMatch;
          console.log(`  Found by email: ${testUser.email}`);
        } else {
          // Try by name
          const { data: nameMatch } = await supabaseAdmin
            .from('profiles')
            .select('user_id, mobile, first_name, last_name')
            .eq('first_name', testUser.firstName)
            .eq('last_name', testUser.lastName)
            .eq('is_test_account', true)
            .maybeSingle();

          if (nameMatch) {
            existingProfile = nameMatch;
            console.log(`  Found by name: ${testUser.firstName} ${testUser.lastName}`);
          }
        }

        if (existingProfile) {
          // Update existing user with correct mobile and reset profile state
          const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ 
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
              level_2_complete: false,
              profile_complete: false
            })
            .eq('user_id', existingProfile.user_id);

          if (updateError) {
            console.error(`  Failed to update:`, updateError);
            errors.push({ user: testUser.firstName, error: updateError.message });
            failed++;
          } else {
            console.log(`  ✅ Updated existing profile`);
            results.push({
              name: `${testUser.firstName} ${testUser.lastName}`,
              mobile: mobileNumber,
              status: 'updated',
              user_id: existingProfile.user_id,
            });
            updated++;
          }
          continue;
        }

        // Create NEW user if not found
        const userId = crypto.randomUUID();
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
            level_2_complete: false,
            profile_complete: false,
            created_at: new Date().toISOString()
          });

        if (insertError) {
          console.error(`  Failed to create:`, insertError);
          errors.push({ user: testUser.firstName, error: insertError.message });
          failed++;
        } else {
          console.log(`  ✅ Created new profile`);
          results.push({ 
            name: `${testUser.firstName} ${testUser.lastName}`,
            mobile: mobileNumber, 
            status: 'created', 
            user_id: userId 
          });
          created++;
        }
      } catch (userError) {
        console.error(`  Error processing ${testUser.firstName}:`, userError);
        errors.push({ user: testUser.firstName, error: userError instanceof Error ? userError.message : 'Unknown error' });
        failed++;
      }
    }

    // Clean up duplicates: archive extra test accounts with same name
    console.log('\nCleaning up duplicate test accounts...');
    for (const testUser of testUsers) {
      try {
        const { data: duplicates } = await supabaseAdmin
          .from('profiles')
          .select('user_id, mobile, created_at')
          .eq('first_name', testUser.firstName)
          .eq('last_name', testUser.lastName)
          .eq('is_test_account', true)
          .order('created_at', { ascending: false });

        if (duplicates && duplicates.length > 1) {
          // Keep the first (most recent), archive the rest
          const toArchive = duplicates.slice(1);
          console.log(`  Found ${toArchive.length} duplicate(s) for ${testUser.firstName} ${testUser.lastName}`);
          
          for (const dup of toArchive) {
            const { error: archiveError } = await supabaseAdmin
              .from('profiles')
              .update({ is_test_account: false })
              .eq('user_id', dup.user_id);

            if (!archiveError) {
              console.log(`    Archived duplicate: ${dup.mobile}`);
              archived++;
            }
          }
        }
      } catch (cleanupError) {
        console.error(`  Error cleaning up duplicates for ${testUser.firstName}:`, cleanupError);
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
        archived,
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
