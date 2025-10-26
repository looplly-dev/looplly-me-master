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
      user_type: 'looplly_user'
    };
    
    const token = await create({ alg: 'HS256', typ: 'JWT' }, payload, key);
    
    console.log('[MOCK LOGIN] Login successful for:', normalizedMobile);
    
    return new Response(
      JSON.stringify({
        success: true,
        token,
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
