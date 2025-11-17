import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, otp } = await req.json();
    
    console.log('[MOCK VERIFY OTP] Verifying OTP for user:', user_id, 'OTP:', otp);
    
    // DEV STUB: Accept hardcoded OTP
    if (otp !== '12345') {
      return new Response(
        JSON.stringify({ error: 'Invalid OTP code' }), 
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // TODO Phase 2: Call real Notify API to verify OTP
    console.log('[NOTIFY STUB] Would verify OTP for user', user_id);
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Mark user as verified
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: true })
      .eq('user_id', user_id);
    
    if (error) {
      console.error('[MOCK VERIFY OTP] Database error:', error);
      return new Response(
        JSON.stringify({ error: error.message }), 
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log('[MOCK VERIFY OTP] User verified successfully:', user_id);
    
    return new Response(
      JSON.stringify({
        success: true,
        verified: true,
        message: 'Mobile number verified successfully'
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('[MOCK VERIFY OTP] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
