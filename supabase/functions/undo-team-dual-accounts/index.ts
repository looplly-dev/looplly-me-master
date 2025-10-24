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

    const results = [];
    const errors = [];

    // Get all 4 accounts to delete
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    
    const emailsToDelete = [
      'nadia@looplly.me',
      'warren@looplly.me',
      'nadia.gaspari1@outlook.com',
      'warrenleroux@gmail.com'
    ];

    // Delete all 4 accounts
    for (const email of emailsToDelete) {
      const userToDelete = existingUsers?.users.find(u => u.email === email);
      
      if (userToDelete) {
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
          userToDelete.id
        );

        if (deleteError) {
          errors.push({ email, action: 'delete', error: deleteError.message });
        } else {
          results.push({ email, action: 'deleted' });
        }
      }
    }

    // Now restore the original 2 accounts
    const originalAccounts = [
      {
        email: 'nadia@looplly.me',
        firstName: 'Nadia',
        lastName: 'Gaspari',
        role: 'super_admin',
        mobile: '+27741234001',
        country_code: '+27',
        date_of_birth: '1977-08-19',
        gender: 'female',
        sec: 'A',
        user_type: 'looplly_team_user'
      },
      {
        email: 'warren@looplly.me',
        firstName: 'Warren',
        lastName: 'Le Roux',
        role: 'admin',
        mobile: '+27741234002',
        country_code: '+27',
        date_of_birth: '1979-10-14',
        gender: 'male',
        sec: 'A',
        address: '50 Risi Road, Fish Hoek, Cape Town, 7975',
        user_type: 'looplly_team_user'
      }
    ];

    for (const account of originalAccounts) {
      // Create user in auth.users
      const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: account.email,
        email_confirm: true,
        user_metadata: {
          first_name: account.firstName,
          last_name: account.lastName,
          mobile: account.mobile,
          country_code: account.country_code,
        },
      });

      if (createError) {
        errors.push({ email: account.email, action: 'create', error: createError.message });
        continue;
      }

      // Update profile with full data
      const { error: updateProfileError } = await supabaseAdmin
        .from('profiles')
        .update({
          user_type: account.user_type,
          date_of_birth: account.date_of_birth,
          gender: account.gender,
          sec: account.sec,
          address: account.address || null,
          profile_complete: true,
          profile_level: 2,
          profile_completeness_score: 100
        })
        .eq('user_id', authUser.user.id);

      if (updateProfileError) {
        errors.push({ email: account.email, action: 'update_profile', error: updateProfileError.message });
        continue;
      }

      // Add to team_members table (secure)
      const { error: teamMemberError } = await supabaseAdmin
        .from('team_members')
        .insert({
          user_id: authUser.user.id,
          department: 'Looplly Core Team',
          is_active: true
        });

      if (teamMemberError) {
        errors.push({ email: account.email, action: 'add_team_member', error: teamMemberError.message });
      }

      // Add role to user_roles table
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: authUser.user.id,
          role: account.role
        });

      if (roleError) {
        errors.push({ email: account.email, action: 'assign_role', error: roleError.message });
      } else {
        results.push({
          email: account.email,
          action: 'restored',
          user_id: authUser.user.id,
          role: account.role
        });
      }
    }

    // Log the operation
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'undo_team_dual_accounts',
        metadata: { results, errors, timestamp: new Date().toISOString() },
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Original team accounts restored successfully',
        results,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Undo team dual accounts error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
