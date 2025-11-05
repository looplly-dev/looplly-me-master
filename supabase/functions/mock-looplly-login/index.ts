import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';
import { create } from 'https://deno.land/x/djwt@v2.8/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mobile, countryCode, password } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Normalize mobile
    const normalizedMobile = countryCode + mobile.replace(/^0+/, '').replace(/[\s\-\(\)]/g, '');
    
    console.log('[MOCK LOGIN] Attempting login for:', normalizedMobile);
    
    // Fetch user by mobile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('user_id, mobile, password_hash, first_name, last_name, is_verified, profile_complete, email, country_code')
      .eq('mobile', normalizedMobile)
      .maybeSingle();
    
    if (!profile || error) {
      return new Response(
        JSON.stringify({ error: 'Invalid mobile number or password' }), 
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (!profile.password_hash) {
      return new Response(
        JSON.stringify({ error: 'Account not configured for password login' }), 
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Verify password (using sync method for Deno Deploy compatibility)
    console.log('[MOCK LOGIN] Using sync bcrypt for comparison');
    const passwordValid = bcrypt.compareSync(password, profile.password_hash);
    
    if (!passwordValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid mobile number or password' }), 
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Check if Supabase Auth user exists in mapping
    const { data: mapping } = await supabase
      .from('looplly_user_auth_mapping')
      .select('supabase_auth_id')
      .eq('looplly_user_id', profile.user_id)
      .maybeSingle();
    
    let supabaseAuthId = mapping?.supabase_auth_id;
    
    // Create Supabase Auth user if not exists
    if (!supabaseAuthId) {
      console.log('[MOCK LOGIN] Creating Supabase Auth user for:', normalizedMobile);
      
      // First, check if auth user exists by trying to get it
      const syntheticEmail = `${profile.user_id}@looplly.mobile`;
      
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: syntheticEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
          mobile: profile.mobile,
          country_code: profile.country_code,
          first_name: profile.first_name,
          last_name: profile.last_name,
          looplly_user_id: profile.user_id,
          user_type: 'looplly_user'
        }
      });
      
      if (authError) {
        console.error('[MOCK LOGIN] Failed to create Supabase Auth user:', authError);
        // Try to find existing auth user by email
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === syntheticEmail);
        if (existingUser) {
          console.log('[MOCK LOGIN] Found existing Supabase Auth user, updating password and metadata');
          supabaseAuthId = existingUser.id;
          // Ensure password matches and metadata is up to date
          const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
            password,
            email_confirm: true,
            user_metadata: {
              mobile: profile.mobile,
              country_code: profile.country_code,
              first_name: profile.first_name,
              last_name: profile.last_name,
              looplly_user_id: profile.user_id,
              user_type: 'looplly_user'
            }
          });
          if (updateError) {
            console.error('[MOCK LOGIN] Failed to update existing auth user:', updateError);
          }
        }
      } else if (authUser.user) {
        supabaseAuthId = authUser.user.id;
        console.log('[MOCK LOGIN] Created new Supabase Auth user');
      }
      
      // Store mapping if we have supabaseAuthId
      if (supabaseAuthId) {
        await supabase
          .from('looplly_user_auth_mapping')
          .upsert({
            looplly_user_id: profile.user_id,
            supabase_auth_id: supabaseAuthId,
            mobile: normalizedMobile,
            country_code: profile.country_code
          }, {
            onConflict: 'looplly_user_id'
          });
      }
    }
    
    // Generate custom JWT token
    const JWT_SECRET = Deno.env.get('LOOPLLY_JWT_SECRET') || 'dev-secret-change-in-production';
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const payload = {
      sub: profile.user_id,
      mobile: profile.mobile,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
      user_type: 'looplly_user',
      supabase_auth_id: supabaseAuthId
    };
    
    const token = await create({ alg: 'HS256', typ: 'JWT' }, payload, key);
    
    console.log('[MOCK LOGIN] Login successful for:', normalizedMobile);
    
    return new Response(
      JSON.stringify({
        success: true,
        token,
        supabase_auth_id: supabaseAuthId,
        user: {
          id: profile.user_id,
          mobile: profile.mobile,
          firstName: profile.first_name,
          lastName: profile.last_name,
          email: profile.email,
          countryCode: profile.country_code,
          isVerified: profile.is_verified,
          profileComplete: profile.profile_complete
        }
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('[MOCK LOGIN] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
