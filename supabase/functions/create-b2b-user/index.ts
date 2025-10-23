import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateB2BUserRequest {
  email: string;
  company_name: string;
  role: 'office_user' | 'tester' | 'admin';
  company_role?: string;
}

// Generate secure temporary password
function generateTempPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => chars[byte % chars.length]).join('');
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
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

    // Verify caller is super admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !caller) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if caller is super admin
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .single();

    if (roleData?.role !== 'super_admin') {
      return new Response(
        JSON.stringify({ error: 'Only super admins can create B2B users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: CreateB2BUserRequest = await req.json();
    const { email, company_name, role = 'office_user', company_role } = body;

    // Validate input
    if (!email || !company_name) {
      return new Response(
        JSON.stringify({ error: 'Email and company name are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'A user with this email already exists' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate temporary password
    const tempPassword = generateTempPassword();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // Create auth user
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        company_name,
        company_role,
        invited_by: caller.id
      }
    });

    if (createUserError || !newUser.user) {
      console.error('Error creating user:', createUserError);
      return new Response(
        JSON.stringify({ error: 'Failed to create user', details: createUserError?.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update profile with B2B specific fields
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        user_type: 'office_user',
        company_name,
        company_role,
        must_change_password: true,
        invited_by: caller.id,
        invitation_sent_at: new Date().toISOString(),
        temp_password_expires_at: expiresAt.toISOString()
      })
      .eq('user_id', newUser.user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      // Rollback: delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      return new Response(
        JSON.stringify({ error: 'Failed to update profile', details: profileError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Assign role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: role
      });

    if (roleError) {
      console.error('Error assigning role:', roleError);
    }

    // Log audit event
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id: caller.id,
        action: 'b2b_user_invited',
        resource_type: 'user',
        resource_id: newUser.user.id,
        metadata: {
          email,
          company_name,
          role,
          invited_by_email: caller.email
        }
      });

    // Return credentials for manual sharing
    return new Response(
      JSON.stringify({
        success: true,
        email,
        tempPassword,
        expiresAt: expiresAt.toISOString(),
        userId: newUser.user.id
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
