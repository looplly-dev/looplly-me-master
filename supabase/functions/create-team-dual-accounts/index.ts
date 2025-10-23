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

    // Step 1: Get existing user IDs for nadia@looplly.me and warren@looplly.me
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    
    const nadiaUser = existingUsers?.users.find(u => u.email === 'nadia@looplly.me');
    const warrenUser = existingUsers?.users.find(u => u.email === 'warren@looplly.me');

    // Step 2: Update existing accounts' emails
    if (nadiaUser) {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        nadiaUser.id,
        { email: 'nadia.gaspari1@outlook.com' }
      );

      if (updateError) {
        errors.push({ user: 'nadia@looplly.me', action: 'email_update', error: updateError.message });
      } else {
        // Update profile email and reset to regular user
        await supabaseAdmin
          .from('profiles')
          .update({ 
            email: 'nadia.gaspari1@outlook.com',
            user_type: 'looplly_user'
          })
          .eq('user_id', nadiaUser.id);
        
        results.push({ user: 'nadia@looplly.me', action: 'email_updated_to', new_email: 'nadia.gaspari1@outlook.com' });
      }
    }

    if (warrenUser) {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        warrenUser.id,
        { email: 'warrenleroux@gmail.com' }
      );

      if (updateError) {
        errors.push({ user: 'warren@looplly.me', action: 'email_update', error: updateError.message });
      } else {
        // Update profile email and reset to regular user
        await supabaseAdmin
          .from('profiles')
          .update({ 
            email: 'warrenleroux@gmail.com',
            user_type: 'looplly_user'
          })
          .eq('user_id', warrenUser.id);
        
        results.push({ user: 'warren@looplly.me', action: 'email_updated_to', new_email: 'warrenleroux@gmail.com' });
      }
    }

    // Step 3: Create new team accounts
    const teamAccounts = [
      { 
        email: 'nadia@looplly.me', 
        firstName: 'Nadia', 
        lastName: 'Gaspari',
        role: 'super_admin',
        mobile: '+27741234001',
        country_code: '+27'
      },
      { 
        email: 'warren@looplly.me', 
        firstName: 'Warren', 
        lastName: 'Le Roux',
        role: 'admin',
        mobile: '+27741234002',
        country_code: '+27'
      },
    ];

    for (const account of teamAccounts) {
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
        errors.push({ user: account.email, action: 'create_team_account', error: createError.message });
        continue;
      }

      // Update profile to set user_type to looplly_team_user
      const { error: updateProfileError } = await supabaseAdmin
        .from('profiles')
        .update({ user_type: 'looplly_team_user' })
        .eq('user_id', authUser.user.id);

      if (updateProfileError) {
        errors.push({ user: account.email, action: 'update_user_type', error: updateProfileError.message });
        continue;
      }

      // Add role to user_roles table
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: authUser.user.id,
          role: account.role
        });

      if (roleError) {
        errors.push({ user: account.email, action: 'assign_role', error: roleError.message });
      } else {
        results.push({ 
          user: account.email, 
          action: 'team_account_created', 
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
        action: 'create_team_dual_accounts',
        metadata: { results, errors, timestamp: new Date().toISOString() },
      });

    return new Response(
      JSON.stringify({
        success: true,
        results,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Create team dual accounts error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
