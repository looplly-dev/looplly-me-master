import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function generateTempPassword(): string {
  const length = 16;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }
  return password;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
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
    )

    const { email } = await req.json()
    
    if (!email) {
      throw new Error('Email is required')
    }

    console.log('Resetting password for:', email)

    // Verify user exists in team_profiles
    const { data: teamProfile, error: profileError } = await supabaseAdmin
      .from('team_profiles')
      .select('user_id, email')
      .eq('email', email)
      .single()

    if (profileError || !teamProfile) {
      throw new Error('Team member not found')
    }

    // Generate temporary password
    const tempPassword = generateTempPassword()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Expires in 7 days

    console.log('Generated temporary password for:', email)

    // Update password in auth.users
    const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(
      teamProfile.user_id,
      { password: tempPassword }
    )

    if (updateAuthError) {
      console.error('Error updating auth password:', updateAuthError)
      throw updateAuthError
    }

    // Update team_profiles
    const { error: updateTeamProfileError } = await supabaseAdmin
      .from('team_profiles')
      .update({
        must_change_password: true,
        temp_password_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', teamProfile.user_id)

    if (updateTeamProfileError) {
      console.error('Error updating team profile:', updateTeamProfileError)
      throw updateTeamProfileError
    }

    // CRITICAL: Also update profiles table (main table used by auth system)
    const { error: updateProfileError } = await supabaseAdmin
      .from('profiles')
      .update({
        must_change_password: true,
        temp_password_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', teamProfile.user_id)

    if (updateProfileError) {
      console.error('Error updating main profile:', updateProfileError)
      throw updateProfileError
    }

    // Log the action
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        action: 'team_member_password_reset',
        metadata: {
          target_email: email,
          target_user_id: teamProfile.user_id,
          reset_method: 'manual_admin_reset'
        }
      })

    console.log('Password reset successful for:', email)

    return new Response(
      JSON.stringify({
        success: true,
        temporary_password: tempPassword,
        expires_at: expiresAt.toISOString(),
        message: 'Password reset successfully. User must change password on first login.',
        email: email
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
