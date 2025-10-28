import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { jwtVerify } from "https://deno.land/x/jose@v4.14.4/index.ts";

const getCorsHeaders = (origin?: string) => ({
  "Access-Control-Allow-Origin": origin || "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-simulator-session",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
});

serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin || undefined);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { custom_token } = await req.json();
    if (!custom_token) {
      return new Response(JSON.stringify({ error: "Missing custom_token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const secret = Deno.env.get("LOOPLLY_JWT_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!secret || !SUPABASE_URL || !SERVICE_ROLE_KEY) {
      console.error("Missing required env vars for simulator-get-profile");
      return new Response(JSON.stringify({ error: "Server misconfiguration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify token signature and expiration
    let payload: any;
    try {
      const encoder = new TextEncoder();
      const { payload: verified } = await jwtVerify(custom_token, encoder.encode(secret));
      payload = verified;
    } catch (err) {
      console.error("JWT verification failed:", err);
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = payload.user_id || payload.sub || payload.uid;
    if (!userId) {
      return new Response(JSON.stringify({ error: "Token missing user id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

    // Fetch minimal profile snapshot, ensuring it's a test account
    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        "user_id, first_name, last_name, email, mobile, is_verified, profile_complete, profile_level, country_code, gender, sec, address, gps_enabled, date_of_birth, is_test_account"
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
      return new Response(JSON.stringify({ error: "Profile query failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!profile.is_test_account) {
      return new Response(JSON.stringify({ error: "Not a test account" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const snapshot = {
      user_id: profile.user_id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      mobile: profile.mobile,
      is_verified: profile.is_verified,
      profile_complete: profile.profile_complete,
      profile_level: profile.profile_level,
      country_code: profile.country_code,
      gender: profile.gender,
      sec: profile.sec,
      address: profile.address,
      gps_enabled: profile.gps_enabled,
      date_of_birth: profile.date_of_birth,
      is_test_account: profile.is_test_account,
    };

    console.log('[simulator-get-profile] Returning snapshot:', {
      user_id: snapshot.user_id,
      name: `${snapshot.first_name} ${snapshot.last_name}`,
      mobile: snapshot.mobile,
      country_code: snapshot.country_code
    });

    return new Response(JSON.stringify(snapshot), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("simulator-get-profile unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});