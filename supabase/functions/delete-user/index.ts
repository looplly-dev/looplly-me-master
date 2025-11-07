import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Create admin client for operations
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

    // Create regular client to verify caller's JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            authorization: authHeader
          }
        }
      }
    )

    // Verify the caller is authenticated
    const { data: { user: caller }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !caller) {
      console.error('Auth error:', authError)
      throw new Error('Unauthorized: Invalid or expired token')
    }

    console.log('Caller verified:', caller.id)

    // Verify the caller has super_admin role
    const { data: roles, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .eq('role', 'super_admin')
      .single()

    if (roleError || !roles) {
      console.error('Role check failed:', roleError)
      throw new Error('Forbidden: Only super_admin can delete users')
    }

    console.log('Super admin verified:', caller.id)

    // Get request body
    const { email, userId } = await req.json()
    
    if (!userId) {
      throw new Error('Missing userId parameter')
    }

    console.log('Deleting user:', { email, userId })

    // Prevent self-deletion
    if (userId === caller.id) {
      throw new Error('Cannot delete your own account')
    }

    // Delete the user from auth.users (this will cascade to related tables)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      userId
    )

    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      throw new Error(`Failed to delete user: ${deleteError.message}`)
    }

    console.log('User deleted successfully:', userId)

    // Log the deletion for audit trail
    await supabaseAdmin.from('audit_logs').insert({
      user_id: caller.id,
      action: 'user.delete',
      resource_type: 'user',
      resource_id: userId,
      metadata: { 
        deleted_user_email: email,
        deleted_user_id: userId,
        deleted_by: caller.email
      }
    })

    return new Response(
      JSON.stringify({ success: true, message: 'User deleted successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Function error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    const statusCode = errorMessage.includes('Unauthorized') ? 401 : errorMessage.includes('Forbidden') ? 403 : 400
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: statusCode,
      },
    )
  }
})
