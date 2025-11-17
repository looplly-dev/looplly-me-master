import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mobile, countryCode, password, firstName, lastName, dateOfBirth, gpsEnabled } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Normalize mobile number (E.164 format)
    const normalizedMobile = countryCode + mobile.replace(/^0+/, '').replace(/[\s\-\(\)]/g, '');
    
    console.log('[MOCK REGISTER] Attempting registration for:', normalizedMobile);
    
    // Check if mobile already exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('user_id, is_test_account')
      .eq('mobile', normalizedMobile)
      .maybeSingle();
    
    if (existing) {
      // Allow re-registration for test accounts (simulator)
      if (existing.is_test_account) {
    console.log('[MOCK REGISTER] Re-registering test account:', normalizedMobile);
        
        // Hash the new password (using sync method for Deno Deploy compatibility)
        console.log('[MOCK REGISTER] Using sync bcrypt for hashing');
        const salt = bcrypt.genSaltSync(8);
        const passwordHash = bcrypt.hashSync(password, salt);
        
        // Update the existing test account with new registration data
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            password_hash: passwordHash,
            first_name: firstName,
            last_name: lastName,
            date_of_birth: dateOfBirth,
            gps_enabled: gpsEnabled,
            profile_level: 1,
            profile_completeness_score: 40,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', existing.user_id);
        
        if (updateError) {
          console.error('[MOCK REGISTER] Update error:', updateError);
          return new Response(
            JSON.stringify({ error: updateError.message }), 
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        
        console.log('[NOTIFY STUB] Would send registration OTP to', normalizedMobile);
        
        return new Response(
          JSON.stringify({
            success: true,
            user_id: existing.user_id,
            message: 'Registration successful. Use OTP: 12345 to verify (dev stub)'
          }), 
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      // Not a test account - reject duplicate registration
      return new Response(
        JSON.stringify({ error: 'Mobile number already registered' }), 
        {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Hash password with bcrypt (using sync method for Deno Deploy compatibility)
    console.log('[MOCK REGISTER] Using sync bcrypt for hashing');
    const salt = bcrypt.genSaltSync(8);
    const passwordHash = bcrypt.hashSync(password, salt);
    
    // Generate UUID for user_id
    const userId = crypto.randomUUID();
    
    // Insert into profiles table (NOT auth.users!)
    const { error } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        mobile: normalizedMobile,
        country_code: countryCode,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth,
        gps_enabled: gpsEnabled,
        profile_level: 1,
        profile_completeness_score: 40,
        created_at: new Date().toISOString(),
      });
    
    if (error) {
      console.error('[MOCK REGISTER] Database error:', error);
      return new Response(
        JSON.stringify({ error: error.message }), 
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // TODO Phase 2: Send real Notify OTP here
    console.log('[NOTIFY STUB] Would send registration OTP to', normalizedMobile);
    
    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        message: 'Registration successful. Use OTP: 12345 to verify (dev stub)'
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('[MOCK REGISTER] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
